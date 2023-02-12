export const CANVAS_SETTINGS = {
  // Tamaño en porcentaje (1 = 100%)
  PREFERED_HEIGHT: 0.9,
  SCORE_DISPLAY_HEIGHT: 0.07,
  ASPECT_RATIO_H: 11,
  ASPECT_RATIO_V: 16,
  BTN_WIDTH: 0.3,
  BTN_ASPECT_RATIO_V: 6,
  BTN_ASPECT_RATIO_H: 16,
};

export const CONSTANTS = {
  PLAYER_SPEED: 4,
  BALL_SPEED: 4,
  INITIAL_LEVEL: 0,
  PLAYER_SPEED_INCREASE: 0.25,
  BALL_SPEED_INCREASE: 0.2,
  POWER_UP_BLOCK: '?',
  PLAYER_INITIAL_LIVES: 3,
  POWER_UP_FALL_SPEED: 3,
};

// Durabilidad negativa significa indestructible
export const BLOCK_TYPES = {
  '*': {
    durability: 0,
    color: '#000',
    score: 0,
  },
  '_': {
    durability: 1,
    color: '#FF5531',
    score: 100,
  },
  '-': {
    durability: 2,
    color: '#6B31FF',
    score: 80,
  },
  '#': {
    durability: -1,
    color: '#928E9B',
    score: 0,
  },
  '?': { // Power Up block
    durability: 1,
    color: '#FF5531',
    score: 150,
  },
};
