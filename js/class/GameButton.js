export class GameButton {

  constructor({ x, y, width, height, type }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.imClicked = false;
    this.onClick = () => console.log(`Btn ${type} clicked`);
    this.onClickRelease = () => console.log('Click released');
  }

  setOnClick(click) {
    this.onClick = click;
  }

  setOnClickRelease(clickRelease) {
    this.onClickRelease = clickRelease;
  }

  click({ mouseX, mouseY }) {
    if (!this.imBeingClicked({ mouseX, mouseY })) return;
    console.log(`${this.type} clicked`);
    this.imClicked = true;
    this.onClick();
  }

  clickReleased() {
    if (this.imClicked) {
      console.log(`${this.type} released`);
      this.onClickRelease();
      this.imClicked = false;
    }
  }

  imBeingClicked({ mouseX, mouseY }) {
    const isMouseInsideHorizontally = mouseX >= this.x && mouseX <= this.x + this.width;
    const isMouseInsideVertically = mouseY >= this.y && mouseY <= this.y + this.height;
    return isMouseInsideHorizontally && isMouseInsideVertically;
  }

}