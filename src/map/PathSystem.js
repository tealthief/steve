import { TILE_SIZE } from '../data/mapLevel1.js';
import { dist } from '../utils/math.js';

export class PathSystem {
  constructor(pathsData) {
    // Convert tile coords to pixel coords (center of tile)
    this.paths = {};
    for (const [name, waypoints] of Object.entries(pathsData)) {
      this.paths[name] = waypoints.map(wp => ({
        x: wp.x * TILE_SIZE + TILE_SIZE / 2,
        y: wp.y * TILE_SIZE + TILE_SIZE / 2,
      }));
    }
    this.pathNames = Object.keys(this.paths);
    this._assignIndex = 0;
  }

  getWaypoints(pathName) {
    return this.paths[pathName];
  }

  assignPath() {
    // Alternate between paths
    const name = this.pathNames[this._assignIndex % this.pathNames.length];
    this._assignIndex++;
    return name;
  }

  getStartPosition(pathName) {
    const wp = this.paths[pathName];
    return { x: wp[0].x, y: wp[0].y };
  }

  getTotalPathLength(pathName) {
    const wp = this.paths[pathName];
    let total = 0;
    for (let i = 1; i < wp.length; i++) {
      total += dist(wp[i - 1].x, wp[i - 1].y, wp[i].x, wp[i].y);
    }
    return total;
  }
}
