const CANVAS_SETTINGS = {
// Tamaño en porcentaje (1 = 100%)
  PREFERED_HEIGHT: 0.9,
  SCORE_DISPLAY_HEIGHT: 0.07,
  ASPECT_RATIO_H: 11,
  ASPECT_RATIO_V: 16,
  BTN_WIDTH: 0.3,
  BTN_ASPECT_RATIO_V: 6,
  BTN_ASPECT_RATIO_H: 16,
};

const CONSTANTS = {
  PLAYER_SPEED: 4,
  BALL_SPEED: 4,
  INITIAL_LEVEL: 2,
  PLAYER_SPEED_INCREASE: 0.25,
  BALL_SPEED_INCREASE: 0.8,
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
    ['-', '*', '_', '*', '-'],
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

function keyReleased() {
  game.handleKeyReleased();
}

function keyPressed() {
  game.handleKeyPressed();
}
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
    this.isOnMenu = true;

    this.playBtn = null;
    this.generateMenu();
  }

  draw() {
    if (this.isOnMenu) {
      this.drawMenu();
    } else {
      this.drawGameplay();
    }
  }

  drawMenu() {
    push();
    background(0, 0, 0);
    fill(254, 254, 254);
    textAlign(CENTER, CENTER);
    textSize(this.canvasWidth * 0.07);
    text('ARKANOID ATTEMPT', this.canvasWidth / 2, this.CANVAS_GAME_AREA_Y * 4);
    pop();
  }

  drawGameplay() {
    background(0, 0, 0);
    fill(255);
  
    this.player.draw();
    this.ball.draw();
    this.drawBlocks();
    this.scoreManager.draw();
  
    //this.handleKeyPressed();
    this.handleEndGame();
  }

  generateMenu() {
    const btnWidth = this.canvasWidth * CANVAS_SETTINGS.BTN_WIDTH;
    const btnHeight = (btnWidth * CANVAS_SETTINGS.BTN_ASPECT_RATIO_V) / CANVAS_SETTINGS.BTN_ASPECT_RATIO_H;
  
    const { x, y } = calculateCoordsToCenterItem({
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      objectHeight: btnHeight,
      objectWidth: btnWidth,
    });

    this.playBtn = createButton('Play');
    this.playBtn.position(x, y + btnHeight);
    this.playBtn.size(btnWidth, btnHeight);
    this.playBtn.mouseClicked(this.onBtnPlayClick.bind(this));
  }

  onBtnPlayClick() {
    this.isOnMenu = false;
    this.playBtn.remove();
  }

  handleEndGame() {
    if (this.ball.isBelowScreen()) {
      this.displayCenteredText('GAME OVER');
      this.scoreManager.saveHighestScore(this.scoreManager.getScore());
      this.scoreManager.score = 0;
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

  handleKeyReleased() {
    this.player.keyReleased();
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

    // Se repite el if del inicio para evitar escribir a local storage
    // docenas de veces
    if (this.currentLevel >= LEVELS.length) {
      this.scoreManager.saveHighestScore(this.scoreManager.getScore());
    }

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

      this.increaseGameSpeed({
        player: this.player,
        ball: this.ball,
        pSpeed: CONSTANTS.PLAYER_SPEED_INCREASE,
        bSpeed: CONSTANTS.BALL_SPEED_INCREASE,
      });

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
      type: 'LeftBorder',
    });

    const rightBorder = new Collisionable({
      width: 10,
      height: this.canvasHeight,
      x: this.canvasWidth,
      y: 0,
      type: 'RightBorder',
    });

    const topBorder = new Collisionable({
      width: this.canvasWidth,
      height: 10,
      x: 0,
      y: -10 + this.CANVAS_GAME_AREA_Y,
      type: 'TopBorder',
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

  increaseGameSpeed({ player, ball, pSpeed, bSpeed }) {
    player.increaseSpeed(pSpeed);
    ball.increaseSpeed(bSpeed);
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
    this.highestScore = this.getHighestScore();
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
    textAlign(LEFT, CENTER);
    text(
      'Score: ' + this.formatNumber(this.getScore(), 5),
      20,
      this.scoreAreaHeight / 2,
    );
    text(
      'Highest Score: ' + this.formatNumber(this.highestScore, 5),
      (this.canvasWidth / 2) + 20,
      this.scoreAreaHeight / 2,
    );
  }

  update({ scoreValue }) {
    this.addToScore(scoreValue);
  }

  saveHighestScore(score) {
    const current_highest_score = this.getHighestScore();
    if (score <= current_highest_score) return;
    localStorage.setItem('highest_score', score);
  }

  getHighestScore() {
    const item = localStorage.getItem('highest_score');
    if (item) {
      return parseInt(item);
    }
    return 0;
  }

  formatNumber(num, spaces = 5) {
    return String(num).padStart(spaces, '0');
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

    this.type = 'Player';

    this.pos = createVector(this.x, this.y);
    this.vel = createVector(0, 0);
  }

  draw() {
    this.pos.add(this.vel);
    fill(255);
    rect(this.pos.x, this.pos.y, this.width, this.height, this.height * 0.3);
  }

  controlInputs(input) {
    if (input === RIGHT_ARROW && this.shouldMoveToRight()) {
      this.moveToRight();
    } else if (input === LEFT_ARROW && this.shouldMoveToLeft()) {
      this.moveToLeft();
    }
    const prevVel = this.vel.copy();
    this.pos.sub(prevVel);
  }

  keyReleased() {
    this.vel.set(0, 0);
  }

  moveToRight() {
    const prevVel = this.vel.copy();
    this.vel.set(this.speed, 0);
  }

  moveToLeft() {
    const prevVel = this.vel.copy();
    this.vel.set(-this.speed, 0);
  }

  shouldMoveToLeft() {
    const isInsideScreen = (this.pos.x - this.speed) >= 0;
    return isInsideScreen; 
  }

  shouldMoveToRight() {
    const isInsideScreen = this.pos.x + this.speed <= this.container.width - this.width;
    return isInsideScreen;
  }

  onCollision() {
    console.log('Player collided with something');
  }

  isActive() {
    return !this.isDestroyed;
  }

  getX() {
    return this.pos.x;
  }

  getY() {
    return this.pos.y;
  }

  getCoords() {
    return {
      x: this.pos.x,
      y: this.pos.y,
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

  increaseSpeed(increase) {
    this.speed += increase;
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
    
    this.speed = CONSTANTS.BALL_SPEED;

    this.playerReference = player;

    this.isOutOfField = false;

    const possibleAngles = [45, 135, 225, 315];
    const randomNum = getRandomNum(0, 4);
    this.angle = possibleAngles[randomNum];

    this.isDestroyed = false;

    this.collisionObjects = [];

    this.pos = createVector(x, y);
    this.vel = createVector(this.speed, -this.speed);
  }

  draw() {
    fill(255);
    this.update();
    ellipse(this.pos.x, this.pos.y, this.width, this.height);
  }

  update() {
    if (this.isBelowScreen()) return;
    if (!this.isActive()) return;
    this.pos.add(this.vel);
    this.detectCollisions();
  }

  shouldMoveToLeft() {
    const isInsideScreen = (this.pos.x - this.speed) >= 0;
    return isInsideScreen; 
  }

  shouldMoveToRight() {
    const isInsideScreen = this.pos.x + this.speed <= this.container.width - (this.width / 2);
    return isInsideScreen;
  }

  shouldMoveToTop() {
    const isInsideScreen = this.pos.y - this.speed >= 0;
    return isInsideScreen;
  }

  shouldMoveToBottom() {
    const isInsideScreen = this.pos.y + this.speed <= (this.container.height - (this.height / 2));
    return isInsideScreen;
  }

  shouldMove() {
    return this.shouldMoveToLeft() && this.shouldMoveToRight() && this.shouldMoveToTop();
  }

  isBelowScreen() {
    this.isOutOfField = this.pos.y - this.height >= this.container.height;
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
          this.onCollision({ ...obj, x, y });
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
    const myX = this.pos.x;
    const myY = this.pos.y;

    const verticalDistance = Math.floor((y + (height / 2)) - myY );
    // Valor absoluto de la distancia vertical
    const fixedVerticalDistance = verticalDistance < 0 ? verticalDistance * (-1) : verticalDistance;
    const isVerticalCollision = fixedVerticalDistance < ((this.height / 2) + (height / 2));
    const isHorizontalCollision = myX + (this.width / 2) >= x && (myX - this.width / 2) <= (x + width);

    const isCollision = isVerticalCollision && isHorizontalCollision;
    return isCollision;
  }

  onCollision({ type, x, y, width, height }) {
    const prevVel = this.vel.copy();

    switch (type) {
      case 'Block':
        this.handleBlockCollision({x, y, width, height});
        break;
      case 'TopBorder':
        this.vel.y *= -1;
        break;
      case 'LeftBorder':
        this.vel.x *= -1;
        break;
      case 'RightBorder':
        this.vel.x *= -1;
        break;
      case 'Player':

        const relativeX = map(this.pos.x, x, x + width, 0, 40);
        let newXDirection = 0;
        if (relativeX < 10) {
          newXDirection = -1;
        } else if (relativeX < 20) {
          newXDirection = -0.5;
        } else if (relativeX < 30) {
          newXDirection = 0.5;
        } else {
          newXDirection = 1;
        }
        this.vel.set(newXDirection * this.speed, -this.speed);
        break;
    }

    this.pos.sub(prevVel);
  }

  handleBlockCollision({ x, y, width, height }) {
    const isLeftSideHit = this.iAmColliding({ x, y, width: 1, height });
    const isRightSideHit = this.iAmColliding({ x: x + width, y, width: 1, height });
    const isTopSideHit = this.iAmColliding({ x, y, width, height: 1 });
    const isBottomSideHit = this.iAmColliding({ x, y: y + height, width, height: 1 });

    if (isLeftSideHit || isRightSideHit) {
      this.vel.x *= -1;
      if (isBottomSideHit || isTopSideHit) {
        this.vel.y *= -1;
      }
    } else if (isBottomSideHit || isTopSideHit) {
      this.vel.y *= -1;
      if (isLeftSideHit || isRightSideHit) {
        this.vel.x *= -1;
      }
    }
  }

  setPlayerReference(player) {
    this.playerReference = player;
  }

  addCollisionObject(obj) {
    this.collisionObjects.push(obj);
  }

  increaseSpeed(increase) {
    this.speed += increase;
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

    this.type = 'Block';
  }

  draw() {
    if (this.isDestroyed) return;
    fill(BLOCK_TYPES[this.blockType].color);
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

  getType() {
    return this.type;
  }

}

/**
 * Generic class for collisionable
 */
class Collisionable {
  constructor({ width, height, x, y, type = 'Generic' }) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;

    this.isDestroyed = false;
    this.type = type;
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

  getType() {
    return this.type;
  }
}