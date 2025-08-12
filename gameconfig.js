// Game Configuration - All speeds in proper physics units
export const GameConfig = {
  // Player speeds (pixels per second)
  PLAYER_SPEED: 400,        // Was 6 * 60 = 360, increased for snappier movement
  PLAYER_JUMP_POWER: 900,   // Was 15 * 60 = 900, jump velocity
  GRAVITY: 2400,            // Was 0.4 * 60 = 24, increased for better feel
  
  // Enemy speeds (pixels per second)
  ENEMY_PATROL_SPEED: 120,     // Was 1.0 * 60 = 60
  ENEMY_HELICOPTER_SPEED: 150,  // Helicopter movement speed
  
  // Spawn intervals (seconds, not frames!)
  ENEMY_SPAWN_INTERVAL: {
    INITIAL: 1.3,   // Was 80 frames @ 60fps = 1.33 seconds
    MEDIUM: 0.8,    // Was 50 frames @ 60fps = 0.83 seconds
    FAST: 0.5       // Was 30 frames @ 60fps = 0.5 seconds
  },
  
  // Global speed multiplier - adjust this to make entire game faster/slower
  GAME_SPEED: 1.5   // 1.5x for 50% faster gameplay!
};