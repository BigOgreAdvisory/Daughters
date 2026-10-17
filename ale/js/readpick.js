/* GAME 4: Read & Pick. Read a phrase or sentence, tap the matching picture.
   Levels: 1 three-word phrases ("cat and dog") · 2 phrases with in/on/by ("a cat in a box")
           3 full sentences ("The cat sat on a mat.") · 4 sentences where only the small word differs (in vs on) */
'use strict';
(function(){
const A = ALE, W = ALE_WORDS;
const ACT = Object.keys(W.ACTORS), PL = W.PLACES, REL = W.REL;
const MAT = '<svg class="mat" viewBox="0 0 100 30"><rect x="4" y="6" width="92" height="18" rx="6" fill="#e86f5a"/><path d="M14 6v18M28 6v18M42 6v18M56 6v18M70 6v18M84 6v18" stroke="#ffd27a" stroke-width="5"/></svg>';
const placeArt = p => p === 'mat' ? MAT : `<span class="em">${PL[p]}</span>`;

/* picture = {a, rel, b} ; rel null => two actors side by side ("cat and dog") */
function art(pic){
  if(!pic.rel) return `<div class="art two"><span class="em">${W.ACTORS[pic.a]}</span><span class="em">${W.ACTORS[pic.b]}</span></div>`;
  return `<div class="art r-${pic.rel} p-${pic.b}"><div class="pl">${placeArt(pic.b)}</div><div class="ac em">${W.ACTORS[pic.a]}</div></div>`;
}
const same = (x, y) => x.a === y.a && x.rel === y.rel && x.b === y.b;
const relOK = (rel, b) => REL[rel].includes(b);
const otherActor = (...not) => A.pick(ACT.filter(x => !not.includes(x)));

function build(lvl){
  if(lvl === 1){
    const [a, b] = A.shuffle(ACT).slice(0,2);
    const t = {a, b, rel:null};
    const d1 = {a, b:otherActor(a, b), rel:null}, d2 = {a:otherActor(a, b, d1.b), b, rel:null};
    return {t, ds:[d1, d2], text:`${a} and ${b}`};
  }
  const rel = A.pick(lvl === 2 ? ['in','on','by'] : ['in','on','on','by']);
  // level 4 only uses places where another small word also works, so in/on/by is the contrast
  const places = lvl === 4 ? REL[rel].filter(p => ['in','on','by'].filter(r => REL[r].includes(p)).length >= 2) : REL[rel];
  const b = A.pick(places), a = A.pick(ACT);
  const t = {a, rel, b};
  let text;
  if(lvl === 2) text = `a ${a} ${rel} a ${b}`;
  else if(rel === 'on' && b === 'mat' && Math.random() < .6) text = `The ${a} sat on a mat.`;
  else text = A.pick([`The ${a} is ${rel} the ${b}.`, `A ${a} sat ${rel} a ${b}.`]);
  const ds = [];
  const push = d => { if(d && relOK(d.rel, d.b) && !same(d, t) && !ds.some(x => same(x, d))) ds.push(d); };
  if(lvl === 4){
    // same animal and place, different small word
    A.shuffle(['in','on','by']).forEach(r => { if(ds.length < 1 && r !== rel && relOK(r, b)) push({a, rel:r, b}); });
  }
  let guard = 0;
  while(ds.length < 2 && guard++ < 50){
    if(ds.length === 0 || Math.random() < .5) push({a:otherActor(a), rel, b});
    else push({a, rel, b:A.pick(REL[rel].filter(x => x !== b))});
  }
  return {t, ds, text};
}

A.games.readpick = {
  max: 4,
  init(sess){ sess.ctx.recent = []; },
  round(sess, st, tk){
    let r, guard = 0;
    do{ r = build(sess.g.level); }while(sess.ctx.recent.includes(r.text) && guard++ < 10);
    sess.ctx.recent.push(r.text); if(sess.ctx.recent.length > 6) sess.ctx.recent.shift();
    const opts = A.shuffle([r.t].concat(r.ds));
    const words = r.text.split(' ');
    st.innerHTML = `
      <div class="sentence big" id="sent">${A.sentenceHTML(words, -1)}</div>
      <div class="rp-grid">${opts.map(o => `<button class="card rp" data-ok="${o === r.t ? 1 : 0}">${art(o)}</button>`).join('')}</div>`;
    const box = A.$('#sent', st), cards = A.$$('.rp', st);
    A.wireChips(box, tk);
    const play = async () => { const sq = A.stopSeq(); await A.readAlong(box, tk, sq); };
    sess.replay = play;
    A.later(() => { if(A.alive(tk) && sess.round === 0) A.say('Read it. Tap the picture that matches.'); }, 450);
    const key = (sess.g.level === 1 ? 'and:' : r.t.rel + ':') + r.t.a + '-' + r.t.b;
    const answer = A.choiceRound(sess, tk, {
      key,
      onRight: async () => { await play(); if(A.alive(tk)) await A.say(A.praise()); },
      hint: async () => { await A.say(`${A.hint()} Tap a word to hear it.`); },
      reveal: async () => { cards.find(c => c.dataset.ok === '1').classList.add('glow'); await play(); }
    });
    cards.forEach(c => c.addEventListener('click', () => answer(c, c.dataset.ok === '1')));
  }
};
})();
