let game;

/******************
 * P5.js control functions
 */
function setup() {
  game = new GameScreen(CANVAS_SETTINGS);
};

function draw() {
  game.draw();
};

function keyReleased() {
  game.handleKeyReleased();
}

function keyPressed() {
  game.handleKeyPressed();
}
