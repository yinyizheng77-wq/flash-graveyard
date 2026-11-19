# Tasks — Flash Graveyard Hub

- [x] 1. Create the app shell
  - `index.html` with hub section, three game screens, and a shared header
    showing the soul total
  - `styles.css` with the graveyard theme and responsive layout
  - _Requirements: 1.1, 1.3, 4.1_

- [x] 2. Implement the soul bank
  - `src/souls.js` with `SoulBank` (localStorage + in-memory fallback)
  - Soul award rule: `max(1, floor(score / 10))` per finished game
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Implement hub navigation
  - `src/hub.js`: tombstone rendering with best scores, screen router,
    back-to-hub controls, Escape handling
  - _Requirements: 1.2, 3.1, 3.2, 3.3_

- [x] 4. Implement procedural sound
  - `src/sound.js`: WebAudio oscillator SFX, unlocked on first gesture,
    mute toggle persisted in localStorage
  - _Requirements: 4.3_

- [x] 5. Tests for the hub
  - `tests/souls.test.js` (unit + property invariants)
  - Run `npm test` and fix all failures
  - _Requirements: 2.1, 2.2_
