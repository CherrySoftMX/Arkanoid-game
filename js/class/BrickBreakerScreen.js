import { GameArea } from '../core/GameArea.js';
import { CONSTANTS, BLOCK_TYPES } from '../constants/constants.js';
import { LEVELS } from '../constants/levels.js';
import { TEXT_LABELS } from '../constants/strings.js';
import { Block } from './Block.js';
import { Player } from './Player.js';
import { Ball } from './Ball.js';
import { PowerUp } from './PowerUp.js';


export class BrickBreakerScreen extends GameArea {

  constructor({ p5, width, x, y, layoutManager }) {
    super({ p5, width, x, y, layoutManager });

    this.currentLevel = CONSTANTS.INITIAL_LEVEL;
    const {
      blocks,
      player,
      ball,
    } = this.loadLevel({ levels: LEVELS, levelNum: this.currentLevel });

    this.blocks = blocks;
    this.player = player;
    this.balls = [ball];
    this.powerUps = [];
  }

  drawGameplay() {
    this.p5.background(0, 0, 0);
    this.p5.fill(255);

    this.player.draw();
    this.balls.forEach(ball => ball.draw());
    this.powerUps.forEach(p => p.draw());
    this.drawBlocks();
  }

  onUpdate() {
    this.handleMultipleBalls();
    this.handlePowerUps();
    this.handleEndGame();
  }

  handleKeyPressed(input) {
    this.player.controlInputs(input);

    // 32 -> Spacebar
    if (input === 32) {
      this.balls.forEach(ball => ball.handleKeyPressed(input));
      this.isLevelStarted = true;
    }
  }

  handleKeyReleased() {
    this.player.keyReleased();
  }

  handleTouchStarted({ mouseX, mouseY }) {
    if (this.isLevelStarted) return;
    if (this.isClickOnGameArea({ mouseX, mouseY })) {
      this.balls.forEach(ball => ball.stopFollowPlayer());
      this.isLevelStarted = true;
    }
  }

  onGameOver({ currentLevel, resetCurrentLevel }) {
    this.currentLevel = CONSTANTS.INITIAL_LEVEL;
    this.scoreManager.resetScore();
    this.lives = CONSTANTS.PLAYER_INITIAL_LIVES;
  }

  onLoad({ currentLevel, resetCurrentLevel }) {
    const {
      blocks,
      player,
      ball,
    } = this.loadLevel({
      levels: LEVELS,
      levelNum: currentLevel,
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
  }

  /*
    Implementacion
  */
  isLevelCleared() {
    return this.blocks.filter(b => b.isActive()).length === 0;
  }

  handleEndGame() {
    const numOfBalls = this.balls.length;
    const isGameFinished = this.currentLevel >= LEVELS.length;
    if (numOfBalls === 0) {
      if (this.lives < 1) {
        this.displayCenteredText({ message: TEXT_LABELS.GAME_OVER });
        this.scoreManager.saveHighestScore(this.scoreManager.getScore());
        this.scoreManager.score = 0;
      } else {
        this.startNextLevelLoad({
          resetCurrentLevel: true,
          isGameFinished,
        });
      }
      this.powerUps.forEach(p => p.destroy());
    } else if (this.isLevelCleared()) {
      this.balls.forEach(ball => ball.destroy());
      this.startNextLevelLoad({
        resetCurrentLevel: false,
        isGameFinished,
      });
    }
  }

  handleMultipleBalls() {
    this.balls = this.balls.filter(b => !b.isBelowScreen());
  }

  handlePowerUps() {
    this.powerUps = this.powerUps.filter(p => !p.isBelowScreen());
  }

  loadLevel({ levels = [], levelNum = CONSTANTS.INITIAL_LEVEL }) {
    const blocks = this.generateLevel({
      structure: levels[levelNum],
    });

    const newPlayer = new Player({
      p5: this.p5,
      gameAreaWidth: this.width,
      gameAreaX: this.x,
      gameAreaY: this.y,
    });

    const newBall = new Ball({
      p5: this.p5,
      gameAreaWidth: this.width,
      gameAreaX: this.x,
      gameAreaY: this.y,
      player: newPlayer,
    });
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

  generateLevel({ structure }) {
    const blocks = [];
    const blocksHeight = this.width * CONSTANTS.BLOCK_HEIGHT;
    const blocksMargin = 0;

    let levelRow = structure[0];
    let blockX = blocksMargin + this.x;
    const gameAreaWidth = this.width;
    // Los bloques comienzan a dibujarse en el area de juego
    let blockY = blocksMargin + this.CANVAS_GAME_AREA_Y_START;
    for (let i = 0; i < structure.length; i++) {
      levelRow = structure[i];
      blockX = blocksMargin + this.x;
      // El ancho de los bloques puede variar de acuerdo al número
      // de bloques en la fila
      const blocksWidth = gameAreaWidth / levelRow.length;
      for (let j = 0; j < levelRow.length; j++) {
        const blockType = levelRow[j];
        const newBlock = new Block({
          type: 'Block',
          width: blocksWidth,
          height: blocksHeight,
          x: blockX,
          y: blockY,
          score: BLOCK_TYPES[blockType].score,
          durability: BLOCK_TYPES[blockType].durability,
          blockType,
          p5: this.p5,
        });
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

  loadCollisions({ player, colliders }) {
    colliders.forEach(coll => player.addCollisionObject(coll));
    return player;
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

  update({ x, y, type = 'Unknown' }) {
    console.log('Notificacion a screen');
    console.log(type);
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

  /*
    POWER UPS
  */
  powerUpMultipleBalls(num = 1) {
    for (let i = 0; i < num; i++) {
      const currentBall = this.balls[0];

      const newBall = new Ball({
        p5: this.p5,
        gameAreaWidth: this.width,
        gameAreaX: this.x,
        gameAreaY: this.y,
        player: this.player,
      });

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