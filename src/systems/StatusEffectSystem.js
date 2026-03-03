export class StatusEffectSystem {
  constructor() {
    // Status effects are tracked on each enemy directly
  }

  applyEffect(enemy, effect) {
    // Check for existing effect of same type from same source
    const existing = enemy.statusEffects.find(
      e => e.type === effect.type && e.sourceId === effect.sourceId
    );
    if (existing) {
      // Refresh duration
      existing.duration = effect.duration;
      existing.multiplier = effect.multiplier;
      return;
    }
    enemy.statusEffects.push({ ...effect });
  }

  updateAll(enemies, delta) {
    for (const enemy of enemies) {
      this.updateEnemy(enemy, delta);
    }
  }

  updateEnemy(enemy, delta) {
    for (let i = enemy.statusEffects.length - 1; i >= 0; i--) {
      const effect = enemy.statusEffects[i];
      effect.duration -= delta;
      if (effect.duration <= 0) {
        enemy.statusEffects.splice(i, 1);
      }
    }
  }
}

// Effect factory helpers
export function createSlowEffect(sourceId, duration, multiplier = 0.5) {
  return { type: 'slow', sourceId, duration, multiplier };
}

export function createFreezeEffect(sourceId, duration) {
  return { type: 'freeze', sourceId, duration, multiplier: 0 };
}

export function createDamageAmpEffect(sourceId, duration, multiplier = 1.4) {
  return { type: 'damage_amp', sourceId, duration, multiplier };
}
