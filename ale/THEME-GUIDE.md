# Making a new theme for Ale's Games (about 10 minutes)

A theme changes the colors, mascot, game names, stickers, reward scene and a few extra
words. Learning content (letters, word lists, levels) is never part of a theme.

Everything a theme has lives in **one file**: `ale/themes/<id>.js`. No other code changes.

## Steps

1. **Copy** `ale/themes/fairy.js` to `ale/themes/<id>.js` (for example `space.js`).
   Use a short lowercase id with no spaces.
2. **Change the first line** so it registers your id:
   `(window.ALE_THEMES = window.ALE_THEMES || {}).space = {`, and set `id: 'space'`.
3. **Fill in the fields** using the template below.
4. **Add two lines** so the app loads the file and caches it for offline use:
   - in `ale/index.html`, next to the other theme lines: `<script src="themes/space.js"></script>`
   - in `ale/sw.js`, add `'./themes/space.js'` to `FILES`, and bump `VERSION` (for example `ale-v3` to `ale-v4`).
5. **Try it**: open `.../ale/?theme=space`, or pick it in the parent settings (hold the gear for 3 seconds).
6. **Check**: run the tests (`cd tests && npm test`). Add `'space'` to the theme lists in
   `tests/ale.spec.js` and `tests/site.spec.js` so every game is tested with your theme.

## Rules

- **Original art only.** No Disney or other trademarked characters, names or pictures
  (no Tinker Bell, no named princesses, no movie characters). Generic emoji (🧚 🦄 👑) are fine.
- **Emoji and inline SVG only.** No image files and no web fonts, so the app works offline.
  Avoid very new emoji (Unicode 14 or later, such as 🫧 🪸 🪼 🪽). Older Android phones show them as empty boxes.
- **Keep it light.** About 30% theme flavor. Game names should still say what the game is
  ("Word Family Reef" and not just "Reef").
- **Contrast.** White text sits on the `games.*.color` gradients, so keep them mid-to-dark.
  `ink` and `tile-ink` must be dark enough to read on white.

## Field-by-field template

```js
(window.ALE_THEMES = window.ALE_THEMES || {}).space = {
  id: 'space',                 // must match the name after ALE_THEMES.
  name: 'Space Party',         // shown in the parent theme picker
  icon: '🚀',                  // shown in the parent theme picker

  title: { app: "Ale's Games",   // browser tab title
           home: "Ale's Games" },// big title on the home screen (keep it short, ~12 letters)

  // Home tiles and game screens. `icon` is a little HTML: <span class="em"> for emoji, <span class="tx"> for letters.
  // `color` is any CSS background (a gradient looks best).
  games: {
    spell:    { name: 'Spell-a-Word',      icon: '<span class="em">🚀</span><span class="tx">abc</span>', color: 'linear-gradient(#7aa0ff,#3d5fe0)' },
    family:   { name: 'Word Family Planets', icon: '<span class="em">🪐</span><span class="tx">-at</span>', color: '...',
                token: '⭐',   // the little picture on each word card and stacked in the pots
                pot:   '🪐' }, // the picture at the bottom of each pot
    sight:    { name: 'Sight Word Hunt',   icon: '...', color: '...' },
    readpick: { name: 'Read & Pick',       icon: '...', color: '...' },
    warm:     { name: 'Warm-ups',          icon: '...', color: '...' },   // opens the two warm-up games
    letters:  { name: 'Letter Lake',       icon: '...', color: '...' },
    sounds:   { name: 'Sound Sort',        icon: '...', color: '...' }
  },

  // Colors as CSS variables (all 15 keys are needed).
  palette: {
    'primary': '#…', 'primary-dark': '#…',  // main color, buttons, borders
    'accent': '#…',  'accent-dark': '#…',   // highlights: the next letter slot, the rhyme part of a word
    'ink': '#…',                            // normal text (dark)
    'card': '#ffffff',                      // card and button background
    'line': '#…',                           // soft inner line on letter tiles
    'good': '#2ec27e',                      // green ring on a right answer
    'glow': '#ffd23f',                      // yellow "look here" glow
    'dot': '#ffffff', 'dot-ring': '#…', 'dot-on': '#…',   // round-progress dots
    'slot': '#…',                           // empty letter slot
    'tile-ink': '#…'                        // letters on tiles and word cards (dark)
  },

  // Screen backgrounds (any CSS background). All keys are needed.
  backgrounds: { app, home, spell, family, sight, readpick, warm, letters, sounds, finish, book, parent },

  mascot: {
    name: 'Nova',
    svg: '<svg viewBox="0 0 100 100" ...> ... <g class="arm"> ... </g></svg>',
    // Draw on a 100x100 grid. Put the waving arm (or fin, or tentacle) in <g class="arm">.
    // It swings around the point (62, 58), so put the shoulder there.
    hello:  ['Hi Ale! I am Nova!', ...],   // when she taps the mascot on the home screen
    praise: ['Great job!', ...],           // after a right answer (keep these short)
    hints:  ['Hmm, let’s look again.', ...], // after a wrong answer (gentle, never "wrong" or "no")
    cheer:  ['You did it!', ...]           // at the end of a session
  },

  gift: '🎁',              // the 3 presents at the end of a session
  bookIcon: '🌟',          // the sticker-book button on the home screen
  sparkles: ['✨','⭐','💫'], // confetti on right answers

  stickers: [['🚀','a rocket'], ...],   // 24 is a good number. [emoji, what the voice says: "You got a rocket!"]

  scene: {
    name: 'Space Station',  // read out by screen readers
    place: 'sky',           // a short word for the place
    icon: '🛸',              // the scene button on the home screen
    capacity: 8,            // items before the scene is full and a new one starts
    prompt: 'Tap the sky to put it in!',
    full: 'Your space station is full! Let’s make a new one!',
    items: [['🪐','a planet'], ...],    // what she earns and places, [emoji, spoken name]
    backdrops: [            // one is used per scene, in order, then they repeat
      { name: 'Night Sky', bg: 'linear-gradient(#0b1440,#3a2f8a)',
        deco: [['🌙', 80, 10, 46]] }    // fixed decorations: [emoji, x%, y%, size in px]
    ]
  },

  // Optional extra Spell-a-Word words. They only appear at the level that matches their pattern:
  // 'cvc' (3 letters, short vowel), 'blend' (4 letters like frog), 'digraph' (sh, ch, th, ck, ng).
  // For digraph words give the tiles in g, with the digraph as one tile.
  words: [
    { w: 'sun',  e: '☀️', p: 'cvc' },
    { w: 'moth', e: '🦋', p: 'digraph', g: ['m','o','th'] }   // only if the picture really matches!
  ]
};
```

## Checklist before you ship

- [ ] Every home tile has a short name and a clear icon at phone size (320 px wide).
- [ ] Text on tiles is readable (white on a mid/dark color).
- [ ] The mascot looks right small (46 px, in the top bar) and big (finish screen).
- [ ] Praise and hint lines sound kind when spoken aloud.
- [ ] Each theme word's picture really shows that word.
- [ ] `ale/sw.js` lists the new file and `VERSION` is bumped.
