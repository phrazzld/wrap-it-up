// == level.js ==
import { iscolliding } from './utils.js';

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

          let collision = false;
          for (let p of this.platforms) {
            if (this.platformsCollide(candidate, p)) {
              collision = true;
              break;
            }
          }

          if (!collision) {
            // chance to be moving
            if (Math.random() < 0.15) {
              candidate.moving = true;
              const roll = Math.random();
              if (roll < 0.4) {
                candidate.moveType = 'vertical';
                candidate.moveSpeed = 0.02 + Math.random() * 0.03;
                candidate.moveAmplitudeY = 40 + Math.random() * 30;
              } else if (roll < 0.8) {
                candidate.moveType = 'horizontal';
                candidate.moveSpeed = 0.02 + Math.random() * 0.03;
                candidate.moveAmplitudeX = 40 + Math.random() * 30;
              } else {
                candidate.moveType = 'both';
                candidate.moveSpeed = 0.02 + Math.random() * 0.03;
                candidate.moveAmplitudeX = 30 + Math.random() * 30;
                candidate.moveAmplitudeY = 30 + Math.random() * 30;
              }
            }

            this.platforms.push(candidate);
            lastp = candidate;

            // random chance to spawn gift
            if (Math.random() < 0.4) {
              const gx = candidate.x + (Math.random() * (candidate.w - 20));
              const gy = candidate.y - 20;
              this.gifts.push({ x: gx, y: gy, w: 20, h: 20, collected: false });
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
    ctx.fillStyle = '#228B22'; // "forest green" or a more xmas-y green
    for (let p of this.platforms) {
      ctx.fillRect(p.x - camera.x, p.y, p.w, p.h);
    }

    // gifts
    ctx.fillStyle = '#fa0'; // maybe gold-ish
    for (let g of this.gifts) {
      if (!g.collected) {
        ctx.fillRect(g.x - camera.x, g.y, g.w, g.h);
      }
    }
  }

  collideplayer(player, scoreboard) {
    player.onground = false;

    for (let p of this.platforms) {
      if (iscolliding(player.x, player.y, player.w, player.h, p.x, p.y, p.w, p.h)) {
        // if bounding boxes overlap and the player is moving downward, let's treat it as a landing
        if (player.vy >= 0) {
          // shift the player horizontally by however much the platform moved
          const dx = p.x - p.oldX;
          player.x += dx;

          // land them on top
          player.y = p.y - player.h;
          player.vy = 0;
          player.onground = true;
        }
        // optional: advanced logic for being pushed up, etc.
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
  }
}
