import { randRange } from '../utils/math.js';

class Particle {
  constructor(x, y, vx, vy, life, color, size) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.size = size;
    this.active = true;
  }

  update(delta) {
    const dt = delta / 1000;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= delta;
    if (this.life <= 0) this.active = false;
  }

  render(ctx) {
    if (!this.active) return;
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  explode(x, y, radius) {
    const count = 12 + Math.floor(radius / 10);
    const colors = ['#e74c3c', '#e67e22', '#f1c40f', '#fff'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + randRange(-0.3, 0.3);
      const speed = randRange(40, 120);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const life = randRange(200, 500);
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = randRange(2, 5);
      this.particles.push(new Particle(x, y, vx, vy, life, color, size));
    }
  }

  spawn(x, y, color, count = 5) {
    for (let i = 0; i < count; i++) {
      const vx = randRange(-50, 50);
      const vy = randRange(-80, -20);
      const life = randRange(300, 600);
      const size = randRange(1, 3);
      this.particles.push(new Particle(x, y, vx, vy, life, color, size));
    }
  }

  update(delta) {
    for (const p of this.particles) {
      p.update(delta);
    }
    this.particles = this.particles.filter(p => p.active);
  }

  render(ctx) {
    for (const p of this.particles) {
      p.render(ctx);
    }
  }
}
