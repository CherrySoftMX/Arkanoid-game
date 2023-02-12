import { Collisionable } from './Collisionable.js';

// ToDo: Extract common methods between classes
export class PowerUp extends Collisionable {

  constructor({
    width = 50,
    height = 35,
    x,
    y,
    p5,
    type = 'PowerUp',
    canvasHeight,
   }) {
    super({ width, height, x, y, type });
    this.speed = 3;

    this.pos = p5.createVector(x, y);
    this.vel = p5.createVector(0, this.speed);

    this.type = type;

    this.isOutOfField = false;

    this.collisionObjects = [];
    this.observers = [];

    this.p5 = p5;

    this.container = {
      height: canvasHeight,
    };
  }

  draw() {
    this.update();
    this.p5.fill(255);
    this.p5.rect(this.pos.x, this.pos.y, this.width, this.height);
    this.p5.fill(0);
    this.p5.text(this.type, this.pos.x + 10, this.pos.y + 10);
  }

  update() {
    if (this.isBelowScreen()) return;
    this.pos.add(this.vel);
  }

  detectCollisions() {
    this.collisionObjects.forEach(obj => {
      if (obj.isActive()) {
        const { x, y } = obj.getCoords();
        const { width, height } = obj.getData();
        if (this.iAmColliding({ x, y, width, height })) {
          obj.onCollision({ type: this.type });
          this.onCollision({ ...obj, x, y });
          this.notifyAll();
          return;
        }
      }
    });
  }

  iAmColliding({ x, y, width, height }) {
    const myX = this.pos.x;
    const myY = this.pos.y;

    const verticalDistance = Math.floor((y + (height / 2)) - myY );
    const fixedVerticalDistance = verticalDistance < 0 ? verticalDistance * (-1) : verticalDistance;
    const isVerticalCollision = fixedVerticalDistance < ((this.height / 2) + (height / 2));
    const isHorizontalCollision = myX + (this.width / 2) >= x && (myX - this.width / 2) <= (x + width);

    const isCollision = isVerticalCollision && isHorizontalCollision;
    return isCollision;
  }

  addCollisionObject(obj) {
    this.collisionObjects.push(obj);
  }

  notifyAll() {
    this.observers.forEach(obj => obj.update({ type: this.type }));
  }

  isBelowScreen() {
    this.isOutOfField = this.pos.y >= this.container.height;
    return this.isOutOfField;
  }

}
