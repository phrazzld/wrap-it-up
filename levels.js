// == level.js ==
import { iscolliding } from './utils.js';
import { scoreboardobj } from './main.js';

const giftSound = new Audio('assets/audio/coin.mp3');
giftSound.volume = 0.8;

export class level {
  constructor({
    maxhorizontal = 250,
    maxvertical = 80,
    playerwidth = 40
  } = {}) {
    this.platforms = [];
    this.gifts = [];
    this.healthpacks = [];
    this.chunkwidth = 800;
    this.generatedchunks = 0;
    this.maxhorizontal = maxhorizontal;
    this.maxvertical = maxvertical;
    this.minwidth = playerwidth + 20;
  }

  init() {
    // guaranteed first platform
    this.platforms.push({
      x: 0,
      y: 350,
      w: 200,
      h: 40,

      moving: false,
      moveType: 'none',
      centerX: 0,
      centerY: 350,
      moveTimer: 0,
      moveSpeed: 0,
      moveAmplitudeX: 0,
      moveAmplitudeY: 0,

      // store old positions
      oldX: 0,
      oldY: 350
    });
    this.generatechunk(0);
  }

  generatechunk(chunkindex) {
    const startx = chunkindex * this.chunkwidth;
    const platformcount = 3 + Math.floor(Math.random() * 3);
    let lastp = this.platforms[this.platforms.length - 1];

    for (let i = 0; i < platformcount; i++) {
      let tries = 0;
      let placed = false;

      while (!placed && tries < 20) {
        const gap = Math.random() * (this.maxhorizontal * 0.75) + (this.maxhorizontal * 0.25);
        const newx = lastp.x + lastp.w + gap;

        if (newx < startx + (this.chunkwidth - 50)) {
          const neww = this.minwidth + Math.random() * 200;
          const miny = Math.max(50, lastp.y - this.maxvertical);
          const maxy = Math.min(550, lastp.y + this.maxvertical);
          const newy = Math.random() * (maxy - miny) + miny;

          const candidate = {
            x: newx,
            y: newy,
            w: neww,
            h: 40,
            moving: false,
            moveType: 'none',
            centerX: newx,
            centerY: newy,
            moveTimer: 0,
            moveSpeed: 0,
            moveAmplitudeX: 0,
            moveAmplitudeY: 0,
            oldX: newx,
            oldY: newy
          };

          // check collision with existing platforms
          let collision = false;
          for (let p of this.platforms) {
            if (this.platformsCollide(candidate, p)) {
              collision = true;
              break;
            }
          }

          if (!collision) {
            const score = scoreboardobj.score;
            const oddsPlatformIsMoving = 1 / (1 + Math.exp(-0.2 * (score - 10)));
            const baseSpeed = 0.02;
            const baseAmplitude = 40;

            candidate.moveSpeed = baseSpeed + Math.min(score, 50) * 0.0016; // linear speed scaling
            const amplitudeFactor = baseAmplitude + Math.min(score, 50) * 1.2;

            if (Math.random() < oddsPlatformIsMoving) {
              candidate.moving = true;
              const roll = Math.random();
              if (roll < 0.4) {
                candidate.moveType = 'vertical';
                candidate.moveAmplitudeY = amplitudeFactor;
              } else if (roll < 0.8) {
                candidate.moveType = 'horizontal';
                candidate.moveAmplitudeX = amplitudeFactor;
              } else {
                candidate.moveType = 'both';
                candidate.moveAmplitudeX = amplitudeFactor;
                candidate.moveAmplitudeY = amplitudeFactor;
              }
            }

            this.platforms.push(candidate);
            lastp = candidate;

            // spawn gifts and health packs
            if (Math.random() < 0.4) {
              const gx = candidate.x + (Math.random() * (candidate.w - 20));
              const gy = candidate.y - 20;
              this.gifts.push({ x: gx, y: gy, w: 20, h: 20, collected: false });
            }

            if (Math.random() < 0.1) {
              const gx = candidate.x + (Math.random() * (candidate.w - 20));
              const gy = candidate.y - 20;
              this.healthpacks.push({ x: gx, y: gy, w: 20, h: 20, collected: false });
            }

            placed = true;
          }
        }
        tries++;
      }
    }
  }


  platformsCollide(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  update(playerx) {
    // chunk generation
    const nextboundary = this.generatedchunks * this.chunkwidth + this.chunkwidth;
    if (playerx + 600 > nextboundary) {
      this.generatechunk(this.generatedchunks + 1);
      this.generatedchunks++;
    }

    // update moving platforms
    for (let p of this.platforms) {
      if (!p.moving) continue;

      // store old positions
      p.oldX = p.x;
      p.oldY = p.y;

      p.moveTimer += p.moveSpeed;

      if (p.moveType === 'vertical') {
        p.y = p.centerY + Math.sin(p.moveTimer) * p.moveAmplitudeY;
      } else if (p.moveType === 'horizontal') {
        p.x = p.centerX + Math.sin(p.moveTimer) * p.moveAmplitudeX;
      } else if (p.moveType === 'both') {
        p.x = p.centerX + Math.sin(p.moveTimer) * p.moveAmplitudeX;
        p.y = p.centerY + Math.cos(p.moveTimer) * p.moveAmplitudeY;
      }
    }
  }

  draw(ctx, camera) {
    // platform color
    ctx.fillStyle = '#228B22';
    for (let p of this.platforms) {
      ctx.fillRect(p.x - camera.x, p.y, p.w, p.h);
    }

    // gifts
    ctx.fillStyle = '#fa0';
    for (let g of this.gifts) {
      if (!g.collected) {
        ctx.fillRect(g.x - camera.x, g.y, g.w, g.h);
      }
    }

    // health packs
    // they're red
    ctx.fillStyle = '#f00';
    for (let h of this.healthpacks) {
      if (!h.collected) {
        ctx.fillRect(h.x - camera.x, h.y, h.w, h.h);
      }
    }
  }

  collideplayer(player, scoreboard) {
    player.onground = false;

    for (let p of this.platforms) {
      // standard bounding box check
      if (iscolliding(player.x, player.y, player.w, player.h, p.x, p.y, p.w, p.h)) {
        // if player is moving downward, treat as landing
        if (player.vy >= 0) {
          // shift horizontally by platform's movement
          const dx = p.x - p.oldX;
          player.x += dx;

          // land on top
          player.y = p.y - player.h;
          player.vy = 0;
          player.onground = true;
        }
      }
    }

    // collect gifts
    for (let g of this.gifts) {
      if (
        !g.collected &&
        iscolliding(player.x, player.y, player.w, player.h, g.x, g.y, g.w, g.h)
      ) {
        giftSound.play();
        g.collected = true;
        scoreboard.addpoints(1);
      }
    }

    // collect health packs
    for (let h of this.healthpacks) {
      if (
        !h.collected &&
        iscolliding(player.x, player.y, player.w, player.h, h.x, h.y, h.w, h.h)
      ) {
        // TODO: add proper health pack sound
        giftSound.play();
        h.collected = true;
        if (player.health < 3) {
          player.health++;
        }
      }
    }
  }
}
