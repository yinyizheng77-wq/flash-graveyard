// Haunted Memory UI — DOM card grid + flip animation.
// Game rules live in ../logic/memory.js; this file only renders and listens.

import { createGame, flip, unflipMismatch, scoreFor } from '../logic/memory.js';

export class MemoryGame {
  constructor(screen, { bank, sfx }) {
    this.screen = screen;
    this.bank = bank;
    this.sfx = sfx;
    this.grid = screen.querySelector('[data-grid]');
    this.movesEl = screen.querySelector('[data-moves]');
    this.timeEl = screen.querySelector('[data-time]');
    this.overlay = screen.querySelector('[data-overlay]');
    this.overlayText = screen.querySelector('[data-overlay-text]');
    this.setupEl = screen.querySelector('[data-setup]');
    this.game = null;
    this.timer = null;
    this.seconds = 0;
    this.locked = false;
    this.onCardClick = this.onCardClick.bind(this);
  }

  /** Show the difficulty picker; the game starts on choice. */
  start() {
    this.stopTimer();
    this.grid.innerHTML = '';
    this.movesEl.textContent = '0';
    this.timeEl.textContent = '0:00';
    this.overlay.classList.add('hidden');
    this.setupEl.classList.remove('hidden');
  }

  begin(pairs) {
    this.setupEl.classList.add('hidden');
    this.overlay.classList.add('hidden');
    this.game = createGame({ pairs });
    this.seconds = 0;
    this.locked = false;
    this.renderGrid();
    this.updateHud();
    this.startTimer();
  }

  stop() {
    this.stopTimer();
  }

  renderGrid() {
    this.grid.innerHTML = '';
    this.grid.style.setProperty('--cols', this.game.pairs === 12 ? 6 : 4);
    this.game.deck.forEach((card, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'card';
      btn.dataset.index = i;
      btn.setAttribute('aria-label', `Card ${i + 1}`);
      btn.innerHTML =
        `<span class="card-inner">` +
        `<span class="card-face card-front">🪦</span>` +
        `<span class="card-face card-back">${card.symbol}</span>` +
        `</span>`;
      btn.addEventListener('click', this.onCardClick);
      this.grid.appendChild(btn);
    });
  }

  onCardClick(e) {
    if (this.locked || !this.game) return;
    const index = Number(e.currentTarget.dataset.index);
    const ev = flip(this.game, index);
    if (ev === 'ignored') return;
    this.sfx.play('flip');
    this.syncCards();
    this.updateHud();
    if (ev === 'match') {
      this.sfx.play('match');
    } else if (ev === 'win') {
      this.sfx.play('win');
      this.finish();
    } else if (ev === 'mismatch') {
      this.locked = true;
      setTimeout(() => {
        unflipMismatch(this.game);
        this.syncCards();
        this.locked = false;
      }, 700);
    }
  }

  syncCards() {
    [...this.grid.children].forEach((btn, i) => {
      const card = this.game.deck[i];
      btn.classList.toggle('flipped', card.faceUp);
      btn.classList.toggle('matched', card.matched);
      btn.disabled = card.matched;
    });
  }

  finish() {
    this.stopTimer();
    const score = scoreFor(this.game);
    const { souls, best } = this.bank.bankGameScore('memory', score);
    const mm = Math.floor(this.seconds / 60);
    const ss = String(this.seconds % 60).padStart(2, '0');
    this.overlayText.innerHTML =
      `🎉 All spirits matched!<br>${this.game.pairs} pairs in ${this.game.moves} moves · ${mm}:${ss}<br>Score ${score} · +${souls} souls · Best ${best}`;
    this.overlay.classList.remove('hidden');
    window.dispatchEvent(new CustomEvent('graveyard:score'));
  }

  startTimer() {
    this.stopTimer();
    this.timer = setInterval(() => {
      this.seconds += 1;
      this.updateHud();
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timer);
    this.timer = null;
  }

  updateHud() {
    this.movesEl.textContent = this.game ? this.game.moves : 0;
    const mm = Math.floor(this.seconds / 60);
    const ss = String(this.seconds % 60).padStart(2, '0');
    this.timeEl.textContent = `${mm}:${ss}`;
  }
}
