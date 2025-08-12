# BACKLOG

## Grooming Summary [2025-08-11]

### Items Added by Category
- 5 security improvements (1 critical, 2 automated enforcement)
- 8 code quality improvements (complexity reduction, test coverage, maintainability)
- 5 developer experience enhancements (quality gates, hot reload, automation)
- 6 simplification opportunities (measurable complexity reduction targets)
- 4 performance optimizations (with specific performance targets)
- 5 innovative features (PWA, configuration-driven design, particle system)

### Quality Focus Metrics
- Coverage targets: 0% current → 85% target for core mechanics
- Complexity reductions: 5 functions >80 lines identified for refactoring
- Quality gates: 7 automation opportunities identified (pre-commit, CI/CD, linting)
- Technical debt: ~400 LOC reduction target through consolidation

### Key Themes Discovered
- Massive functions with cyclomatic complexity >20 need urgent decomposition
- No test coverage or quality gates currently exist
- Circular dependencies and tight coupling prevent testing
- 40+ magic numbers scattered throughout codebase
- Performance bottlenecks from O(N²) collision detection

### Recommended Immediate Focus
1. **[CRITICAL] Input validation for username** - Prevent XSS attacks
2. **[HIGH] Break down mega-functions** - enemymanager.update() is 203 lines!
3. **[HIGH] Implement test suite and quality gates** - Foundation for safe refactoring

### Quality Enforcement Added
- ESLint max-lines-per-function: 50
- ESLint complexity: 8
- Pre-commit hooks for code quality
- GitHub Actions CI/CD pipeline
- Test coverage requirement: 85% for new code

---

## Critical Priority (CRITICAL)

- [ ] **[CRITICAL] [SECURITY]** Implement comprehensive input sanitization for username entry with HTML encoding | Effort: S | Impact: Prevents XSS attacks via leaderboard display | Automation: ESLint security rules + pre-commit hooks

## High Priority (HIGH)

### Code Quality & Refactoring
- [ ] **[HIGH] [SIMPLIFY]** Break down enemymanager.update() mega-function (203 lines) into focused methods | Effort: M | Quality: 10/10 | Target: Reduce to <40 lines, complexity from >20 to <8
- [ ] **[HIGH] [SIMPLIFY]** Decompose main.js update() function (80 lines) into separate concerns | Effort: S | Quality: 9/10 | Target: Reduce to <30 lines, extract camera/game-over/snow management
- [ ] **[HIGH] [ALIGN]** Refactor main.js god object (348 lines) into separate modules | Effort: L | Quality: 10/10 | Principle: Single Responsibility - separate game loop, input, rendering, audio
- [ ] **[HIGH] [ALIGN]** Resolve circular dependency between main.js and enemymanager.js | Effort: M | Quality: 9/10 | Principle: Clean Architecture - eliminate hidden coupling via scoreboardobj

### Testing & Quality Gates
- [ ] **[HIGH] [MAINTAIN]** Implement comprehensive test suite for core game mechanics | Effort: L | Target: 85%+ coverage on physics, collision, enemies, levels | Automation: Jest with coverage reporting
- [ ] **[HIGH] [MAINTAIN]** Add automated code quality pipeline with linting and formatting | Effort: M | Target: ESLint + Prettier with 0 violations | Automation: GitHub Actions CI/CD with quality gates
- [ ] **[HIGH] [DX]** Implement pre-commit hooks with ESLint + Prettier | Effort: M | Time saved: 3-4 hours/week | Quality: Prevents bugs before commits

### Development Experience
- [ ] **[HIGH] [DX]** Add Vite dev server with hot reload and integrated linting | Effort: M | Time saved: 5-6 hours/week | Quality: Real-time error feedback, instant validation
- [ ] **[HIGH] [FEATURE]** Development hot reload system with asset watch and debug overlay | Effort: M | Quality: 9/10 | Innovation: Instant feedback loops for rapid iteration

