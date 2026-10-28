(function(){
'use strict';
/* ============================================================ constants & helpers */
var E = window.EDITION || {};                                   // per-edition settings, set in each edition's config.js
function ed(k, d){ return E[k] === undefined ? d : E[k]; }
var SELF = ed('mode', 'paced') === 'self';                      // self-paced: lessons, no calendar. paced: Day n of 45 by date
var LABEL = SELF ? 'Lesson' : 'Day';
var DAYS = 45, INTRO_DAYS = 37, TOTAL = WORDS.length;           // paced: ~6 new words a day for 37 days, then 8 days of review
var LS = ed('storage', 'dolch.v1');
var BUD = ed('budget', [270, 780, 1000]), EXTRA_BUD = ed('extraBudget', 420);   // review time budgets in seconds
var A = null;                                                   // the session being played (main quest or a replay)
try{ document.documentElement.style.setProperty('--accent', ed('accent', '#4c6fe0')); document.title = ed('title', 'Word Quest'); }catch(e){}
var INT = [0,1,2,4,7,12,20,35];                                 // days until a skill is due again, by box 0..7
var MASTER = 4;                                                 // box a skill must reach to count as "mastered"
var SK = ['r','s','w'];                                         // read, say, write
var SKNAME = {r:'Read', s:'Say', w:'Write'};
var STICKERS = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🦆','🦉','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐢','🐍','🐙','🦀','🐠','🐟','🐬','🐳','🦈','🐊','🐘','🐪','🐑','🐐','🐓'];
var $ = function(s){ return document.querySelector(s); };
var stage = $('#stage');
function rnd(n){ return Math.floor(Math.random()*n); }
function shuffle(a){ a = a.slice(); for(var i=a.length-1;i>0;i--){ var j=rnd(i+1), t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function pad2(n){ return (n<10?'0':'')+n; }
function ymd(d){ return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate()); }
function wait(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
function toast(t){ var el=$('#toast'); el.textContent=t; el.className='on'; clearTimeout(toast.t); toast.t=setTimeout(function(){ el.className=''; }, 2400); }
function el(html){ var d=document.createElement('div'); d.innerHTML=html; return d.firstElementChild; }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

/* ============================================================ storage */
var mem = null;
function load(){
  var raw = null; try{ raw = localStorage.getItem(LS); }catch(e){ raw = mem; }
  var s = null; try{ s = raw ? JSON.parse(raw) : null; }catch(e){ s = null; }
  if(!s) s = {name:ed('defaultName', 'Ale'), named:!ed('askName', false), start:ymd(new Date()), offset:0, words:{}, done:{}, gems:0, streak:0, lastDay:0, lastYmd:'', sess:null, rsess:null, per:ed('per', 6), kindle:null, sound:true, rate:0.85, grownupSay:false, mic:true};
  return s;
}
function save(){ var raw = JSON.stringify(S); mem = raw; try{ localStorage.setItem(LS, raw); }catch(e){} }
var S = load(); save();
/* Kindle Fire / Silk gets bigger touch targets automatically; the grown-up panel can force it on or off */
function isKindle(){ if(S.kindle === true || S.kindle === false) return S.kindle; return /Silk|KF[A-Z]{2,}|Kindle/i.test(navigator.userAgent) || /[?&]kindle=1/.test(location.search); }
function applyKindle(){ document.documentElement.className = isKindle() ? 'kindle' : ''; }
applyKindle();

function curLesson(){ var n = 1; while(S.done[n]) n++; return n; }
function dayNum(){
  if(SELF) return curLesson();
  var p = S.start.split('-'), st = new Date(+p[0], +p[1]-1, +p[2]), n = new Date();
  var a = new Date(n.getFullYear(), n.getMonth(), n.getDate());
  return Math.max(1, Math.round((a-st)/864e5) + 1 + (S.offset||0));
}
function rec(w){ return S.words[w] || null; }
function introduced(){ return WORDS.filter(function(x){ var r=rec(x.w); return r && r.i; }); }
function isMastered(w){ var r=rec(w); return !!(r && r.i && SK.every(function(k){ return r[k].b >= MASTER; })); }
function level(w){ var r=rec(w); if(!r||!r.i) return 'lock'; if(isMastered(w)) return 'l3'; var m=Math.min(r.r.b,r.s.b,r.w.b); return m>=2?'l2':(m>=1?'l1':'l0'); }
function intro(w, d){ if(!S.words[w]) S.words[w] = {i:d, r:{b:0,d:d}, s:{b:0,d:d}, w:{b:0,d:d}, ok:0, bad:0}; }

/* grade one skill of one word: right on the first try moves it up a box, wrong moves it down */
function grade(w, k, ok, d, noEcho){
  var r = S.words[w]; if(!r) return;
  if(k === 's' && ok && !noEcho) grade(w, 'r', true, d, true);   // reading a word aloud from print is also reading it
  var s = r[k];
  if(ok){ s.b = Math.min(7, s.b+1); r.ok++; } else { s.b = Math.max(0, s.b-1); r.bad++; }
  var iv = ok ? INT[s.b] : 1;
  if(!SELF && d >= 30) iv = Math.min(iv, Math.max(1, Math.floor((DAYS-d)/2)));   // squeeze the schedule in the last 2 weeks
  s.d = d + Math.max(1, iv);
}

/* ============================================================ sound & speech */
var AC = null;
function tone(f, t, len, type, vol){
  if(!S.sound) return;
  try{
    AC = AC || new (window.AudioContext||window.webkitAudioContext)();
    var o = AC.createOscillator(), g = AC.createGain();
    o.type = type||'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(vol||0.15, AC.currentTime+t); g.gain.exponentialRampToValueAtTime(0.001, AC.currentTime+t+len);
    o.connect(g); g.connect(AC.destination); o.start(AC.currentTime+t); o.stop(AC.currentTime+t+len+0.05);
  }catch(e){}
}
function sfx(k){
  if(k==='ok'){ tone(660,0,.14); tone(880,.12,.2); }
  else if(k==='bad'){ tone(220,0,.25,'triangle',.12); }
  else if(k==='win'){ [523,659,784,1047].forEach(function(f,i){ tone(f,i*.13,.25); }); }
  else if(k==='tap'){ tone(520,0,.06,'sine',.08); }
}
var TTS = {ok: ('speechSynthesis' in window) && (typeof SpeechSynthesisUtterance !== 'undefined'), voice:null};
function pickVoice(){
  var vs = []; try{ vs = speechSynthesis.getVoices(); }catch(e){}
  var en = vs.filter(function(v){ return /^en[-_]US/i.test(v.lang); });
  TTS.voice = en.filter(function(v){ return /female|samantha|google us|joanna|ivy|kendra|salli|allison/i.test(v.name); })[0] || en[0] || vs.filter(function(v){ return /^en/i.test(v.lang); })[0] || null;
}
if(TTS.ok){ pickVoice(); try{ speechSynthesis.onvoiceschanged = pickVoice; }catch(e){} }
function speak(text, rate){
  return new Promise(function(res){
    if(!TTS.ok || !S.sound){ res(); return; }
    try{ speechSynthesis.cancel(); }catch(e){}
    var u = new SpeechSynthesisUtterance(text), done = false;
    u.lang = 'en-US'; if(TTS.voice) u.voice = TTS.voice; u.rate = rate || S.rate; u.pitch = 1.05;
    function fin(){ if(!done){ done = true; res(); } }
    u.onend = fin; u.onerror = fin; setTimeout(fin, 1800 + text.length*150);
    try{ speechSynthesis.resume(); speechSynthesis.speak(u); }catch(e){ fin(); }
  });
}
function sayWord(w, rate){ return speak(PRON[w] || w, rate || S.rate*0.9); }
function saySent(w){ return speak(WORDS[WIDX[w]].s, S.rate); }
function spellOut(w){ return speak(w.toUpperCase().split('').join(', '), S.rate*0.8).then(function(){ return wait(250); }).then(function(){ return sayWord(w); }); }

/* optional: record her voice for 3 seconds and play it back (never stored, never sent anywhere) */
var Rec = {ok: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder)};
function recordPlay(btn){
  if(!Rec.ok || Rec.busy) return;
  Rec.busy = true; var old = btn.textContent; btn.textContent = '🔴 Say it now!';
  navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){
    var mr = new MediaRecorder(stream), chunks = [];
    mr.ondataavailable = function(e){ chunks.push(e.data); };
    mr.onstop = function(){
      stream.getTracks().forEach(function(t){ t.stop(); });
      btn.textContent = '▶ Listen'; var a = new Audio(URL.createObjectURL(new Blob(chunks)));
      a.onended = function(){ btn.textContent = old; Rec.busy = false; };
      a.onerror = function(){ btn.textContent = old; Rec.busy = false; };
      a.play().catch(function(){ btn.textContent = old; Rec.busy = false; });
    };
    mr.start(); setTimeout(function(){ try{ mr.stop(); }catch(e){} }, 3000);
  }).catch(function(){ Rec.ok = false; Rec.busy = false; btn.style.display = 'none'; toast('Microphone is off. That is okay!'); });
}

/* ============================================================ confetti */
function confetti(set, n){
  set = set || ['⭐','🎉','💎','✨','🎈'];
  for(var i=0;i<(n||26);i++){
    var d = document.createElement('div'); d.className = 'fall'; d.textContent = set[rnd(set.length)];
    d.style.left = rnd(96)+'vw'; d.style.animationDelay = (Math.random()*1.2)+'s'; d.style.fontSize = (28+rnd(30))+'px';
    document.body.appendChild(d); (function(x){ setTimeout(function(){ x.remove(); }, 4200); })(d);
  }
}

/* ============================================================ handwriting pad */
function Pad(parent, word, guide){
  var W = 900, H = 340;
  var wrap = document.createElement('div'); wrap.className = 'pad';
  var gc = document.createElement('canvas'), ic = document.createElement('canvas');
  gc.width = ic.width = W; gc.height = ic.height = H; wrap.appendChild(gc); wrap.appendChild(ic); parent.appendChild(wrap);
  var g = gc.getContext('2d'), p = ic.getContext('2d');
  var FONT = 'Andika,"Comic Sans MS",sans-serif', size = 200;
  g.font = 'bold '+size+'px '+FONT; var mw = g.measureText(word).width;
  if(mw > W-80) size = Math.floor(size*(W-80)/mw);
  var base = Math.round(H*0.74), ink = false, strokes = 0, last = null;
  function fontOn(c){ c.font = 'bold '+size+'px '+FONT; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.lineJoin = 'round'; }
  function lines(){
    g.clearRect(0,0,W,H); g.strokeStyle = '#c4d2fb'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(20,base); g.lineTo(W-20,base); g.stroke();
    g.setLineDash([10,10]); g.beginPath(); g.moveTo(20,base-size*.36); g.lineTo(W-20,base-size*.36); g.stroke();
    g.beginPath(); g.moveTo(20,base-size*.72); g.lineTo(W-20,base-size*.72); g.stroke(); g.setLineDash([]);
  }
  function drawGuide(){
    lines(); if(!guide) return;
    fontOn(g); g.fillStyle = g.strokeStyle = '#d9d3fa'; g.lineWidth = size*.05; g.strokeText(word, W/2, base); g.fillText(word, W/2, base);
  }
  drawGuide();
  p.lineCap = p.lineJoin = 'round'; p.strokeStyle = '#4c6fe0'; p.lineWidth = Math.max(14, size*.13);
  function pos(e){ var r = ic.getBoundingClientRect(); return [(e.clientX-r.left)*W/r.width, (e.clientY-r.top)*H/r.height]; }
  ic.addEventListener('pointerdown', function(e){ e.preventDefault(); try{ ic.setPointerCapture(e.pointerId); }catch(x){} last = pos(e); strokes++; ink = true;
    p.beginPath(); p.arc(last[0], last[1], p.lineWidth/2, 0, 6.3); p.fillStyle = '#4c6fe0'; p.fill(); });
  ic.addEventListener('pointermove', function(e){ if(!last) return; e.preventDefault(); var q = pos(e); p.beginPath(); p.moveTo(last[0],last[1]); p.lineTo(q[0],q[1]); p.stroke(); last = q; });
  function up(){ last = null; }
  ic.addEventListener('pointerup', up); ic.addEventListener('pointercancel', up);
  var api = {
    hasInk: function(){ return ink; },
    clear: function(){ p.clearRect(0,0,W,H); ink = false; strokes = 0; },
    /* share of the letter shapes that she covered, and how much of her ink fell far outside them */
    score: function(){
      var a = document.createElement('canvas'), b = document.createElement('canvas'); a.width = b.width = W; a.height = b.height = H;
      var ac = a.getContext('2d'), bc = b.getContext('2d');
      fontOn(ac); ac.fillStyle = ac.strokeStyle = '#000'; ac.lineWidth = size*.05; ac.strokeText(word,W/2,base); ac.fillText(word,W/2,base);
      fontOn(bc); bc.fillStyle = bc.strokeStyle = '#000'; bc.lineWidth = size*.4; bc.strokeText(word,W/2,base); bc.fillText(word,W/2,base);
      var A = ac.getImageData(0,0,W,H).data, B = bc.getImageData(0,0,W,H).data, I = p.getImageData(0,0,W,H).data;
      var tot = 0, cov = 0, inkN = 0, stray = 0;
      for(var y=0;y<H;y+=2) for(var x=0;x<W;x+=2){ var k = (y*W+x)*4+3;
        if(A[k] > 100){ tot++; if(I[k] > 100) cov++; }
        if(I[k] > 100){ inkN++; if(B[k] < 100) stray++; } }
      return {cover: tot ? cov/tot : 0, stray: inkN ? stray/inkN : 1, ink: inkN};
    },
    revealModel: function(){ guide = true; drawGuide(); }
  };
  return api;
}

/* ============================================================ shell: top bar & screens */
function bar(show){ $('#bar').hidden = !show; }
function gemsUI(){ $('#gems').textContent = '💎 ' + S.gems; }
function setProg(i, n){ var f = n ? Math.min(1, i/n) : 0; $('#progfill').style.width = (f*100)+'%'; $('#owl').style.left = (f*100)+'%'; }
function show(node){ stage.innerHTML = ''; stage.appendChild(node); stage.scrollTop = 0; }
function mk(cls, html){ var d = document.createElement('div'); d.className = cls||''; d.innerHTML = html||''; return d; }
function btn(label, cls, fn){ var b = document.createElement('button'); b.className = 'btn '+(cls||''); b.innerHTML = label; b.addEventListener('click', function(){ sfx('tap'); fn(b); }); return b; }

function targetIntroduced(d){ return Math.min(TOTAL, Math.ceil(Math.min(d, INTRO_DAYS)*TOTAL/INTRO_DAYS)); }
function newWordsFor(d){
  if(SELF) return WORDS.filter(function(x){ return !rec(x.w); }).slice(0, S.per || ed('per', 5)).map(function(x){ return x.w; });
  var have = introduced().length, need = Math.max(0, Math.min(12, targetIntroduced(d) - have));
  return WORDS.filter(function(x){ return !rec(x.w); }).slice(0, need).map(function(x){ return x.w; });
}

/* ------------------------------------------------------------ home */
function lessonWords(n){ return WORDS.filter(function(x){ var r = rec(x.w); return r && r.i === n; }).map(function(x){ return x.w; }); }
function tileCount(d){
  if(!SELF) return DAYS;
  var unmet = WORDS.filter(function(x){ return !rec(x.w); }).length;
  return unmet ? (d - 1) + Math.ceil(unmet / (S.per || ed('per', 5))) : d;
}
function askName(){
  bar(false); var root = mk('center');
  root.appendChild(mk('', '<div style="font-size:90px" class="pop">' + ed('hero', '🦉') + '</div><h1>Who is playing?</h1>'));
  var inp = document.createElement('input'); inp.className = 'pick'; inp.type = 'text'; inp.maxLength = 20; inp.placeholder = 'Type a name'; root.appendChild(inp);
  root.appendChild(btn("Let's go! ▶", 'green', function(){ S.name = (inp.value || '').trim().slice(0, 20) || 'Friend'; S.named = true; save(); home(); }));
  root.appendChild(mk('sale-note', 'A grown-up can change this later: press and hold the ⚙ on the home screen.'));
  show(root);
}
function askReplay(n){
  var ws = lessonWords(n), m = mk('modal'), c = mk('card');
  c.innerHTML = '<div style="font-size:72px">' + STICKERS[(n - 1) % STICKERS.length] + '</div><h2>' + LABEL + ' ' + n + '</h2>' +
    (ws.length ? '<div class="steps" style="margin:6px 0">' + esc(ws.join(', ')) + '</div>' : '') + '<div class="bubble" style="margin:12px 0">Play it again?</div>';
  var r = mk('row');
  r.appendChild(btn('🔁 Yes!', 'green', function(){ m.remove(); startSession(false, n); }));
  r.appendChild(btn('Not now', 'gray', function(){ m.remove(); }));
  c.appendChild(r); m.appendChild(c); document.body.appendChild(m);
}
function home(){
  if(ed('askName', false) && S.named === false) return askName();
  bar(false); var d = dayNum(), done = !SELF && !!S.done[d], N = tileCount(d);
  var intr = introduced().length, mast = WORDS.filter(function(x){ return isMastered(x.w); }).length;
  var root = mk('center');
  var resume = S.sess && S.sess.day === d && S.sess.i < S.sess.q.length;
  var fresh = newWordsFor(d);
  var title = SELF ? (fresh.length ? 'Lesson ' + d + ' of ' + N : 'Review lesson') : (d > DAYS ? 'Bonus day!' : 'Day ' + d + ' of ' + DAYS);
  var sub = done ? 'You finished today! Great job, ' + esc(S.name) + '!' : (fresh.length ? fresh.length + ' new words to learn' + (SELF ? '' : ' today') : 'Review time: let\'s keep your words strong!');
  root.appendChild(mk('', '<div style="font-size:84px" class="pop">' + ed('hero', '🦉') + '</div><h1>Hi ' + esc(S.name) + '!</h1><div class="bubble">' + title + '<br><span style="font-size:20px">' + sub + '</span></div>'));
  var row = mk('row');
  if(!done || resume) row.appendChild(btn(resume ? '▶ Keep going' : (SELF && !fresh.length ? '▶ Review' : '▶ Play ' + LABEL + ' ' + Math.min(d, SELF ? d : DAYS)), 'green', function(){ startSession(false); }));
  if(done || (SELF && intr)) row.appendChild(btn('⭐ Extra practice', 'orange', function(){ startSession(true); }));
  row.appendChild(btn('💎 My Words', 'pink', treasure));
  root.appendChild(row);
  var stats = mk('row');
  [[intr + '/' + TOTAL, 'words met'], [mast, 'words mastered'], ['🔥 ' + S.streak, 'day streak'], ['💎 ' + S.gems, 'gems']].forEach(function(s){ stats.appendChild(mk('stat', '<b>' + s[0] + '</b>' + s[1])); });
  root.appendChild(stats);
  root.appendChild(mk('steps', 'Tap a finished ' + LABEL.toLowerCase() + ' to play it again!'));
  var path = mk('path');
  for(var i=1;i<=N;i++){
    (function(i){
      var isDone = !!S.done[i], c = mk('day' + (isDone ? ' done go' : '') + (i === d ? ' today go' : ''));
      c.innerHTML = '<span>' + (isDone ? STICKERS[(i - 1) % STICKERS.length] + '<small>' + i + '</small>' : i) + '</span>';
      if(isDone) c.addEventListener('click', function(){ sfx('tap'); askReplay(i); });
      else if(i === d) c.addEventListener('click', function(){ sfx('tap'); startSession(false); });
      path.appendChild(c);
    })(i);
  }
  root.appendChild(path);
  var gear = el('<button class="round" style="position:fixed;right:10px;bottom:10px;width:46px;height:46px;font-size:20px;opacity:.55" aria-label="Grown-ups">⚙</button>');
  var t = null; function dn(){ t = setTimeout(function(){ parentPanel(); }, 2500); } function upG(){ clearTimeout(t); }
  gear.addEventListener('pointerdown', dn); gear.addEventListener('pointerup', upG); gear.addEventListener('pointerleave', upG);
  gear.addEventListener('click', function(){ toast('Grown-ups: press and hold for 3 seconds'); });
  root.appendChild(gear);
  show(root);
}

/* ------------------------------------------------------------ treasure box (word wall) */
function treasure(){
  bar(false); var root = mk('');
  root.appendChild(mk('', '<h1>💎 My Words</h1><div class="steps" style="text-align:center">Tap a gem to hear the word. Gems get shinier as you learn them. Gold means you know it!</div>'));
  var top = mk('row'); top.style.margin = '10px 0'; top.appendChild(btn('⬅ Back', 'gray small', home)); root.appendChild(top);
  GRADES.forEach(function(gr){
    root.appendChild(mk('', '<h2 style="margin-top:18px">' + gr.name + '</h2>'));
    var wall = mk('wall');
    gr.words.forEach(function(x){
      var w = x[0], b = document.createElement('button'); b.className = 'gem ' + level(w); b.textContent = rec(w) ? w : '?';
      b.addEventListener('click', function(){ if(rec(w)){ sfx('tap'); sayWord(w); } else toast('Not learned yet!'); });
      wall.appendChild(b);
    });
    root.appendChild(wall);
  });
  show(root);
}

/* ============================================================ session: building the quest */
var COST = {meet:70, read:8, sent:12, say:18, spell:22, write:40};          // rough seconds a 6-year-old needs per task
function costOf(c, d){ return c.k === 'r' ? COST.read : c.k === 's' ? COST.say : (rec(c.w).w.b >= 3 ? COST.write : COST.spell); }
/* review: weakest first, cheap tasks first; fill a time budget (seconds). One task per word before any word gets a second. */
function pickReview(d, budget, excludeSet){
  var cands = [];
  introduced().forEach(function(x){
    var r = rec(x.w); if(excludeSet[x.w]) return;
    SK.forEach(function(k){ if(r[k].d <= d){ var c = {w:x.w, k:k, b:r[k].b, o:d - r[k].d + Math.random()}; c.cost = costOf(c, d); cands.push(c); } });
  });
  cands.sort(function(a,b){ return a.b - b.b || b.o - a.o; });
  var picked = [], used = {}, spent = 0;
  function take(c){ if(spent + c.cost <= budget){ spent += c.cost; picked.push(c); return true; } return false; }
  cands.forEach(function(c){ if(!used[c.w] && take(c)) used[c.w] = 1; });
  cands.forEach(function(c){ if(picked.indexOf(c) < 0) take(c); });
  return picked;
}
function taskFor(c){
  var r = rec(c.w);
  if(c.k === 'r') return [ed('sent', true) && r.r.b >= 2 && Math.random() < 0.5 ? 'sent' : 'read', c.w];
  if(c.k === 's') return ['say', c.w];
  return [ed('write', true) && r.w.b >= 3 && Math.random() < 0.6 ? 'write' : 'spell', c.w];
}
function noRepeats(q){
  for(var i=1;i<q.length;i++) if(q[i][1] === q[i-1][1]){ for(var j=i+1;j<q.length;j++) if(q[j][1] !== q[i-1][1] && (j+1>=q.length || q[j][1] !== q[i][1])){ var t=q[i]; q[i]=q[j]; q[j]=t; break; } }
  return q;
}
/* meet, read, say, spell in groups of three words */
function chunked(ws){
  var q = [];
  for(var i=0;i<ws.length;i+=3){
    var ch = ws.slice(i, i+3);
    ch.forEach(function(w){ q.push(['meet', w]); });
    shuffle(ch).forEach(function(w){ q.push(['read', w]); });
    shuffle(ch).forEach(function(w){ q.push(['say', w]); });
    shuffle(ch).forEach(function(w){ q.push(['spell', w]); });
  }
  return q;
}
/* redo a finished day or lesson: its words again; a review-only day gets extra practice instead */
function buildReplay(n, d){ var ws = lessonWords(n); return ws.length ? chunked(ws) : buildQueue(d, true); }
function buildQueue(d, extra){
  var q = [], nw = extra ? [] : newWordsFor(d), ex = {};
  nw.forEach(function(w){ ex[w] = 1; });
  chunked(nw).forEach(function(t){ q.push(t); });
  var budget = extra ? EXTRA_BUD : (nw.length ? BUD[0] : (!SELF && d >= DAYS ? BUD[2] : BUD[1]));
  var rv = pickReview(d, budget, ex);
  if(extra) rv = rv.sort(function(a,b){ return a.b - b.b; });
  noRepeats(shuffle(rv.map(taskFor))).forEach(function(t){ q.push(t); });
  return q;
}
function startSession(extra, replayN){
  var d = dayNum(), slot = replayN ? 'rsess' : 'sess', cur = S[slot];
  var same = cur && cur.i < cur.q.length && (replayN ? cur.replay === replayN : (cur.day === d && !cur.replay && !!cur.extra === !!extra));
  if(!same){
    cur = S[slot] = {day:d, extra:!!extra || !!replayN, replay:replayN || 0, q:replayN ? buildReplay(replayN, d) : buildQueue(d, extra), i:0, gems:0, newW:0};
    save();
  }
  if(!cur.q.length){ toast('Nothing to practice yet!'); S[slot] = null; return home(); }
  A = cur; bar(true); gemsUI(); runNext();
}

/* ------------------------------------------------------------ session driver */
function runNext(){
  var s = A; setProg(s.i, s.q.length);
  if(s.i >= s.q.length) return finish();
  var t = s.q[s.i], fn = ACT[t[0]];
  stage.scrollTop = 0; stage.dataset.i = s.i; var fired = false;
  fn(t[1], t[2], function(ok){ if(fired) return; fired = true; complete(t, ok); });
}
var SKILL_OF = {read:'r', sent:'r', say:'s', spell:'w', write:'w'};
function complete(t, ok){
  var s = A, k = SKILL_OF[t[0]], d = s.day;
  if(t[0] === 'meet'){ intro(t[1], d); if(!s.replay) s.newW++; }
  else if(k && !t[2]){
    /* a replay only moves a skill up when it was due anyway, so repeating a day cannot rush the spacing */
    var r = S.words[t[1]], skip = s.replay && ok && r && r[k].d > d;
    if(!skip) grade(t[1], k, ok, d);
    if(!ok) s.q.push([t[0] === 'sent' ? 'read' : t[0], t[1], 1]);
  }
  if(ok && t[0] !== 'meet'){ S.gems++; s.gems++; gemsUI(); }
  s.i++; save();
  if(ok && t[0] !== 'meet'){ sfx('ok'); }
  setTimeout(runNext, ok ? 650 : 300);
}
function finish(){
  var s = A, d = s.day, rp = s.replay; bar(false);
  if(!s.extra){
    S.done[d] = true;
    if(SELF){
      var today = ymd(new Date()); if(S.lastYmd !== today){ var y = new Date(); y.setDate(y.getDate() - 1); S.streak = (S.lastYmd === ymd(y)) ? S.streak + 1 : 1; S.lastYmd = today; }
    } else { if(S.lastDay === d - 1 || S.lastDay === 0) S.streak++; else if(S.lastDay !== d) S.streak = 1; S.lastDay = d; }
  }
  var intr = introduced().length, newW = s.newW, g = s.gems;
  S[rp ? 'rsess' : 'sess'] = null; A = null; save(); sfx('win'); confetti();
  var n = rp || d, st = STICKERS[(Math.min(n, SELF ? 999 : DAYS) - 1) % STICKERS.length], all = intr >= TOTAL && newW > 0;
  var head = rp ? 'Great job playing ' + LABEL + ' ' + rp + ' again!' : s.extra ? 'Great extra practice!' : all ? 'YOU LEARNED ALL ' + TOTAL + ' WORDS!' : (!SELF && d >= DAYS ? 'YOU DID IT! Day ' + DAYS + '!' : LABEL + ' ' + (SELF ? d : Math.min(d, DAYS)) + ' complete!');
  var root = mk('center');
  root.appendChild(mk('', '<div style="font-size:120px" class="pop">' + st + '</div><h1>' + head + '</h1>'));
  root.appendChild(mk('bubble', (newW ? 'You learned <b>' + newW + '</b> new words!<br>' : '') + 'You know <b>' + intr + '</b> of ' + TOTAL + ' words.<br>💎 +' + g + (s.extra ? '' : ' &nbsp; 🔥 ' + S.streak + ' day streak')));
  speak('Great job, ' + S.name + '! You finished!');
  var row = mk('row'); row.appendChild(btn('🏠 Home', 'green', home)); row.appendChild(btn('💎 My Words', 'pink', treasure)); root.appendChild(row);
  show(root);
}
$('#btnHome').addEventListener('click', function(){
  try{ speechSynthesis.cancel(); }catch(e){}
  save(); home(); toast('Saved! Tap Keep going to continue.');
});

/* ============================================================ activities */
var ACT = {};

/* shared bits */
function header(text, hearFn){
  var h = mk('row'); h.style.margin = '6px 0 10px';
  if(hearFn){ var b = btn('🔊', 'orange small', hearFn); b.setAttribute('aria-label', 'Hear it'); h.appendChild(b); }
  if(text) h.appendChild(mk('bubble', text));
  return h;
}
function distractors(w, n){
  var pool = introduced().map(function(x){ return x.w; }), cur = WORDS[WIDX[w]];
  var extra = WORDS.map(function(x){ return x.w; });
  pool = pool.concat(extra.slice(0, 40));     // makes sure early days still have enough options
  var seen = {}; seen[w] = 1;
  pool = pool.filter(function(x){ if(seen[x]) return false; seen[x] = 1; return true; });
  var scored = pool.map(function(x){ return {x:x, s:(x[0]===w[0]?2:0) + (Math.abs(x.length-w.length)<=1?1:0) + Math.random()*1.6}; });
  scored.sort(function(a,b){ return b.s - a.s; });
  return scored.slice(0, n).map(function(o){ return o.x; });
}

/* ---- MEET: see it, hear it, spell it out, say it, trace it twice ---- */
ACT.meet = function(w, _, done){
  var x = WORDS[WIDX[w]], root = mk('center'), step = 0;
  function view(){
    root.innerHTML = '';
    if(step === 0){
      root.appendChild(mk('steps', '⭐ A new word!'));
      root.appendChild(mk('big pop', esc(w)));
      var s = mk('bubble sent', x.s.replace(new RegExp('\\b(' + w.replace("'", "['’]") + ')\\b', 'i'), '<b>$1</b>')); root.appendChild(s);
      var r = mk('row');
      r.appendChild(btn('🔊 Hear it', 'orange', function(){ sayWord(w); }));
      r.appendChild(btn('🔤 Spell it', 'pink', function(){ spellOut(w); }));
      r.appendChild(btn('📖 Sentence', 'gray', function(){ saySent(w); }));
      root.appendChild(r);
      root.appendChild(btn('Next ▶', 'green', function(){ step = 1; view(); }));
      sayWord(w).then(function(){ return wait(300); });
    } else if(step === 1){
      root.appendChild(mk('steps', '🗣 Now YOU say it!'));
      root.appendChild(mk('big', esc(w)));
      var r2 = mk('row');
      r2.appendChild(btn('🔊 Hear it', 'orange', function(){ sayWord(w); }));
      if(Rec.ok && S.mic){ r2.appendChild(btn('🎤 Record me', 'pink', function(b){ recordPlay(b); })); }
      root.appendChild(r2);
      root.appendChild(btn('I said it! ✅', 'green', function(){ step = 2; view(); }));
      sayWord(w, S.rate*0.7);
    } else {
      var n = step - 1;
      root.appendChild(mk('steps', '✏️ Trace it with your finger! (' + n + ' of 2)'));
      var pad = Pad(root, w, true), row = mk('row');
      row.appendChild(btn('🔊', 'orange small', function(){ sayWord(w); }));
      row.appendChild(btn('Clear', 'gray small', function(){ pad.clear(); }));
      var ok = btn('Done ✅', 'green', function(){
        var sc = pad.score();
        if(!pad.hasInk() || sc.cover < 0.5 || sc.stray > 0.45){ sfx('bad'); toast('Trace all the letters, slowly!'); return; }
        sfx('ok'); if(step === 3){ confetti(['⭐','✨'], 10); done(true); } else { step = 3; view(); }
      });
      row.appendChild(ok); root.appendChild(row);
    }
  }
  show(root); view();
};

/* ---- READ: hear a word, pick it from four ---- */
ACT.read = function(w, retry, done){
  var root = mk('center'), first = true, wrong = 0;
  root.appendChild(header('Tap the word you hear!', function(){ sayWord(w); }));
  var grid = mk('opts');
  shuffle([w].concat(distractors(w, ed('options', 4) - 1))).forEach(function(o){
    var b = document.createElement('button'); b.className = 'opt'; b.textContent = o;
    b.addEventListener('click', function(){
      if(o === w){
        b.className = 'opt good'; if(wrong >= 2) speak('This word is ' + (PRON[w]||w)); done(first && wrong === 0);
        grid.style.pointerEvents = 'none';
      } else { b.className = 'opt bad'; b.disabled = true; wrong++; first = false; sfx('bad'); sayWord(w); }
    });
    grid.appendChild(b);
  });
  root.appendChild(grid); show(root); sayWord(w);
};

/* ---- SENT: find the word inside a sentence ---- */
ACT.sent = function(w, retry, done){
  var x = WORDS[WIDX[w]], root = mk('center'), wrong = 0;
  root.appendChild(header('Find the word <b style="color:#e0457b">' + esc(w) + '</b> in the sentence!', function(){ sayWord(w); }));
  var box = mk('card'); box.style.textAlign = 'center';
  x.s.split(' ').forEach(function(tok){
    var clean = tok.replace(/[.,?!]/g, ''), b = document.createElement('button'); b.className = 'chip'; b.textContent = tok;
    b.addEventListener('click', function(){
      if(clean.toLowerCase() === w.toLowerCase()){ b.className = 'chip good'; box.style.pointerEvents = 'none'; done(wrong === 0); }
      else { b.className = 'chip bad'; wrong++; sfx('bad'); setTimeout(function(){ b.className = 'chip'; }, 600); }
    });
    box.appendChild(b);
  });
  root.appendChild(box); show(root); sayWord(w);
};

/* ---- SAY: look, listen, say it out loud, then read the whole sentence ---- */
ACT.say = function(w, retry, done){
  var x = WORDS[WIDX[w]], root = mk('center'), helped = false, heard = false;
  function grownup(label, fn){
    if(!S.grownupSay) return btn(label, 'green', fn);
    var b = btn('Grown-up: tap to confirm ✅', 'green', function(){}), t = null, go = function(){ t = setTimeout(function(){ fn(); }, 800); };
    b.onclick = null; b.addEventListener('pointerdown', go); b.addEventListener('pointerup', function(){ clearTimeout(t); }); b.addEventListener('pointerleave', function(){ clearTimeout(t); });
    return b;
  }
  function stepWord(){
    root.innerHTML = '';
    root.appendChild(mk('steps', '🗣 Read this word out loud!'));
    root.appendChild(mk('big', esc(w)));
    var r = mk('row');
    r.appendChild(btn('🔊 Check it', 'orange', function(){ heard = true; sayWord(w); }));
    r.appendChild(btn('🆘 Help me', 'pink', function(b){ helped = true; heard = true; spellOut(w); }));
    if(Rec.ok && S.mic) r.appendChild(btn('🎤 Record me', 'gray', function(b){ recordPlay(b); }));
    root.appendChild(r);
    root.appendChild(grownup('I said it! ✅', function(){ stepSent(); }));
  }
  function stepSent(){
    root.innerHTML = '';
    root.appendChild(mk('steps', '📖 Now read the sentence!'));
    root.appendChild(mk('bubble sent', x.s.replace(new RegExp('\\b(' + w.replace("'", "['’]") + ')\\b', 'i'), '<b>$1</b>')));
    var r = mk('row');
    r.appendChild(btn('🔊 Hear it', 'orange', function(){ saySent(w); }));
    r.appendChild(btn('Done ✅', 'green', function(){ done(!helped); }));
    root.appendChild(r);
  }
  show(root); stepWord();
};

/* ---- SPELL: build the word from letter tiles ---- */
ACT.spell = function(w, retry, done){
  var r = rec(w), model = !!(r && r.w.b < 2) || !!retry || ed('alwaysModel', false), root = mk('center'), wrong = 0, helped = false, pos = 0, letters = w.split('');
  root.appendChild(header('Build the word you hear!', function(){ sayWord(w); }));
  var modelEl = mk('big', esc(w)); modelEl.style.fontSize = 'min(18vw,90px)'; modelEl.style.visibility = model ? 'visible' : 'hidden'; root.appendChild(modelEl);
  var slots = mk('slots'); var sl = letters.map(function(){ var s = mk('slot', ''); slots.appendChild(s); return s; }); root.appendChild(slots);
  var abc = 'abcdefghijklmnoprstuwy', extra = [];
  while(extra.length < 2){ var c = abc[rnd(abc.length)]; if(letters.indexOf(c) < 0 && extra.indexOf(c) < 0) extra.push(c); }
  var tiles = mk('tiles'), tl = shuffle(letters.concat(extra));
  var tb = tl.map(function(c){
    var b = document.createElement('button'); b.className = 'tile'; b.textContent = c;
    b.addEventListener('click', function(){
      if(c === letters[pos]){
        sl[pos].textContent = c; sl[pos].className = 'slot on'; sfx('tap'); b.className = 'tile used'; pos++;
        tb.forEach(function(t){ t.classList.remove('hint'); });
        if(pos === letters.length){ tiles.style.pointerEvents = 'none'; sayWord(w); done(wrong === 0 && !helped); }
      } else {
        wrong++; b.classList.add('bad'); sfx('bad'); setTimeout(function(){ b.classList.remove('bad'); }, 400);
        if(wrong >= 2){ tb.forEach(function(t){ if(t.textContent === letters[pos] && t.className.indexOf('used') < 0) t.classList.add('hint'); }); }
      }
    });
    tiles.appendChild(b); return b;
  });
  root.appendChild(tiles);
  if(!model){ root.appendChild(btn('👀 Peek', 'gray small', function(b){ helped = true; modelEl.style.visibility = 'visible'; b.disabled = true; })); }
  show(root); sayWord(w);
};

/* ---- WRITE: look, cover, write from memory, check ---- */
ACT.write = function(w, retry, done){
  var root = mk('center');
  function look(){
    root.innerHTML = '';
    root.appendChild(mk('steps', '👀 Look at the word. Remember it!'));
    root.appendChild(mk('big', esc(w)));
    var r = mk('row');
    r.appendChild(btn('🔊', 'orange small', function(){ sayWord(w); }));
    r.appendChild(btn('Got it! Hide it ✅', 'green', writeIt)); root.appendChild(r);
    sayWord(w);
  }
  function writeIt(){
    root.innerHTML = '';
    root.appendChild(mk('steps', '✏️ Write the word you remember!'));
    var pad = Pad(root, w, false), row = mk('row');
    row.appendChild(btn('🔊', 'orange small', function(){ sayWord(w); }));
    row.appendChild(btn('Clear', 'gray small', function(){ pad.clear(); }));
    row.appendChild(btn('Done ✅', 'green', function(){
      if(!pad.hasInk() || pad.score().ink < 400){ toast('Write the word first!'); return; }
      check(pad);
    }));
    root.appendChild(row);
  }
  function check(pad){
    root.innerHTML = '';
    root.appendChild(mk('steps', '🔍 Did you get it? Compare!'));
    var cmp = mk('card'); cmp.style.textAlign = 'center';
    cmp.appendChild(mk('big', esc(w))); root.appendChild(cmp);
    root.appendChild(mk('bubble', 'Do all the letters match?'));
    var row = mk('row');
    row.appendChild(btn('👍 Yes!', 'green', function(){ done(true); }));
    row.appendChild(btn('🔄 Not yet', 'orange', function(){ sayWord(w); done(false); }));
    root.appendChild(row);
  }
  show(root); look();
};

/* ============================================================ grown-up panel */
function parentPanel(){
  bar(false);
  var root = mk(''), p = mk('parent'), d = dayNum();
  var intr = introduced(), mast = intr.filter(function(x){ return isMastered(x.w); }).length;
  var exp = SELF ? 0 : targetIntroduced(Math.min(d, INTRO_DAYS));
  p.innerHTML = '<h2>Grown-ups</h2>' +
    '<p><b>' + (SELF ? 'Lesson ' + d : 'Day ' + d + ' of ' + DAYS) + '.</b> Words met: <b>' + intr.length + '</b> of ' + TOTAL + (SELF ? '' : ' (plan says ' + exp + ' by today)') + '. Mastered (read, say and write all solid): <b>' + mast + '</b>.</p>' +
    '<label>Child\'s name <input type="text" id="pName" value="' + esc(S.name) + '"></label>' +
    (SELF ? '<label>New words per lesson <select id="pPer">' + [2,3,4,5,6,8].map(function(n){ return '<option' + (n === (S.per || ed('per', 5)) ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></label>'
          : '<label>Day 1 was <input type="date" id="pStart" value="' + S.start + '"></label>') +
    '<label>Kindle / tablet mode (bigger buttons) <select id="pKindle"><option value="auto"' + (S.kindle == null ? ' selected' : '') + '>Auto</option><option value="on"' + (S.kindle === true ? ' selected' : '') + '>On</option><option value="off"' + (S.kindle === false ? ' selected' : '') + '>Off</option></select></label>' +
    '<label>Voice speed <input type="range" id="pRate" min="0.5" max="1.1" step="0.05" value="' + S.rate + '"></label>' +
    '<label>Sounds and voice <input type="checkbox" id="pSound"' + (S.sound ? ' checked' : '') + '></label>' +
    '<label>Grown-up must confirm "I said it" (press and hold) <input type="checkbox" id="pGU"' + (S.grownupSay ? ' checked' : '') + '></label>' +
    '<label>Show the microphone button <input type="checkbox" id="pMic"' + (S.mic ? ' checked' : '') + '></label>';
  var row = mk('row'); row.style.margin = '10px 0';
  row.appendChild(btn('Save', 'green small', function(){
    S.name = ($('#pName').value || ed('defaultName', 'Friend')).slice(0, 20); S.rate = +$('#pRate').value;
    if($('#pStart')) S.start = $('#pStart').value || S.start; if($('#pPer')) S.per = +$('#pPer').value;
    var kv = $('#pKindle').value; S.kindle = kv === 'on' ? true : kv === 'off' ? false : null; applyKindle();
    S.sound = $('#pSound').checked; S.grownupSay = $('#pGU').checked; S.mic = $('#pMic').checked; save(); home(); toast('Saved');
  }));
  row.appendChild(btn('Cancel', 'gray small', home));
  row.appendChild(btn('Test voice', 'orange small', function(){ S.rate = +$('#pRate').value; speak('Hello ' + ($('#pName').value || 'there') + '. The word is little.'); }));
  p.appendChild(row);
  var wk = intr.map(function(x){ var r = rec(x.w); return {w:x.w, m:Math.min(r.r.b, r.s.b, r.w.b), bad:r.bad}; }).sort(function(a,b){ return a.m - b.m || b.bad - a.bad; }).slice(0, 12);
  p.appendChild(mk('', '<h2 style="text-align:left;font-size:20px">Words needing the most help</h2>' + (wk.length ? wk.map(function(x){ return '<b>' + esc(x.w) + '</b>'; }).join(', &nbsp;') : 'None yet.')));
  var html = '<h2 style="text-align:left;font-size:20px;margin-top:18px">All words</h2><table><tr><th>Word</th><th>Read</th><th>Say</th><th>Write</th></tr>';
  function dots(b){ var s = ''; for(var i=0;i<MASTER;i++) s += '<span class="dot' + (i < b ? (b >= MASTER ? ' m' : ' p') : '') + '"></span>'; return s; }
  WORDS.forEach(function(x){ var r = rec(x.w); html += '<tr><td>' + esc(x.w) + '</td>' + (r ? SK.map(function(k){ return '<td>' + dots(r[k].b) + '</td>'; }).join('') : '<td colspan=3 style="color:#aab">not yet met</td>') + '</tr>'; });
  p.appendChild(mk('', html + '</table>'));
  var dng = mk('row'); dng.style.margin = '16px 0';
  dng.appendChild(btn('Erase all progress', 'pink small', function(b){
    if(b.dataset.sure){ try{ localStorage.removeItem(LS); }catch(e){} mem = null; S = load(); save(); home(); toast('Progress erased'); }
    else { b.dataset.sure = 1; b.textContent = 'Tap again to erase everything'; }
  }));
  p.appendChild(dng); root.appendChild(p); show(root);
}

/* ============================================================ start */
try{ document.fonts.load('20px Andika'); document.fonts.load('bold 20px Andika'); }catch(e){}
/* test hook: plays one day without the UI; acc = chance of a right first try */
function simDay(d, acc){
  var q = buildQueue(d, false), tasks = q.length;
  for(var i=0;i<q.length;i++){ var t = q[i], k = SKILL_OF[t[0]], ok = Math.random() < acc;
    if(t[0] === 'meet') intro(t[1], d); else if(k && !t[2]){ grade(t[1], k, ok, d); if(!ok) q.push([t[0] === 'sent' ? 'read' : t[0], t[1], 1]); } }
  S.done[d] = true; return tasks;
}
window.__dolch = {idx: function(){ return A ? A.i : -1; }, cur: function(){ return A && A.q[A.i] || null; }, startSession: startSession, simDay: simDay, S: function(){ return S; }, dayNum: dayNum, buildQueue: buildQueue, home: home, WORDS: WORDS};
home();
if('serviceWorker' in navigator){ window.addEventListener('load', function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); }); }
})();
