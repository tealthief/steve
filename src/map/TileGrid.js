import { TILE, TILE_SIZE, GRID_COLS, GRID_ROWS } from '../data/mapLevel1.js';

export class TileGrid {
  constructor(gridData) {
    this.grid = gridData;
    this.occupied = Array.from({ length: GRID_ROWS }, () =>
      new Array(GRID_COLS).fill(false)
    );
  }

  getTile(col, row) {
    if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return -1;
    return this.grid[row][col];
  }

  canPlace(col, row) {
    const tile = this.getTile(col, row);
    return tile === TILE.GRASS && !this.occupied[row][col];
  }

  place(col, row) {
    this.occupied[row][col] = true;
  }

  remove(col, row) {
    this.occupied[row][col] = false;
  }

  pixelToTile(px, py) {
    return {
      col: Math.floor(px / TILE_SIZE),
      row: Math.floor(py / TILE_SIZE),
    };
  }

  tileToPixel(col, row) {
    return {
      x: col * TILE_SIZE + TILE_SIZE / 2,
      y: row * TILE_SIZE + TILE_SIZE / 2,
    };
  }
}
