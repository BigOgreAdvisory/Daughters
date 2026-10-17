import { test, expect } from '@playwright/test';
import { ALE_GAMES, stubSpeech, guard, seedAle, aleState, openAleGame, playAleSession, answerAleRound, collectReward } from './helpers.js';

/* Every level of every game, in both themes: a full 6-round session.
   Round 1 takes the wrong-answer path (two wrong taps -> hint -> answer shown), rounds 2-6 are right,
   so the 5-in-a-row rule must move the level up by one (or keep it at the cap). */
for(const theme of ['fairy','ocean']){
  for(const [game, max] of Object.entries(ALE_GAMES)){
    for(let level = 1; level <= max; level++){
      test(`${theme} · ${game} · level ${level} session`, async ({ page }) => {
        const g = guard(page);
        await stubSpeech(page);
        await seedAle(page, {settings:{rounds:6, theme}, games:{[game]:{level}}});
        await page.goto('ale/');
        await openAleGame(page, game);
        await expect(page.locator('#stage')).toHaveAttribute('data-level', String(level));
        const rounds = await playAleSession(page, i => i === 0);
        expect(rounds).toBe(6);
        await collectReward(page);
        const s = await aleState(page);
        expect(s.games[game].level).toBe(Math.min(max, level + 1));
        expect(s.games[game].sessions).toBe(1);
        expect(s.games[game].attempts).toBe(6);
        expect(s.games[game].correct).toBe(5);
        expect(Object.keys(s.games[game].items).length).toBeGreaterThan(0);
        expect((s.stickers[theme] || []).length).toBe(1);
        expect(s.scenes[theme].placed.length).toBe(1);
        // other games untouched: progress is saved per game
        Object.keys(ALE_GAMES).filter(k => k !== game).forEach(k => expect(s.games[k].attempts).toBe(0));
        g.check();
      });
    }
  }
}

/* level down after 3 misses in a row, floor at 1, cap at max */
for(const [game, max] of Object.entries(ALE_GAMES)){
  test(`levels · ${game} · down, floor and cap`, async ({ page }) => {
    const g = guard(page);
    await stubSpeech(page);
    await seedAle(page, {settings:{rounds:14}, games:{[game]:{level:2}}});
    await page.goto('ale/');
    await openAleGame(page, game);
    const rid = () => page.getAttribute('#stage', 'data-round');
    const next = async prev => { await expect.poll(rid).not.toBe(prev); };
    for(let i = 0; i < 3; i++){ const r = await rid(); await answerAleRound(page, true); await next(r); }
    expect((await aleState(page)).games[game].level).toBe(1);                       // down
    for(let i = 0; i < 3; i++){ const r = await rid(); await answerAleRound(page, true); await next(r); }
    expect((await aleState(page)).games[game].level).toBe(1);                       // floor
    await page.evaluate(([k, m]) => { const s = JSON.parse(localStorage.getItem('playlearn.ale.v1')); s.games[k].level = m; s.games[k].streak = 0; localStorage.setItem('playlearn.ale.v1', JSON.stringify(s)); }, [game, max]);
    await page.reload();
    await openAleGame(page, game);
    for(let i = 0; i < 6; i++){ const r = await rid(); await answerAleRound(page, false); await next(r); }
    expect((await aleState(page)).games[game].level).toBe(max);                     // cap
    g.check();
  });
}

test('default session is 10 rounds and the scene fills and restarts', async ({ page }) => {
  const g = guard(page);
  await stubSpeech(page);
  await seedAle(page, {});
  await page.addInitScript(() => {
    if(sessionStorage.getItem('__scene')) return; sessionStorage.setItem('__scene','1');
    const s = JSON.parse(localStorage.getItem('playlearn.ale.v1'));
    s.scenes = {fairy:{n:0, done:0, placed:Array.from({length:7}, (_, i) => ({i, x:20 + i*8, y:60}))}};
    localStorage.setItem('playlearn.ale.v1', JSON.stringify(s));
  });
  await page.goto('ale/');
  await expect(page.locator('#scene')).toContainText('7/8');
  await openAleGame(page, 'sight');
  expect(await playAleSession(page)).toBe(10);
  await collectReward(page);
  const s = await aleState(page);
  expect(s.scenes.fairy.done).toBe(1);
  expect(s.scenes.fairy.n).toBe(1);
  expect(s.scenes.fairy.placed.length).toBe(0);
  await expect(page.locator('#scene')).toContainText('0/8');
  await page.locator('#book').click();
  await expect(page.locator('.scell:not(.locked)')).toHaveCount(1);
  g.check();
});

