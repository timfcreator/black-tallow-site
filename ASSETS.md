# Assets and licences

Every font and image the site uses, where it came from, and its licence.

## Fonts

| File | What | Source | Licence |
|---|---|---|---|
| `src/assets/fonts/montserrat/Montserrat-SemiBold-latin.woff2` | Montserrat SemiBold, version 7.200, cut down to the Latin character set and saved as WOFF2 (25 KB) | [The Montserrat Project](https://github.com/JulietaUla/Montserrat) | SIL Open Font License 1.1, text in `src/assets/fonts/montserrat/OFL.txt`. Montserrat has no Reserved Font Name, so the cut-down file keeps its name. |

**Dystopian Canticle** by Scapholène (SIL Open Font License 1.1, Reserved Font Name "Dystopian Canticle")
is the typeface of the Black Tallow wordmark. The wordmark ships only as part of the images below; no font
file of it is published. The licence does not restrict documents and images made with the font.

**JSL Blackletter** is not used.

## Images

> **TEMPORARY:** the five PNGs in `src/assets/art/` were cut from the Steam capsule art for the first build.
> Replace each with a final export of the same name and size, then run `npm run images`.

| Source (in `src/assets/art/`) | Size | Published as | Licence |
|---|---|---|---|
| `hero-wide.png` | 2400 × 1200 | `src/assets/img/hero-wide-1200.webp`, `-2400.webp` | Original Black Tallow art, all rights reserved. <!-- TODO: user to confirm the credit line --> |
| `hero-stacked.png` | 1080 × 1350 | `src/assets/img/hero-stacked-540.webp`, `-1080.webp` | as above |
| `wordmark.png` | 695 × 234 | `src/assets/img/wordmark-695.webp` | as above |
| `og-image.png` | 1200 × 630 | `src/assets/img/og-image.png` (the link preview) | as above |
| `candle.png` | 512 × 512 | `src/assets/icons/`: `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` | as above |
| `candle-32.png` (optional) | 32 × 32 | `favicon.ico`, when present | as above |

| Other images | What | Licence |
|---|---|---|
| `src/devlog/img/example-candle.png` | The candle at 400 × 400, used only by the example post (a draft, never published) | Original Black Tallow art, all rights reserved |

Pictures added to posts (`src/devlog/img/`) and to the home page's blocks (`src/assets/img/`, `src/assets/video/`)
belong in these tables too, with where they came from.
