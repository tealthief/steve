import { Projectile } from './Projectile.js';
import { dist, angleTo } from '../../utils/math.js';

export class Bomb extends Projectile {
  constructor(x, y, target, damage, splashRadius, enemyManager, particleSystem, renderer) {
    super(x, y, target, 200, damage);
    this.splashRadius = splashRadius;
    this.enemyManager = enemyManager;
    this.particleSystem = particleSystem;
    this._renderer = renderer;
    this._audio = null;
    this.color = '#e74c3c';
    this.size = 6;

    // Arc trajectory
    this.startX = x;
    this.startY = y;
    this.targetX = target.x;
    this.targetY = target.y;
    this.flightTime = dist(x, y, target.x, target.y) / this.speed * 1000;
    this.elapsed = 0;
    this.arcHeight = 30 + Math.random() * 20;
  }

  update(delta) {
    if (!this.active) return;

    this.age += delta;
    if (this.age > this.lifetime) {
      this.active = false;
      return;
    }

    this.elapsed += delta;
    const t = Math.min(1, this.elapsed / this.flightTime);

    // Track target position for homing
    if (this.target && this.target.active) {
      this.targetX = this.target.x;
      this.targetY = this.target.y;
    }

    // Linear interpolation with parabolic arc
    this.x = this.startX + (this.targetX - this.startX) * t;
    this.y = this.startY + (this.targetY - this.startY) * t;

    // Parabolic arc (peaks at t=0.5)
    const arcOffset = -4 * this.arcHeight * t * (t - 1);
    this.y -= arcOffset;

    // Check if reached target
    if (t >= 1) {
      this.x = this.targetX;
      this.y = this.targetY;
      this.onHit(this.target);
      this.active = false;
    }
  }

  onHit(target) {
    // Deal splash damage to all enemies in radius
    const enemies = this.enemyManager.getEnemiesInRange(
      this.x, this.y, this.splashRadius
    );
    for (const enemy of enemies) {
      const d = dist(this.x, this.y, enemy.x, enemy.y);
      const falloff = 1 - (d / this.splashRadius) * 0.5;
      enemy.takeDamage(Math.floor(this.damage * falloff));
    }

    // Spawn explosion particles
    if (this.particleSystem) {
      this.particleSystem.explode(this.x, this.y, this.splashRadius);
    }

    // Screen shake for large explosions
    if (this._renderer && this.splashRadius > 80) {
      this._renderer.shake(3, 150);
    }

    if (this._audio) this._audio.explode();
  }

  render(ctx) {
    if (!this.active) return;

    // Shadow on ground
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    const groundY = this.startY + (this.targetY - this.startY) * Math.min(1, this.elapsed / this.flightTime);
    ctx.ellipse(this.x, groundY, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bomb body
    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    // Fuse spark
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.arc(this.x + 3, this.y - 4, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
