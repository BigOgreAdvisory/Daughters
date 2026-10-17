// Shared test helpers: stubbed speech, error/network guards, and "play the game" drivers.
import { expect } from '@playwright/test';

export const ALE_GAMES = { spell:5, family:5, sight:5, readpick:4, letters:4, sounds:5 };
export const ANA_GAMES = ['lake','sound','sort','word'];

/* speechSynthesis stub + fast clock for Ale (Ana ignores __aleTimeScale) */
export async function stubSpeech(page, scale = 0.05){
  await page.addInitScript(s => {
    window.__aleTimeScale = s;
    window.__spoken = [];
    const synth = {
      speaking:false, pending:false, paused:false, onvoiceschanged:null,
      speak(u){ window.__spoken.push(u.text); setTimeout(() => { if(u.onend) u.onend(); }, 2); },
      cancel(){}, pause(){}, resume(){},
      getVoices(){ return [{name:'Test US English', lang:'en-US', default:true}]; },
      addEventListener(){}, removeEventListener(){}
    };
    Object.defineProperty(window, 'speechSynthesis', {value:synth, configurable:true});
    window.SpeechSynthesisUtterance = function(t){ this.text = t; };
  }, scale);
}

/* collects console errors, page errors and any request that leaves localhost */
export function guard(page){
  const g = { errors:[], external:[] };
  page.on('console', m => { if(m.type() === 'error') g.errors.push(m.text()); });
  page.on('pageerror', e => g.errors.push(String(e)));
  page.on('request', r => {
    const u = new URL(r.url());
    if(!['data:','blob:'].includes(u.protocol) && u.hostname !== 'localhost') g.external.push(r.url());
  });
  g.check = () => { expect(g.errors, 'console errors').toEqual([]); expect(g.external, 'external requests').toEqual([]); };
  return g;
}

/* seed Ale's storage before the app boots */
export async function seedAle(page, patch){
  await page.addInitScript(p => {
    if(sessionStorage.getItem('__seeded')) return;      // only on the first load of this tab
    sessionStorage.setItem('__seeded', '1');
    const games = {};
    ['spell','family','sight','readpick','letters','sounds'].forEach(k => games[k] = {level:1,streak:0,misses:0,sessions:0,correct:0,attempts:0,items:{}});
    const s = {v:1, settings:{sound:true, rounds:10, theme:'fairy'}, games, stickers:{}, scenes:{}, last:0};
    if(p.settings) Object.assign(s.settings, p.settings);
    if(p.games) Object.entries(p.games).forEach(([k,v]) => Object.assign(s.games[k], v));
    localStorage.setItem('playlearn.ale.v1', JSON.stringify(s));
  }, patch);
}
export const aleState = page => page.evaluate(() => JSON.parse(localStorage.getItem('playlearn.ale.v1')));

export async function openAleGame(page, key){
  if(key === 'letters' || key === 'sounds'){
    await page.locator('.tile[data-g="warm"]').click();
    await page.locator(`.warmlist .tile[data-g="${key}"]`).click();
  }else{
    await page.locator(`.tile[data-g="${key}"]`).click();
  }
  await expect(page.locator('#stage')).toHaveAttribute('data-round', /\d+/);
}

/* tap an element directly: pointer events for drag-or-tap tiles, click for everything else */
async function tap(loc){
  await loc.first().evaluate(el => {
    if(el.classList.contains('ltile')){
      el.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true, pointerId:1, clientX:0, clientY:0}));
      el.dispatchEvent(new PointerEvent('pointerup', {bubbles:true, pointerId:1, clientX:0, clientY:0}));
    }else el.click();
  }).catch(() => {});
}
const round = page => page.evaluate(() => { const s = document.querySelector('#stage'); return s ? s.dataset.round : null; });
const finished = page => page.locator('.screen.finish').count().then(n => n > 0);

/* answer one Ale round. wrong=true taps two wrong answers first (hint, then reveal) */
export async function answerAleRound(page, wrong){
  const rid = await round(page);
  const still = async () => !(await finished(page)) && (await round(page)) === rid;
  const isSpell = await page.locator('.screen.spell').count();
  let wrongLeft = wrong ? 2 : 0;
  for(let i = 0; i < 120 && await still(); i++){
    if(wrongLeft){
      const sel = isSpell ? '#stage .ltile[data-ok="0"]:not(.used):not(.dim)' : '#stage [data-ok="0"]:not(.dim)';
      const w = page.locator(sel);
      if(await w.count()){ await tap(w); wrongLeft--; await page.waitForTimeout(80); continue; }
      wrongLeft = 0;
    }
    const sel = isSpell ? '#stage .ltile[data-ok="1"]:not(.used)' : '#stage [data-ok="1"]:not(.found):not(.dim)';
    const ok = page.locator(sel);
    if(await ok.count()) await tap(ok);
    await page.waitForTimeout(80);
  }
  expect(await still(), `round ${rid} did not end`).toBe(false);
}

