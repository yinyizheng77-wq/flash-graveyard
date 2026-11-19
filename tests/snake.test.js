// Unit tests for Grave Snake logic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, step, setDirection, intervalFor } from '../src/logic/snake.js';

test('starts with a 3-cell snake, one food, score 0', () => {
  const g = createGame();
  assert.equal(g.snake.length, 3);
  assert.equal(g.score, 0);
  assert.equal(g.level, 1);
  assert.equal(g.alive, true);
  assert.ok(g.food);
  assert.ok(!g.snake.some((c) => c.x === g.food.x && c.y === g.food.y));
});

test('moves one cell per step in the starting direction', () => {
  const g = createGame();
  const head = { ...g.snake[0] };
  step(g);
  assert.deepEqual(g.snake[0], { x: head.x + 1, y: head.y });
  assert.equal(g.snake.length, 3);
});

test('eating a soul grows the snake and adds 10 points', () => {
  const g = createGame({ rng: () => 0 });
  // Put food directly ahead of the head.
  g.food = { x: g.snake[0].x + 1, y: g.snake[0].y };
  const ev = step(g);
  assert.equal(ev, 'eat');
  assert.equal(g.snake.length, 4);
  assert.equal(g.score, 10);
  assert.equal(g.foodsEaten, 1);
  assert.ok(g.food);
});

test('hitting a wall ends the game', () => {
  const g = createGame();
  g.snake = [{ x: 19, y: 10 }, { x: 18, y: 10 }, { x: 17, y: 10 }];
  g.dir = { x: 1, y: 0 };
  const ev = step(g);
  assert.equal(ev, 'die');
  assert.equal(g.alive, false);
});

test('biting itself ends the game', () => {
  const g = createGame();
  // U-shape: head moving down runs into its own body.
  g.snake = [
    { x: 10, y: 10 }, { x: 10, y: 11 }, { x: 11, y: 11 }, { x: 11, y: 10 },
  ];
  g.dir = { x: 0, y: 1 };
  const ev = step(g);
  assert.equal(ev, 'die');
  assert.equal(g.alive, false);
});

test('direct reversal is ignored', () => {
  const g = createGame();
  setDirection(g, 'left'); // facing right; left is a reversal
  step(g);
  assert.deepEqual(g.snake[0], { x: 11, y: 10 });
});

test('turning works and the pending direction applies on the next step', () => {
  const g = createGame();
  setDirection(g, 'up');
  step(g);
  assert.deepEqual(g.snake[0], { x: 10, y: 9 });
});

test('level rises every 5 souls and the interval shrinks with a floor', () => {
  assert.equal(intervalFor(1), 150);
  assert.equal(intervalFor(2), 142);
  assert.equal(intervalFor(6), 110);
  assert.equal(intervalFor(100), 70);
  const g = createGame({ rng: () => 0 });
  for (let i = 0; i < 5; i++) {
    // Reset to a straight line first, then put food directly ahead.
    g.snake = [{ x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }];
    g.dir = { x: 1, y: 0 };
    g.food = { x: g.snake[0].x + 1, y: g.snake[0].y };
    step(g);
  }
  assert.equal(g.foodsEaten, 5);
  assert.equal(g.level, 2);
});
