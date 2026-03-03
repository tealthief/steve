export class ProjectileManager {
  constructor() {
    this.projectiles = [];
  }

  add(projectile) {
    this.projectiles.push(projectile);
  }

  update(delta) {
    for (const p of this.projectiles) {
      p.update(delta);
    }
    // Remove inactive
    this.projectiles = this.projectiles.filter(p => p.active);
  }

  render(ctx) {
    for (const p of this.projectiles) {
      p.render(ctx);
    }
  }
}
