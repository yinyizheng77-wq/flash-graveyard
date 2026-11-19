# Tech — Flash Graveyard

## Stack
- Vanilla HTML + CSS + JavaScript (ES modules). No framework, no
  bundler, no dependencies — the site must run from any static host
  (GitHub Pages) by opening `index.html`.
- Node.js (built-in test runner only) for tests: `npm test` runs
  `node --test tests/`. No test dependencies either; property tests are
  hand-rolled randomized invariant checks in `tests/property.test.js`.

## Rules
- Game rules live in pure modules under `src/logic/` with **zero DOM
  access**, so they can be unit-tested and property-tested in Node.
- UI controllers under `src/games/` own the DOM/canvas/input and call
  the logic modules. No game logic in UI files.
- Shared services: `src/souls.js` (persistence), `src/sound.js`
  (WebAudio SFX). UI files never touch `localStorage` directly.
- Every new feature starts in `.kiro/specs/<feature>/` (requirements,
  design, tasks) and is implemented against the spec. Keep the spec
  tasks file honest: check a box only when its tests pass.
- Run `npm test` before every commit. A failing test blocks the commit.
