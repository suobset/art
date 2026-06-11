import { useEffect, useMemo, useRef, useState } from 'react'
import { ImmersiveDemo } from '../components/ImmersiveDemo'
import { Parameter } from '../components/Parameter'
import { SeedControls } from '../components/SeedControls'
import { useAnimationFrame } from '../hooks/useAnimationFrame'
import { useResizeObserver } from '../hooks/useResizeObserver'
import { useSeed } from '../hooks/useSeed'
import { setupHiDpiCanvas } from '../lib/canvas'
import { palettes, type PaletteName } from '../lib/color'
import type { DemoComponentProps } from '../lib/demoTypes'
import { createSeededRandom, randomBetween } from '../lib/random'

type AttractorName = 'lorenz' | 'aizawa' | 'halvorsen' | 'thomas' | 'three-scroll'

const attractors: AttractorName[] = ['lorenz', 'aizawa', 'halvorsen', 'thomas', 'three-scroll']
const moods = Object.keys(palettes) as PaletteName[]

type Vec3 = { x: number; y: number; z: number }

function step(name: AttractorName, p: Vec3, dt: number): Vec3 {
  if (name === 'lorenz') {
    const sigma = 10
    const rho = 28
    const beta = 8 / 3
    const dx = sigma * (p.y - p.x)
    const dy = p.x * (rho - p.z) - p.y
    const dz = p.x * p.y - beta * p.z
    return { x: p.x + dx * dt, y: p.y + dy * dt, z: p.z + dz * dt }
  }
  if (name === 'aizawa') {
    const a = 0.95
    const b = 0.7
    const c = 0.6
    const d = 3.5
    const e = 0.25
    const f = 0.1
    const dx = (p.z - b) * p.x - d * p.y
    const dy = d * p.x + (p.z - b) * p.y
    const dz = c + a * p.z - (p.z * p.z * p.z) / 3 - (p.x * p.x + p.y * p.y) * (1 + e * p.z) + f * p.z * p.x * p.x * p.x
    return { x: p.x + dx * dt, y: p.y + dy * dt, z: p.z + dz * dt }
  }
  if (name === 'halvorsen') {
    const a = 1.4
    const dx = -a * p.x - 4 * p.y - 4 * p.z - p.y * p.y
    const dy = -a * p.y - 4 * p.z - 4 * p.x - p.z * p.z
    const dz = -a * p.z - 4 * p.x - 4 * p.y - p.x * p.x
    return { x: p.x + dx * dt, y: p.y + dy * dt, z: p.z + dz * dt }
  }
  if (name === 'thomas') {
    const b = 0.208186
    const dx = Math.sin(p.y) - b * p.x
    const dy = Math.sin(p.z) - b * p.y
    const dz = Math.sin(p.x) - b * p.z
    return { x: p.x + dx * dt, y: p.y + dy * dt, z: p.z + dz * dt }
  }
  // three-scroll (Pan-Xu-Zhou)
  const a = 40
  const b = 0.833
  const c = 20
  const d = 0.5
  const e = 0.65
  const dx = a * (p.y - p.x) + d * p.x * p.z
  const dy = c * p.x - p.x * p.z + e * p.y
  const dz = b * p.z + p.x * p.y - p.x * p.x
  return { x: p.x + dx * dt, y: p.y + dy * dt, z: p.z + dz * dt }
}

const attractorScales: Record<AttractorName, { scale: number; dt: number; warmup: number }> = {
  lorenz: { scale: 0.025, dt: 0.006, warmup: 80 },
  aizawa: { scale: 0.5, dt: 0.01, warmup: 200 },
  halvorsen: { scale: 0.12, dt: 0.004, warmup: 80 },
  thomas: { scale: 0.18, dt: 0.04, warmup: 80 },
  'three-scroll': { scale: 0.012, dt: 0.001, warmup: 80 },
}

