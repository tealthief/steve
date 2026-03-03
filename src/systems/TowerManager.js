import { TILE_SIZE } from '../data/mapLevel1.js';

export class TowerManager {
  constructor(tileGrid, bus) {
    this.tileGrid = tileGrid;
    this.bus = bus;
    this.towers = [];
    this.selectedTower = null;
    this.hoveredTower = null;
  }

  addTower(tower) {
    this.towers.push(tower);
    this.bus.emit('tower:placed', tower);
  }

  removeTower(tower) {
    const idx = this.towers.indexOf(tower);
    if (idx !== -1) {
      this.towers.splice(idx, 1);
      this.tileGrid.remove(tower.col, tower.row);
      this.bus.emit('tower:sold', tower);
    }
  }

  update(delta, enemyManager) {
    for (const tower of this.towers) {
      tower.update(delta, enemyManager);
    }
  }

  render(ctx) {
    for (const tower of this.towers) {
      tower.render(ctx);
    }

    // Show range of selected/hovered tower
    const show = this.selectedTower || this.hoveredTower;
    if (show) {
      show.renderRange(ctx);
    }
  }

  getTowerAt(col, row) {
    return this.towers.find(t => t.col === col && t.row === row);
  }

  selectAt(px, py) {
    const { col, row } = this.tileGrid.pixelToTile(px, py);
    const tower = this.getTowerAt(col, row);
    this.selectedTower = tower || null;
    return tower;
  }

  updateHover(px, py) {
    const { col, row } = this.tileGrid.pixelToTile(px, py);
    this.hoveredTower = this.getTowerAt(col, row);
  }
}
