// == enemymanager.js ==
import { iscolliding } from './utils.js';
import { scoreboardobj } from './main.js';

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

  update(delta, level, gravity, player, scoreboard) {
    this.timer += delta;

    // dynamic spawn interval
    const score = scoreboardobj.score;
    let spawninterval = 0;
    if (score < 5) {
      spawninterval = 200;
    } else if (score < 10) {
      spawninterval = 170;
    } else if (score < 15) {
      spawninterval = 130;
    } else if (score < 20) {
      spawninterval = 90;
    } else {
      spawninterval = 30;
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
      if (platformsinsight.length > 0) {
        const p = platformsinsight[Math.floor(Math.random() * platformsinsight.length)];

        if (!spawnHelicopter) {
          // normal patroller
          const ex = p.x + (Math.random() * (p.w - 40));
          const ey = p.y - 40;
          const dir = Math.random() < 0.5 ? -1 : 1;
          const newEnemy = {
            type: 'patrol',
            x: ex,
            y: ey,
            w: 40,
            h: 40,
            vx: dir * (1 + Math.random() * 1.5),
            vy: 0
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
            w: 40,
            h: 40,
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
        e.vy += gravity;
        e.x += e.vx;
        e.y += e.vy;

        let landedOnPlatform = false;
        for (let p of level.platforms) {
          // check bounding-box overlap
          if (iscolliding(e.x, e.y, e.w, e.h, p.x, p.y, p.w, p.h)) {
            // compare e's old bottom to the platform's old top
            const oldEnemyBottom = (e.y - e.vy) + e.h;
            const oldPlatformTop = p.oldY;

            // if the enemy was above the old platform top
            if (oldEnemyBottom <= oldPlatformTop) {
              // shift horizontally by platform's dx
              const dx = p.x - p.oldX;
              e.x += dx;
              // shift vertically by platform's dy
              const dy = p.y - p.oldY;
              e.y += dy;

              // place enemy on top
              e.y = p.y - e.h;
              e.vy = 0;
              landedOnPlatform = true;
            }
          }
        }

        // flip direction if no future platform
        if (landedOnPlatform) {
          const footcheckx = e.x + (e.vx > 0 ? e.w : 0) + e.vx * 5;
          const footchecky = e.y + e.h + 1;
          let onplatform = false;
          for (let p of level.platforms) {
            if (
              footcheckx >= p.x &&
              footcheckx <= p.x + p.w &&
              footchecky >= p.y &&
              footchecky <= p.y + p.h
            ) {
              onplatform = true;
              break;
            }
          }
          if (!onplatform) {
            e.vx = -e.vx;
          }
        }
      } else if (e.type === 'helicopter') {
        e.hoverTimer += 0.05;
        const amplitude = 20;
        e.x += e.vx;
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
      for (let e of playerStomped) {
        e.dead = true;
        scoreboard.addpoints(1);
      }
      // give the player that bounce
      player.vy = -8;
    }

    // now see if we got hit by any enemy we *didn't* stomp
    for (let e of this.enemies) {
      if (!e.dead && iscolliding(player.x, player.y, player.w, player.h, e.x, e.y, e.w, e.h)) {
        // if it wasn't in that stomp group, it means we collided from side/below
        hitSound.currentTime = 0;
        hitSound.play();
        player.health--;
        scoreboard.flash();
        // bounce horizontally away
        player.vx = (player.x < e.x) ? -6 : 6;
        player.vy = -5;
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
