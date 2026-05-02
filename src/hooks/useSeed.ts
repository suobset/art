import { useCallback, useState } from 'react'
import { randomSeed } from '../lib/random'

export function useSeed(initialSeed = randomSeed()) {
  const [seed, setSeed] = useState(initialSeed)
  const remix = useCallback(() => setSeed(randomSeed()), [])
  return { seed, setSeed, remix }
}
