/* Ale's Games – engine: storage, speech, sound, theme, mascot, game framework, rewards, parent settings.
   No theme text or art lives here; it all comes from window.ALE_THEMES (themes/*.js). */
'use strict';
(function(){
const A = window.ALE = window.ALE || {};
A.games = {};

/* ===================================================================== Helpers */
const TS = (typeof window.__aleTimeScale === 'number') ? window.__aleTimeScale : 1;   // tests run faster
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const wait  = ms => new Promise(r => setTimeout(r, ms*TS));
const later = (fn, ms) => setTimeout(fn, ms*TS);
const rnd = n => Math.floor(Math.random()*n);
const pick = a => a[rnd(a.length)];
function shuffle(a){ a = a.slice(); for(let i=a.length-1;i>0;i--){ const j = rnd(i+1); [a[i],a[j]] = [a[j],a[i]]; } return a; }
function wpick(items, wfn){
  const ws = items.map(wfn); let r = Math.random()*ws.reduce((x,y)=>x+y,0);
  for(let i=0;i<items.length;i++){ r -= ws[i]; if(r <= 0) return items[i]; }
  return items[items.length-1];
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
Object.assign(A, {$, $$, wait, later, rnd, pick, shuffle, wpick, esc});

/* ===================================================================== Storage */
const KEY = 'playlearn.ale.v1';
const GAME_KEYS = ['spell','family','sight','readpick','letters','sounds'];
const ROUNDS = [6, 10, 14];
let S;
const gdef = () => ({level:1, streak:0, misses:0, sessions:0, correct:0, attempts:0, items:{}});
function defaults(){
  const g = {}; GAME_KEYS.forEach(k => g[k] = gdef());
  return {v:1, settings:{sound:true, rounds:10, theme:'fairy'}, games:g, stickers:{}, scenes:{}, last:0};
}
function load(){
  let raw = null;
  try{ raw = JSON.parse(localStorage.getItem(KEY)); }catch(e){}
  const d = defaults();
  S = (raw && typeof raw === 'object') ? raw : d;
  S.settings = Object.assign(d.settings, S.settings || {});
  if(!ROUNDS.includes(S.settings.rounds)) S.settings.rounds = 10;
  S.games = S.games || {};
  GAME_KEYS.forEach(k => { S.games[k] = Object.assign(gdef(), S.games[k] || {}); });
  S.stickers = (S.stickers && typeof S.stickers === 'object' && !Array.isArray(S.stickers)) ? S.stickers : {};
  S.scenes = (S.scenes && typeof S.scenes === 'object') ? S.scenes : {};
}
function save(){ S.last = Date.now(); try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
A.state = () => S;

/* ===================================================================== Theme */
const THEMES = window.ALE_THEMES || {};
let TH = null;
function applyTheme(id){
  TH = THEMES[id] || THEMES.fairy || THEMES[Object.keys(THEMES)[0]];
  const st = document.documentElement.style;
  Object.entries(TH.palette).forEach(([k,v]) => st.setProperty('--' + k, v));
  Object.entries(TH.backgrounds).forEach(([k,v]) => st.setProperty('--bg-' + k, v));
  const m = $('meta[name=theme-color]'); if(m) m.content = TH.palette.primary;
  document.title = TH.title.app;
}
A.theme = () => TH;
A.themes = () => THEMES;

/* ===================================================================== Speech */
const TTS = {
  ok: ('speechSynthesis' in window) && (typeof SpeechSynthesisUtterance !== 'undefined'),
  voice: null, keep: [], cancelAt: 0,
  init(){
    if(!this.ok) return;
    const pv = () => {
      let vs = []; try{ vs = speechSynthesis.getVoices(); }catch(e){}
      if(!vs.length) return;
      const en = vs.filter(v => /^en[-_]US/i.test(v.lang));
      this.voice = en.find(v => /google us english|samantha|female/i.test(v.name)) || en[0] || vs.find(v => /^en/i.test(v.lang)) || null;
    };
    pv(); try{ speechSynthesis.onvoiceschanged = pv; }catch(e){}
  },
  live(){ return this.ok && S.settings.sound; },
  cancel(){ this.cancelAt = Date.now(); if(this.ok){ try{ speechSynthesis.cancel(); }catch(e){} } },
  say(text, opt){
    opt = opt || {};
    if(!this.live()){ caption(text); return wait(Math.min(2200, 500 + text.length*50)); }
    return new Promise(res => {
      let done = false;
      const fin = () => { if(!done){ done = true; res(); } };
      const speakNow = () => {
        try{
          const u = new SpeechSynthesisUtterance(text);
          u.lang = 'en-US'; if(this.voice) u.voice = this.voice;
          u.rate = opt.rate || 0.85; u.pitch = opt.pitch || 1.15; u.volume = 1;
          u.onend = fin; u.onerror = fin;
          this.keep.push(u); if(this.keep.length > 8) this.keep.shift();
          try{ speechSynthesis.resume(); }catch(e){}
          speechSynthesis.speak(u);
        }catch(e){ caption(text); fin(); }
      };
      // Android Chrome can drop a speak() issued right after cancel(); give it a moment
      const d = Math.max(0, 160 - (Date.now() - this.cancelAt));
      if(d > 0) later(speakNow, d); else speakNow();
      later(fin, (1700 + text.length*140) / (opt.rate && opt.rate < .7 ? .6 : 1));   // some Android engines never fire onend
    });
  }
};
let capTimer = 0;
function caption(text){
  const c = $('#caption'); if(!c) return;
  c.textContent = text; c.hidden = false;
  clearTimeout(capTimer); capTimer = later(() => { c.hidden = true; }, 2600);
}
A.TTS = TTS;
A.say = (t, o) => TTS.say(t, o);

let SEQ = 0;   // spoken-sequence token: a tap or replay stops an older sequence
function stopSeq(){ SEQ++; TTS.cancel(); $$('.hl').forEach(x => x.classList.remove('hl')); return SEQ; }
A.stopSeq = stopSeq;
A.seq = () => SEQ;

const LNAME = {a:'ay',b:'bee',c:'see',d:'dee',e:'ee',f:'eff',g:'jee',h:'aitch',i:'eye',j:'jay',k:'kay',l:'el',m:'em',
  n:'en',o:'oh',p:'pee',q:'cue',r:'ar',s:'ess',t:'tee',u:'you',v:'vee',w:'double you',x:'ex',y:'why',z:'zee'};
A.lname = s => String(s).toLowerCase().split('').map(c => LNAME[c] || c).join(', ');

/* ===================================================================== Sound effects (Web Audio, no files) */
let AC = null;
function ac(){
  if(!S.settings.sound) return null;
  try{
    if(!AC){ const C = window.AudioContext || window.webkitAudioContext; if(C) AC = new C(); }
    if(AC && AC.state === 'suspended') AC.resume();
  }catch(e){ AC = null; }
  return AC;
}
function tone(f, t0, dur, type, vol){
  const a = ac(); if(!a) return;
  try{
    const o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.value = f;
    const t = a.currentTime + t0;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.15, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.05);
  }catch(e){}
}
A.Sfx = {
  good(){ tone(523,0,.18,'triangle',.18); tone(659,.09,.18,'triangle',.18); tone(784,.18,.3,'triangle',.18); },
  soft(){ tone(330,0,.22,'sine',.12); tone(262,.12,.3,'sine',.1); },      // gentle "hmm", never harsh
  pop(){ tone(600,0,.09,'sine',.12); },
  chime(){ [880,1175,1568].forEach((f,i) => tone(f,i*.07,.35,'sine',.09)); },
  win(){ [523,659,784,1047,784,1047].forEach((f,i) => tone(f,i*.12,.25,'triangle',.18)); },
  up(){ [660,880,1100].forEach((f,i) => tone(f,i*.08,.2,'sine',.12)); }
};
A.ac = ac;

/* ===================================================================== Effects */
function burst(cx, cy, n){
  const fx = $('#fx'); if(!fx) return;
  const box = fx.getBoundingClientRect();
  for(let i=0;i<(n||12);i++){
    const s = document.createElement('span');
    s.className = 'spark em'; s.textContent = pick(TH.sparkles);
    s.style.left = (cx - box.left) + 'px'; s.style.top = (cy - box.top) + 'px';
    const ang = Math.random()*Math.PI*2, d = 70 + Math.random()*110;
    s.style.setProperty('--dx', Math.cos(ang)*d + 'px');
    s.style.setProperty('--dy', Math.sin(ang)*d + 'px');
    s.style.setProperty('--rot', (Math.random()*240-120) + 'deg');
    fx.appendChild(s);
    setTimeout(() => s.remove(), 1200);
  }
}
A.burst = burst;
A.burstAt = (el, n) => { if(!el) return; const r = el.getBoundingClientRect(); burst(r.left + r.width/2, r.top + r.height/2, n); };
function clearFx(){ const f = $('#fx'); if(f) f.innerHTML = ''; }

/* ===================================================================== Mascot */
A.mascotHTML = cls => `<div class="mascot ${cls||''}" aria-hidden="true">${TH.mascot.svg}</div>`;
A.mascot = mood => {
  $$('#screen .mascot').forEach(m => {
    m.classList.remove('m-happy','m-think','m-wave','m-cheer');
    void m.offsetWidth;
    m.classList.add('m-' + mood);
  });
};
A.praise = () => pick(TH.mascot.praise);
A.hint = () => pick(TH.mascot.hints);

/* ===================================================================== Navigation */
let SCR = 0;   // screen token: async work from a screen that was left must stop
A.alive = tk => tk === SCR;
function go(fn){
  SCR++; TTS.cancel(); clearTimeout(capTimer);
  const c = $('#caption'); if(c) c.hidden = true;
  clearFx();
  fn();
}
function setScreen(cls, inner, bgKey){
  $('#screen').innerHTML = `<div class="screen ${cls}" style="background:var(--bg-${bgKey || cls.split(' ').pop()})">${inner}</div>`;
  return $('#screen .screen');
}
A.go = go; A.setScreen = setScreen;

/* drag-or-tap helper: a tap calls onTap, a drag calls onDrop(x, y) with the release point */
A.draggable = (el, opts) => {
  let id = null, sx = 0, sy = 0, moved = false, on = false;
  el.style.touchAction = 'none';
  el.addEventListener('pointerdown', e => {
    if(opts.disabled && opts.disabled()) return;
    id = e.pointerId; try{ el.setPointerCapture(id); }catch(_){}
    sx = e.clientX; sy = e.clientY; moved = false; on = true; el.classList.add('drag');
  });
  el.addEventListener('pointermove', e => {
    if(!on || e.pointerId !== id) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if(Math.abs(dx) + Math.abs(dy) > 12) moved = true;
    if(moved) el.style.transform = `translate(${dx}px,${dy}px) scale(1.06)`;
  });
  el.addEventListener('pointerup', e => {
    if(!on) return; on = false; el.classList.remove('drag'); el.style.transform = '';
    if(!moved){ if(opts.onTap) opts.onTap(); return; }
    if(opts.onDrop) opts.onDrop(e.clientX, e.clientY);
  });
  el.addEventListener('pointercancel', () => { on = false; el.classList.remove('drag'); el.style.transform = ''; });
};
A.hitEl = (els, x, y, pad) => els.find(b => {
  const q = b.getBoundingClientRect(), p = pad || 0;
  return x >= q.left - p && x <= q.right + p && y >= q.top - p && y <= q.bottom + p;
});

/* weighted pick: weak items come back more often, recent ones rest */
A.weight = (g, key) => { const it = g.items[key]; return it && it.n ? 1 + 3*(1 - it.c/it.n) : 1.4; };
A.pickItem = (pool, keyFn, g, recent, keep) => {
  const t = wpick(pool, x => A.weight(g, keyFn(x)) * (recent.includes(keyFn(x)) ? .04 : 1));
  recent.push(keyFn(t)); while(recent.length > (keep || 3)) recent.shift();
  return t;
};

/* ===================================================================== Home */
const READING = ['spell','family','sight','readpick'];
function placedCount(){ const sc = sceneState(); return sc.placed.length; }
function stickerCount(){ return new Set(S.stickers[TH.id] || []).size; }

function home(){
  go(() => {
    const G = TH.games;
    const tile = k => `<button class="tile t-${k}" data-g="${k}" style="background:${G[k].color}"><div class="ico">${G[k].icon}</div><div class="nm">${esc(G[k].name)}</div></button>`;
    const root = setScreen('home', `
      <div class="hdr">
        <button class="ibtn mbtn" id="mascot" aria-label="${esc(TH.mascot.name)}">${A.mascotHTML('m-wave')}</button>
        <h1>${esc(TH.title.home)}</h1>
        <button class="ibtn gear" id="gear" aria-label="Parents">
          <svg class="ring" viewBox="0 0 68 68"><circle cx="34" cy="34" r="32"/></svg>
          <span class="disc em">⚙️</span>
        </button>
      </div>
      <div class="tiles">${READING.map(tile).join('')}${tile('warm')}</div>
      <div class="bar">
        <button class="big-btn" id="scene" aria-label="${esc(TH.scene.name)}"><span class="em">${TH.scene.icon}</span><span>${placedCount()}/${TH.scene.capacity}</span></button>
        <button class="big-btn" id="book" aria-label="Stickers"><span class="em">${TH.bookIcon}</span><span>${stickerCount()}/${TH.stickers.length}</span></button>
      </div>`);
    root.querySelectorAll('.tile').forEach(b => b.addEventListener('click', () => {
      ac(); A.Sfx.pop();
      if(b.dataset.g === 'warm') warmMenu(); else startGame(b.dataset.g);
    }));
    $('#mascot').addEventListener('click', () => { ac(); A.mascot('wave'); TTS.cancel(); TTS.say(pick(TH.mascot.hello)); });
    $('#scene').addEventListener('click', () => { ac(); A.Sfx.pop(); sceneScreen(false); });
    $('#book').addEventListener('click', () => { ac(); A.Sfx.pop(); stickerBook(); });
    holdGear($('#gear'));
  });
}
A.home = home;

function warmMenu(){
  go(() => {
    const G = TH.games;
    setScreen('warm', `
      <div class="top">
        <button class="ibtn" id="home" aria-label="Home"><span class="disc em">🏠</span></button>
        <div class="mid">${A.mascotHTML('sm m-wave')}</div>
        <div class="ibtn-spacer"></div>
      </div>
      <div class="warmlist">
        ${['letters','sounds'].map(k => `<button class="tile wide t-${k}" data-g="${k}" style="background:${G[k].color}"><div class="ico">${G[k].icon}</div><div class="nm">${esc(G[k].name)}</div></button>`).join('')}
      </div>`);
    $('#home').addEventListener('click', () => { A.Sfx.pop(); home(); });
    $$('.warmlist .tile').forEach(b => b.addEventListener('click', () => { ac(); A.Sfx.pop(); startGame(b.dataset.g); }));
  });
}

function holdGear(btn){
  const ring = btn.querySelector('.ring circle'); const C = 201;
  let active = false, t0 = 0, raf = 0;
  const reset = () => { active = false; cancelAnimationFrame(raf); ring.style.strokeDashoffset = C; };
  btn.addEventListener('pointerdown', e => {
    e.preventDefault(); active = true; t0 = performance.now();
    const tick = () => {
      if(!active) return;
      const p = Math.min(1, (performance.now() - t0)/3000);
      ring.style.strokeDashoffset = String(C*(1 - p));
      if(p >= 1){ reset(); settings(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  });
  ['pointerup','pointercancel','pointerleave'].forEach(ev => btn.addEventListener(ev, reset));
  btn.addEventListener('contextmenu', e => e.preventDefault());
}

/* ===================================================================== Parent settings */
function weakItems(g){
  return Object.entries(g.items).filter(([,v]) => v.n >= 2 && v.c/v.n < .8)
    .sort((a,b) => a[1].c/a[1].n - b[1].c/b[1].n).slice(0,3)
    .map(([k]) => k.replace(/^[a-z0-9]+:/i,'')).join(', ');
}
function settings(){
  go(() => {
    const rows = GAME_KEYS.map(k => {
      const g = S.games[k], acc = g.attempts ? Math.round(100*g.correct/g.attempts) + '%' : '–';
      return `<tr><td>${esc(TH.games[k].name)}</td><td>${g.level}/${A.games[k].max}</td><td>${g.sessions}</td><td>${acc}</td><td>${esc(weakItems(g)) || '–'}</td></tr>`;
    }).join('');
    const scenesDone = Object.values(S.scenes).reduce((n, s) => n + (s.done || 0), 0);
    const root = setScreen('parent', `
      <div class="phdr"><h2>Parent settings</h2><button class="pbtn primary" id="done">Done</button></div>
      <h3>Sound (voice + effects)</h3>
      <div class="seg" id="s-sound"><button data-v="1">On</button><button data-v="0">Off</button></div>
      <h3>Rounds per session</h3>
      <div class="seg" id="s-rounds">${ROUNDS.map(r => `<button data-v="${r}">${r}</button>`).join('')}</div>
      <h3>Theme</h3>
      <div class="seg wrap" id="s-theme">${Object.values(THEMES).map(t => `<button data-v="${t.id}"><span class="em">${t.icon}</span> ${esc(t.name)}</button>`).join('')}</div>
      <h3>Progress</h3>
      <div class="tablewrap"><table class="stat"><tr><th>Game</th><th>Level</th><th>Sessions</th><th>First try</th><th>Practise</th></tr>${rows}</table></div>
      <p>Stickers: ${stickerCount()} of ${TH.stickers.length}. Finished scenes: ${scenesDone}. Everything is stored only on this phone.</p>
      <h3>Reset</h3>
      <div class="row" id="resetrow"><button class="pbtn danger" id="reset">Reset all progress…</button></div>`, 'parent');
    const mark = () => {
      root.querySelectorAll('#s-sound button').forEach(b => b.classList.toggle('on', (b.dataset.v === '1') === S.settings.sound));
      root.querySelectorAll('#s-rounds button').forEach(b => b.classList.toggle('on', +b.dataset.v === S.settings.rounds));
      root.querySelectorAll('#s-theme button').forEach(b => b.classList.toggle('on', b.dataset.v === TH.id));
    };
    mark();
    root.querySelectorAll('#s-sound button').forEach(b => b.addEventListener('click', () => { S.settings.sound = b.dataset.v === '1'; if(!S.settings.sound) TTS.cancel(); save(); mark(); }));
    root.querySelectorAll('#s-rounds button').forEach(b => b.addEventListener('click', () => { S.settings.rounds = +b.dataset.v; save(); mark(); }));
    root.querySelectorAll('#s-theme button').forEach(b => b.addEventListener('click', () => { S.settings.theme = b.dataset.v; save(); applyTheme(b.dataset.v); settings(); }));
    $('#reset').addEventListener('click', () => {
      $('#resetrow').innerHTML = '<button class="pbtn danger" id="yes">Yes, erase everything</button><button class="pbtn" id="no">Cancel</button>';
      $('#yes').addEventListener('click', () => { const s = S.settings; S = defaults(); S.settings = s; save(); settings(); });
      $('#no').addEventListener('click', () => settings());
    });
    $('#done').addEventListener('click', home);
  });
}

/* ===================================================================== Game framework */
function startGame(key){
  go(() => {
    const G = A.games[key], g = S.games[key];
    g.level = Math.max(1, Math.min(G.max, g.level || 1));
    const sess = {key, g, N:S.settings.rounds, round:0, ctx:{}, replay:null, tk:SCR};
    if(G.init) G.init(sess);
    setScreen('game ' + key, `
      <div class="top">
        <button class="ibtn" id="home" aria-label="Home"><span class="disc em">🏠</span></button>
        <div class="mid">${A.mascotHTML('sm')}<div class="dots" id="dots"></div></div>
        <button class="ibtn" id="again" aria-label="Hear again"><span class="disc em">🔊</span></button>
      </div>
      <div id="stage"></div>`);
    $('#home').addEventListener('click', () => { A.Sfx.pop(); home(); });
    $('#again').addEventListener('click', () => { ac(); if(sess.replay) sess.replay(); });
    sess.done = (ok, itemKey) => completeRound(sess, ok, itemKey);
    nextRound(sess);
  });
}
A.startGame = startGame;

function dots(sess){
  const d = $('#dots'); if(!d) return;
  let s = ''; for(let i=0;i<sess.N;i++) s += '<i class="' + (i < sess.round ? 'on' : '') + '"></i>';
  d.innerHTML = s;
}
let ROUND_ID = 0;
function nextRound(sess){
  if(sess.tk !== SCR) return;
  if(sess.round >= sess.N){ finishSession(sess); return; }
  dots(sess);
  const st = $('#stage'); st.innerHTML = ''; st.className = 'lv' + sess.g.level;
  st.dataset.round = String(++ROUND_ID); st.dataset.level = String(sess.g.level);
  sess.replay = null;
  A.games[sess.key].round(sess, st, SCR);
}
function completeRound(sess, ok, itemKey){
  if(sess.tk !== SCR || sess.closing) return;
  sess.closing = true;
  const g = sess.g, G = A.games[sess.key];
  g.attempts++; if(ok) g.correct++;
  if(itemKey){ const it = g.items[itemKey] || (g.items[itemKey] = {c:0, n:0}); it.n++; if(ok) it.c++; }
  if(ok){
    g.streak++; g.misses = 0;
    if(g.streak >= 5){ if(g.level < G.max){ g.level++; A.Sfx.up(); } g.streak = 0; }
  }else{
    g.misses++; g.streak = 0;
    if(g.misses >= 3){ if(g.level > 1) g.level--; g.misses = 0; }
  }
  save();
  sess.round++; dots(sess);
  const tk = SCR;
  later(() => { sess.closing = false; if(tk === SCR) nextRound(sess); }, 700);
}

/* standard answer handling shared by the tap-to-choose games:
   right -> praise; wrong once -> gentle hint, second try; wrong twice -> show the answer */
A.choiceRound = (sess, tk, opts) => {
  let wrong = 0, busy = false;
  return async (el, isRight) => {
    if(busy || !A.alive(tk) || el.classList.contains('dim')) return;
    ac(); stopSeq();
    if(isRight){
      busy = true; el.classList.add('found'); A.Sfx.good(); A.burstAt(el, 12); A.mascot('happy');
      if(opts.onRight) await opts.onRight(el, wrong);
      if(A.alive(tk)) sess.done(wrong === 0, opts.key);
    }else{
      wrong++; el.classList.add('wobble','dim'); A.Sfx.soft(); A.mascot('think');
      if(wrong >= 2 || (opts.left && opts.left() === 0)){
        busy = true;
        if(opts.reveal) await opts.reveal(el);
        await wait(450);
        if(A.alive(tk)) sess.done(false, opts.key);
      }else if(opts.hint){ await opts.hint(el); }
    }
  };
};

/* ===================================================================== Finish + rewards */
function sceneState(){
  const s = S.scenes[TH.id] || (S.scenes[TH.id] = {n:0, placed:[], done:0});
  s.placed = Array.isArray(s.placed) ? s.placed : [];
  return s;
}
function pickSticker(){
  const own = S.stickers[TH.id] || (S.stickers[TH.id] = []);
  const set = new Set(own);
  const i = wpick(TH.stickers.map((_,i) => i), i => set.has(i) ? 1 : 4);
  own.push(i); save(); return i;
}

function finishSession(sess){
  sess.g.sessions++; save();
  go(async () => {
    const tk = SCR;
    setScreen('finish', `
      ${A.mascotHTML('big m-cheer')}
      <div class="gifts" id="gifts" hidden>${[0,1,2].map(i => `<button class="gift em" data-i="${i}">${TH.gift}</button>`).join('')}</div>
      <div id="after"></div>`);
    A.Sfx.win(); burst(innerWidth/2, innerHeight*0.3, 20);
    await TTS.say(pick(TH.mascot.cheer));
    if(tk !== SCR) return;
    const gifts = $('#gifts'); gifts.hidden = false;
    TTS.say('Pick a present!');
    let picked = false;
    gifts.querySelectorAll('.gift').forEach(b => b.addEventListener('click', async () => {
      if(picked) return; picked = true; ac(); stopSeq();
      const i = pickSticker(), st = TH.stickers[i];
      b.classList.add('open'); b.textContent = st[0]; A.Sfx.good(); A.burstAt(b, 14);
      gifts.querySelectorAll('.gift').forEach(o => { if(o !== b) o.classList.add('gone'); });
      $('#after').innerHTML = `<button class="big-btn" id="next" aria-label="Next"><span class="em">${TH.scene.icon}</span><span class="em">➡️</span></button>`;
      $('#next').addEventListener('click', () => { A.Sfx.pop(); sceneScreen(true); });
      await TTS.say('You got ' + st[1] + '!');
    }));
  });
}

function sceneScreen(placeMode){
  go(async () => {
    const tk = SCR, sc = sceneState(), sn = TH.scene, bd = sn.backdrops[sc.n % sn.backdrops.length];
    const deco = bd.deco.map(d => `<span class="deco em" style="left:${d[1]}%;top:${d[2]}%;font-size:${d[3]}px">${d[0]}</span>`).join('');
    const items = () => sc.placed.map(p => `<span class="sitem em" style="left:${p.x}%;top:${p.y}%">${(sn.items[p.i] || sn.items[0])[0]}</span>`).join('');
    setScreen('scene', `
      <div class="top">
        <button class="ibtn" id="home" aria-label="Home"><span class="disc em">🏠</span></button>
        <div class="mid">${A.mascotHTML('sm')}<div class="scount" id="sct">${sc.placed.length}/${sn.capacity}</div></div>
        <div class="ibtn-spacer"></div>
      </div>
      <div class="scenebox" id="sb" style="background:${bd.bg}">${deco}<div id="items">${items()}</div></div>
      <div class="tray" id="tray"></div>`, 'book');
    $('#home').addEventListener('click', () => { A.Sfx.pop(); home(); });
    if(!placeMode) return;
    const i = rnd(sn.items.length), it = sn.items[i];
    $('#tray').innerHTML = `<span class="newitem em">${it[0]}</span>`;
    $('#sb').classList.add('placing');
    TTS.say(`You got ${it[1]}! ${sn.prompt}`);
    let placed = false;
    $('#sb').addEventListener('click', async e => {
      if(placed || tk !== SCR) return; placed = true; ac(); stopSeq();
      const r = $('#sb').getBoundingClientRect();
      const x = Math.round(Math.max(7, Math.min(93, (e.clientX - r.left)/r.width*100)));
      const y = Math.round(Math.max(8, Math.min(90, (e.clientY - r.top)/r.height*100)));
      sc.placed.push({i, x, y}); save();
      $('#sb').classList.remove('placing'); $('#tray').innerHTML = '';
      $('#items').innerHTML = items();
      const last = $$('#items .sitem').pop(); if(last) last.classList.add('pop');
      $('#sct').textContent = `${sc.placed.length}/${sn.capacity}`;
      A.Sfx.chime(); burst(e.clientX, e.clientY, 12); A.mascot('happy');
      if(sc.placed.length >= sn.capacity){
        A.Sfx.win(); burst(innerWidth/2, innerHeight*.4, 24);
        await TTS.say(sn.full);
        if(tk !== SCR) return;
        sc.done = (sc.done || 0) + 1; sc.n++; sc.placed = []; save();
      }else{
        await TTS.say(A.praise());
      }
      if(tk !== SCR) return;
      $('#tray').innerHTML = '<button class="big-btn" id="gohome" aria-label="Home"><span class="em">🏠</span></button>';
      $('#gohome').addEventListener('click', home);
    });
  });
}

function stickerBook(){
  go(() => {
    const counts = {}; (S.stickers[TH.id] || []).forEach(i => counts[i] = (counts[i] || 0) + 1);
    const cells = TH.stickers.map((s,i) => counts[i]
      ? `<div class="scell"><span class="em">${s[0]}</span>${counts[i] > 1 ? `<span class="n">${counts[i]}</span>` : ''}</div>`
      : `<div class="scell locked"><span class="em">${s[0]}</span></div>`).join('');
    setScreen('book', `
      <div class="top"><button class="ibtn" id="back" aria-label="Home"><span class="disc em">🏠</span></button><div class="mid">${A.mascotHTML('sm')}</div><div class="ibtn-spacer"></div></div>
      <div class="sgrid">${cells}</div>`);
    $('#back').addEventListener('click', home);
  });
}

/* ===================================================================== Boot */
A.boot = () => {
  load();
  const q = new URLSearchParams(location.search).get('theme');
  if(q && THEMES[q]){ S.settings.theme = q; save(); }
  applyTheme(S.settings.theme);
  TTS.init();
  document.addEventListener('contextmenu', e => e.preventDefault());
  home();
  if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
};
})();
