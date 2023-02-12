const CANVAS_SETTINGS = {
// Tamaño en porcentaje (1 = 100%)
  PREFERED_HEIGHT: 0.9,
  SCORE_DISPLAY_HEIGHT: 0.07,
  ASPECT_RATIO_H: 10,
  ASPECT_RATIO_V: 16,
};

const CONSTANTS = {
  PLAYER_SPEED: 3,
  BALL_SPEED: 4,
  INITIAL_LEVEL: 0,
};

// Durabilidad negativa significa indestructible
const BLOCK_TYPES = {
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
};

const LEVELS = [
  [
    ['_', '_', '_', '_', '_'],
    ['_', '_', '_', '_', '_'],
    ['_', '_', '_', '_', '_'],
    //['_', '_', '_', '_', '_'],
    //['_', '_', '_', '_', '_'],
  ],
  [
    ['*', '_', '_', '_', '*'],
    ['_', '-', '*', '-', '_'],
    ['_', '*', '-', '*', '_'],
    ['_', '_', '*', '_', '_'],
    ['*', '_', '_', '_', '*'],
    ['-', '*', '-', '*', '-'],
  ],
  [
    ['-', '*', '#', '*', '-'],
    ['_', '-', '_', '-', '_'],
    ['#', '_', '_', '_', '#'],
    ['-', '_', '-', '_', '-'],
    ['_', '*', '#', '*', '_'],
  ],
];

let game;

/******************
 * P5.js control functions
 */
function setup() {
  game = new GameScreen(CANVAS_SETTINGS);
};

function draw() {
  game.draw();
};
/*
 * P5.js control functions
 ******************/

/**
 * Utilities
 */
const calculateCoordsToCenterItem = ({
  windowWidth,
  windowHeight,
  objectWidth,
  objectHeight,
}) => {
  const xCoord = (windowWidth - objectWidth) / 2;
  const yCoord = (windowHeight - objectHeight) / 2;
  return {
    x: xCoord,
    y: yCoord,
  };
};

const getRandomNum = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Game screen class
 */
class GameScreen {
  
  constructor(options) {
    this.canvasHeight = window.innerHeight * options.PREFERED_HEIGHT;
    this.canvasWidth = (this.canvasHeight * options.ASPECT_RATIO_H) / options.ASPECT_RATIO_V;
    // La coordenada (y) a partir de la cual empieza el area de juego
    this.CANVAS_GAME_AREA_Y = Math.floor(this.canvasHeight * CANVAS_SETTINGS.SCORE_DISPLAY_HEIGHT);
    this.SCORE_AREA_HEIGHT = this.CANVAS_GAME_AREA_Y;

    this.canvas = createCanvas(this.canvasWidth, this.canvasHeight);

    const { x, y } = calculateCoordsToCenterItem({
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      objectHeight: this.canvasHeight,
      objectWidth: this.canvasWidth,
    });

    this.canvasX = x;
    this.canvasY = y;
  
    this.canvas.position(x, y);

    this.currentLevel = CONSTANTS.INITIAL_LEVEL;

    this.scoreManager = new ScoreManager(this.canvasWidth, this.canvasHeight, this.SCORE_AREA_HEIGHT);

    // Generate game objects
    const {
      blocks,
      player,
      ball,
    } = this.loadLevel({ levels: LEVELS, levelNum: this.currentLevel });

    this.blocks = blocks;
    this.player = player;
    this.ball = ball;

    this.isLoadingNextLevel = false;
  }

  draw() {
    background(0, 0, 0);

    fill(255);
  
    this.player.draw();
    this.ball.draw();
    this.drawBlocks();
    this.scoreManager.draw();
  
    this.handleKeyPressed();
    this.handleEndGame();
  }

  handleEndGame() {
    if (this.ball.isBelowScreen()) {
      this.displayCenteredText('GAME OVER');
    } else if (this.isLevelCleared()) {
      this.ball.destroy();
      this.startNextLevelLoad();
    }
  }

  handleKeyPressed() {
    if (keyIsPressed) {
      this.player.controlInputs(keyCode);
    }
  }

  displayCenteredText(message = 'Debug message') {
    push();
    textAlign(CENTER, CENTER);
    textSize(20);
    fill(255);
    text(message, this.canvasWidth / 2, this.canvasHeight / 2);
    pop();
  }

  isLevelCleared() {
    return this.blocks.filter(b => b.isActive()).length === 0;
  }

