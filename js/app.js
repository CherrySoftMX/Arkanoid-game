'use strict';
import { GameScreen } from './core/GameScreen.js'
import { CANVAS_SETTINGS } from './constants/constants.js';
import { inputManager } from './core/KeyInputManager.js';

let game;

new p5((p) => {

  p.setup = () => {
    game = new GameScreen(CANVAS_SETTINGS, p);
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
