import { useEffect, useMemo, useState } from 'react'
import { DemoControls } from '../components/DemoControls'
import { Parameter } from '../components/Parameter'
import type { DemoComponentProps } from '../lib/demoTypes'
import { createSeededRandom } from '../lib/random'

const columns = 42
const rows = 24

const presets = {
  life: { birth: '3', survival: '23' },
  bloom: { birth: '34', survival: '34' },
  coral: { birth: '3', survival: '45678' },
  caves: { birth: '678', survival: '345678' },
} as const

type PresetName = keyof typeof presets

type Cell = 0 | 1

function makeWorld(fill = 0): Cell[][] {
  return Array.from({ length: rows }, () => Array.from({ length: columns }, () => fill as Cell))
}

function randomWorld(seed = Date.now()) {
  const random = createSeededRandom(seed)
  return Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => (random() > 0.72 ? 1 : 0) as Cell),
  )
}

function parseRule(input: string) {
  return new Set(input.split('').map((value) => Number(value)).filter((value) => Number.isInteger(value)))
}

function countNeighbors(world: Cell[][], x: number, y: number) {
  let count = 0
  for (let yy = -1; yy <= 1; yy += 1) {
    for (let xx = -1; xx <= 1; xx += 1) {
      if (xx === 0 && yy === 0) continue
      const nx = x + xx
      const ny = y + yy
      if (ny < 0 || ny >= rows || nx < 0 || nx >= columns) continue
      count += world[ny][nx]
    }
  }
  return count
}

export function CellularAutomataDemo({ reducedMotion }: DemoComponentProps) {
  const [world, setWorld] = useState<Cell[][]>(() => randomWorld())
  const [preset, setPreset] = useState<PresetName>('life')
  const [birth, setBirth] = useState(presets.life.birth)
  const [survival, setSurvival] = useState(presets.life.survival)
  const [speed, setSpeed] = useState(220)
  const [cellSize, setCellSize] = useState(14)
  const [drawMode, setDrawMode] = useState<Cell>(1)
  const [playing, setPlaying] = useState(true)

  const birthRule = useMemo(() => parseRule(birth), [birth])
  const survivalRule = useMemo(() => parseRule(survival), [survival])

  const step = () => {
    setWorld((current) =>
      current.map((row, y) =>
        row.map((cell, x) => {
          const neighbors = countNeighbors(current, x, y)
          if (cell === 1) {
            return survivalRule.has(neighbors) ? 1 : 0
          }
          return birthRule.has(neighbors) ? 1 : 0
        }) as Cell[],
      ),
    )
  }

  useEffect(() => {
    if (!playing || reducedMotion) {
      return
    }
    const timer = window.setInterval(step, speed)
    return () => window.clearInterval(timer)
  }, [playing, reducedMotion, speed, birthRule, survivalRule])

  return (
    <DemoControls
      actions={
        <>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setPlaying((value) => !value)} className="rounded-full border border-[var(--line)] px-3 py-2 text-sm text-[var(--text)]">
              {playing ? 'pause' : 'run'}
            </button>
            <button type="button" onClick={step} className="rounded-full border border-[var(--line)] px-3 py-2 text-sm text-[var(--text)]">
              step one generation
            </button>
            <button type="button" onClick={() => setWorld(randomWorld())} className="rounded-full border border-[var(--line)] px-3 py-2 text-sm text-[var(--text)]">
              randomize world
            </button>
            <button type="button" onClick={() => setWorld(makeWorld())} className="rounded-full border border-[var(--line)] px-3 py-2 text-sm text-[var(--text)]">
              reset
            </button>
          </div>
          <Parameter label="ruleset preset">
            <select
              value={preset}
              onChange={(event) => {
                const value = event.target.value as PresetName
                setPreset(value)
                setBirth(presets[value].birth)
                setSurvival(presets[value].survival)
              }}
              className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2"
            >
              {Object.keys(presets).map((name) => (
                <option key={name} value={name} className="bg-[#120f15]">
                  {name}
                </option>
              ))}
            </select>
          </Parameter>
          <Parameter label="birth values">
            <input value={birth} onChange={(event) => setBirth(event.target.value.replace(/[^0-8]/g, ''))} className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2" />
          </Parameter>
          <Parameter label="survival values">
            <input value={survival} onChange={(event) => setSurvival(event.target.value.replace(/[^0-8]/g, ''))} className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2" />
          </Parameter>
          <Parameter label="speed" value={`${speed}ms`}>
            <input type="range" min="60" max="500" step="20" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} />
          </Parameter>
          <Parameter label="cell size" value={`${cellSize}px`}>
            <input type="range" min="10" max="22" step="1" value={cellSize} onChange={(event) => setCellSize(Number(event.target.value))} />
          </Parameter>
          <Parameter label="draw or erase">
            <button type="button" onClick={() => setDrawMode((value) => (value === 1 ? 0 : 1))} className="rounded-xl border border-[var(--line)] px-3 py-2 text-left">
              {drawMode === 1 ? 'drawing live cells' : 'erasing cells'}
            </button>
          </Parameter>
          <p className="text-sm text-[var(--soft)]">Canvas description: cells turn on and off based on nearby neighbors. Drawing seeds the next weather front.</p>
        </>
      }
    >
      <div className="overflow-auto rounded-[1.25rem] bg-black/25 p-3">
        <div className="grid w-max gap-[1px]" style={{ gridTemplateColumns: `repeat(${columns}, ${cellSize}px)` }}>
          {world.flatMap((row, y) =>
            row.map((cell, x) => (
              <button
                key={`${x}-${y}`}
                type="button"
                aria-label={`cell ${x + 1}, ${y + 1}, ${cell ? 'alive' : 'dead'}`}
                onPointerDown={() => {
                  setWorld((current) => {
                    const next = current.map((line) => [...line])
                    next[y][x] = drawMode
                    return next as Cell[][]
                  })
                }}
                onPointerEnter={(event) => {
                  if (event.buttons !== 1) return
                  setWorld((current) => {
                    const next = current.map((line) => [...line])
                    next[y][x] = drawMode
                    return next as Cell[][]
                  })
                }}
                onKeyDown={(event) => {
                  if (event.key === ' ' || event.key === 'Enter') {
                    event.preventDefault()
                    setWorld((current) => {
                      const next = current.map((line) => [...line])
                      next[y][x] = next[y][x] === 1 ? 0 : 1
                      return next as Cell[][]
                    })
                  }
                }}
                className="rounded-[2px] border border-black/20 transition"
                style={{ width: `${cellSize}px`, height: `${cellSize}px`, background: cell ? '#d8ff62' : '#161118' }}
              />
            )),
          )}
        </div>
      </div>
    </DemoControls>
  )
}
