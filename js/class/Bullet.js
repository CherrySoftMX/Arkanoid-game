import { ColliderObject } from '../core/ColliderObject.js';

export class Bullet extends ColliderObject {
  constructor ({ p5, type = 'Bullet', ...rest }) {
    super({ p5, type, ...rest });
    this.vel = this.p5.createVector(0, -9);
    this.observers = [];
  }

  draw() {
    if (this.isActive());
    this.pos.add(this.vel);
    this.detectCollisions();
    this.p5.fill(255);
    this.p5.ellipse(this.pos.x, this.pos.y, this.width, this.height);
  }

  onCollision({ type }) {
    console.log('Bullet collided');
    this.destroy();
    this.disableCollisions();
    this.notifyAll();
  }

  addObserver(obj) {
    this.observers.push(obj);
  }

  notifyAll() {
    this.observers.forEach(obj => obj.update({ type: this.type }));
  }

}
