export class PlayerPistol {
  constructor({ player }) {
    this.player = player;
    this.observers = [];

    this.interval = setInterval(() => {
      this.notifyAll();
    }, 800);
  }

  draw() {
    this.player.draw();
    this.drawCanyon();
  }

  drawCanyon() {
    const { x, width, y, height } = this.player.getCompleteData();
    const playerXCenter = width / 2 + x;
    const canyonWidth = width * 0.2;
    const canyonHeight = height;

    this.player.p5.fill(255);
    /*this.player.p5.rect(
      playerXCenter - canyonWidth / 2,
      y - height,
      canyonWidth,
      canyonHeight,
    );*/
    this.player.p5.rect(
      playerXCenter - width / 4 - canyonWidth / 2,
      y- height,
      canyonWidth,
      canyonHeight,
    );
    this.player.p5.rect(
      playerXCenter + width / 4 - canyonWidth / 2,
      y- height,
      canyonWidth,
      canyonHeight,
    );
  }

  finish() {
    clearInterval(this.interval);
  }

  controlInputs(input) {
    this.player.controlInputs(input);
  }

  keyReleased() {
    this.player.keyReleased();
  }

  addCollisionObject(obj) {
    this.player.addCollisionObject(obj);
  }

  addObserver(obj) {
    this.observers.push(obj);
  }

  notifyAll() {
    const { x, width, y, height } = this.player.getCompleteData();
    const playerXCenter = width / 2 + x;

    this.observers.forEach(obj => obj.update({
      type: 'PlayerPistol',
      x: playerXCenter,
      y: y - height,
      width,
      height,
    }));
  }

  getPlayer() {
    return this.player;
  }
}
