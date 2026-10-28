# Word Quest on a Kindle Fire

Three editions, one codebase (`shared/`):

| Edition | Web address | For | Pace |
|---|---|---|---|
| Word Quest (`dolch/`) | `https://bigogreadvisory.github.io/Daughters/dolch/` | Ale | 45 days, by the calendar |
| Ana's Word Quest (`anawords/`) | `https://bigogreadvisory.github.io/Daughters/anawords/` | Ana | her own pace: lessons of 3 words, gentler tasks |
| Sight Word Quest (`sightwords/`) | `https://bigogreadvisory.github.io/Daughters/sightwords/` | for sale | own pace: lessons of 5 words (grown-up can pick 2 to 8) |

## Way 1: the web app (no install file)

1. On the Fire tablet open **Silk** and go to the address above (Wi-Fi on).
2. Play one lesson so everything downloads. After that it works with Wi-Fi off.
3. Tap the **⋮ menu** in Silk and choose **Add to Home Screen** (if your Fire OS version has it; otherwise keep it as a bookmark).

The app notices Silk and switches on bigger buttons by itself. In the grown-up panel (hold the gear for 3 seconds) the "Kindle / tablet mode" setting can force it on or off. Adding `?kindle=1` to any address also turns it on.

## Way 2: the APK (an app icon, no browser bars)

The APK is a thin wrapper around the same files. It is built by GitHub, not on a laptop:

1. On GitHub open the repository > **Actions** > **Build APK** > **Run workflow**, pick an edition, run it (about 5 minutes).
2. Word Quest and Ana's Word Quest appear under **Releases** as `apk-dolch-N` and `apk-anawords-N`. Sight Word Quest (the one for sale) is only an **artifact** on the run page, because releases on this public repository are public downloads.
3. Download the `.apk` on the Fire tablet (Silk > the release page), or on a computer and copy it over USB.
4. On the Fire: **Settings > Security & Privacy > Apps from Unknown Sources**, allow Silk (or Files). Open the downloaded `.apk` and tap **Install**.

The APK is signed with a temporary debug key. That is fine for your own tablets. To sell it in the **Amazon Appstore** it has to be signed with your own release key and uploaded through your Amazon developer account; see `sightwords/STORE-LISTING.md`.

## Progress and resets

Progress lives only on the tablet (browser storage). The web app and the APK keep **separate** progress, and clearing Silk's site data erases the web version's progress. Pick one way per child.