test('parent gate needs a 3-second hold; settings and reset work', async ({ page }) => {
  const g = guard(page);
  await stubSpeech(page);
  await seedAle(page, {games:{spell:{level:4, sessions:3, attempts:20, correct:15}}});
  await page.goto('ale/');
  const gear = await page.locator('#gear').boundingBox();
  const cx = gear.x + gear.width/2, cy = gear.y + gear.height/2;
  // short tap and 1.5 s hold do nothing
  await page.locator('#gear').click();
  await page.mouse.move(cx, cy); await page.mouse.down(); await page.waitForTimeout(1500); await page.mouse.up();
  await expect(page.locator('.screen.home')).toBeVisible();
  // full hold opens settings
  await page.mouse.move(cx, cy); await page.mouse.down(); await page.waitForTimeout(3300); await page.mouse.up();
  await expect(page.locator('.screen.parent')).toBeVisible();
  await expect(page.locator('.stat')).toContainText('4/5');
  await page.locator('#s-rounds button[data-v="14"]').click();
  await page.locator('#s-sound button[data-v="0"]').click();
  await page.locator('#s-theme button[data-v="ocean"]').click();
  let s = await aleState(page);
  expect(s.settings).toEqual({sound:false, rounds:14, theme:'ocean'});
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--primary').trim())).toBe('#1f9bbf');
  await expect(page.locator('#s-theme button.on')).toContainText('Ocean');
  await page.locator('#reset').click();
  await page.locator('#no').click();
  expect((await aleState(page)).games.spell.level).toBe(4);
  await page.locator('#reset').click();
  await page.locator('#yes').click();
  s = await aleState(page);
  expect(s.games.spell).toMatchObject({level:1, sessions:0, attempts:0});
  expect(s.settings).toEqual({sound:false, rounds:14, theme:'ocean'});      // settings survive a reset
  await page.locator('#done').click();
  await expect(page.locator('.screen.home h1')).toBeVisible();
  // with sound off, prompts appear as captions instead
  await openAleGame(page, 'sight');
  await expect(page.locator('#caption')).toBeVisible();
  g.check();
});

test('?theme= URL parameter switches theme and is remembered', async ({ page }) => {
  const g = guard(page);
  await stubSpeech(page);
  await page.goto('ale/?theme=ocean');
  await expect(page.locator('.tile[data-g="family"]')).toContainText('Word Family Reef');
  expect((await aleState(page)).settings.theme).toBe('ocean');
  await page.goto('ale/');
  await expect(page.locator('.tile[data-g="family"]')).toContainText('Word Family Reef');
  await page.goto('ale/?theme=nope');
  await expect(page.locator('.tile[data-g="family"]')).toContainText('Word Family Reef');
  await page.goto('ale/?theme=fairy');
  await expect(page.locator('.tile[data-g="family"]')).toContainText('Word Family Garden');
  g.check();
});

test('read-aloud scaffolds: tapping a word or picture speaks it', async ({ page }) => {
  const g = guard(page);
  await stubSpeech(page);
  await seedAle(page, {games:{readpick:{level:3}, spell:{level:1}, family:{level:1}}});
  await page.goto('ale/');
  await openAleGame(page, 'readpick');
  const chip = page.locator('#sent .chip').nth(1);
  const w = await chip.getAttribute('data-w');
  await page.evaluate(() => window.__spoken.length = 0);
  await chip.click();
  await expect.poll(() => page.evaluate(() => window.__spoken)).toContain(w);
  // speaker plays the whole sentence word by word
  await page.evaluate(() => window.__spoken.length = 0);
  await page.locator('#again').click();
  const n = await page.locator('#sent .chip').count();
  await expect.poll(() => page.evaluate(() => window.__spoken.length)).toBeGreaterThanOrEqual(n);
  await page.locator('#home').click();
  await openAleGame(page, 'family');
  const word = (await page.locator('#bl .bw').textContent()).trim();
  await page.evaluate(() => window.__spoken.length = 0);
  await page.locator('#bl').click();
  await expect.poll(() => page.evaluate(() => window.__spoken)).toContain(word);
  g.check();
});

test('spell-a-word: drag a tile into the slots, finished word is replayed slowly', async ({ page }) => {
  const g = guard(page);
  await stubSpeech(page);
  await seedAle(page, {games:{spell:{level:1}}});
  await page.goto('ale/');
  await openAleGame(page, 'spell');
  const tile = page.locator('#stage .ltile[data-ok="1"]').first();
  const t = await tile.boundingBox(), s = await page.locator('#slots').boundingBox();
  await page.mouse.move(t.x + t.width/2, t.y + t.height/2); await page.mouse.down();
  await page.mouse.move(s.x + s.width/2, s.y + s.height/2, {steps:8}); await page.mouse.up();
  await expect(page.locator('.slot.filled')).toHaveCount(1);
  await page.evaluate(() => window.__spoken.length = 0);
  for(let i = 0; i < 2; i++){ await page.locator('#stage .ltile[data-ok="1"]').first().click(); await page.waitForTimeout(100); }
  await expect.poll(() => page.evaluate(() => window.__spoken.length)).toBeGreaterThan(1);
  await expect(page.locator('.slot.lit')).toHaveCount(3);
  g.check();
});
