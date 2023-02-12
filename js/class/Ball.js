import { calculateCoordsToCenterItem, getRandomNum } from '../utils/utils.js';
import { CONSTANTS } from '../constants/constants.js';

export class Ball {
  constructor(canvasWidth, canvasHeight, canvasX, canvasY, player, p5) {
    this.p5 = p5;

    this.width = 20;
    this.height = this.width;

    this.container = {
      width: canvasWidth,
      height: canvasHeight,
      x: canvasX,
      y: canvasY,
    };

    const { x, y } = calculateCoordsToCenterItem({
      windowWidth: canvasWidth,
      windowHeight: canvasHeight,
      objectWidth: this.width,
      objectHeight: this.height,
    });
    
    this.baseSpeed = CONSTANTS.BALL_SPEED;
    this.speed = CONSTANTS.BALL_SPEED;

    this.playerReference = player;

    this.isOutOfField = false;

    const possibleAngles = [45, 135, 225, 315];
    const randomNum = getRandomNum(0, 4);
    this.angle = possibleAngles[randomNum];

    this.isDestroyed = false;

    this.collisionObjects = [];

    this.pos = p5.createVector(x, y);
    this.vel = p5.createVector(this.speed, -this.speed);

    this.isFollowingPlayer = false;

    this.type = 'Ball';
  }

  draw() {
    this.p5.fill(255);
    this.update();
    this.p5.ellipse(this.pos.x, this.pos.y, this.width, this.height);

    this.p5.text(`Vel x: ${this.vel.x}`, 10, this.container.height - 100);
    this.p5.text(`Vel y: ${this.vel.y}`, 10, this.container.height - 85);
  }

  update() {
    if (this.isBelowScreen()) return;
    if (!this.isActive()) return;
    if (this.isFollowingPlayer) {
      this.handleFollowPlayer();
      return;
    }
    this.pos.add(this.vel);
    this.detectCollisions();
    this.handleAcceleration();
  }

  handleAcceleration() {
    const accX = this.vel.x < 0 ? -this.vel.x : this.vel.x;
    const accY = this.vel.y < 0 ? -this.vel.y : this.vel.y;
    const DECELARATION_TIME = 90; // 1.5 segundos
    if (accX > this.baseSpeed) {
      const speedDiferenceX = accX - this.baseSpeed;
      const deceleration = speedDiferenceX / DECELARATION_TIME; // 60 -> frames -> 1 segundo
      if (this.vel.x > 0) {
        this.vel.x -= deceleration;
        if (this.vel.x < this.baseSpeed) {
          this.vel.x = this.baseSpeed;
        }
      } else {
        this.vel.x += deceleration;
        if (this.vel.x > (-this.baseSpeed)) {
          this.vel.x = -this.baseSpeed;
        }
      }
    }
    if (accY > this.baseSpeed) {
      const speedDiferenceY = accY - this.baseSpeed;
      const deceleration = speedDiferenceY / DECELARATION_TIME; // 60 -> frames -> 1 segundo
      if (this.vel.y > 0) {
        this.vel.y -= deceleration;
        if (this.vel.y < this.baseSpeed) {
          this.vel.y = this.baseSpeed;
        }
      } else {
        this.vel.y += deceleration;
        if (this.vel.y > (-this.baseSpeed)) {
          this.vel.y = -this.baseSpeed;
        }
      }
    }
  }

  shouldMoveToLeft() {
    const isInsideScreen = (this.pos.x - this.speed) >= 0;
    return isInsideScreen; 
  }

  shouldMoveToRight() {
    const isInsideScreen = this.pos.x + this.speed <= this.container.width - (this.width / 2);
    return isInsideScreen;
  }

  shouldMoveToTop() {
    const isInsideScreen = this.pos.y - this.speed >= 0;
    return isInsideScreen;
  }

  shouldMoveToBottom() {
    const isInsideScreen = this.pos.y + this.speed <= (this.container.height - (this.height / 2));
    return isInsideScreen;
  }

  shouldMove() {
    return this.shouldMoveToLeft() && this.shouldMoveToRight() && this.shouldMoveToTop();
  }

  isBelowScreen() {
    this.isOutOfField = this.pos.y - this.height >= this.container.height;
    return this.isOutOfField;
  }

  isActive() {
    return !this.isDestroyed;
  }

  destroy() {
    this.isDestroyed = true;
  }

  detectCollisions() {
    this.collisionObjects.forEach(obj => {
      if (obj.isActive() && obj.isCollisionable()) {
        const { x, y } = obj.getCoords();
        const { width, height } = obj.getData();
        if (this.iAmColliding({ x, y, width, height })) {
          obj.onCollision({ type: this.type });
          this.onCollision({ ...obj, x, y });
          return;
        }
      }
    });
  }

