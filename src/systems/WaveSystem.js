import { enemyDefs } from '../data/enemyDefs.js';

export class WaveSystem {
  constructor(waveDefs, enemyManager, pathSystem, bus) {
    this.waveDefs = waveDefs;
    this.enemyManager = enemyManager;
    this.pathSystem = pathSystem;
    this.bus = bus;

    this.currentWave = 0;
    this.totalWaves = waveDefs.length;
    this.state = 'idle'; // 'idle' | 'build' | 'spawning' | 'active' | 'complete'

    this.buildTimer = 0;
    this.buildDuration = 0;

    this.spawnGroups = [];
    this.allSpawned = false;
    this.totalSpawnedThisWave = 0;
  }

  startBuildPhase() {
    if (this.currentWave >= this.totalWaves) {
      this.state = 'complete';
      this.bus.emit('game:win');
      return;
    }

    this.state = 'build';
    const waveDef = this.waveDefs[this.currentWave];
    this.buildDuration = waveDef.buildTime;
    this.buildTimer = 0;
    this.bus.emit('wave:build_start', {
      wave: this.currentWave + 1,
      totalWaves: this.totalWaves,
      buildTime: this.buildDuration,
    });
  }

  sendWaveEarly() {
    if (this.state !== 'build') return;
    this.startWave();
  }

  startWave() {
    const waveDef = this.waveDefs[this.currentWave];
    this.currentWave++;
    this.state = 'spawning';
    this.allSpawned = false;
    this.totalSpawnedThisWave = 0;

    // Set up spawn groups with timers
    this.spawnGroups = waveDef.groups.map(g => ({
      type: g.type,
      count: g.count,
      interval: g.interval,
      delay: g.delay,
      branch: g.branch,
      spawned: 0,
      delayTimer: g.delay,
      intervalTimer: 0,
    }));

    this.bus.emit('wave:start', {
      wave: this.currentWave,
      totalWaves: this.totalWaves,
    });
  }

  update(delta) {
    if (this.state === 'build') {
      this.buildTimer += delta;
      if (this.buildTimer >= this.buildDuration) {
        this.startWave();
      }
      return;
    }

    if (this.state === 'spawning') {
      this._updateSpawning(delta);

      // Check if all groups are done spawning
      if (this.spawnGroups.every(g => g.spawned >= g.count)) {
        this.allSpawned = true;
        this.state = 'active';
      }
    }

    if (this.state === 'active' || this.state === 'spawning') {
      // Check if wave is complete (all spawned and all dead)
      if (this.allSpawned && this.enemyManager.aliveCount === 0) {
        this.state = 'idle';
        this.bus.emit('wave:complete', { wave: this.currentWave });

        if (this.currentWave >= this.totalWaves) {
          this.state = 'complete';
          this.bus.emit('game:win');
        } else {
          this.startBuildPhase();
        }
      }
    }
  }

  _updateSpawning(delta) {
    for (const group of this.spawnGroups) {
      if (group.spawned >= group.count) continue;

      // Wait for initial delay
      if (group.delayTimer > 0) {
        group.delayTimer -= delta;
        continue;
      }

      group.intervalTimer += delta;
      while (group.intervalTimer >= group.interval && group.spawned < group.count) {
        this._spawnEnemy(group);
        group.spawned++;
        group.intervalTimer -= group.interval;
        this.totalSpawnedThisWave++;
      }
    }
  }

  _spawnEnemy(group) {
    const def = enemyDefs[group.type];
    if (!def) {
      console.warn(`Unknown enemy type: ${group.type}`);
      return;
    }

    let pathName;
    if (group.branch === 'alternate') {
      pathName = this.pathSystem.assignPath();
    } else {
      pathName = group.branch;
    }

    this.enemyManager.spawn(def, pathName);
  }

  get buildTimeRemaining() {
    if (this.state !== 'build') return 0;
    return Math.max(0, this.buildDuration - this.buildTimer);
  }

  get isBuilding() {
    return this.state === 'build';
  }

  get isActive() {
    return this.state === 'spawning' || this.state === 'active';
  }
}
