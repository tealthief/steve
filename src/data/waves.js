// Wave definitions for all 20+ waves
// Each wave has groups of enemies to spawn
// group: { type, count, interval (ms), delay (ms), branch: 'upper'|'lower'|'alternate' }

export const waves = [
  // Wave 1 - Tutorial: basic grunts
  {
    number: 1,
    buildTime: 15000,
    groups: [
      { type: 'tung_tung_tung_sahur', count: 8, interval: 1200, delay: 0, branch: 'alternate' },
    ],
  },
  // Wave 2 - More grunts, faster
  {
    number: 2,
    buildTime: 15000,
    groups: [
      { type: 'tung_tung_tung_sahur', count: 12, interval: 1000, delay: 0, branch: 'alternate' },
    ],
  },
  // Wave 3 - Introduce fast enemies
  {
    number: 3,
    buildTime: 15000,
    groups: [
      { type: 'tung_tung_tung_sahur', count: 8, interval: 1000, delay: 0, branch: 'upper' },
      { type: 'lirili_larala', count: 5, interval: 800, delay: 3000, branch: 'lower' },
    ],
  },
  // Wave 4 - Swarm wave
  {
    number: 4,
    buildTime: 15000,
    groups: [
      { type: 'chimpanzini_bananini', count: 20, interval: 400, delay: 0, branch: 'alternate' },
    ],
  },
  // Wave 5 - First boss: Glorbo il Grande
  {
    number: 5,
    buildTime: 20000,
    groups: [
      { type: 'tung_tung_tung_sahur', count: 10, interval: 800, delay: 0, branch: 'alternate' },
      { type: 'glorbo_il_grande', count: 1, interval: 0, delay: 5000, branch: 'upper' },
    ],
  },
  // Wave 6 - Tanky worms
  {
    number: 6,
    buildTime: 15000,
    groups: [
      { type: 'bombardino_gusano', count: 5, interval: 2000, delay: 0, branch: 'alternate' },
      { type: 'lirili_larala', count: 8, interval: 600, delay: 1000, branch: 'alternate' },
    ],
  },
  // Wave 7 - Freeze resistant + healers
  {
    number: 7,
    buildTime: 15000,
    groups: [
      { type: 'frigo_camello', count: 8, interval: 1200, delay: 0, branch: 'upper' },
      { type: 'trippi_troppi', count: 2, interval: 3000, delay: 2000, branch: 'upper' },
    ],
  },
  // Wave 8 - Shielded brutes
  {
    number: 8,
    buildTime: 15000,
    groups: [
      { type: 'biri_biri_bam_bam', count: 8, interval: 1000, delay: 0, branch: 'alternate' },
      { type: 'tung_tung_tung_sahur', count: 10, interval: 700, delay: 0, branch: 'alternate' },
    ],
  },
  // Wave 9 - Flying enemies
  {
    number: 9,
    buildTime: 15000,
    groups: [
      { type: 'spaghettino_volante', count: 8, interval: 1000, delay: 0, branch: 'alternate' },
      { type: 'bombardino_gusano', count: 3, interval: 2500, delay: 2000, branch: 'lower' },
    ],
  },
  // Wave 10 - Second boss: Ravioli Gigantico
  {
    number: 10,
    buildTime: 25000,
    groups: [
      { type: 'biri_biri_bam_bam', count: 6, interval: 1000, delay: 0, branch: 'alternate' },
      { type: 'frigo_camello', count: 6, interval: 1000, delay: 0, branch: 'alternate' },
      { type: 'ravioli_gigantico', count: 1, interval: 0, delay: 6000, branch: 'lower' },
    ],
  },
  // Wave 11 - Dodgers
  {
    number: 11,
    buildTime: 15000,
    groups: [
      { type: 'ballerino_cactino', count: 12, interval: 800, delay: 0, branch: 'alternate' },
      { type: 'lirili_larala', count: 10, interval: 500, delay: 2000, branch: 'alternate' },
    ],
  },
  // Wave 12 - Tornado deflectors + heavy armor
  {
    number: 12,
    buildTime: 15000,
    groups: [
      { type: 'gelato_tornado', count: 8, interval: 1000, delay: 0, branch: 'upper' },
      { type: 'cannoli_blindato', count: 4, interval: 2000, delay: 0, branch: 'lower' },
    ],
  },
  // Wave 13 - Stealth wave
  {
    number: 13,
    buildTime: 15000,
    groups: [
      { type: 'pepperoni_phantasmo', count: 10, interval: 1000, delay: 0, branch: 'alternate' },
      { type: 'trippi_troppi', count: 3, interval: 2000, delay: 3000, branch: 'alternate' },
    ],
  },
  // Wave 14 - Speed rush
  {
    number: 14,
    buildTime: 15000,
    groups: [
      { type: 'espresso_veloce', count: 15, interval: 400, delay: 0, branch: 'alternate' },
    ],
  },
  // Wave 15 - Third boss: Lasagna Layerone
  {
    number: 15,
    buildTime: 30000,
    groups: [
      { type: 'cannoli_blindato', count: 6, interval: 1500, delay: 0, branch: 'alternate' },
      { type: 'trippi_troppi', count: 4, interval: 2000, delay: 0, branch: 'alternate' },
      { type: 'lasagna_layerone', count: 1, interval: 0, delay: 8000, branch: 'upper' },
    ],
  },
  // Wave 16 - Splitters
  {
    number: 16,
    buildTime: 15000,
    groups: [
      { type: 'mozzarella_elastico', count: 10, interval: 1200, delay: 0, branch: 'alternate' },
    ],
  },
  // Wave 17 - Regenerators + tower debuffers
  {
    number: 17,
    buildTime: 15000,
    groups: [
      { type: 'panettone_regenero', count: 8, interval: 1000, delay: 0, branch: 'upper' },
      { type: 'tiramisu_terrore', count: 4, interval: 2000, delay: 0, branch: 'lower' },
    ],
  },
  // Wave 18 - Everything mixed
  {
    number: 18,
    buildTime: 20000,
    groups: [
      { type: 'espresso_veloce', count: 10, interval: 500, delay: 0, branch: 'alternate' },
      { type: 'bombardino_gusano', count: 6, interval: 1500, delay: 0, branch: 'alternate' },
      { type: 'spaghettino_volante', count: 6, interval: 1000, delay: 3000, branch: 'alternate' },
      { type: 'trippi_troppi', count: 3, interval: 3000, delay: 5000, branch: 'alternate' },
    ],
  },
  // Wave 19 - Chaos wave
  {
    number: 19,
    buildTime: 20000,
    groups: [
      { type: 'cannoli_blindato', count: 8, interval: 1000, delay: 0, branch: 'upper' },
      { type: 'mozzarella_elastico', count: 8, interval: 1000, delay: 0, branch: 'lower' },
      { type: 'tiramisu_terrore', count: 5, interval: 2000, delay: 2000, branch: 'alternate' },
      { type: 'pepperoni_phantasmo', count: 8, interval: 800, delay: 4000, branch: 'alternate' },
    ],
  },
  // Wave 20 - Final boss: Risotto Finale
  {
    number: 20,
    buildTime: 30000,
    groups: [
      { type: 'chimpanzini_bananini', count: 30, interval: 300, delay: 0, branch: 'alternate' },
      { type: 'cannoli_blindato', count: 5, interval: 2000, delay: 0, branch: 'upper' },
      { type: 'panettone_regenero', count: 5, interval: 2000, delay: 0, branch: 'lower' },
      { type: 'risotto_finale', count: 1, interval: 0, delay: 10000, branch: 'lower' },
    ],
  },
];
