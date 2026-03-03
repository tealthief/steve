import { Entity } from '../Entity.js';
import { dist } from '../../utils/math.js';

export class Tower extends Entity {
  constructor(col, row, def, tileGrid) {
    const tileSize = 40;
    super(col * tileSize + tileSize / 2, row * tileSize + tileSize / 2);

    this.col = col;
    this.row = row;
    this.name = def.name;
    this.type = def.type;
    this.baseCost = def.cost;
    this.range = def.range;
    this.damage = def.damage;
    this.cooldown = def.cooldown;        // ms between shots
    this.cooldownTimer = 0;
    this.color = def.color || '#3498db';
    this.size = def.size || 16;

    this.target = null;
    this.kills = 0;
    this.totalDamage = 0;
    this.totalSpent = def.cost;

    // Upgrade state
    this.tier1Purchased = false;
    this.lockedBranch = null; // 'A' or 'B'
    this.branchLevel = 0;    // 0, 1, or 2 within the locked branch

    // Mark tile as occupied
    tileGrid.place(col, row);
  }

  update(delta, enemyManager) {
    this.cooldownTimer -= delta;
    if (this.cooldownTimer <= 0) {
      this.target = this.acquireTarget(enemyManager);
      if (this.target) {
        this.fire(this.target);
        this.cooldownTimer = this.cooldown;
      }
    }
  }

  acquireTarget(enemyManager) {
    // Default: furthest enemy along path within range
    return enemyManager.getFurthestInRange(this.x, this.y, this.range);
  }

  fire(target) {
    // Override in subclass
  }

  getSellValue() {
    return Math.floor(this.totalSpent * 0.6);
  }

  isInRange(enemy) {
    return dist(this.x, this.y, enemy.x, enemy.y) <= this.range;
  }

  render(ctx) {
    // Base tower rendering
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);

    // Outline
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);

    // Direction indicator (line toward target)
    if (this.target && this.target.active) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.target.x, this.target.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  renderRange(ctx) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
