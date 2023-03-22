'use strict';
import { GameScreen } from './GameScreen.js'
import { CANVAS_SETTINGS } from '../constants/constants.js';
import { inputManager } from './KeyInputManager.js';

let game;

const startEngine = (GameArea) => {
  return new p5((p) => {

    p.setup = () => {
      game = new GameScreen(CANVAS_SETTINGS, GameArea, p);
    };

    p.draw = () => {
      game.draw();
    };

    p.keyReleased = () => {
      inputManager.onKeyReleased({ keyCode: p.keyCode });
      game.handleKeyReleased();
    };

    p.keyPressed = () => {
      inputManager.onKeyPressed({ keyCode: p.keyCode });
      game.handleKeyPressed();
    };

    p.touchStarted = () => {
      game.handleTouchStarted();
    };

    p.touchEnded = () => {
      game.handleTouchReleased();
    };

    p.windowResized = () => {
      game.handleResize();
    };

  });
};

export { startEngine };
