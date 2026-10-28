# Word Quest: 220 Dolch words in 45 days

Offline tablet app (made for a Kindle Fire; works in any modern browser) that teaches a kindergartener to **read, say and write** the 220 Dolch sight words (Pre-Primer to Third Grade, in the order of the supplied list).

Live at `https://bigogreadvisory.github.io/Daughters/dolch/`. On the Fire tablet open it in Silk, then use the menu to add it to the home screen. It works offline after the first load.

## Editions, Kindle and replay

- This folder is Ale's edition (45 days by the calendar). `anawords/` and `sightwords/` use the same code at the child's own pace (lessons, no calendar). The code is in `../shared/`.
- **Replay:** tap any finished day (or lesson) on the path to play it again. A replay does not count as a new day, does not change the streak and cannot rush the review spacing (a skill only moves up if it was due anyway).
- **Kindle Fire:** see `../docs/KINDLE.md`. Silk is detected automatically and gets bigger buttons.

## How the 45 days work

| Days | What happens |
|---|---|
| 1 to 37 | About 6 new words a day (220 words by day 37). A day that was missed is made up the next day (up to 12 new words). |
| 38 to 45 | No new words. Review only, weakest words first. Day 45 is the longest review: the final challenge. |
| After 45 | "Extra practice" keeps drilling the weakest words. |

A daily session is about 15 minutes, and it can be stopped with the X and continued later.

### A day's quest

New words come in groups of three:

1. **Meet**: the word is shown big and spoken, spelled out letter by letter, used in a sentence, said by the child (with optional record-and-listen), then traced twice with a finger.
2. **Read**: hear the word and tap it among four look-alike words.
3. **Say**: read the word aloud, then read its sentence.
4. **Spell**: build the word from letter tiles (the word is shown for the first practice, then hidden).

Then a **review** of older words, sized to a time budget. Review tasks per skill:

- **Read**: pick the word you hear, or find the word in a sentence.
- **Say**: read the word and sentence aloud.
- **Write**: spell with tiles, and later look, hide, write from memory on the pad and compare.

### Spaced review

Each word has three skills (read, say, write). Each skill moves up a box when it is right on the first try and down one when it is wrong. The higher the box, the longer the gap before the word comes back (1, 2, 4, 7, 12... days). Wrong answers are repeated once at the end of the session. In the last two weeks the gaps are squeezed so every word gets reviewed again before day 45. Reading aloud a word counts for read as well as say.

Nothing is timed against the child, there is no losing, and a wrong tap just says the word again.

## What the app can and cannot check

- **Read and spell** are checked by the app (right or wrong).
- **Tracing** is checked by the app (did the finger cover the letters without scribbling).
- **Saying** and **writing from memory** cannot be checked by a tablet offline. The child taps "I said it" and "Yes, it matches". For honest data, turn on **grown-up confirm** in the parent panel (press and hold the confirm button), or just sit with her for the Say and Write tasks. These are the two skills that need a person.
- Speech uses the tablet's built-in voice (`speechSynthesis`). If the Fire tablet has no English voice, install one in Fire OS Settings > Keyboard & Language > Text-to-speech, otherwise the app is silent.

## Grown-up panel

On the home screen press and hold the small gear for 3 seconds. It shows progress for every word (read, say, write), the words that need the most help, and lets you change the name, the start date (day 1), voice speed, and sounds. "Erase all progress" needs a second tap.

## Realistic expectations

220 words in 45 days is about 5 new words a day, which is a lot for a 6-year-old. The first 92 words (Pre-Primer and Primer) are the ones that matter most for kindergarten; they are taught first and get the most review. Expect solid reading of most words by day 45, with saying and writing a little behind. Real books are what make the words stick: read a short picture book together every day and have her point out any word she knows.

## Files

```
index.html            page shell; the app itself is ../shared/app.js and app.css
config.js             this edition's settings (pace, name, colour)
sw.js                 offline cache (bump VERSION when you change any file, including ../shared/)
manifest.webmanifest  install info
```

Progress is stored only on the device (`dolch.v1`). No accounts, no ads, no network calls. The microphone recording (optional) is played back once and never stored or sent.

## Tests

`cd tests && npm install && npx playwright test dolch.spec.js`
