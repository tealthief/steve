import { Enemy } from '../entities/enemies/Enemy.js';
import { enemyDefs } from '../data/enemyDefs.js';

export class EnemyManager {
  constructor(pathSystem, bus) {
    this.pathSystem = pathSystem;
    this.bus = bus;
    this.enemies = [];
    this._splitQueue = []; // enemies to spawn from splits
  }

  spawn(enemyDef, pathName) {
    if (!pathName) {
      pathName = this.pathSystem.assignPath();
    }
    const waypoints = this.pathSystem.getWaypoints(pathName);
    const enemy = new Enemy(enemyDef, waypoints);
    enemy.pathName = pathName;
    this.enemies.push(enemy);
    return enemy;
  }

  // Spawn a split enemy at a specific position along the path
  spawnAt(enemyDef, pathName, x, y, waypointIndex, distanceTraveled) {
    const waypoints = this.pathSystem.getWaypoints(pathName);
    const enemy = new Enemy(enemyDef, waypoints);
    enemy.pathName = pathName;
    enemy.x = x;
    enemy.y = y;
    enemy.waypointIndex = waypointIndex;
    enemy.distanceTraveled = distanceTraveled;
    this.enemies.push(enemy);
    return enemy;
  }

  update(delta) {
    for (const enemy of this.enemies) {
      if (!enemy.active) continue;

      enemy.update(delta, this); // pass self for healer interactions

      if (enemy.reachedEnd && enemy.active) {
        enemy.active = false;
        this.bus.emit('enemy:leaked', enemy);
      }
    }

    // Check for killed enemies
    for (const enemy of this.enemies) {
      if (!enemy.active && !enemy.reachedEnd && !enemy._deathEmitted) {
        enemy._deathEmitted = true;
        this.bus.emit('enemy:killed', enemy);

        // Handle split on death
        if (enemy.splitOnDeath && enemy.splitType) {
          const splitDef = enemyDefs[enemy.splitType];
          if (splitDef) {
            for (let i = 0; i < enemy.splitCount; i++) {
              const offsetX = (Math.random() - 0.5) * 20;
              const offsetY = (Math.random() - 0.5) * 20;
              this._splitQueue.push({
                def: splitDef,
                pathName: enemy.pathName,
                x: enemy.x + offsetX,
                y: enemy.y + offsetY,
                waypointIndex: enemy.waypointIndex,
                distanceTraveled: enemy.distanceTraveled,
              });
            }
          }
        }
      }
    }

    // Process split queue
    for (const split of this._splitQueue) {
      this.spawnAt(split.def, split.pathName, split.x, split.y, split.waypointIndex, split.distanceTraveled);
    }
    this._splitQueue = [];

    // Remove dead/leaked enemies
    this.enemies = this.enemies.filter(e => e.active);
  }

  render(ctx) {
    for (const enemy of this.enemies) {
      enemy.render(ctx);
    }
  }

  get aliveCount() {
    return this.enemies.length;
  }

  getEnemiesInRange(x, y, range) {
    const rangeSq = range * range;
    return this.enemies.filter(e => {
      const dx = e.x - x;
      const dy = e.y - y;
      return e.active && (dx * dx + dy * dy) <= rangeSq;
    });
  }

  getFurthestInRange(x, y, range) {
    const inRange = this.getEnemiesInRange(x, y, range);
    if (inRange.length === 0) return null;
    return inRange.reduce((best, e) =>
      e.distanceTraveled > best.distanceTraveled ? e : best
    );
  }
}
