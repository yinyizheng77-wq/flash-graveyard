# Design — Flash Graveyard Hub

## Overview
A single-page app (`index.html`, no build step). The hub is a `<section>`
with three tombstone cards. Each game is a separate screen section managed
by `src/hub.js`. Shared state lives in `src/souls.js` (souls + best scores
in `localStorage`, in-memory fallback). Sound is procedural WebAudio
(`src/sound.js`).

## Architecture
```
index.html          — hub + three game screens, loads styles.css + src/hub.js
styles.css          — graveyard theme (dark purple/green, tombstone cards)
src/hub.js          — screen router, tombstone rendering, soul display
src/souls.js        — SoulBank: get/add souls, get/set best per game
src/sound.js        — Sfx: play(name) with oscillator envelopes
src/games/*.js      — one UI controller per game (canvas/DOM + input)
src/logic/*.js      — pure game logic, no DOM (unit + property tested)
```

## Components and Interfaces
- `SoulBank(storage)` — `getSouls()`, `addSouls(n)`, `getBest(game)`,
  `setBest(game, score)`, `bankGameScore(game, score)` (adds souls and
  updates best; souls awarded = `floor(score / 10)`, min 1 per played game
  that scores > 0).
- `Sfx` — `unlock()` (called on first user gesture), `play('click' |
  'eat' | 'die' | 'win' | 'flip' | 'match' | 'break' | 'launch')`.
  Every sound is a short oscillator envelope; no audio files.
- `showScreen(name)` — toggles `.active` on `#screen-hub`,
  `#screen-snake`, `#screen-breakout`, `#screen-memory`.

## Data Model
`localStorage` key `flash-graveyard:v1`:
```json
{ "souls": 0, "best": { "snake": 0, "breakout": 0, "memory": 0 } }
```

## Correctness / Testing
- `tests/souls.test.js`: banking, best-score updates, storage failure
  fallback, soul award formula.
- Property test: souls total is monotonically non-decreasing across any
  sequence of banked games; best score equals max of all banked scores.

## Visual Design
Dark night palette (`#0d0a1a` background, `#7dff5e` ghost-green accents,
`#b388ff` purple). Tombstones are rounded-top gray cards with engraved
names. Floating ghost emoji drift via CSS animation (disabled under
`prefers-reduced-motion`). Font stack: system fonts only.
