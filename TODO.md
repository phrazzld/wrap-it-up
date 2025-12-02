# TODO: Sprint - Polish & Ship

## Context
- Source: TASK.md (bug), BACKLOG.md "Now" section
- Branch: TBD (create before starting)
- Patterns: ES6 modules, class-based, vanilla JS

## Tasks

- [x] Fix animation timer frame-dependence
  ```
  File: player.js:87-96
  Problem: animtimer++ counts frames, not time. 144Hz = 2x animation speed
  Fix:
    this.animtimer += deltaTime;
    if (this.animtimer > 0.13) {  // ~8 frames at 60fps
      this.animtimer = 0;
      this.animframe = (this.animframe + 1) % 4;
    }
  Success: Animation identical at 30fps and 144fps
  Time: 5m
  ```

- [x] Sanitize leaderboard name input
  ```
  File: main.js:107-109
  Problem: Accepts any character including script tags, control chars, unicode
  Fix: Whitelist alphanumeric + space only
    if (/^[a-zA-Z0-9 ]$/.test(e.key) && username.length < maxnamechars) {
      username += e.key;
    }
  Success: <script>, emoji, control chars rejected; "John123" works
  Risk: HIGH - ship blocker
  Time: 5m
  ```

- [ ] Delete debug display
  ```
  File: main.js:274-278
  Fix: Delete these 4 lines showing FPS/Speed
  Success: No yellow debug text in production
  Time: 2m
  ```

- [ ] Fix circular dependency
  ```
  File: levels.js:3
  Problem: levels.js imports scoreboardobj from main.js (circular)
  Check: Already accepts scoreboard as param to collideplayer()
  Fix: Remove unused import line
  Success: `git grep "from './main.js'" levels.js` returns empty
  Time: 5m
  ```

- [ ] Extract triggerGameOver() function
  ```
  File: main.js:157-174
  Problem: 7 lines duplicated for fall-death and health-death
  Fix: Extract function, call from both conditions
    function triggerGameOver() {
      gameOverSound.play();
      gamestate = 'gameover';
      backgroundMusic.currentTime = 0;
      backgroundMusic.pause();
      menuMusic.currentTime = 0;
      menuMusic.play();
    }
  Success: Single function handles both death conditions
  Time: 10m
  ```

- [ ] Flatten input handler nesting
  ```
  File: main.js:68-113
  Problem: 45 lines with 3-level nesting, hard to follow
  Fix: Extract handleMenuInput(), handleGameOverInput(), handleNameEntry()
  Success: Each handler <15 lines, max 1 level nesting
  Time: 30m
  ```

## Deferred (see BACKLOG.md)

- Document magic numbers (1h) - do after shipping
- Design tokens module (5h) - separate PR

## Notes

- All tasks independent, can parallelize
- No test infra yet (listed in BACKLOG.md "Next")
- Keep patches minimal - no drive-by fixes
