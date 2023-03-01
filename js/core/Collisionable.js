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
   * @param {Float} obj.x - The x coord of the collided object.
   * @param {Float} obj.y - The y coord of the collided object.
   * @param {Float} obj.width - The width of the collided object.
   * @param {Float} obj.height - The height of the collided object.
   * @param {String} obj.type - The type of the collided object. 
   */
  onCollision({ x, y, width, height, type = 'Unknown' }) {
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
