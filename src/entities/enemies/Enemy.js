import { Entity } from '../Entity.js';
import { dist } from '../../utils/math.js';

export class Enemy extends Entity {
  constructor(def, waypoints) {
    const start = waypoints[0];
    super(start.x, start.y);

    // Copy all def properties for special behaviors
    this.defType = def.type || def.name;
    this.name = def.name;
    this.maxHp = def.hp;
    this.hp = def.hp;
    this.baseSpeed = def.speed;
    this.speed = def.speed;
    this.bounty = def.bounty;
    this.damageOnLeak = def.damageOnLeak || 1;
    this.armor = def.armor || 0;
    this.isFlying = def.isFlying || false;
    this.isBoss = def.isBoss || false;
    this.color = def.color || '#e74c3c';
    this.size = def.size || 12;

    // Special properties
    this.freezeResist = def.freezeResist || false;
    this.healer = def.healer || false;
    this.healAmount = def.healAmount || 0;
    this.healRadius = def.healRadius || 80;
    this.healInterval = def.healInterval || 2000;
    this.shieldHp = def.shieldHp || 0;
    this.maxShieldHp = def.shieldHp || 0;
    this.dodgeChance = def.dodgeChance || 0;
    this.stealth = def.stealth || false;
    this.stealthOpacity = def.stealthOpacity || 0.3;
    this.regenPerSecond = def.regenPerSecond || 0;
    this.splitOnDeath = def.splitOnDeath || false;
    this.splitType = def.splitType || null;
    this.splitCount = def.splitCount || 0;

    // Path
    this.waypoints = waypoints;
    this.waypointIndex = 1;
    this.distanceTraveled = 0;

    this.statusEffects = [];
    this.reachedEnd = false;

    // Timers for special abilities
    this._healTimer = 0;
    this._revealed = false; // stealth broken on first hit
  }

  update(delta, enemyManager) {
    if (!this.active || this.reachedEnd) return;

    const dt = delta / 1000;

    // Regen
    if (this.regenPerSecond > 0 && this.hp < this.maxHp) {
      this.hp = Math.min(this.maxHp, this.hp + this.regenPerSecond * dt);
    }

    // Healer pulse
    if (this.healer && enemyManager) {
      this._healTimer += delta;
      if (this._healTimer >= this.healInterval) {
        this._healTimer = 0;
        this._healNearby(enemyManager);
      }
    }

    const effectiveSpeed = this.getEffectiveSpeed();
    this.moveAlongPath(effectiveSpeed * dt);
  }

  _healNearby(enemyManager) {
    const rangeSq = this.healRadius * this.healRadius;
    for (const e of enemyManager.enemies) {
      if (e === this || !e.active) continue;
      const dx = e.x - this.x;
      const dy = e.y - this.y;
      if (dx * dx + dy * dy <= rangeSq) {
        e.hp = Math.min(e.maxHp, e.hp + this.healAmount);
      }
    }
  }

  getEffectiveSpeed() {
    let speed = this.baseSpeed;
    for (const effect of this.statusEffects) {
      if (effect.type === 'slow') {
        if (this.freezeResist) continue; // immune to slow
        speed *= effect.multiplier;
      }
      if (effect.type === 'freeze') {
        if (this.freezeResist) continue; // immune to freeze
        speed = 0;
      }
    }
    return speed;
  }

  moveAlongPath(moveDistance) {
    while (moveDistance > 0 && this.waypointIndex < this.waypoints.length) {
      const target = this.waypoints[this.waypointIndex];
      const d = dist(this.x, this.y, target.x, target.y);

      if (moveDistance >= d) {
        this.x = target.x;
        this.y = target.y;
        this.distanceTraveled += d;
        moveDistance -= d;
        this.waypointIndex++;
      } else {
        const ratio = moveDistance / d;
        this.x += (target.x - this.x) * ratio;
        this.y += (target.y - this.y) * ratio;
        this.distanceTraveled += moveDistance;
        moveDistance = 0;
      }
    }

    if (this.waypointIndex >= this.waypoints.length) {
      this.reachedEnd = true;
    }
  }

  takeDamage(amount) {
    // Dodge check
    if (this.dodgeChance > 0 && Math.random() < this.dodgeChance) {
      return 0;
    }

    // Stealth reveal
    if (this.stealth) this._revealed = true;

    // Shield absorption
    if (this.shieldHp > 0) {
      const absorbed = Math.min(this.shieldHp, amount);
      this.shieldHp -= absorbed;
      amount -= absorbed;
      if (amount <= 0) return absorbed;
    }

    const dmg = Math.max(0, amount - this.armor);
    this.hp -= dmg;
    if (this.hp <= 0) {
      this.hp = 0;
      this.active = false;
    }
    return dmg;
  }