  /**
   * Calcula si el objeto actual (this) se encuentra colisionando con otro objeto.
   * 
   * Este sistema de colisiones simple funciona al calcular si las coordenadas de (this)
   * se encuentran dentro de las coordenadas del otro objeto.
   * 
   * El objeto a comprobar colision debe ser un rectangulo.
   *
   * @param x - La coordenada x del objeto a comprobar colision.
   * @param y - La coordenada y del objeto a comprobar colision.
   * @param width - El ancho del objeto a comprobar colision.
   * @param height - El ancho del objeto a comprobar colision.  
   * @returns - Un booleano que indica si el objeto (this) esta colisionando con el objeto de los parametros.
   */
  iAmColliding({ x, y, width, height }) {
    const myX = this.pos.x;
    const myY = this.pos.y;

    const verticalDistance = Math.floor((y + (height / 2)) - myY );
    // Valor absoluto de la distancia vertical
    const fixedVerticalDistance = verticalDistance < 0 ? verticalDistance * (-1) : verticalDistance;
    const isVerticalCollision = fixedVerticalDistance < ((this.height / 2) + (height / 2));
    const isHorizontalCollision = myX + (this.width / 2) >= x && (myX - this.width / 2) <= (x + width);

    const isCollision = isVerticalCollision && isHorizontalCollision;
    return isCollision;
  }

  onCollision({ type, x, y, width, height }) {
    const prevVel = this.vel.copy();
    const acceleration = 1.5;

    switch (type) {
      case 'Block':
        this.handleBlockCollision({x, y, width, height});
        break;
      case 'TopBorder':
        this.vel.y = this.speed * acceleration;
        break;
      case 'LeftBorder':
        this.vel.x = this.speed * acceleration;
        break;
      case 'RightBorder':
        this.vel.x = this.speed * (-acceleration);
        break;
      case 'Player':
        const relativeX = this.p5.map(this.pos.x, x, x + width, 0, 40);
        let newXDirection = 0;
        let ySpeed = -this.speed;
        if (relativeX < 10) {
          newXDirection = -1;
        } else if (relativeX < 20) {
          newXDirection = -0.5;
          ySpeed = this.speed * 1.3 * (-1);
        } else if (relativeX < 30) {
          newXDirection = 0.5;
          ySpeed = this.speed * 1.3 * (-1);
        } else {
          newXDirection = 1;
        }
        this.vel.set(newXDirection * this.speed * acceleration, ySpeed * acceleration);
        break;
    }

    this.pos.sub(prevVel);
  }

  handleBlockCollision({ x, y, width, height }) {
    const isLeftSideHit = this.iAmColliding({ x, y, width: 1, height });
    const isRightSideHit = this.iAmColliding({ x: x + width, y, width: 1, height });
    const isTopSideHit = this.iAmColliding({ x, y, width, height: 1 });
    const isBottomSideHit = this.iAmColliding({ x, y: y + height, width, height: 1 });

    const ballX = this.pos.x;
    const ballY = this.pos.y;
    const ballRightBorder = ballX + this.width / 2;
    const ballLeftBorder = ballX - this.width / 2;

    const collObjRightBorder = x + width;

    const currentSpeedX = this.vel.x < 0 ? -this.vel.x : this.vel.x;

    if (isLeftSideHit) {
      //alert(`is Right: ${ballRightBorder}, x: ${x}`);
      if (ballRightBorder - currentSpeedX <= x) {
        this.vel.x *= -1;
        //alert('Collision izquierda');
      } else if (isTopSideHit || isBottomSideHit) {
        this.vel.y *= -1;
        //alert('Falsa collision izquierda');
      }
    } else if (isRightSideHit) {
      //alert(`is Left: ${ballLeftBorder}, x: ${collObjRightBorder}`);
      if (ballLeftBorder + currentSpeedX >= collObjRightBorder) {
        this.vel.x *= -1;
        //alert('Colision derecha');
      } else if (isTopSideHit || isBottomSideHit) {
        this.vel.y *= -1;
        //alert('Falsa colision derecha');
      }
    } else if (isTopSideHit || isBottomSideHit) {
      //alert('Colision vertical');
      this.vel.y *= -1;
    }

  }

  handleFollowPlayer() {
    const { x, y, width, height } = this.playerReference.getCompleteData();
    const playerXCenter = x + (width / 2);
    const posY = y - (this.height / 2) - (height / 4);
    this.pos.set(playerXCenter, posY);
  }

  handleKeyPressed(input) {
    // 32 -> Space
    if (input === 32) {
      this.stopFollowPlayer();
    }
  }

  stopFollowPlayer() {
    if (!this.isFollowingPlayer) return;
    this.isFollowingPlayer = false;
    const { movementDirection } = this.playerReference.getCompleteData();
    if (movementDirection < 0) {
      this.vel.set(-this.speed, -this.speed);
    } else if (movementDirection > 0) {
      this.vel.set(this.speed, -this.speed);
    } else {
      this.vel.set(this.speed, -this.speed);
    }
  }

  followPlayer(player) {
    this.playerReference = player;
    this.isFollowingPlayer = true;
  }

  setPlayerReference(player) {
    this.playerReference = player;
  }

  addCollisionObject(obj) {
    this.collisionObjects.push(obj);
  }

  increaseSpeed(increase) {
    this.speed += increase;
  }

  setPositionVector(vector) {
    this.pos = vector;
  }

  getPositionVector() {
    return this.pos.copy();
  }

  getSpeedVector() {
    return this.vel.copy();
  }

  setSpeedVector(vector) {
    const previousSpeed = this.vel.copy();
    this.vel = vector;
    this.pos.sub(previousSpeed);
  }

  getCollisionObjects() {
    return this.collisionObjects;
  }

}
