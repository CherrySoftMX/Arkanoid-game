import { CONSTANTS } from '../constants/constants.js';
import { Collisionable } from '../core/Collisionable.js';
import { inputManager } from '../core/KeyInputManager.js';

export class Player extends Collisionable {

  constructor({ type = 'Player', ...rest }) {
    super({ type, ...rest });
    this.speed = 0;
    this.vel = this.p5.createVector(0, 0);

    // -1 -> Izquierda
    // 0 -> Quieto
    // 1 -> Derecha
    this.movementDirection = 0;

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

  configure() {
    const gameArea = this.screenLayoutManager.getGameScreenData();
    this.speed = (gameArea.width * CONSTANTS.PLAYER_SPEED) / CONSTANTS.GAME_AREA_HEIGHT_REFERENCE;
  }

  controlInputs(input) {
    console.log(inputManager.keys);
    let _input = input;

    // If the current pressed key isn't an arrow but an arrow is pressed.
    if (_input !== this.p5.LEFT_ARROW || _input !== this.p5.RIGHT_ARROW) {
      const arrowPressed = inputManager.getLastPressedKeyBetween({
        firstKey: this.p5.LEFT_ARROW,
        secondKey: this.p5.RIGHT_ARROW,
      });
      _input = arrowPressed ? arrowPressed : _input;
    }

    if (_input === this.p5.RIGHT_ARROW && this.shouldMoveToRight()) {
      this.moveToRight();
    } else if (_input === this.p5.LEFT_ARROW && this.shouldMoveToLeft()) {
      this.moveToLeft();
    }
  }

  keyReleased() {
    // If a key was released but other key is being pressed.
    if (inputManager.isAKeyPressed()) {
      const currentPressedKey = inputManager.getLastPressedKey();
      this.controlInputs(currentPressedKey);
      return;
    }
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
    const gameArea = this.screenLayoutManager.getGameScreenData();
    const isInsideScreen = (this.pos.x - this.speed) >= 0;
    return isInsideScreen; 
  }

  shouldMoveToRight() {
    const gameArea = this.screenLayoutManager.getGameScreenData();
    const isInsideScreen = this.pos.x + this.speed <= gameArea.width - this.width;
    return isInsideScreen;
  }

  onCollision({ type = 'Unknown' }) {
    console.log(`Player collided with ${type}`);
  }

  getCompleteData() {
    return {
      ...super.getCompleteData(),
      movementDirection: this.movementDirection,
    };
  }

  increaseSpeed(increase) {
    this.speed += increase;
  }

  getWidth() {
    return this.width;
  }

  setWidth(_width) {
    this.width = _width;
  }

}
