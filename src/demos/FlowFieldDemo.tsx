import { useEffect, useMemo, useRef, useState } from 'react'
import { DemoControls } from '../components/DemoControls'
import { Parameter } from '../components/Parameter'
import { SeedControls } from '../components/SeedControls'
import { useAnimationFrame } from '../hooks/useAnimationFrame'
import { useResizeObserver } from '../hooks/useResizeObserver'
import { useSeed } from '../hooks/useSeed'
import { setupHiDpiCanvas } from '../lib/canvas'
import { palettes, type PaletteName, hexToRgba } from '../lib/color'
import { clamp, distance } from '../lib/geometry'
import { createSeededRandom, randomBetween } from '../lib/random'
import type { DemoComponentProps } from '../lib/demoTypes'

type Particle = { x: number; y: number; life: number }

const moods = Object.keys(palettes) as PaletteName[]

const defaults = {
  density: 140,
  curlStrength: 1.4,
  speed: 1.3,
  trailFade: 0.14,
  mood: 'ember' as PaletteName,
}

export function FlowFieldDemo({ reducedMotion }: DemoComponentProps) {
  const [density, setDensity] = useState(defaults.density)
  const [curlStrength, setCurlStrength] = useState(defaults.curlStrength)
  const [speed, setSpeed] = useState(defaults.speed)
  const [trailFade, setTrailFade] = useState(defaults.trailFade)
  const [mood, setMood] = useState<PaletteName>(defaults.mood)
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const pointerRef = useRef({ x: 0, y: 0, active: false, pulse: 0 })
  const particlesRef = useRef<Particle[]>([])
  const size = useResizeObserver(container)
  const { seed, remix } = useSeed()

  const palette = palettes[mood]

  useEffect(() => {
    const generator = createSeededRandom(seed)
    const width = Math.max(size.width - 12, 280)
    const height = 340
    const particleCount = Math.min(density, Math.max(72, Math.floor(width / 3)))
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: randomBetween(generator, 0, width),
      y: randomBetween(generator, 0, height),
      life: randomBetween(generator, 0, 1000),
    }))
  }, [density, seed, size.width])

  const fieldAt = useMemo(
    () => (x: number, y: number) => {
      const pointer = pointerRef.current
      const drift = Math.sin((x + seed * 0.001) * 0.011) + Math.cos((y - seed * 0.002) * 0.012)
      const swirl = Math.sin((x * 0.013 + y * 0.01 + seed * 0.0004) * curlStrength)
      const pull = pointer.active
        ? clamp(1 - distance(x, y, pointer.x, pointer.y) / 140, 0, 1) * 2.4
        : 0
      return drift + swirl + pull + pointer.pulse
    },
    [curlStrength, seed],
  )

  useAnimationFrame(
    (_, elapsed) => {
      const canvas = canvasRef.current
      if (!canvas) {
        return
      }
      const width = Math.max(size.width - 12, 280)
      const height = 340
      const context = setupHiDpiCanvas(canvas, width, height)
      if (!context) {
        return
      }

      context.fillStyle = hexToRgba('#09070d', reducedMotion ? 0.4 : trailFade)
      context.fillRect(0, 0, width, height)
      context.lineWidth = 1.2

      if (pointerRef.current.pulse > 0) {
        pointerRef.current.pulse *= 0.92
      }

      particlesRef.current.forEach((particle, index) => {
        const angle = fieldAt(particle.x, particle.y) + elapsed * 0.00002
        const velocity = reducedMotion ? speed * 0.35 : speed
        const nextX = particle.x + Math.cos(angle) * velocity
        const nextY = particle.y + Math.sin(angle) * velocity

        context.strokeStyle = palette[index % palette.length]
        context.beginPath()
        context.moveTo(particle.x, particle.y)
        context.lineTo(nextX, nextY)
        context.stroke()

        particle.x = nextX
        particle.y = nextY
        particle.life += 1

        if (nextX < 0 || nextX > width || nextY < 0 || nextY > height || particle.life > 800) {
          particle.x = ((index * 37 + seed) % width + width) % width
          particle.y = ((index * 53 + seed) % height + height) % height
          particle.life = 0
        }
      })
    },
    size.width > 0,
  )

  return (
    <DemoControls
      actions={
        <>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setDensity(defaults.density)
                setCurlStrength(defaults.curlStrength)
                setSpeed(defaults.speed)
                setTrailFade(defaults.trailFade)
                setMood(defaults.mood)
              }}
              className="control-button"
            >
              reset
            </button>
            <SeedControls seed={seed} onRandomize={remix} />
          </div>
          <Parameter label="density" value={String(density)}>
            <input type="range" min="60" max="260" value={density} onChange={(event) => setDensity(Number(event.target.value))} />
          </Parameter>
          <Parameter label="curl" value={curlStrength.toFixed(1)}>
            <input type="range" min="0.4" max="3" step="0.1" value={curlStrength} onChange={(event) => setCurlStrength(Number(event.target.value))} />
          </Parameter>
          <Parameter label="speed" value={speed.toFixed(1)}>
            <input type="range" min="0.2" max="2.6" step="0.1" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} />
          </Parameter>
          <Parameter label="trail length" value={trailFade.toFixed(2)}>
            <input type="range" min="0.04" max="0.35" step="0.01" value={trailFade} onChange={(event) => setTrailFade(Number(event.target.value))} />
          </Parameter>
          <Parameter label="color mood">
            <select value={mood} onChange={(event) => setMood(event.target.value as PaletteName)} className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]">
              {moods.map((option) => (
                <option key={option} value={option} className="bg-[#120f15]">
                  {option}
                </option>
              ))}
            </select>
          </Parameter>
          <p className="text-sm text-[var(--soft)]">Canvas description: particles move in curved paths. Pointer movement bends the field and click adds a disturbance.</p>
        </>
      }
    >
      <div
        ref={setContainer}
        className="relative h-[340px] overflow-hidden rounded-[1.25rem] bg-[#09070d]"
        tabIndex={0}
        role="img"
        aria-label="Particles drift through a responsive field of curves."
        onPointerMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect()
          pointerRef.current = {
            ...pointerRef.current,
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top,
            active: true,
          }
        }}
        onPointerLeave={() => {
          pointerRef.current.active = false
        }}
        onClick={() => {
          pointerRef.current.pulse = 1.4
        }}
        onKeyDown={(event) => {
          if (event.key === ' ') {
            event.preventDefault()
            pointerRef.current.pulse = 1.8
          }
        }}
      >
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
    </DemoControls>
  )
}
