import { CONSTANTS } from '../constants/constants.js';
import { ColliderObject } from '../core/ColliderObject.js';

export class PowerUp extends ColliderObject {

  constructor({
    width = 50,
    height = 35,
    type = 'PowerUp',
    colliderType = 'RECT',
    callback = () => console.warn('Default PowerUp activated'),
    ...rest
   }) {
    super({ width, height, type, colliderType, ...rest });
    this.speed = CONSTANTS.POWER_UP_FALL_SPEED;
    this.vel = this.p5.createVector(0, this.speed);
    this.observers = [];
    this.callback = callback;
  }

  draw() {
    this.update();
    // #uW%xPE9
    if (this.p5.frameCount % 60 > 30) {
      this.p5.fill('#F7E99E');
    } else {
      this.p5.fill('#F4CE14');
    }
    this.p5.rect(this.pos.x, this.pos.y, this.width, this.height);

    this.p5.fill(4, 4, 4);
    this.p5.textSize(24);
    this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
    this.p5.text('?', this.pos.x + this.width / 2, this.pos.y + this.height / 2);
  }

  update() {
    if (this.isBelowScreen()) return;
    this.pos.add(this.vel);
    this.detectCollisions();
  }

  onCollision({ type = 'Unknown' }) {
    console.log(`${this.type} collided with ${type}`);

    if (type === 'Player') {
      this.destroy();
      this.callback();
      this.notifyAll();
    }
  }

  addObserver(obj) {
    this.observers.push(obj);
  }

  notifyAll() {
    this.observers.forEach(obj => obj.update({ type: this.type }));
  }

}
