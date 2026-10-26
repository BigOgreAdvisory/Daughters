import { test, expect } from '@playwright/test';
import { ALE_GAMES, ANA_GAMES, stubSpeech, guard, seedAle, openAleGame, playAnaSession, checkLayout, NO_ANIM } from './helpers.js';

/* ---------------- root chooser ---------------- */
test('root chooser links to all four apps and registers no service worker', async ({ page, request }) => {
  const g = guard(page);
  await page.goto('./');
  await expect(page.locator('a.kid')).toHaveCount(4);
  expect(await page.locator('a.ale').getAttribute('href')).toBe('./ale/');
  expect(await page.locator('a.ana').getAttribute('href')).toBe('./ana/');
  expect(await page.locator('a.space').getAttribute('href')).toBe('./spacewords/');
  expect(await page.locator('a.quest').getAttribute('href')).toBe('./dolch/');
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => navigator.serviceWorker.getRegistrations().then(r => r.length))).toBe(0);
  for(const app of ['ale','ana','spacewords','dolch']){
    const m = await (await request.get(`${app}/manifest.webmanifest`)).json();
    expect(m.start_url).toBe(app === 'spacewords' ? './index.html' : './'); expect(m.scope).toBe('./');
    expect(m.name).toBe({ale:"Ale's Games", ana:"Ana's Games", spacewords:'Space Words', dolch:'Word Quest'}[app]);
    for(const ic of m.icons) expect((await request.get(`${app}/${ic.src}`)).status()).toBe(200);
  }
  g.check();
});

test('no absolute paths anywhere (site lives under /Daughters/)', async ({ request }) => {
  for(const f of ['index.html','ale/index.html','ana/index.html','ale/sw.js','ana/sw.js','ale/js/engine.js','ale/manifest.webmanifest','ana/manifest.webmanifest',
    'spacewords/index.html','spacewords/words.html','spacewords/sw.js','spacewords/pwa.js','spacewords/speech.js','spacewords/manifest.webmanifest']){
    const txt = await (await request.get(f)).text();
    expect(txt, f).not.toMatch(/(href|src)="\/(?!\/)/);
    expect(txt, f).not.toMatch(/register\(['"]\//);
  }
});

test('old root service worker is cleaned up without touching app caches', async ({ page }) => {
  await stubSpeech(page);
  await page.goto('ale/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.goto('./');
  await page.evaluate(async () => { const c = await caches.open('pl-v1'); await c.put('x', new Response('old')); });
  await page.evaluate(() => navigator.serviceWorker.register('sw.js'));
  await expect.poll(() => page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).map(r => new URL(r.scope).pathname).sort().join(','))).toBe('/Daughters/ale/');
  const keys = await page.evaluate(() => caches.keys());
  expect(keys).toContain('ale-v1');
  expect(keys).not.toContain('pl-v1');
});

/* ---------------- offline ---------------- */
for(const app of ['ale','ana']){
  test(`${app} works offline after the service worker installs`, async ({ page, context }) => {
    const g = guard(page);
    await stubSpeech(page);
    await page.goto(`${app}/`);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator(app === 'ale' ? '.tile[data-g="spell"]' : '.card-game[data-g="lake"]')).toBeVisible();
    if(app === 'ale'){
      await openAleGame(page, 'readpick');
      await page.goto('ale/?theme=ocean');
      await expect(page.locator('.tile[data-g="family"]')).toContainText('Reef');
    }
    await context.setOffline(false);
    g.check();
  });
}

/* ---------------- Ana regression ---------------- */
test('Ana: old saved data is copied to the new key (old key kept)', async ({ page }) => {
  const g = guard(page);
  await stubSpeech(page);
  await page.goto('./');
  await page.evaluate(() => localStorage.setItem('playlearn.v1', JSON.stringify({v:1, settings:{sound:true, rounds:6},
    games:{lake:{level:3,streak:0,misses:0,sessions:7,correct:40,attempts:50,items:{}}}, stickers:[1,2,2], last:1})));
  await page.goto('ana/');
  await expect(page.locator('#book')).toContainText('2/24');
  const both = await page.evaluate(() => [localStorage.getItem('playlearn.v1'), JSON.parse(localStorage.getItem('playlearn.ana.v1'))]);
  expect(both[0]).not.toBeNull();
  expect(both[1].games.lake.level).toBe(3);
  expect(both[1].games.lake.sessions).toBe(7);
  g.check();
  // later loads must not copy the old key again over Ana's newer data
  await page.goto('./');                                   // Ana saves on pagehide, as before
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('playlearn.v1')); s.games.lake.level = 1; localStorage.setItem('playlearn.v1', JSON.stringify(s)); });
  await page.goto('ana/');
  await expect(page.locator('#book')).toContainText('2/24');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('playlearn.ana.v1')).games.lake.level)).toBe(3);
});

