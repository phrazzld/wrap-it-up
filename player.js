// == playerclass.js ==
import { GameConfig } from './gameconfig.js';

const jumpSound = new Audio('assets/audio/jump.mp3');
jumpSound.volume = 0.3;

export class playerclass {
  constructor() {
    this.x = 100;
    this.y = 0;
    this.w = 40;
    this.h = 60;
    this.vx = 0;
    this.vy = 0;
    this.speed = GameConfig.PLAYER_SPEED;
    this.direction = 1;
    this.animframe = 0;
    this.animtimer = 0;
    this.health = 3;
    this.onground = false;
    this.isJumping = false;
    this.stompCombo = 0;
    this.stompTimer = 0;
  }

  reset() {
    this.x = 100;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.health = 3;
    this.onground = false;
    this.isJumping = false;
    this.stompCombo = 0;
    this.stompTimer = 0;
  }

  update(keys, deltaTime) {
    // Update combo timer
    if (this.stompTimer > 0) {
      this.stompTimer -= deltaTime;
      if (this.stompTimer <= 0) {
        this.stompCombo = 0;  // Reset combo when timer expires
      }
    }
    
    // Reset combo if we land on ground
    if (this.onground && this.stompCombo > 0) {
      this.stompCombo = 0;
      this.stompTimer = 0;
    }
    
    // horizontal
    if (keys.left) {
      this.vx = -this.speed;
      this.direction = -1;
    } else if (keys.right) {
      this.vx = this.speed;
      this.direction = 1;
    } else {
      this.vx = 0;
    }

    // jump start
    if (keys.up && this.onground) {
      this.vy = -GameConfig.PLAYER_JUMP_POWER;
      this.onground = false;
      this.isJumping = true;
      jumpSound.currentTime = 0;
      jumpSound.play();
    }

    // release jump early => short hop
    if (!keys.up && this.isJumping && this.vy < 0) {
      this.vy *= 0.5;
      this.isJumping = false;
    }

    // apply gravity
    this.vy += GameConfig.GRAVITY * deltaTime * GameConfig.GAME_SPEED;

    // move
    this.x += this.vx * deltaTime * GameConfig.GAME_SPEED;
    this.y += this.vy * deltaTime * GameConfig.GAME_SPEED;

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
  
  bounceFromStomp(holdingJump, enemyType = 'patrol') {
    // Calculate base bounce power
    let bouncePower = GameConfig.PLAYER_JUMP_POWER * 
      (holdingJump ? GameConfig.STOMP_BOUNCE_BOOSTED : GameConfig.STOMP_BOUNCE_BASE);
    
    // Add velocity bonus for high-speed stomps
    if (this.vy > 0) {
      bouncePower += this.vy * GameConfig.STOMP_VELOCITY_BONUS;
    }
    
    // Apply combo multiplier (capped at max)
    const comboBonus = Math.min(this.stompCombo * GameConfig.STOMP_COMBO_BONUS, GameConfig.STOMP_COMBO_MAX);
    bouncePower *= (1 + comboBonus);
    
    // Apply enemy type modifier
    const enemyModifier = GameConfig.ENEMY_BOUNCE_MODIFIERS[enemyType] || 1.0;
    bouncePower *= enemyModifier;
    
    // Apply the bounce
    this.vy = -bouncePower;
    
    // Update combo tracking
    this.stompCombo++;
    this.stompTimer = GameConfig.STOMP_COMBO_TIMEOUT;
    
    // Reset jump state so player can jump/stomp again
    this.isJumping = false;
    this.onground = false;
    
    // Play jump sound for feedback
    jumpSound.currentTime = 0;
    jumpSound.play();
  }
}
