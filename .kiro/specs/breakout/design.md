# Design — Crypt Breaker

## Overview
Canvas breakout. Pure logic in `src/logic/breakout.js` (fixed-timestep
`step(dt)`), UI/controller in `src/games/breakout-ui.js`.

## Logic API (`src/logic/breakout.js`)
```js
createGame({ width = 480, height = 560 } = {})
// -> { paddle, ball, bricks: [{x,y,w,h,alive}], score, lives, level, state }
step(game, dt) // moves ball, resolves wall/paddle/brick collisions;
//   returns events: 'brick' | 'life-lost' | 'level-clear' | 'game-over' | null
movePaddle(game, x) // clamps paddle into the arena
```
- Ball speed: `320 + 25 * (level - 1)` px/s. Paddle bounce angle:
  `angle = -60..-120 deg` mapped from hit offset.
- Brick layout: level rows = `min(3 + level, 7)`, 8 columns.
- On level clear: rebuild bricks, ball speed up, keep score/lives.

## UI
- Canvas 480x560 CSS pixels, purple bricks, glowing ball, skull lives.
- Input: mouse move, touch drag, arrow keys; Space/click launches ball.
- Sounds: `break` (crack), `launch`, `die`, `win` (level clear jingle).

## Correctness / Testing
- `tests/breakout.test.js`: brick break, paddle bounce, life loss,
  level clear.
- Property tests: brick count never increases; score = 10 * bricks
  broken; ball never leaves the arena except through the bottom
  (which costs a life); lives only decrease on a miss.