test('Ana: full playthrough of all four games', async ({ page }) => {
  test.setTimeout(300_000);
  const g = guard(page);
  await stubSpeech(page);
  await page.goto('./');                                   // seed before Ana ever loads (she saves on pagehide)
  await page.evaluate(() => { localStorage.setItem('playlearn.ana.v1', JSON.stringify({v:1, settings:{sound:true, rounds:6}, games:{}, stickers:[], last:0})); });
  await page.goto('ana/');
  for(const k of ANA_GAMES){
    await page.locator(`.card-game[data-g="${k}"]`).click();
    await playAnaSession(page, true);
    await page.locator('#gifts:not([hidden]) .gift').first().click({timeout:10000, force:true});
    await page.locator('#gohome').click();
    await expect(page.locator('.screen.home')).toBeVisible();
  }
  const s = await page.evaluate(() => JSON.parse(localStorage.getItem('playlearn.ana.v1')));
  ANA_GAMES.forEach(k => { expect(s.games[k].sessions).toBe(1); expect(s.games[k].attempts).toBe(6); });
  expect(s.stickers.length).toBe(4);
  expect(await page.evaluate(() => localStorage.getItem('playlearn.ale.v1'))).toBeNull();   // separate storage
  g.check();
});

/* ---------------- layout ---------------- */
const SIZES = [[320,568],[360,740],[412,915],[768,1024]];
for(const [w, h] of SIZES){
  for(const theme of ['fairy','ocean']){
    test(`layout ${w}x${h} · ${theme}`, async ({ page }) => {
      test.setTimeout(240_000);
      const g = guard(page);
      await page.setViewportSize({width:w, height:h});
      await stubSpeech(page);
      await seedAle(page, {settings:{theme, rounds:6}});
      await page.goto('ale/');
      await page.addStyleTag({content: NO_ANIM});
      await checkLayout(page, 'home');
      await page.locator('.tile[data-g="warm"]').click();
      await checkLayout(page, 'warm-ups menu');
      await page.locator('#home').click();
      for(const [game, max] of Object.entries(ALE_GAMES)){
        for(let level = 1; level <= max; level++){
          await page.evaluate(([k, l]) => { const s = JSON.parse(localStorage.getItem('playlearn.ale.v1')); s.games[k].level = l; localStorage.setItem('playlearn.ale.v1', JSON.stringify(s)); }, [game, level]);
          await page.reload(); await page.addStyleTag({content: NO_ANIM});
          await openAleGame(page, game);
          await page.waitForTimeout(80);
          await checkLayout(page, `${game} level ${level}`);
        }
      }
      await page.reload(); await page.addStyleTag({content: NO_ANIM});
      await page.locator('#book').click(); await checkLayout(page, 'sticker book');
      await page.locator('#back').click();
      await page.locator('#scene').click(); await checkLayout(page, 'scene');
      await page.locator('#home').click();
      await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('playlearn.ale.v1')); s.games.spell.items = {cat:{c:0,n:3}, pig:{c:1,n:3}}; s.games.spell.attempts = 6; localStorage.setItem('playlearn.ale.v1', JSON.stringify(s)); });
      await page.reload(); await page.addStyleTag({content: NO_ANIM});
      const gear = await page.locator('#gear').boundingBox();
      await page.mouse.move(gear.x + 48, gear.y + 48); await page.mouse.down(); await page.waitForTimeout(3200); await page.mouse.up();
      await expect(page.locator('.screen.parent')).toBeVisible();
      await checkLayout(page, 'parent settings');
      g.check();
    });
  }
  test(`layout ${w}x${h} · root and Ana home`, async ({ page }) => {
    await page.setViewportSize({width:w, height:h});
    await page.goto('./');
    const sw = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
    expect(sw).toBe(true);
    const a = await page.locator('a.kid').first().boundingBox();
    expect(a.height).toBeGreaterThanOrEqual(96);
  });
}
