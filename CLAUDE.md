# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wrap-It-Up is a holiday-themed 2D endless sidescroller platformer game built with vanilla JavaScript and HTML5 Canvas. The game features procedurally generated platforms, enemy AI, collectibles, and a local leaderboard system.

## Development Commands

**Local Development:**
- Open `index.html` directly in a modern web browser
- Use a local web server for proper ES6 module support: `python3 -m http.server 8000` or `npx serve`
- No build process required - game runs directly from source files

**Deployment:**
- The game is deployed to GitHub Pages at wrap-it-up.io
- Push to the `master` branch to deploy changes automatically

## Architecture & Code Structure

### Core Game Loop Architecture
The game follows a classic game loop pattern with state management:
- **main.js**: Entry point, game state machine (menu → playing → gameover), core game loop, input handling
- **State flow**: Menu screen → Game initialization → Update/Render loop → Game over → Score entry → Menu

### Key Components

**Player System (player.js):**
- Handles player physics, movement, and collision
- Variable jump height based on button hold duration
- Animation states based on movement

**Level Generation (levels.js):**
- Procedural chunk-based level generation
- Dynamic platform creation with gap and height constraints
- Moving platforms with various movement patterns (horizontal, vertical, circular)
- Collectible spawning (candy canes for points, health packs)

**Enemy System (enemymanager.js):**
- Two enemy types: patrol (ground) and helicopter (air)
- Dynamic difficulty scaling based on score
- Collision detection with player for damage/stomping

**Scoring System (scoreboard.js & leaderboard.js):**
- Real-time score tracking during gameplay
- Local storage-based leaderboard persistence
- Name entry system on game over

### Asset Management
- All assets loaded as HTML Image/Audio objects
- Sprites in `assets/sprites/`
- Audio in `assets/audio/` (background music, sound effects)
- Background images in `assets/images/`

### Game Mechanics

**Collision System:**
- AABB collision detection (utils.js: `iscolliding`)
- Platform collision for ground detection
- Enemy collision for damage/stomping
- Collectible collision for pickups

**Difficulty Progression:**
- Enemy spawn rate increases with score
- Platform movement speed increases over time
- More helicopter enemies spawn at higher scores

**Camera System:**
- Side-scrolling camera follows player
- Automatic chunk generation as player progresses

## Key Patterns & Conventions

- **ES6 Modules**: All JavaScript files use ES6 module syntax
- **Class-based Architecture**: Core game objects (Player, Level, EnemyManager) are classes
- **Singleton Pattern**: Scoreboard and leaderboard instances shared via exports
- **No External Dependencies**: Pure vanilla JavaScript, no frameworks or libraries
- **Canvas Rendering**: Direct 2D context drawing, no WebGL

## Common Development Tasks

**Adding New Enemy Types:**
1. Add enemy sprite to `assets/sprites/`
2. Extend enemy spawning logic in `enemymanager.js`
3. Add collision/behavior logic in the update method

**Modifying Difficulty Curve:**
- Adjust spawn intervals in `enemymanager.js` (lines 29-39)
- Modify platform generation parameters in `levels.js`
- Change movement speed scaling in platform update logic

**Adding Sound Effects:**
1. Add audio file to `assets/audio/`
2. Create Audio object in relevant module
3. Call `.play()` at appropriate game event

**Debugging:**
- Use browser DevTools console for debugging
- Canvas coordinates: (0,0) is top-left
- Player starts at x:100, platforms generate rightward

## Performance Considerations

- Chunk-based level generation prevents memory overflow
- Old platforms/enemies cleaned up when off-screen
- Audio preloading prevents playback delays
- Sprite rendering optimized with single draw calls

## Known Issues & TODOs

See `plan.md` for current TODO list including:
- Volume control/muting support
- Improved menu navigation
- Performance optimizations for slow connections
- Additional enemy types and mechanics