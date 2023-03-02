import { Drawable } from './Drawable.js';

export class ScoreManager extends Drawable {
  constructor({ x, y, width, height, p5 }) {
    super({ x, y, width, height, p5 });
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
    this.p5.rect(0, this.pos.y, this.width, this.height);

    this.p5.fill(255);
    this.p5.textSize(this.width * 0.04);
    this.p5.textAlign(this.p5.LEFT, this.p5.CENTER);
    this.p5.text(
      'Score: ' + this.formatNumber(this.getScore(), 5),
      20,
      this.height / 2,
    );
    this.p5.text(
      'Highest Score: ' + this.formatNumber(this.highestScore, 5),
      this.width / 2,
      this.height / 2,
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
