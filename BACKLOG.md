# BACKLOG

Last groomed: 2025-12-01
Analyzed by: 15 perspectives (8 specialists + 7 master personas)

---

## Now (Sprint-Ready, <2 weeks)

### [SECURITY] Input Sanitization for Leaderboard Names
**File**: main.js:107-109
**Perspectives**: security-sentinel, carmack
**Impact**: Prevents injection attacks and visual exploits via unicode/control characters
**Fix**: Whitelist alphanumeric input only
```javascript
if (/^[a-zA-Z0-9 ]$/.test(e.key) && username.length < maxnamechars) {
  username += e.key;
}
```
**Effort**: 5m | **Risk**: HIGH (ship blocker per Carmack)
**Acceptance**: Script tags, unicode, control chars rejected; normal names work

### [SIMPLIFY] Extract Game Over Logic Duplication
**File**: main.js:157-174
**Perspectives**: fowler, beck, jobs, grug
**Impact**: Eliminates 7 lines of copy-paste code
**Fix**: Extract `triggerGameOver()` function
**Effort**: 10m | **Quality**: DRY principle
**Acceptance**: Single function handles both death conditions

### [SIMPLIFY] Flatten Input Handler Nesting
**File**: main.js:68-113
**Perspectives**: fowler, grug, ousterhout
**Impact**: 45 lines with 3-level nesting → flat, focused functions
**Fix**: Extract `handleMenuInput()`, `handleGameOverInput()`, `handleNameEntry()`
**Effort**: 30m | **Quality**: Reduces cognitive load
**Acceptance**: Each handler <15 lines, max 1 level of nesting

### [DELETE] Remove Debug Display
**File**: main.js:274-278
**Perspectives**: jobs, carmack
**Impact**: FPS/speed text shouldn't ship to users
**Fix**: Delete 4 lines showing debug info
**Effort**: 2m | **Quality**: Polish
**Acceptance**: No yellow debug text visible in production

### [MAINTAINABILITY] Document Magic Numbers
**File**: main.js:177-202, enemymanager.js:27-39, levels.js:112
**Perspectives**: maintainability-maven, fowler, ousterhout
**Impact**: Difficulty tuning values have no explanation
**Fix**: Add comments explaining design intent for spawn rates, sigmoid curve, thresholds
**Effort**: 1h | **Quality**: Critical for game design iteration
**Acceptance**: Every magic number has a comment explaining "why"

### [ARCHITECTURE] Create Design Tokens Module
**File**: NEW designtokens.js + migrate main.js, scoreboard.js
**Perspectives**: design-systems-architect
**Impact**: 50+ hardcoded colors/fonts/spacing → single source of truth
**Fix**: Create designtokens.js with colors, typography, spacing, audio levels
**Effort**: 5h | **Impact**: Brand changes become 1-line edits
**Acceptance**: All rendering uses token values, shadowBlur inconsistency fixed

### [ARCHITECTURE] Fix Circular Dependency
**File**: levels.js:3
**Perspectives**: architecture-guardian, ousterhout
**Impact**: levels.js imports scoreboardobj from main.js (circular)
**Fix**: Remove import - collideplayer already accepts scoreboard as parameter
**Effort**: 5m | **Impact**: Cleaner module boundaries
**Acceptance**: `git grep "from './main.js'" levels.js` returns empty

---

## Next (This Quarter, <3 months)

### [REFACTOR] Break Down enemymanager.update() Mega-Function
**File**: enemymanager.js:23-267
**Perspectives**: complexity-archaeologist, fowler, ousterhout, beck
**Why**: 244 lines doing spawn, movement, collision, damage - untestable monolith
**Approach**: Extract `spawnEnemies()`, `updateEnemyMovement()`, `handlePlayerStomps()`, `handlePlayerDamage()`
**Effort**: 4h | **Impact**: Enables testing, parallel development
**Strategic**: Must complete before adding new enemy types

