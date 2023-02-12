class ScoreManager {
  constructor(canvasWidth, canvasHeight, scoreAreaHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
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
    fill(94, 92, 92);
    rect(0, 0, this.canvasWidth, this.scoreAreaHeight);

    fill(255);
    textSize(12);
    textAlign(LEFT, CENTER);
    text(
      'Score: ' + this.formatNumber(this.getScore(), 5),
      20,
      this.scoreAreaHeight / 2,
    );
    text(
      'Highest Score: ' + this.formatNumber(this.highestScore, 5),
      (this.canvasWidth / 2) + 20,
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

}
