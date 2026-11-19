# Tasks — Grave Snake

- [x] 1. Pure snake logic
  - `src/logic/snake.js`: create/step/setDirection, food spawn, collisions
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Canvas UI + input
  - `src/games/snake-ui.js`: render loop, keyboard + swipe, pause overlay
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Difficulty ramp
  - Level up every 5 souls; interval shrinks 150ms -> 70ms floor
  - _Requirements: 2.1, 2.2_

- [x] 4. Scoring hookup
  - Bank score to hub on game over; update best
  - _Requirements: 4.1, 4.2_

- [x] 5. Tests
  - `tests/snake.test.js` + property invariants in `tests/property.test.js`
  - Run `npm test`, fix all failures
  - _Requirements: 1.1, 1.2, 1.3_
