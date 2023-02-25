import { CONSTANTS } from '../constants/constants.js';
import { calculateCoordsToCenterItem } from '../utils/utils.js';

export class Player {
  
  constructor({ p5, gameAreaWidth, gameAreaX, gameAreaY }) {
    this.p5 = p5;

    this.width = Math.ceil(gameAreaWidth * 0.2);
    // Alrededor de 20px para 1920 * 1080
    this.height = gameAreaWidth * CONSTANTS.PLAYER_HEIGHT;

    this.container = {
      width: gameAreaWidth,
      height: gameAreaWidth,
      x: gameAreaX,
      y: gameAreaY,
    };

    const { x } = calculateCoordsToCenterItem({
      windowWidth: gameAreaWidth,
      windowHeight: gameAreaWidth,
      objectHeight: this.height,
      objectWidth: this.width,
      relativeToX: gameAreaX,
      relativeToY: gameAreaY,
    });

    this.x = x;
    this.y = gameAreaY + gameAreaWidth - this.height - 10;
    this.speed = (gameAreaWidth * CONSTANTS.PLAYER_SPEED) / CONSTANTS.GAME_AREA_HEIGHT_REFERENCE;

    this.isDestroyed = false;

    this.type = 'Player';

    this.pos = p5.createVector(this.x, this.y);
    this.vel = p5.createVector(0, 0);

    // -1 -> Izquierda
    // 0 -> Quieto
    // 1 -> Derecha
    this.movementDirection = 0;

    this.isCollisionActive = true;

    this.sprite = this.p5.loadImage('img/player0.png');

    this.animPosXIncrements = this.width / 50;
    this.animPosx = 0;
    this.currentPosXAnim = this.pos.x;
  }

  draw() {
    this.p5.push();
    this.pos.add(this.vel);
    this.p5.fill(255);
    this.p5.noSmooth();

    this.p5.image(this.sprite, this.pos.x, this.pos.y, this.width, this.height);
    
    this.drawPlayerAnimation();
    this.p5.pop();
  }

  drawPlayerAnimation() {
    // Animacion del jugador
    const animWidth = Math.ceil(this.height * 0.2);
    const animHeight = animWidth * 1.3;
    const animPosY = Math.floor(this.pos.y + this.height * 0.4);

    this.p5.fill(50, 180, 221);
    this.p5.noStroke();
    this.p5.rect(this.currentPosXAnim, animPosY, animWidth, animHeight);
    this.animPosx += this.animPosXIncrements;
  
    this.currentPosXAnim = this.pos.x + this.animPosx;
    if (this.currentPosXAnim + animWidth > this.pos.x + this.width) {
      this.animPosXIncrements *= -1;
    } else if ((this.currentPosXAnim + this.animPosXIncrements) < this.pos.x) {
      this.animPosXIncrements *= -1;
    }
  }

  controlInputs(input) {
    if (input === this.p5.RIGHT_ARROW && this.shouldMoveToRight()) {
      this.moveToRight();
    } else if (input === this.p5.LEFT_ARROW && this.shouldMoveToLeft()) {
      this.moveToLeft();
    }
    const prevVel = this.vel.copy();
    this.pos.sub(prevVel);
  }

  keyReleased() {
    this.vel.set(0, 0);
    this.movementDirection = 0;
  }

  moveToRight() {
    const prevVel = this.vel.copy();
    this.vel.set(this.speed, 0);
    this.movementDirection = 1;
  }

  moveToLeft() {
    const prevVel = this.vel.copy();
    this.vel.set(-this.speed, 0);
    this.movementDirection = -1;
  }

  shouldMoveToLeft() {
    const isInsideScreen = (this.pos.x - this.speed) >= this.container.x;
    return isInsideScreen; 
  }

  shouldMoveToRight() {
    const isInsideScreen = this.pos.x + this.speed <= this.container.width - this.width + this.container.x;
    return isInsideScreen;
  }

  onCollision({ type = 'Unknown' }) {
    console.log(`Player collided with ${type}`);
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

  getCompleteData() {
    return {
      ...this.getCoords(),
      ...this.getData(),
      movementDirection: this.movementDirection,
    };
  }

  getWidth() {
    return this.width;
  }

  increaseSpeed(increase) {
    this.speed += increase;
  }

  disableCollisions() {
    this.isCollisionActive = false;
  }

  isCollisionable() {
    return this.isCollisionActive;
  }

}
