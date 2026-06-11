import { useEffect, useMemo, useRef, useState } from 'react'
import { ImmersiveDemo } from '../components/ImmersiveDemo'
import { Parameter } from '../components/Parameter'
import { SeedControls } from '../components/SeedControls'
import { useAnimationFrame } from '../hooks/useAnimationFrame'
import { useResizeObserver } from '../hooks/useResizeObserver'
import { useSeed } from '../hooks/useSeed'
import { setupHiDpiCanvas } from '../lib/canvas'
import type { DemoComponentProps } from '../lib/demoTypes'
import { createSeededRandom, randomBetween } from '../lib/random'

type FlockPalette = 'starling' | 'monarch' | 'plasma' | 'frost'
type PointerMode = 'attract' | 'flee' | 'silent'

type Boid = {
  x: number
  y: number
  vx: number
  vy: number
  hue: number
  flock: number
}

const palettes: Record<FlockPalette, string[]> = {
  starling: ['#f6efdd', '#d2c5ad', '#ff7a59', '#d6f16c', '#79d7ef'],
  monarch: ['#ff7a59', '#ff9b41', '#ffd166', '#ef476f', '#3b1f0a'],
  plasma: ['#ff5fd2', '#cf8cff', '#79d7ef', '#d6f16c', '#fff38a'],
  frost: ['#bfeaff', '#79d7ef', '#a3a3ff', '#ffffff', '#5b6a8c'],
}

const palettes_keys: FlockPalette[] = ['starling', 'monarch', 'plasma', 'frost']
const pointerModes: PointerMode[] = ['attract', 'flee', 'silent']

