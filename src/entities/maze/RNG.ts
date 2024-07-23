export class RNG {
  state: number;
  m: number = 0x80000000;
  a: number = 1103515245;
  c: number = 12345;

  constructor(seed: number) {
    this.state = seed;
  }

  nextInt() {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state;
  }

  nextFloat() {
    return this.nextInt() / (this.m - 1);
  }

  nextRange(start: number, end: number) {
    // returns in range [start, end): including start, excluding end
    // can't modulu nextInt because of weak randomness in lower bits
    const rangeSize = end - start;
    const nextInt = this.nextInt();
    const randomUnder1 = nextInt / this.m;
    return start + Math.floor(randomUnder1 * rangeSize);
  }

  choice(array: number[]) {
    return array[this.nextRange(0, array.length)];
  }
}
