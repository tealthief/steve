export class DamageNumbers {
  constructor() {
    this.numbers = [];
  }

  add(x, y, amount, color = '#fff') {
    this.numbers.push({
      x: x + (Math.random() - 0.5) * 10,
      y,
      amount: Math.floor(amount),
      color,
      life: 800,
      maxLife: 800,
    });
  }

  update(delta) {
    for (const n of this.numbers) {
      n.life -= delta;
      n.y -= delta * 0.03; // float upward
    }
    this.numbers = this.numbers.filter(n => n.life > 0);
  }

  render(ctx) {
    for (const n of this.numbers) {
      const alpha = Math.min(1, n.life / 300);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = n.color;
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${n.amount}`, n.x, n.y);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }
}