  startNextLevelLoad() {
    const isGameFinished = this.currentLevel >= LEVELS.length;
    if (isGameFinished) {
      this.displayCenteredText('¡GAME CLEARED!');
      return;
    }
    if (this.isLoadingNextLevel) {
      // Los niveles empiezan en cero pero por presentación se muestra
      // que pasaste el nivel actual + 1.
      this.displayCenteredText(`LEVEL ${this.currentLevel} CLEARED!`);
      return;
    }
    if (!isGameFinished) {
      this.currentLevel += 1;
    }

    this.isLoadingNextLevel = true;

    // Cargar el nuevo nivel despues de 3.5 segundos
    setTimeout(() => {
      const {
        blocks,
        player,
        ball,
      } = this.loadLevel({
        levels: LEVELS,
        levelNum: this.currentLevel,
      });

      this.blocks = blocks;
      this.player = player;
      this.ball = ball;

      this.isLoadingNextLevel = false;
    }, 3500);
  }

  /**
   * Funcion para generar los niveles
   * @param structure - Es un array de arrays donde '_' representa
   * un bloque y '*' representa un espacio vacio.
   * @beta
   */
  generateLevel({ structure, canvasWidth }) {
    const blocks = [];
    const blocksHeight = 30;
    const blocksMargin = 0;

    let levelRow = structure[0];
    let blockX = blocksMargin;
    // Los bloques comienzan a dibujarse en el area de juego
    let blockY = blocksMargin + this.CANVAS_GAME_AREA_Y;
    for (let i = 0; i < structure.length; i++) {
      levelRow = structure[i];
      blockX = blocksMargin;
      // El ancho de los bloques puede variar de acuerdo al número
      // de bloques en la fila
      const blocksWidth = canvasWidth / levelRow.length;
      for (let j = 0; j < levelRow.length; j++) {
        const blockType = levelRow[j];
        const newBlock = new Block(
          blocksWidth,
          blocksHeight,
          blockX,
          blockY,
          BLOCK_TYPES[blockType].score,
          BLOCK_TYPES[blockType].durability,
          blockType,
        );
        if (levelRow[j] === '*') {
          newBlock.destroy();
        }
        blocks.push(newBlock);
        blockX += blocksWidth + blocksMargin;
      }
      blockY += blocksHeight + blocksMargin;
    }
    console.log(blocks);
    return blocks;
  }

  loadLevel({ levels = [], levelNum = CONSTANTS.INITIAL_LEVEL }) {
    const blocks = this.generateLevel({
      structure: levels[levelNum],
      canvasWidth: this.canvasWidth,
    });

    const newPlayer = new Player(
      this.canvasWidth,
      this.canvasHeight,
      this.canvasX,
      this.canvasY,
    );

    const newBall = new Ball(
      this.canvasWidth,
      this.canvasHeight,
      this.canvasX,
      this.canvasY,
      newPlayer,
    );

    const {
      leftBorder,
      rightBorder,
      topBorder,
    } = this.generateScreenBorderCollisions();
    
    this.loadCollisions({
      player: newBall,
      colliders: [
        ...blocks,
        newPlayer,
        leftBorder,
        rightBorder,
        topBorder,
      ],
    });

    blocks.forEach(block => block.addObserver(this.scoreManager));

    return {
      blocks,
      player: newPlayer,
      ball: newBall,
    };
  }

  loadCollisions({ player, colliders }) {
    colliders.forEach(coll => player.addCollisionObject(coll));
    return player;
  }

  generateScreenBorderCollisions() {
    /* Se crean objetos colisionables que delimitan
       los bordes de la pantalla para que la pelota
       no se salga de los limites.
       Tienen un tamaño de 10 pixeles para evitar
       problemas al calcular las colisiones */
    const leftBorder = new Collisionable({
      width: 10,
      height: this.canvasHeight,
      x: -10,
      y: 0,
    });

    const rightBorder = new Collisionable({
      width: 10,
      height: this.canvasHeight,
      x: this.canvasWidth,
      y: 0,
    });

    const topBorder = new Collisionable({
      width: this.canvasWidth,
      height: 10,
      x: 0,
      y: -10 + this.CANVAS_GAME_AREA_Y,
    });

    return {
      leftBorder,
      rightBorder,
      topBorder,
    };
  }

  drawBlocks() {
    if (this.blocks.length > 0 && !this.isLevelCleared()) {
      push();
      this.blocks.forEach(block => {
        block.draw(); 
       });
      pop();
    }
  }

}

