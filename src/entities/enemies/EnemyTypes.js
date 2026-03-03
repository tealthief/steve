import { enemyDefs } from '../../data/enemyDefs.js';

// Special behavior handlers for enemy types
// These get called during enemy update if the enemy has the relevant property

export function updateEnemySpecial(enemy, delta, enemyManager) {
  const dt = delta / 1000;

  // Regeneration
  if (enemy.regenPerSecond && enemy.hp < enemy.maxHp) {
    enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.regenPerSecond * dt);
  }

  // Healer - heal nearby allies
  if (enemy.healer) {
    if (!enemy._healTimer) enemy._healTimer = 0;
    enemy._healTimer += delta;
    if (enemy._healTimer >= enemy.healInterval) {
      enemy._healTimer = 0;
      healNearby(enemy, enemyManager);
    }
  }

  // Shield - visual indicator handled in render
  // Shield absorbs damage in takeDamage override

  // Stealth - partial visibility
  // Handled in render

  // Split on death is handled when enemy dies
}

function healNearby(healer, enemyManager) {
  const range = healer.healRadius || 80;
  const amount = healer.healAmount || 5;
  for (const e of enemyManager.enemies) {
    if (e === healer || !e.active) continue;
    const dx = e.x - healer.x;
    const dy = e.y - healer.y;
    if (dx * dx + dy * dy <= range * range) {
      e.hp = Math.min(e.maxHp, e.hp + amount);
    }
  }
}

// Enhanced takeDamage for special enemy types
export function enhancedTakeDamage(enemy, amount) {
  // Dodge chance
  if (enemy.dodgeChance && Math.random() < enemy.dodgeChance) {
    return 0; // Dodged!
  }

  // Shield absorbs damage
  if (enemy.shieldHp !== undefined && enemy.shieldHp > 0) {
    const absorbed = Math.min(enemy.shieldHp, amount);
    enemy.shieldHp -= absorbed;
    amount -= absorbed;
    if (amount <= 0) return absorbed;
  }

  const dmg = Math.max(0, amount - enemy.armor);
  enemy.hp -= dmg;
  if (enemy.hp <= 0) {
    enemy.hp = 0;
    enemy.active = false;
  }
  return dmg;
}
