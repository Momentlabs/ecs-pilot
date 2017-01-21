export class KeyGenerator {
  constructor() {
    this.counter = 0;
  }
  reset() { this.counter = 0;}
  nextKey() { return "Key-" + this.counter++; }
}