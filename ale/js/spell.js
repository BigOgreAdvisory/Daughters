/* GAME 1: Spell-a-Word. Hear a word, see its picture, build it from lowercase letter tiles.
   Levels: 1 CVC with only the needed tiles · 2 CVC + 2 extra tiles · 3 CVC + look-alike/vowel extras
           4 four-letter blends + extras · 5 digraphs (sh/ch/th/ck/ng are ONE tile) + extras         */
'use strict';
(function(){
const A = ALE, W = ALE_WORDS;
const LV = {1:{p:'cvc', d:0}, 2:{p:'cvc', d:2}, 3:{p:'cvc', d:3, conf:true}, 4:{p:'blend', d:2}, 5:{p:'digraph', d:2}};
const VOW = 'aeiou';
const CONF = {b:'dp', d:'bp', p:'bdq', m:'nw', n:'mu', u:'n', g:'q', t:'f', f:'t', h:'n', a:'eou', e:'ai', i:'ea', o:'au'};
const DIGR = ['sh','ch','th','ck'];

function distractors(t, lv){
  const used = new Set(t.g.concat(t.w.split(''))), ds = [];
  const add = x => { if(x && !used.has(x) && !ds.includes(x) && ds.length < lv.d) ds.push(x); };
  if(lv.p === 'digraph') add(A.pick(DIGR.filter(x => !t.g.includes(x))));
  if(lv.conf){
    const v = t.g.find(x => VOW.includes(x)); if(v) add(A.pick(CONF[v].split('').filter(x => !used.has(x))));
    for(const c of A.shuffle(t.g.filter(x => CONF[x] && !VOW.includes(x)))){
      const o = CONF[c].split('').filter(x => !used.has(x)); if(o.length){ add(A.pick(o)); break; }
    }
  }
  A.shuffle('bcdfghjklmnprstvwz'.split('')).forEach(add);
  return ds;
}

A.games.spell = {
  max: 5,
  init(sess){ sess.ctx.recent = []; },
  round(sess, st, tk){
    const g = sess.g, lv = LV[g.level];
    const pool = W.spellPool(lv.p, A.theme().words);
    const t = A.pickItem(pool, x => x.w, g, sess.ctx.recent, 4);
    const gs = t.g;
    const tiles = A.shuffle(gs.concat(distractors(t, lv)));

    st.innerHTML = `
      <div class="sp-pic"><button class="card pic" id="pic" aria-label="Hear the word"><span class="em">${t.e}</span></button></div>
      <div class="slots n${gs.length}" id="slots">${gs.map((x,i) => `<div class="slot ${x.length>1?'dg':''}" data-i="${i}"></div>`).join('')}</div>
      <div class="ltiles n${tiles.length}" id="tiles">${tiles.map(x => `<button class="ltile ${x.length>1?'dg':''}" data-l="${x}" data-ok="0">${x}</button>`).join('')}</div>`;

    const slots = A.$$('.slot', st), tileEls = A.$$('.ltile', st);
    let pos = 0, slotMiss = 0, wrongTotal = 0, busy = false;
    const posWord = () => pos === 0 ? 'first' : pos === gs.length - 1 ? 'last' : 'next';
    const mark = () => {
      tileEls.forEach(el => el.dataset.ok = (!el.classList.contains('used') && el.dataset.l === gs[pos]) ? '1' : '0');
      slots.forEach((s,i) => s.classList.toggle('next', i === pos));
    };
    mark();

    const intro = sess.round === 0 ? `Spell the word ${t.w}. Tap the letters.` : `Spell ${t.w}.`;
    sess.replay = () => { A.stopSeq(); A.say(`Spell ${t.w}.`); };
    A.later(() => { if(A.alive(tk)) A.say(intro); }, 500);
    A.$('#pic', st).addEventListener('click', () => { A.ac(); A.stopSeq(); A.say(t.w); });

    const finish = async () => {
      busy = true; A.Sfx.good(); A.burstAt(A.$('#slots'), 14); A.mascot('happy');
      await A.wait(300); if(!A.alive(tk)) return;
      A.stopSeq();
      // highlight each tile left to right while the word is spoken slowly
      const sweep = (async () => {
        for(const s of slots){ if(!A.alive(tk)) return; s.classList.add('hl'); await A.wait(Math.max(380, 900/gs.length)); s.classList.remove('hl'); s.classList.add('lit'); }
      })();
      await Promise.all([A.say(t.w, {rate:.5}), sweep]);
      if(!A.alive(tk)) return;
      A.$('#slots').classList.add('pop');
      await A.say(`${A.praise()} ${t.w}!`);
      if(A.alive(tk)) sess.done(wrongTotal === 0, t.w);
    };
    const place = async el => {
      el.classList.add('used'); el.dataset.ok = '0';
      const s = slots[pos]; s.textContent = el.dataset.l; s.classList.add('filled','pop');
      tileEls.forEach(x => x.classList.remove('dim','glow','wobble'));
      pos++; slotMiss = 0; A.Sfx.pop();
      if(pos >= gs.length){ await finish(); return; }
      mark(); A.stopSeq(); A.say(A.lname(el.dataset.l), {rate:.9});
    };
    const miss = async el => {
      wrongTotal++; slotMiss++;
      el.classList.add('wobble','dim'); A.Sfx.soft(); A.mascot('think');
      A.later(() => el.classList.remove('wobble'), 520);
      A.stopSeq();
      if(slotMiss >= 2){
        busy = true;
        const right = tileEls.find(x => x.dataset.ok === '1'); right.classList.add('glow');
        await A.say(`This one. ${A.lname(right.dataset.l)}.`);
        await A.wait(300); if(!A.alive(tk)) return;
        busy = false; await place(right);
      }else{
        A.say(`${A.hint()} ${t.w}. Which letter comes ${posWord()}?`);
      }
    };
    const attempt = el => {
      if(busy || !A.alive(tk) || el.classList.contains('used') || el.classList.contains('dim')) return;
      A.ac();
      if(el.dataset.l === gs[pos]) place(el); else miss(el);
    };
    tileEls.forEach(el => A.draggable(el, {
      disabled: () => busy || el.classList.contains('used'),
      onTap: () => attempt(el),
      onDrop: (x, y) => { if(A.hitEl([A.$('#slots')], x, y, 30)) attempt(el); }
    }));
  }
};
})();
