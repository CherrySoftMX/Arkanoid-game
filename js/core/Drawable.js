export class Drawable {
  constructor({ x, y, width, height, p5 }) {
    this.p5 = p5;
    this.pos = p5.createVector(x, y);
    this.width = width;
    this.height = height;

    this.screenLayoutManager = null;
    this.isOutOfField = false;
  }

  /**
   * Should be implemented.
   * Here you should implement all the code needed to render
   * the object.
   */
  draw() { }

  /**
   * Should be implemented.
   * Here you can put all the code you need to handle updates.
   */
  update() { }

  getX() {
    return this.pos.x;
  }

  getY() {
    return this.pos.y;
  }

  getCoords() {
    return {
      x: this.pos.x,
      y: this.pos.y,
    };
  }

  getData() {
    return {
      width: this.width,
      height: this.height,
    };
  }

  getCompleteData() {
    return {
      ...this.getCoords(),
      ...this.getData(),
    };
  }

  setPositionVector(vector) {
    this.pos = vector;
  }

  getPositionVector() {
    return this.pos.copy();
  }

  setScreenLayoutManager(obj) {
    this.screenLayoutManager = obj;
  }

  isBelowScreen() {
    const screenData = this.screenLayoutManager.getGameScreenData();
    this.isOutOfField = this.pos.y - this.height >= screenData.y + screenData.width;
    return this.isOutOfField;
  }

}