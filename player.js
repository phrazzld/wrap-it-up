// playerclass.js

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

    // new boolean to track if player is still holding jump
    this.isJumping = false;
  }

  reset() {
    this.x = 100;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.health = 3;
    this.onground = false;
    this.isJumping = false;
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

    // check jump start
    if (keys.up && this.onground) {
      this.vy = -jumppower;
      this.onground = false;
      this.isJumping = true;
      jumpSound.currentTime = 0;
      jumpSound.play();
    }

    // if we release jump early while still going up, reduce upward velocity
    if (!keys.up && this.isJumping && this.vy < 0) {
      this.vy *= 0.5;
      this.isJumping = false;
    }

    // apply gravity
    this.vy += gravity;

    // move player
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
