import { test, expect } from '@playwright/test';
import { stubSpeech, guard } from './helpers.js';

/* Word Quest (dolch/): 45-day Dolch sight word course. Checks the word list, the 45-day plan, one full
   day played through the real screens, and that the app works offline. */

const state = page => page.evaluate(() => JSON.parse(localStorage.getItem('dolch.v1')));

/* one tap/answer for whatever task is on screen, decided from the app's own queue */
const autopilot = page => page.evaluate(() => {
  const cur = __dolch.cur(); if(!cur) return 'none';
  const [type, w] = cur, st = document.querySelector('#stage');
  if(st.dataset.i !== String(__dolch.idx())) return 'wait';      // the next screen is still on its way
  const btn = re => [...st.querySelectorAll('button')].find(b => re.test(b.textContent));
  const draw = guide => {
    const [gc, ic] = st.querySelectorAll('.pad canvas'), W = 900, H = 340, r = ic.getBoundingClientRect();
    const mk = (t, x, y) => ic.dispatchEvent(new PointerEvent(t, {clientX:r.left + x*r.width/W, clientY:r.top + y*r.height/H, pointerId:1, bubbles:true}));
    const A = gc.getContext('2d').getImageData(0, 0, W, H).data;
    for(let y = 0; y < H; y += 9){ let down = false;
      for(let x = 0; x < W; x += 9){
        const k = (y*W + x)*4, on = A[k+3] > 200 && A[k] === 217 && A[k+2] === 250;
        if(on){ mk(down ? 'pointermove' : 'pointerdown', x, y); down = true; } else if(down){ mk('pointerup', 0, 0); down = false; } }
      if(down) mk('pointerup', 0, 0); }
    if(!guide){ mk('pointerdown', 100, 100); for(let i = 0; i < 60; i++) mk('pointermove', 100 + i*10, 100 + (i%2)*60); mk('pointerup', 0, 0); }
  };
  if(type === 'meet'){
    if(st.querySelector('.pad')){ draw(true); btn(/^Done/).click(); return 'trace'; }
    (btn(/Next/) || btn(/I said it/)).click(); return 'meet';
  }
  if(type === 'read'){ [...st.querySelectorAll('.opt')].find(o => o.textContent === w).click(); return 'read'; }
  if(type === 'sent'){ [...st.querySelectorAll('.chip')].find(c => c.textContent.replace(/[.,?!]/g, '').toLowerCase() === w.toLowerCase()).click(); return 'sent'; }
  if(type === 'say'){ (btn(/I said it/) || btn(/^Done/)).click(); return 'say'; }
  if(type === 'spell'){ w.split('').forEach(ch => { const t = [...st.querySelectorAll('.tile')].find(t => t.textContent === ch && !t.classList.contains('used')); if(t) t.click(); }); return 'spell'; }
  if(type === 'write'){
    if(btn(/Hide it/)) btn(/Hide it/).click();
    else if(st.querySelector('.pad')){ draw(false); btn(/^Done/).click(); }
    else btn(/Yes/).click();
    return 'write';
  }
});

test.beforeEach(async ({ page }) => { await stubSpeech(page); });

test('word list is the 220 Dolch words and the plan introduces all of them by day 37', async ({ page }) => {
  const g = guard(page);
  await page.goto('dolch/');
  await expect(page.locator('#stage')).toContainText('Day 1 of 45');
  const r = await page.evaluate(() => {
    const D = __dolch, S = D.S(); S.words = {}; const per = [];
    for(let d = 1; d <= 45; d++){ const n = D.simDay(d, 0.9); per.push(n); }
    return {words: D.WORDS.length, uniq: new Set(D.WORDS.map(x => x.w)).size, met: Object.keys(S.words).length,
      first: D.WORDS.slice(0, 6).map(x => x.w), max: Math.max(...per), min: Math.min(...per)};
  });
  expect(r.words).toBe(220); expect(r.uniq).toBe(220); expect(r.met).toBe(220);
  expect(r.first).toEqual(['the', 'to', 'and', 'a', 'I', 'you']);
  expect(r.max).toBeLessThanOrEqual(60);
  g.check();
});

test('a full first day plays through: 6 new words, 18 gems, day marked done', async ({ page }) => {
  test.slow();
  const g = guard(page);
  await page.goto('dolch/');
  await page.getByRole('button', { name: /Play Day 1/ }).click();
  for(let i = 0; i < 600; i++){
    if(await page.locator('text=Day 1 complete!').count()) break;
    await autopilot(page);
    await page.waitForTimeout(90);
  }
  await expect(page.locator('#stage')).toContainText('Day 1 complete!');
  await expect(page.locator('#stage')).toContainText('6');
  const s = await state(page);
  expect(Object.keys(s.words)).toHaveLength(6);
  expect(s.done[1]).toBe(true); expect(s.streak).toBe(1);
  expect(s.gems).toBeGreaterThanOrEqual(18);
  await page.getByRole('button', { name: /Home/ }).click();
  await expect(page.locator('#stage')).toContainText('You finished today');
  g.check();
});

test('works offline', async ({ page, context }) => {
  await page.goto('dolch/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(async () => (await (await caches.open('dolch-v1')).keys()).length)).toBeGreaterThanOrEqual(9);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#stage')).toContainText('Day 1 of 45');
  await page.getByRole('button', { name: /My Words/ }).click();
  await expect(page.locator('.gem').first()).toBeVisible();
});
