# Tasks — Crypt Breaker

- [x] 1. Pure breakout logic
  - `src/logic/breakout.js`: create/step/movePaddle, collisions, levels
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1_

- [x] 2. Canvas UI + input
  - `src/games/breakout-ui.js`: render loop, mouse/touch/keys, launch
  - _Requirements: 3.1, 3.2_

- [x] 3. Levels and difficulty
  - Rows grow 4 -> 7, ball speed +25 px/s per level
  - _Requirements: 2.1, 2.2_

- [x] 4. Scoring hookup
  - Bank score to hub on game over; update best
  - _Requirements: 4.1, 4.2_

- [x] 5. Tests
  - `tests/breakout.test.js` + property invariants
  - Run `npm test`, fix all failures
  - _Requirements: 1.2, 1.4, 2.1_
