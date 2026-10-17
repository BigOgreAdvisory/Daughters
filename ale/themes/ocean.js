/* Theme: Ocean Friends. Proves a full reskin with zero code changes. See ../THEME-GUIDE.md. */
(window.ALE_THEMES = window.ALE_THEMES || {}).ocean = {
  id: 'ocean',
  name: 'Ocean Friends',
  icon: '🐙',

  title: { app: "Ale's Games", home: "Ale's Games" },

  games: {
    spell:    { name: 'Spell-a-Word',      icon: '<span class="em">🐚</span><span class="tx">abc</span>', color: 'linear-gradient(#5fd0e6,#1f9bbf)' },
    family:   { name: 'Word Family Reef',  icon: '<span class="em">🐙</span><span class="tx">-ug</span>', color: 'linear-gradient(#ff9f8f,#ef6a5a)',
                token: '🐠', pot: '🐚' },
    sight:    { name: 'Sight Word Dive',   icon: '<span class="em">🤿</span><span class="tx">the</span>', color: 'linear-gradient(#6fa8ff,#3d6fe0)' },
    readpick: { name: 'Read & Pick',       icon: '<span class="em">📖</span>', color: 'linear-gradient(#5fe0b4,#1fb487)' },
    warm:     { name: 'Warm-ups',          icon: '<span class="tx">aA</span><span class="em">🌊</span>', color: 'linear-gradient(#ffd27a,#f5a524)' },
    letters:  { name: 'Letter Lagoon',     icon: '<span class="tx">aA</span>', color: 'linear-gradient(#8fd3ff,#4ba7ef)' },
    sounds:   { name: 'Sound Shells',      icon: '<span class="em">👂🦀</span>', color: 'linear-gradient(#ffb0c8,#f06a96)' }
  },

  palette: {
    'primary': '#1f9bbf', 'primary-dark': '#137393', 'accent': '#ff7f6a', 'accent-dark': '#d9533f',
    'ink': '#173a52', 'card': '#ffffff', 'line': '#cbeaf4', 'good': '#22b37a', 'glow': '#ffd23f',
    'dot': '#ffffff', 'dot-ring': '#9fd8ea', 'dot-on': '#ff7f6a', 'slot': '#eaf8fc', 'tile-ink': '#0f5f7a'
  },

  backgrounds: {
    app:      'linear-gradient(#e3f7ff,#c9ecfa)',
    home:     'linear-gradient(#dff6ff 0%,#b6e6f7 60%,#f6e7c8 100%)',
    spell:    'linear-gradient(#e6fbff,#c6eef9)',
    family:   'linear-gradient(#d8f4ff 0%,#a9def2 70%,#f3e2bd 100%)',
    sight:    'linear-gradient(#e2efff,#c4dbff)',
    readpick: 'linear-gradient(#e4fff4,#c6f2e2)',
    warm:     'linear-gradient(#fff6dc,#d9f3ff)',
    letters:  'linear-gradient(#e2f4ff 0%,#bfe4ff 60%,#9fd3fa 100%)',
    sounds:   'linear-gradient(#fff0f4,#ffd7e3)',
    finish:   'linear-gradient(#e0f7ff,#fff1d6)',
    book:     'linear-gradient(#e6f8ff,#fff3dc)',
    parent:   '#f2f7fa'
  },

  mascot: {
    name: 'Splash',
    svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
      '<g fill="#ff9cb8" stroke="#e06a8c" stroke-width="2" stroke-linejoin="round">' +
        '<path d="M30 58 Q18 74 24 90 Q30 84 36 70Z"/><path d="M42 64 Q36 82 42 94 Q48 84 48 68Z"/>' +
        '<path d="M58 64 Q64 82 58 94 Q52 84 52 68Z"/><path d="M70 58 Q80 72 76 88 Q70 82 64 70Z"/></g>' +
      '<ellipse cx="50" cy="44" rx="27" ry="25" fill="#ff9cb8" stroke="#e06a8c" stroke-width="2"/>' +
      '<ellipse cx="41" cy="27" rx="6" ry="4" fill="#fff" opacity=".45"/>' +
      '<circle cx="41" cy="45" r="6" fill="#fff"/><circle cx="59" cy="45" r="6" fill="#fff"/>' +
      '<circle cx="42" cy="46" r="3.2" fill="#22324a"/><circle cx="60" cy="46" r="3.2" fill="#22324a"/>' +
      '<circle cx="43" cy="45" r="1" fill="#fff"/><circle cx="61" cy="45" r="1" fill="#fff"/>' +
      '<circle cx="34" cy="54" r="3.5" fill="#ff6f96" opacity=".6"/><circle cx="66" cy="54" r="3.5" fill="#ff6f96" opacity=".6"/>' +
      '<path d="M44 55 Q50 60 56 55" stroke="#9a3550" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<g class="arm"><path d="M72 52 Q86 44 86 30" stroke="#ff9cb8" stroke-width="7" fill="none" stroke-linecap="round"/>' +
        '<circle cx="87" cy="22" r="5" fill="#bfefff" stroke="#7cc7e0" stroke-width="1.5"/><circle cx="80" cy="13" r="3" fill="#bfefff" stroke="#7cc7e0" stroke-width="1.2"/></g>' +
      '</svg>',
    hello:  ['Hi Ale! I am Splash!', 'Hello, my friend!', 'Yay, you are back!', 'Let’s read together!'],
    praise: ['Great job!', 'You got it!', 'Splashtastic!', 'Wonderful!', 'Yes!', 'Super reading!', 'Fin-tastic!', 'Way to go!'],
    hints:  ['Hmm, let’s look again.', 'Almost! Try once more.', 'Let’s listen again.'],
    cheer:  ['You did it! All the fish are cheering!', 'All done! What a great reader!', 'Hooray! Great playing!']
  },

  gift: '🎁',
  bookIcon: '🐚',
  sparkles: ['💧', '✨', '⭐', '💙', '🐟'],

  stickers: [
    ['🐳','a whale'],['🐬','a dolphin'],['🐠','a fish'],['🐡','a puffer fish'],['🦀','a crab'],['🐙','an octopus'],
    ['🦑','a squid'],['🐢','a turtle'],['🦭','a seal'],['🐧','a penguin'],['🦈','a shark'],['🐚','a shell'],
    ['⭐','a starfish'],['🦐','a shrimp'],['🌊','a wave'],['⛵','a boat'],['🏝️','an island'],['🦞','a lobster'],
    ['🐋','a big whale'],['🦦','an otter'],['🦪','an oyster'],['🐟','a little fish'],['⚓','an anchor'],['🧜','a mermaid']
  ],

  scene: {
    name: 'Ocean Reef',
    place: 'reef',
    icon: '🐠',
    capacity: 8,
    prompt: 'Tap the water to put it in!',
    full: 'Your ocean reef is full! Let’s make a new one!',
    items: [
      ['🐠','a fish'],['🐡','a puffer fish'],['🦀','a crab'],['🐙','an octopus'],['🐢','a turtle'],['🐚','a shell'],
      ['🦐','a shrimp'],['🐬','a dolphin'],['🦑','a squid'],['🐳','a whale'],['⭐','a starfish'],['🦞','a lobster'],
      ['🧜','a mermaid friend'],['🐟','a little fish'],['🦭','a seal'],['🐋','a big whale']
    ],
    backdrops: [
      { name: 'Ocean Reef', bg: 'linear-gradient(#bff0ff 0%,#4fb8e0 55%,#2a8fbf 82%,#f2deb0 82%,#e6c98d 100%)',
        deco: [['🌿', 10, 78, 50], ['🌿', 90, 76, 44], ['💧', 20, 18, 28], ['💧', 76, 28, 22]] },
      { name: 'Deep Blue', bg: 'linear-gradient(#5fb4e8 0%,#1f5f9f 70%,#d9c08a 70%,#c4a66c 100%)',
        deco: [['💧', 30, 12, 26], ['💧', 70, 22, 20], ['🪨', 12, 62, 50]] },
      { name: 'Sunny Lagoon', bg: 'linear-gradient(#fff0c9 0%,#9fe6f2 38%,#43b9d6 80%,#f6e2b0 80%,#efd093 100%)',
        deco: [['🏝️', 84, 18, 56], ['☀️', 14, 8, 40], ['⛵', 50, 24, 38]] }
    ]
  },

  words: [
    { w: 'crab',  e: '🦀', p: 'blend' },
    { w: 'swim',  e: '🏊', p: 'blend' },
    { w: 'ship',  e: '🚢', p: 'digraph', g: ['sh','i','p'] },
    { w: 'fish',  e: '🐟', p: 'digraph', g: ['f','i','sh'] },
    { w: 'shell', e: '🐚', p: 'digraph', g: ['sh','e','l','l'] }
  ]
};
