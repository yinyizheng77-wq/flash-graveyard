# Structure — Flash Graveyard

```
flash-graveyard/
  index.html            # hub + game screens, loads styles.css + src/hub.js
  styles.css            # graveyard theme, responsive layout
  src/
    hub.js              # screen router + tombstone rendering
    souls.js            # SoulBank (localStorage + memory fallback)
    sound.js            # procedural WebAudio SFX
    logic/              # pure game logic, no DOM
      snake.js
      breakout.js
      memory.js
    games/              # UI controllers (DOM/canvas/input)
      snake-ui.js
      breakout-ui.js
      memory-ui.js
  tests/                # node:test suites, run with `npm test`
    snake.test.js
    breakout.test.js
    memory.test.js
    souls.test.js
    property.test.js    # randomized invariant (property-based) tests
    playthrough.test.js # scripted end-to-end game simulations
  .kiro/
    specs/              # one folder per feature: requirements/design/tasks
    steering/           # product.md, tech.md, structure.md
    hooks/              # automation (see hooks README)
  README.md
  KIRO-USAGE.md         # how Kiro was used (honest, evidence-based)
  LICENSE               # MIT
```

## Naming
- Files: kebab-case. Game ids: `snake`, `breakout`, `memory`.
- localStorage key: `flash-graveyard:v1`.
- Test files mirror the module they test: `src/logic/snake.js` ->
  `tests/snake.test.js`.
