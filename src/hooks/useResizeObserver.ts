import { useEffect, useState } from 'react'

export function useResizeObserver<T extends HTMLElement>(element: T | null) {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!element) {
      return
    }

    const observer = new ResizeObserver(([entry]) => {
      const box = entry.contentRect
      setSize({ width: box.width, height: box.height })
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [element])

  return size
}
