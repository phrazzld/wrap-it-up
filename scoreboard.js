// == scoreboard.js ==
export class scoreboard {
  constructor() {
    this.score = 0;
    this.flashalpha = 0;

    // optional: store a "maxhealth" so we can draw a complete bar
    this.maxhealth = 3;
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
    // a crisp white for the main text
    ctx.fillStyle = '#fff';
    ctx.font = '28px sans-serif';
    ctx.fillText('score: ' + this.score, 20, 40);

    // draw the health bar right below
    this.drawhealthbar(ctx, player);
    
    // draw combo counter if active
    if (player.stompCombo > 0) {
      ctx.save();
      // Make it pop with size and color
      const comboScale = 1 + (player.stompCombo * 0.1);
      ctx.font = `${28 * comboScale}px sans-serif`;
      ctx.fillStyle = '#ffff00';
      ctx.strokeStyle = '#ff6600';
      ctx.lineWidth = 3;
      const comboText = 'COMBO x' + player.stompCombo + '!';
      const textX = 20;
      const textY = 120;
      ctx.strokeText(comboText, textX, textY);
      ctx.fillText(comboText, textX, textY);
      ctx.restore();
    }

    // flash if recently hit
    if (this.flashalpha > 0) {
      ctx.fillStyle = 'rgba(255,0,0,' + this.flashalpha + ')';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }

  drawhealthbar(ctx, player) {
    // bar settings
    const barx = 20;
    const bary = 60;
    const barwidth = 200;
    const barheight = 20;

    // draw bg
    ctx.fillStyle = '#333';
    ctx.fillRect(barx, bary, barwidth, barheight);

    // calc fill
    const ratio = player.health / this.maxhealth;
    const fillw = barwidth * ratio;

    // color for the health fill
    // let's do something that shifts from green to red as health declines
    const r = Math.floor((1 - ratio) * 255);
    const g = Math.floor(ratio * 255);
    const b = 0;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(barx, bary, fillw, barheight);

    // an optional border or label
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(barx, bary, barwidth, barheight);

    // label it
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#000';
    ctx.fillText('health', barx + 4, bary + 15);
  }
}
