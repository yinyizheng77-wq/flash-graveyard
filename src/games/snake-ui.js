// Grave Snake UI — canvas rendering + keyboard/swipe input.
// Game rules live in ../logic/snake.js; this file only draws and listens.

import { createGame, step, setDirection, intervalFor } from '../logic/snake.js';

const CELL = 20;
const SIZE = 400; // 20x20 grid

export class SnakeGame {
  constructor(screen, { bank, sfx }) {
    this.screen = screen;
    this.bank = bank;
    this.sfx = sfx;
    this.canvas = screen.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = SIZE * dpr;
    this.canvas.height = SIZE * dpr;
    this.ctx.scale(dpr, dpr);
    this.scoreEl = screen.querySelector('[data-score]');
    this.levelEl = screen.querySelector('[data-level]');
    this.overlay = screen.querySelector('[data-overlay]');
    this.overlayText = screen.querySelector('[data-overlay-text]');
    this.timer = null;
    this.game = null;
    this.paused = false;
    this.running = false;
    this.onKey = this.onKey.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.touchStart = null;
  }

  start() {
    this.game = createGame();
    this.paused = false;
    this.running = true;
    this.overlay.classList.add('hidden');
    window.addEventListener('keydown', this.onKey);
    this.canvas.addEventListener('touchstart', this.onTouchStart, { passive: true });
    this.canvas.addEventListener('touchend', this.onTouchEnd, { passive: true });
    this.draw();
    this.updateHud();
    this.schedule();
  }

  stop() {
    this.running = false;
    clearTimeout(this.timer);
    window.removeEventListener('keydown', this.onKey);
    this.canvas.removeEventListener('touchstart', this.onTouchStart);
    this.canvas.removeEventListener('touchend', this.onTouchEnd);
  }

  schedule() {
    if (!this.running) return;
    this.timer = setTimeout(() => this.tick(), intervalFor(this.game.level));
  }

  tick() {
    if (!this.running || this.paused) {
      this.schedule();
      return;
    }
    const ev = step(this.game);
    if (ev === 'eat') this.sfx.play('eat');
    if (ev === 'die' || ev === 'win') return this.end(ev);
    this.draw();
    this.updateHud();
    this.schedule();
  }

  end(ev) {
    this.running = false;
    clearTimeout(this.timer);
    this.sfx.play(ev === 'win' ? 'win' : 'die');
    this.draw();
    const { souls, best } = this.bank.bankGameScore('snake', this.game.score);
    this.overlayText.innerHTML =
      ev === 'win'
        ? `🏆 The graveyard is full — you win!<br>Score ${this.game.score} · +${souls} souls · Best ${best}`
        : `💀 The snake bit the dust!<br>Score ${this.game.score} · +${souls} souls · Best ${best}`;
    this.overlay.classList.remove('hidden');
    this.updateHud();
    window.dispatchEvent(new CustomEvent('graveyard:score'));
  }

  togglePause() {
    if (!this.game || !this.game.alive) return;
    this.paused = !this.paused;
    this.overlayText.textContent = this.paused ? '⏸ Paused — press Space to resume' : '';
    this.overlay.classList.toggle('hidden', !this.paused);
  }

  onKey(e) {
    const keys = {
      ArrowUp: 'up', KeyW: 'up',
      ArrowDown: 'down', KeyS: 'down',
      ArrowLeft: 'left', KeyA: 'left',
      ArrowRight: 'right', KeyD: 'right',
    };
    if (keys[e.key] || keys[e.code]) {
      e.preventDefault();
      setDirection(this.game, keys[e.key] || keys[e.code]);
    } else if (e.code === 'Space' || e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      this.togglePause();
    } else if (e.key === 'Escape') {
      this.togglePause();
    }
  }

  onTouchStart(e) {
    this.touchStart = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  }

  onTouchEnd(e) {
    if (!this.touchStart) return;
    const dx = e.changedTouches[0].clientX - this.touchStart.x;
    const dy = e.changedTouches[0].clientY - this.touchStart.y;
    this.touchStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    setDirection(this.game, Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  }

  updateHud() {
    this.scoreEl.textContent = this.game.score;
    this.levelEl.textContent = this.game.level;
  }

  draw() {
    const { ctx } = this;
    ctx.fillStyle = '#14102a';
    ctx.fillRect(0, 0, SIZE, SIZE);
    // Faint grid.
    ctx.strokeStyle = 'rgba(125, 255, 94, 0.07)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 20; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(SIZE, i * CELL); ctx.stroke();
    }
    // Food: glowing soul orb.
    if (this.game.food) {
      const fx = this.game.food.x * CELL + CELL / 2;
      const fy = this.game.food.y * CELL + CELL / 2;
      ctx.save();
      ctx.shadowColor = '#7dff5e';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#b6ff9e';
      ctx.beginPath(); ctx.arc(fx, fy, 7, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    // Snake.
    this.game.snake.forEach((seg, i) => {
      const isHead = i === 0;
      ctx.fillStyle = isHead ? '#a4ff7a' : i % 2 ? '#5ec93a' : '#79e84f';
      const pad = isHead ? 1 : 2;
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + pad, seg.y * CELL + pad, CELL - pad * 2, CELL - pad * 2, 6);
      ctx.fill();
      if (isHead) {
        ctx.fillStyle = '#0d0a1a';
        const ex = seg.x * CELL + CELL / 2;
        const ey = seg.y * CELL + CELL / 2;
        ctx.beginPath(); ctx.arc(ex - 4, ey - 3, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(ex + 4, ey - 3, 2, 0, Math.PI * 2); ctx.fill();
      }
    });
  }
}
