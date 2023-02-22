import { CONSTANTS, BLOCK_TYPES, CANVAS_SETTINGS, BUTTON_TYPES } from '../constants/constants.js';
import { LEVELS } from '../constants/levels.js';
import { calculateCoordsToCenterItem } from '../utils/utils.js';
import { ScoreManager } from './ScoreManager.js';
import { Block } from './Block.js';
import { Player } from './Player.js';
import { Ball } from './Ball.js';
import { Collisionable } from './Collisionable.js';
import { PowerUp } from './PowerUp.js';
import { TEXT_LABELS } from '../constants/strings.js';
import { ScreenLayoutManager } from './ScreenLayoutManager.js';

export class GameScreen {
  
  constructor(options, p5) {
    this.p5 = p5;

    this.layoutManager = new ScreenLayoutManager();
    this.layoutManager.calculateLayout();

    // Simular que se presionan las flechas del teclado cuando
    // se presionan los botones en pantalla
    this.layoutManager.getButtons().forEach(btn => {
      const simulatedInput = btn.type === BUTTON_TYPES.LEFT ? this.p5.LEFT_ARROW : this.p5.RIGHT_ARROW;
      btn.setOnClick(() => this.handleKeyPressed(simulatedInput));
      btn.setOnClickRelease(() => this.handleKeyReleased());
    });

    this.canvasHeight = this.layoutManager.getWindowHeight();
    this.canvasWidth = this.layoutManager.getWindowWidth();

    this.gameAreaData = this.layoutManager.getGameScreenData();

    // La coordenada (y) a partir de la cual empieza el area de juego
    this.CANVAS_GAME_AREA_Y = Math.floor(this.canvasHeight * options.SCORE_DISPLAY_HEIGHT);
    this.CANVAS_GAME_AREA_X = this.gameAreaData.x;
    this.CANVAS_GAME_AREA_WIDTH = this.gameAreaData.width;
    this.CANVAS_GAME_AREA_END_X = this.gameAreaData.x + this.gameAreaData.width;
    this.CANVAS_GAME_AREA_END_Y = this.gameAreaData.y + this.gameAreaData.width;
    this.SCORE_AREA_HEIGHT = this.CANVAS_GAME_AREA_Y;

    this.canvas = p5.createCanvas(this.canvasWidth, this.canvasHeight);

    this.canvasX = 0;
    this.canvasY = 0;
  
    this.canvas.position(this.canvasX, this.canvasY);

    this.currentLevel = CONSTANTS.INITIAL_LEVEL;

    this.scoreManager = new ScoreManager(this.canvasWidth, this.canvasHeight, this.SCORE_AREA_HEIGHT, p5);

    // Generate game objects
    const {
      blocks,
      player,
      ball,
    } = this.loadLevel({ levels: LEVELS, levelNum: this.currentLevel });

    this.blocks = blocks;
    this.player = player;
    this.balls = [ball];

    this.isLoadingNextLevel = false;
    this.lives = CONSTANTS.PLAYER_INITIAL_LIVES;
    this.isOnMenu = true;
    this.isLevelStarted = false;

    this.powerUps = [];

    this.playBtn = null;
    this.generateMenu();
  }

  draw() {
    if (this.isOnMenu) {
      this.drawMenu();
    } else {
      this.drawGameplay();
    }
  }

  drawMenu() {
    this.p5.push();
    this.p5.background(0, 0, 0);
    this.p5.fill(254, 254, 254);
    this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
    this.p5.textSize(this.canvasWidth * 0.07);
    //this.p5.text(TEXT_LABELS.GAME_TITLE, this.canvasWidth / 2, this.CANVAS_GAME_AREA_Y * 4);
    this.p5.pop();
  }

  drawGameplay() {
    this.p5.background(0, 0, 0);
    this.p5.fill(255);
  
    this.player.draw();
    this.balls.forEach(ball => ball.draw());
    this.powerUps.forEach(p => p.draw());
    
    this.drawBlocks();
    this.scoreManager.draw();
    this.handleMultipleBalls();
    this.handlePowerUps();
    this.drawButtons();
    this.drawHelpMessage();
  
    this.handleEndGame();
  }

