class GameScreen {
  
  constructor(options) {
    this.canvasHeight = window.innerHeight * options.PREFERED_HEIGHT;
    this.canvasWidth = (this.canvasHeight * options.ASPECT_RATIO_H) / options.ASPECT_RATIO_V;
    // La coordenada (y) a partir de la cual empieza el area de juego
    this.CANVAS_GAME_AREA_Y = Math.floor(this.canvasHeight * CANVAS_SETTINGS.SCORE_DISPLAY_HEIGHT);
    this.SCORE_AREA_HEIGHT = this.CANVAS_GAME_AREA_Y;

    this.canvas = createCanvas(this.canvasWidth, this.canvasHeight);

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

    this.scoreManager = new ScoreManager(this.canvasWidth, this.canvasHeight, this.SCORE_AREA_HEIGHT);

    // Generate game objects
    const {
      blocks,
      player,
      ball,
    } = this.loadLevel({ levels: LEVELS, levelNum: this.currentLevel });

    this.blocks = blocks;
    this.player = player;
    this.ball = ball;

    this.isLoadingNextLevel = false;
    this.isOnMenu = true;
    this.isGameNotStarted = true;

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
    push();
    background(0, 0, 0);
    fill(254, 254, 254);
    textAlign(CENTER, CENTER);
    textSize(this.canvasWidth * 0.07);
    text('ARKANOID ATTEMPT', this.canvasWidth / 2, this.CANVAS_GAME_AREA_Y * 4);
    pop();
  }

  drawGameplay() {
    background(0, 0, 0);
    fill(255);
  
    this.player.draw();
    this.ball.draw();
    this.drawBlocks();
    this.scoreManager.draw();
  
    //this.handleKeyPressed();
    this.handleEndGame();
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

    this.playBtn = createButton('Play');
    this.playBtn.position(x, y + btnHeight);
    this.playBtn.size(btnWidth, btnHeight);
    this.playBtn.mouseClicked(this.onBtnPlayClick.bind(this));
  }

  onBtnPlayClick() {
    this.isOnMenu = false;
    this.playBtn.remove();
  }

  handleEndGame() {
    if (this.ball.isBelowScreen()) {
      this.displayCenteredText('GAME OVER');
      this.scoreManager.saveHighestScore(this.scoreManager.getScore());
      this.scoreManager.score = 0;
    } else if (this.isLevelCleared()) {
      this.ball.destroy();
      this.startNextLevelLoad();
    }
  }

  handleKeyPressed() {
    if (keyIsPressed) {
      this.player.controlInputs(keyCode);
      this.ball.handleKeyPressed(keyCode);
    }
  }

  handleKeyReleased() {
    this.player.keyReleased();
  }

  displayCenteredText(message = 'Debug message') {
    push();
    textAlign(CENTER, CENTER);
    textSize(20);
    fill(255);
    text(message, this.canvasWidth / 2, this.canvasHeight / 2);
    pop();
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
      this.ball = ball;

      this.increaseGameSpeed({
        player: this.player,
        ball: this.ball,
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
    );

    const newBall = new Ball(
      this.canvasWidth,
      this.canvasHeight,
      this.canvasX,
      this.canvasY,
      newPlayer,
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
      push();
      this.blocks.forEach(block => {
        block.draw(); 
       });
      pop();
    }
  }

  increaseGameSpeed({ player, ball, pSpeed, bSpeed }) {
    player.increaseSpeed(pSpeed);
    ball.increaseSpeed(bSpeed);
  }

}