/* play until the finish screen; wrongAt(i) decides which rounds take the wrong-answer path */
export async function playAleSession(page, wrongAt = () => false){
  let last = null, n = 0;
  for(let guard = 0; guard < 600; guard++){
    if(await finished(page)) return n;
    const r = await round(page);
    if(!r || r === last){ await page.waitForTimeout(40); continue; }
    last = r;
    await answerAleRound(page, wrongAt(n)); n++;
  }
  throw new Error('session did not finish');
}

/* finish screen -> gift -> place item in scene -> home */
export async function collectReward(page){
  await page.locator('#gifts:not([hidden]) .gift').first().click({timeout:10000, force:true});
  await page.locator('#next').click({force:true});
  await expect(page.locator('#sb.placing')).toBeVisible();
  const box = await page.locator('#sb').boundingBox();
  await page.mouse.click(box.x + box.width*0.4, box.y + box.height*0.6);
  await page.locator('#gohome').click({timeout:10000});
  await expect(page.locator('.screen.home')).toBeVisible();
}

/* Ana: answer whatever is on screen until the finish screen */
export async function playAnaSession(page, wrongFirst){
  let wrongLeft = wrongFirst ? 1 : 0;
  for(let i = 0; i < 400; i++){
    if(await page.locator('.screen.finish').count()) return;
    if(wrongLeft){
      const w = page.locator('#stage [data-ok="0"]:not(.dim)');
      if(await w.count()){ await w.first().click({force:true, timeout:1500}).catch(() => {}); wrongLeft--; await page.waitForTimeout(400); continue; }
    }
    const ok = page.locator('#stage [data-ok="1"]:not(.found):not(.glow)');
    if(await ok.count()) await ok.first().click({force:true, timeout:1500}).catch(() => {});
    await page.waitForTimeout(250);
  }
  throw new Error('Ana session did not finish');
}

/* layout: every visible button >= 96px, inside the viewport, no overlaps, no horizontal overflow */
export async function checkLayout(page, label){
  const res = await page.evaluate(() => {
    const W = innerWidth, H = innerHeight, out = [];
    if(document.documentElement.scrollWidth > W + 1) out.push(`page scrolls sideways (${document.documentElement.scrollWidth} > ${W})`);
    document.querySelectorAll('.screen, #stage, .tiles, .slots, .ltiles, .pots, .sentence, .sw-grid, .sw-row, .rp-grid, .choices, .pgrid').forEach(el => {
      if(el.scrollWidth > el.clientWidth + 1) out.push(`${el.className || el.id} overflows sideways`);
    });
    const scroller = document.querySelector('.screen.parent');
    const btns = [...document.querySelectorAll('button')].filter(b => {
      const r = b.getBoundingClientRect(), cs = getComputedStyle(b);
      return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && !b.closest('[hidden]');
    });
    const rects = btns.map(b => ({b, r:b.getBoundingClientRect()}));
    rects.forEach(({b, r}) => {
      const name = (b.id || b.className || 'button') + ' "' + (b.textContent || '').trim().slice(0,12) + '"';
      if(r.width < 95.5 || r.height < 95.5) out.push(`${name} is ${Math.round(r.width)}x${Math.round(r.height)}`);
      if(r.left < -1 || r.right > W + 1) out.push(`${name} outside viewport horizontally`);
      if(!scroller && (r.top < -1 || r.bottom > H + 1)) out.push(`${name} outside viewport vertically (${Math.round(r.top)}..${Math.round(r.bottom)} of ${H})`);
    });
    for(let i = 0; i < rects.length; i++) for(let j = i + 1; j < rects.length; j++){
      const a = rects[i].r, c = rects[j].r;
      if(rects[i].b.contains(rects[j].b) || rects[j].b.contains(rects[i].b)) continue;
      const ox = Math.min(a.right, c.right) - Math.max(a.left, c.left), oy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
      if(ox > 2 && oy > 2) out.push(`buttons overlap: ${rects[i].b.className} / ${rects[j].b.className}`);
    }
    return out;
  });
  expect(res, label).toEqual([]);
}
export const NO_ANIM = '*,*::before,*::after{animation:none!important;transition:none!important}';
