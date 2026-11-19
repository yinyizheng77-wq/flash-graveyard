// Crypt Breaker — pure game logic (no DOM). Testable in Node.
// Fixed-timestep ball physics: wall bounce, paddle bounce with angle
// control, brick breaking, lives, and levels.

export const COLS = 8;

export function speedFor(level) {
  return 320 + 25 * (level - 1);
}

export function rowsFor(level) {
  return Math.min(3 + level, 7);
}

function buildBricks(game) {
  const rows = rowsFor(game.level);
  const gap = 6;
  const bw = (game.width - gap * (COLS + 1)) / COLS;
  const bh = 22;
  const bricks = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < COLS; c++) {
      bricks.push({
        x: gap + c * (bw + gap),
        y: 50 + r * (bh + gap),
        w: bw,
        h: bh,
        alive: true,
      });
    }
  }
  return bricks;
}

export function createGame({ width = 480, height = 560 } = {}) {
  const game = {
    width,
    height,
    paddle: { w: 80, h: 12, x: width / 2 - 40, y: height - 30 },
    ball: { x: width / 2, y: height - 90, r: 7, vx: 0, vy: 0 },
    bricks: [],
    score: 0,
    lives: 3,
    level: 1,
    state: 'ready', // 'ready' | 'playing' | 'over'
  };
  game.bricks = buildBricks(game);
  return game;
}

export function movePaddle(game, centerX) {
  game.paddle.x = Math.max(
    0,
    Math.min(game.width - game.paddle.w, centerX - game.paddle.w / 2),
  );
}

export function launch(game) {
  if (game.state !== 'ready') return;
  const speed = speedFor(game.level);
  // Launch at 20° off vertical so the ball always has some sideways motion.
  const angle = Math.PI / 9;
  game.ball.vx = speed * Math.sin(angle);
  game.ball.vy = -speed * Math.cos(angle);
  game.state = 'playing';
}

function resetBall(game) {
  game.ball.x = game.width / 2;
  game.ball.y = game.height - 90;
  game.ball.vx = 0;
  game.ball.vy = 0;
  game.state = 'ready';
}

function circleHitsRect(ball, rect) {
  const nx = Math.max(rect.x, Math.min(ball.x, rect.x + rect.w));
  const ny = Math.max(rect.y, Math.min(ball.y, rect.y + rect.h));
  const dx = ball.x - nx;
  const dy = ball.y - ny;
  return dx * dx + dy * dy <= ball.r * ball.r;
}

/**
 * Advance the simulation by dt seconds (sub-stepped so the ball cannot
 * tunnel through bricks).
 * @returns {'brick'|'life-lost'|'level-clear'|'game-over'|null}
 */
export function step(game, dt) {
  if (game.state !== 'playing') return null;
  const speed = Math.hypot(game.ball.vx, game.ball.vy) || speedFor(game.level);
  const substeps = Math.max(1, Math.ceil((speed * dt) / 6));
  const sdt = dt / substeps;
  for (let i = 0; i < substeps; i++) {
    const ev = substep(game, sdt);
    if (ev) return ev;
  }
  return null;
}

function substep(game, dt) {
  const b = game.ball;
  const prevX = b.x;
  const prevY = b.y;
  b.x += b.vx * dt;
  b.y += b.vy * dt;

  // Side walls.
  if (b.x - b.r < 0) {
    b.x = b.r;
    b.vx = Math.abs(b.vx);
  } else if (b.x + b.r > game.width) {
    b.x = game.width - b.r;
    b.vx = -Math.abs(b.vx);
  }
  // Ceiling.
  if (b.y - b.r < 0) {
    b.y = b.r;
    b.vy = Math.abs(b.vy);
  }
  // Paddle.
  const p = game.paddle;
  if (
    b.vy > 0 &&
    b.y + b.r >= p.y &&
    b.y - b.r <= p.y + p.h &&
    b.x >= p.x - b.r &&
    b.x <= p.x + p.w + b.r
  ) {
    const offset = (b.x - (p.x + p.w / 2)) / (p.w / 2); // -1..1
    const speed = Math.hypot(b.vx, b.vy);
    const angle = -Math.PI / 2 + offset * (Math.PI / 3); // -60..-120 deg
    b.vx = speed * Math.cos(angle);
    b.vy = speed * Math.sin(angle);
    b.y = p.y - b.r;
  }
  // Bricks: at most one break per substep.
  for (const brick of game.bricks) {
    if (!brick.alive) continue;
    if (!circleHitsRect(b, brick)) continue;
    brick.alive = false;
    game.score += 10;
    // Bounce off the side we came from.
    const hitFromSide =
      prevY + b.r <= brick.y || prevY - b.r >= brick.y + brick.h;
    if (hitFromSide) {
      b.vy = -b.vy;
    } else {
      b.vx = -b.vx;
    }
    if (game.bricks.every((br) => !br.alive)) {
      game.level += 1;
      game.bricks = buildBricks(game);
      resetBall(game);
      return 'level-clear';
    }
    return 'brick';
  }
  // Floor: lose a life.
  if (b.y - b.r > game.height) {
    game.lives -= 1;
    if (game.lives <= 0) {
      game.state = 'over';
      return 'game-over';
    }
    resetBall(game);
    return 'life-lost';
  }
  // Keep the previous position for the next substep's side test.
  void prevX;
  void prevY;
  return null;
}
