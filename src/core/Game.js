import { GameLoop } from './GameLoop.js';
import { EventBus } from './EventBus.js';
import { InputHandler } from './InputHandler.js';
import { GameState, State } from '../state/GameState.js';
import { PlayerState } from '../state/PlayerState.js';
import { PathSystem } from '../map/PathSystem.js';
import { TileGrid } from '../map/TileGrid.js';
import { MapRenderer } from '../map/MapRenderer.js';
import { EnemyManager } from '../systems/EnemyManager.js';
import { TowerManager } from '../systems/TowerManager.js';
import { ProjectileManager } from '../systems/ProjectileManager.js';
import { WaveSystem } from '../systems/WaveSystem.js';
import { EconomySystem } from '../systems/EconomySystem.js';
import { StatusEffectSystem } from '../systems/StatusEffectSystem.js';
import { ParticleSystem } from '../rendering/ParticleSystem.js';
import { Renderer } from '../rendering/Renderer.js';
import { MinimapRenderer } from '../rendering/MinimapRenderer.js';
import { DamageNumbers } from '../rendering/DamageNumbers.js';
import { AudioManager } from './AudioManager.js';
import { BombardiroCrocodilo, BOMBARDIRO_DEF } from '../entities/towers/BombardiroCrocodilo.js';
import { BrrBrrPatapim, BRR_BRR_DEF } from '../entities/towers/BrrBrrPatapim.js';
import { CappuccinoAssassino, CAPPUCCINO_DEF } from '../entities/towers/CappuccinoAssassino.js';
import { TangTangKeletang, TANG_TANG_DEF } from '../entities/towers/TangTangKeletang.js';
import { grid, paths, TILE_SIZE } from '../data/mapLevel1.js';
import { waves } from '../data/waves.js';
import { towerUpgrades } from '../data/towerDefs.js';

