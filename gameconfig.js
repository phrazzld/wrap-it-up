// Game Configuration - All speeds in proper physics units
export const GameConfig = {
  // Player speeds (pixels per second)
  PLAYER_SPEED: 450,        // Increased from 400 for snappier movement
  PLAYER_JUMP_POWER: 1000,  // Optimized for better jump feel
  GRAVITY: 2400,            // Was 0.4 * 60 = 24, increased for better feel
  
  // Enemy speeds (pixels per second)
  ENEMY_PATROL_SPEED: 120,     // Was 1.0 * 60 = 60
  ENEMY_HELICOPTER_SPEED: 150,  // Helicopter movement speed
  
  // Spawn intervals (seconds, not frames!)
  ENEMY_SPAWN_INTERVAL: {
    INITIAL: 1.0,   // Reduced by ~20% from 1.3 for higher enemy density
    MEDIUM: 0.65,   // Reduced by ~20% from 0.8 for more challenge
    FAST: 0.4       // Reduced by 20% from 0.5 for intense gameplay
  },
  
  // Global speed multiplier - adjust this to make entire game faster/slower
  GAME_SPEED: 1.5,   // 1.5x for 50% faster gameplay - action-packed feel
  
  // Stomp bounce mechanics (percentages of PLAYER_JUMP_POWER)
  STOMP_BOUNCE_BASE: 0.8,          // 80% of jump power for basic stomp
  STOMP_BOUNCE_BOOSTED: 1.0,       // 100% when holding jump button
  STOMP_VELOCITY_BONUS: 0.2,       // Add 20% of downward velocity to bounce
  STOMP_COMBO_BONUS: 0.1,          // +10% per consecutive stomp
  STOMP_COMBO_MAX: 0.3,            // Cap combo bonus at +30%
  STOMP_COMBO_TIMEOUT: 0.5,        // Seconds before combo resets
  
  // Enemy-specific bounce modifiers
  ENEMY_BOUNCE_MODIFIERS: {
    patrol: 1.0,                   // Standard ground enemies
    helicopter: 1.2,               // Helicopters are bouncier!
  },
  
  // Damage/hurt bounce (when hit from side)
  HURT_BOUNCE_POWER: 0.5,          // 50% of jump power when damaged
  HURT_KNOCKBACK: 400               // Horizontal knockback speed (px/s)
};