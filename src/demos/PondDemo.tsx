import { useEffect, useMemo, useRef, useState } from 'react'
import { ImmersiveDemo } from '../components/ImmersiveDemo'
import { Parameter } from '../components/Parameter'
import type { DemoComponentProps } from '../lib/demoTypes'

type PondPalette = 'inkwell' | 'moonlit' | 'copper' | 'paper'
type WeatherMode = 'still' | 'breeze' | 'rain' | 'storm'

const palettes: Record<PondPalette, [number, number, number][]> = {
  inkwell: [
    [4, 7, 18],
    [16, 34, 78],
    [90, 130, 200],
    [180, 220, 255],
    [240, 250, 255],
  ],
  moonlit: [
    [6, 9, 22],
    [38, 18, 96],
    [120, 60, 200],
    [240, 200, 250],
    [255, 248, 220],
  ],
  copper: [
    [10, 7, 6],
    [70, 30, 12],
    [200, 100, 30],
    [255, 200, 130],
    [255, 240, 200],
  ],
  paper: [
    [239, 229, 211],
    [206, 187, 152],
    [180, 71, 40],
    [69, 35, 22],
    [25, 19, 14],
  ],
}

const weathers: WeatherMode[] = ['still', 'breeze', 'rain', 'storm']

function paletteSample(palette: [number, number, number][], t: number) {
  const x = Math.max(0, Math.min(1, t)) * (palette.length - 1)
  const i = Math.floor(x)
  const f = x - i
  const a = palette[i]
  const b = palette[Math.min(palette.length - 1, i + 1)]
  return [
    a[0] + (b[0] - a[0]) * f,
    a[1] + (b[1] - a[1]) * f,
    a[2] + (b[2] - a[2]) * f,
  ] as const
}

const SIM_WIDTH = 240
const SIM_HEIGHT = 160

