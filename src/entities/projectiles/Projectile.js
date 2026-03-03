import { Entity } from '../Entity.js';
import { dist, angleTo } from '../../utils/math.js';

export class Projectile extends Entity {
  constructor(x, y, target, speed, damage) {
    super(x, y);
    this.target = target;
    this.speed = speed;       // pixels per second
    this.damage = damage;
    this.lifetime = 5000;     // ms before auto-expire
    this.age = 0;
    this.size = 4;
    this.color = '#fff';
  }

  update(delta) {
    if (!this.active) return;

    this.age += delta;
    if (this.age > this.lifetime) {
      this.active = false;
      return;
    }

    const dt = delta / 1000;

    // Move toward target
    if (!this.target || !this.target.active) {
      // Target died, keep moving in last direction
      this.active = false;
      return;
    }

    const angle = angleTo(this.x, this.y, this.target.x, this.target.y);
    this.x += Math.cos(angle) * this.speed * dt;
    this.y += Math.sin(angle) * this.speed * dt;

    // Check if hit target
    if (dist(this.x, this.y, this.target.x, this.target.y) < this.target.size + this.size) {
      this.onHit(this.target);
      this.active = false;
    }
  }

  onHit(target) {
    target.takeDamage(this.damage);
  }

  render(ctx) {
    if (!this.active) return;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
