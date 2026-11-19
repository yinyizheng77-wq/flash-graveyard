# 🪦 Flash Graveyard

**Dead Flash games, resurrected.** A Kiroween 2026 entry (category:
**Resurrection**).

Adobe Flash died in 2020. Its games didn't have to. Flash Graveyard
rebuilds three Flash-era classics in pure HTML5 + vanilla JavaScript and
buries them in one spooky hub:

| Game | What it is |
| --- | --- |
| 🐍 **Grave Snake** | Steer the ghost snake, eat glowing souls, don't bite yourself. Speeds up every 5 souls. |
| 🧱 **Crypt Breaker** | Breakout — smash the crypt bricks, clear the wall, level up. |
| 🪦 **Haunted Memory** | Flip tombstones, match Halloween spirits. Easy (8 pairs) / Hard (12 pairs). |

All three share one **soul** total and per-game best scores, stored
locally on your device. All art is CSS + emoji. All sound is procedural
WebAudio — no audio files, no images, no copyrighted material.

## Play it

No build step, no install. Any static host works:

```bash
# Option 1: just open it
open index.html

# Option 2: local server (needed for ES modules in some browsers)
npm run serve   # http://127.0.0.1:8080
# or: python3 -m http.server 8080
```

Works on desktop (keyboard + mouse) and phone (swipe / drag / tap).

## Controls

| Game | Controls |
| --- | --- |
| Grave Snake | Arrows / WASD / swipe to steer · Space or P pauses |
| Crypt Breaker | Mouse / drag / arrow keys to move the paddle · Click / Space launches |
| Haunted Memory | Click / tap cards to flip |

Esc pauses Snake. Every game has a "← Graveyard" button back to the hub.

## Tests

```bash
npm test   # node --test, zero dependencies
```

39 tests: unit tests for each game's logic, a `SoulBank` suite, scripted
end-to-end playthroughs (a greedy snake, a tracking paddle, a perfect
memory game), and hand-rolled property-based tests (randomized inputs,
universal invariants — food never spawns on the snake, score always
equals 10 × bricks broken, the memory deck always holds exactly two of
each symbol, souls never decrease).

## Project layout

```
index.html, styles.css     # hub + game screens, graveyard theme
src/
  hub.js                   # screen router + tombstone rendering
  souls.js                 # shared souls + best scores (localStorage)
  sound.js                 # procedural WebAudio SFX
  logic/                   # pure game logic, no DOM (tested in Node)
  games/                   # UI controllers (canvas / DOM / input)
tests/                     # node:test suites
.kiro/
  specs/                   # requirements / design / tasks per feature
  steering/                # product, tech, structure conventions
  hooks/                   # test-on-save + verify-on-stop automation
```

See [KIRO-USAGE.md](KIRO-USAGE.md) for how Kiro was used to build this.

## License

MIT — see [LICENSE](LICENSE).
