export const State = {
  LOADING: 'LOADING',
  BUILD: 'BUILD',
  WAVE: 'WAVE',
  GAMEOVER: 'GAMEOVER',
  WIN: 'WIN',
};

export class GameState {
  constructor(bus) {
    this.bus = bus;
    this.current = State.LOADING;
  }

  is(state) {
    return this.current === state;
  }

  transition(newState) {
    const old = this.current;
    this.current = newState;
    this.bus.emit('state:changed', { from: old, to: newState });
  }
}