  drawButtons() {
    this.p5.push();
    this.p5.fill(60, 60, 60);
    this.layoutManager.getButtons().forEach(btn => {
      this.p5.rect(btn.x, btn.y, btn.width, btn.height);
    });
    this.p5.pop();
  }

  drawHelpMessage() {
    if (this.isLevelStarted) return;
    this.displayCenteredText({
      message: TEXT_LABELS.START_LEVEL_HELP,
    });
  }

  generateMenu() {
    const btnWidth = this.canvasWidth * CANVAS_SETTINGS.BTN_WIDTH;
    const btnHeight = (btnWidth * CANVAS_SETTINGS.BTN_ASPECT_RATIO_V) / CANVAS_SETTINGS.BTN_ASPECT_RATIO_H;
  
    const { x, y } = calculateCoordsToCenterItem({
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      objectHeight: btnHeight,
      objectWidth: btnWidth,
    });

    this.playBtn = this.p5.createButton(TEXT_LABELS.PLAY_BTN);
    this.playBtn.position(x, y + btnHeight);
    this.playBtn.size(btnWidth, btnHeight);
    this.playBtn.mouseClicked(this.onBtnPlayClick.bind(this));
  }

  onBtnPlayClick() {
    this.isOnMenu = false;
    this.playBtn.remove();
  }

  handleEndGame() {
    const numOfBalls = this.balls.length;
    if (numOfBalls === 0) {
      if (this.lives < 1) {
        this.displayCenteredText({ message: TEXT_LABELS.GAME_OVER });
        this.scoreManager.saveHighestScore(this.scoreManager.getScore());
        this.scoreManager.score = 0;
      } else {
        this.startNextLevelLoad({ resetCurrentLevel: true });
      }
      this.powerUps.forEach(p => p.destroy());
    } else if (this.isLevelCleared()) {
      this.balls.forEach(ball => ball.destroy());
      this.startNextLevelLoad({ resetCurrentLevel: false });
    }
  }

  handleKeyPressed(key) {
    const input = key ? key : this.p5.keyCode;
    if (this.p5.keyIsPressed || this.p5.mouseIsPressed) {
      this.player.controlInputs(input);

      // 32 -> Spacebar
      if (input === 32) {
        this.balls.forEach(ball => ball.handleKeyPressed(input));
        this.isLevelStarted = true;
      }
    }
  }

  handleKeyReleased() {
    this.player.keyReleased();
  }

  handleTouchStarted() {
    if (this.isOnMenu) return;
    const mouseX = this.p5.mouseX;
    const mouseY = this.p5.mouseY;

    this.layoutManager.getButtons().forEach(btn => btn.click({ mouseX, mouseY }));
    if (this.isLevelStarted) return;
    if (this.isClickOnGameArea({ mouseX, mouseY })) {
      this.balls.forEach(ball => ball.stopFollowPlayer());
      this.isLevelStarted = true;
    }
  }

  handleTouchReleased() {
    this.layoutManager.getButtons().forEach(btn => btn.clickReleased());
  }

  handleMultipleBalls() {
    this.balls = this.balls.filter(b => !b.isBelowScreen());
  }

  isClickOnGameArea({ mouseX, mouseY }) {
    const isClickOnGameAreaX = mouseX >= this.CANVAS_GAME_AREA_X && mouseX <= this.CANVAS_GAME_AREA_END_X;
    const isClickOnGameAreaY = mouseY >= this.CANVAS_GAME_AREA_Y && mouseY <= this.CANVAS_GAME_AREA_END_Y;
    return isClickOnGameAreaX && isClickOnGameAreaY;
  }

