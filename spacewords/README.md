# Space Words (web version)

The games from [ControlFreakEv/SpaceWords](https://github.com/ControlFreakEv/SpaceWords) (its
`app/src/main/assets/www` folder), served as an installable web app instead of an Android APK.
The game pages are the originals; this folder adds only the web wrapper:

| File | What it does |
|---|---|
| `manifest.webmanifest`, `icon-*.png` | makes it installable (Add to Home screen) |
| `sw.js` | offline cache. Pages, scripts, pictures and fonts (`precache.json`) are cached at install; the ~4,700 voice clips (60 MB) are cached in the background and as they play |
| `pwa.js` | registers the worker, asks for the background clip download, hides the hub's Back button (nothing to go back to in a browser) |
| `precache.json` | list of files the worker caches at install (`node tools/make-precache.mjs` rebuilds it) |
| `tools/` | icon and precache generators, not served |

Changes to the originals: one line in `hub.js` (the "Grown-ups (hold) / hide for N hours" panel only
shows inside the Skylight frame app) and the `<head>`/`pwa.js` lines added to each page.

Without the Android bridges, `speech.js` plays the recorded clips with `<audio>` and falls back to the
browser's own text-to-speech for anything missing. Stars and settings stay in `localStorage`, like the
other two apps (`wordhop:`, `saucer:`, `math:` ... keys).

## Updating

1. Edit files, commit to `main`.
2. Bump `VERSION` in `sw.js` (`spacewords-shell-v1` to `-v2`), or phones keep the old pages.
3. Added or renamed files (not clips): run `node tools/make-precache.mjs`.
4. New clips just work (cached when played); the background download picks up anything in
   `audio/index.json` it doesn't have yet.

## Credits and licence note

Pictures: Twemoji (CC-BY 4.0). Fonts: Andika and Fredoka (SIL OFL). Word lists: Dolch.

The voice clips were recorded by the original author with edge-tts, an unofficial client for
Microsoft's text-to-speech. The original README asks that they stay private. This repo is public,
so either accept that, make the repo private (GitHub Pages on a private repo needs a paid plan), or
delete `audio/` and `audio/index.json`; the games then use the phone's own text-to-speech voice.
