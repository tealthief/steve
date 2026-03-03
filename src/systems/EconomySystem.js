export class EconomySystem {
  constructor(player, bus) {
    this.player = player;
    this.bus = bus;

    this.bus.on('enemy:killed', (enemy) => {
      this.player.earnGold(enemy.bounty);
    });
  }

  grantWaveIncome(waveNumber) {
    // Progressive income: more gold as waves increase
    const income = 50 + Math.floor(waveNumber * 15 + Math.pow(waveNumber, 1.4) * 3);
    this.player.earnGold(income);
    return income;
  }
}
