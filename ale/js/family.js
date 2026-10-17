/* GAME 2: Word Family Garden. Read a word and sort it into the pot of its word family (-at, -ig ...).
   Levels: 1 two pots, different vowels · 2 two pots that look alike (-at/-an, -at/-ot)
           3 three pots, different vowels · 4 three look-alike pots · 5 three pots with blend and digraph words */
'use strict';
(function(){
const A = ALE, W = ALE_WORDS, FAM = W.FAM;
const LV = {1:{n:2, kind:'apart'}, 2:{n:2, kind:'near'}, 3:{n:3, kind:'apart'}, 4:{n:3, kind:'trio'}, 5:{n:3, kind:'blend'}};

function chooseFams(lvl){
  const cfg = LV[lvl];
  if(cfg.kind === 'near') return A.shuffle(A.pick(W.FAM_NEAR));
  if(cfg.kind === 'trio') return A.shuffle(A.pick(W.FAM_TRIOS));
  const keys = A.shuffle(Object.keys(FAM).filter(k => cfg.kind !== 'blend' || FAM[k].blend.length >= 2));
  const out = [];
  for(const k of keys){
    if(out.length >= cfg.n) break;
    if(out.some(o => o[0] === k[0] || o[1] === k[1])) continue;   // different vowel and different ending
    out.push(k);
  }
  return out;
}
const keyHTML = f => { const k = FAM[f].key, i = k.length - f.length; return `${k.slice(0,i)}<b>${k.slice(i)}</b>`; };

A.games.family = {
  max: 5,
  init(sess){ sess.ctx.recent = []; sess.ctx.lvl = 0; },
  round(sess, st, tk){
    const c = sess.ctx, lvl = sess.g.level, TG = A.theme().games.family;
    const fresh = c.lvl !== lvl;
    if(fresh){ c.fams = chooseFams(lvl); c.lvl = lvl; c.stacks = {}; }
    const fams = c.fams;
    let pool = [];
    fams.forEach(f => {
      FAM[f].cvc.forEach(w => pool.push({w, f}));
      if(lvl === 5) FAM[f].blend.forEach(w => { pool.push({w, f}); pool.push({w, f}); });   // blends twice as likely
    });
    const t = A.pickItem(pool, x => x.w, sess.g, c.recent, 4);

    st.innerHTML = `
      <div class="fm-zone"><button class="blossom" id="bl" aria-label="${A.esc(t.w)}"><span class="tok em">${TG.token}</span><span class="bw">${A.esc(t.w)}</span></button></div>
      <div class="pots n${fams.length}" id="pots">${fams.map(f => `
        <button class="pot" data-f="${f}" data-ok="${f === t.f ? 1 : 0}">
          <span class="pk em">${FAM[f].e}</span><span class="kw">${keyHTML(f)}</span>
          <span class="stack">${Array.from({length: Math.min(6, c.stacks[f] || 0)}, () => `<i class="em">${TG.token}</i>`).join('')}</span>
          <span class="pe em">${TG.pot}</span>
        </button>`).join('')}</div>`;

    const bl = A.$('#bl'), pots = A.$$('.pot', st);
    const keyOf = f => FAM[f].key;
    const sayIntro = async () => {
      if(!A.alive(tk)) return;
      const sq = A.stopSeq(); await A.wait(200);
      const ok = () => A.alive(tk) && sq === A.seq();
      if(!ok()) return;
      await A.say(sess.round === 0 || fresh ? 'Read the word. Put it in the pot where it rhymes.' : 'Which pot?');
      if(!(sess.round === 0 || fresh)) return;
      for(const p of pots){
        if(!ok()) return;
        p.classList.add('hl'); await A.say(keyOf(p.dataset.f), {rate:.8}); p.classList.remove('hl'); await A.wait(120);
      }
    };
    sess.replay = async () => {
      const sq = A.stopSeq(); await A.say('Read the word. Which pot?');
      for(const p of pots){ if(!A.alive(tk) || sq !== A.seq()) return; p.classList.add('hl'); await A.say(keyOf(p.dataset.f), {rate:.8}); p.classList.remove('hl'); }
    };
    A.later(sayIntro, 450);

    const fly = async pot => {
      const a = bl.getBoundingClientRect(), b = pot.getBoundingClientRect();
      bl.style.transition = 'transform .45s cubic-bezier(.3,.9,.3,1)';
      bl.style.transform = `translate(${b.left + b.width/2 - (a.left + a.width/2)}px,${b.top + 40 - (a.top + a.height/2)}px) scale(.35)`;
      await A.wait(460);
      if(!A.alive(tk)) return;
      c.stacks[pot.dataset.f] = (c.stacks[pot.dataset.f] || 0) + 1;
      const i = document.createElement('i'); i.className = 'em'; i.textContent = TG.token;
      const stack = pot.querySelector('.stack'); if(stack.children.length < 6) stack.appendChild(i);
      bl.style.visibility = 'hidden';
    };
    const answer = A.choiceRound(sess, tk, {
      key: t.w,
      onRight: async pot => { await fly(pot); await A.say(`${A.praise()} ${t.w}, ${keyOf(t.f)}!`); },
      hint: async pot => { await A.say(`${t.w}. ${keyOf(pot.dataset.f)}. Do they rhyme? ${A.hint()}`); },
      reveal: async () => {
        const right = pots.find(p => p.dataset.ok === '1'); right.classList.add('glow');
        await fly(right); await A.say(`${t.w}, ${keyOf(t.f)}. They rhyme!`);
      }
    });
    let busy = false;
    pots.forEach(p => p.addEventListener('click', () => { if(!busy) answer(p, p.dataset.ok === '1'); }));
    A.draggable(bl, {
      onTap: () => { A.ac(); A.stopSeq(); A.say(t.w); },
      onDrop: (x, y) => { const hit = A.hitEl(pots.filter(p => !p.classList.contains('dim')), x, y, 10); if(hit) answer(hit, hit.dataset.ok === '1'); }
    });
  }
};
})();
