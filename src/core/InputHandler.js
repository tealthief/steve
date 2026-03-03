import { TILE_SIZE } from '../data/mapLevel1.js';

export class InputHandler {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.game = game;
    this.mouseX = 0;
    this.mouseY = 0;
    this.placingTowerType = null;

    canvas.addEventListener('click', (e) => this._onClick(e));
    canvas.addEventListener('mousemove', (e) => this._onMouseMove(e));
    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this._onRightClick(e);
    });
  }

  _getCanvasPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  _onClick(e) {
    const pos = this._getCanvasPos(e);

    // Check if click is in the HUD areas (don't propagate to game)
    if (pos.y < 36) {
      this._handleTopBarClick(pos);
      return;
    }
    if (pos.y > this.canvas.height - 60) {
      this._handleShopBarClick(pos);
      return;
    }

    // Check if clicking on an existing tower to select it
    const clickedTower = this.game.towerManager.selectAt(pos.x, pos.y);
    if (clickedTower) {
      this.placingTowerType = null;
      return;
    }

    // If placing a tower, try to place it
    if (this.placingTowerType) {
      this.game.tryPlaceTower(pos.x, pos.y);
      return;
    }
  }

  _handleTopBarClick(pos) {
    // Speed buttons area (around x=450-530)
    // Check for speed button clicks
    const speedBtns = [
      { x: 530, w: 30, speed: 1 },
      { x: 565, w: 30, speed: 2 },
      { x: 600, w: 30, speed: 3 },
    ];
    for (const btn of speedBtns) {
      if (pos.x >= btn.x && pos.x <= btn.x + btn.w) {
        this.game.loop.setSpeed(btn.speed);
        return;
      }
    }
  }

  _handleShopBarClick(pos) {
    // Tower shop buttons
    const shopStartX = 10;
    const towerTypes = Object.values(this.game.constructor._TOWER_TYPES || {});
    // Fallback: use the keys from the game's selectedTowerType
    // This is a bit hacky but avoids circular imports
  }

  _onMouseMove(e) {
    const pos = this._getCanvasPos(e);
    this.mouseX = pos.x;
    this.mouseY = pos.y;

    // Don't update hover when in HUD areas
    if (pos.y > 36 && pos.y < this.canvas.height - 60) {
      this.game.towerManager.updateHover(pos.x, pos.y);
    }
  }

  _onRightClick(e) {
    this.placingTowerType = null;
    this.game.towerManager.selectedTower = null;
  }

  startPlacing(towerType) {
    this.placingTowerType = towerType;
  }

  renderPlacementPreview(ctx) {
    if (!this.placingTowerType) return;

    // Don't show preview in HUD areas
    if (this.mouseY < 36 || this.mouseY > this.canvas.height - 60) return;

    const col = Math.floor(this.mouseX / TILE_SIZE);
    const row = Math.floor(this.mouseY / TILE_SIZE);
    const canPlace = this.game.tileGrid.canPlace(col, row);

    const px = col * TILE_SIZE;
    const py = row * TILE_SIZE;

    // Tile highlight
    ctx.fillStyle = canPlace ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)';
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

    // Range preview
    if (canPlace && this.placingTowerType.range) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, this.placingTowerType.range, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Ghost tower preview
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = this.placingTowerType.color || '#3498db';
      ctx.fillRect(px + 8, py + 8, TILE_SIZE - 16, TILE_SIZE - 16);
      ctx.globalAlpha = 1;
    }
  }
}