export function MurmurationDemo({ reducedMotion }: DemoComponentProps) {
  const [palette, setPalette] = useState<FlockPalette>('starling')
  const [count, setCount] = useState(220)
  const [flocks, setFlocks] = useState(2)
  const [pointerMode, setPointerMode] = useState<PointerMode>('attract')
  const [maxSpeed, setMaxSpeed] = useState(3)
  const [separation, setSeparation] = useState(1.4)
  const [alignment, setAlignment] = useState(1)
  const [cohesion, setCohesion] = useState(0.9)
  const [trail, setTrail] = useState(0.12)
  const [showTrails, setShowTrails] = useState(true)

  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const box = useResizeObserver(container)
  const { seed, remix } = useSeed()

  const boidsRef = useRef<Boid[]>([])
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false })

  useEffect(() => {
    const random = createSeededRandom(seed)
    const width = Math.max(box.width, 400)
    const height = Math.max(box.height, 400)
    const next: Boid[] = []
    for (let i = 0; i < count; i += 1) {
      next.push({
        x: randomBetween(random, 0, width),
        y: randomBetween(random, 0, height),
        vx: randomBetween(random, -1, 1) * 2,
        vy: randomBetween(random, -1, 1) * 2,
        hue: random(),
        flock: Math.floor(random() * flocks),
      })
    }
    boidsRef.current = next
  }, [count, flocks, seed, box.width, box.height])

  useAnimationFrame(
    (delta) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const width = Math.max(box.width, 320)
      const height = Math.max(box.height, 320)
      const context = setupHiDpiCanvas(canvas, width, height)
      if (!context) return

      if (showTrails) {
        context.fillStyle = `rgba(6, 5, 12, ${reducedMotion ? 0.6 : trail})`
        context.fillRect(0, 0, width, height)
      } else {
        context.fillStyle = '#06050c'
        context.fillRect(0, 0, width, height)
      }

      const boids = boidsRef.current
      const dt = Math.min(2, delta / 16)
      const perceptionRadius = 64
      const separationRadius = 22

      // simple spatial hash to make N^2 not catastrophic
      const cellSize = perceptionRadius
      const cols = Math.max(1, Math.ceil(width / cellSize))
      const rows = Math.max(1, Math.ceil(height / cellSize))
      const grid: number[][] = new Array(cols * rows)
      for (let i = 0; i < grid.length; i += 1) grid[i] = []
      for (let i = 0; i < boids.length; i += 1) {
        const b = boids[i]
        const cx = Math.max(0, Math.min(cols - 1, Math.floor(b.x / cellSize)))
        const cy = Math.max(0, Math.min(rows - 1, Math.floor(b.y / cellSize)))
        grid[cy * cols + cx].push(i)
      }

      const colors = palettes[palette]
      const pointer = pointerRef.current

      for (let i = 0; i < boids.length; i += 1) {
        const b = boids[i]
        const cx = Math.max(0, Math.min(cols - 1, Math.floor(b.x / cellSize)))
        const cy = Math.max(0, Math.min(rows - 1, Math.floor(b.y / cellSize)))

        let alignX = 0, alignY = 0, alignCount = 0
        let cohX = 0, cohY = 0, cohCount = 0
        let sepX = 0, sepY = 0

        for (let yy = -1; yy <= 1; yy += 1) {
          for (let xx = -1; xx <= 1; xx += 1) {
            const nx = cx + xx
            const ny = cy + yy
            if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue
            const cellBoids = grid[ny * cols + nx]
            for (let k = 0; k < cellBoids.length; k += 1) {
              const j = cellBoids[k]
              if (j === i) continue
              const other = boids[j]
              const dx = other.x - b.x
              const dy = other.y - b.y
              const distSq = dx * dx + dy * dy
              if (distSq > perceptionRadius * perceptionRadius) continue
              if (other.flock === b.flock) {
                alignX += other.vx
                alignY += other.vy
                alignCount += 1
                cohX += other.x
                cohY += other.y
                cohCount += 1
              }
              if (distSq < separationRadius * separationRadius && distSq > 0.0001) {
                const dist = Math.sqrt(distSq)
                sepX -= dx / dist
                sepY -= dy / dist
              }
            }
          }
        }

        let ax = 0
        let ay = 0
        if (alignCount > 0) {
          alignX /= alignCount
          alignY /= alignCount
          const mag = Math.hypot(alignX, alignY) || 1
          alignX = (alignX / mag) * maxSpeed - b.vx
          alignY = (alignY / mag) * maxSpeed - b.vy
          ax += alignX * 0.05 * alignment
          ay += alignY * 0.05 * alignment
        }
        if (cohCount > 0) {
          cohX = cohX / cohCount - b.x
          cohY = cohY / cohCount - b.y
          const mag = Math.hypot(cohX, cohY) || 1
          cohX = (cohX / mag) * maxSpeed - b.vx
          cohY = (cohY / mag) * maxSpeed - b.vy
          ax += cohX * 0.03 * cohesion
          ay += cohY * 0.03 * cohesion
        }
        const sepMag = Math.hypot(sepX, sepY)
        if (sepMag > 0.0001) {
          sepX = (sepX / sepMag) * maxSpeed - b.vx
          sepY = (sepY / sepMag) * maxSpeed - b.vy
          ax += sepX * 0.08 * separation
          ay += sepY * 0.08 * separation
        }

        if (pointer.active && pointerMode !== 'silent') {
          const dx = pointer.x - b.x
          const dy = pointer.y - b.y
          const distSq = dx * dx + dy * dy
          if (distSq < 320 * 320 && distSq > 0.001) {
            const dist = Math.sqrt(distSq)
            const sign = pointerMode === 'flee' ? -1 : 1
            const strength = (1 - dist / 320) * 0.42 * sign
            ax += (dx / dist) * strength
            ay += (dy / dist) * strength
          }
        }

        b.vx += ax * dt
        b.vy += ay * dt
        const speed = Math.hypot(b.vx, b.vy)
        if (speed > maxSpeed) {
          b.vx = (b.vx / speed) * maxSpeed
          b.vy = (b.vy / speed) * maxSpeed
        } else if (speed < maxSpeed * 0.35) {
          const boost = (maxSpeed * 0.35) / Math.max(speed, 0.01)
          b.vx *= boost
          b.vy *= boost
        }

        b.x += b.vx * dt * (reducedMotion ? 0.35 : 1)
        b.y += b.vy * dt * (reducedMotion ? 0.35 : 1)
        if (b.x < -10) b.x = width + 10
        if (b.x > width + 10) b.x = -10
        if (b.y < -10) b.y = height + 10
        if (b.y > height + 10) b.y = -10

        const color = colors[b.flock % colors.length]
        const heading = Math.atan2(b.vy, b.vx)
        const size = 4 + speed * 0.6
        context.save()
        context.translate(b.x, b.y)
        context.rotate(heading)
        context.fillStyle = color
        context.globalAlpha = 0.85
        context.beginPath()
        context.moveTo(size, 0)
        context.lineTo(-size * 0.7, size * 0.55)
        context.lineTo(-size * 0.4, 0)
        context.lineTo(-size * 0.7, -size * 0.55)
        context.closePath()
        context.fill()
        context.restore()
      }
      context.globalAlpha = 1

      if (pointer.active) {
        const radius = pointerMode === 'flee' ? 30 : 24
        context.strokeStyle = pointerMode === 'flee' ? 'rgba(255, 110, 110, 0.7)' : 'rgba(255, 240, 180, 0.7)'
        context.lineWidth = 1.5
        context.beginPath()
        context.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2)
        context.stroke()
      }
    },
    box.width > 0,
  )

  const summary = useMemo(
    () => `${count} birds across ${flocks} flock${flocks === 1 ? '' : 's'} · pointer ${pointerMode} · separation ${separation.toFixed(2)} / alignment ${alignment.toFixed(2)} / cohesion ${cohesion.toFixed(2)}`,
    [count, flocks, pointerMode, separation, alignment, cohesion],
  )

  return (
    <ImmersiveDemo
      caption={summary}
      controls={
        <>
          <Parameter label="palette">
            <select value={palette} onChange={(event) => setPalette(event.target.value as FlockPalette)} className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]">
              {palettes_keys.map((option) => <option key={option} value={option} className="bg-[#120f15]">{option}</option>)}
            </select>
          </Parameter>
          <Parameter label="pointer">
            <select value={pointerMode} onChange={(event) => setPointerMode(event.target.value as PointerMode)} className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]">
              {pointerModes.map((option) => <option key={option} value={option} className="bg-[#120f15]">{option}</option>)}
            </select>
          </Parameter>
          <Parameter label="boids" value={String(count)}>
            <input type="range" min="50" max="600" step="10" value={count} onChange={(event) => setCount(Number(event.target.value))} />
          </Parameter>
          <Parameter label="flocks" value={String(flocks)}>
            <input type="range" min="1" max="4" step="1" value={flocks} onChange={(event) => setFlocks(Number(event.target.value))} />
          </Parameter>
          <Parameter label="max speed" value={maxSpeed.toFixed(1)}>
            <input type="range" min="1" max="6" step="0.1" value={maxSpeed} onChange={(event) => setMaxSpeed(Number(event.target.value))} />
          </Parameter>
          <Parameter label="separation" value={separation.toFixed(2)}>
            <input type="range" min="0" max="3" step="0.05" value={separation} onChange={(event) => setSeparation(Number(event.target.value))} />
          </Parameter>
          <Parameter label="alignment" value={alignment.toFixed(2)}>
            <input type="range" min="0" max="3" step="0.05" value={alignment} onChange={(event) => setAlignment(Number(event.target.value))} />
          </Parameter>
          <Parameter label="cohesion" value={cohesion.toFixed(2)}>
            <input type="range" min="0" max="3" step="0.05" value={cohesion} onChange={(event) => setCohesion(Number(event.target.value))} />
          </Parameter>
          <Parameter label="trail fade" value={trail.toFixed(2)}>
            <input type="range" min="0.02" max="0.5" step="0.01" value={trail} onChange={(event) => setTrail(Number(event.target.value))} />
          </Parameter>
          <div className="instrument-panel flex flex-wrap gap-2 px-3 py-3">
            <button type="button" onClick={() => setShowTrails((value) => !value)} className="control-button" data-variant={showTrails ? 'primary' : undefined}>
              {showTrails ? 'trails on' : 'trails off'}
            </button>
            <SeedControls seed={seed} onRandomize={remix} />
          </div>
          <p className="text-sm text-[var(--soft)] sm:col-span-2 lg:col-span-3 xl:col-span-4">Hover and move the pointer to attract or scare the flock. No bird knows the whole picture — they only check their neighbors.</p>
        </>
      }
    >
      <div
        ref={setContainer}
        className="relative h-full w-full cursor-crosshair"
        onPointerMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect()
          pointerRef.current = {
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top,
            active: true,
          }
        }}
        onPointerEnter={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect()
          pointerRef.current = {
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top,
            active: true,
          }
        }}
        onPointerLeave={() => { pointerRef.current.active = false }}
        style={{ background: 'linear-gradient(180deg, rgba(20,12,40,0.55), rgba(8,6,16,0.95))' }}
      >
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
    </ImmersiveDemo>
  )
}
