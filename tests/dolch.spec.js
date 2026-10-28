import { test, expect } from '@playwright/test';
import { stubSpeech, guard } from './helpers.js';

/* Word Quest editions (dolch/ = Ale's 45 days, anawords/ = Ana's self-paced, sightwords/ = the edition for sale).
   They share shared/app.js. Checks the word list, the plans, a full day played through the real screens,
   replaying a finished day, the name prompt, Kindle mode and offline use. */

const state = (page, key = 'dolch.v1') => page.evaluate(k => JSON.parse(localStorage.getItem(k)), key);

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

const finishQuest = async (page, done) => {
  for(let i = 0; i < 900; i++){
    if(await page.locator('#stage', {hasText: done}).count()) return;
    await autopilot(page);
    await page.waitForTimeout(90);
  }
  await expect(page.locator('#stage')).toContainText(done);
};

test('word list is the 220 Dolch words and the plans introduce all of them', async ({ page }) => {
  const g = guard(page);
  await page.goto('dolch/');
  await expect(page.locator('#stage')).toContainText('Day 1 of 45');
  const r = await page.evaluate(() => {
    const D = __dolch, S = D.S(); S.words = {}; const per = [];
    for(let d = 1; d <= 45; d++) per.push(D.simDay(d, 0.9));
    return {words: D.WORDS.length, uniq: new Set(D.WORDS.map(x => x.w)).size, met: Object.keys(S.words).length,
      first: D.WORDS.slice(0, 6).map(x => x.w), max: Math.max(...per)};
  });
  expect(r.words).toBe(220); expect(r.uniq).toBe(220); expect(r.met).toBe(220);
  expect(r.first).toEqual(['the', 'to', 'and', 'a', 'I', 'you']);
  expect(r.max).toBeLessThanOrEqual(60);
  for(const [ed, lessons] of [['anawords', 74], ['sightwords', 44]]){
    await page.goto(ed + '/');
    if(ed === 'sightwords') await page.locator('input.pick').fill('Mia'), await page.getByRole('button', { name: /Let's go/ }).click();
    await expect(page.locator('#stage')).toContainText('Lesson 1 of ' + lessons);
    expect(await page.locator('.day').count()).toBe(lessons);
    const met = await page.evaluate(() => { const D = __dolch, S = D.S(); S.words = {}; for(let d = 1; d <= 80; d++) D.simDay(d, 0.9); return Object.keys(S.words).length; });
    expect(met).toBe(220);
  }
  g.check();
});

test('Ale: a full first day plays through: 6 new words, 18 gems, day marked done', async ({ page }) => {
  test.slow();
  const g = guard(page);
  await page.goto('dolch/');
  await page.getByRole('button', { name: /Play Day 1/ }).click();
  await finishQuest(page, 'Day 1 complete!');
  const s = await state(page);
  expect(Object.keys(s.words)).toHaveLength(6);
  expect(s.done[1]).toBe(true); expect(s.streak).toBe(1);
  expect(s.gems).toBeGreaterThanOrEqual(18);
  await page.getByRole('button', { name: /Home/ }).click();
  await expect(page.locator('#stage')).toContainText('You finished today');
  g.check();
});

test('tapping a finished day replays it without moving the plan', async ({ page }) => {
  test.slow();
  const g = guard(page);
  await page.goto('dolch/');
  await page.evaluate(() => { __dolch.simDay(1, 1); __dolch.home(); });
  const before = await state(page);
  await page.evaluate(() => localStorage.setItem('dolch.v1', JSON.stringify(__dolch.S())));
  await page.locator('.day.done.go').first().click();
  await expect(page.locator('.modal')).toContainText('Play it again?');
  await page.getByRole('button', { name: /Yes/ }).click();
  await expect(page.locator('#bar')).toBeVisible();
  await finishQuest(page, 'playing Day 1 again!');
  const after = await state(page);
  expect(after.streak).toBe(before.streak);                 // a replay is not a new day
  expect(Object.keys(after.done)).toEqual(['1']);
  expect(after.sess).toBeNull(); expect(after.rsess).toBeNull();
  expect(after.gems).toBeGreaterThan(before.gems);
  for(const w of Object.keys(after.words)) expect(after.words[w].r.b).toBeLessThanOrEqual(2);   // spacing not rushed
  g.check();
});

test("Ana's Word Quest: self-paced lessons of 3 words, then lesson 2 opens and lesson 1 can be redone", async ({ page }) => {
  test.slow();
  const g = guard(page);
  await page.goto('anawords/');
  await expect(page.locator('#stage')).toContainText('Hi Ana!');
  await expect(page.locator('#stage')).toContainText('Lesson 1 of 74');
  await page.getByRole('button', { name: /Play Lesson 1/ }).click();
  const types = await page.evaluate(() => { const S = __dolch.S(); return S.sess.q.map(t => t[0]); });
  expect(types.filter(t => t === 'meet')).toHaveLength(3);
  await finishQuest(page, 'Lesson 1 complete!');
  const s = await state(page, 'anawords.v1');
  expect(Object.keys(s.words)).toHaveLength(3); expect(s.done[1]).toBe(true);
  await page.getByRole('button', { name: /Home/ }).click();
  await expect(page.locator('#stage')).toContainText('Lesson 2 of 74');
  await page.locator('.day.done.go').first().click();
  await expect(page.locator('.modal')).toContainText('Lesson 1');
  await page.getByRole('button', { name: /Yes/ }).click();
  await finishQuest(page, 'Lesson 1 again!');
  expect((await state(page, 'anawords.v1')).done[2]).toBeUndefined();
  g.check();
});

test('the sale edition asks for a name first and runs lessons of 5', async ({ page }) => {
  const g = guard(page);
  await page.goto('sightwords/');
  await expect(page.locator('#stage')).toContainText('Who is playing?');
  await page.locator('input.pick').fill('Mia');
  await page.getByRole('button', { name: /Let's go/ }).click();
  await expect(page.locator('#stage')).toContainText('Hi Mia!');
  await page.getByRole('button', { name: /Play Lesson 1/ }).click();
  const meets = await page.evaluate(() => __dolch.S().sess.q.filter(t => t[0] === 'meet').length);
  expect(meets).toBe(5);
  await page.reload();
  await expect(page.locator('#stage')).toContainText('Hi Mia!');          // remembered
  g.check();
});

test('Kindle Fire (Silk) gets the big-button layout; other browsers do not', async ({ browser }) => {
  const silk = await browser.newContext({ userAgent: 'Mozilla/5.0 (Linux; Android 9; KFTRWI) AppleWebKit/537.36 (KHTML, like Gecko) Silk/100.4.1 like Chrome/100.0.0.0 Safari/537.36' });
  const p1 = await silk.newPage(); await stubSpeech(p1); await p1.goto('dolch/');
  await expect(p1.locator('html')).toHaveClass(/kindle/);
  await silk.close();
  const plain = await browser.newContext(); const p2 = await plain.newPage(); await stubSpeech(p2); await p2.goto('dolch/');
  await expect(p2.locator('html')).not.toHaveClass(/kindle/);
  await p2.goto('dolch/?kindle=1'); await expect(p2.locator('html')).toHaveClass(/kindle/);
  await plain.close();
});

test('each edition works offline and keeps its own progress', async ({ page, context }) => {
  for(const [ed, key, prefix] of [['dolch', 'dolch.v1', 'dolch'], ['anawords', 'anawords.v1', 'anawords'], ['sightwords', 'sightwords.v1', 'sightwords']]){
    await page.goto(ed + '/');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await expect.poll(() => page.evaluate(p => caches.open(p + '-v2').then(c => c.keys()).then(k => k.length), prefix)).toBeGreaterThanOrEqual(12);
    expect(await page.evaluate(k => localStorage.getItem(k) !== null, key)).toBe(true);
  }
  await context.setOffline(true);
  for(const ed of ['dolch', 'anawords']){
    await page.goto(ed + '/');
    await expect(page.locator('#stage')).toContainText(/Day 1 of 45|Lesson 1 of 74/);
    await page.getByRole('button', { name: /My Words/ }).click();
    await expect(page.locator('.gem').first()).toBeVisible();
  }
});