  displayCenteredText({
    message = 'Debug message',
    wrapStyle,
    boxWidth = this.CANVAS_GAME_AREA_WIDTH,
    boxHeight = this.CANVAS_GAME_AREA_WIDTH,
  }) {
    this.p5.push();
    if (wrapStyle) {
      this.p5.textWrap(wrapStyle);
    }
    this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
    this.p5.rectMode(this.p5.CORNERS);
    this.p5.textSize(20);
    this.p5.fill(255);
    this.p5.text(message, 0, 0, boxWidth, boxHeight);
    this.p5.pop();
  }

  isLevelCleared() {
    return this.blocks.filter(b => b.isActive()).length === 0;
  }

  startNextLevelLoad({ resetCurrentLevel = false }) {
    const isGameFinished = this.currentLevel >= LEVELS.length;
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

    // Avoid writing to local storage every frame after game finishes
    if (this.currentLevel >= LEVELS.length) {
      this.scoreManager.saveHighestScore(this.scoreManager.getScore());
    }

    // Load next level after 3.5 seconds
    setTimeout(() => {
      // Reset the game if player loses all lives
      if (this.lives < 1) {
        this.currentLevel = CONSTANTS.INITIAL_LEVEL;
        this.scoreManager.resetScore();
        this.lives = CONSTANTS.PLAYER_INITIAL_LIVES;
      }

      const {
        blocks,
        player,
        ball,
      } = this.loadLevel({
        levels: LEVELS,
        levelNum: this.currentLevel,
      });

      this.blocks = blocks;
      this.player = player;
      this.balls = [ball];

      if (!resetCurrentLevel) {
        this.increaseGameSpeed({
          player: this.player,
          ball: this.balls,
          pSpeed: CONSTANTS.PLAYER_SPEED_INCREASE,
          bSpeed: CONSTANTS.BALL_SPEED_INCREASE,
        });
      }

      this.isLoadingNextLevel = false;
      this.isLevelStarted = false;
    }, 3500);
  }

  /**
   * Funcion para generar los niveles
   * @param structure - Es un array de arrays donde '_' representa
   * un bloque y '*' representa un espacio vacio.
   * @beta
   */
  generateLevel({ structure, canvasWidth }) {
    const blocks = [];
    const blocksHeight = 30;
    const blocksMargin = 0;

    let levelRow = structure[0];
    let blockX = blocksMargin + this.CANVAS_GAME_AREA_X;
    const gameAreaWidth = this.gameAreaData.width;
    // Los bloques comienzan a dibujarse en el area de juego
    let blockY = blocksMargin + this.CANVAS_GAME_AREA_Y;
    for (let i = 0; i < structure.length; i++) {
      levelRow = structure[i];
      blockX = blocksMargin + this.CANVAS_GAME_AREA_X;
      // El ancho de los bloques puede variar de acuerdo al número
      // de bloques en la fila
      const blocksWidth = gameAreaWidth / levelRow.length;
      for (let j = 0; j < levelRow.length; j++) {
        const blockType = levelRow[j];
        const newBlock = new Block(
          blocksWidth,
          blocksHeight,
          blockX,
          blockY,
          BLOCK_TYPES[blockType].score,
          BLOCK_TYPES[blockType].durability,
          blockType,
          this.p5,
        );
        if (levelRow[j] === '*') {
          newBlock.destroy();
        }
        blocks.push(newBlock);
        blockX += blocksWidth + blocksMargin;
      }
      blockY += blocksHeight + blocksMargin;
    }
    console.log(blocks);
    return blocks;
  }

