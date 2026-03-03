import { Tower } from './Tower.js';
import { dist } from '../../utils/math.js';

export const TANG_TANG_DEF = {
  type: 'tang_tang_keletang',
  name: 'Tang Tang Keletang',
  cost: 175,
  range: 160,
  damage: 15,       // damage per second
  cooldown: 100,    // effectively continuous (fires every 100ms)
  color: '#fdcb6e',
  size: 18,
};

export class TangTangKeletang extends Tower {
  constructor(col, row, tileGrid) {
    super(col, row, TANG_TANG_DEF, tileGrid);
    this.beamTarget = null;
    this.beamDamagePerSecond = TANG_TANG_DEF.damage;
    this.enemyManager = null;
    this.particleSystem = null;
    this._beamSoundTimer = 0;
  }

  wire(projectileManager, enemyManager, particleSystem) {
    // Doesn't use projectiles - direct beam damage
    this.enemyManager = enemyManager;
    this.particleSystem = particleSystem;
  }

  update(delta, enemyManager) {
    // Find/maintain beam target
    if (!this.beamTarget || !this.beamTarget.active ||
        dist(this.x, this.y, this.beamTarget.x, this.beamTarget.y) > this.range) {
      this.beamTarget = this.acquireTarget(enemyManager);
    }

    // Deal continuous damage
    if (this.beamTarget && this.beamTarget.active) {
      const dt = delta / 1000;
      const dmg = this.beamDamagePerSecond * dt;
      this.beamTarget.takeDamage(dmg);
      this.totalDamage += dmg;

      // Periodic beam sound
      this._beamSoundTimer += delta;
      if (this._beamSoundTimer >= 200) {
        this._beamSoundTimer = 0;
        if (this._audio) this._audio.beam();
      }
    } else {
      this._beamSoundTimer = 0;
    }

    this.target = this.beamTarget; // for rendering
  }

  fire() {
    // No-op: beam tower doesn't fire projectiles
  }

  render(ctx) {
    // Draw beam first (behind tower)
    if (this.beamTarget && this.beamTarget.active) {
      // Beam glow
      ctx.strokeStyle = 'rgba(253, 203, 110, 0.3)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.beamTarget.x, this.beamTarget.y);
      ctx.stroke();

      // Core beam
      ctx.strokeStyle = '#fdcb6e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.beamTarget.x, this.beamTarget.y);
      ctx.stroke();

      // Bright center
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.beamTarget.x, this.beamTarget.y);
      ctx.stroke();
    }

    // Body - golden square
    ctx.fillStyle = '#fdcb6e';
    ctx.fillRect(this.x - 11, this.y - 11, 22, 22);

    // Large eyes (the eye beam source)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x - 4, this.y - 2, 5, 0, Math.PI * 2);
    ctx.arc(this.x + 4, this.y - 2, 5, 0, Math.PI * 2);
    ctx.fill();

    // Pupils - glow when firing
    if (this.beamTarget && this.beamTarget.active) {
      ctx.fillStyle = '#ff6b6b';
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 6;
    } else {
      ctx.fillStyle = '#2d3436';
      ctx.shadowBlur = 0;
    }
    ctx.beginPath();
    ctx.arc(this.x - 3, this.y - 2, 3, 0, Math.PI * 2);
    ctx.arc(this.x + 5, this.y - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Outline
    ctx.strokeStyle = '#e17055';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x - 11, this.y - 11, 22, 22);
  }
}
