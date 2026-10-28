# Daughters: learning games

Five separate offline learning-game apps, hosted on GitHub Pages:

| URL | App | For |
|---|---|---|
| `https://bigogreadvisory.github.io/Daughters/` | Chooser page (five big buttons) | |
| `https://bigogreadvisory.github.io/Daughters/ale/` | **Ale's Games**: reading (Spell-a-Word, Word Family Garden, Sight Word Hunt, Read & Pick, Warm-ups) | Ale, 6 |
| `https://bigogreadvisory.github.io/Daughters/ana/` | **Ana's Games**: Letter Lake, Sound Sort, Sorting Shop, Word Match | Ana, 4 |
| `https://bigogreadvisory.github.io/Daughters/spacewords/` | **Space Words**: reading and math games with a recorded voice (web version of [ControlFreakEv/SpaceWords](https://github.com/ControlFreakEv/SpaceWords); see `spacewords/README.md`) | K to 3rd grade |
| `https://bigogreadvisory.github.io/Daughters/dolch/` | **Word Quest**: a 45-day course that teaches all 220 Dolch sight words (read, say and write each one) with spaced review; see `dolch/README.md` | Ale, 6 (kindergarten) |
| `https://bigogreadvisory.github.io/Daughters/anawords/` | **Ana's Word Quest**: the same 220 words at her own pace (lessons of 3 words, gentler tasks, no calendar) | Ana, 4 |
| `https://bigogreadvisory.github.io/Daughters/sightwords/` | **Sight Word Quest**: the unbranded, self-paced edition for sale (asks for a name on first run); not on the chooser page; see `sightwords/STORE-LISTING.md` | for sale |

Each app installs separately to the Android home screen (Chrome > menu > Add to Home screen / Install app)
and works offline. There are no accounts, ads, analytics or network calls. Progress is saved only on the
device (`playlearn.ale.v1` / `playlearn.ana.v1` / `dolch.v1`; Space Words uses its own `wordhop:`, `saucer:`, `math:`... keys).

## Layout

```
index.html            chooser (no service worker)
sw.js                 cleanup only: removes the worker from the first version, which was installed at the root
ana/                  Ana's app (index.html, sw.js, manifest, icons)
shared/               code and data used by the three Word Quest editions (app.js, app.css, words.js = the 220 words + sentences, fonts/)
dolch/ anawords/ sightwords/   the editions: index.html, config.js (pace, name, colours, which tasks), sw.js, manifest, icons
docs/KINDLE.md       installing on a Kindle Fire (web app and APK)
.github/workflows/   build-apk.yml: builds an APK of any edition on GitHub
spacewords/           Space Words (index.html hub + one page per game, sw.js, manifest, icons; audio/ holds the voice clips)
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
2. Bump `VERSION` in the `sw.js` of the app you changed (`ale/sw.js`, `ana/sw.js`, `spacewords/sw.js` or `dolch/sw.js`, `anawords/sw.js` or `sightwords/sw.js`). The files in `shared/` are cached by all three Word Quest editions, so bump all three, for example
   `ale-v1` to `ale-v2`. Without this, phones keep showing the cached old copy.
3. GitHub Pages redeploys automatically. Phones pick up the update the next time the app is opened online
   (close it and open it once more).

## Tests

```
cd tests && npm install && npx playwright install chromium && npm test
```

## Parent settings

In either app, press and hold the small gear on the home screen for 3 seconds.
