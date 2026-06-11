import { useMemo, useRef, useState } from 'react'
import { ImmersiveDemo } from '../components/ImmersiveDemo'
import { Parameter } from '../components/Parameter'
import { SeedControls } from '../components/SeedControls'
import { useAnimationFrame } from '../hooks/useAnimationFrame'
import { useResizeObserver } from '../hooks/useResizeObserver'
import { useSeed } from '../hooks/useSeed'
import { setupHiDpiCanvas } from '../lib/canvas'
import { palettes, type PaletteName } from '../lib/color'
import type { DemoComponentProps } from '../lib/demoTypes'

type Mode = 'sphere' | 'torus' | 'spiral' | 'pollen'

const modes: Mode[] = ['sphere', 'torus', 'spiral', 'pollen']
const moods = Object.keys(palettes) as PaletteName[]

const GOLDEN_ANGLE_DEG = 137.5077640500378

function generatePoints(count: number, mode: Mode, angleDeg: number, twist: number) {
  const angleStep = (angleDeg * Math.PI) / 180
  const points: Array<{ x: number; y: number; z: number; t: number }> = new Array(count)
  if (mode === 'sphere') {
    for (let i = 0; i < count; i += 1) {
      const t = i / Math.max(count - 1, 1)
      const phi = Math.acos(1 - 2 * (i + 0.5) / count)
      const theta = i * angleStep
      points[i] = {
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(phi),
        t,
      }
    }
  } else if (mode === 'torus') {
    const majorR = 1
    const minorR = 0.36
    for (let i = 0; i < count; i += 1) {
      const t = i / Math.max(count - 1, 1)
      const theta = i * angleStep
      const phi = i * angleStep * (0.41 + twist * 0.6)
      const x = (majorR + minorR * Math.cos(phi)) * Math.cos(theta)
      const y = (majorR + minorR * Math.cos(phi)) * Math.sin(theta)
      const z = minorR * Math.sin(phi)
      points[i] = { x, y, z, t }
    }
  } else if (mode === 'spiral') {
    for (let i = 0; i < count; i += 1) {
      const t = i / Math.max(count - 1, 1)
      const radius = Math.sqrt(t) * 1.4
      const theta = i * angleStep
      const z = (t - 0.5) * (0.4 + twist * 0.9)
      points[i] = {
        x: Math.cos(theta) * radius,
        y: Math.sin(theta) * radius,
        z,
        t,
      }
    }
  } else {
    for (let i = 0; i < count; i += 1) {
      const t = i / Math.max(count - 1, 1)
      const radius = Math.sqrt(t)
      const theta = i * angleStep
      const sway = Math.sin(t * Math.PI * 2 + twist * 6) * 0.18 * twist
      points[i] = {
        x: Math.cos(theta) * radius,
        y: sway,
        z: Math.sin(theta) * radius,
        t,
      }
    }
  }
  return points
}

