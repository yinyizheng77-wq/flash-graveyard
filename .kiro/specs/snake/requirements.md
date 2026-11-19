# Requirements — Grave Snake (Snake)

## Introduction
A Flash-era snake game, resurrected: guide a ghost snake through the
graveyard, eat glowing souls, and don't bite yourself or the fence.

## Requirements

### Requirement 1: Core play
**User Story:** As a player, I want to steer a snake that grows when it
eats, so the game feels like the Flash original.

#### Acceptance Criteria
1. WHEN the game starts THEN the snake SHALL have length 3 on a 20x20
   grid and one soul SHALL be placed on a free cell.
2. WHEN the snake eats a soul THEN it SHALL grow by 1, the score SHALL
   increase by 10, and a new soul SHALL appear on a free cell.
3. WHEN the snake hits a wall or itself THEN the game SHALL end.
4. WHEN the player presses an arrow key or WASD THEN the snake SHALL
   turn, but SHALL NOT reverse directly into itself.

### Requirement 2: Difficulty ramp
**User Story:** As a player, I want the game to get faster as I eat, so
it stays challenging.

#### Acceptance Criteria
1. WHEN the snake eats every 5th soul THEN the step interval SHALL
   decrease (150ms start, -8ms per level, minimum 70ms).
2. WHEN the level increases THEN the level SHALL be shown on screen.

### Requirement 3: Input and controls
**User Story:** As a player on phone or keyboard, I want controls that
work on my device.

#### Acceptance Criteria
1. WHEN the player swipes on the canvas THEN the snake SHALL turn in the
   swipe direction.
2. WHEN the player presses Space or P THEN the game SHALL pause/resume.
3. WHEN the game is paused THEN a pause overlay SHALL be visible.

### Requirement 4: Scoring and souls
**User Story:** As a player, I want my score to count toward the hub.

#### Acceptance Criteria
1. WHEN the game ends THEN the score SHALL be banked to the hub
   (souls = max(1, floor(score / 10)) when score > 0).
2. WHEN the score beats the stored best THEN the best SHALL update.
