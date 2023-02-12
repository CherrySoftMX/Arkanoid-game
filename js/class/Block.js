import { BLOCK_TYPES } from '../constants/constants.js';

export class Block {

  constructor(width, height, x, y, score = 100, durability = 1, blockType = '_', p5) {
    this.p5 = p5;

    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.scoreValue = score;

    this.isDestroyed = false;

    this.observers = [];

    this.durability = durability;
    this.blockType = blockType;

    this.type = 'Block';

    this.isTransitioning = false;
  }

  draw() {
    if (this.isDestroyed) return;
    if (!this.isTransitioning) {
      this.p5.fill(BLOCK_TYPES[this.blockType].color);
    } else {
      this.p5.fill('#FEFEFE');
    }
    this.p5.strokeWeight(1);
    this.p5.rect(this.x, this.y, this.width, this.height);
  }

  onCollision() {
    if (this.isTransitioning) return;

    this.durability -= 1;
    this.isTransitioning = true;

    this.notifyAll();

    // Change block color for 30 milliseconds to provide visual feedback
    setTimeout(() => {
      this.isTransitioning = false;
      if (this.durability === 0) {
        this.destroy();
      }
    }, 30);
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

  getCompleteData() {
    const { x, y } = this.getCoords();
    const { width, height } = this.getData();
    const scoreValue = this.scoreValue;
    return { x, y, width, height, scoreValue, type: this.type };
  }

  addObserver(obj) {
    this.observers.push(obj);
  }

  notifyAll() {
    const blockData = this.getCompleteData();
    this.observers.forEach(obj => obj.update(blockData));
  }

  getType() {
    return this.type;
  }

  getBlockType() {
    return this.blockType;
  }

}
