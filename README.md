# Play and Learn

Short offline learning games for a young child, on an Android phone (Chrome, installable as a home-screen app).

- **Letter Lake**: match little and big letters
- **Sound Sort**: same/different sounds, then first, last and middle sounds
- **Sorting Shop**: sort by color, size, shape, then switching rules
- **Word Match**: read a short word, tap the matching picture

No accounts, ads, analytics or network calls. Progress is stored only in the phone's browser storage.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app (HTML, CSS, JS) |
| `sw.js` | Service worker: caches the app so it works offline |
| `manifest.webmanifest` | Lets Chrome install it to the home screen |
| `icon-*.png` | App icons |

## Updating

1. Edit `index.html` (or other files) and commit to `main`.
2. In `sw.js`, change `VERSION` (for example `pl-v1` to `pl-v2`). Without this, phones keep showing the cached old copy.
3. GitHub Pages redeploys automatically. Phones pick up the update the next time the app is opened with a connection (it may take a second open).

## Parent settings

On the home screen, press and hold the small gear for 3 seconds. Sound on/off, rounds per session (6/10/14), progress overview, reset.
