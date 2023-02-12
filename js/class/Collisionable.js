export class Collisionable {
  constructor({ width, height, x, y, type = 'Generic' }) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;

    this.isDestroyed = false;
    this.type = type;
  }

  onCollision({ type = 'Unknown' }) {
    console.log(`${this.type} collided with ${type}`);
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
