import { test, expect } from '@playwright/test';
import { guard } from './helpers.js';

/* Space Words (spacewords/): the SpaceWords games as a web app. The pages are the originals; this
   checks the web wrapper: every page loads clean, the hub hides what only the Android app can do,
   the worker caches the shell, voice clips come from their own cache, and it all works offline. */

const PAGES = ['index.html', 'words.html', 'math.html', 'picture-planet.html', 'saucer.html', 'match.html?g=connect', 'match.html?g=rhyme',
  'sound-lab.html', 'compound.html', 'wordsearch.html', 'read.html', 'class-words.html', 'math-game.html?g=count', 'math-game.html?g=ops', 'math-game.html?g=pattern'];

const cacheCounts = page => page.evaluate(async () => {
  const out = {};
  for (const k of await caches.keys()) if (k.startsWith('spacewords-')) out[k] = (await (await caches.open(k)).keys()).length;
  return out;
});

test('every Space Words page loads without errors and carries the manifest', async ({ page }) => {
  const g = guard(page);
  for (const p of PAGES) {
    await page.goto('spacewords/' + p);
    await expect(page.locator('link[rel=manifest]')).toHaveAttribute('href', 'manifest.webmanifest');
    await expect(page.locator('script[src="pwa.js"]')).toHaveCount(1);
    const back = page.locator('#backBtn');
    if (p === 'index.html') await expect(back).toBeHidden();      // no photos to go back to in a browser
    else await expect(back).toBeVisible();
  }
  await page.goto('spacewords/');
  await expect(page.locator('.adultrow')).toBeHidden();           // "hide for N hours" is the photo frame's
  g.check();
});

test('Space Words works offline: shell cache, clip cache, offline reload', async ({ page, context }) => {
  test.slow();
  await page.goto('spacewords/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(async () => (await cacheCounts(page))['spacewords-shell-v1'] || 0).toBeGreaterThanOrEqual(380);
  const clipCount = await page.evaluate(async () => (await (await fetch('audio/index.json')).json()).length);
  await expect.poll(async () => (await cacheCounts(page))['spacewords-audio'] || 0, { timeout: 150_000 }).toBe(clipCount);

  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  for (const p of ['spacewords/', 'spacewords/math.html', 'spacewords/match.html?g=rhyme']) {
    const r = await page.goto(p);
    expect(r.ok(), p).toBe(true);
  }
  await expect(page.locator('h1')).toContainText('Rhyming Pairs');
  const clip = await page.evaluate(async () => { const r = await fetch('audio/w_cat.mp3'); return [r.status, (await r.blob()).size]; });
  expect(clip[0]).toBe(200);
  expect(clip[1]).toBeGreaterThan(1000);
  await context.setOffline(false);
});
