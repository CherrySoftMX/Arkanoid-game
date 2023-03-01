import { BLOCK_TYPES } from '../constants/constants.js';
import { Collisionable } from '../core/Collisionable.js';

export class Block extends Collisionable {

  constructor({ score = 100, durability = 1, blockType = '_', ...rest }) {
    super({ ...rest });
    this.scoreValue = score;
    this.observers = [];
    this.durability = durability;
    this.blockType = blockType;
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
    this.p5.rect(this.pos.x, this.pos.y, this.width, this.height);
  }

  onCollision() {
    if (this.isTransitioning) return;

    this.durability -= 1;
    this.isTransitioning = true;
    this.notifyAll();

    if (this.durability === 0) {
      this.disableCollisions();
    }

    // Change block color for 30 milliseconds to provide visual feedback
    setTimeout(() => {
      this.isTransitioning = false;
      if (this.durability === 0) {
        this.destroy();
      }
    }, 30);
  }

  addObserver(obj) {
    this.observers.push(obj);
  }

  notifyAll() {
    const blockData = this.getCompleteData();
    this.observers.forEach(obj => obj.update({
      ...blockData,
      scoreValue: this.scoreValue,
      type: this.type,
    }));
  }

  getBlockType() {
    return this.blockType;
  }

}
