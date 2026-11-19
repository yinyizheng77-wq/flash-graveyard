# Requirements — Haunted Memory (Memory Match)

## Introduction
A Flash-era memory card game: flip tombstone cards to find matching
pairs of Halloween spirits before the moves run out.

## Requirements

### Requirement 1: Core play
**User Story:** As a player, I want to flip cards to find pairs, so the
game feels like the Flash original.

#### Acceptance Criteria
1. WHEN the game starts THEN 16 cards (8 pairs) SHALL be dealt face down
   in a shuffled 4x4 grid.
2. WHEN the player flips two cards THEN a matching pair SHALL stay face
   up and a non-matching pair SHALL flip back after a short delay.
3. WHEN all 8 pairs are found THEN the game SHALL end in a win.
4. WHEN the player flips a card THEN the move counter SHALL count one
   move per pair of flips.

### Requirement 2: Scoring
**User Story:** As a player, I want fewer moves to mean a better score,
so careful play is rewarded.

#### Acceptance Criteria
1. WHEN the game is won THEN the score SHALL be `max(100, 1600 - 50 *
   (moves - 8))` — a perfect 8-move game scores 1600.
2. WHEN the game is won THEN the elapsed time SHALL be shown alongside
   the score.

### Requirement 3: Difficulty
**User Story:** As a player, I want a harder mode, so I can replay.

#### Acceptance Criteria
1. WHEN the player picks Hard THEN the grid SHALL be 6x4 with 12 pairs.
2. WHEN the player picks Easy THEN the grid SHALL be 4x4 with 8 pairs.

### Requirement 4: Scoring and souls
**User Story:** As a player, I want my score to count toward the hub.

#### Acceptance Criteria
1. WHEN the game ends THEN the score SHALL be banked to the hub
   (souls = max(1, floor(score / 10))).
2. WHEN the score beats the stored best THEN the best SHALL update.
