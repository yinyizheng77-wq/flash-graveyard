# Tasks — Haunted Memory

- [x] 1. Pure memory logic
  - `src/logic/memory.js`: create/flip/scoreFor, seeded shuffle for tests
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1_

- [x] 2. DOM UI
  - `src/games/memory-ui.js`: grid render, flip animation, timer, win overlay
  - _Requirements: 1.1, 1.2, 3.1, 3.2_

- [x] 3. Difficulty select
  - Easy 4x4 (8 pairs) / Hard 6x4 (12 pairs) toggle before starting
  - _Requirements: 3.1, 3.2_

- [x] 4. Scoring hookup
  - Bank score to hub on win; update best; show time
  - _Requirements: 2.1, 2.2, 4.1, 4.2_

- [x] 5. Tests
  - `tests/memory.test.js` + property invariants
  - Run `npm test`, fix all failures
  - _Requirements: 1.2, 1.3, 2.1_
