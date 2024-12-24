// == scoreboard.js ==
export class scoreboard {
  constructor() {
    this.score = 0;
    this.flashalpha = 0;
  }

  addpoints(n) {
    this.score += n;
  }

  reset() {
    this.score = 0;
    this.flashalpha = 0;
  }

  flash() {
    this.flashalpha = 1;
  }

  update() {
    this.flashalpha -= 0.02;
    if (this.flashalpha < 0) this.flashalpha = 0;
  }

  draw(ctx, player) {
    // bigger text for the score
    ctx.fillStyle = '#fff';
    ctx.font = '32px sans-serif';
    ctx.fillText('score: ' + this.score, 20, 40);

    // health right below the score
    ctx.font = '20px sans-serif';
    ctx.fillText('health: ' + player.health, 20, 70);

    // flash effect if recently hit
    if (this.flashalpha > 0) {
      ctx.fillStyle = 'rgba(255,0,0,' + this.flashalpha + ')';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }
}
