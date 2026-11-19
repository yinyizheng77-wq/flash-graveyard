// SoulBank — shared cross-game souls + best scores.
// Persists in localStorage under one key; falls back to in-memory state
// when storage is unavailable (private mode, blocked cookies, Node tests).

export const STORAGE_KEY = 'flash-graveyard:v1';
export const MUTE_KEY = 'flash-graveyard:muted';

/** Souls earned from a finished game: 1 soul per 10 points, min 1. */
export function soulsForScore(score) {
  return score > 0 ? Math.max(1, Math.floor(score / 10)) : 0;
}

const EMPTY = { souls: 0, best: { snake: 0, breakout: 0, memory: 0 } };

export class SoulBank {
  /** @param {Storage|null} storage — pass window.localStorage in the browser */
  constructor(storage = null) {
    this.storage = storage;
    this.state = this._load();
  }

  _load() {
    try {
      const raw = this.storage && this.storage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          souls: Number(parsed.souls) || 0,
          best: { ...EMPTY.best, ...(parsed.best || {}) },
        };
      }
    } catch {
      // Corrupt or blocked storage: start fresh in memory.
    }
    return { souls: 0, best: { ...EMPTY.best } };
  }

  _save() {
    try {
      if (this.storage) {
        this.storage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      }
    } catch {
      // Storage full/blocked: keep the in-memory state.
    }
  }

  getSouls() {
    return this.state.souls;
  }

  getBest(gameId) {
    return this.state.best[gameId] || 0;
  }

  /**
   * Bank a finished game's score. Returns the souls earned and the
   * (possibly new) best for that game.
   */
  bankGameScore(gameId, score) {
    const souls = soulsForScore(score);
    this.state.souls += souls;
    if (score > (this.state.best[gameId] || 0)) {
      this.state.best[gameId] = score;
    }
    this._save();
    return { souls, best: this.state.best[gameId] };
  }
}
