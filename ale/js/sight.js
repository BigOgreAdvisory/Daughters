/* GAME 3: Sight Word Hunt. Hear a word and find it.
   Levels: 1 tier-1 words, 3 choices · 2 tiers 1-2, 4 choices · 3 tiers 1-2 with look-alike choices
           4 tier-3 words (said, was, are ...) with look-alikes · 5 sentence with a missing word + picture clue */
'use strict';
(function(){
const A = ALE, W = ALE_WORDS;
const T1 = W.SIGHT[1], T2 = W.SIGHT[2], T3 = W.SIGHT[3], ALL = T1.concat(T2, T3);
const LV = {1:{pool:T1, n:3}, 2:{pool:T1.concat(T2), n:4}, 3:{pool:T1.concat(T2), n:4, look:true}, 4:{pool:T3, n:4, look:true, review:.25}, 5:{sent:true}};
const lookalikes = w => { const out = new Set(); W.LOOKALIKE.forEach(g => { if(g.includes(w)) g.forEach(x => { if(x !== w) out.add(x); }); }); return [...out]; };

/* sentence chips: words are tappable to hear them, the blank is not */
A.sentenceHTML = (words, blankAt) => words.map((w,i) => i === blankAt
  ? `<span class="chip blank" id="blank">&nbsp;</span>`
  : `<button class="chip" data-w="${A.esc(w.replace(/[.,!?]/g,''))}">${A.esc(w)}</button>`).join('');
/* read a sentence word by word with a moving highlight */
A.readAlong = async (box, tk, sq) => {
  for(const ch of A.$$('.chip', box)){
    if(!A.alive(tk) || sq !== A.seq()) return;
    ch.classList.add('hl');
    if(ch.classList.contains('blank')) await A.wait(550);
    else await A.say(ch.dataset.w || ch.textContent, {rate:.85});
    ch.classList.remove('hl');
  }
};
A.wireChips = (box, tk) => A.$$('button.chip', box).forEach(b => b.addEventListener('click', () => {
  if(!A.alive(tk)) return; A.ac(); A.stopSeq(); b.classList.add('hl'); A.say(b.dataset.w).then(() => b.classList.remove('hl'));
}));

A.games.sight = {
  max: 5,
  init(sess){ sess.ctx.recent = []; sess.ctx.srecent = []; },
  round(sess, st, tk){
    const lv = LV[sess.g.level];
    if(lv.sent) return sentenceRound(sess, st, tk);
    const pool = lv.review && Math.random() < lv.review ? T1.concat(T2) : lv.pool;
    const t = A.pickItem(pool, x => x, sess.g, sess.ctx.recent, 5);
    const ds = [];
    if(lv.look) A.shuffle(lookalikes(t)).forEach(x => { if(ds.length < 2) ds.push(x); });
    A.shuffle(lv.look ? ALL : lv.pool).forEach(x => {
      if(ds.length < lv.n - 1 && x !== t && !ds.includes(x) && x.toLowerCase() !== t.toLowerCase()
         && (lv.look || !lookalikes(t).includes(x))) ds.push(x);
    });
    const opts = A.shuffle([t].concat(ds));
    st.innerHTML = `
      <div class="sw-ear"><button class="earbtn" id="ear" aria-label="Hear the word"><span class="em">👂</span></button></div>
      <div class="sw-grid n${opts.length}">${opts.map(o => `<button class="wcard" data-w="${A.esc(o)}" data-ok="${o === t ? 1 : 0}">${A.esc(o)}</button>`).join('')}</div>`;
    const cards = A.$$('.wcard', st);
    sess.replay = () => { A.stopSeq(); A.say(t, {rate:.8}); };
    A.$('#ear', st).addEventListener('click', () => { A.ac(); sess.replay(); });
    A.later(async () => { if(!A.alive(tk)) return; await A.say(sess.round === 0 ? 'Find the word.' : 'Find'); if(A.alive(tk)) await A.say(t, {rate:.8}); }, 450);
    const answer = A.choiceRound(sess, tk, {
      key: t,
      onRight: async () => { await A.say(`${A.praise()} ${t}.`); },
      hint: async el => { await A.say(`That word says ${el.dataset.w}. ${A.hint()} Find ${t}.`); },
      reveal: async () => { const r = cards.find(c => c.dataset.ok === '1'); r.classList.add('glow'); await A.say(`This one says ${t}.`); }
    });
    cards.forEach(c => c.addEventListener('click', () => answer(c, c.dataset.ok === '1')));
  }
};

function sentenceRound(sess, st, tk){
  const it = A.pickItem(W.SIGHT_SENT, x => x.s, sess.g, sess.ctx.srecent, 5);
  const words = it.s.split(' ');
  const bi = words.findIndex(w => w.startsWith('_'));
  const tail = words[bi].slice(1);                      // punctuation after the blank, e.g. "."
  const opts = A.shuffle([it.a].concat(it.d));
  st.innerHTML = `
    <div class="pclue em">${it.pic}</div>
    <div class="sentence" id="sent">${A.sentenceHTML(words, bi)}</div>
    <div class="sw-row">${opts.map(o => `<button class="wcard" data-w="${A.esc(o)}" data-ok="${o === it.a ? 1 : 0}">${A.esc(o)}</button>`).join('')}</div>`;
  const box = A.$('#sent', st), cards = A.$$('.wcard', st);
  A.wireChips(box, tk);
  const play = async () => { const sq = A.stopSeq(); await A.readAlong(box, tk, sq); };
  sess.replay = play;
  A.later(async () => { if(!A.alive(tk)) return; if(sess.round === 0) await A.say('Which word goes in the sentence?'); }, 450);
  const fill = () => { const b = A.$('#blank'); b.textContent = it.a + tail; b.classList.add('filled','pop'); b.dataset.w = it.a; };
  const answer = A.choiceRound(sess, tk, {
    key: 'sent:' + it.s,
    onRight: async () => { fill(); await A.wait(250); await play(); if(A.alive(tk)) await A.say(A.praise()); },
    hint: async el => { await A.say(`That word says ${el.dataset.w}. ${A.hint()}`); },
    reveal: async () => { cards.find(c => c.dataset.ok === '1').classList.add('glow'); fill(); await A.wait(250); await play(); }
  });
  cards.forEach(c => c.addEventListener('click', () => answer(c, c.dataset.ok === '1')));
}
})();
