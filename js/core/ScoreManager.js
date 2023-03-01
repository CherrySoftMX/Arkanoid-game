export class ScoreManager {
  constructor({ gameAreaX, gameAreaY, gameAreaWidth, scoreAreaHeight, p5 }) {
    this.p5 = p5;
    this.gameAreaX = gameAreaX;
    this.gameAreaY = gameAreaY;
    this.gameAreaWidth = gameAreaWidth;

    this.scoreAreaHeight = scoreAreaHeight;

    this.score = 0
    this.highestScore = this.getHighestScore();
  }

  addToScore(num) {
    this.score += num;
  }

  getScore() {
    return this.score;
  }

  draw() {
    this.p5.fill(94, 92, 92);
    this.p5.rect(this.gameAreaX, this.gameAreaY, this.gameAreaWidth, this.scoreAreaHeight);

    this.p5.fill(255);
    this.p5.textSize(12);
    this.p5.textAlign(this.p5.LEFT, this.p5.CENTER);
    this.p5.text(
      'Score: ' + this.formatNumber(this.getScore(), 5),
      this.gameAreaX + 20,
      this.scoreAreaHeight / 2,
    );
    this.p5.text(
      'Highest Score: ' + this.formatNumber(this.highestScore, 5),
      (this.gameAreaWidth / 2) + this.gameAreaX + 20,
      this.scoreAreaHeight / 2,
    );
  }

  update({ scoreValue }) {
    this.addToScore(scoreValue);
  }

  saveHighestScore(score) {
    const current_highest_score = this.getHighestScore();
    if (score <= current_highest_score) return;
    localStorage.setItem('highest_score', score);
  }

  getHighestScore() {
    const item = localStorage.getItem('highest_score');
    if (item) {
      return parseInt(item);
    }
    return 0;
  }

  formatNumber(num, spaces = 5) {
    return String(num).padStart(spaces, '0');
  }

  resetScore() {
    this.score = 0;
  }

}
