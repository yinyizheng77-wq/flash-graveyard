// Haunted Memory — pure game logic (no DOM). Testable in Node.
// Flip tombstone cards to find matching pairs of Halloween spirits.

export const SYMBOLS = [
  '👻', '🎃', '🦇', '🕷️', '💀', '🧙',
  '🌙', '⚰️', '🧟', '🧛', '🧪', '👁️',
];

export function createGame({ pairs = 8, rng = Math.random } = {}) {
  if (pairs < 2 || pairs > SYMBOLS.length) {
    throw new Error(`pairs must be between 2 and ${SYMBOLS.length}`);
  }
  const symbols = SYMBOLS.slice(0, pairs);
  const cards = [...symbols, ...symbols].map((symbol, i) => ({
    id: i,
    symbol,
    faceUp: false,
    matched: false,
  }));
  // Fisher–Yates shuffle.
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return {
    deck: cards,
    pairs,
    moves: 0,
    matchedPairs: 0,
    flipped: [],
    status: 'playing', // 'playing' | 'won'
  };
}

/**
 * Flip a card.
 * @returns {'flip'|'match'|'mismatch'|'win'|'ignored'}
 * On 'mismatch' the caller (UI) flips the two cards back after a short
 * delay via unflipMismatch().
 */
export function flip(game, index) {
  const card = game.deck[index];
  if (!card || game.status !== 'playing') return 'ignored';
  if (card.matched || card.faceUp) return 'ignored';
  if (game.flipped.length >= 2) return 'ignored';
  card.faceUp = true;
  game.flipped.push(index);
  if (game.flipped.length < 2) return 'flip';
  game.moves += 1;
  const [a, b] = game.flipped;
  if (game.deck[a].symbol === game.deck[b].symbol) {
    game.deck[a].matched = true;
    game.deck[b].matched = true;
    game.matchedPairs += 1;
    game.flipped = [];
    if (game.matchedPairs === game.pairs) {
      game.status = 'won';
      return 'win';
    }
    return 'match';
  }
  return 'mismatch';
}

/** Turn the two mismatched cards face down again. */
export function unflipMismatch(game) {
  for (const i of game.flipped) {
    game.deck[i].faceUp = false;
  }
  game.flipped = [];
}

/**
 * Score: a perfect game (one move per pair) scores 1600; every extra
 * move costs 50, floored at 100.
 */
export function scoreFor(game) {
  return Math.max(100, 1600 - 50 * (game.moves - game.pairs));
}
