// Renders the app icons (a UFO over a starry sky) to PNG with Playwright's Chromium.
// Run:  node tools/make-icons.mjs      (needs the playwright package and a Chromium it can find)
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ufo = fs.readFileSync(path.join(ROOT, 'emoji', '1f6f8.svg'), 'utf8').replace(/<\?xml[^>]*>/, '');

// art on a 100x100 grid; `scale` shrinks it into the maskable safe zone
const art = scale => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1F2A44"/><stop offset="1" stop-color="#0B1026"/></linearGradient>
    <radialGradient id="glow" cx=".5" cy=".55" r=".45"><stop offset="0" stop-color="#5CE1E6" stop-opacity=".45"/><stop offset="1" stop-color="#5CE1E6" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="100" height="100" fill="url(#bg)"/>
  <g transform="translate(50 50) scale(${scale}) translate(-50 -50)">
    <circle cx="50" cy="52" r="42" fill="url(#glow)"/>
    <g fill="#FFFFFF"><circle cx="14" cy="16" r="1.8"/><circle cx="84" cy="12" r="1.3"/><circle cx="90" cy="60" r="1.6"/><circle cx="10" cy="70" r="1.2"/><circle cx="30" cy="88" r="1.5"/><circle cx="70" cy="90" r="1.1"/><circle cx="60" cy="8" r="1"/></g>
    <polygon points="78,22 79.6,26.4 84,28 79.6,29.6 78,34 76.4,29.6 72,28 76.4,26.4" fill="#FFD93D"/>
    <polygon points="20,42 21.2,45.4 24.6,46.6 21.2,47.8 20,51.2 18.8,47.8 15.4,46.6 18.8,45.4" fill="#FFD93D"/>
    <svg x="12" y="14" width="76" height="76" viewBox="0 0 36 36">${ufo.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')}</svg>
  </g>
</svg>`;

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [file, size, scale] of [['icon-192.png', 192, 1], ['icon-512.png', 512, 1], ['icon-maskable-512.png', 512, .78]]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:#0B1026">${art(scale)}</body></html>`);
  await page.screenshot({ path: path.join(ROOT, file), clip: { x: 0, y: 0, width: size, height: size } });
  console.log('wrote', file);
}
await browser.close();
