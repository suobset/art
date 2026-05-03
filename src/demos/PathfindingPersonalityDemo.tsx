import { useEffect, useMemo, useState } from 'react'
import { DemoControls } from '../components/DemoControls'
import { Parameter } from '../components/Parameter'
import type { DemoComponentProps } from '../lib/demoTypes'
import { createSeededRandom } from '../lib/random'

type Algorithm = 'bfs' | 'dfs' | 'dijkstra' | 'astar'
type CellType = 'empty' | 'wall' | 'start' | 'end' | 'visited' | 'path'
type Point = { x: number; y: number }

type SearchState = {
  visitedOrder: Point[]
  path: Point[]
}

const columns = 20
const rows = 12

function makeMaze(density: number) {
  const random = createSeededRandom(Date.now())
  return Array.from({ length: rows }, (_, y) =>
    Array.from({ length: columns }, (_, x) => {
      if ((x === 1 && y === 1) || (x === columns - 2 && y === rows - 2)) return false
      return random() < density
    }),
  )
}

function neighbors(point: Point) {
  return [
    { x: point.x + 1, y: point.y },
    { x: point.x - 1, y: point.y },
    { x: point.x, y: point.y + 1 },
    { x: point.x, y: point.y - 1 },
  ].filter((item) => item.x >= 0 && item.x < columns && item.y >= 0 && item.y < rows)
}

function key(point: Point) {
  return `${point.x},${point.y}`
}

function heuristic(a: Point, b: Point) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

function reconstruct(cameFrom: Map<string, string>, end: Point) {
  const path: Point[] = []
  let cursor = key(end)
  while (cameFrom.has(cursor)) {
    const [x, y] = cursor.split(',').map(Number)
    path.unshift({ x, y })
    cursor = cameFrom.get(cursor)!
  }
  return path
}

function search(algorithm: Algorithm, walls: boolean[][], start: Point, end: Point, heuristicStrength: number): SearchState {
  const visitedOrder: Point[] = []
  const visited = new Set<string>()
  const cameFrom = new Map<string, string>()

  if (algorithm === 'dfs') {
    const stack = [start]
    while (stack.length > 0) {
      const current = stack.pop()!
      const currentKey = key(current)
      if (visited.has(currentKey)) continue
      visited.add(currentKey)
      visitedOrder.push(current)
      if (currentKey === key(end)) return { visitedOrder, path: reconstruct(cameFrom, end) }
      neighbors(current).reverse().forEach((next) => {
        if (walls[next.y][next.x] || visited.has(key(next))) return
        cameFrom.set(key(next), currentKey)
        stack.push(next)
      })
    }
    return { visitedOrder, path: [] }
  }

  const frontier: Array<{ point: Point; cost: number; priority: number }> = [{ point: start, cost: 0, priority: 0 }]
  const bestCost = new Map<string, number>([[key(start), 0]])

  while (frontier.length > 0) {
    frontier.sort((a, b) => a.priority - b.priority)
    const current = algorithm === 'bfs' ? frontier.shift()! : frontier.shift()!
    const currentKey = key(current.point)
    if (visited.has(currentKey)) continue
    visited.add(currentKey)
    visitedOrder.push(current.point)
    if (currentKey === key(end)) {
      return { visitedOrder, path: reconstruct(cameFrom, end) }
    }
    neighbors(current.point).forEach((next) => {
      if (walls[next.y][next.x]) return
      const nextKey = key(next)
      const cost = current.cost + 1
      const known = bestCost.get(nextKey)
      if (known !== undefined && cost >= known) return
      bestCost.set(nextKey, cost)
      cameFrom.set(nextKey, currentKey)
      const priority = algorithm === 'astar' ? cost + heuristic(next, end) * heuristicStrength : algorithm === 'dijkstra' ? cost : frontier.length
      frontier.push({ point: next, cost, priority })
    })
  }

  return { visitedOrder, path: [] }
}

