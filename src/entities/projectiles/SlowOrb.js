import { Projectile } from './Projectile.js';
import { createSlowEffect } from '../../systems/StatusEffectSystem.js';

export class SlowOrb extends Projectile {
  constructor(x, y, target, damage, slowDuration, slowMultiplier, sourceId) {
    super(x, y, target, 180, damage);
    this.slowDuration = slowDuration;
    this.slowMultiplier = slowMultiplier;
    this.sourceId = sourceId;
    this.color = '#74b9ff';
    this.size = 5;
  }

  onHit(target) {
    target.takeDamage(this.damage);
    const effect = createSlowEffect(this.sourceId, this.slowDuration, this.slowMultiplier);
    target.statusEffects.push(effect);
  }
}
