export class PlayerState {
  constructor(bus) {
    this.bus = bus;
    this.maxHp = 100;
    this.hp = 100;
    this.gold = 200;
    this.wave = 0;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    this.bus.emit('player:damaged', { hp: this.hp, damage: amount });
    if (this.hp <= 0) {
      this.bus.emit('player:dead');
    }
  }

  earnGold(amount) {
    this.gold += amount;
    this.bus.emit('gold:changed', this.gold);
  }

  spendGold(amount) {
    if (this.gold < amount) return false;
    this.gold -= amount;
    this.bus.emit('gold:changed', this.gold);
    return true;
  }

  canAfford(amount) {
    return this.gold >= amount;
  }
}