export function PhyllotaxisDemo({ reducedMotion }: DemoComponentProps) {
  const [mode, setMode] = useState<Mode>('sphere')
  const [count, setCount] = useState(900)
  const [angleDeg, setAngleDeg] = useState(GOLDEN_ANGLE_DEG)
  const [twist, setTwist] = useState(0.3)
  const [mood, setMood] = useState<PaletteName>('velvet')
  const [autoSpin, setAutoSpin] = useState(true)
  const [trail, setTrail] = useState(0.18)
  const [size, setSize] = useState(2.4)

  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const box = useResizeObserver(container)
  const { seed, remix } = useSeed()

  const rotationRef = useRef({ x: -0.4, y: 0.6 })
  const targetRotationRef = useRef({ x: -0.4, y: 0.6 })
  const dragRef = useRef<{ active: boolean; lastX: number; lastY: number }>({ active: false, lastX: 0, lastY: 0 })

  const palette = palettes[mood]

  const points = useMemo(
    () => generatePoints(count, mode, angleDeg, twist),
    [count, mode, angleDeg, twist],
  )

  useAnimationFrame(
    (_, elapsed) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const width = Math.max(box.width, 320)
      const height = Math.max(box.height, 360)
      const context = setupHiDpiCanvas(canvas, width, height)
      if (!context) return

      const drag = dragRef.current
      const rotation = rotationRef.current
      const target = targetRotationRef.current

      if (!drag.active && autoSpin && !reducedMotion) {
        target.y += 0.0035
        target.x += Math.sin(elapsed * 0.0002) * 0.0009
      }
      rotation.x += (target.x - rotation.x) * 0.07
      rotation.y += (target.y - rotation.y) * 0.07

      context.fillStyle = `rgba(6, 5, 10, ${reducedMotion ? 0.6 : trail})`
      context.fillRect(0, 0, width, height)

      const sinX = Math.sin(rotation.x)
      const cosX = Math.cos(rotation.x)
      const sinY = Math.sin(rotation.y)
      const cosY = Math.cos(rotation.y)

      const scale = Math.min(width, height) * 0.42
      const cx = width / 2
      const cy = height / 2
      const fov = 2.6

      const projected: Array<{ sx: number; sy: number; depth: number; t: number; r: number }> = []
      for (let i = 0; i < points.length; i += 1) {
        const p = points[i]
        const y1 = p.y * cosX - p.z * sinX
        const z1 = p.y * sinX + p.z * cosX
        const x2 = p.x * cosY + z1 * sinY
        const z2 = -p.x * sinY + z1 * cosY
        const depth = z2 + fov
        if (depth < 0.1) continue
        const persp = fov / depth
        projected.push({
          sx: cx + x2 * scale * persp,
          sy: cy + y1 * scale * persp,
          depth,
          t: p.t,
          r: Math.max(0.6, size * persp),
        })
      }

      projected.sort((a, b) => b.depth - a.depth)

      context.globalCompositeOperation = 'lighter'
      for (const point of projected) {
        const colorIndex = Math.floor(point.t * (palette.length - 0.001))
        const color = palette[colorIndex]
        const alpha = Math.max(0.05, Math.min(1, 1.4 / point.depth))
        context.fillStyle = color
        context.globalAlpha = alpha
        context.beginPath()
        context.arc(point.sx, point.sy, point.r, 0, Math.PI * 2)
        context.fill()
      }
      context.globalAlpha = 1
      context.globalCompositeOperation = 'source-over'
    },
    box.width > 0,
  )

  return (
    <ImmersiveDemo
      caption={`${count} points · ${mode} · golden angle ${angleDeg.toFixed(2)}°`}
      controls={
        <>
          <Parameter label="mode">
            <select value={mode} onChange={(event) => setMode(event.target.value as Mode)} className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]">
              {modes.map((option) => <option key={option} value={option} className="bg-[#120f15]">{option}</option>)}
            </select>
          </Parameter>
          <Parameter label="palette">
            <select value={mood} onChange={(event) => setMood(event.target.value as PaletteName)} className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]">
              {moods.map((option) => <option key={option} value={option} className="bg-[#120f15]">{option}</option>)}
            </select>
          </Parameter>
          <Parameter label="points" value={String(count)}>
            <input type="range" min="120" max="2400" step="20" value={count} onChange={(event) => setCount(Number(event.target.value))} />
          </Parameter>
          <Parameter label="generative angle" value={`${angleDeg.toFixed(2)}°`}>
            <input type="range" min="60" max="180" step="0.05" value={angleDeg} onChange={(event) => setAngleDeg(Number(event.target.value))} />
          </Parameter>
          <Parameter label="twist" value={twist.toFixed(2)}>
            <input type="range" min="0" max="1.2" step="0.01" value={twist} onChange={(event) => setTwist(Number(event.target.value))} />
          </Parameter>
          <Parameter label="point size" value={size.toFixed(1)}>
            <input type="range" min="0.6" max="6" step="0.1" value={size} onChange={(event) => setSize(Number(event.target.value))} />
          </Parameter>
          <Parameter label="trail fade" value={trail.toFixed(2)}>
            <input type="range" min="0.04" max="0.6" step="0.01" value={trail} onChange={(event) => setTrail(Number(event.target.value))} />
          </Parameter>
          <div className="instrument-panel flex flex-wrap gap-2 px-3 py-3">
            <button type="button" onClick={() => setAutoSpin((value) => !value)} className="control-button" data-variant={autoSpin ? 'primary' : undefined}>
              {autoSpin ? 'auto-orbit on' : 'auto-orbit off'}
            </button>
            <button type="button" onClick={() => setAngleDeg(GOLDEN_ANGLE_DEG)} className="control-button">golden angle</button>
            <SeedControls seed={seed} onRandomize={remix} />
          </div>
          <p className="text-sm text-[var(--soft)] sm:col-span-2 lg:col-span-3 xl:col-span-4">Drag inside the field to orbit. The angle is a single number — sliding it half a degree converts a sunflower into a wheel.</p>
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
          targetRotationRef.current.y += dx * 0.008
          targetRotationRef.current.x += dy * 0.008
          drag.lastX = event.clientX
          drag.lastY = event.clientY
        }}
        onPointerUp={() => { dragRef.current.active = false }}
        onPointerCancel={() => { dragRef.current.active = false }}
        onPointerLeave={() => { dragRef.current.active = false }}
        style={{
          background: 'radial-gradient(circle at 50% 60%, rgba(60,30,100,0.35), transparent 60%), radial-gradient(circle at 20% 20%, rgba(100,180,220,0.18), transparent 50%), #06050a',
        }}
      >
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
    </ImmersiveDemo>
  )
}
