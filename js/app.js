const CANVAS = {
// Size in percentaje (1 = 100%)
  PREFERED_HEIGHT: 0.9,
  ASPECT_RATIO_H: 9,
  ASPECT_RATIO_V: 16,
};
let game;

/******************
 * P5.js control functions
 */
function setup() {
  game = new GameScreen(CANVAS);
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
  
    this.canvas.position(x, y);

    this.player = new Player(this.canvasWidth, this.canvasHeight, x, y);
    this.ball = new Ball(this.canvasWidth, this.canvasHeight, x, y, this.player);
  }

  draw() {
    background(0, 0, 0);

    fill(255);
  
    this.player.draw();
    this.ball.draw();
  
    this.handleKeyPressed();
    this.handleEndGame();
  }

  handleEndGame() {
    if (this.ball.isBelowScreen()) {
      push();
      textAlign(CENTER, CENTER);
      textSize(20);
      text('GAME OVER', this.canvasWidth / 2, this.canvasHeight / 2);
      pop();
    }
  }

  handleKeyPressed() {
    if (keyIsPressed) {
      this.player.controlInputs(keyCode);
    }
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

    this.x = 0;
    this.y = canvasHeight - this.height - 1;
    this.speed = 2;

    console.log('player x', this.x);
    console.log('player y', this.y);
  }

  draw() {
    fill(255);
    rect(this.x, this.y, this.width, this.height);
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
    
    this.speed = 2;

    this.playerReference = player;

    this.isOutOfField = false;

    const possibleAngles = [45, 135, 225, 315];
    this.angle = possibleAngles[getRandomNum(0, 5)];
  }

  draw() {
    fill(255);
    this.update();
    ellipse(this.x, this.y, this.width, this.height);
  }

  update() {
    text('Angle: ' + this.angle, 10, 10);
    if (this.isBelowScreen()) return;
    if (!this.shouldMove() || this.collisionDetected()) {
      this.angle += 90;
      if (this.angle > 360) {
        this.angle = 45;
      }
    }
    if (this.angle === 45) {
      this.x = this.x + this.speed;
      this.y = this.y + this.speed;
    } else if (this.angle === 135) {
      this.x = this.x - this.speed;
      this.y = this.y + this.speed;
    } else if (this.angle === 225) {
      this.x = this.x - this.speed;
      this.y = this.y - this.speed;
    } else {
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

  collisionDetected() {
    // crappy collision detection
    const playerRef = this.playerReference.getCoords();
    const verticalDistance = Math.floor(playerRef.y - this.y - (this.height / 2));
    text('V distance: ' + verticalDistance, 10, 25);
    const isAbovePlayer = (this.x + this.width / 2) >= playerRef.x && (this.x - this.width / 2) <= playerRef.x + this.playerReference.getWidth();
    text('is above: ' + isAbovePlayer, 10, 40);
    const isCollision = verticalDistance < 1 && isAbovePlayer;
    return isCollision;
  }

  setPlayerReference(player) {
    this.playerReference = player;
  }

}