// Tower type registry
const TOWER_TYPES = {
  bombardiro_crocodilo: { def: BOMBARDIRO_DEF, cls: BombardiroCrocodilo, key: 'q' },
  brr_brr_patapim: { def: BRR_BRR_DEF, cls: BrrBrrPatapim, key: 'w' },
  cappuccino_assassino: { def: CAPPUCCINO_DEF, cls: CappuccinoAssassino, key: 'e' },
  tang_tang_keletang: { def: TANG_TANG_DEF, cls: TangTangKeletang, key: 'r' },
};

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Event bus
    this.bus = new EventBus();

    // State
    this.gameState = new GameState(this.bus);
    this.player = new PlayerState(this.bus);

    // Map
    this.pathSystem = new PathSystem(paths);
    this.tileGrid = new TileGrid(grid);
    this.mapRenderer = new MapRenderer(this.ctx, grid);

    // Systems
    this.enemyManager = new EnemyManager(this.pathSystem, this.bus);
    this.towerManager = new TowerManager(this.tileGrid, this.bus);
    this.projectileManager = new ProjectileManager();
    this.particleSystem = new ParticleSystem();
    this.statusEffects = new StatusEffectSystem();
    this.waveSystem = new WaveSystem(waves, this.enemyManager, this.pathSystem, this.bus);
    this.economySystem = new EconomySystem(this.player, this.bus);

    // Rendering
    this.renderer = new Renderer(this.ctx, canvas);
    this.minimapRenderer = new MinimapRenderer(grid);
    this.damageNumbers = new DamageNumbers();
    this.audio = new AudioManager();

    // Input
    this.input = new InputHandler(canvas, this);
    this.selectedTowerType = TOWER_TYPES.bombardiro_crocodilo;

    // Game loop
    this.loop = new GameLoop(
      (delta) => this.update(delta),
      () => this.render()
    );

    // Wire events
    this.bus.on('enemy:leaked', (enemy) => {
      this.player.takeDamage(enemy.damageOnLeak);
    });

    this.bus.on('player:dead', () => {
      this.gameState.transition(State.GAMEOVER);
      this.audio.gameOver();
    });

    this.bus.on('enemy:killed', (enemy) => {
      this.particleSystem.spawn(enemy.x, enemy.y, enemy.color, 8);
      this.damageNumbers.add(enemy.x, enemy.y - 15, enemy.bounty, '#f1c40f');
      this.audio.enemyDeath();
      if (enemy.isBoss) {
        this.renderer.shake(8, 500);
      }
    });

    this.bus.on('wave:complete', ({ wave }) => {
      const income = this.economySystem.grantWaveIncome(wave);
      this._incomePopup = { amount: income, timer: 2000 };
      this.audio.waveComplete();
    });

    this.bus.on('game:win', () => {
      this.gameState.transition(State.WIN);
      this.audio.victory();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this._onKeyDown(e));

    // Start placing first tower type
    this.input.startPlacing(this.selectedTowerType.def);

    this._incomePopup = null;
    this._waveBanner = null;

    this.bus.on('wave:start', ({ wave }) => {
      this._waveBanner = { wave, timer: 2000 };
      this.audio.waveStart();
    });
  }

  start() {
    this.gameState.transition(State.BUILD);
    this.waveSystem.startBuildPhase();
    this.loop.start();
  }

  tryPlaceTower(px, py) {
    const { col, row } = this.tileGrid.pixelToTile(px, py);
    if (!this.tileGrid.canPlace(col, row)) return false;
    if (!this.player.canAfford(this.selectedTowerType.def.cost)) return false;

    this.player.spendGold(this.selectedTowerType.def.cost);

    const TowerClass = this.selectedTowerType.cls;
    const tower = new TowerClass(col, row, this.tileGrid);
    tower.wire(this.projectileManager, this.enemyManager, this.particleSystem);
    tower._renderer = this.renderer;
    tower._audio = this.audio;
    this.towerManager.addTower(tower);
    this.audio.towerPlace();
    return true;
  }

  sellSelectedTower() {
    const tower = this.towerManager.selectedTower;
    if (!tower) return;
    this.player.earnGold(tower.getSellValue());
    this.towerManager.removeTower(tower);
    this.towerManager.selectedTower = null;
    this.audio.towerSell();
  }

  upgradeTower(branch) {
    const tower = this.towerManager.selectedTower;
    if (!tower) return false;

    const upgrades = towerUpgrades[tower.type];
    if (!upgrades) return false;

    // Tier 1 not purchased yet
    if (!tower.tier1Purchased) {
      if (!this.player.canAfford(upgrades.tier1.cost)) return false;
      this.player.spendGold(upgrades.tier1.cost);
      tower.totalSpent += upgrades.tier1.cost;
      upgrades.tier1.apply(tower);
      tower.tier1Purchased = true;
      return true;
    }

    // Branch upgrade
    if (tower.lockedBranch && tower.lockedBranch !== branch) return false;
    if (!tower.lockedBranch) tower.lockedBranch = branch;

    const branchUpgrades = branch === 'A' ? upgrades.branchA : upgrades.branchB;
    if (tower.branchLevel >= branchUpgrades.length) return false;

    const upgrade = branchUpgrades[tower.branchLevel];
    if (!this.player.canAfford(upgrade.cost)) return false;

    this.player.spendGold(upgrade.cost);
    tower.totalSpent += upgrade.cost;
    upgrade.apply(tower);
    tower.branchLevel++;
    return true;
  }

  getNextUpgrade(tower, branch) {
    const upgrades = towerUpgrades[tower.type];
    if (!upgrades) return null;

    if (!tower.tier1Purchased) return upgrades.tier1;

    if (tower.lockedBranch && tower.lockedBranch !== branch) return null;

    const branchUpgrades = branch === 'A' ? upgrades.branchA : upgrades.branchB;
    if (tower.branchLevel >= branchUpgrades.length) return null;
    return branchUpgrades[tower.branchLevel];
  }

  _selectTowerType(type) {
    this.selectedTowerType = type;
    this.input.startPlacing(type.def);
    this.towerManager.selectedTower = null;
  }

  _onKeyDown(e) {
    // Send wave
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (this.waveSystem.isBuilding) {
        this.waveSystem.sendWaveEarly();
      }
    }

    // Tower selection
    for (const [, towerType] of Object.entries(TOWER_TYPES)) {
      if (e.key === towerType.key) {
        this._selectTowerType(towerType);
        return;
      }
    }

    // Speed controls with function keys
    if (e.key === 'F1') { e.preventDefault(); this.loop.setSpeed(1); }
    if (e.key === 'F2') { e.preventDefault(); this.loop.setSpeed(2); }
    if (e.key === 'F3') { e.preventDefault(); this.loop.setSpeed(3); }

    // Mute toggle
    if (e.key === 'm') {
      this.audio.toggle();
    }

    // Sell selected tower
    if (e.key === 's' || e.key === 'Delete') {
      this.sellSelectedTower();
    }

    // Upgrade selected tower
    if (e.key === 'u') {
      // Try tier1, then branch A
      if (this.towerManager.selectedTower && !this.towerManager.selectedTower.tier1Purchased) {
        this.upgradeTower('A'); // tier1 doesn't care about branch
      }
    }
    if (e.key === 'a') this.upgradeTower('A');
    if (e.key === 'd') this.upgradeTower('B');
  }

  update(delta) {
    if (this.gameState.is(State.GAMEOVER)) return;
    if (this.gameState.is(State.WIN)) return;

    // Update wave system
    this.waveSystem.update(delta);

    // Update game state based on wave state
    if (this.waveSystem.isBuilding && !this.gameState.is(State.BUILD)) {
      this.gameState.transition(State.BUILD);
    } else if (this.waveSystem.isActive && !this.gameState.is(State.WAVE)) {
      this.gameState.transition(State.WAVE);
    }

    // Update systems
    this.enemyManager.update(delta);
    this.statusEffects.updateAll(this.enemyManager.enemies, delta);
    this.towerManager.update(delta, this.enemyManager);
    this.projectileManager.update(delta);
    this.particleSystem.update(delta);
    this.damageNumbers.update(delta);
    this.renderer.updateShake(delta);

    // Update popups
    if (this._incomePopup) {
      this._incomePopup.timer -= delta;
      if (this._incomePopup.timer <= 0) this._incomePopup = null;
    }
    if (this._waveBanner) {
      this._waveBanner.timer -= delta;
      if (this._waveBanner.timer <= 0) this._waveBanner = null;
    }
  }

  render() {
    this.renderer.clear();

    // Apply screen shake
    const wasShaking = this.renderer.applyShake();

    // Draw map
    this.mapRenderer.render();

    // Draw towers
    this.towerManager.render(this.ctx);

    // Draw enemies
    this.enemyManager.render(this.ctx);

    // Draw projectiles
    this.projectileManager.render(this.ctx);

    // Draw particles
    this.particleSystem.render(this.ctx);

    // Draw damage numbers
    this.damageNumbers.render(this.ctx);

    // Remove shake before UI
    this.renderer.removeShake(wasShaking);

    // Draw placement preview
    this.input.renderPlacementPreview(this.ctx);

    // Draw minimap
    this.minimapRenderer.render(
      this.ctx, this.canvas.width, this.canvas.height,
      this.enemyManager.enemies, this.towerManager.towers
    );

    // Draw HUD
    this._renderHUD();
  }

  _renderHUD() {
    const ctx = this.ctx;

    // Top bar background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.canvas.width, 36);

    ctx.font = 'bold 14px monospace';

    // Wave info
    ctx.fillStyle = '#ecf0f1';
    ctx.fillText(`Wave: ${this.waveSystem.currentWave}/${this.waveSystem.totalWaves}`, 10, 24);

    // HP bar
    const hpBarX = 170;
    const hpBarW = 120;
    const hpRatio = this.player.hp / this.player.maxHp;
    ctx.fillStyle = '#333';
    ctx.fillRect(hpBarX, 10, hpBarW, 16);
    const hpColor = hpRatio > 0.5 ? '#2ecc71' : hpRatio > 0.25 ? '#f39c12' : '#e74c3c';
    ctx.fillStyle = hpColor;
    ctx.fillRect(hpBarX, 10, hpBarW * hpRatio, 16);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.strokeRect(hpBarX, 10, hpBarW, 16);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.player.hp}/${this.player.maxHp}`, hpBarX + hpBarW / 2, 22);
    ctx.textAlign = 'left';

    // Gold
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#f1c40f';
    ctx.fillText(`Gold: ${this.player.gold}`, 310, 24);

    // Speed buttons (clickable)
    const speeds = [1, 2, 3];
    for (let i = 0; i < speeds.length; i++) {
      const bx = 530 + i * 35;
      const isActive = this.loop.speedMultiplier === speeds[i];
      ctx.fillStyle = isActive ? '#3498db' : 'rgba(255,255,255,0.15)';
      ctx.fillRect(bx, 7, 28, 22);
      ctx.fillStyle = isActive ? '#fff' : '#aaa';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${speeds[i]}x`, bx + 14, 22);
      ctx.textAlign = 'left';
    }

    // Enemies count
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#ecf0f1';
    ctx.fillText(`Foes: ${this.enemyManager.aliveCount}`, 450, 24);

    // Tower shop bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, this.canvas.height - 60, this.canvas.width, 60);

    const shopY = this.canvas.height - 50;
    const towerTypes = Object.values(TOWER_TYPES);
    const shopStartX = 10;

    for (let i = 0; i < towerTypes.length; i++) {
      const t = towerTypes[i];
      const bx = shopStartX + i * 160;
      const isSelected = this.selectedTowerType === t;
      const canAfford = this.player.canAfford(t.def.cost);

      // Button background
      ctx.fillStyle = isSelected ? 'rgba(52, 152, 219, 0.4)' : 'rgba(255,255,255,0.1)';
      if (!canAfford) ctx.fillStyle = 'rgba(100,100,100,0.2)';
      ctx.fillRect(bx, shopY - 5, 150, 40);

      if (isSelected) {
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, shopY - 5, 150, 40);
      }

      // Tower color swatch
      ctx.fillStyle = canAfford ? t.def.color : '#555';
      ctx.fillRect(bx + 5, shopY + 2, 20, 20);

      // Name and cost
      ctx.fillStyle = canAfford ? '#ecf0f1' : '#666';
      ctx.font = '11px monospace';
      ctx.fillText(`[${t.key.toUpperCase()}] ${t.def.name.split(' ')[0]}`, bx + 30, shopY + 8);
      ctx.fillStyle = canAfford ? '#f1c40f' : '#666';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`${t.def.cost}g`, bx + 30, shopY + 22);
    }

    // Controls help
    ctx.fillStyle = '#666';
    ctx.font = '11px monospace';
    const muteLabel = this.audio.enabled ? 'Sound ON' : 'Sound OFF';
    ctx.fillText(`Space: send wave | [M]ute: ${muteLabel}`, 660, shopY + 8);
    ctx.fillText('Click tower: select | S: sell | A/D: upgrade', 660, shopY + 22);

    // Build phase countdown
    if (this.waveSystem.isBuilding) {
      const seconds = Math.ceil(this.waveSystem.buildTimeRemaining / 1000);

      ctx.fillStyle = 'rgba(46, 204, 113, 0.15)';
      ctx.fillRect(0, 36, this.canvas.width, 26);

      ctx.fillStyle = '#2ecc71';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        `BUILD PHASE - Wave ${this.waveSystem.currentWave + 1} in ${seconds}s | SPACE to send`,
        this.canvas.width / 2,
        53
      );
      ctx.textAlign = 'left';
    }

    // Income popup
    if (this._incomePopup) {
      const alpha = Math.min(1, this._incomePopup.timer / 500);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#f1c40f';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      const yOffset = (1 - alpha) * 30;
      ctx.fillText(`+${this._incomePopup.amount} Gold`, this.canvas.width / 2, 90 - yOffset);
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    }

    // Wave announcement banner
    if (this._waveBanner) {
      const alpha = Math.min(1, this._waveBanner.timer / 500);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, this.canvas.height / 2 - 40, this.canvas.width, 80);
      ctx.fillStyle = '#ecf0f1';
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`WAVE ${this._waveBanner.wave}`, this.canvas.width / 2, this.canvas.height / 2 + 5);

      // Show wave enemy preview for first second
      if (this._waveBanner.timer > 1000) {
        ctx.font = '14px monospace';
        ctx.fillStyle = '#bbb';
        ctx.fillText('Enemies incoming!', this.canvas.width / 2, this.canvas.height / 2 + 28);
      }

      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    }

    // Selected tower panel (right side)
    this._renderTowerPanel(ctx);

    // Game over overlay
    if (this.gameState.is(State.GAMEOVER)) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.fillStyle = '#e74c3c';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
      ctx.font = '20px monospace';
      ctx.fillStyle = '#ecf0f1';
      ctx.fillText(`Survived ${this.waveSystem.currentWave} waves`, this.canvas.width / 2, this.canvas.height / 2 + 40);
      ctx.textAlign = 'left';
    }

    // Win overlay
    if (this.gameState.is(State.WIN)) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.fillStyle = '#2ecc71';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('VICTORY!', this.canvas.width / 2, this.canvas.height / 2);
      ctx.font = '20px monospace';
      ctx.fillStyle = '#f1c40f';
      ctx.fillText('All 20 waves cleared!', this.canvas.width / 2, this.canvas.height / 2 + 40);
      ctx.textAlign = 'left';
    }
  }

  _renderTowerPanel(ctx) {
    const tower = this.towerManager.selectedTower;
    if (!tower) return;

    const panelX = this.canvas.width - 220;
    const panelY = 45;
    const panelW = 210;
    const panelH = 260;

    // Panel background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.strokeRect(panelX, panelY, panelW, panelH);

    let y = panelY + 18;
    const x = panelX + 10;

    // Tower name
    ctx.fillStyle = tower.color;
    ctx.font = 'bold 13px monospace';
    ctx.fillText(tower.name, x, y);
    y += 18;

    // Stats
    ctx.fillStyle = '#bbb';
    ctx.font = '11px monospace';
    ctx.fillText(`Damage: ${Math.floor(tower.damage)}`, x, y); y += 14;
    ctx.fillText(`Range: ${tower.range}`, x, y); y += 14;
    ctx.fillText(`Cooldown: ${tower.cooldown}ms`, x, y); y += 14;
    if (tower.splashRadius) {
      ctx.fillText(`Splash: ${tower.splashRadius}`, x, y); y += 14;
    }
    if (tower.beamDamagePerSecond) {
      ctx.fillText(`Beam DPS: ${tower.beamDamagePerSecond}`, x, y); y += 14;
    }

    y += 6;

    // Upgrades
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('UPGRADES', x, y);
    y += 16;

    if (!tower.tier1Purchased) {
      const upg = this.getNextUpgrade(tower, 'A');
      if (upg) {
        const canAfford = this.player.canAfford(upg.cost);
        ctx.fillStyle = canAfford ? '#2ecc71' : '#666';
        ctx.font = '11px monospace';
        ctx.fillText(`[U] ${upg.label} (${upg.cost}g)`, x, y); y += 12;
        ctx.fillStyle = '#888';
        ctx.font = '10px monospace';
        ctx.fillText(upg.description, x, y); y += 16;
      }
    } else {
      // Branch selection
      for (const branch of ['A', 'B']) {
        const upg = this.getNextUpgrade(tower, branch);
        const locked = tower.lockedBranch && tower.lockedBranch !== branch;

        if (locked) {
          ctx.fillStyle = '#444';
          ctx.font = '10px monospace';
          ctx.fillText(`Branch ${branch}: LOCKED`, x, y); y += 14;
        } else if (upg) {
          const canAfford = this.player.canAfford(upg.cost);
          ctx.fillStyle = canAfford ? '#2ecc71' : '#666';
          ctx.font = '11px monospace';
          const key = branch === 'A' ? 'A' : 'D';
          ctx.fillText(`[${key}] ${upg.label} (${upg.cost}g)`, x, y); y += 12;
          ctx.fillStyle = '#888';
          ctx.font = '10px monospace';
          ctx.fillText(upg.description, x, y); y += 16;
        } else {
          ctx.fillStyle = '#f1c40f';
          ctx.font = '10px monospace';
          ctx.fillText(`Branch ${branch}: MAX`, x, y); y += 14;
        }
      }
    }

    y += 6;

    // Sell button
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`[S] Sell for ${tower.getSellValue()}g`, x, y);
  }
}
