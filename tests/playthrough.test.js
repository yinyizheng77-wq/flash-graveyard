// Scripted end-to-end playthroughs: simulate a real player session
// against the pure logic modules and assert the game behaves correctly
// from start to finish.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as snake from '../src/logic/snake.js';
import * as breakout from '../src/logic/breakout.js';
import * as memory from '../src/logic/memory.js';
import { SoulBank } from '../src/souls.js';

test('playthrough: snake hunts souls greedily, eats at least one, then the run ends', () => {
  // Fixed seed: greedy steering is a deliberately weak player, so the
  // run is deterministic — the assertion is that the game lets it eat
  // and ends the run, not that greedy play is good.
  let s = 7;
  const rng = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
  };
  const g = snake.createGame({ rng });
  let ticks = 0;
  while (g.alive && ticks < 500) {
    // Greedy steering toward the food (never reversing).
    const head = g.snake[0];
    const dx = g.food.x - head.x;
    const dy = g.food.y - head.y;
    if (Math.abs(dx) >= Math.abs(dy)) {
      snake.setDirection(g, dx > 0 ? 'right' : 'left');
    } else {
      snake.setDirection(g, dy > 0 ? 'down' : 'up');
    }
    snake.step(g);
    ticks++;
  }
  // The greedy snake may trap itself, but it must have eaten something
  // on the way — a full playthrough that scores 0 would be a broken game.
  assert.ok(g.foodsEaten >= 1, `greedy snake ate ${g.foodsEaten} souls in ${ticks} ticks`);
  assert.ok(g.score >= 10);
  // Banking the run works end to end.
  const bank = new SoulBank(null);
  const { souls } = bank.bankGameScore('snake', g.score);
  assert.ok(souls >= 1);
  assert.equal(bank.getBest('snake'), g.score);
});

test('playthrough: breakout with a tracking paddle breaks bricks', () => {
  const g = breakout.createGame();
  breakout.launch(g);
  let steps = 0;
  let events = [];
  while (g.state === 'playing' && steps < 60 * 120) {
    // Paddle follows the ball.
    breakout.movePaddle(g, g.ball.x);
    const ev = breakout.step(g, 1 / 60);
    if (ev) events.push(ev);
    steps++;
  }
  assert.ok(g.score >= 10, `tracking paddle scored ${g.score} in ${steps} steps`);
  assert.ok(events.includes('brick'), 'at least one brick must break');
  // A tracking paddle may never lose the ball, so 'playing' is a valid
  // end state for this simulation; a level clear parks in 'ready'.
  assert.ok(
    ['playing', 'ready', 'over'].includes(g.state),
    `final state ${g.state}`,
  );
});

test('playthrough: memory is winnable in exactly one move per pair', () => {
  const g = memory.createGame({ pairs: 8, rng: () => 0.5 });
  while (g.status === 'playing') {
    const unmatched = g.deck.map((c, i) => ({ c, i })).filter(({ c }) => !c.matched);
    const first = unmatched[0];
    const second = unmatched.find(({ c }) => c.symbol === first.c.symbol && c.id !== first.c.id);
    memory.flip(g, first.i);
    const ev = memory.flip(g, second.i);
    assert.ok(ev === 'match' || ev === 'win');
  }
  assert.equal(g.status, 'won');
  assert.equal(g.moves, 8, 'perfect play takes exactly 8 moves');
  assert.equal(memory.scoreFor(g), 1600);
  const bank = new SoulBank(null);
  const { souls } = bank.bankGameScore('memory', memory.scoreFor(g));
  assert.equal(souls, 160);
});

test('playthrough: a full session banks souls from all three games', () => {
  const bank = new SoulBank(null);
  bank.bankGameScore('snake', 120);
  bank.bankGameScore('breakout', 340);
  bank.bankGameScore('memory', 1500);
  assert.equal(bank.getSouls(), 12 + 34 + 150);
  assert.equal(bank.getBest('snake'), 120);
  assert.equal(bank.getBest('breakout'), 340);
  assert.equal(bank.getBest('memory'), 1500);
});
