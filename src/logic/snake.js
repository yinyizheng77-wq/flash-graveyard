// Grave Snake — pure game logic (no DOM). Testable in Node.
// Grid-based snake: the head moves one cell per step; eating a soul grows
// the snake by one and spawns a new soul on a free cell.

export const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function createGame({ width = 20, height = 20, rng = Math.random } = {}) {
  const sx = Math.min(10, Math.floor(width / 2));
  const sy = Math.floor(height / 2);
  const game = {
    width,
    height,
    snake: [
      { x: sx, y: sy },
      { x: sx - 1, y: sy },
      { x: sx - 2, y: sy },
    ],
    dir: DIRS.right,
    pendingDir: null,
    food: null,
    score: 0,
    level: 1,
    foodsEaten: 0,
    alive: true,
    won: false,
    rng,
  };
  game.food = spawnFood(game);
  return game;
}

export function intervalFor(level) {
  return Math.max(70, 150 - 8 * (level - 1));
}

function freeCells(game) {
  const occupied = new Set(game.snake.map((c) => `${c.x},${c.y}`));
  const cells = [];
  for (let y = 0; y < game.height; y++) {
    for (let x = 0; x < game.width; x++) {
      if (!occupied.has(`${x},${y}`)) cells.push({ x, y });
    }
  }
  return cells;
}

function spawnFood(game) {
  const cells = freeCells(game);
  if (cells.length === 0) return null;
  return cells[Math.floor(game.rng() * cells.length)];
}

/** Queue a turn. Direct reversals are ignored (classic snake rule). */
export function setDirection(game, dirName) {
  const d = DIRS[dirName];
  if (!d || !game.alive) return;
  if (d.x === -game.dir.x && d.y === -game.dir.y) return;
  if (d.x === game.dir.x && d.y === game.dir.y) return;
  game.pendingDir = d;
}

/**
 * Advance one tick.
 * @returns {'eat'|'die'|'win'|null}
 */
export function step(game) {
  if (!game.alive) return null;
  if (game.pendingDir) {
    game.dir = game.pendingDir;
    game.pendingDir = null;
  }
  const head = {
    x: game.snake[0].x + game.dir.x,
    y: game.snake[0].y + game.dir.y,
  };
  if (head.x < 0 || head.y < 0 || head.x >= game.width || head.y >= game.height) {
    game.alive = false;
    return 'die';
  }
  const willEat = game.food && head.x === game.food.x && head.y === game.food.y;
  // The tail cell frees up this tick unless we are growing.
  const body = willEat ? game.snake : game.snake.slice(0, -1);
  if (body.some((c) => c.x === head.x && c.y === head.y)) {
    game.alive = false;
    return 'die';
  }
  game.snake.unshift(head);
  if (willEat) {
    game.score += 10;
    game.foodsEaten += 1;
    game.level = 1 + Math.floor(game.foodsEaten / 5);
    game.food = spawnFood(game);
    if (!game.food) {
      // Board completely filled — a win nobody will ever see, but handle it.
      game.alive = false;
      game.won = true;
      return 'win';
    }
    return 'eat';
  }
  game.snake.pop();
  return null;
}
