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
  GAME_SPEED: 1.5   // 1.5x for 50% faster gameplay - action-packed feel
};