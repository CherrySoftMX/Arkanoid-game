import { Drawable } from './Drawable';

export class Collisionable extends Drawable {
  constructor({ type = 'Generic', ...rest }) {
    super({ ...rest });

    this.isDestroyed = false;
    this.type = type;

    this.isCollisionActive = true;
  }

  /**
   * Must be implemented.
   * Here you must add the logic to handle what should happen on collision.
   * 
   * @param {String} obj.type - The type of the collided object. 
   */
  onCollision({ type = 'Unknown' }) {
    //console.log(`${this.type} collided with ${type}`);
  }

  isActive() {
    return !this.isDestroyed;
  }

  getType() {
    return this.type;
  }

  destroy() {
    this.isDestroyed = true;
  }

  isActive() {
    return !this.isDestroyed;
  }

  disableCollisions() {
    this.isCollisionActive = false;
  }

  isCollisionable() {
    return this.isCollisionActive;
  }

}