  loadLevel({ levels = [], levelNum = CONSTANTS.INITIAL_LEVEL }) {
    const blocks = this.generateLevel({
      structure: levels[levelNum],
      canvasWidth: this.canvasWidth,
    });

    const newPlayer = new Player(
      this.gameAreaData,
      this.canvasWidth,
      this.canvasHeight,
      this.canvasX,
      this.canvasY,
      this.p5,
    );

    const newBall = new Ball(
      this.gameAreaData,
      this.canvasWidth,
      this.canvasHeight,
      this.canvasX,
      this.canvasY,
      newPlayer,
      this.p5,
    );
    newBall.followPlayer(newPlayer);

    const {
      leftBorder,
      rightBorder,
      topBorder,
    } = this.generateScreenBorderCollisions();
    
    this.loadCollisions({
      player: newBall,
      colliders: [
        ...blocks,
        newPlayer,
        leftBorder,
        rightBorder,
        topBorder,
      ],
    });

    blocks.forEach(block => block.addObserver(this.scoreManager));
    blocks.forEach(block => {
      if (block.getBlockType() === CONSTANTS.POWER_UP_BLOCK) {
        block.addObserver(this);
      }
    });

    return {
      blocks,
      player: newPlayer,
      ball: newBall,
    };
  }

  loadCollisions({ player, colliders }) {
    colliders.forEach(coll => player.addCollisionObject(coll));
    return player;
  }

  generateScreenBorderCollisions() {
    /* Se crean objetos colisionables que delimitan
       los bordes de la pantalla para que la pelota
       no se salga de los limites.
       Tienen un tamaño de 10 pixeles para evitar
       problemas al calcular las colisiones */
    const leftBorder = new Collisionable({
      width: 10,
      height: this.canvasHeight,
      x: this.CANVAS_GAME_AREA_X - 10,
      y: 0,
      type: 'LeftBorder',
    });

    const rightBorder = new Collisionable({
      width: 10,
      height: this.canvasHeight,
      x: this.CANVAS_GAME_AREA_X + this.CANVAS_GAME_AREA_WIDTH,
      y: 0,
      type: 'RightBorder',
    });

    const topBorder = new Collisionable({
      width: this.canvasWidth,
      height: 10,
      x: 0,
      y: this.CANVAS_GAME_AREA_Y - 10,
      type: 'TopBorder',
    });

    return {
      leftBorder,
      rightBorder,
      topBorder,
    };
  }

  drawBlocks() {
    if (this.blocks.length > 0 && !this.isLevelCleared()) {
      this.p5.push();
      this.blocks.forEach(block => {
        block.draw(); 
       });
      this.p5.pop();
    }
  }

  increaseGameSpeed({ player, ball, pSpeed, bSpeed }) {
    player.increaseSpeed(pSpeed);
    ball.forEach(ball => ball.increaseSpeed(bSpeed));
  }

  // Observer
  update({ x, y, type = 'Unknown' }) {
    switch (type) {
      case 'Block':
        const p5 = this.p5;
        const canvasHeight = this.canvasHeight;
  
        const powerUp = new PowerUp({
          x,
          y,
          p5,
          canvasHeight,
          callback: this.powerUpMultipleBalls.bind(this, 2),
        });
  
        powerUp.addCollisionObject(this.player);
        powerUp.addObserver(this);
  
        this.powerUps.push(powerUp);
        break;
      case 'PowerUp':
        this.powerUps = this.powerUps.filter(p => p.isActive());
        break;
    }
  }

  handlePowerUps() {
    this.powerUps = this.powerUps.filter(p => !p.isBelowScreen());
  }

  /******************************************************
   *  POWER-UPS HANDLERS
   ******************************************************/
  powerUpMultipleBalls(num = 1) {
    for (let i = 0; i < num; i++) {
      const currentBall = this.balls[0];

      const newBall = new Ball(
        this.gameAreaData,
        this.canvasWidth,
        this.canvasHeight,
        this.canvasX,
        this.canvasY,
        this.player,
        this.p5,
      );
  
      const posCurrentBall = currentBall.getPositionVector();
      let speedCurrentBall = currentBall.getSpeedVector();
      speedCurrentBall.x *= -1;
      speedCurrentBall.y *= i % 2 === 0 ? -1 : 1;
  
      newBall.setPositionVector(posCurrentBall);
      newBall.setSpeedVector(speedCurrentBall);
  
      this.loadCollisions({
        player: newBall,
        colliders: [
          ...currentBall.getCollisionObjects()
        ],
      });
  
      this.balls.push(newBall);
    }
  }

}
