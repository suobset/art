export function randomSeed() {
  return Math.floor(Math.random() * 1000000)
}

export function createSeededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randomBetween(generator: () => number, min: number, max: number) {
  return min + (max - min) * generator()
}

export function pickOne<T>(generator: () => number, items: T[]) {
  return items[Math.floor(generator() * items.length)]
}
