// Flash Graveyard — hub router + tombstones + shared services.
// Wires the three games together; game rules live in src/logic/.

import { SoulBank, MUTE_KEY } from './souls.js';
import { Sfx } from './sound.js';
import { SnakeGame } from './games/snake-ui.js';
import { BreakoutGame } from './games/breakout-ui.js';
import { MemoryGame } from './games/memory-ui.js';

const GAMES = [
  {
    id: 'snake',
    name: 'Grave Snake',
    icon: '🐍',
    desc: 'Guide the ghost snake, eat souls, dodge the fence and yourself.',
    hint: 'Arrows / WASD / swipe · Space pauses',
  },
  {
    id: 'breakout',
    name: 'Crypt Breaker',
    icon: '🧱',
    desc: 'Smash the crypt bricks with a ghost ball. Clear the wall, level up.',
    hint: 'Mouse / drag / arrows · Space launches',
  },
  {
    id: 'memory',
    name: 'Haunted Memory',
    icon: '🪦',
    desc: 'Flip the tombstones and match the Halloween spirits in fewest moves.',
    hint: 'Click or tap to flip · Easy 8 pairs / Hard 12 pairs',
  },
];

const bank = new SoulBank(window.localStorage);
const sfx = new Sfx();
try {
  sfx.setMuted(window.localStorage.getItem(MUTE_KEY) === '1');
} catch {
  // ignore
}

const screens = {
  hub: document.getElementById('screen-hub'),
  snake: document.getElementById('screen-snake'),
  breakout: document.getElementById('screen-breakout'),
  memory: document.getElementById('screen-memory'),
};

const games = {
  snake: new SnakeGame(screens.snake, { bank, sfx }),
  breakout: new BreakoutGame(screens.breakout, { bank, sfx }),
  memory: new MemoryGame(screens.memory, { bank, sfx }),
};

let current = null;

function renderHub() {
  document.getElementById('soul-total').textContent = bank.getSouls();
  const list = document.getElementById('tombstones');
  list.innerHTML = '';
  for (const g of GAMES) {
    const card = document.createElement('article');
    card.className = 'tombstone';
    card.innerHTML =
      `<div class="tombstone-icon" aria-hidden="true">${g.icon}</div>` +
      `<h2>${g.name}</h2>` +
      `<p>${g.desc}</p>` +
      `<p class="tombstone-hint">${g.hint}</p>` +
      `<p class="tombstone-best">Best: <strong>${bank.getBest(g.id)}</strong></p>` +
      `<button type="button" class="btn" data-play="${g.id}">▶ Play</button>`;
    list.appendChild(card);
  }
}

function showScreen(name) {
  for (const [key, el] of Object.entries(screens)) {
    el.classList.toggle('active', key === name);
  }
  if (current && current !== name && games[current]) games[current].stop();
  current = name;
  if (name === 'hub') {
    renderHub();
  } else {
    sfx.unlock();
    games[name].start();
  }
  window.scrollTo(0, 0);
}

document.addEventListener('click', (e) => {
  const playBtn = e.target.closest('[data-play]');
  if (playBtn) {
    sfx.unlock();
    sfx.play('click');
    showScreen(playBtn.dataset.play);
    return;
  }
  const backBtn = e.target.closest('[data-back]');
  if (backBtn) {
    sfx.play('click');
    showScreen('hub');
    return;
  }
  const againBtn = e.target.closest('[data-again]');
  if (againBtn) {
    sfx.unlock();
    sfx.play('click');
    games[againBtn.dataset.again].start();
    return;
  }
  const diffBtn = e.target.closest('[data-difficulty]');
  if (diffBtn) {
    sfx.unlock();
    sfx.play('click');
    games.memory.begin(Number(diffBtn.dataset.difficulty));
    return;
  }
  const pauseBtn = e.target.closest('[data-pause]');
  if (pauseBtn) {
    const game = games[pauseBtn.dataset.pause];
    if (game.togglePause) game.togglePause();
  }
});

// Mute toggle.
const muteBtn = document.getElementById('mute-btn');
function syncMute() {
  muteBtn.textContent = sfx.muted ? '🔇 Sound off' : '🔊 Sound on';
}
muteBtn.addEventListener('click', () => {
  sfx.unlock();
  sfx.setMuted(!sfx.muted);
  try {
    window.localStorage.setItem(MUTE_KEY, sfx.muted ? '1' : '0');
  } catch {
    // ignore
  }
  syncMute();
  if (!sfx.muted) sfx.play('click');
});

// Refresh hub totals whenever a game banks a score.
window.addEventListener('graveyard:score', () => {
  if (current === 'hub') renderHub();
});

// First gesture unlocks audio (autoplay policy).
window.addEventListener('pointerdown', () => sfx.unlock(), { once: true });

syncMute();
renderHub();
