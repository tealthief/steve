import { uid } from '../utils/uid.js';

export class Entity {
  constructor(x, y) {
    this.id = uid();
    this.x = x;
    this.y = y;
    this.active = true;
  }
}
