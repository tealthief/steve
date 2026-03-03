import { Projectile } from './Projectile.js';

export class Bullet extends Projectile {
  constructor(x, y, target, damage, options = {}) {
    super(x, y, target, 500, damage);
    this.armorPierce = options.armorPierce || false;
    this.pierceCount = options.pierceCount || 0;
    this.instakillChance = options.instakillChance || 0;
    this.color = '#f39c12';
    this.size = 3;
    this._pierced = [];
  }

  onHit(target) {
    // Instakill check
    if (this.instakillChance > 0 && !target.isBoss && Math.random() < this.instakillChance) {
      target.hp = 0;
      target.active = false;
      return;
    }

    if (this.armorPierce) {
      target.hp -= this.damage; // bypass armor
      if (target.hp <= 0) {
        target.hp = 0;
        target.active = false;
      }
    } else {
      target.takeDamage(this.damage);
    }
  }
}
