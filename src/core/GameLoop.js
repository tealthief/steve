export class GameLoop {
  constructor(updateFn, renderFn) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
    this.lastTime = 0;
    this.speedMultiplier = 1;
    this.running = false;
    this._frame = null;
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    this._tick(this.lastTime);
  }

  stop() {
    this.running = false;
    if (this._frame) {
      cancelAnimationFrame(this._frame);
      this._frame = null;
    }
  }

  setSpeed(multiplier) {
    this.speedMultiplier = multiplier;
  }

  _tick(now) {
    if (!this.running) return;

    let rawDelta = now - this.lastTime;
    this.lastTime = now;

    // Cap delta to prevent spiral of death on tab switch
    if (rawDelta > 100) rawDelta = 100;

    const delta = rawDelta * this.speedMultiplier;

    this.updateFn(delta);
    this.renderFn();

    this._frame = requestAnimationFrame((t) => this._tick(t));
  }
}
