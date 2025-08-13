// == enemymanager.js ==
import { iscolliding } from './utils.js';
import { GameConfig } from './gameconfig.js';

const hitSound = new Audio('assets/audio/ow.mp3');
hitSound.volume = 1.0;

const enemyKilledSound = new Audio('assets/audio/bop-01.mp3');
enemyKilledSound.volume = 1.0;

export class enemymanager {
  constructor() {
    this.enemies = [];
    this.spawninterval = 200;
    this.timer = 0;
  }

  reset() {
    this.enemies = [];
    this.timer = 0;
  }

  update(deltaTime, level, player, scoreboard, keys = {}) {
    this.timer += deltaTime;  // Use seconds, not frames!

    // dynamic spawn interval
    const score = scoreboard.score;
    let spawninterval = 0;
    if (score < 5) {
      spawninterval = GameConfig.ENEMY_SPAWN_INTERVAL.INITIAL;
    } else if (score < 10) {
      spawninterval = GameConfig.ENEMY_SPAWN_INTERVAL.INITIAL * 0.8;
    } else if (score < 15) {
      spawninterval = GameConfig.ENEMY_SPAWN_INTERVAL.MEDIUM;
    } else if (score < 20) {
      spawninterval = GameConfig.ENEMY_SPAWN_INTERVAL.MEDIUM * 0.7;
    } else {
      spawninterval = GameConfig.ENEMY_SPAWN_INTERVAL.FAST;
    }

    // spawn new enemies
    if (this.timer >= spawninterval) {
      this.timer = 0;
      let spawnHelicopter = false;
      if (score >= 5) {
        spawnHelicopter = Math.random() < 0.3;
      }

      const x = player.x + 1000;
      const platformsinsight = level.platforms.filter(
        (p) => p.x < x + 200 && p.x + p.w > x - 200
      );
      
      // Spawn guarantee: Always spawn helicopters even without platforms
      if (platformsinsight.length === 0 && score >= 3) {
        // Force helicopter spawn when no platforms available
        const ex = x;
        const ey = 200 + Math.random() * 100;  // Spawn at reasonable height
        const newEnemy = {
          type: 'helicopter',
          x: ex,
          y: ey,
          w: 50,
          h: 30,
          vx: -2,
          vy: 0,
          hoverTimer: 0,
          hoverCenterY: ey  // Fixed: was baseY, should be hoverCenterY
        };
        if (!this.overlapsExisting(newEnemy)) {
          this.enemies.push(newEnemy);
        }
      } else if (platformsinsight.length > 0) {
        const p = platformsinsight[Math.floor(Math.random() * platformsinsight.length)];

        if (!spawnHelicopter) {
          // normal patroller
          // Always spawn at exact center of platform
          const ex = p.x + (p.w / 2) - 20;  // Center minus half enemy width
          const ey = p.y - 40;
          
          // Always start moving right for consistency
          const dir = 1;
          
          const newEnemy = {
            type: 'patrol',
            x: ex,
            y: ey,
            w: 40,
            h: 40,
            vx: GameConfig.ENEMY_PATROL_SPEED * (Math.random() < 0.5 ? -1 : 1),
            vy: 0,
            // Store platform bounds for reliable edge detection
            platformLeft: p.x,
            platformRight: p.x + p.w,
            platformIndex: level.platforms.indexOf(p)  // Use index instead of reference
          };
          if (!this.overlapsExisting(newEnemy)) {
            this.enemies.push(newEnemy);
          }
        } else {
          // helicopter
          const ex = p.x + (Math.random() * (p.w - 40));
          const ey = p.y - 120 - Math.random() * 50;
          const newEnemy = {
            type: 'helicopter',
            x: ex,
            y: ey,
            w: 51,
            h: 73,
            vx: (Math.random() < 0.5 ? -1 : 1) * 1.2,
            vy: 0,
            hoverCenterY: ey,
            hoverTimer: 0
          };
          if (!this.overlapsExisting(newEnemy)) {
            this.enemies.push(newEnemy);
          }
        }
      }
    }

    // update existing enemies
    for (let e of this.enemies) {
      if (e.type === 'patrol') {
        // Validate platform still exists using index
        const platform = level.platforms[e.platformIndex];
        if (!platform) { 
          e.dead = true; 
          continue; 
        }
        
        // Pre-movement boundary check - simple and effective
        const nextX = e.x + (e.vx * deltaTime * GameConfig.GAME_SPEED);
        if (nextX < platform.x || nextX + e.w > platform.x + platform.w) {
          e.vx = -e.vx;  // Turn around
        } else {
          e.x = nextX;  // Move only if within bounds
        }
        
        // Apply gravity
        e.vy += GameConfig.GRAVITY * deltaTime * GameConfig.GAME_SPEED;
        e.y += e.vy * deltaTime * GameConfig.GAME_SPEED;
        
        // Safety clamp position to platform bounds
        e.x = Math.max(platform.x, Math.min(e.x, platform.x + platform.w - e.w));
        
        // Kill enemy if it somehow falls too far below platform
        if (e.y > platform.y + 50) { 
          e.dead = true; 
        }

        let landedOnPlatform = false;
        for (let p of level.platforms) {
          // check bounding-box overlap
          if (iscolliding(e.x, e.y, e.w, e.h, p.x, p.y, p.w, p.h)) {
            // compare e's old bottom to the platform's old top
            const oldEnemyBottom = (e.y - e.vy * deltaTime * GameConfig.GAME_SPEED) + e.h;
            const oldPlatformTop = p.oldY || p.y;

            // if the enemy was above the old platform top
            if (oldEnemyBottom <= oldPlatformTop + 5) {
              // shift horizontally by platform's dx
              const dx = p.x - (p.oldX || p.x);
              e.x += dx;
              // shift vertically by platform's dy
              const dy = p.y - (p.oldY || p.y);
              e.y += dy;

              // place enemy on top
              e.y = p.y - e.h;
              e.vy = 0;
              landedOnPlatform = true;
              
              // Update platform bounds when landing
              e.platformLeft = p.x;
              e.platformRight = p.x + p.w;
              e.platformId = p;
            }
          }
        }
      } else if (e.type === 'helicopter') {
        e.hoverTimer += deltaTime * 3;  // 3 rad/sec
        const amplitude = 20;
        e.x += e.vx * deltaTime * GameConfig.GAME_SPEED;
        e.x = Math.max(0, Math.min(e.x, 5000));  // Prevent infinite travel
        e.y = e.hoverCenterY + Math.sin(e.hoverTimer) * amplitude;
      }

      // offscreen cull
      if (e.x + e.w < player.x - 800 || e.y > 2000) {
        e.dead = true;
      }
    }

    // ### 1) ENEMY SELF-COLLISION ###
    // We'll do a simple pass that pushes overlapping enemies apart horizontally.
    // (vertical separation is trickier if one is "above" the other, but this helps a lot.)
    for (let i = 0; i < this.enemies.length; i++) {
      for (let j = i + 1; j < this.enemies.length; j++) {
        const e1 = this.enemies[i];
        const e2 = this.enemies[j];

        if (!e1.dead && !e2.dead && iscolliding(e1.x, e1.y, e1.w, e1.h, e2.x, e2.y, e2.w, e2.h)) {
          // push them apart
          const overlapWidth = Math.min(e1.x + e1.w, e2.x + e2.w) - Math.max(e1.x, e2.x);
          // move them half the overlap each to left/right based on relative positions
          if (e1.x < e2.x) {
            // e1 is left, e2 is right
            e1.x -= overlapWidth / 2;
            e2.x += overlapWidth / 2;
          } else {
            e1.x += overlapWidth / 2;
            e2.x -= overlapWidth / 2;
          }
        }
      }
    }

    // ### 2) CHAIN STOMP: kill all enemies underfoot in one go ###
    // do a pass to see if the player is stomping
    let playerStomped = [];
    for (let e of this.enemies) {
      if (iscolliding(player.x, player.y, player.w, player.h, e.x, e.y, e.w, e.h)) {
        const enemyTop = e.y;
        const oldPlayerBottom = (player.y - player.vy) + player.h;
        if (oldPlayerBottom <= enemyTop) {
          // we stomped this enemy
          playerStomped.push(e);
        }
      }
    }
    // if we stomped anything, kill them all at once
    if (playerStomped.length > 0) {
      enemyKilledSound.currentTime = 0;
      enemyKilledSound.play();
      
      // Determine enemy type for bounce calculation (use first enemy's type)
      const enemyType = playerStomped[0].type || 'patrol';
      
      for (let e of playerStomped) {
        e.dead = true;
        scoreboard.addpoints(1);
      }
      
      // Use the new physics-based bounce method
      player.bounceFromStomp(keys.up || false, enemyType);
    }

    // now see if we got hit by any enemy we *didn't* stomp
    for (let e of this.enemies) {
      if (!e.dead && iscolliding(player.x, player.y, player.w, player.h, e.x, e.y, e.w, e.h)) {
        // if it wasn't in that stomp group, it means we collided from side/below
        hitSound.currentTime = 0;
        hitSound.play();
        player.health--;
        scoreboard.flash();
        // Apply physics-scaled knockback and hurt bounce
        player.vx = (player.x < e.x) ? -GameConfig.HURT_KNOCKBACK : GameConfig.HURT_KNOCKBACK;
        player.vy = -GameConfig.PLAYER_JUMP_POWER * GameConfig.HURT_BOUNCE_POWER;
        e.dead = true;
      }
    }

    // purge
    this.enemies = this.enemies.filter((e) => !e.dead);
  }

  overlapsExisting(candidate) {
    for (let e of this.enemies) {
      if (!e.dead && iscolliding(candidate.x, candidate.y, candidate.w, candidate.h, e.x, e.y, e.w, e.h)) {
        return true;
      }
    }
    return false;
  }
}
