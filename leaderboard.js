// == leaderboard.js ==
export class leaderboard {
  constructor(maxEntries = 5) {
    this.maxEntries = maxEntries;
    this.scores = JSON.parse(localStorage.getItem('leaderboard')) || [];
  }

  addscore(name, score) {
    // add the new score
    this.scores.push({ name, score });
    // sort by score descending
    this.scores.sort((a, b) => b.score - a.score);
    // trim to maxEntries
    if (this.scores.length > this.maxEntries) {
      this.scores = this.scores.slice(0, this.maxEntries);
    }
    // save to localStorage
    localStorage.setItem('leaderboard', JSON.stringify(this.scores));
  }

  gettopscores() {
    return this.scores;
  }
}
