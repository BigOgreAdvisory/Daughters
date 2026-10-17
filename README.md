# Daughters: learning games

Two separate offline learning-game apps, hosted on GitHub Pages:

| URL | App | For |
|---|---|---|
| `https://bigogreadvisory.github.io/Daughters/` | Chooser page (two big buttons) | |
| `https://bigogreadvisory.github.io/Daughters/ale/` | **Ale's Games**: reading (Spell-a-Word, Word Family Garden, Sight Word Hunt, Read & Pick, Warm-ups) | Ale, 6 |
| `https://bigogreadvisory.github.io/Daughters/ana/` | **Ana's Games**: Letter Lake, Sound Sort, Sorting Shop, Word Match | Ana, 4 |

Each app installs separately to the Android home screen (Chrome > menu > Add to Home screen / Install app)
and works offline. There are no accounts, ads, analytics or network calls. Progress is saved only on the
phone (`playlearn.ale.v1` / `playlearn.ana.v1`).

## Layout

```
index.html            chooser (no service worker)
sw.js                 cleanup only: removes the worker from the first version, which was installed at the root
ana/                  Ana's app (index.html, sw.js, manifest, icons)
ale/                  Ale's app
  index.html ale.css  shell and styles
  js/engine.js        storage, speech, levels, rewards, parent settings
  js/words.js         phonics-sequenced word lists (each word is tagged cvc / blend / digraph / sight)
  js/spell.js family.js sight.js readpick.js warmup.js   the games
  themes/fairy.js ocean.js   one data file per theme (THEME-GUIDE.md)
tests/                Playwright tests (not used by the apps)
```

## Updating

1. Edit the files and commit to `main`.
2. Bump `VERSION` in the `sw.js` of the app you changed (`ale/sw.js` or `ana/sw.js`), for example
   `ale-v1` to `ale-v2`. Without this, phones keep showing the cached old copy.
3. GitHub Pages redeploys automatically. Phones pick up the update the next time the app is opened online
   (close it and open it once more).

## Tests

```
cd tests && npm install && npx playwright install chromium && npm test
```

## Parent settings

In either app, press and hold the small gear on the home screen for 3 seconds.
