import { CONSTANTS, LAYOUT_TYPES, CANVAS_SETTINGS } from '../constants/constants.js';
import { ScoreManager } from './ScoreManager.js';
import { Collisionable } from './Collisionable.js';
import { TEXT_LABELS } from '../constants/strings.js';

/**
 * This class provides the methods needed to render and manage
 * the gameplay screen.
 * 
 * To implement your own game you must extend this class and implement
 * all its methods.
 */
export class GameArea {

  /**
   * Constructor for the game area.
   * 
   * @param {Object} obj.p5 - The p5 object.
   * @param {Float} obj.width - The width of the game area.
   * @param {Float} obj.x - The x coord of the game area.
   * @param {Float} obj.y - The y coord of the game area.
   * @param {Object} obj.layoutManager - The instance of @ScreenLayoutManager used to calculate the previous
   * parameters.
   */
  constructor({ p5, width, x, y, layoutManager }) {
    this.p5 = p5;
    // Always square
    this.width = width;
    this.height = width;
    this.x = x;
    this.y = y;
    this.layoutManager = layoutManager;

    // This var indicates the (y) coordinate where the gameplay will be rendered.
    this.CANVAS_GAME_AREA_Y_START = Math.floor(this.height * CANVAS_SETTINGS.SCORE_DISPLAY_HEIGHT);

    this.scoreManager = new ScoreManager({
      x,
      y,
      width,
      height: this.CANVAS_GAME_AREA_Y_START,
      p5: this.p5,
    });

    this.isLoadingNextLevel = false;
    this.lives = CONSTANTS.PLAYER_INITIAL_LIVES;
    this.isLevelStarted = false;
    this.currentLevel = CONSTANTS.INITIAL_LEVEL;
  }

  /**
   * Renders the game scene and handle game updates.
   */
  draw() {
    this.drawGameplay();
    this.scoreManager.draw();
    this.drawHelpMessage();
    this.onUpdate();
  }

  /**
   * Must be implemented.
   * In this method you need to include all the logic needed to
   * render the graphics of your game.
   */
  drawGameplay() { }

  /**
   * Should be implemented
   * In this method you should include all the non-graphical
   * logic of your game that will be executed every frame.
   */
  onUpdate() { }

  /**
   * Must be implemented.
   * This method will be called if this.lives < 1 in the startNextLevelLoad() method.
   * In this method you should include all the logic to handle what to do when
   * the player lives reaches 0.
   * 
   * @param {Int} obj.currentLevel - The current level number.
   * @param {Boolean} obj.resetCurrentLevel - Indicates if the current level should be restarted.
   */
  onGameOver({ currentLevel, resetCurrentLevel }) { }

  /**
   * Must be implemented.
   * This method will be called after onGameOver() in startNextLevelLoad().
   * In this method you should include all the logic to load the next level of
   * your game based on the provided parameters.
   * 
   * @param {Int} obj.currentLevel - If obj.resetCurrentLevel == true, then this stores the value
   * of the current level. Otherwise this stores the current level + 1.
   * @param {Boolean} obj.resetCurrentLevel - Indicates if the current level should be restarted.
   */
  onLoad({ currentLevel, resetCurrentLevel }) { }

  /**
   * Must be implemented.
   * This method will be called every time a key is pressed.
   * This method will also be called when the player presses the buttons on the sides
   * of the game area.
   * In this method you should include all the logic for handling player input.
   * 
   * @param {Int} input - The keycode of the pressed key. 
   */
  handleKeyPressed(input) { }

  /**
   * Must be implemented.
   * This method will be called every time a key is released.
   * This method will also be called every the player stops pressing
   * any of the buttons on the sides of the game area.
   * In this method you should include all the logic for handling player input key release.
   */
  handleKeyReleased() { }

  /**
   * Can optionally be implemented.
   * This method will be called every time the player clicks or touches the screen.
   * In this method you should include all the logic for handling clicks.
   * 
   * @param {Float} obj.mouseX - The x coord of the click.
   * @param {Float} obj.mouseY - The y coord of the click. 
   */
  handleTouchStarted({ mouseX, mouseY }) { }

  /**
   * Can optionally be implemented.
   * This method will be called every time the player releases the mouse button or
   * stops touching the screen.
   */
  handleTouchReleased() { }

  /**
   * Displays a message by default when this.isLevelStarted is false.
   * You can override this method if you would like a different behavior.
   * @returns void.
   */
  drawHelpMessage() {
    if (this.isLevelStarted) return;
    this.displayCenteredText({ message: TEXT_LABELS.START_LEVEL_HELP });
  }