### Security
- [ ] **[HIGH] [SECURITY]** Add CSP headers and Subresource Integrity checks | Effort: M | Risk: XSS injection and supply chain attacks | Automation: CSP validation in CI/CD pipeline
- [ ] **[HIGH] [SECURITY]** Implement client-side score validation with cryptographic signing | Effort: L | Risk: Score manipulation | Automation: Automated testing of validation logic

### Performance
- [ ] **[HIGH] [PERF]** Implement object pooling for enemies and snowflakes | Effort: M | Target: Reduce GC pressure by 70%, frame time <16ms | Measurement: performance.memory monitoring
- [ ] **[HIGH] [PERF]** Optimize collision detection with spatial partitioning | Effort: L | Target: O(N²) to O(N log N), <2ms per frame | Measurement: performance.mark() timing

## Medium Priority (MEDIUM)

### Code Organization
- [ ] **[MEDIUM] [SIMPLIFY]** Create centralized AudioManager to eliminate duplication | Effort: M | Metrics: Remove ~30 duplicate lines | Enforcement: ESLint import restrictions
- [ ] **[MEDIUM] [SIMPLIFY]** Refactor levels.js generatechunk() method (92 lines) | Effort: M | Metrics: Reduce to <45 lines, complexity <6 | Enforcement: Unit tests for extracted functions
- [ ] **[MEDIUM] [MAINTAIN]** Refactor circular dependencies and create module boundaries | Effort: L | Target: Eliminate main.js ↔ levels.js circular import | Automation: ESLint import/no-cycle rule
- [ ] **[MEDIUM] [MAINTAIN]** Extract configuration constants to centralized config | Effort: S | Target: Move 20+ magic numbers to config.js | Automation: ESLint no-magic-numbers rule

### Features & Innovation
- [ ] **[MEDIUM] [FEATURE]** Convert to PWA with offline play and mobile support | Effort: L | Quality: 10/10 | Innovation: Cross-platform deployment without core logic changes
- [ ] **[MEDIUM] [FEATURE]** Physics-based particle system with object pooling | Effort: M | Quality: 8/10 | Innovation: Consolidates visual effects, improves performance
- [ ] **[MEDIUM] [FEATURE]** Configuration-driven game design system with JSON configs | Effort: M | Quality: 9/10 | Innovation: Data-driven design enables rapid balancing

### Development Workflow
- [ ] **[MEDIUM] [DX]** Set up GitHub Actions workflow with quality gates | Effort: L | Time saved: 2-3 hours/week | Quality: Catches issues before merge
- [ ] **[MEDIUM] [DX]** Add JavaScript error boundary with debugging overlay | Effort: S | Time saved: 4-5 hours/week | Quality: Faster bug identification

### Performance
- [ ] **[MEDIUM] [PERF]** Implement audio object pooling and preloading | Effort: M | Target: <50ms latency, 95% cache hit rate | Measurement: Track audio.readyState timing
- [ ] **[MEDIUM] [PERF]** Add viewport culling for off-screen entities | Effort: S | Target: 60% reduction in draw calls | Measurement: Count actual vs potential drawImage calls
- [ ] **[MEDIUM] [PERF]** Batch canvas state changes and optimize rendering | Effort: M | Target: 50% reduction in state changes, <8ms draw phase | Measurement: Track fillStyle/font changes

### Security & Deployment
- [ ] **[MEDIUM] [SECURITY]** Configure security headers (HSTS, X-Frame-Options) | Effort: M | Risk: MITM attacks and clickjacking | Automation: Lighthouse CI security audits
- [ ] **[MEDIUM] [SECURITY]** Establish automated security scanning workflow | Effort: L | Risk: Future vulnerabilities | Automation: GitHub Actions + pre-commit security hooks

## Low Priority (LOW)

