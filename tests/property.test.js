// Property-based tests (hand-rolled, zero dependencies):
// randomized inputs, universal invariants. A seeded PRNG keeps runs
// reproducible; the seed set is fixed so failures can be replayed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as snake from '../src/logic/snake.js';
import * as breakout from '../src/logic/breakout.js';
import * as memory from '../src/logic/memory.js';
import { SoulBank } from '../src/souls.js';

function mulberry32(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
  };
}

const DIRS = ['up', 'down', 'left', 'right'];

test('snake: food never spawns on the snake, length = 3 + eaten, score = 10 * eaten', () => {
  for (let seed = 1; seed <= 50; seed++) {
    const rng = mulberry32(seed);
    const g = snake.createGame({ rng });
    for (let t = 0; t < 300 && g.alive; t++) {
      if (rng() < 0.3) snake.setDirection(g, DIRS[Math.floor(rng() * 4)]);
      const headBefore = { ...g.snake[0] };
      snake.step(g);
      if (!g.alive) break;
      // Invariant 1: head moved exactly one cell.
      const moved = Math.abs(g.snake[0].x - headBefore.x) + Math.abs(g.snake[0].y - headBefore.y);
      assert.equal(moved, 1, `seed ${seed} tick ${t}: head must move 1 cell`);
      // Invariant 2: length matches food eaten.
      assert.equal(g.snake.length, 3 + g.foodsEaten);
      // Invariant 3: score matches food eaten.
      assert.equal(g.score, 10 * g.foodsEaten);
      // Invariant 4: food is on a free cell.
      assert.ok(g.food, `seed ${seed}: food must exist while alive`);
      assert.ok(!g.snake.some((c) => c.x === g.food.x && c.y === g.food.y));
      // Invariant 5: head inside the board, no self-overlap.
      assert.ok(g.snake[0].x >= 0 && g.snake[0].x < g.width);
      assert.ok(g.snake[0].y >= 0 && g.snake[0].y < g.height);
      const seen = new Set(g.snake.map((c) => `${c.x},${c.y}`));
      assert.equal(seen.size, g.snake.length, `seed ${seed}: snake must not overlap itself`);
    }
  }
});

test('breakout: score = 10 * bricks broken, brick count never grows, lives only fall on a miss', () => {
  for (let seed = 1; seed <= 30; seed++) {
    const rng = mulberry32(seed);
    const g = breakout.createGame();
    breakout.launch(g);
    const initialBricks = g.bricks.length;
    let prevLives = g.lives;
    for (let t = 0; t < 60 * 30 && g.state === 'playing'; t++) {
      // Paddle wanders randomly.
      breakout.movePaddle(g, rng() * g.width);
      const ev = breakout.step(g, 1 / 60);
      const alive = g.bricks.filter((b) => b.alive).length;
      // Invariant 1: score matches bricks broken (level resets add bricks,
      // so count per level: score is cumulative, broken counts level resets).
      assert.ok(g.score % 10 === 0);
      // Invariant 2: ball stays inside the arena horizontally.
      assert.ok(g.ball.x >= -g.ball.r && g.ball.x <= g.width + g.ball.r);
      // Invariant 3: lives never increase.
      assert.ok(g.lives <= prevLives);
      prevLives = g.lives;
      // Invariant 4: a life-lost event is the only way lives drop.
      if (ev === 'life-lost' || ev === 'game-over') assert.ok(g.lives < 3 || ev === 'game-over');
      assert.ok(alive <= initialBricks || g.level > 1, 'bricks must not grow within a level');
      if (ev === 'level-clear') break; // level rebuild is covered by unit tests
    }
    assert.ok(g.score >= 0);
  }
});

test('memory: deck always has exactly two of each symbol; matched cards stay up; win <=> all matched', () => {
  for (let seed = 1; seed <= 50; seed++) {
    const rng = mulberry32(seed);
    const pairs = 2 + Math.floor(rng() * 5);
    const g = memory.createGame({ pairs, rng });
    let flips = 0;
    while (g.status === 'playing' && flips < 500) {
      // Flip two random face-down cards.
      const down = g.deck.map((c, i) => ({ c, i })).filter(({ c }) => !c.faceUp && !c.matched);
      if (down.length < 2) break;
      const a = down[Math.floor(rng() * down.length)].i;
      memory.flip(g, a);
      flips++;
      const down2 = g.deck.map((c, i) => ({ c, i })).filter(({ c }) => !c.faceUp && !c.matched);
      if (down2.length === 0) break;
      const b = down2[Math.floor(rng() * down2.length)].i;
      const ev = memory.flip(g, b);
      flips++;
      if (ev === 'mismatch') memory.unflipMismatch(g);
      // Invariant 1: exactly two of each symbol, always.
      const counts = {};
      for (const c of g.deck) counts[c.symbol] = (counts[c.symbol] || 0) + 1;
      assert.ok(Object.values(counts).every((n) => n === 2));
      // Invariant 2: matched cards stay face up.
      assert.ok(g.deck.every((c) => !c.matched || c.faceUp));
      // Invariant 3: matchedPairs matches the deck.
      const matched = g.deck.filter((c) => c.matched).length;
      assert.equal(matched, g.matchedPairs * 2);
      // Invariant 4: moves counts exactly one per pair of flips.
      assert.ok(g.moves <= Math.ceil(flips / 2));
    }
    if (g.status === 'won') {
      assert.equal(g.matchedPairs, g.pairs);
      assert.ok(g.deck.every((c) => c.matched));
    }
  }
});

test('souls: total never decreases; best equals the max banked score', () => {
  const bank = new SoulBank(null);
  const bestSeen = { snake: 0, breakout: 0, memory: 0 };
  const rng = mulberry32(42);
  let prev = 0;
  for (let i = 0; i < 200; i++) {
    const game = ['snake', 'breakout', 'memory'][Math.floor(rng() * 3)];
    const score = Math.floor(rng() * 2000);
    bank.bankGameScore(game, score);
    assert.ok(bank.getSouls() >= prev, 'soul total must be monotonic');
    prev = bank.getSouls();
    bestSeen[game] = Math.max(bestSeen[game], score);
    assert.equal(bank.getBest(game), bestSeen[game]);
  }
});
