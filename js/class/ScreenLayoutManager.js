import { BUTTON_TYPES, LAYOUT_TYPES } from '../constants/constants.js';
import { GameButton } from './GameButton.js';

export class ScreenLayoutManager {

  constructor({ p5 }) {
    this.layout = LAYOUT_TYPES.HORIZONTAL;
    this.gameScreenData = {
      width: 0,
      x: 0,
      y: 0,
    };
    this.layoutData = {
      screen: this.gameScreenData,
      buttons: [],
    };
  }

  calculateLayout() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const { width, layout } = this.getWindowLargerAxis();
    this.layout = layout;
    this.gameScreenData = { ...this.gameScreenData, width };

    if (this.layout === LAYOUT_TYPES.SQUARE) {
      // Todo
    }

    if (this.layout === LAYOUT_TYPES.VERTICAL) {
      const btnY = this.gameScreenData.width;
      const btnHeight = windowHeight - this.gameScreenData.width;
      const btnWidth = this.gameScreenData.width / 2;

      const btnLeft = new GameButton({
        x: 0,
        y: btnY,
        width: btnWidth,
        height: btnHeight,
        type: BUTTON_TYPES.LEFT,
      });

      const btnRight = new GameButton({
        x: btnWidth,
        y: btnY,
        width: btnWidth,
        height: btnHeight,
        type: BUTTON_TYPES.RIGHT,
      });

      this.layoutData = {
        ...this.layoutData,
        buttons: [btnLeft, btnRight],
      };
    } else if (this.layout === LAYOUT_TYPES.HORIZONTAL) {
      const btnWidth = (windowWidth - this.gameScreenData.width) / 2;
      const btnHeight = this.gameScreenData.width;

      const btnLeft = new GameButton({
        x: 0,
        y: 0,
        width: btnWidth,
        height: btnHeight,
        type: BUTTON_TYPES.LEFT,
      });

      const btnRightX = this.gameScreenData.width + btnWidth;
      const btnRight = new GameButton({
        x: btnRightX,
        y: 0,
        width: btnWidth,
        height: btnHeight,
        type: BUTTON_TYPES.RIGHT,
      });

      const gameScreenNewX = btnWidth;
      this.gameScreenData = {...this.gameScreenData, x: gameScreenNewX};
      
      this.layoutData = {
        ...this.layoutData,
        buttons: [btnLeft, btnRight],
      };
    }

    return this.layoutData;
  }

  getWindowLargerAxis() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    let response = { width: 0, layout: '' };

    if (windowWidth < windowHeight) {
      response = { 
        width: windowWidth,
        layout: LAYOUT_TYPES.VERTICAL,
      };
    } else if (windowHeight < windowWidth) {
      response = {
        width: windowHeight,
        layout: LAYOUT_TYPES.HORIZONTAL,
      };
    } else {
      response = {
        width: windowWidth,
        layout: LAYOUT_TYPES.SQUARE,
      };
    }

    return response;
  }

  getButtons() {
    return this.layoutData.buttons;
  }

  getScreen() {
    return this.layoutData.screen;
  }

  getCurrentLayoutType() {
    return this.layout;
  }

}
