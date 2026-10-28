# Sight Word Quest: store listing and packaging notes

The sales channel is not decided yet. This is what is ready whichever way you go.

## Product
- Name: **Sight Word Quest** (working title; change `title` in `config.js` and `name` in `manifest.webmanifest`)
- What it does: teaches a child to **read, say and write** the 220 Dolch sight words (Pre-Primer to Third Grade) at their own pace.
- Ages 4 to 8. Offline. No ads, no accounts, no in-app purchases, no data collected.
- Privacy policy: `https://bigogreadvisory.github.io/Daughters/sightwords/privacy.html`

## Short description (80 characters)
Read, say and write 220 sight words, one friendly lesson at a time. Works offline.

## Long description
Sight Word Quest helps early readers learn the 220 most common words in English, the Dolch list, with short lessons they can finish in about ten minutes. Every word is taught three ways: they **read** it (hear it and find it), **say** it (read it aloud, then the sentence), and **write** it (trace it, build it from letter tiles, then write it from memory).

- Self-paced: no calendar, no timers, no losing. Finish a lesson to unlock the next and earn a sticker.
- Smart review: words come back at just the right time so they stick.
- Replay any finished lesson with one tap.
- A grown-up panel (press and hold the gear) shows progress for every word, lets you pick 2 to 8 new words per lesson, and adjusts voice speed.
- Designed for tablets, with a reading-friendly typeface (Andika).
- Private: no accounts, no ads, no internet needed, nothing leaves the device.

## Before you sell
1. **Decide where the code lives.** This repository is public, so the web version and the source are free for anyone. If the product is the thing you sell, move `sightwords/` and `shared/` to a private repository and publish only a build.
2. **Amazon Appstore:** create a developer account, run the **Build APK** workflow for `sightwords`, sign the APK with your own release key (keep that key safe), and upload it with screenshots and the privacy policy link above. Amazon reviews apps before listing them.
3. **Your own site / Gumroad / Etsy:** sell a download of the APK plus a short install sheet (`docs/KINDLE.md`).
4. Name check: search the name you choose in the Amazon Appstore, Google Play and the US trademark database before you commit to it. "Dolch" is the name of a public word list; do not use it in the product name.
5. The word list and the example sentences in `shared/words.js` were written for this project.
