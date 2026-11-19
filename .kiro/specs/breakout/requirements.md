# Requirements — Crypt Breaker (Breakout)

## Introduction
A Flash-era breakout game: smash the crypt bricks with a ghost ball,
don't let it fall past your paddle.

## Requirements

### Requirement 1: Core play
**User Story:** As a player, I want to bounce a ball to break bricks, so
the game feels like the Flash original.

#### Acceptance Criteria
1. WHEN the game starts THEN a wall of bricks SHALL be shown, the paddle
   SHALL sit at the bottom, and the ball SHALL launch on first input.
2. WHEN the ball hits a brick THEN that brick SHALL break and the score
   SHALL increase by 10.
3. WHEN the ball hits the paddle THEN it SHALL bounce up, with the angle
   depending on where it struck the paddle.
4. WHEN the ball falls below the paddle THEN one life SHALL be lost; at
   0 lives the game SHALL end.

### Requirement 2: Levels
**User Story:** As a player, I want new levels after clearing the wall,
so the game keeps going.

#### Acceptance Criteria
1. WHEN all bricks are cleared THEN the next level SHALL start with more
   brick rows (up to 7) and a faster ball.
2. WHEN the level increases THEN the level SHALL be shown on screen.

### Requirement 3: Input
**User Story:** As a player on phone or keyboard, I want to move the
paddle precisely.

#### Acceptance Criteria
1. WHEN the player moves the mouse or drags a finger over the canvas THEN
   the paddle SHALL follow.
2. WHEN the player uses Left/Right arrows THEN the paddle SHALL move
   smoothly.

### Requirement 4: Scoring and souls
**User Story:** As a player, I want my score to count toward the hub.

#### Acceptance Criteria
1. WHEN the game ends THEN the score SHALL be banked to the hub
   (souls = max(1, floor(score / 10)) when score > 0).
2. WHEN the score beats the stored best THEN the best SHALL update.