### [REFACTOR] Decompose levels.generatechunk()
**File**: levels.js:65-157
**Perspectives**: fowler, ousterhout
**Why**: 92 lines doing platform placement, movement config, collectible spawning
**Approach**: Extract `generatePlatformCandidate()`, `configurePlatformMovement()`, `spawnCollectibles()`
**Effort**: 2h | **Impact**: Testable level generation

### [TESTING] Add Test Infrastructure + First Tests
**File**: NEW package.json, utils.test.js
**Perspectives**: beck, architecture-guardian
**Why**: Zero test coverage = zero refactoring courage
**Approach**: Install Vitest, test `iscolliding()` first (pure function, 8 parameters, critical)
**Effort**: 2h | **Impact**: Foundation for safe refactoring
**Target**: 85%+ coverage on collision, physics calculations

### [PERFORMANCE] Fix O(n²) Enemy Self-Collision
**File**: enemymanager.js:196-218
**Perspectives**: performance-pathfinder, torvalds
**Why**: Nested loops checking every enemy pair - 50 enemies = 1,225 checks/frame
**Approach**: Spatial hashing grid OR delete if unnoticed by players
**Effort**: 2h (spatial hash) or 5m (delete) | **Impact**: 60fps at high enemy counts

### [PERFORMANCE] Fix Array Mutation in Loop
**File**: main.js:209-213
**Perspectives**: performance-pathfinder
**Why**: `splice()` in loop is O(n²) for snowflake cleanup
**Fix**: `snowflakes = snowflakes.filter(f => f.y <= canvas.height + 10)`
**Effort**: 2m | **Impact**: 10ms → <1ms for cleanup

### [PERFORMANCE] Add Platform Culling
**File**: levels.js
**Perspectives**: performance-pathfinder
**Why**: Platforms grow indefinitely, memory leak over time
**Fix**: Filter out platforms behind camera: `p.x + p.w > camera.x - 1000`
**Effort**: 10m | **Impact**: Bounds memory at ~50MB

### [UX] Add Loading Screen
**File**: main.js
**Perspectives**: user-experience-advocate, design-systems-architect
**Why**: Black screen during asset load (1-3s), no feedback
**Approach**: Track asset loading, show progress, enable menu when ready
**Effort**: 2h | **Impact**: Professional first impression

### [UX] Add Audio Controls (Mute/Volume)
**File**: main.js + NEW AudioManager
**Perspectives**: user-experience-advocate, jobs, maintainability-maven
**Why**: No way to mute - embarrassing in public, 40% mobile players prefer sound off
**Approach**: M key toggles mute, persist to localStorage
**Effort**: 2h | **Impact**: Quality-of-life essential

### [UX] Add Pause Function
**File**: main.js
**Perspectives**: user-experience-advocate
**Why**: No way to pause - must die to stop playing
**Approach**: ESC/P pauses, shows overlay with resume/quit
**Effort**: 1.5h | **Impact**: Basic expected feature

### [UX] Add Control Instructions to Menu
**File**: main.js:281-312
**Perspectives**: user-experience-advocate, jobs
**Why**: New players mash keys trying to discover controls
**Approach**: Show "Arrow Keys/WASD to move, Space to jump" on menu
**Effort**: 30m | **Impact**: Better onboarding

### [SECURITY] Add CSP Meta Tags
**File**: index.html
**Perspectives**: security-sentinel
**Why**: No Content-Security-Policy headers for defense-in-depth
**Approach**: Add meta tags restricting font-src, script-src, frame-ancestors
**Effort**: 30m | **Impact**: Prevents clickjacking, XSS safety net

### [ARCHITECTURE] Encapsulate Level State
**File**: main.js:127-129, levels.js
**Perspectives**: ousterhout, architecture-guardian
**Why**: main.js directly manipulates `gamelevel.platforms = []` - information leakage
**Fix**: Add `gamelevel.reset()` method hiding internals
**Effort**: 15m | **Impact**: Proper encapsulation

