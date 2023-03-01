export class Drawable {
  constructor({ x, y, width, height, p5 }) {
    this.p5 = p5;
    this.pos = p5.createVector(x, y);
    this.width = width;
    this.height = height;
  }

  /**
   * Should be implemented.
   * Here you should implement all the code needed to render
   * the object.
   */
  draw() { }

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

}