### Nice-to-Have Features
- [ ] **[LOW] [FEATURE]** Automated asset optimization pipeline | Effort: S | Quality: 7/10 | Innovation: Prevents asset bloat with quality gates
- [ ] **[LOW] [DX]** Implement automated asset optimization (compression, bundle splitting) | Effort: L | Time saved: 1-2 hours/week | Quality: Consistent optimization

### Performance Optimizations
- [ ] **[LOW] [PERF]** Implement asset lazy loading and compression | Effort: L | Target: 40% load time reduction, 2MB→1.2MB | Measurement: Network timing, Time to First Playable
- [ ] **[LOW] [MAINTAIN]** Add error boundaries and performance monitoring | Effort: M | Target: Frame drops <5%, graceful error handling | Automation: Lighthouse CI performance testing

### Existing plan.md TODOs (preserved for reference)
- [ ] **[LOW]** Support volume control / muting | Effort: S | Note: Consider as part of AudioManager refactor
- [ ] **[LOW]** Fix menu navigation | Effort: S | Note: Address after main.js refactoring
- [ ] **[LOW]** Better render/update handling for slow connections | Effort: M | Note: Consider with performance optimizations
- [ ] **[LOW]** Parallax background | Effort: S | Note: Visual enhancement after core improvements
- [ ] **[LOW]** Improve helicopter patrol behavior | Effort: S | Note: After enemy system refactor
- [ ] **[LOW]** Add helicopter shooting mechanics | Effort: M | Note: Feature addition after core quality improvements
- [ ] **[LOW]** Jack-in-the-box enemy | Effort: M | Note: New feature after test coverage established
- [ ] **[LOW]** Game over sound timing improvements | Effort: S | Note: Polish after AudioManager refactor
- [ ] **[LOW]** Fix platform movement player shift bug | Effort: M | Note: Debug after collision system refactor
- [ ] **[LOW]** Trap platforms | Effort: M | Note: New feature after platform system refactor
- [ ] **[LOW]** Chasing blizzard mechanic | Effort: L | Note: Major feature addition for future consideration

## Radical Simplification Options (GORDIAN)

*These are dramatic architectural changes to consider if maintenance burden becomes unsustainable:*

- [ ] **[GORDIAN]** Eliminate entire audio system (6.4MB → 44KB, -99% size) | Impact: Most players mute anyway, replace with visual feedback
- [ ] **[GORDIAN]** Collapse to single HTML file with embedded CSS/JS | Impact: 7 files → 1 file, eliminate module complexity
- [ ] **[GORDIAN]** Remove health system and all enemies | Impact: -400 LOC, pure platforming focus
- [ ] **[GORDIAN]** Replace procedural generation with simple patterns | Impact: -200 LOC, predictable gameplay
- [ ] **[GORDIAN]** Eliminate leaderboard and persistence | Impact: Remove localStorage complexity, focus on intrinsic motivation

## Completed

*Items from plan.md marked as DONE (archived for reference):*
- [x] Make sure you spawn on a platform
- [x] Enemies shouldn't run off platforms
- [x] Ensure jumpable platform distances
- [x] Falling triggers game over
- [x] Show health display
- [x] Spawn collectible gifts for points
- [x] Add Christmas soundtrack
- [x] Add game sound effects
- [x] Jump on enemies to defeat them
- [x] Keyboard controls for restart/menu
- [x] Dynamic fall height calculation
- [x] Variable jump heights
- [x] Helicopter enemy type
- [x] Moving platforms
- [x] Leaderboard system
- [x] Difficulty progression with score
- [x] Health display as hearts
- [x] Prevent enemy overlap
- [x] Progressive platform speed
- [x] Health pack pickups
- [x] Linear difficulty progression
- [x] Health pack sound effect
- [x] Proper sprite graphics
- [x] Menu soundtrack
- [x] Game over soundtrack

---

*Last groomed: 2025-08-11*
*Next grooming recommended: After completing 5+ HIGH priority items*