export function PondDemo({ reducedMotion }: DemoComponentProps) {
  const [palette, setPalette] = useState<PondPalette>('inkwell')
  const [weather, setWeather] = useState<WeatherMode>('breeze')
  const [damping, setDamping] = useState(0.992)
  const [stepsPerFrame, setStepsPerFrame] = useState(2)
  const [intensity, setIntensity] = useState(1)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const surfaceRef = useRef<HTMLDivElement | null>(null)
  const currentRef = useRef<Float32Array>(new Float32Array(SIM_WIDTH * SIM_HEIGHT))
  const previousRef = useRef<Float32Array>(new Float32Array(SIM_WIDTH * SIM_HEIGHT))
  const pointerRef = useRef<{ x: number; y: number; lastX: number; lastY: number; active: boolean }>({ x: 0, y: 0, lastX: 0, lastY: 0, active: false })
  const animationRef = useRef<number>(0)
  const elapsedRef = useRef(0)

  const paletteRef = useRef(palettes[palette])
  const weatherRef = useRef(weather)
  const dampingRef = useRef(damping)
  const stepsRef = useRef(stepsPerFrame)
  const intensityRef = useRef(intensity)
  const reducedRef = useRef(reducedMotion)

  useEffect(() => { paletteRef.current = palettes[palette] }, [palette])
  useEffect(() => { weatherRef.current = weather }, [weather])
  useEffect(() => { dampingRef.current = damping }, [damping])
  useEffect(() => { stepsRef.current = stepsPerFrame }, [stepsPerFrame])
  useEffect(() => { intensityRef.current = intensity }, [intensity])
  useEffect(() => { reducedRef.current = reducedMotion }, [reducedMotion])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const imageData = ctx.createImageData(SIM_WIDTH, SIM_HEIGHT)

    const drop = (cx: number, cy: number, radius: number, amount: number) => {
      const current = currentRef.current
      for (let yy = -radius; yy <= radius; yy += 1) {
        for (let xx = -radius; xx <= radius; xx += 1) {
          const dd = xx * xx + yy * yy
          if (dd > radius * radius) continue
          const x = Math.round(cx + xx)
          const y = Math.round(cy + yy)
          if (x < 1 || x >= SIM_WIDTH - 1 || y < 1 || y >= SIM_HEIGHT - 1) continue
          const falloff = 1 - Math.sqrt(dd) / radius
          current[y * SIM_WIDTH + x] += amount * falloff
        }
      }
    }

    const render = () => {
      const dt = 16
      elapsedRef.current += dt

      const ambient = weatherRef.current
      if (ambient === 'rain' || ambient === 'storm') {
        const drops = ambient === 'rain' ? 1 : 4
        for (let d = 0; d < drops; d += 1) {
          if (Math.random() < (ambient === 'rain' ? 0.5 : 0.85)) {
            const cx = Math.random() * SIM_WIDTH
            const cy = Math.random() * SIM_HEIGHT
            drop(cx, cy, 2 + Math.random() * 2, (ambient === 'rain' ? 0.45 : 1.1) * intensityRef.current)
          }
        }
      } else if (ambient === 'breeze') {
        if (Math.random() < 0.06) {
          drop(Math.random() * SIM_WIDTH, Math.random() * SIM_HEIGHT, 2, 0.15 * intensityRef.current)
        }
      }

      const pointer = pointerRef.current
      if (pointer.active) {
        const cx = Math.round(pointer.x * SIM_WIDTH)
        const cy = Math.round(pointer.y * SIM_HEIGHT)
        drop(cx, cy, 3, 0.9 * intensityRef.current)
      }

      const stepsThisFrame = reducedRef.current ? 1 : Math.max(1, Math.floor(stepsRef.current))
      const damp = dampingRef.current

      for (let iter = 0; iter < stepsThisFrame; iter += 1) {
        const current = currentRef.current
        const previous = previousRef.current
        for (let y = 1; y < SIM_HEIGHT - 1; y += 1) {
          const row = y * SIM_WIDTH
          for (let x = 1; x < SIM_WIDTH - 1; x += 1) {
            const i = row + x
            const value = (current[i - 1] + current[i + 1] + current[i - SIM_WIDTH] + current[i + SIM_WIDTH]) / 2 - previous[i]
            previous[i] = value * damp
          }
        }
        const swap = currentRef.current
        currentRef.current = previousRef.current
        previousRef.current = swap
      }

      const palette = paletteRef.current
      const data = imageData.data
      const current = currentRef.current
      for (let y = 0; y < SIM_HEIGHT; y += 1) {
        const row = y * SIM_WIDTH
        for (let x = 0; x < SIM_WIDTH; x += 1) {
          const i = row + x
          const value = current[i]
          const left = current[i - 1] ?? value
          const top = current[i - SIM_WIDTH] ?? value
          const shade = 0.5 + (value - (left + top) * 0.4) * 0.55
          const [r, g, b] = paletteSample(palette, shade)
          const offset = i * 4
          data[offset] = r
          data[offset + 1] = g
          data[offset + 2] = b
          data[offset + 3] = 255
        }
      }
      ctx.putImageData(imageData, 0, 0)
      animationRef.current = window.requestAnimationFrame(render)
    }

    animationRef.current = window.requestAnimationFrame(render)
    return () => window.cancelAnimationFrame(animationRef.current)
  }, [])

  const dropPebble = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width
    const y = (event.clientY - bounds.top) / bounds.height
    pointerRef.current.lastX = pointerRef.current.x
    pointerRef.current.lastY = pointerRef.current.y
    pointerRef.current.x = x
    pointerRef.current.y = y
  }

  const summary = useMemo(
    () => `${weather} water · damping ${damping.toFixed(3)} · ${stepsPerFrame} integration step${stepsPerFrame === 1 ? '' : 's'} per frame`,
    [weather, damping, stepsPerFrame],
  )

  return (
    <ImmersiveDemo
      caption={summary}
      controls={
        <>
          <Parameter label="palette">
            <select value={palette} onChange={(event) => setPalette(event.target.value as PondPalette)} className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]">
              {Object.keys(palettes).map((option) => <option key={option} value={option} className="bg-[#120f15]">{option}</option>)}
            </select>
          </Parameter>
          <Parameter label="weather">
            <select value={weather} onChange={(event) => setWeather(event.target.value as WeatherMode)} className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]">
              {weathers.map((option) => <option key={option} value={option} className="bg-[#120f15]">{option}</option>)}
            </select>
          </Parameter>
          <Parameter label="surface tension" value={damping.toFixed(3)}>
            <input type="range" min="0.97" max="0.999" step="0.001" value={damping} onChange={(event) => setDamping(Number(event.target.value))} />
          </Parameter>
          <Parameter label="propagation steps" value={String(stepsPerFrame)}>
            <input type="range" min="1" max="4" step="1" value={stepsPerFrame} onChange={(event) => setStepsPerFrame(Number(event.target.value))} />
          </Parameter>
          <Parameter label="touch intensity" value={intensity.toFixed(2)}>
            <input type="range" min="0.2" max="2.4" step="0.05" value={intensity} onChange={(event) => setIntensity(Number(event.target.value))} />
          </Parameter>
          <div className="instrument-panel flex flex-wrap gap-2 px-3 py-3">
            <button
              type="button"
              onClick={() => {
                currentRef.current = new Float32Array(SIM_WIDTH * SIM_HEIGHT)
                previousRef.current = new Float32Array(SIM_WIDTH * SIM_HEIGHT)
              }}
              className="control-button"
            >
              still water
            </button>
            <button
              type="button"
              onClick={() => {
                for (let i = 0; i < 8; i += 1) {
                  const cx = Math.random() * SIM_WIDTH
                  const cy = Math.random() * SIM_HEIGHT
                  const current = currentRef.current
                  for (let yy = -3; yy <= 3; yy += 1) {
                    for (let xx = -3; xx <= 3; xx += 1) {
                      const x = Math.round(cx + xx)
                      const y = Math.round(cy + yy)
                      if (x < 1 || x >= SIM_WIDTH - 1 || y < 1 || y >= SIM_HEIGHT - 1) continue
                      current[y * SIM_WIDTH + x] += 0.6
                    }
                  }
                }
              }}
              className="control-button"
              data-variant="primary"
            >
              scatter pebbles
            </button>
          </div>
          <p className="text-sm text-[var(--soft)] sm:col-span-2 lg:col-span-3 xl:col-span-4">Click anywhere on the water. Hold and drag to trace fingerprints into the surface. Two ripples that meet do not collide — they add.</p>
        </>
      }
    >
      <div
        ref={surfaceRef}
        className="relative h-full w-full cursor-crosshair"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          const bounds = event.currentTarget.getBoundingClientRect()
          pointerRef.current = {
            x: (event.clientX - bounds.left) / bounds.width,
            y: (event.clientY - bounds.top) / bounds.height,
            lastX: (event.clientX - bounds.left) / bounds.width,
            lastY: (event.clientY - bounds.top) / bounds.height,
            active: true,
          }
        }}
        onPointerMove={(event) => {
          if (!pointerRef.current.active) return
          dropPebble(event)
        }}
        onPointerUp={() => { pointerRef.current.active = false }}
        onPointerCancel={() => { pointerRef.current.active = false }}
        onPointerLeave={() => { pointerRef.current.active = false }}
      >
        <canvas ref={canvasRef} width={SIM_WIDTH} height={SIM_HEIGHT} className="h-full w-full" style={{ imageRendering: 'auto' }} />
        <div className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ background: 'radial-gradient(ellipse at 50% 30%, transparent 35%, rgba(0,0,0,0.4) 80%)' }} />
      </div>
    </ImmersiveDemo>
  )
}
