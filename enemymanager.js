// == enemymanager.js ==
import { iscolliding } from './utils.js';

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

    // spawn new enemies
    if (this.timer >= this.spawninterval) {
      this.timer = 0;

      // decide: normal patroller or helicopter?
      // e.g. 70% chance patroller, 30% chance helicopter
      const spawnHelicopter = Math.random() < 0.3;

      const x = player.x + 1000;
      const platformsinsight = level.platforms.filter(
        (p) => p.x < x + 200 && p.x + p.w > x - 200
      );
      if (platformsinsight.length > 0) {
        const p = platformsinsight[Math.floor(Math.random() * platformsinsight.length)];

        if (!spawnHelicopter) {
          // === normal "patroller" enemy ===
          const ex = p.x + (Math.random() * (p.w - 40));
          const ey = p.y - 40;
          const dir = Math.random() < 0.5 ? -1 : 1;
          this.enemies.push({
            type: 'patrol',  // new property to differentiate
            x: ex,
            y: ey,
            w: 40,
            h: 40,
            vx: dir * (1 + Math.random() * 1.5),
            vy: 0,
          });
        } else {
          // === toy helicopter ===
          // let’s pick a random x above the same platform
          // and then pick some y offset to hover
          const ex = p.x + (Math.random() * (p.w - 40));
          const ey = p.y - 120 - Math.random() * 50;
          // store a "hover center" so we can do a simple sinusoidal
          // or keep it static if you prefer
          this.enemies.push({
            type: 'helicopter',
            x: ex,
            y: ey,
            w: 40,
            h: 40,
            vx: (Math.random() < 0.5 ? -1 : 1) * 1.2, // horizontal drifting speed
            vy: 0,
            hoverCenterY: ey,
            hoverTimer: 0,  // used for a sinusoidal bob
          });
        }
      }
    }

    // update existing enemies
    for (let e of this.enemies) {
      // handle each type differently
      if (e.type === 'patrol') {
        // normal patroller: applies gravity
        e.vy += gravity;
        e.x += e.vx;
        e.y += e.vy;

        // collision resolution against platforms
        let onplatform = false;
        for (let p of level.platforms) {
          // vertical collision
          if (iscolliding(e.x, e.y, e.w, e.h, p.x, p.y, p.w, p.h)) {
            let ptop = p.y;
            let oldebottom = (e.y - e.vy) + e.h;
            if (oldebottom <= ptop) {
              e.y = p.y - e.h;
              e.vy = 0;
            }
          }
        }

        // predictive foot check to flip direction
        const footcheckx = e.x + (e.vx > 0 ? e.w : 0) + e.vx * 5;
        const footchecky = e.y + e.h + 1;
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
      } else if (e.type === 'helicopter') {
        // no gravity effect, let's do a hover / bob
        e.hoverTimer += 0.05;
        // pick a small amplitude for up/down motion
        const amplitude = 20;
        // update position
        e.x += e.vx; // can drift horizontally
        e.y = e.hoverCenterY + Math.sin(e.hoverTimer) * amplitude;

        // optional: bounce back if off platform "range"
        // or just keep drifting freely

        // you can add a check if it's too far behind the player, etc.
      }

      // check if far behind or too low
      if (e.x + e.w < player.x - 800 || e.y > 2000) {
        e.dead = true;
      }

      // collision with player
      if (iscolliding(player.x, player.y, player.w, player.h, e.x, e.y, e.w, e.h)) {
        // see if player came from above
        let enemyTop = e.y;
        let oldPlayerBottom = (player.y - player.vy) + player.h;

        if (oldPlayerBottom <= enemyTop) {
          // player jumped on enemy
          enemyKilledSound.currentTime = 0;
          enemyKilledSound.play();
          e.dead = true;
          player.vy = -8;
          scoreboard.addpoints(1);
        } else {
          // enemy hits player from side or below
          hitSound.currentTime = 0;
          hitSound.play();
          player.health--;
          scoreboard.flash();
          player.vx = (player.x < e.x) ? -6 : 6;
          player.vy = -5;
          e.dead = true;
        }
      }
    }

    // purge dead enemies
    this.enemies = this.enemies.filter((e) => !e.dead);
  }
}