  render(ctx) {
    if (!this.active) return;

    // Stealth opacity
    if (this.stealth && !this._revealed) {
      ctx.globalAlpha = this.stealthOpacity;
    }

    // Direction for movement
    let angle = 0;
    if (this.waypointIndex < this.waypoints.length) {
      const wp = this.waypoints[this.waypointIndex];
      angle = Math.atan2(wp.y - this.y, wp.x - this.x);
    }

    // Body shape varies by type
    ctx.fillStyle = this.color;
    if (this.isFlying) {
      // Diamond shape for flying enemies
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - this.size);
      ctx.lineTo(this.x + this.size, this.y);
      ctx.lineTo(this.x, this.y + this.size);
      ctx.lineTo(this.x - this.size, this.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Wings
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(this.x - this.size + 2, this.y - 2);
      ctx.lineTo(this.x - this.size - 4, this.y - 6);
      ctx.moveTo(this.x + this.size - 2, this.y - 2);
      ctx.lineTo(this.x + this.size + 4, this.y - 6);
      ctx.stroke();
    } else if (this.armor >= 10) {
      // Hexagon for heavy armor
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI * 2 * i) / 6 - Math.PI / 6;
        const px = this.x + Math.cos(a) * this.size;
        const py = this.y + Math.sin(a) * this.size;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Armor lines
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.x - this.size * 0.5, this.y);
      ctx.lineTo(this.x + this.size * 0.5, this.y);
      ctx.stroke();
    } else if (this.splitOnDeath) {
      // Blob shape for splitters
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.size * 1.2, this.size * 0.8, angle, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Split line
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - this.size * 0.7);
      ctx.lineTo(this.x, this.y + this.size * 0.7);
      ctx.stroke();
    } else {
      // Default circle
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Eyes (adds personality)
    if (!this.stealth || this._revealed) {
      const eyeOffX = Math.cos(angle) * this.size * 0.3;
      const eyeOffY = Math.sin(angle) * this.size * 0.3;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(this.x + eyeOffX - 3, this.y + eyeOffY - 2, Math.max(2, this.size * 0.2), 0, Math.PI * 2);
      ctx.arc(this.x + eyeOffX + 3, this.y + eyeOffY - 2, Math.max(2, this.size * 0.2), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(this.x + eyeOffX - 2, this.y + eyeOffY - 2, Math.max(1, this.size * 0.1), 0, Math.PI * 2);
      ctx.arc(this.x + eyeOffX + 4, this.y + eyeOffY - 2, Math.max(1, this.size * 0.1), 0, Math.PI * 2);
      ctx.fill();
    }

    // Shield indicator
    if (this.maxShieldHp > 0 && this.shieldHp > 0) {
      ctx.strokeStyle = '#74b9ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size + 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Boss crown
    if (this.isBoss) {
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.moveTo(this.x - 8, this.y - this.size - 4);
      ctx.lineTo(this.x - 5, this.y - this.size - 10);
      ctx.lineTo(this.x - 2, this.y - this.size - 6);
      ctx.lineTo(this.x, this.y - this.size - 12);
      ctx.lineTo(this.x + 2, this.y - this.size - 6);
      ctx.lineTo(this.x + 5, this.y - this.size - 10);
      ctx.lineTo(this.x + 8, this.y - this.size - 4);
      ctx.closePath();
      ctx.fill();
    }

    // Healer cross
    if (this.healer) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(this.x - 2, this.y - 5, 4, 10);
      ctx.fillRect(this.x - 5, this.y - 2, 10, 4);
    }

    ctx.globalAlpha = 1;

    // HP bar
    const barWidth = this.size * 2.5;
    const barHeight = 4;
    const barX = this.x - barWidth / 2;
    const barY = this.y - this.size - (this.isBoss ? 16 : 8);
    const hpRatio = this.hp / this.maxHp;

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = hpRatio > 0.5 ? '#2ecc71' : hpRatio > 0.25 ? '#f39c12' : '#e74c3c';
    ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

    // Shield bar (if has shield)
    if (this.maxShieldHp > 0) {
      const shieldRatio = this.shieldHp / this.maxShieldHp;
      ctx.fillStyle = '#74b9ff';
      ctx.fillRect(barX, barY - 3, barWidth * shieldRatio, 2);
    }

    // Name for bosses
    if (this.isBoss) {
      ctx.fillStyle = '#f1c40f';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.name, this.x, barY - 4);
      ctx.textAlign = 'left';
    }

    // Slow/freeze visual indicator
    const isFrozen = this.statusEffects.some(e => e.type === 'freeze');
    const isSlowed = this.statusEffects.some(e => e.type === 'slow');
    if (isFrozen) {
      ctx.strokeStyle = '#00cec9';
      ctx.lineWidth = 3;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size + 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (isSlowed) {
      ctx.strokeStyle = '#74b9ff';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size + 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
}
