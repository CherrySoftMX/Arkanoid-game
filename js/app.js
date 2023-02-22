'use strict';
import { GameScreen } from './class/GameScreen.js'
import { CANVAS_SETTINGS } from './constants/constants.js';

let game;

new p5((p) => {

  p.setup = () => {
    game = new GameScreen(CANVAS_SETTINGS, p);
  };

  p.draw = () => {
    game.draw();
  };

  p.keyReleased = () => {
    game.handleKeyReleased();
  };

  p.keyPressed = () => {
    game.handleKeyPressed();
  };

  p.touchStarted = () => {
    game.handleTouchStarted();
  };

  p.touchEnded = () => {
    game.handleTouchReleased();
  };

});
