// Renders Ale's app icons (original art, inline SVG) to PNG with Playwright's Chromium.
import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'ale');

// art drawn on a 100x100 grid; `scale` shrinks it into the maskable safe zone
const art = scale => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b07cff"/><stop offset="1" stop-color="#ff74bd"/></linearGradient>
    <radialGradient id="glow" cx=".5" cy=".42" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="100" height="100" fill="url(#bg)"/>
  <g transform="translate(50 50) scale(${scale}) translate(-50 -50)">
    <circle cx="50" cy="44" r="40" fill="url(#glow)"/>
    <circle cx="20" cy="22" r="2.2" fill="#fff"/><circle cx="82" cy="18" r="1.6" fill="#fff"/><circle cx="84" cy="70" r="2" fill="#fff"/><circle cx="16" cy="74" r="1.5" fill="#fff"/>
    <polygon points="50,10 58.2,30.5 80,31.5 63,45 68.8,66 50,54 31.2,66 37,45 20,31.5 41.8,30.5" fill="#ffd23f" stroke="#e9a800" stroke-width="2" stroke-linejoin="round"/>
    <rect x="22" y="64" width="56" height="26" rx="10" fill="#fff"/>
    <text x="50" y="84" text-anchor="middle" font-family="Trebuchet MS, Verdana, sans-serif" font-weight="800" font-size="20" fill="#7a3fd6" letter-spacing="1">abc</text>
  </g>
</svg>`;

const browser = await chromium.launch({channel:'chrome'});
const page = await browser.newPage();
for(const [file, size, scale] of [['icon-192.png',192,1], ['icon-512.png',512,1], ['icon-maskable-512.png',512,.78]]){
  await page.setViewportSize({width:size, height:size});
  await page.setContent(`<html><body style="margin:0">${art(scale)}</body></html>`);
  await page.screenshot({path: path.join(OUT, file), clip:{x:0, y:0, width:size, height:size}});
  console.log('wrote', file);
}
await browser.close();
