// Unit tests for the SoulBank (shared souls + best scores).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SoulBank, soulsForScore, STORAGE_KEY } from '../src/souls.js';

function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
  };
}

test('soul award: 1 per 10 points, minimum 1 for a positive score', () => {
  assert.equal(soulsForScore(0), 0);
  assert.equal(soulsForScore(5), 1);
  assert.equal(soulsForScore(10), 1);
  assert.equal(soulsForScore(99), 9);
  assert.equal(soulsForScore(1600), 160);
});

test('banking adds souls and tracks the best per game', () => {
  const store = fakeStorage();
  const bank = new SoulBank(store);
  assert.equal(bank.getSouls(), 0);
  const r1 = bank.bankGameScore('snake', 50);
  assert.deepEqual(r1, { souls: 5, best: 50 });
  const r2 = bank.bankGameScore('snake', 30); // worse: best stays
  assert.deepEqual(r2, { souls: 3, best: 50 });
  assert.equal(bank.getSouls(), 8);
  assert.equal(bank.getBest('snake'), 50);
  assert.equal(bank.getBest('breakout'), 0);
});

test('state persists across instances via storage', () => {
  const store = fakeStorage();
  const a = new SoulBank(store);
  a.bankGameScore('memory', 1600);
  const b = new SoulBank(store);
  assert.equal(b.getSouls(), 160);
  assert.equal(b.getBest('memory'), 1600);
  assert.ok(store.data[STORAGE_KEY].includes('"memory":1600'));
});

test('a null storage keeps everything in memory without crashing', () => {
  const bank = new SoulBank(null);
  bank.bankGameScore('snake', 40);
  assert.equal(bank.getSouls(), 4);
  assert.equal(bank.getBest('snake'), 40);
});

test('a throwing storage is tolerated', () => {
  const bad = {
    getItem: () => { throw new Error('denied'); },
    setItem: () => { throw new Error('denied'); },
  };
  const bank = new SoulBank(bad);
  const r = bank.bankGameScore('breakout', 120);
  assert.deepEqual(r, { souls: 12, best: 120 });
});

test('corrupt stored JSON starts fresh instead of crashing', () => {
  const store = fakeStorage({ [STORAGE_KEY]: 'not-json{{{' });
  const bank = new SoulBank(store);
  assert.equal(bank.getSouls(), 0);
  assert.equal(bank.getBest('snake'), 0);
});
