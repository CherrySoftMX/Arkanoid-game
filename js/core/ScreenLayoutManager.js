import { BUTTON_TYPES, LAYOUT_TYPES } from '../constants/constants.js';
import { GameButton } from './GameButton.js';

export class ScreenLayoutManager {

  constructor() {
    this.layout = LAYOUT_TYPES.HORIZONTAL;
    this.gameScreenData = {
      width: 0,
      x: 0,
      y: 0,
    };
    this.layoutData = {
      gameScreen: this.gameScreenData,
      buttons: [],
      windowWidth: 0,
      windowHeight: 0,
    };
  }

  calculateLayout({ p5 }) {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    console.log(windowWidth);

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
        p5,
      });

      const btnRight = new GameButton({
        x: btnWidth,
        y: btnY,
        width: btnWidth,
        height: btnHeight,
        type: BUTTON_TYPES.RIGHT,
        p5,
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
        p5,
      });

      const btnRightX = this.gameScreenData.width + btnWidth;
      const btnRight = new GameButton({
        x: btnRightX,
        y: 0,
        width: btnWidth,
        height: btnHeight,
        type: BUTTON_TYPES.RIGHT,
        p5,
      });

      const gameScreenNewX = btnWidth;
      this.gameScreenData = {...this.gameScreenData, x: gameScreenNewX};
      
      this.layoutData = {
        ...this.layoutData,
        buttons: [btnLeft, btnRight],
      };
    }

    this.layoutData = {
      ...this.layoutData,
      gameScreen: this.gameScreenData,
      windowWidth,
      windowHeight,
    };
    console.log(this.layoutData);
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

  getGameScreenData() {
    return this.layoutData.gameScreen;
  }

  getCurrentLayoutType() {
    return this.layout;
  }

  getGameScreenWidth() {
    return this.layoutData.gameScreen.width;
  }

  getWindowWidth() {
    return this.layoutData.windowWidth;
  }

  getWindowHeight() {
    return this.layoutData.windowHeight;
  }

}