  /**
   * This helper method allows to verify if the mouse is positioned
   * in the game area.
   * @returns True if the mouse is in the game area, false otherwise.
   */
  isClickOnGameArea() {
    const mouseX = this.p5.mouseX;
    const mouseY = this.p5.mouseY;
    const isClickOnGameAreaX = mouseX >= this.x && mouseX <= this.x + this.width;
    const isClickOnGameAreaY = mouseY >= this.y && mouseY <= this.y + this.height;
    return isClickOnGameAreaX && isClickOnGameAreaY;
  }

  /**
   * This method is intented to be used by the developer and isn't used by default.
   * By default, displays messages on the screen according to the parameters.
   * Default messages are different and displayed in the following scenarios:
   * - If the game is finished -> Game cleared.
   * - If the next level is loading and isn't resetting -> Stage (n) cleared!.
   * - If the next level is loading and is resetting -> Lives left: (m).
   * 
   * This method calls onGameOver() if the lives are less than 1 and calls onLoad() after onGameOver().
   * 
   * @param {Boolean} resetCurrentLevel - If you want to reset the current level.
   * @param {Boolean} isGameFinished - A flag indicating if the game is finished.
   * @param {Float} loadTimeOut - The time in miliseconds the method waits before calling onGameOver() and onLoad().
   * @returns void.
   */
  startNextLevelLoad({
    resetCurrentLevel = false,
    isGameFinished = false,
    loadTimeout = 3500,
  }) {
    if (isGameFinished) {
      this.displayCenteredText({ message: TEXT_LABELS.GAME_CLEARED });
      return;
    }
    if (this.isLoadingNextLevel && !resetCurrentLevel) {
      this.displayCenteredText({ message: TEXT_LABELS.STAGE_CLEAR(this.currentLevel) });
      return;
    } else if (this.isLoadingNextLevel && resetCurrentLevel) {
      this.displayCenteredText({ message: TEXT_LABELS.LIVE_LOST(this.lives) });
      return;
    }
    if (!isGameFinished && !resetCurrentLevel) {
      this.currentLevel += 1;
    } else if (resetCurrentLevel) {
      this.lives = this.lives > 1 ? this.lives - 1 : 0;
    }

    this.isLoadingNextLevel = true;

    if (isGameFinished) {
      this.scoreManager.saveHighestScore(this.scoreManager.getScore());
    }

    setTimeout(() => {
      if (this.lives < 1) {
        this.onGameOver({
          currentLevel: this.currentLevel,
          resetCurrentLevel,
        });
      }

      this.onLoad({
        currentLevel: this.currentLevel,
        resetCurrentLevel,
      });

      this.isLoadingNextLevel = false;
      this.isLevelStarted = false;
    }, loadTimeout);
  }

  /**
   * Generates collision objects for the game area borders,
   * This method is meant to be used by the developer and isn't used
   * by default.
   * @returns An object with the collision objects of the borders of the screen.
   */
  generateScreenBorderCollisions() {
    const leftBorder = new Collisionable({
      width: 10,
      height: this.height,
      x: this.x - 10,
      y: this.y,
      type: 'LeftBorder',
      p5: this.p5,
    });

    const rightBorder = new Collisionable({
      width: 10,
      height: this.height,
      x: this.x + this.width,
      y: this.y,
      type: 'RightBorder',
      p5: this.p5,
    });

    const topBorder = new Collisionable({
      width: this.width,
      height: 10,
      x: this.x,
      y: this.CANVAS_GAME_AREA_Y_START - 10,
      type: 'TopBorder',
      p5: this.p5,
    });

    return {
      leftBorder,
      rightBorder,
      topBorder,
    };
  }

  /**
   * Displays text on the center of the game area.
   * 
   * @param {String} obj.message - The text to be displayed.
   * @param {String} obj.wrapStyle - The wrap style (p5.WORD, p5.CHAR).
   * @param {Float} obj.boxWidth - The width of the text wrapper.
   * @param {Float} obj.boxHeight - The height of the text wrapper.
   */
  displayCenteredText({
    message = 'Debug message',
    wrapStyle,
    boxWidth = this.width,
    boxHeight = this.height,
  }) {
    this.p5.push();
    if (wrapStyle) {
      this.p5.textWrap(wrapStyle);
    }
    this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
    this.p5.rectMode(this.p5.CORNERS);
    this.p5.textSize(20);
    this.p5.fill(255);
    if (this.layoutManager.getCurrentLayoutType === LAYOUT_TYPES.VERTICAL) {
      this.p5.text(message, 0, 0, boxWidth, boxHeight);
    } else {
      this.p5.text(message, this.x, 0, boxWidth, boxHeight);
    }
    this.p5.pop();
  }

}