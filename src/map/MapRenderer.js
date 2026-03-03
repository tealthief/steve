import { TILE, TILE_SIZE, GRID_COLS, GRID_ROWS, TILE_COLORS } from '../data/mapLevel1.js';

export class MapRenderer {
  constructor(ctx, gridData) {
    this.ctx = ctx;
    this.grid = gridData;
    // Pre-generate grass color variations for pixel art feel
    this._grassVariations = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      this._grassVariations[row] = [];
      for (let col = 0; col < GRID_COLS; col++) {
        // Seeded pseudo-random for consistent look
        const hash = (row * 31 + col * 17) % 100;
        this._grassVariations[row][col] = hash;
      }
    }
  }

  render() {
    const ctx = this.ctx;

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const tile = this.grid[row][col];
        const x = col * TILE_SIZE;
        const y = row * TILE_SIZE;

        if (tile === TILE.GRASS) {
          this._renderGrass(ctx, x, y, row, col);
        } else if (tile === TILE.PATH) {
          this._renderPath(ctx, x, y, row, col);
        } else if (tile === TILE.WATER) {
          this._renderWater(ctx, x, y);
        } else if (tile === TILE.START) {
          this._renderStart(ctx, x, y);
        } else if (tile === TILE.EXIT) {
          this._renderExit(ctx, x, y);
        }
      }
    }
  }

  _renderGrass(ctx, x, y, row, col) {
    const v = this._grassVariations[row][col];

    // Base grass color with slight variation
    if (v < 30) {
      ctx.fillStyle = '#2d5a1b';
    } else if (v < 60) {
      ctx.fillStyle = '#2a5518';
    } else if (v < 85) {
      ctx.fillStyle = '#305f1e';
    } else {
      ctx.fillStyle = '#265015';
    }
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // Occasional grass tuft details
    if (v > 90) {
      ctx.fillStyle = '#3a7025';
      ctx.fillRect(x + 12, y + 8, 2, 6);
      ctx.fillRect(x + 26, y + 20, 2, 5);
    } else if (v > 80) {
      ctx.fillStyle = '#3a7025';
      ctx.fillRect(x + 20, y + 14, 2, 4);
    }

    // Subtle grid line
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
  }

  _renderPath(ctx, x, y, row, col) {
    // Base path color
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // Path texture - small dots
    ctx.fillStyle = '#7a654a';
    const hash = (row * 13 + col * 7) % 50;
    if (hash > 20) {
      ctx.fillRect(x + 8, y + 12, 3, 3);
      ctx.fillRect(x + 24, y + 28, 2, 2);
    }
    if (hash > 35) {
      ctx.fillRect(x + 18, y + 6, 2, 2);
    }

    // Darker path edge indicators
    // Check adjacent tiles for grass to draw borders
    if (row > 0 && this.grid[row - 1][col] === TILE.GRASS) {
      ctx.fillStyle = '#6b5840';
      ctx.fillRect(x, y, TILE_SIZE, 3);
    }
    if (row < GRID_ROWS - 1 && this.grid[row + 1][col] === TILE.GRASS) {
      ctx.fillStyle = '#6b5840';
      ctx.fillRect(x, y + TILE_SIZE - 3, TILE_SIZE, 3);
    }
    if (col > 0 && this.grid[row][col - 1] === TILE.GRASS) {
      ctx.fillStyle = '#6b5840';
      ctx.fillRect(x, y, 3, TILE_SIZE);
    }
    if (col < GRID_COLS - 1 && this.grid[row][col + 1] === TILE.GRASS) {
      ctx.fillStyle = '#6b5840';
      ctx.fillRect(x + TILE_SIZE - 3, y, 3, TILE_SIZE);
    }
  }

  _renderWater(ctx, x, y) {
    ctx.fillStyle = '#1a4c7a';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // Water ripple effect
    ctx.fillStyle = '#2466a0';
    ctx.fillRect(x + 5, y + 10, 12, 2);
    ctx.fillRect(x + 20, y + 25, 10, 2);
  }

  _renderStart(ctx, x, y) {
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // Arrow pointing right
    ctx.fillStyle = '#cc4444';
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 10);
    ctx.lineTo(x + 30, y + TILE_SIZE / 2);
    ctx.lineTo(x + 8, y + 30);
    ctx.closePath();
    ctx.fill();
  }

  _renderExit(ctx, x, y) {
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // Target/exit marker
    ctx.strokeStyle = '#44cc44';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#44cc44';
    ctx.beginPath();
    ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
