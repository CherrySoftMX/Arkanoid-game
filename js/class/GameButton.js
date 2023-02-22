export class GameButton {

  constructor({ x, y, width, height, type }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.onClick = () => console.log(`Btn ${type} clicked`);
  }

  setOnClick(click) {
    this.onClick = click;
  }

  isClicked() {
    this.onClick();
  }

}