/**
 * Score manager class
 */
class ScoreManager {
  constructor(canvasWidth, canvasHeight, scoreAreaHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.scoreAreaHeight = scoreAreaHeight;

    this.score = 0;
  }

  addToScore(num) {
    this.score += num;
  }

  getScore() {
    return this.score;
  }

  draw() {
    fill(94, 92, 92);
    rect(0, 0, this.canvasWidth, this.scoreAreaHeight);

    fill(255);
    textSize(12);
    textAlign(CENTER, CENTER);
    text('Score: ' + this.getScore(), this.canvasWidth / 2, this.scoreAreaHeight / 2);
  }

  update({ scoreValue }) {
    this.addToScore(scoreValue);
  }

}

/**
 * Player class
 */
class Player {
  
  constructor(canvasWidth, canvasHeight, canvasX, canvasY) {
    this.width = Math.ceil(canvasWidth * 0.2);
    this.height = 20;

    this.container = {
      width: canvasWidth,
      height: canvasHeight,
      x: canvasX,
      y: canvasY,
    };

    const { x } = calculateCoordsToCenterItem({
      windowWidth: canvasWidth,
      windowHeight: canvasHeight,
      objectHeight: this.height,
      objectWidth: this.width,
    });

    this.x = x;
    this.y = canvasHeight - this.height - 1;
    this.speed = CONSTANTS.PLAYER_SPEED;

    this.isDestroyed = false;
  }

  draw() {
    fill(255);
    rect(this.x, this.y, this.width, this.height, this.height * 0.3);
  }

  controlInputs(input) {
    if (input === RIGHT_ARROW && this.shouldMoveToRight()) {
      this.moveToRight();
    } else if (input === LEFT_ARROW && this.shouldMoveToLeft()) {
      this.moveToLeft();
    }
  }

  moveToRight() {
    this.x = this.x + this.speed;
  }

  moveToLeft() {
    this.x = this.x - this.speed;
  }

  shouldMoveToLeft() {
    const isInsideScreen = (this.x - this.speed) >= 0;
    return isInsideScreen; 
  }

  shouldMoveToRight() {
    const isInsideScreen = this.x + this.speed <= this.container.width - this.width;
    return isInsideScreen;
  }

  onCollision() {
    console.log('Player collided with something');
  }

  isActive() {
    return !this.isDestroyed;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getCoords() {
    return {
      x: this.getX(),
      y: this.getY(),
    };
  }

  getData() {
    return {
      width: this.width,
      height: this.height,
    };
  }

  getWidth() {
    return this.width;
  }

}

/**
 * Ball class
 */
class Ball {
  constructor(canvasWidth, canvasHeight, canvasX, canvasY, player) {
    this.width = 20;
    this.height = this.width;

    this.container = {
      width: canvasWidth,
      height: canvasHeight,
      x: canvasX,
      y: canvasY,
    };

    const { x, y } = calculateCoordsToCenterItem({
      windowWidth: canvasWidth,
      windowHeight: canvasHeight,
      objectWidth: this.width,
      objectHeight: this.height,
    });

    this.x = x;
    this.y = y;
    
    this.speed = CONSTANTS.BALL_SPEED;

    this.playerReference = player;

    this.isOutOfField = false;

    const possibleAngles = [45, 135, 225, 315];
    const randomNum = getRandomNum(0, 4);
    this.angle = possibleAngles[randomNum];

    this.collisionObjects = [];

    this.isDestroyed = false;
  }

  draw() {
    fill(255);
    this.update();
    ellipse(this.x, this.y, this.width, this.height);
  }

  update() {
    if (this.isBelowScreen()) return;
    if (!this.isActive()) return;
    this.detectCollisions();
    if (this.angle === 45) {
      this.x = this.x + this.speed;
      this.y = this.y + this.speed;
    } else if (this.angle === 135) {
      this.x = this.x - this.speed;
      this.y = this.y + this.speed;
    } else if (this.angle === 225) {
      this.x = this.x - this.speed;
      this.y = this.y - this.speed;
    } else if (this.angle === 315) {
      this.x = this.x + this.speed;
      this.y = this.y - this.speed;
    }
  }

  shouldMoveToLeft() {
    const isInsideScreen = (this.x - this.speed) >= 0;
    return isInsideScreen; 
  }

