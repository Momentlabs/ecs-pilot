export class KeyGenerator {
  constructor(keyString="Key-") {
    this.counter = 0;
    this.keyString=keyString;
  }

  reset() { this.counter = 0;}
  nextKey() { return this.keyString + this.counter++; }
}