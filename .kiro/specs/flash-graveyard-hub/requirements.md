# Requirements — Flash Graveyard Hub

## Introduction
Flash Graveyard resurrects dead Adobe Flash web games as a single HTML5 hub.
The hub is the front door: a spooky graveyard scene where each game is a
tombstone. Players pick a game, earn shared "soul" points, and see local
high scores. No build step, no backend, no accounts — everything runs in
the browser and persists in `localStorage`.

## Glossary
- **Soul**: the shared cross-game currency/points. Playing any game earns
  souls; the hub total is the sum of souls banked from all games.
- **Tombstone**: a hub card shaped like a gravestone; one per game.
- **Best**: a game's best score, stored locally per game.

## Requirements

### Requirement 1: Hub landing
**User Story:** As a player, I want a graveyard-themed home screen, so I
immediately understand the resurrection theme and can pick a game.

#### Acceptance Criteria
1. WHEN the app loads THEN the hub SHALL render a title, a subtitle
   explaining the Flash-resurrection idea, and one tombstone per game
   (Snake, Breakout, Memory).
2. WHEN the hub renders THEN each tombstone SHALL show the game name, a
   one-line description, the player's best score for that game, and a
   "Play" action.
3. WHEN the viewport is a phone (<= 640px wide) THEN the tombstones SHALL
   stack vertically and remain fully tappable.

### Requirement 2: Shared souls
**User Story:** As a player, I want one soul total shared across games,
so progress in one game feels meaningful in the others.

#### Acceptance Criteria
1. WHEN a game ends THEN the souls it earned SHALL be added to the hub
   total and the hub total SHALL update without a page reload.
2. WHEN the app loads THEN the hub SHALL display the stored soul total
   from `localStorage`.
3. WHEN `localStorage` is unavailable THEN the app SHALL keep souls in
   memory for the session and SHALL NOT crash.

### Requirement 3: Navigation
**User Story:** As a player, I want to move between hub and games without
losing my place, so I can try another game quickly.

#### Acceptance Criteria
1. WHEN a game starts THEN the hub SHALL hide and the game screen SHALL
   show with a visible "Back to Graveyard" control.
2. WHEN the player returns to the hub THEN the hub SHALL show updated
   soul totals and best scores.
3. WHEN the player presses Escape during a game THEN the game SHALL pause
   (where pausing applies) and offer a return to the hub.

### Requirement 4: Theme and accessibility
**User Story:** As a player, I want a spooky-but-readable interface, so
the theme adds fun without hurting usability.

#### Acceptance Criteria
1. WHEN the hub renders THEN text contrast SHALL meet WCAG AA for normal
   text against its background.
2. WHEN the player prefers reduced motion THEN decorative animations
   (floating ghosts, flicker) SHALL be disabled.
3. WHEN the app renders THEN all artwork SHALL be CSS/emoji only — no
   third-party images, fonts, or audio files.
