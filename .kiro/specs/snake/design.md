# Design — Grave Snake

## Overview
Canvas-rendered snake on a 20x20 grid. Pure logic in `src/logic/snake.js`
(no DOM), UI/controller in `src/games/snake-ui.js`.

## Logic API (`src/logic/snake.js`)
```js
createGame({ width = 20, height = 20, rng = Math.random } = {})
// -> { snake: [{x,y}...], dir, food, score, level, alive, foodsEaten }
step(game, nextDir?)  // advances one tick; returns events: 'eat' | 'die' | null
setDirection(game, dir) // ignores reversals and same-direction input
```
- `step` moves the head one cell; eating grows the snake and respawns food
  on a uniformly random free cell; wall/self collision sets `alive=false`.
- Speed is owned by the UI: `intervalFor(level)` = `max(70, 150 - 8*(level-1))`.

## UI
- Canvas 400x400 CSS pixels (scaled by devicePixelRatio), ghost-green
  snake, glowing soul orbs, tombstone border.
- Keyboard: arrows/WASD + Space/P pause. Touch: swipe detection on the
  canvas. Buttons for pause and back.
- Sounds: `eat` (rising blip), `die` (descending buzz), `click`.

## Correctness / Testing
- `tests/snake.test.js`: movement, growth, collision, reversal guard,
  food placement.
- Property tests (`tests/property.test.js`): food never spawns on the
  snake; snake length = 3 + foods eaten; head moves exactly one cell per
  step; score is non-decreasing.
