// Crypt Breaker UI — canvas rendering + mouse/touch/keyboard input.
// Game rules live in ../logic/breakout.js; this file only draws and listens.

import { createGame, step, launch, movePaddle } from '../logic/breakout.js';

const W = 480;
const H = 560;

export class BreakoutGame {
  constructor(screen, { bank, sfx }) {
    this.screen = screen;
    this.bank = bank;
    this.sfx = sfx;
    this.canvas = screen.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = W * dpr;
    this.canvas.height = H * dpr;
    this.ctx.scale(dpr, dpr);
    this.scoreEl = screen.querySelector('[data-score]');
    this.livesEl = screen.querySelector('[data-lives]');
    this.levelEl = screen.querySelector('[data-level]');
    this.overlay = screen.querySelector('[data-overlay]');
    this.overlayText = screen.querySelector('[data-overlay-text]');
    this.game = null;
    this.raf = null;
    this.lastTs = 0;
    this.keys = new Set();
    this.running = false;
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onPointer = this.onPointer.bind(this);
    this.onLaunch = this.onLaunch.bind(this);
  }

  start() {
    this.game = createGame({ width: W, height: H });
    this.running = true;
    this.overlay.classList.add('hidden');
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.canvas.addEventListener('pointermove', this.onPointer);
    this.canvas.addEventListener('pointerdown', this.onLaunch);
    this.lastTs = performance.now();
    this.updateHud();
    this.draw();
    this.raf = requestAnimationFrame((ts) => this.loop(ts));
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener('pointermove', this.onPointer);
    this.canvas.removeEventListener('pointerdown', this.onLaunch);
  }

  loop(ts) {
    if (!this.running) return;
    const dt = Math.min(0.05, (ts - this.lastTs) / 1000);
    this.lastTs = ts;
    // Arrow-key paddle movement.
    if (this.keys.has('ArrowLeft')) movePaddle(this.game, this.game.paddle.x + this.game.paddle.w / 2 - 320 * dt);
    if (this.keys.has('ArrowRight')) movePaddle(this.game, this.game.paddle.x + this.game.paddle.w / 2 + 320 * dt);
    const ev = step(this.game, dt);
    if (ev === 'brick') this.sfx.play('break');
    if (ev === 'life-lost') this.sfx.play('die');
    if (ev === 'level-clear') {
      this.sfx.play('win');
      this.overlayText.innerHTML = `🎉 Level ${this.game.level - 1} cleared!<br>Click or press Space for level ${this.game.level}.`;
      this.overlay.classList.remove('hidden');
    }
    if (ev === 'game-over') return this.end();
    this.draw();
    this.updateHud();
    this.raf = requestAnimationFrame((t) => this.loop(t));
  }

  end() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.sfx.play('die');
    this.draw();
    const { souls, best } = this.bank.bankGameScore('breakout', this.game.score);
    this.overlayText.innerHTML =
      `💀 The ball fell into the crypt!<br>Score ${this.game.score} · Level ${this.game.level} · +${souls} souls · Best ${best}`;
    this.overlay.classList.remove('hidden');
    this.updateHud();
    window.dispatchEvent(new CustomEvent('graveyard:score'));
  }

  onKeyDown(e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      this.keys.add(e.key);
    } else if (e.code === 'Space') {
      e.preventDefault();
      this.onLaunch();
    } else if (e.key === 'Escape') {
      this.stop();
      document.querySelector('[data-back="breakout"]')?.click();
    }
  }

  onKeyUp(e) {
    this.keys.delete(e.key);
  }

  onPointer(e) {
    const rect = this.canvas.getBoundingClientRect();
    movePaddle(this.game, ((e.clientX - rect.left) / rect.width) * W);
  }

  onLaunch() {
    if (!this.game) return;
    if (this.game.state === 'ready') {
      this.overlay.classList.add('hidden');
      launch(this.game);
      this.sfx.play('launch');
    }
  }

  updateHud() {
    this.scoreEl.textContent = this.game.score;
    this.livesEl.textContent = '💀'.repeat(Math.max(0, this.game.lives));
    this.levelEl.textContent = this.game.level;
  }

  draw() {
    const { ctx } = this;
    const g = this.game;
    ctx.fillStyle = '#14102a';
    ctx.fillRect(0, 0, W, H);
    // Bricks.
    const colors = ['#b388ff', '#8e6fe8', '#7dff5e', '#ffd54f', '#ff8a65', '#f06292', '#4dd0e1'];
    g.bricks.forEach((b, i) => {
      if (!b.alive) return;
      ctx.fillStyle = colors[Math.floor(b.y / 28) % colors.length];
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, 4);
      ctx.fill();
      void i;
    });
    // Paddle.
    ctx.fillStyle = '#e8e6ff';
    ctx.beginPath();
    ctx.roundRect(g.paddle.x, g.paddle.y, g.paddle.w, g.paddle.h, 6);
    ctx.fill();
    // Ball.
    ctx.save();
    ctx.shadowColor = '#7dff5e';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#c8ff9e';
    ctx.beginPath();
    ctx.arc(g.ball.x, g.ball.y, g.ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Launch hint.
    if (g.state === 'ready') {
      ctx.fillStyle = 'rgba(232, 230, 255, 0.85)';
      ctx.font = '16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Click or press Space to launch the ghost ball', W / 2, H - 90);
    }
  }
}
