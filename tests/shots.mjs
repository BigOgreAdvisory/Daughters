// Screenshots of every Ale screen for visual review: node shots.mjs [width] [height]  -> tests/shots/
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const W = +process.argv[2] || 360, H = +process.argv[3] || 740;
const BASE = 'http://localhost:4173/Daughters/ale/';
const GAMES = { spell:[1,3,4,5], family:[1,3,5], sight:[1,4,5], readpick:[1,2,3,4], letters:[1,3], sounds:[1,3,5] };
const OUT = new URL('./shots/', import.meta.url).pathname;
fs.mkdirSync(OUT, {recursive:true});

const browser = await chromium.launch({channel:'chrome'});
for(const theme of ['fairy','ocean']){
  const ctx = await browser.newContext({viewport:{width:W, height:H}, deviceScaleFactor:1, serviceWorkers:'block'});
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(window, 'speechSynthesis', {value:{speak(u){ setTimeout(() => u.onend && u.onend(), 5); }, cancel(){}, resume(){}, getVoices(){ return []; }}, configurable:true});
    window.SpeechSynthesisUtterance = function(t){ this.text = t; };
  });
  const setLevel = (k, l, extra) => page.evaluate(([k, l, theme, extra]) => {
    const s = JSON.parse(localStorage.getItem('playlearn.ale.v1') || 'null') || {settings:{}, games:{}};
    s.settings = Object.assign({sound:true, rounds:10}, s.settings, {theme});
    s.games[k] = Object.assign({level:1,streak:0,misses:0,sessions:0,correct:0,attempts:0,items:{}}, s.games[k] || {}, {level:l});
    Object.assign(s, extra || {});
    localStorage.setItem('playlearn.ale.v1', JSON.stringify(s));
  }, [k, l, theme, extra]);
  await page.goto(BASE + '?theme=' + theme);
  await setLevel('spell', 1, {scenes:{[theme]:{n:0, done:0, placed:[{i:0,x:20,y:70},{i:2,x:50,y:65},{i:3,x:70,y:30},{i:10,x:80,y:75}]}}, stickers:{[theme]:[0,3,5,5,9]}});
  await page.reload(); await page.waitForTimeout(900);
  await page.screenshot({path:`${OUT}${theme}-00-home.png`});
  for(const [k, lv] of Object.entries(GAMES)){
    for(const l of lv){
      await setLevel(k, l); await page.reload(); await page.waitForTimeout(300);
      if(k === 'letters' || k === 'sounds'){ await page.click('.tile[data-g="warm"]'); await page.click(`.warmlist .tile[data-g="${k}"]`); }
      else await page.click(`.tile[data-g="${k}"]`);
      await page.waitForTimeout(1400);
      await page.screenshot({path:`${OUT}${theme}-${k}-L${l}.png`});
    }
  }
  await page.reload(); await page.waitForTimeout(300);
  await page.click('.tile[data-g="warm"]'); await page.waitForTimeout(600); await page.screenshot({path:`${OUT}${theme}-01-warm.png`});
  await page.reload(); await page.click('#scene'); await page.waitForTimeout(600); await page.screenshot({path:`${OUT}${theme}-02-scene.png`});
  await page.reload(); await page.click('#book'); await page.waitForTimeout(400); await page.screenshot({path:`${OUT}${theme}-03-book.png`});
  await ctx.close();
}
await browser.close();
console.log('done', OUT);
