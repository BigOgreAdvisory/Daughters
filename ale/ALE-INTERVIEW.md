# 10 fun questions for Ale (to build her own theme)

Ask these over a snack or in the car. Write down her answers word for word. Each one
fills a field in a theme file (see `THEME-GUIDE.md`). Silly answers are great.

| # | Ask Ale | Fills this theme field | Tips |
|---|---|---|---|
| 1 | "If you had a magic helper friend, what would it be? A fairy, an animal, a robot…?" | `mascot.svg` (what to draw) and `icon` | Keep it an original character, not one from a movie. |
| 2 | "What would you name your helper?" | `mascot.name` and the first `mascot.hello` line ("Hi Ale! I am …!") | Short names are easiest for the voice. |
| 3 | "What should your helper say when you get one right?" | `mascot.praise` | Collect 4–8. Her own words make it feel like hers. |
| 4 | "And when something is tricky, what could your helper say to help you?" | `mascot.hints` | Keep only the kind ones ("Let's try again!"). |
| 5 | "What are your three favorite colors?" | `palette.primary`, `palette.accent`, and the `games.*.color` gradients | Use the darkest one for `primary`, so white text stays readable. |
| 6 | "Where would you love to visit, a real or a pretend place?" | `scene.name`, `scene.place`, `scene.backdrops` (sky and ground colors), `name` | For example a castle garden, the moon, a jungle or the beach. |
| 7 | "What things would you put in that place?" | `scene.items` | 12–16 emoji. Ask "What else?" a few times. |
| 8 | "What are your favorite animals?" | `stickers` (24) and some `scene.items` | Mix animals with treats and objects. |
| 9 | "What do you think is the most sparkly or magic thing?" | `sparkles` (the confetti) and `gift` | Three to five emoji. |
| 10 | "What should the games be called in your world?" (Give her the plain names first: spelling, word families, sight words, reading.) | `games.*.name` and `games.*.icon` | Keep the plain word in the name, like "Word Family Castle". |

**Bonus question:** "Which short words do you want to learn to spell?" If they fit
her level (3 letters like *cat*, 4 letters like *frog*, or *sh/ch/th* words like *ship*)
and an emoji really shows them, add them to `words`.
