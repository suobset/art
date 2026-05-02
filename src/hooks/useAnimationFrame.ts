import { useEffect, useRef } from 'react'

export function useAnimationFrame(callback: (delta: number, elapsed: number) => void, active: boolean) {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!active) {
      return
    }

    let frame = 0
    let start = 0
    let previous = 0

    const loop = (time: number) => {
      if (!start) {
        start = time
        previous = time
      }
      const delta = time - previous
      previous = time
      callbackRef.current(delta, time - start)
      frame = window.requestAnimationFrame(loop)
    }

    frame = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(frame)
  }, [active])
}
