import { CONSTANTS, LEVELS, BLOCK_TYPES, CANVAS_SETTINGS } from '../constants/constants.js';
import { calculateCoordsToCenterItem, getRandomNum } from '../utils/utils.js';
import { ScoreManager } from './ScoreManager.js';
import { Block } from './Block.js';
import { Player } from './Player.js';
import { Ball } from './Ball.js';
import { Collisionable } from './Collisionable.js';
import { PowerUp } from './PowerUp.js';

export class GameScreen {
  
  constructor(options, p5) {
    this.p5 = p5;

    this.canvasHeight = window.innerHeight * options.PREFERED_HEIGHT;
    this.canvasWidth = (this.canvasHeight * options.ASPECT_RATIO_H) / options.ASPECT_RATIO_V;
    // La coordenada (y) a partir de la cual empieza el area de juego
    this.CANVAS_GAME_AREA_Y = Math.floor(this.canvasHeight * options.SCORE_DISPLAY_HEIGHT);
    this.SCORE_AREA_HEIGHT = this.CANVAS_GAME_AREA_Y;

    this.canvas = p5.createCanvas(this.canvasWidth, this.canvasHeight);

    const { x, y } = calculateCoordsToCenterItem({
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      objectHeight: this.canvasHeight,
      objectWidth: this.canvasWidth,
    });

    this.canvasX = x;
    this.canvasY = y;
  
    this.canvas.position(x, y);

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
    this.isOnMenu = true;
    this.isGameNotStarted = true;

    /**
     * DEBUG POWER UPS
     */
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
    this.p5.text('ARKANOID ATTEMPT', this.canvasWidth / 2, this.CANVAS_GAME_AREA_Y * 4);
    this.p5.pop();
  }

  drawGameplay() {
    this.p5.background(0, 0, 0);
    this.p5.fill(255);
  
    this.player.draw();
    this.balls.forEach(ball => ball.draw());
    // DEBUG POWER UPS
    this.powerUps.forEach(p => p.draw());
    
    this.drawBlocks();
    this.scoreManager.draw();
    this.handleMultipleBalls();
    // DEBUG - POWER UPS
    this.handlePowerUps();
  
    this.handleEndGame();
  }

  /**
   * DEBUG POWER UPS
   */
  handlePowerUps() {
    this.powerUps = this.powerUps.filter(p => !p.isBelowScreen());
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

    this.playBtn = this.p5.createButton('Play');
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
      this.displayCenteredText('GAME OVER');
      this.scoreManager.saveHighestScore(this.scoreManager.getScore());
      this.scoreManager.score = 0;
    } else if (this.isLevelCleared()) {
      this.balls.forEach(ball => ball.destroy());
      this.startNextLevelLoad();
    }
  }

  handleKeyPressed() {
    if (this.p5.keyIsPressed) {
      this.player.controlInputs(this.p5.keyCode);
      this.balls.forEach(ball => ball.handleKeyPressed(this.p5.keyCode));

      /**
       * DEBUG: ADD MORE BALLS (c)
       */
      if (this.p5.keyCode === 67) {
        const currentBall = this.balls[0];

        const newBall1 = new Ball(
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

        newBall1.setPositionVector(posCurrentBall);
        newBall1.setSpeedVector(speedCurrentBall);

        this.loadCollisions({
          player: newBall1,
          colliders: [
            ...currentBall.getCollisionObjects()
          ],
        });

        this.balls.push(newBall1);
      }
    }
  }

  handleMultipleBalls() {
    this.balls = this.balls.filter(b => !b.isBelowScreen());
    this.p5.text(`Balls: ${this.balls.length}`, 100, 350);
  }

  handleKeyReleased() {
    this.player.keyReleased();
  }

  displayCenteredText(message = 'Debug message') {
    this.p5.push();
    this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
    this.p5.textSize(20);
    this.p5.fill(255);
    this.p5.text(message, this.canvasWidth / 2, this.canvasHeight / 2);
    this.p5.pop();
  }

  isLevelCleared() {
    return this.blocks.filter(b => b.isActive()).length === 0;
  }

  startNextLevelLoad() {
    const isGameFinished = this.currentLevel >= LEVELS.length;
    if (isGameFinished) {
      this.displayCenteredText('¡GAME CLEARED!');
      return;
    }
    if (this.isLoadingNextLevel) {
      // Los niveles empiezan en cero pero por presentación se muestra
      // que pasaste el nivel actual + 1.
      this.displayCenteredText(`LEVEL ${this.currentLevel} CLEARED!`);
      return;
    }
    if (!isGameFinished) {
      this.currentLevel += 1;
    }

    this.isLoadingNextLevel = true;

    // Se repite el if del inicio para evitar escribir a local storage
    // docenas de veces
    if (this.currentLevel >= LEVELS.length) {
      this.scoreManager.saveHighestScore(this.scoreManager.getScore());
    }

    // Cargar el nuevo nivel despues de 3.5 segundos
    setTimeout(() => {
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

      this.increaseGameSpeed({
        player: this.player,
        ball: this.balls,
        pSpeed: CONSTANTS.PLAYER_SPEED_INCREASE,
        bSpeed: CONSTANTS.BALL_SPEED_INCREASE,
      });

      this.isLoadingNextLevel = false;
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
    let blockX = blocksMargin;
    // Los bloques comienzan a dibujarse en el area de juego
    let blockY = blocksMargin + this.CANVAS_GAME_AREA_Y;
    for (let i = 0; i < structure.length; i++) {
      levelRow = structure[i];
      blockX = blocksMargin;
      // El ancho de los bloques puede variar de acuerdo al número
      // de bloques en la fila
      const blocksWidth = canvasWidth / levelRow.length;
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
      this.canvasWidth,
      this.canvasHeight,
      this.canvasX,
      this.canvasY,
      this.p5,
    );

    const newBall = new Ball(
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

    /**
     * DEBUG - POWER UPS
     */
    blocks.forEach(block => block.addObserver(this));

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
      x: -10,
      y: 0,
      type: 'LeftBorder',
    });

    const rightBorder = new Collisionable({
      width: 10,
      height: this.canvasHeight,
      x: this.canvasWidth,
      y: 0,
      type: 'RightBorder',
    });

    const topBorder = new Collisionable({
      width: this.canvasWidth,
      height: 10,
      x: 0,
      y: -10 + this.CANVAS_GAME_AREA_Y,
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

  update({ x, y, width, height }) {
    /**
     * DEBUG POWER UPS
     */
    const num = getRandomNum(1, 4);
    if (num === 2) {
      const p5 = this.p5;
      const canvasHeight = this.canvasHeight;
      console.log('Se genero un power up');
      const powerUp = new PowerUp({
        x,
        y,
        p5,
        canvasHeight,
      });
      this.powerUps.push(powerUp);
    }
  }

}
