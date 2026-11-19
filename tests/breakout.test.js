// Unit tests for Crypt Breaker logic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createGame, step, launch, movePaddle, speedFor, rowsFor,
} from '../src/logic/breakout.js';

test('starts ready with a full brick wall, 3 lives, level 1', () => {
  const g = createGame();
  assert.equal(g.state, 'ready');
  assert.equal(g.lives, 3);
  assert.equal(g.level, 1);
  assert.equal(g.score, 0);
  assert.equal(g.bricks.length, rowsFor(1) * 8);
  assert.ok(g.bricks.every((b) => b.alive));
});

test('launch sets the ball moving upward', () => {
  const g = createGame();
  launch(g);
  assert.equal(g.state, 'playing');
  assert.ok(g.ball.vy < 0);
  assert.equal(Math.hypot(g.ball.vx, g.ball.vy), speedFor(1));
});

test('ball breaking a brick scores 10 and removes the brick', () => {
  const g = createGame();
  launch(g);
  const brick = g.bricks[0];
  // Place the ball just below the brick, moving up into it.
  g.ball.x = brick.x + brick.w / 2;
  g.ball.y = brick.y + brick.h + g.ball.r + 1;
  g.ball.vx = 0;
  g.ball.vy = -200;
  const ev = step(g, 1 / 60);
  assert.equal(ev, 'brick');
  assert.equal(brick.alive, false);
  assert.equal(g.score, 10);
});

test('ball bounces off the left wall', () => {
  const g = createGame();
  launch(g);
  g.ball.x = g.ball.r + 1;
  g.ball.y = 300;
  g.ball.vx = -200;
  g.ball.vy = 0;
  step(g, 1 / 60);
  assert.ok(g.ball.vx > 0);
});

test('paddle bounce sends the ball up, angled by hit position', () => {
  const g = createGame();
  launch(g);
  // Drop the ball onto the left edge of the paddle.
  g.ball.x = g.paddle.x + 5;
  g.ball.y = g.paddle.y - g.ball.r - 1;
  g.ball.vx = 0;
  g.ball.vy = 200;
  step(g, 1 / 60);
  assert.ok(g.ball.vy < 0, 'ball must go up after paddle hit');
  assert.ok(g.ball.vx < 0, 'left-edge hit must angle the ball left');
});

test('missing the ball costs a life and resets to ready', () => {
  const g = createGame();
  launch(g);
  g.ball.x = 10;
  g.ball.y = g.height - 5;
  g.ball.vx = 0;
  g.ball.vy = 300;
  let ev = null;
  for (let i = 0; i < 20 && !ev; i++) ev = step(g, 1 / 60);
  assert.equal(ev, 'life-lost');
  assert.equal(g.lives, 2);
  assert.equal(g.state, 'ready');
});

test('losing the last life ends the game', () => {
  const g = createGame();
  g.lives = 1;
  launch(g);
  g.ball.x = 10;
  g.ball.y = g.height - 5;
  g.ball.vx = 0;
  g.ball.vy = 300;
  let ev = null;
  for (let i = 0; i < 20 && !ev; i++) ev = step(g, 1 / 60);
  assert.equal(ev, 'game-over');
  assert.equal(g.state, 'over');
});

test('clearing all bricks starts the next level', () => {
  const g = createGame();
  launch(g);
  for (const b of g.bricks) b.alive = false;
  const last = g.bricks[0];
  last.alive = true;
  g.ball.x = last.x + last.w / 2;
  g.ball.y = last.y + last.h + g.ball.r + 1;
  g.ball.vx = 0;
  g.ball.vy = -200;
  const ev = step(g, 1 / 60);
  assert.equal(ev, 'level-clear');
  assert.equal(g.level, 2);
  assert.equal(g.bricks.length, rowsFor(2) * 8);
  assert.equal(g.state, 'ready');
});

test('movePaddle clamps inside the arena', () => {
  const g = createGame();
  movePaddle(g, -999);
  assert.equal(g.paddle.x, 0);
  movePaddle(g, 9999);
  assert.equal(g.paddle.x, g.width - g.paddle.w);
});
