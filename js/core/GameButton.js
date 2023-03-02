import { Drawable } from './Drawable.js';

export class GameButton extends Drawable {

  constructor({ x, y, width, height, type, p5 }) {
    super({ x, y, width, height, p5 });
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
    const { x, y, width, height } = this.getCompleteData();
    const isMouseInsideHorizontally = mouseX >= x && mouseX <= x + width;
    const isMouseInsideVertically = mouseY >= y && mouseY <= y + height;
    return isMouseInsideHorizontally && isMouseInsideVertically;
  }

}