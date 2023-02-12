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

    // -1 -> Izquierda
    // 0 -> Quieto
    // 1 -> Derecha
    this.movementDirection = 0;
  }

  draw() {
    this.pos.add(this.vel);
    fill(255);
    rect(this.pos.x, this.pos.y, this.width, this.height, this.height * 0.3);

    text(this.pos.x, 10, 400);
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

}