export function PathfindingPersonalityDemo({ reducedMotion }: DemoComponentProps) {
  const [algorithm, setAlgorithm] = useState<Algorithm>('astar')
  const [mazeDensity, setMazeDensity] = useState(0.24)
  const [heuristicStrength, setHeuristicStrength] = useState(1)
  const [speed, setSpeed] = useState(80)
  const [walls, setWalls] = useState<boolean[][]>(() => makeMaze(0.24))
  const [start, setStart] = useState<Point>({ x: 1, y: 1 })
  const [end, setEnd] = useState<Point>({ x: columns - 2, y: rows - 2 })
  const [playing, setPlaying] = useState(true)
  const [dragging, setDragging] = useState<'start' | 'end' | null>(null)
  const [stepIndex, setStepIndex] = useState(0)

  const result = useMemo(() => search(algorithm, walls, start, end, heuristicStrength), [algorithm, walls, start, end, heuristicStrength])

  useEffect(() => {
    if (!playing || reducedMotion) return
    const timer = window.setInterval(() => {
      setStepIndex((index) => {
        const max = result.visitedOrder.length + result.path.length
        return index >= max ? index : index + 1
      })
    }, speed)
    return () => window.clearInterval(timer)
  }, [playing, reducedMotion, result, speed])

  const visitedSlice = result.visitedOrder.slice(0, Math.min(stepIndex, result.visitedOrder.length))
  const pathSlice = stepIndex > result.visitedOrder.length ? result.path.slice(0, stepIndex - result.visitedOrder.length) : []
  const visitedSet = new Set(visitedSlice.map(key))
  const pathSet = new Set(pathSlice.map(key))

  return (
    <DemoControls
      actions={
        <>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setPlaying((value) => !value)} className="rounded-full border border-[var(--line)] px-3 py-2 text-sm text-[var(--text)]">
              {playing ? 'pause' : 'run'}
            </button>
            <button type="button" onClick={() => setStepIndex((index) => index + 1)} className="rounded-full border border-[var(--line)] px-3 py-2 text-sm text-[var(--text)]">
              step
            </button>
            <button type="button" onClick={() => { setWalls(makeMaze(mazeDensity)); setStepIndex(0) }} className="rounded-full border border-[var(--line)] px-3 py-2 text-sm text-[var(--text)]">
              regenerate maze
            </button>
            <button type="button" onClick={() => { setWalls(makeMaze(mazeDensity)); setStart({ x: 1, y: 1 }); setEnd({ x: columns - 2, y: rows - 2 }); setStepIndex(0) }} className="rounded-full border border-[var(--line)] px-3 py-2 text-sm text-[var(--text)]">
              reset
            </button>
          </div>
          <Parameter label="algorithm">
            <select value={algorithm} onChange={(event) => { setAlgorithm(event.target.value as Algorithm); setStepIndex(0) }} className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2">
              <option value="bfs" className="bg-[#120f15]">bfs</option>
              <option value="dfs" className="bg-[#120f15]">dfs</option>
              <option value="dijkstra" className="bg-[#120f15]">dijkstra</option>
              <option value="astar" className="bg-[#120f15]">a*</option>
            </select>
          </Parameter>
          <Parameter label="maze density" value={mazeDensity.toFixed(2)}>
            <input type="range" min="0.1" max="0.42" step="0.02" value={mazeDensity} onChange={(event) => setMazeDensity(Number(event.target.value))} />
          </Parameter>
          <Parameter label="heuristic strength" value={heuristicStrength.toFixed(1)}>
            <input type="range" min="0" max="2" step="0.1" value={heuristicStrength} onChange={(event) => { setHeuristicStrength(Number(event.target.value)); setStepIndex(0) }} />
          </Parameter>
          <Parameter label="speed" value={`${speed}ms`}>
            <input type="range" min="30" max="200" step="10" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} />
          </Parameter>
          <p className="text-sm text-[var(--soft)]">Drag the start or end tile. Click or drag across cells to draw walls and compare search temperaments.</p>
        </>
      }
    >
      <div className="grid w-full gap-[2px] rounded-[1.25rem] bg-black/20 p-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: rows }, (_, y) =>
          Array.from({ length: columns }, (_, x) => {
            const current = { x, y }
            const cellKey = key(current)
            let type: CellType = 'empty'
            if (walls[y][x]) type = 'wall'
            if (visitedSet.has(cellKey)) type = 'visited'
            if (pathSet.has(cellKey)) type = 'path'
            if (x === start.x && y === start.y) type = 'start'
            if (x === end.x && y === end.y) type = 'end'
            const styles: Record<CellType, string> = {
              empty: '#161118',
              wall: '#4a2b3d',
              visited: '#6be3ff',
              path: '#d8ff62',
              start: '#ff7a59',
              end: '#ffd166',
            }
            return (
              <button
                key={cellKey}
                type="button"
                aria-label={`${type} tile at ${x + 1}, ${y + 1}`}
                onPointerDown={() => {
                  if (x === start.x && y === start.y) {
                    setDragging('start')
                    return
                  }
                  if (x === end.x && y === end.y) {
                    setDragging('end')
                    return
                  }
                  setWalls((currentWalls) => {
                    const next = currentWalls.map((row) => [...row])
                    next[y][x] = !next[y][x]
                    return next
                  })
                  setStepIndex(0)
                }}
                onPointerEnter={(event) => {
                  if (dragging === 'start') {
                    setStart({ x, y })
                    setStepIndex(0)
                    return
                  }
                  if (dragging === 'end') {
                    setEnd({ x, y })
                    setStepIndex(0)
                    return
                  }
                  if (event.buttons === 1) {
                    setWalls((currentWalls) => {
                      const next = currentWalls.map((row) => [...row])
                      if ((x === start.x && y === start.y) || (x === end.x && y === end.y)) return next
                      next[y][x] = true
                      return next
                    })
                    setStepIndex(0)
                  }
                }}
                onPointerUp={() => setDragging(null)}
                onKeyDown={(event) => {
                  if (event.key === ' ' || event.key === 'Enter') {
                    event.preventDefault()
                    setWalls((currentWalls) => {
                      const next = currentWalls.map((row) => [...row])
                      next[y][x] = !next[y][x]
                      return next
                    })
                    setStepIndex(0)
                  }
                }}
                className="aspect-square rounded-[4px]"
                style={{ background: styles[type] }}
              />
            )
          }),
        )}
      </div>
    </DemoControls>
  )
}
