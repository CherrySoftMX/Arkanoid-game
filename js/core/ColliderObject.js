import { Collisionable } from './Collisionable.js';

export class ColliderObject extends Collisionable {
  constructor({ colliderType = 'RECT', ...rest }) {
    super({ ...rest });
    this.colliderType = colliderType;
    this.collisionObjects = [/* Collisionable */];
  }

  /**
   * Detects collisions with the collisions objects.
   * The developer is intended to call this method inside an
   * implementation of the update() method.
   * This method isn't called anywhere by default.
   */
  detectCollisions() {
    this.collisionObjects.forEach(obj => {
      if (obj.isActive() && obj.isCollisionable()) {
        const { x, y } = obj.getCoords();
        const { width, height } = obj.getData();

        let imColliding = false;
        if (this.colliderType === 'RECT') {
          imColliding = this.iAmCollidingRectToRect({ x, y, width, height });
        } else if (this.colliderType === 'CIRCLE') {
          imColliding = this.iAmCollidingCircleToRect({ x, y, width, height });
        }

        if (imColliding) {
          obj.onCollision({ type: this.type, ...this.getCompleteData() });
          this.onCollision({ ...obj, x, y });
          return;
        }
      }
    });
  }

  iAmCollidingCircleToRect({ x, y, width, height }) {
    const myX = this.pos.x;
    const myY = this.pos.y;

    const verticalDistance = Math.floor((y + (height / 2)) - myY);
    const fixedVerticalDistance = verticalDistance < 0 ? verticalDistance * (-1) : verticalDistance;
    const isVerticalCollision = fixedVerticalDistance < ((this.height / 2) + (height / 2));

    const isHorizontalCollision = myX + (this.width / 2) >= x && (myX - this.width / 2) <= (x + width);

    const isCollision = isVerticalCollision && isHorizontalCollision;
    return isCollision;
  }

  iAmCollidingRectToRect({ x, y, width, height }) {
    const myX = this.pos.x;
    const myY = this.pos.y;

    const verticalDistance = Math.floor((y + (height / 2)) - (myY + (this.height / 2)));
    const fixedVerticalDistance = verticalDistance < 0 ? verticalDistance * (-1) : verticalDistance;
    const isVerticalCollision = fixedVerticalDistance < ((this.height / 2) + (height / 2));

    const horizontalDistance = Math.floor(x + (width / 2) - (myX + (this.width / 2)));
    const fixedHorizontalDistance = horizontalDistance < 0 ? -horizontalDistance : horizontalDistance;
    const isHorizontalCollision = fixedHorizontalDistance < (this.width / 2) + (width / 2);

    const isCollision = isVerticalCollision && isHorizontalCollision;
    return isCollision;
  }

  addCollisionObject(obj) {
    this.collisionObjects.push(obj);
  }

  getCollisionObjects() {
    return this.collisionObjects;
  }
}