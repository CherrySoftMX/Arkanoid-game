const CANVAS_SETTINGS = {
// Size in percentaje (1 = 100%)
  PREFERED_HEIGHT: 0.9,
  ASPECT_RATIO_H: 9,
  ASPECT_RATIO_V: 16,
  NUM_BLOCKS_H: 5,
  NUM_BLOCKS_V: 5,
};

const CONSTANTS = {
  PLAYER_SPEED: 3,
  BALL_SPEED: 4,
  INITIAL_LEVEL: 0,
};

const LEVELS = [
  [
    ['_', '_', '_', '_', '_'],
    ['_', '_', '_', '_', '_'],
    ['_', '_', '_', '_', '_'],
    ['_', '_', '_', '_', '_'],
    ['_', '_', '_', '_', '_'],
  ],
  [
    ['*', '_', '_', '_', '*'],
    ['_', '_', '*', '_', '_'],
    ['_', '*', '_', '*', '_'],
    ['_', '_', '*', '_', '_'],
    ['*', '_', '_', '_', '*'],
    ['_', '*', '_', '*', '_'],
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

    /*
    this.player = new Player(this.canvasWidth, this.canvasHeight, x, y);
    this.ball = new Ball(this.canvasWidth, this.canvasHeight, x, y, this.player);
  
    this.blocks = this.generateLevel({
      structure: LEVELS[this.currentLevel],
      canvasWidth: this.canvasWidth,
    });

    // Colisiones de la bola
    this.ball.addCollisionObject(this.player);
    this.blocks.forEach(block => this.ball.addCollisionObject(block));

    // Bordes de la pantalla
    const leftBorder = new Collisionable({
      width: 10,
      height: this.canvasHeight,
      x: -10,
      y: 0,
    });

    const rightBorder = new Collisionable({
      width: 50,
      height: this.canvasHeight,
      x: this.canvasWidth,
      y: 0,
    });

    const topBorder = new Collisionable({
      width: this.canvasWidth,
      height: 10,
      x: 0,
      y: -10
    });

    this.ball.addCollisionObject(leftBorder);
    this.ball.addCollisionObject(rightBorder);
    this.ball.addCollisionObject(topBorder);*/

    const {
      blocks,
      player,
      ball,
    } = this.loadLevel({ levels: LEVELS, levelNum: this.currentLevel });

    this.blocks = blocks;
    this.player = player;
    this.ball = ball;
  }

  draw() {
    background(0, 0, 0);

    fill(255);
  
    this.player.draw();
    this.ball.draw();
    this.drawBlocks();
  
    this.handleKeyPressed();
    this.handleEndGame();
  }

  handleEndGame() {
    if (this.ball.isBelowScreen()) {
      push();
      textAlign(CENTER, CENTER);
      textSize(20);
      fill(255);
      text('GAME OVER', this.canvasWidth / 2, this.canvasHeight / 2);
      pop();
    } else if (this.blocks.filter(b => b.isActive()).length === 0) {
      push();
      this.ball.destroy();
      textAlign(CENTER, CENTER);
      textSize(20);
      fill(255);
      text('YOU WIN!', this.canvasWidth / 2, this.canvasHeight / 2);
      pop();
    }
  }

  handleKeyPressed() {
    if (keyIsPressed) {
      this.player.controlInputs(keyCode);
    }
  }

  generateBlocks({ options, canvasWidth }) {
    const blocks = [];
    const numOfBlocksHorizontal = options.NUM_BLOCKS_H;
    const numOfBlocksVertical = options.NUM_BLOCKS_V;
    const blocksMargin = 0;
    const blocksWidth = canvasWidth / numOfBlocksHorizontal;
    const blocksHeight = 30;

    let blockX = blocksMargin;
    let blockY = blocksMargin;
    for (let i = 0; i < numOfBlocksVertical; i++) {
      blockX = blocksMargin;
      for (let j = 0; j < numOfBlocksHorizontal; j++) {
        blocks.push(
          new Block(blocksWidth, blocksHeight, blockX, blockY),
        );
        blockX += blocksWidth + blocksMargin;
      }
      blockY += blocksHeight + blocksMargin;
    }
    return blocks;
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
    let blockY = blocksMargin;
    console.log(structure.length);
    for (let i = 0; i < structure.length; i++) {
      levelRow = structure[i];
      blockX = blocksMargin;
      const blocksWidth = canvasWidth / levelRow.length;
      for (let j = 0; j < levelRow.length; j++) {
        const newBlock = new Block(blocksWidth, blocksHeight, blockX, blockY);
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
      this.canvasX, this.canvasY,
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
    // Bordes de la pantalla
    const leftBorder = new Collisionable({
      width: 10,
      height: this.canvasHeight,
      x: -10,
      y: 0,
    });

    const rightBorder = new Collisionable({
      width: 50,
      height: this.canvasHeight,
      x: this.canvasWidth,
      y: 0,
    });

    const topBorder = new Collisionable({
      width: this.canvasWidth,
      height: 10,
      x: 0,
      y: -10
    });

    return {
      leftBorder,
      rightBorder,
      topBorder,
    };
  }

  drawBlocks() {
    this.blocks.forEach(block => {
     block.draw(); 
    });
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

  constructor(width, height, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;

    this.isDestroyed = false;
  }

  draw() {
    if (this.isDestroyed) return;
    fill(255, 85, 49);
    strokeWeight(1);
    rect(this.x, this.y, this.width, this.height);
  }

  onCollision() {
    this.destroy();
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