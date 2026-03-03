import { Tower } from './Tower.js';
import { SlowOrb } from '../projectiles/SlowOrb.js';
import { createSlowEffect, createFreezeEffect, createDamageAmpEffect } from '../../systems/StatusEffectSystem.js';

export const BRR_BRR_DEF = {
  type: 'brr_brr_patapim',
  name: 'Brr Brr Patapim',
  cost: 125,
  range: 130,
  damage: 5,
  cooldown: 1500,
  color: '#74b9ff',
  size: 18,
};

export class BrrBrrPatapim extends Tower {
  constructor(col, row, tileGrid) {
    super(col, row, BRR_BRR_DEF, tileGrid);
    this.slowDuration = 2000;
    this.slowMultiplier = 0.5;
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
    const orb = new SlowOrb(
      this.x, this.y, target,
      this.damage, this.slowDuration, this.slowMultiplier, this.id
    );
    this.projectileManager.add(orb);
    if (this._audio) this._audio.freeze();
  }

  render(ctx) {
    // Body - blue/ice square
    ctx.fillStyle = '#74b9ff';
    ctx.fillRect(this.x - 11, this.y - 11, 22, 22);

    // Inner ice crystal pattern
    ctx.strokeStyle = '#a4d4ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - 8);
    ctx.lineTo(this.x, this.y + 8);
    ctx.moveTo(this.x - 8, this.y);
    ctx.lineTo(this.x + 8, this.y);
    ctx.moveTo(this.x - 5, this.y - 5);
    ctx.lineTo(this.x + 5, this.y + 5);
    ctx.moveTo(this.x + 5, this.y - 5);
    ctx.lineTo(this.x - 5, this.y + 5);
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x - 4, this.y - 3, 3, 0, Math.PI * 2);
    ctx.arc(this.x + 4, this.y - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.arc(this.x - 3, this.y - 3, 1.5, 0, Math.PI * 2);
    ctx.arc(this.x + 5, this.y - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Outline
    ctx.strokeStyle = '#0984e3';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x - 11, this.y - 11, 22, 22);
  }
}
