# Design — Haunted Memory

## Overview
DOM-based card grid (CSS flip animation). Pure logic in
`src/logic/memory.js`, UI in `src/games/memory-ui.js`.

## Logic API (`src/logic/memory.js`)
```js
createGame({ pairs = 8, rng = Math.random } = {})
// -> { deck: [{id, symbol, faceUp, matched}], moves, matchedPairs,
//      totalPairs, status: 'playing' | 'won', flipped: [indices] }
flip(game, index) // returns events: 'flip' | 'match' | 'mismatch' | 'win' | 'ignored'
scoreFor(game)    // max(100, 1600 - 50 * (moves - totalPairs))
```
- Symbols are Halloween emoji (ghost, pumpkin, bat, spider, skull,
  witch, moon, coffin, + zombie, vampire, cauldron, eye for hard mode).
- `flip` ignores already-matched / already-flipped cards and a third
  flip while two are pending; the UI flips mismatches back after 700ms.

## UI
- CSS 3D flip on `.card` (`.flipped` class), responsive grid
  (4 columns easy, 6 columns hard on wide screens, 4 on phones).
- Moves + timer display; win overlay with score and "Play again".
- Sounds: `flip`, `match` (two-note chime), `win` (arpeggio).

## Correctness / Testing
- `tests/memory.test.js`: dealing, matching, mismatch, win, scoring.
- Property tests: the deck always contains exactly two of each symbol;
  matched cards never flip back; moves increment exactly once per two
  flips; the game is won exactly when all pairs are matched.
