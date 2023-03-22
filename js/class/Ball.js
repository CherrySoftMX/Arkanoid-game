import { calculateCoordsToCenterItem, getRandomNum } from '../utils/utils.js';
import { CONSTANTS } from '../constants/constants.js';
import { ColliderObject } from '../core/ColliderObject.js';

export class Ball extends ColliderObject {
  constructor({
    type = 'Ball',
    colliderType = 'CIRCLE',
    ...rest
  }) {
    super({ type, colliderType, ...rest });

    /*
      La velocidad ideal para {GAME_AREA_HEIGHT_REFERENCE}px de alto
      es de {BALL_SPEED}px por frame, por lo que se calcula la velocidad
      para la resolución actual con regla de 3 tomando las refencias para
      la altura que ya fue probada.

      speed = (gameArea.width * CONSTANTS.BALL_SPEED) / CONSTANTS.GAME_AREA_HEIGHT_REFERENCE;
    */
    this.baseSpeed = 0;
    this.speed = 0;

    this.playerReference = null;

    this.vel = this.p5.createVector(this.speed, this.speed);

    this.isFollowingPlayer = false;
    this.trails = [];
  }

  draw() {
    this.p5.fill(255);
    this.update();
    this.drawTrail();
    this.p5.ellipse(this.pos.x, this.pos.y, this.width, this.height);
  }

  drawTrail() {
    this.trails.push(this.pos.copy());
    if (this.trails.length > 15) {
      this.trails.shift();
    }
    const reduce = 255 / 15;
    this.p5.push();
    this.p5.noStroke();
    this.trails.forEach((obj, index) => {
      this.p5.fill(255, 255, 255, 255 - reduce * (15 - index));
      this.p5.ellipse(obj.x, obj.y, this.width, this.width);
    });
    this.p5.pop();
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

  configure() {
    const gameArea = this.screenLayoutManager.getGameScreenData();
    this.baseSpeed = (gameArea.width * CONSTANTS.BALL_SPEED) / CONSTANTS.GAME_AREA_HEIGHT_REFERENCE;
    this.speed = (gameArea.width * CONSTANTS.BALL_SPEED) / CONSTANTS.GAME_AREA_HEIGHT_REFERENCE;
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

  onCollision({ type, x, y, width, height }) {
    const prevVel = this.vel.copy();
    const acceleration = CONSTANTS.BALL_ACCELERATION;

    switch (type) {
      case 'Block':
        this.handleBlockCollision({x, y, width, height, acceleration});
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

  handleBlockCollision({ x, y, width, height, acceleration }) {
    const isLeftSideHit = this.iAmCollidingCircleToRect({ x, y, width: 1, height });
    const isRightSideHit = this.iAmCollidingCircleToRect({ x: x + width, y, width: 1, height });
    const isTopSideHit = this.iAmCollidingCircleToRect({ x, y, width, height: 1 });
    const isBottomSideHit = this.iAmCollidingCircleToRect({ x, y: y + height, width, height: 1 });

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
    this.handleFollowPlayer();
  }

  setPlayerReference(player) {
    this.playerReference = player;
  }

  increaseSpeed(increase) {
    this.speed += increase;
  }

  getSpeedVector() {
    return this.vel.copy();
  }

  setSpeedVector(vector) {
    const previousSpeed = this.vel.copy();
    this.vel = vector;
    this.pos.sub(previousSpeed);
  }

}
