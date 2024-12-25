// == playerclass.js ==
const jumpSound = new Audio('assets/audio/jump.mp3');
jumpSound.volume = 0.5;

export class playerclass {
  constructor() {
    this.x = 100;
    this.y = 0;
    this.w = 40;
    this.h = 60;
    this.vx = 0;
    this.vy = 0;
    this.speed = 4;
    this.direction = 1;
    this.animframe = 0;
    this.animtimer = 0;
    this.health = 3;
    this.onground = false;
  }

  reset() {
    this.x = 100;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.health = 3;
    this.onground = false;
  }

  update(keys, gravity, jumppower) {
    // horizontal movement
    if (keys.left) {
      this.vx = -this.speed;
      this.direction = -1;
    } else if (keys.right) {
      this.vx = this.speed;
      this.direction = 1;
    } else {
      this.vx = 0;
    }

    // jump
    if (keys.up && this.onground) {
      this.vy = -jumppower;
      this.onground = false;
      jumpSound.currentTime = 0; // reset so it can play fully
      jumpSound.play();
    }

    // gravity
    this.vy += gravity;

    // apply velocity
    this.x += this.vx;
    this.y += this.vy;

    // animate
    if (this.vx !== 0) {
      this.animtimer++;
      if (this.animtimer > 8) {
        this.animtimer = 0;
        this.animframe = (this.animframe + 1) % 4;
      }
    } else {
      this.animframe = 0;
      this.animtimer = 0;
    }
  }
}
