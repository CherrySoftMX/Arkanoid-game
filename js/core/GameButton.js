import { BUTTON_TYPES } from '../constants/constants.js';
import { calculateCoordsToCenterItem } from '../utils/utils.js';
import { Drawable } from './Drawable.js';

export class GameButton extends Drawable {

  constructor({ x, y, width, height, type, p5 }) {
    super({ x, y, width, height, p5 });
    this.type = type;
    this.imClicked = false;
    this.onClick = () => console.log(`Btn ${type} clicked`);
    this.onClickRelease = () => console.log('Click released');

    this.shorterAxis = width < height ? width : height;
    this.spriteSize = this.shorterAxis * 0.9;
    
    this.sprite = this.p5.loadImage('img/btn1.png');
    this.spritePressed = this.p5.loadImage('img/btn2.png');
    this.currentSprite = this.sprite;

    this.currentBackgroundColor = '#3C3C3C';

    this.spriteX = width / 2;
    this.spriteY = height / 2;
  }

  draw() {
    this.p5.push();

    this.p5.noSmooth();
    this.p5.fill(this.imClicked ? '#323232' : '#3C3C3C');

    this.p5.translate(this.pos.x, this.pos.y);
    this.p5.rect(0, 0, this.width, this.height);

    this.p5.translate(this.spriteX, this.spriteY);
    this.p5.imageMode(this.p5.CENTER);
    this.p5.scale(
      this.type === BUTTON_TYPES.RIGHT ? -1 : 1,
      1
    );
    this.p5.image(
      this.imClicked ? this.spritePressed : this.sprite,
      0,
      0,
      this.spriteSize,
      this.spriteSize,
    );
    this.p5.pop();
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