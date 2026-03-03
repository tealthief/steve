import { Tower } from './Tower.js';
import { Bomb } from '../projectiles/Bomb.js';

export const BOMBARDIRO_DEF = {
  type: 'bombardiro_crocodilo',
  name: 'Bombardiro Crocodilo',
  cost: 150,
  range: 150,
  damage: 40,
  cooldown: 2000,
  splashRadius: 60,
  color: '#27ae60',
  size: 20,
};

export class BombardiroCrocodilo extends Tower {
  constructor(col, row, tileGrid) {
    super(col, row, BOMBARDIRO_DEF, tileGrid);
    this.splashRadius = BOMBARDIRO_DEF.splashRadius;
    this.projectileManager = null;
    this.enemyManager = null;
    this.particleSystem = null;
  }

  wire(projectileManager, enemyManager, particleSystem) {
    this.projectileManager = projectileManager;
    this.enemyManager = enemyManager;
    this.particleSystem = particleSystem;
  }

  fire(target) {
    if (!this.projectileManager) return;
    const bomb = new Bomb(
      this.x, this.y, target,
      this.damage, this.splashRadius,
      this.enemyManager, this.particleSystem, this._renderer
    );
    bomb._audio = this._audio;
    this.projectileManager.add(bomb);
  }

  render(ctx) {
    // Body - green square with darker border
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(this.x - 12, this.y - 12, 24, 24);

    // Crocodile snout
    ctx.fillStyle = '#2ecc71';
    if (this.target && this.target.active) {
      const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(angle);
      ctx.fillRect(8, -4, 12, 8);
      ctx.restore();
    } else {
      ctx.fillRect(this.x + 8, this.y - 4, 12, 8);
    }

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x - 4, this.y - 6, 4, 0, Math.PI * 2);
    ctx.arc(this.x + 4, this.y - 6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(this.x - 3, this.y - 6, 2, 0, Math.PI * 2);
    ctx.arc(this.x + 5, this.y - 6, 2, 0, Math.PI * 2);
    ctx.fill();

    // Outline
    ctx.strokeStyle = '#1e8449';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x - 12, this.y - 12, 24, 24);
  }
}