  shouldMoveToRight() {
    const isInsideScreen = this.x + this.speed <= this.container.width - (this.width / 2);
    return isInsideScreen;
  }

  shouldMoveToTop() {
    const isInsideScreen = this.y - this.speed >= 0;
    return isInsideScreen;
  }

  shouldMoveToBottom() {
    const isInsideScreen = this.y + this.speed <= (this.container.height - (this.height / 2));
    return isInsideScreen;
  }

  shouldMove() {
    return this.shouldMoveToLeft() && this.shouldMoveToRight() && this.shouldMoveToTop();
  }

  isBelowScreen() {
    this.isOutOfField = this.y - this.height >= this.container.height;
    return this.isOutOfField;
  }

  isActive() {
    return !this.isDestroyed;
  }

  destroy() {
    this.isDestroyed = true;
  }

  detectCollisions() {
    this.collisionObjects.forEach(obj => {
      if (obj.isActive()) {
        const { x, y } = obj.getCoords();
        const { width, height } = obj.getData();
        if (this.iAmColliding({ x, y, width, height })) {
          obj.onCollision();
          this.onCollision();
          return;
        }
      }
    });
  }

  /**
   * Calcula si el objeto actual (this) se encuentra colisionando con otro objeto.
   * 
   * Este sistema de colisiones simple funciona al calcular si las coordenadas de (this)
   * se encuentran dentro de las coordenadas del otro objeto.
   * 
   * El objeto a comprobar colision debe ser un rectangulo.
   *
   * @param x - La coordenada x del objeto a comprobar colision.
   * @param y - La coordenada y del objeto a comprobar colision.
   * @param width - El ancho del objeto a comprobar colision.
   * @param height - El ancho del objeto a comprobar colision.  
   * @returns - Un booleano que indica si el objeto (this) esta colisionando con el objeto de los parametros.
   */
  iAmColliding({ x, y, width, height }) {
    const verticalDistance = Math.floor((y + (height / 2)) - this.y );
    const fixedVerticalDistance = verticalDistance < 0 ? verticalDistance * (-1) : verticalDistance;
    const isVerticalCollision = fixedVerticalDistance < ((this.height / 2) + (height / 2));
    const isHorizontalCollision = this.x + (this.width / 2) >= x && (this.x - this.width / 2) <= (x + width);

    const isCollision = isVerticalCollision && isHorizontalCollision;
    return isCollision;
  }

  onCollision() {
    this.angle += 90;
    if (this.angle > 360) {
      this.angle = 45;
    }
  }

  setPlayerReference(player) {
    this.playerReference = player;
  }

  addCollisionObject(obj) {
    this.collisionObjects.push(obj);
  }

}

/**
 * Block class
 */
class Block {

  constructor(width, height, x, y, score = 100, durability = 1, blockType = '_') {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.scoreValue = score;

    this.isDestroyed = false;

    this.observers = [];

    this.durability = durability;
    this.blockType = blockType;
  }

  draw() {
    if (this.isDestroyed) return;
    fill(BLOCK_TYPES[this.blockType].color);
    //fill(94, 92, 92);
    //stroke(254, 254, 254);
    strokeWeight(1);
    rect(this.x, this.y, this.width, this.height);
  }

  onCollision() {
    this.durability -= 1;
    this.notifyAll();
    if (this.durability === 0) {
      this.destroy();
    }
  }

  destroy() {
    this.isDestroyed = true;
  }

  isActive() {
    return !this.isDestroyed;
  }

  getCoords() {
    return {
      x: this.x,
      y: this.y,
    };
  }

  getData() {
    return {
      width: this.width,
      height: this.height,
    };
  }

  getCompleteData() {
    const { x, y } = this.getCoords();
    const { width, height } = this.getData();
    const scoreValue = this.scoreValue;
    return { x, y, width, height, scoreValue };
  }

  addObserver(obj) {
    this.observers.push(obj);
  }

  notifyAll() {
    const blockData = this.getCompleteData();
    this.observers.forEach(obj => obj.update(blockData));
  }

}

/**
 * Generic class for collisionable
 */
class Collisionable {
  constructor({ width, height, x, y }) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;

    this.isDestroyed = false;
  }

  onCollision() {
    console.log('Collided');
  }

  isActive() {
    return !this.isDestroyed;
  }

  getCoords() {
    return {
      x: this.x,
      y: this.y,
    };
  }

  getData() {
    return {
      width: this.width,
      height: this.height,
    };
  }
}