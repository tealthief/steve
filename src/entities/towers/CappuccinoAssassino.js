import { Tower } from './Tower.js';
import { Bullet } from '../projectiles/Bullet.js';

export const CAPPUCCINO_DEF = {
  type: 'cappuccino_assassino',
  name: 'Cappuccino Assassino',
  cost: 200,
  range: 250,
  damage: 80,
  cooldown: 3000,
  color: '#6c3811',
  size: 18,
};

export class CappuccinoAssassino extends Tower {
  constructor(col, row, tileGrid) {
    super(col, row, CAPPUCCINO_DEF, tileGrid);
    this.projectileManager = null;
    this.enemyManager = null;
    this.particleSystem = null;
  }

  wire(projectileManager, enemyManager, particleSystem) {
    this.projectileManager = projectileManager;
    this.enemyManager = enemyManager;
    this.particleSystem = particleSystem;
  }

  acquireTarget(enemyManager) {
    // Sniper targets highest HP enemy in range
    const inRange = enemyManager.getEnemiesInRange(this.x, this.y, this.range);
    if (inRange.length === 0) return null;
    return inRange.reduce((best, e) => e.hp > best.hp ? e : best);
  }

  fire(target) {
    if (!this.projectileManager) return;
    const bullet = new Bullet(this.x, this.y, target, this.damage);
    this.projectileManager.add(bullet);
    if (this._audio) this._audio.snipe();

    // Muzzle flash particles
    if (this.particleSystem) {
      this.particleSystem.spawn(this.x, this.y, '#f39c12', 3);
    }
  }

  render(ctx) {
    // Body - brown coffee cup shape
    ctx.fillStyle = '#6c3811';
    ctx.fillRect(this.x - 10, this.y - 8, 20, 18);

    // Cup top (cream)
    ctx.fillStyle = '#ffeaa7';
    ctx.fillRect(this.x - 10, this.y - 10, 20, 6);

    // Rifle barrel pointing at target
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 3;
    if (this.target && this.target.active) {
      const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(20, 0);
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.moveTo(this.x + 8, this.y);
      ctx.lineTo(this.x + 20, this.y);
      ctx.stroke();
    }

    // Eyes (menacing)
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(this.x - 4, this.y - 2, 2.5, 0, Math.PI * 2);
    ctx.arc(this.x + 4, this.y - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Outline
    ctx.strokeStyle = '#4a2508';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x - 10, this.y - 10, 20, 20);
  }
}
