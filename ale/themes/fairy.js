/* Theme: Fairy Garden (default). All theme text and art lives here. See ../THEME-GUIDE.md. */
(window.ALE_THEMES = window.ALE_THEMES || {}).fairy = {
  id: 'fairy',
  name: 'Fairy Garden',
  icon: '🧚',

  title: { app: "Ale's Games", home: "Ale's Games" },

  games: {
    spell:    { name: 'Spell-a-Word',       icon: '<span class="em">🪄</span><span class="tx">abc</span>', color: 'linear-gradient(#c79bff,#9a5cf0)' },
    family:   { name: 'Word Family Garden', icon: '<span class="em">🌷</span><span class="tx">-at</span>', color: 'linear-gradient(#7fe0a8,#2fb877)',
                token: '🌸', pot: '🪴' },
    sight:    { name: 'Sight Word Hunt',    icon: '<span class="em">🔎</span><span class="tx">the</span>', color: 'linear-gradient(#7cc4ff,#3f8ef0)' },
    readpick: { name: 'Read & Pick',        icon: '<span class="em">📖</span>', color: 'linear-gradient(#ffb3d9,#f06aa8)' },
    warm:     { name: 'Warm-ups',           icon: '<span class="tx">aA</span><span class="em">🔔</span>', color: 'linear-gradient(#ffd27a,#f5a524)' },
    letters:  { name: 'Letter Lake',        icon: '<span class="tx">aA</span>', color: 'linear-gradient(#8fd3ff,#4ba7ef)' },
    sounds:   { name: 'Sound Sort',         icon: '<span class="em">👂🐸</span>', color: 'linear-gradient(#ffb877,#f58a3a)' }
  },

  palette: {
    'primary': '#9a5cf0', 'primary-dark': '#6f37c9', 'accent': '#ff6fb5', 'accent-dark': '#d94690',
    'ink': '#3a2a5c', 'card': '#ffffff', 'line': '#e6d6ff', 'good': '#2ec27e', 'glow': '#ffd23f',
    'dot': '#ffffff', 'dot-ring': '#d3b8ff', 'dot-on': '#ff6fb5', 'slot': '#f6efff', 'tile-ink': '#5a2fa8'
  },

  backgrounds: {
    app:      'linear-gradient(#f7ecff,#ffeaf6)',
    home:     'linear-gradient(#efe0ff 0%,#ffe2f2 62%,#dcf5e3 100%)',
    spell:    'linear-gradient(#fbefff,#efe0ff)',
    family:   'linear-gradient(#eafbe9 0%,#d3f3da 70%,#b9e8c3 100%)',
    sight:    'linear-gradient(#eaf4ff,#e6dcff)',
    readpick: 'linear-gradient(#fff4e0,#ffe3ef)',
    warm:     'linear-gradient(#fff6dc,#ffe9f4)',
    letters:  'linear-gradient(#e2f4ff 0%,#bfe4ff 60%,#9fd3fa 100%)',
    sounds:   'linear-gradient(#fff0de,#ffdcbd)',
    finish:   'linear-gradient(#fff3c9,#ffd9f0)',
    book:     'linear-gradient(#fff6dc,#f3e3ff)',
    parent:   '#f5f2fb'
  },

  mascot: {
    name: 'Lumi',
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
      '<g fill="#cdeeff" stroke="#86ccef" stroke-width="2" opacity=".95">' +
        '<ellipse cx="29" cy="52" rx="20" ry="12" transform="rotate(-32 29 52)"/><ellipse cx="71" cy="52" rx="20" ry="12" transform="rotate(32 71 52)"/>' +
        '<ellipse cx="33" cy="69" rx="12" ry="7" transform="rotate(28 33 69)"/><ellipse cx="67" cy="69" rx="12" ry="7" transform="rotate(-28 67 69)"/></g>' +
      '<path d="M50 49 L67 88 Q50 95 33 88 Z" fill="#ff8fca" stroke="#e0559f" stroke-width="2" stroke-linejoin="round"/>' +
      '<circle cx="50" cy="35" r="17" fill="#ffd9b8"/>' +
      '<path d="M32 35 Q32 15 50 16 Q68 15 68 35 Q61 24 50 25 Q39 24 32 35Z" fill="#7a4a2e"/>' +
      '<circle cx="50" cy="13" r="6.5" fill="#7a4a2e"/>' +
      '<circle cx="44" cy="37" r="2.6" fill="#2d2a3a"/><circle cx="56" cy="37" r="2.6" fill="#2d2a3a"/>' +
      '<circle cx="45" cy="36" r=".9" fill="#fff"/><circle cx="57" cy="36" r=".9" fill="#fff"/>' +
      '<circle cx="39.5" cy="42" r="3.2" fill="#ff9fb8" opacity=".7"/><circle cx="60.5" cy="42" r="3.2" fill="#ff9fb8" opacity=".7"/>' +
      '<path d="M45 43.5 Q50 48 55 43.5" stroke="#a0453a" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<g class="arm"><line x1="62" y1="58" x2="79" y2="41" stroke="#ffd9b8" stroke-width="4.5" stroke-linecap="round"/>' +
        '<line x1="79" y1="41" x2="85" y2="27" stroke="#b9852b" stroke-width="2.5" stroke-linecap="round"/>' +
        '<polygon points="86,15 88.6,22 96,22.4 90.2,27 92.3,34 86,30 79.7,34 81.8,27 76,22.4 83.4,22" fill="#ffd23f" stroke="#e0a800" stroke-width="1.2"/></g>' +
      '</svg>',
    hello:  ['Hi Ale! I am Lumi!', 'Hello, my friend!', 'Yay, you are back!', 'Let’s read together!'],
    praise: ['Great job!', 'You got it!', 'Sparkly!', 'Wonderful!', 'Yes!', 'Super reading!', 'Magic!', 'Way to go!'],
    hints:  ['Hmm, let’s look again.', 'Almost! Try once more.', 'Let’s listen again.'],
    cheer:  ['You did it! The fairies are so proud!', 'All done! What a great reader!', 'Hooray! Great playing!']
  },

  gift: '🎁',
  bookIcon: '🌟',
  sparkles: ['✨', '🌸', '💖', '⭐', '🦋'],

  stickers: [
    ['🦋','a butterfly'],['🌸','a blossom'],['🌷','a tulip'],['🌼','a daisy'],['🍄','a mushroom'],['🐞','a ladybug'],
    ['🐝','a bee'],['🌈','a rainbow'],['⭐','a star'],['🌙','a moon'],['💎','a gem'],['👑','a crown'],
    ['🦄','a unicorn'],['🐌','a snail'],['🐸','a frog'],['🍓','a strawberry'],['🧁','a cupcake'],['🎀','a bow'],
    ['🐇','a bunny'],['🦔','a hedgehog'],['🌻','a sunflower'],['🐦','a bird'],['🍒','cherries'],['🧚','a fairy']
  ],

  scene: {
    name: 'Fairy Garden',
    place: 'garden',
    icon: '🏡',
    capacity: 8,
    prompt: 'Tap the garden to put it in!',
    full: 'Your fairy garden is full! Let’s make a new one!',
    items: [
      ['🌷','a tulip'],['🌼','a daisy'],['🍄','a mushroom house'],['🦋','a butterfly'],['🐞','a ladybug'],['🐝','a bee'],
      ['🌸','a blossom'],['⭐','a wishing star'],['🐌','a snail'],['🐇','a bunny'],['🧚','a fairy friend'],['🌻','a sunflower'],
      ['🐦','a bird'],['🍓','a strawberry'],['🦔','a hedgehog'],['💎','a sparkly gem']
    ],
    backdrops: [
      { name: 'Fairy Garden', bg: 'linear-gradient(#cfeaff 0%,#f4e6ff 52%,#bdeaae 52%,#8fd27f 100%)',
        deco: [['🌳', 10, 40, 70], ['🌳', 90, 38, 60], ['☁️', 25, 10, 44], ['☁️', 72, 16, 34], ['🌞', 88, 8, 40]] },
      { name: 'Moon Meadow', bg: 'linear-gradient(#3b2f7a 0%,#7a5cc7 52%,#6fbf8a 52%,#3f9a62 100%)',
        deco: [['🌙', 84, 9, 46], ['✨', 20, 12, 30], ['✨', 55, 20, 24], ['🌲', 10, 40, 64], ['🌲', 92, 42, 56]] },
      { name: 'Rainbow Hill', bg: 'linear-gradient(#ffe7f3 0%,#e6f3ff 50%,#c7ef9f 50%,#9ad76a 100%)',
        deco: [['🌈', 50, 14, 90], ['🌳', 8, 40, 60], ['🏰', 88, 38, 58]] }
    ]
  },

  /* Extra Spell-a-Word words. p = phonics pattern (cvc | blend | digraph); g = letter tiles when a tile holds 2 letters. */
  words: [
    { w: 'elf',  e: '🧝', p: 'cvc' },
    { w: 'web',  e: '🕸️', p: 'cvc' },
    { w: 'frog', e: '🐸', p: 'blend' },
    { w: 'ring', e: '💍', p: 'digraph', g: ['r','i','ng'] }
  ]
};
