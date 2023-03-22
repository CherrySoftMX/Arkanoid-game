import { GameArea } from '../core/GameArea.js';
import { CONSTANTS, BLOCK_TYPES } from '../constants/constants.js';
import { LEVELS } from '../constants/levels.js';
import { TEXT_LABELS } from '../constants/strings.js';
import { Block } from './Block.js';
import { Player } from './Player.js';
import { Ball } from './Ball.js';
import { PowerUp } from './PowerUp.js';
import { calculateCoordsToCenterItem } from '../utils/utils.js';
import { PlayerPistol } from './PlayerPistol.js';
import { Bullet } from './Bullet.js';


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
    this.bullets = [];
  }

  drawGameplay() {
    this.p5.background(0, 0, 0);
    this.p5.fill(255);

    this.player.draw();
    this.balls.forEach(ball => ball.draw());
    this.powerUps.forEach(p => p.draw());
    this.bullets.forEach(b => b.draw());
    this.drawBlocks();
    this.handleEndGame();
  }

  onUpdate() {
    this.handleMultipleBalls();
    this.handlePowerUps();
    this.bullets.filter(b => b.isActive());
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

    if (this.player.type !== 'Player') {
      this.player.finish();
    }
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

    // Calculate player attributes
    const playerWidth = Math.ceil(this.width * 0.2);
    const playerHeight = this.width * CONSTANTS.PLAYER_HEIGHT;

    const { x: playerX } = calculateCoordsToCenterItem({
      windowWidth: this.width,
      windowHeight: this.width,
      objectHeight: playerHeight,
      objectWidth: playerWidth,
    });
    const playerY = this.y + this.width - playerHeight - 10;

    const newPlayer = new Player({
      p5: this.p5,
      x: playerX,
      y: playerY,
      width: playerWidth,
      height: playerHeight,
      type: 'Player',
    });
    newPlayer.setScreenLayoutManager(this.firstLayoutManager);
    newPlayer.configure();

    // Calculate ball atributes
    const ballWidth = this.width * CONSTANTS.BALL_WIDTH;
    const ballHeight = ballWidth;

    const newBall = new Ball({
      x: 0,
      y: 0,
      width: ballWidth,
      height: ballHeight,
      type: 'Ball',
      p5: this.p5,
    });
    newBall.setScreenLayoutManager(this.firstLayoutManager);
    newBall.configure();
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
    let blockX = blocksMargin;
    const gameAreaWidth = this.width;
    // Los bloques comienzan a dibujarse en el area de juego
    let blockY = blocksMargin + this.CANVAS_GAME_AREA_Y_START;
    for (let i = 0; i < structure.length; i++) {
      levelRow = structure[i];
      blockX = blocksMargin;
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

  update({ x, y, width, height, type = 'Unknown' }) {
    console.log('Notificacion a screen');
    console.log(type);
    switch (type) {
      case 'Block':
        const p5 = this.p5;

        const powerUp = new PowerUp({
          x,
          y,
          width,
          height,
          p5,
          type: 'PowerUp',
          callback: () => this.powerUpPistol(),
          //callback: this.powerUpMultipleBalls.bind(this, 2),
        });
        powerUp.setScreenLayoutManager(this.firstLayoutManager);

        powerUp.addCollisionObject(this.player);
        powerUp.addObserver(this);

        this.powerUps.push(powerUp);
        break;
      case 'PowerUp':
        this.powerUps = this.powerUps.filter(p => p.isActive());
        break;
      case 'PlayerPistol':
        // En este caso (x, y) corresponden al cañon, no al jugador
        this.createBullet({ x, y });
        break;
      case 'Bullet':
        this.bullets = this.bullets.filter(b => b.isActive());
        break;
    }
  }

  createBullet({ x, y }) {
    const bullet = new Bullet({ x, y: y - 5, width: 10, height: 20, p5: this.p5 });
    
    const currentBall = this.balls[0];
    this.loadCollisions({
      player: bullet,
      colliders: [
        ...currentBall.getCollisionObjects()
      ],
    });
    bullet.addObserver(this);
    
    this.bullets.push(bullet);
  }

  /*
    POWER UPS
  */
  powerUpMultipleBalls(num = 1) {
    for (let i = 0; i < num; i++) {
      const currentBall = this.balls[0];

      // Calculate ball atributes
      const ballWidth = this.width * CONSTANTS.BALL_WIDTH;
      const ballHeight = ballWidth;
      const { x, y } = currentBall.getPositionVector();

      const newBall = new Ball({
        x,
        y,
        width: ballWidth,
        height: ballHeight,
        type: 'Ball',
        p5: this.p5,
      });
      newBall.setScreenLayoutManager(this.firstLayoutManager);
      newBall.configure();

      let speedCurrentBall = currentBall.getSpeedVector();
      speedCurrentBall.x *= -1;
      speedCurrentBall.y *= i % 2 === 0 ? -1 : 1;

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

  powerUpPistol() {
    this.playerBackup = this.player;
    this.player = new PlayerPistol({ player: this.playerBackup });
    this.player.addObserver(this);

    setTimeout(() => {
      this.player.finish();
      this.player = this.playerBackup;
    }, 10000);
  }

}