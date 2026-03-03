import { TILE_SIZE, GRID_COLS, GRID_ROWS, TILE_COLORS } from '../data/mapLevel1.js';

export class MinimapRenderer {
  constructor(grid) {
    this.grid = grid;
    this.scale = 4; // each tile = 4px on minimap
    this.width = GRID_COLS * this.scale;
    this.height = GRID_ROWS * this.scale;
    this.padding = 8;
  }

  render(ctx, canvasWidth, canvasHeight, enemies, towers) {
    const x = canvasWidth - this.width - this.padding;
    const y = canvasHeight - 60 - this.height - this.padding;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x - 2, y - 2, this.width + 4, this.height + 4);

    // Tiles
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const tile = this.grid[row][col];
        ctx.fillStyle = TILE_COLORS[tile] || TILE_COLORS[0];
        ctx.fillRect(
          x + col * this.scale,
          y + row * this.scale,
          this.scale,
          this.scale
        );
      }
    }

    // Tower dots
    for (const tower of towers) {
      ctx.fillStyle = tower.color;
      const tx = x + (tower.x / TILE_SIZE) * this.scale;
      const ty = y + (tower.y / TILE_SIZE) * this.scale;
      ctx.fillRect(tx - 1, ty - 1, 3, 3);
    }

    // Enemy dots
    for (const enemy of enemies) {
      if (!enemy.active) continue;
      ctx.fillStyle = enemy.isBoss ? '#ff0' : '#f00';
      const ex = x + (enemy.x / TILE_SIZE) * this.scale;
      const ey = y + (enemy.y / TILE_SIZE) * this.scale;
      const s = enemy.isBoss ? 3 : 2;
      ctx.fillRect(ex - s/2, ey - s/2, s, s);
    }

    // Border
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 2, y - 2, this.width + 4, this.height + 4);

    // Label
    ctx.fillStyle = '#888';
    ctx.font = '9px monospace';
    ctx.fillText('MINIMAP', x, y - 5);
  }
}
