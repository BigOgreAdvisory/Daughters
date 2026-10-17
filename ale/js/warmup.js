/* GAME 5: Letter & Sound Warm-ups (two parts, each with its own level).
   Letters (ported from Ana's Letter Lake, starting harder):
     1 hear a lowercase letter name, tap it (3 choices) · 2 same with 4 choices incl. look-alikes (b d p q)
     3 lowercase -> uppercase (4 choices) · 4 uppercase -> lowercase with look-alikes
   Sounds (ported from Ana's Sound Sort, starting harder):
     1 same or different first sound · 2 first sound (3 pictures) · 3 first sound, find 1-2 matches among 4
     4 last sound (3 pictures) · 5 middle sound (3 pictures)                                                   */
'use strict';
(function(){
const A = ALE, W = ALE_WORDS;
const ALPHA = 'abcdefghijklmnopqrstuvwxyz'.split('');
const CONF = {b:'dpq', d:'bpq', p:'bdq', q:'bdp', m:'nw', n:'mh', u:'nv', v:'uw', w:'vm', i:'jl', l:'ij', g:'qy', j:'ig', h:'nb', y:'gv', a:'oe', e:'ac', c:'eo', o:'ca'};
const slab = c => c === 'I' || c === 'l';

/* ---------------- Letters ---------------- */
const LL = {1:{mode:'hear', n:3}, 2:{mode:'hear', n:4, conf:true}, 3:{mode:'L2U', n:4}, 4:{mode:'U2L', n:4, conf:true}};
A.games.letters = {
  max: 4,
  init(sess){ sess.ctx.recent = []; },
  round(sess, st, tk){
    const lvl = sess.g.level;
    const cfg = lvl === 4 && sess.round % 2 ? LL[3] : LL[lvl];             // level 4 mixes both directions
    const t = A.pickItem(ALPHA, x => cfg.mode + ':' + x, sess.g, sess.ctx.recent, 4);
    const ds = [];
    if(cfg.conf && CONF[t]) ds.push(A.pick(CONF[t].split('')));
    A.shuffle(ALPHA).forEach(x => { if(ds.length < cfg.n - 1 && x !== t && !ds.includes(x)) ds.push(x); });
    const opts = A.shuffle([t].concat(ds));
    const show = cfg.mode === 'U2L' ? t.toUpperCase() : t;
    const cho = x => cfg.mode === 'L2U' ? x.toUpperCase() : x;
    const nm = A.lname(t);
    st.innerHTML = `
      <div class="floatzone">${cfg.mode === 'hear'
        ? `<button class="bubble ear" id="fl" aria-label="Hear again"><span class="em">👂</span></button>`
        : `<div class="bubble ${slab(show) ? 'slab' : ''}" id="fl">${A.esc(show)}</div>`}</div>
      <div class="choices n${opts.length}">${opts.map(o => `<button class="pad ${slab(cho(o)) ? 'slab' : ''}" data-l="${o}" data-ok="${o === t ? 1 : 0}">${A.esc(cho(o))}</button>`).join('')}</div>`;
    const prompt = cfg.mode === 'hear' ? `Find little ${nm}.` : cfg.mode === 'L2U' ? `This is little ${nm}. Find big ${nm}.` : `This is big ${nm}. Find little ${nm}.`;
    sess.replay = () => { A.stopSeq(); A.say(prompt); };
    if(cfg.mode === 'hear') A.$('#fl', st).addEventListener('click', () => { A.ac(); sess.replay(); });
    A.later(() => { if(A.alive(tk)) A.say(prompt); }, 600);
    const pads = A.$$('.pad', st);
    const answer = A.choiceRound(sess, tk, {
      key: cfg.mode + ':' + t,
      onRight: async () => { A.$('#fl').classList.add('pop'); await A.say(`${A.praise()} Little ${nm}, big ${nm}.`); },
      hint: async el => { await A.say(`That one is ${A.lname(el.dataset.l)}. ${A.hint()} Find ${nm}.`); },
      reveal: async () => { pads.find(p => p.dataset.ok === '1').classList.add('glow'); await A.say(`Here it is! ${nm}.`); }
    });
    pads.forEach(p => p.addEventListener('click', () => answer(p, p.dataset.ok === '1')));
  }
};

/* ---------------- Sounds ---------------- */
const SS = {1:{mode:'same'}, 2:{mode:'first', n:3, m:[1,1]}, 3:{mode:'first', n:4, m:[1,2]}, 4:{mode:'last', n:3, m:[1,1]}, 5:{mode:'mid', n:3, m:[1,1]}};
const SK = {first:'f', last:'l', mid:'v'};
const PICS = W.PICS;
function pool(mode){
  if(mode === 'same' || mode === 'first') return PICS.filter(x => x.f);
  if(mode === 'last') return PICS.filter(x => x.l);
  return PICS.filter(x => x.v);
}
function build(sess){
  const cfg = SS[sess.g.level], P = pool(cfg.mode);
  if(cfg.mode === 'same'){
    const same = Math.random() < .5, groups = {};
    P.forEach(x => (groups[x.f] = groups[x.f] || []).push(x));
    let a, b;
    if(same){ const gk = A.pick(Object.keys(groups).filter(k => groups[k].length >= 2)); [a, b] = A.shuffle(groups[gk]).slice(0,2); }
    else{ a = A.pick(P); b = A.pick(P.filter(x => x.f !== a.f)); }
    return {mode:'same', a, b, same, key:`same:${a.w}|${b.w}`};
  }
  const k = SK[cfg.mode];
  const m = cfg.m[0] + A.rnd(cfg.m[1] - cfg.m[0] + 1);
  let t = null, matches = [], tries = 0;
  while(tries++ < 80){
    t = A.wpick(P, x => A.weight(sess.g, cfg.mode + ':' + x.w));
    const cand = P.filter(x => x !== t && x[k] === t[k]);
    if(cand.length >= m){ matches = A.shuffle(cand).slice(0, m); break; }
    if(tries > 60 && cand.length){ matches = A.shuffle(cand).slice(0,1); break; }
  }
  if(!matches.length){
    const grp = {}; P.forEach(x => (grp[x[k]] = grp[x[k]] || []).push(x));
    const two = A.shuffle(grp[A.pick(Object.keys(grp).filter(q => grp[q].length >= 2))]).slice(0,2);
    t = two[0]; matches = [two[1]];
  }
  const used = new Set([t[k]]), ds = [];
  for(const x of A.shuffle(P)){
    if(ds.length >= cfg.n - matches.length) break;
    if(x === t || matches.includes(x) || used.has(x[k])) continue;
    ds.push(x); used.add(x[k]);
  }
  return {mode:cfg.mode, t, matches, opts:A.shuffle(matches.concat(ds)), key:`${cfg.mode}:${t.w}`};
}
const circles = (c1, c2) => `<span class="sd-ico"><i style="background:${c1}"></i><i style="background:${c2}"></i></span>`;

A.games.sounds = {
  max: 5,
  init(){},
  round(sess, st, tk){
    const r = build(sess);
    if(r.mode === 'same') return sameRound(sess, st, tk, r);
    const bar = r.mode === 'first' ? [1,0,0] : r.mode === 'last' ? [0,0,1] : [0,1,0];
    const many = r.matches.length > 1;
    st.innerHTML = `
      <div class="tgtbox">
        <div class="wbar">${bar.map(x => `<i class="${x ? 'on' : ''}"></i>`).join('')}</div>
        <button class="card target" id="tgt" data-w="${r.t.w}"><span class="em">${r.t.e}</span></button>
        <div class="pipsrow" id="pips">${many ? r.matches.map(() => '<span class="em">⭐</span>').join('') : ''}</div>
      </div>
      <div class="pgrid n${r.opts.length}" id="grid">${r.opts.map(o => `<button class="card" data-w="${o.w}" data-ok="${r.matches.includes(o) ? 1 : 0}"><span class="em">${o.e}</span></button>`).join('')}</div>`;
    const tgt = A.$('#tgt'), cards = A.$$('#grid .card', st);
    const like = r.mode === 'first' ? 'starts like' : r.mode === 'last' ? 'ends like' : 'has the same middle sound as';
    const listen = r.mode === 'first' ? 'Listen to the start.' : r.mode === 'last' ? 'Listen to the end.' : 'Listen to the middle.';
    const promptText = many ? `Tap all the pictures that start like ${r.t.w}.` : `Which one ${like} ${r.t.w}?`;
    const sayIntro = async () => {
      if(!A.alive(tk)) return;
      const sq = A.stopSeq(); await A.wait(200);
      const ok = () => A.alive(tk) && sq === A.seq();
      if(!ok()) return; await A.say(promptText);
      for(const el of [tgt].concat(cards)){
        if(!ok()) return;
        el.classList.add('hl'); await A.say(el.dataset.w, {rate:.8}); el.classList.remove('hl'); await A.wait(120);
      }
    };
    sess.replay = sayIntro; A.later(sayIntro, 500);
    tgt.addEventListener('click', () => { A.ac(); A.stopSeq(); A.say(r.t.w); });

    let wrong = 0, found = 0, busy = false;
    cards.forEach(c => c.addEventListener('click', async () => {
      if(busy || !A.alive(tk) || c.classList.contains('found') || c.classList.contains('dim')) return; A.ac(); A.stopSeq();
      const w = c.dataset.w;
      if(c.dataset.ok === '1'){
        found++; c.classList.add('found'); A.Sfx.good(); A.burstAt(c, 10); A.mascot('happy');
        const pips = A.$$('#pips span', st); if(pips[found-1]) pips[found-1].classList.add('on');
        if(found === r.matches.length){
          busy = true; await A.say(`${A.praise()} ${w}, ${r.t.w}.`);
          if(A.alive(tk)) sess.done(wrong === 0, r.key);
        }else A.say(w + '. Yes! Find another one.');
      }else{
        wrong++; c.classList.add('wobble','dim'); A.Sfx.soft(); A.mascot('think');
        if(wrong >= 2){
          busy = true;
          const left = cards.filter(x => x.dataset.ok === '1' && !x.classList.contains('found')); left.forEach(x => x.classList.add('glow'));
          await A.say(`Let’s see. ${left.map(x => x.dataset.w).join(' and ')} and ${r.t.w} go together.`);
          await A.wait(450); if(A.alive(tk)) sess.done(false, r.key);
        }else await A.say(`${listen} ${r.t.w}. ${w}. ${A.hint()}`);
      }
    }));
  }
};

function sameRound(sess, st, tk, r){
  st.innerHTML = `
    <div class="tgtbox"><div class="wbar"><i class="on"></i><i></i><i></i></div></div>
    <div class="pair">
      <button class="card" id="pa" data-w="${r.a.w}"><span class="em">${r.a.e}</span></button>
      <button class="card" id="pb" data-w="${r.b.w}"><span class="em">${r.b.e}</span></button>
    </div>
    <div class="sd">
      <button class="big-btn" id="same" data-ok="${r.same ? 1 : 0}" aria-label="same">${circles('#3D8BFD','#3D8BFD')}</button>
      <button class="big-btn" id="diff" data-ok="${r.same ? 0 : 1}" aria-label="different">${circles('#3D8BFD','#FFC933')}</button>
    </div>`;
  const pa = A.$('#pa'), pb = A.$('#pb');
  const sayIntro = async () => {
    if(!A.alive(tk)) return;
    const sq = A.stopSeq(); await A.wait(200);
    const ok = () => A.alive(tk) && sq === A.seq();
    if(!ok()) return; pa.classList.add('hl'); await A.say(r.a.w, {rate:.8}); pa.classList.remove('hl'); await A.wait(250);
    if(!ok()) return; pb.classList.add('hl'); await A.say(r.b.w, {rate:.8}); pb.classList.remove('hl'); await A.wait(200);
    if(!ok()) return; await A.say('Do they start the same? Or different?');
  };
  sess.replay = sayIntro; A.later(sayIntro, 500);
  pa.addEventListener('click', () => { A.ac(); A.stopSeq(); A.say(r.a.w); });
  pb.addEventListener('click', () => { A.ac(); A.stopSeq(); A.say(r.b.w); });
  const verdict = `${r.a.w}, ${r.b.w}. ${r.same ? 'They start the same.' : 'They start different.'}`;
  const answer = A.choiceRound(sess, tk, {
    key: r.key,
    onRight: async () => { await A.say(`${A.praise()} ${verdict}`); },
    hint: async () => { await A.say(`Listen to the start. ${r.a.w}. ${r.b.w}. ${A.hint()}`); },
    reveal: async () => { await A.say(verdict); }
  });
  [A.$('#same'), A.$('#diff')].forEach(b => b.addEventListener('click', () => answer(b, b.dataset.ok === '1')));
}
})();
