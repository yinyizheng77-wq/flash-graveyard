// Unit tests for Haunted Memory logic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, flip, unflipMismatch, scoreFor, SYMBOLS } from '../src/logic/memory.js';

function seededRng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

test('deals 8 pairs (16 cards) face down, shuffled', () => {
  const g = createGame({ pairs: 8, rng: seededRng(1) });
  assert.equal(g.deck.length, 16);
  assert.ok(g.deck.every((c) => !c.faceUp && !c.matched));
  const counts = {};
  for (const c of g.deck) counts[c.symbol] = (counts[c.symbol] || 0) + 1;
  assert.equal(Object.keys(counts).length, 8);
  assert.ok(Object.values(counts).every((n) => n === 2));
});

test('flipping two matching cards keeps them up and counts a move', () => {
  const g = createGame({ pairs: 2, rng: () => 0.99 }); // near-identity shuffle
  const first = g.deck.findIndex((c) => c.symbol === SYMBOLS[0]);
  const second = g.deck.findIndex((c, i) => c.symbol === SYMBOLS[0] && i !== first);
  assert.equal(flip(g, first), 'flip');
  const ev = flip(g, second);
  assert.equal(ev, 'match');
  assert.equal(g.moves, 1);
  assert.equal(g.matchedPairs, 1);
  assert.ok(g.deck[first].matched && g.deck[second].matched);
});

test('flipping two different cards reports mismatch and flips back', () => {
  const g = createGame({ pairs: 2, rng: seededRng(7) });
  const a = 0;
  const b = g.deck.findIndex((c) => c.symbol !== g.deck[a].symbol);
  flip(g, a);
  assert.equal(flip(g, b), 'mismatch');
  assert.equal(g.moves, 1);
  unflipMismatch(g);
  assert.ok(!g.deck[a].faceUp && !g.deck[b].faceUp);
  assert.equal(g.flipped.length, 0);
});

test('flipping the same card twice or a matched card is ignored', () => {
  const g = createGame({ pairs: 2, rng: seededRng(3) });
  assert.equal(flip(g, 0), 'flip');
  assert.equal(flip(g, 0), 'ignored');
  assert.equal(g.moves, 0);
});

test('matching all pairs wins the game', () => {
  const g = createGame({ pairs: 2, rng: seededRng(5) });
  let last = null;
  while (g.status === 'playing') {
    const unmatched = g.deck.map((c, i) => ({ c, i })).filter(({ c }) => !c.matched);
    const first = unmatched[0];
    const second = unmatched.find(({ c }) => c.symbol === first.c.symbol && c.id !== first.c.id);
    flip(g, first.i);
    last = flip(g, second.i);
  }
  assert.equal(last, 'win');
  assert.equal(g.status, 'won');
  assert.equal(g.matchedPairs, 2);
});

test('a perfect game scores 1600; extra moves cost 50 each, floored at 100', () => {
  const perfect = { moves: 8, pairs: 8 };
  assert.equal(scoreFor(perfect), 1600);
  assert.equal(scoreFor({ moves: 10, pairs: 8 }), 1500);
  assert.equal(scoreFor({ moves: 100, pairs: 8 }), 100);
});

test('hard mode deals 12 pairs', () => {
  const g = createGame({ pairs: 12, rng: seededRng(9) });
  assert.equal(g.deck.length, 24);
  assert.equal(new Set(g.deck.map((c) => c.symbol)).size, 12);
});

test('invalid pair counts are rejected', () => {
  assert.throws(() => createGame({ pairs: 1 }), /pairs must be/);
  assert.throws(() => createGame({ pairs: 99 }), /pairs must be/);
});