export function AttractorDemo({ reducedMotion }: DemoComponentProps) {
  const [attractor, setAttractor] = useState<AttractorName>('lorenz')
  const [mood, setMood] = useState<PaletteName>('moss')
  const [stepsPerFrame, setStepsPerFrame] = useState(280)
  const [trail, setTrail] = useState(0.08)
  const [lineWidth, setLineWidth] = useState(0.9)
  const [autoOrbit, setAutoOrbit] = useState(true)
  const [streams, setStreams] = useState(3)

  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const box = useResizeObserver(container)
  const { seed, remix } = useSeed()

  const rotationRef = useRef({ x: -0.42, y: 0.72 })
  const targetRotRef = useRef({ x: -0.42, y: 0.72 })
  const dragRef = useRef({ active: false, lastX: 0, lastY: 0 })
  const pointsRef = useRef<Vec3[]>([])
  const tailRef = useRef<Array<{ x: number; y: number; z: number; t: number }[]>>([])

  const palette = palettes[mood]

  const initialState = useMemo(() => {
    const random = createSeededRandom(seed + (attractor.length << 8))
    const arr: Vec3[] = []
    for (let i = 0; i < streams; i += 1) {
      arr.push({
        x: randomBetween(random, -0.1, 0.1) + (attractor === 'aizawa' ? 0.1 : 0.4),
        y: randomBetween(random, -0.1, 0.1) + 0.1,
        z: randomBetween(random, -0.1, 0.1) + (attractor === 'aizawa' ? 0.1 : 0.4),
      })
    }
    return arr
  }, [seed, attractor, streams])

  useEffect(() => {
    pointsRef.current = initialState.map((p) => ({ ...p }))
    tailRef.current = initialState.map(() => [])
    const { warmup } = attractorScales[attractor]
    for (let s = 0; s < streams; s += 1) {
      let pt = pointsRef.current[s]
      for (let i = 0; i < warmup * 6; i += 1) {
        pt = step(attractor, pt, attractorScales[attractor].dt)
      }
      pointsRef.current[s] = pt
    }
  }, [initialState, attractor, streams])

  useAnimationFrame(
    (_, elapsed) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const width = Math.max(box.width, 320)
      const height = Math.max(box.height, 360)
      const context = setupHiDpiCanvas(canvas, width, height)
      if (!context) return

      const drag = dragRef.current
      const rot = rotationRef.current
      const tgt = targetRotRef.current
      if (!drag.active && autoOrbit && !reducedMotion) {
        tgt.y += 0.0028
        tgt.x += Math.sin(elapsed * 0.00015) * 0.0009
      }
      rot.x += (tgt.x - rot.x) * 0.06
      rot.y += (tgt.y - rot.y) * 0.06

      context.fillStyle = `rgba(4, 3, 10, ${reducedMotion ? 0.5 : trail})`
      context.fillRect(0, 0, width, height)

      const sinX = Math.sin(rot.x)
      const cosX = Math.cos(rot.x)
      const sinY = Math.sin(rot.y)
      const cosY = Math.cos(rot.y)
      const { scale, dt } = attractorScales[attractor]
      const cx = width / 2
      const cy = height / 2
      const baseScale = Math.min(width, height) * 0.42
      const fov = 3.2
      const iterations = reducedMotion ? Math.min(40, stepsPerFrame) : stepsPerFrame

      context.lineCap = 'round'
      context.globalCompositeOperation = 'lighter'

      for (let s = 0; s < streams; s += 1) {
        let pt = pointsRef.current[s]
        if (!pt) continue
        const tail = tailRef.current[s]
        const color = palette[s % palette.length]

        for (let i = 0; i < iterations; i += 1) {
          const next = step(attractor, pt, dt)
          pt = next
          tail.push({ x: pt.x, y: pt.y, z: pt.z, t: (elapsed + i) * 0.001 })
          if (tail.length > 1400) tail.shift()
        }

        if (tail.length < 2) {
          pointsRef.current[s] = pt
          continue
        }

        context.lineWidth = lineWidth
        context.beginPath()
        let pen = false
        for (let i = 0; i < tail.length; i += 1) {
          const point = tail[i]
          const sx = point.x * scale
          const sy = point.y * scale
          const sz = point.z * scale
          const y1 = sy * cosX - sz * sinX
          const z1 = sy * sinX + sz * cosX
          const x2 = sx * cosY + z1 * sinY
          const z2 = -sx * sinY + z1 * cosY
          const depth = z2 + fov
          if (depth < 0.1) {
            pen = false
            continue
          }
          const persp = fov / depth
          const px = cx + x2 * baseScale * persp
          const py = cy + y1 * baseScale * persp
          if (!pen) {
            context.moveTo(px, py)
            pen = true
          } else {
            context.lineTo(px, py)
          }
        }
        const lastZ = tail[tail.length - 1].z * scale
        const alpha = Math.max(0.18, Math.min(1, 0.4 + lastZ * 0.15))
        context.strokeStyle = `${color}cc`
        context.globalAlpha = alpha
        context.stroke()
        pointsRef.current[s] = pt
      }
      context.globalAlpha = 1
      context.globalCompositeOperation = 'source-over'
    },
    box.width > 0,
  )

  return (
    <ImmersiveDemo
      caption={`${attractor} · ${streams} stream${streams === 1 ? '' : 's'} · ${stepsPerFrame} integration steps per frame`}
      controls={
        <>
          <Parameter label="attractor">
            <select value={attractor} onChange={(event) => setAttractor(event.target.value as AttractorName)} className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]">
              {attractors.map((option) => <option key={option} value={option} className="bg-[#120f15]">{option}</option>)}
            </select>
          </Parameter>
          <Parameter label="palette">
            <select value={mood} onChange={(event) => setMood(event.target.value as PaletteName)} className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]">
              {moods.map((option) => <option key={option} value={option} className="bg-[#120f15]">{option}</option>)}
            </select>
          </Parameter>
          <Parameter label="streams" value={String(streams)}>
            <input type="range" min="1" max="6" step="1" value={streams} onChange={(event) => setStreams(Number(event.target.value))} />
          </Parameter>
          <Parameter label="integration speed" value={String(stepsPerFrame)}>
            <input type="range" min="40" max="800" step="20" value={stepsPerFrame} onChange={(event) => setStepsPerFrame(Number(event.target.value))} />
          </Parameter>
          <Parameter label="trail fade" value={trail.toFixed(2)}>
            <input type="range" min="0.02" max="0.5" step="0.01" value={trail} onChange={(event) => setTrail(Number(event.target.value))} />
          </Parameter>
          <Parameter label="line width" value={lineWidth.toFixed(1)}>
            <input type="range" min="0.4" max="3" step="0.1" value={lineWidth} onChange={(event) => setLineWidth(Number(event.target.value))} />
          </Parameter>
          <div className="instrument-panel flex flex-wrap gap-2 px-3 py-3">
            <button type="button" onClick={() => setAutoOrbit((value) => !value)} className="control-button" data-variant={autoOrbit ? 'primary' : undefined}>
              {autoOrbit ? 'auto-orbit on' : 'auto-orbit off'}
            </button>
            <SeedControls seed={seed} onRandomize={remix} />
          </div>
          <p className="text-sm text-[var(--soft)] sm:col-span-2 lg:col-span-3 xl:col-span-4">Drag inside the frame to orbit through phase space. Each line is the future of one starting point — visibly different forever, even when the rule is exactly the same.</p>
        </>
      }
    >
      <div
        ref={setContainer}
        className="relative h-full w-full cursor-grab select-none active:cursor-grabbing"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          dragRef.current = { active: true, lastX: event.clientX, lastY: event.clientY }
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current
          if (!drag.active) return
          const dx = event.clientX - drag.lastX
          const dy = event.clientY - drag.lastY
          targetRotRef.current.y += dx * 0.008
          targetRotRef.current.x += dy * 0.008
          drag.lastX = event.clientX
          drag.lastY = event.clientY
        }}
        onPointerUp={() => { dragRef.current.active = false }}
        onPointerCancel={() => { dragRef.current.active = false }}
        onPointerLeave={() => { dragRef.current.active = false }}
        style={{
          background: 'radial-gradient(circle at 30% 50%, rgba(80,30,120,0.32), transparent 55%), radial-gradient(circle at 80% 30%, rgba(60,170,200,0.22), transparent 55%), #04030a',
        }}
      >
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
    </ImmersiveDemo>
  )
}
