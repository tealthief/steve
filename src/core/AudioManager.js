// Simple Web Audio API synthesizer for retro sound effects
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.3;
  }

  _ensure() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  _playTone(freq, duration, type = 'square', volume = this.volume) {
    if (!this.enabled) return;
    this._ensure();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.ctx.currentTime + duration);

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration);
  }

  _playNoise(duration, volume = this.volume * 0.5) {
    if (!this.enabled) return;
    this._ensure();

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - i / bufferSize);
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    source.connect(gain);
    gain.connect(this.ctx.destination);
    source.start(this.ctx.currentTime);
  }

  shoot() {
    this._playTone(800, 0.08, 'square', this.volume * 0.3);
  }

  explode() {
    this._playNoise(0.3, this.volume * 0.4);
    this._playTone(100, 0.2, 'sawtooth', this.volume * 0.3);
  }

  freeze() {
    this._playTone(2000, 0.15, 'sine', this.volume * 0.2);
    this._playTone(1500, 0.1, 'sine', this.volume * 0.15);
  }

  snipe() {
    this._playTone(1200, 0.05, 'square', this.volume * 0.4);
    this._playTone(200, 0.1, 'square', this.volume * 0.2);
  }

  beam() {
    this._playTone(400, 0.05, 'sine', this.volume * 0.1);
  }

  enemyDeath() {
    this._playTone(300, 0.1, 'square', this.volume * 0.2);
    this._playTone(200, 0.15, 'square', this.volume * 0.15);
  }

  towerPlace() {
    this._playTone(500, 0.05, 'square', this.volume * 0.3);
    this._playTone(700, 0.05, 'square', this.volume * 0.3);
  }

  towerSell() {
    this._playTone(600, 0.08, 'square', this.volume * 0.2);
    this._playTone(400, 0.1, 'square', this.volume * 0.2);
  }

  waveStart() {
    this._playTone(400, 0.1, 'square', this.volume * 0.3);
    setTimeout(() => this._playTone(600, 0.1, 'square', this.volume * 0.3), 100);
    setTimeout(() => this._playTone(800, 0.15, 'square', this.volume * 0.3), 200);
  }

  waveComplete() {
    this._playTone(600, 0.1, 'square', this.volume * 0.3);
    setTimeout(() => this._playTone(800, 0.1, 'square', this.volume * 0.3), 100);
    setTimeout(() => this._playTone(1000, 0.2, 'square', this.volume * 0.3), 200);
  }

  gameOver() {
    this._playTone(400, 0.2, 'sawtooth', this.volume * 0.4);
    setTimeout(() => this._playTone(300, 0.2, 'sawtooth', this.volume * 0.4), 200);
    setTimeout(() => this._playTone(200, 0.4, 'sawtooth', this.volume * 0.4), 400);
  }

  victory() {
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => this._playTone(freq, 0.2, 'square', this.volume * 0.3), i * 150);
    });
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}
