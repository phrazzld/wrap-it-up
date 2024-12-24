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
      h: 40
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

          const candidate = { x: newx, y: newy, w: neww, h: 40 };
          let collision = false;
          for (let p of this.platforms) {
            if (this.platformsCollide(candidate, p)) {
              collision = true;
              break;
            }
          }

          if (!collision) {
            this.platforms.push(candidate);
            lastp = candidate;

            // random chance to spawn a gift
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
    const nextboundary = this.generatedchunks * this.chunkwidth + this.chunkwidth;
    if (playerx + 600 > nextboundary) {
      this.generatechunk(this.generatedchunks + 1);
      this.generatedchunks++;
    }
  }

  draw(ctx, camera) {
    ctx.fillStyle = '#493';
    for (let p of this.platforms) {
      ctx.fillRect(p.x - camera.x, p.y, p.w, p.h);
    }

    // draw gifts
    ctx.fillStyle = '#ff0';
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
        const platformtop = p.y;
        const oldplayerbottom = (player.y - player.vy) + player.h;
        if (oldplayerbottom <= platformtop) {
          player.y = platformtop - player.h;
          player.vy = 0;
          player.onground = true;
        }
      }
    }

    // collect gifts
    for (let g of this.gifts) {
      if (!g.collected && iscolliding(player.x, player.y, player.w, player.h, g.x, g.y, g.w, g.h)) {
        giftSound.play();
        g.collected = true;
        scoreboard.addpoints(1);
      }
    }
  }
}