### [ARCHITECTURE] Encapsulate Player State
**File**: enemymanager.js, levels.js, main.js
**Perspectives**: ousterhout
**Why**: Everyone directly mutates player.x, player.y, player.vy - no invariant protection
**Approach**: Add `player.landOnPlatform(y)`, `player.takeDamage()`, `player.setPosition(x, y)`
**Effort**: 2h | **Impact**: Player physics isolated, testable

---

## Soon (Exploring, 3-6 months)

- **[PRODUCT] Mobile Touch Controls + PWA** - Opens 65% of gaming market, 3x TAM
- **[PRODUCT] Social Sharing (Twitter/Clipboard)** - Viral growth, $0 CAC
- **[PRODUCT] Global Leaderboard (Firebase/Supabase)** - Competitive motivation, 5x lifetime
- **[PRODUCT] Progression/Unlock System** - D1 retention 20% → 60%, monetization foundation
- **[PRODUCT] Daily Challenges** - +40-60% DAU, habit formation
- **[FEATURE] Ghost Racing** - Async multiplayer, unique differentiator
- **[REFACTOR] Enemy Class Hierarchy** - Replace type checking with polymorphism (PatrolEnemy, HelicopterEnemy)
- **[PERFORMANCE] Object Pool for Snowflakes** - Eliminates GC stutter
- **[PERFORMANCE] Asset Optimization** - 12.6MB → 4.8MB, 62% faster load
- **[POLISH] Screen Transitions** - Fade between states instead of hard cuts
- **[POLISH] Death Animation** - Tumble/spin, screen shake, slow-mo before game over
- **[POLISH] Screen Shake on Stomp** - Tactile feedback for enemy kills

---

## Later (Someday/Maybe, 6+ months)

- **[MONETIZATION] Cosmetic Marketplace** - Character skins, Stripe integration
- **[MONETIZATION] Rewarded Video Ads** - Extra life for ad view
- **[INTEGRATION] Twitch Extension** - Stream overlay, channel points
- **[INTEGRATION] Discord Bot** - Community leaderboard
- **[VERTICAL] Educational Mode** - Math challenges for power-ups, school licensing
- **[VERTICAL] Corporate Team Building** - White-label builds for events
- **[INNOVATION] Dynamic Music Layering** - Add percussion/melody as score increases
- **[INNOVATION] AI-Generated Daily Levels** - Procedural with GPT-tuned patterns

---

## Decided Against / Deleted

- ~~Health pack system~~ (Jobs: adds complexity without delight, game should focus on skill)
- ~~Combo counter text display~~ (Jobs: yellow "COMBO x3!" is cheap - let bounce BE the feedback)
- ~~Three bubble sound variants~~ (Carmack: players don't notice - keep one)
- ~~Trap platforms~~ (YAGNI - not validated by playtesting)
- ~~Chasing blizzard mechanic~~ (Major scope creep, no clear value)

---

## Learnings

**From this grooming session:**
- **Grug + Carmack + Jobs consensus**: Delete debug display, health packs, combo text - complexity without value
- **Ousterhout's module depth**: utils.js is critically shallow (interface ≈ implementation), but acceptable for collision check
- **Beck's testing insight**: Game is READY for tests, just needs someone to write first one. Start with `iscolliding()`
- **Architecture pattern**: main.js is god object (7 responsibilities, 362 lines) - needs decomposition but works for now
- **Performance reality**: O(n²) enemy collision probably fine with <20 enemies - measure before optimizing

**Quality assessment:**
- Torvalds: "6/10 code quality, 7/10 pragmatism - ship it, fix animation bug"
- Beck: "Current confidence 20%, with 30 tests → 90% refactoring courage"
- Grug: "Complexity demon threat level: LOW (2/10) - code like good stick, straight and simple"

---

*Next grooming recommended: After completing Now items + adding test infrastructure*
