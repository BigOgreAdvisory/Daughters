/* Word data for Ale's games. Learning content only (no theme content here).
   Every word carries its phonics pattern so each level draws from the right set:
     cvc     – 3-letter short-vowel words (cat, pig)
     blend   – 4-letter words with a consonant blend (frog, stop)
     digraph – words with sh / ch / th / ck / ng; g lists the tiles (a digraph is ONE tile)
     sight   – high-frequency words learned by sight (the, said)                     */
'use strict';
window.ALE_WORDS = (function(){

/* ---------- Spell-a-Word: picturable words ---------- */
const SPELL = [
  // short a
  ['cat','🐱','cvc'],['bat','🦇','cvc'],['hat','🎩','cvc'],['rat','🐀','cvc'],['map','🗺️','cvc'],['cap','🧢','cvc'],
  ['can','🥫','cvc'],['van','🚐','cvc'],['pan','🍳','cvc'],['man','👨','cvc'],['bag','👜','cvc'],['ham','🍖','cvc'],
  // short e
  ['bed','🛏️','cvc'],['hen','🐔','cvc'],['pen','🖊️','cvc'],['net','🥅','cvc'],['jet','✈️','cvc'],['ten','🔟','cvc'],['leg','🦵','cvc'],
  // short i
  ['pig','🐷','cvc'],['pin','📌','cvc'],['lip','👄','cvc'],['kid','🧒','cvc'],['six','6️⃣','cvc'],
  // short o
  ['dog','🐶','cvc'],['fox','🦊','cvc'],['box','📦','cvc'],['log','🪵','cvc'],
  // short u
  ['sun','☀️','cvc'],['bus','🚌','cvc'],['bug','🐛','cvc'],['mug','☕','cvc'],['cup','🥤','cvc'],['nut','🥜','cvc'],['hug','🤗','cvc'],['tub','🛁','cvc'],
  // blends (4 letters)
  ['drum','🥁','blend'],['flag','🚩','blend'],['sled','🛷','blend'],['plug','🔌','blend'],['clap','👏','blend'],['stop','🛑','blend'],
  ['tent','⛺','blend'],['hand','✋','blend'],['milk','🥛','blend'],['gift','🎁','blend'],
  // digraphs (sh, ch, th, ck)
  ['dish','🍽️','digraph',['d','i','sh']],['cash','💵','digraph',['c','a','sh']],['shop','🛍️','digraph',['sh','o','p']],
  ['chick','🐤','digraph',['ch','i','ck']],['chips','🍟','digraph',['ch','i','p','s']],['lunch','🍱','digraph',['l','u','n','ch']],
  ['bath','🛁','digraph',['b','a','th']],['thumb','👍','digraph',['th','u','m','b']],['think','🤔','digraph',['th','i','n','k']],
  ['duck','🦆','digraph',['d','u','ck']],['sock','🧦','digraph',['s','o','ck']],['lock','🔒','digraph',['l','o','ck']]
].map(r => ({w:r[0], e:r[1], p:r[2], g:r[3] || r[0].split('')}));

function spellPool(pattern, themeWords){
  const seen = new Set(), out = [];
  SPELL.concat((themeWords||[]).map(t => ({w:t.w, e:t.e, p:t.p, g:t.g || t.w.split(''), theme:true})))
    .forEach(x => { if(x.p === pattern && !seen.has(x.w)){ seen.add(x.w); out.push(x); } });
  return out;
}

/* ---------- Word Family Garden ---------- */
// key word + picture label each pot; cvc = decodable short-vowel words; blend = harder words for the top level
const FAM = {
  at:{key:'cat', e:'🐱', cvc:['cat','bat','hat','mat','rat','sat','pat'], blend:['flat','chat','that','spat']},
  an:{key:'van', e:'🚐', cvc:['can','fan','man','pan','ran','van','tan'], blend:['plan','than','scan']},
  ap:{key:'cap', e:'🧢', cvc:['cap','map','nap','tap','lap','gap'], blend:['clap','snap','trap','flap']},
  ig:{key:'pig', e:'🐷', cvc:['big','dig','pig','wig','fig','jig'], blend:['twig']},
  in:{key:'pin', e:'📌', cvc:['bin','fin','pin','tin','win'], blend:['spin','grin','chin','thin','skin']},
  ip:{key:'lip', e:'👄', cvc:['dip','hip','lip','rip','sip','tip','zip'], blend:['ship','trip','slip','drip','flip','chip']},
  op:{key:'stop', e:'🛑', cvc:['hop','mop','pop','top','cop'], blend:['stop','shop','chop','drop','flop']},
  ot:{key:'hot', e:'🔥', cvc:['cot','dot','got','hot','lot','not','pot'], blend:['spot','slot','trot']},
  ug:{key:'bug', e:'🐛', cvc:['bug','hug','mug','rug','jug','dug','tug'], blend:['plug','slug','snug']},
  en:{key:'hen', e:'🐔', cvc:['hen','pen','ten','men','den'], blend:['then','when']},
  et:{key:'net', e:'🥅', cvc:['bet','get','jet','met','net','pet','set','wet','vet'], blend:[]},
  ed:{key:'bed', e:'🛏️', cvc:['bed','fed','red','led'], blend:['sled','shed']}
};
const FAM_NEAR = [['at','an'],['at','ap'],['an','ap'],['ig','in'],['ig','ip'],['in','ip'],['en','et'],['en','ed'],['et','ed'],
  ['op','ot'],['at','ot'],['ig','ug'],['ap','ip'],['ap','op'],['ip','op'],['an','en'],['an','in'],['in','en'],['et','ot']];
const FAM_TRIOS = [['at','an','ap'],['ig','in','ip'],['en','et','ed'],['at','ot','et'],['ap','ip','op'],['an','in','en'],['ug','ig','ed']];

/* ---------- Sight Word Hunt ---------- */
// tiers are sequenced: tier 1 first, tier 4 last
const SIGHT = {
  1: ['the','and','is','it','in','to','my','we','see','go','I','can'],
  2: ['like','you','me','he','she','look','up','no','yes','at','am','on'],
  3: ['said','was','are','come','here','have','they','what','do','for','of','has','this','with','where','one']
};
// look-alike groups for harder distractors
const LOOKALIKE = [['he','she','the','we','me'],['is','it','in','at'],['to','go','no','do'],['was','saw','has'],['my','me'],
  ['and','an','am'],['can','come'],['look','like'],['see','she'],['you','yes'],['what','with','where','was'],['for','of','one'],
  ['this','the','they','then'],['are','at'],['here','have','has'],['on','one','no'],['up','us']];
// level 5: sentence with one missing sight word, a picture clue and 3 choices (only one fits)
const SIGHT_SENT = [
  {s:'I can _ a pig.',          a:'see',  d:['go','the'],   pic:'🐷'},
  {s:'The cat is _ the box.',   a:'in',   d:['to','we'],    pic:'🐱📦'},
  {s:'I _ my dog.',             a:'like', d:['is','the'],   pic:'🐶💗'},
  {s:'_ is a big bus.',         a:'It',   d:['We','My'],    pic:'🚌'},
  {s:'Look at _ hat!',          a:'my',   d:['go','is'],    pic:'🎩'},
  {s:'We _ to bed.',            a:'go',   d:['see','and'],  pic:'🛏️'},
  {s:'The dog _ big.',          a:'is',   d:['the','you'],  pic:'🐶'},
  {s:'She _ a red hat.',        a:'has',  d:['said','to'],  pic:'👧🎩'},
  {s:'He can _ the sun.',       a:'see',  d:['you','and'],  pic:'👦☀️'},
  {s:'I _ six.',                a:'am',   d:['is','to'],    pic:'6️⃣'},
  {s:'You _ my pal.',           a:'are',  d:['is','to'],    pic:'🤗'},
  {s:'The pig _ in the mud.',   a:'is',   d:['said','to'],  pic:'🐷'},
  {s:'_ is in the box?',        a:'What', d:['Said','Go'],  pic:'📦❓'},
  {s:'The hen and the cat _ here.', a:'are', d:['is','to'],  pic:'🐔🐱'},
  {s:'Come _ me!',              a:'with', d:['the','is'],   pic:'👋'},
  {s:'The sun is _.',           a:'up',   d:['the','and'],  pic:'☀️'}
];

/* ---------- Read & Pick ---------- */
// actors and places that can be drawn by composing emoji (mat is drawn in SVG)
const ACTORS = {cat:'🐱', dog:'🐶', pig:'🐷', hen:'🐔', bug:'🐛', fox:'🦊', rat:'🐀', frog:'🐸', duck:'🦆'};
const PLACES = {box:'📦', bed:'🛏️', bus:'🚌', van:'🚐', tub:'🛁', cup:'🥤', hat:'🎩', log:'🪵', mat:'MAT'};
const REL = { in:['box','tub','cup','van','bus','hat'], on:['box','bed','bus','van','log','mat','tub'], by:['box','bed','bus','van','log','tub'] };

/* ---------- Warm-ups (picture bank, ported from Ana's Sound Sort) ----------
   [word, emoji, first sound, last sound, middle vowel (short-vowel CVC only), blend-start flag]
   Sounds are phoneme codes, not letters. */
const RAW = [
 ['cat','🐱','k','t','a'],['cup','🥤','k','p','u'],['car','🚗','k','r'],['cow','🐮','k'],['cake','🎂','k','k'],['corn','🌽','k','n'],
 ['kid','🧒','k','d','i'],['cap','🧢','k','p','a'],['can','🥫','k','n','a'],
 ['bat','🦇','b','t','a'],['bus','🚌','b','s','u'],['bed','🛏️','b','d','e'],['bee','🐝','b'],['boat','⛵','b','t'],['book','📖','b','k'],
 ['ball','⚽','b','l'],['bug','🐛','b','g','u'],['bag','👜','b','g','a'],['bear','🐻','b','r'],['bird','🐦','b','d'],['bread','🍞','b','d'],['bell','🔔','b','l'],
 ['sun','☀️','s','n','u'],['sock','🧦','s','k','o'],['soap','🧼','s','p'],['star','⭐','s','r','',1],['snake','🐍','s','k','',1],['snail','🐌','s','l','',1],
 ['moon','🌙','m','n'],['mouse','🐭','m','s'],['map','🗺️','m','p','a'],['milk','🥛','m','k'],['monkey','🐵','m'],
 ['dog','🐶','d','g','o'],['duck','🦆','d','k','u'],['door','🚪','d','r'],['drum','🥁','d','m','',1],
 ['fish','🐟','f','sh'],['fork','🍴','f','k'],['fire','🔥','f','r'],['foot','🦶','f','t'],['frog','🐸','f','g','',1],['fox','🦊','f','ks','o'],
 ['tiger','🐯','t','r'],['tooth','🦷','t','th'],['tent','⛺','t','t'],['turtle','🐢','t','l'],['tub','🛁','t','b','u'],['tree','🌳','t','','',1],['truck','🚚','t','k','',1],
 ['pig','🐷','p','g','i'],['pizza','🍕','p'],['pear','🍐','p','r'],['pen','🖊️','p','n','e'],['panda','🐼','p'],
 ['pin','📌','p','n','i'],['pan','🍳','p','n','a'],
 ['hat','🎩','h','t','a'],['horse','🐴','h','s'],['house','🏠','h','s'],['hand','✋','h','d'],['heart','❤️','h','t'],['hen','🐔','h','n','e'],['hug','🤗','h','g','u'],
 ['rain','🌧️','r','n'],['ring','💍','r','ng'],['rabbit','🐰','r','t'],['rocket','🚀','r','t'],['rose','🌹','r','z'],['robot','🤖','r','t'],
 ['lion','🦁','l','n'],['leaf','🍃','l','f'],['lemon','🍋','l','n'],['leg','🦵','l','g','e'],['lip','👄','l','p','i'],['lock','🔒','l','k','o'],
 ['goat','🐐','g','t'],['gift','🎁','g','t'],['guitar','🎸','g','r'],['grapes','🍇','g','s','',1],
 ['nose','👃','n','z'],['nut','🥜','n','t','u'],['net','🥅','n','t','e'],
 ['watch','⌚','w','ch'],['whale','🐳','w','l'],['wolf','🐺','w','f'],['web','🕸️','w','b','e'],
 ['jet','✈️','j','t','e'],['van','🚐','v','n','a'],['ship','🚢','sh','p'],['sheep','🐑','sh','p'],
 ['crab','🦀','k','b','',1],['owl','🦉','','l'],['cloud','☁️','k','d','',1],['broom','🧹','b','m','',1],['arm','💪','','m'],['ice','🧊','','s']
];
const PICS = RAW.map(r => ({w:r[0], e:r[1], f:r[2]||'', l:r[3]||'', v:r[4]||'', b:!!r[5]}));

return {SPELL, spellPool, FAM, FAM_NEAR, FAM_TRIOS, SIGHT, LOOKALIKE, SIGHT_SENT, ACTORS, PLACES, REL, PICS};
})();
