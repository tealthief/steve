// Full upgrade trees for all 4 towers
// Each tower has: tier1 (shared), then branchA or branchB (mutually exclusive)

export const towerUpgrades = {
  bombardiro_crocodilo: {
    tier1: {
      cost: 100,
      label: 'Better Fuses',
      description: '+25% splash radius, +10 damage',
      apply: (tower) => {
        tower.splashRadius = Math.floor(tower.splashRadius * 1.25);
        tower.damage += 10;
      },
    },
    branchA: [
      {
        cost: 175,
        label: 'Mega Bomba',
        description: '+60% splash, +25 damage',
        apply: (tower) => {
          tower.splashRadius = Math.floor(tower.splashRadius * 1.6);
          tower.damage += 25;
        },
      },
      {
        cost: 350,
        label: 'Nuke Mode',
        description: 'Massive explosion, +60 damage',
        apply: (tower) => {
          tower.splashRadius = Math.floor(tower.splashRadius * 2);
          tower.damage += 60;
        },
      },
    ],
    branchB: [
      {
        cost: 175,
        label: 'Rapido Fuoco',
        description: '-40% cooldown',
        apply: (tower) => {
          tower.cooldown = Math.floor(tower.cooldown * 0.6);
        },
      },
      {
        cost: 350,
        label: 'Machine Bomber',
        description: '-50% cooldown, +15 damage',
        apply: (tower) => {
          tower.cooldown = Math.floor(tower.cooldown * 0.5);
          tower.damage += 15;
        },
      },
    ],
  },

  brr_brr_patapim: {
    tier1: {
      cost: 80,
      label: 'Colder Ice',
      description: '+20% slow strength, +0.5s duration',
      apply: (tower) => {
        tower.slowMultiplier = Math.max(0.1, tower.slowMultiplier - 0.1);
        tower.slowDuration += 500;
      },
    },
    branchA: [
      {
        cost: 150,
        label: 'Ghiaccio Totale',
        description: 'Can fully freeze enemies for 2s',
        apply: (tower) => {
          tower._canFreeze = true;
          tower._freezeDuration = 2000;
        },
      },
      {
        cost: 300,
        label: 'Permafrost',
        description: 'Freeze lasts 3s, frozen take 2x damage',
        apply: (tower) => {
          tower._freezeDuration = 3000;
          tower._freezeDamageAmp = 2;
        },
      },
    ],
    branchB: [
      {
        cost: 150,
        label: 'Aura Fragile',
        description: 'Enemies in range take +30% damage',
        apply: (tower) => {
          tower._damageAura = true;
          tower._auraMultiplier = 1.3;
        },
      },
      {
        cost: 300,
        label: 'Shatter Field',
        description: '+50% damage aura, +range',
        apply: (tower) => {
          tower._auraMultiplier = 1.5;
          tower.range += 30;
        },
      },
    ],
  },

  cappuccino_assassino: {
    tier1: {
      cost: 120,
      label: 'Sharper Aim',
      description: '+20 damage, +20 range',
      apply: (tower) => {
        tower.damage += 20;
        tower.range += 20;
      },
    },
    branchA: [
      {
        cost: 200,
        label: 'Espresso Letale',
        description: '10% instakill on non-bosses',
        apply: (tower) => {
          tower._instakillChance = 0.1;
        },
      },
      {
        cost: 400,
        label: 'Death Shot',
        description: '20% instakill, +50 damage',
        apply: (tower) => {
          tower._instakillChance = 0.2;
          tower.damage += 50;
        },
      },
    ],
    branchB: [
      {
        cost: 200,
        label: 'Perfora Armatura',
        description: 'Ignores enemy armor',
        apply: (tower) => {
          tower._armorPierce = true;
        },
      },
      {
        cost: 400,
        label: 'Penetrating Round',
        description: 'Armor pierce + hits 2 enemies',
        apply: (tower) => {
          tower._pierceCount = 2;
          tower.damage += 30;
        },
      },
    ],
  },

  tang_tang_keletang: {
    tier1: {
      cost: 100,
      label: 'Focused Lens',
      description: '+5 DPS, +15 range',
      apply: (tower) => {
        tower.beamDamagePerSecond += 5;
        tower.range += 15;
      },
    },
    branchA: [
      {
        cost: 175,
        label: 'Raggio Concentrato',
        description: 'Beam ramps damage on same target (+50%/s)',
        apply: (tower) => {
          tower._rampDamage = true;
          tower._rampRate = 0.5;
        },
      },
      {
        cost: 350,
        label: 'Melt Beam',
        description: 'Ramp to +200%/s, +10 base DPS',
        apply: (tower) => {
          tower._rampRate = 2.0;
          tower.beamDamagePerSecond += 10;
        },
      },
    ],
    branchB: [
      {
        cost: 175,
        label: 'Luce Diffusa',
        description: 'Beam hits all enemies in a line',
        apply: (tower) => {
          tower._wideBeam = true;
          tower._beamWidth = 20;
        },
      },
      {
        cost: 350,
        label: 'Devastation Ray',
        description: 'Wider beam, +15 DPS',
        apply: (tower) => {
          tower._beamWidth = 40;
          tower.beamDamagePerSecond += 15;
        },
      },
    ],
  },
};
