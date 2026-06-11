import { useEffect, useMemo, useRef, useState } from 'react'
import { ImmersiveDemo } from '../components/ImmersiveDemo'
import { Parameter } from '../components/Parameter'
import { SeedControls } from '../components/SeedControls'
import { useResizeObserver } from '../hooks/useResizeObserver'
import { useSeed } from '../hooks/useSeed'
import type { DemoComponentProps } from '../lib/demoTypes'
import { createSeededRandom } from '../lib/random'

type Preset = 'coral' | 'fingerprint' | 'spots' | 'mitosis' | 'flow'

type Palette = 'magma' | 'ocean' | 'paper' | 'aurora'

const presets: Record<Preset, { feed: number; kill: number; dA: number; dB: number }> = {
  coral: { feed: 0.062, kill: 0.062, dA: 1.0, dB: 0.5 },
  fingerprint: { feed: 0.054, kill: 0.062, dA: 1.0, dB: 0.5 },
  spots: { feed: 0.029, kill: 0.057, dA: 1.0, dB: 0.5 },
  mitosis: { feed: 0.0367, kill: 0.0649, dA: 1.0, dB: 0.5 },
  flow: { feed: 0.078, kill: 0.061, dA: 1.0, dB: 0.5 },
}

const palettes: Record<Palette, [number, number, number][]> = {
  magma: [
    [8, 6, 18],
    [56, 13, 70],
    [173, 47, 87],
    [248, 144, 73],
    [253, 235, 192],
  ],
  ocean: [
    [4, 8, 22],
    [10, 40, 88],
    [37, 122, 168],
    [121, 215, 239],
    [240, 252, 235],
  ],
  paper: [
    [239, 229, 211],
    [206, 187, 152],
    [180, 71, 40],
    [69, 35, 22],
    [25, 19, 14],
  ],
  aurora: [
    [12, 10, 30],
    [40, 28, 100],
    [80, 200, 160],
    [220, 240, 130],
    [240, 200, 255],
  ],
}

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

const SIM_WIDTH = 220
const SIM_HEIGHT = 132

function seedField(seed: number) {
  const random = createSeededRandom(seed)
  const total = SIM_WIDTH * SIM_HEIGHT
  const aField = new Float32Array(total)
  const bField = new Float32Array(total)
  for (let i = 0; i < total; i += 1) {
    aField[i] = 1
  }
  const blots = 6
  for (let blot = 0; blot < blots; blot += 1) {
    const cx = Math.floor(random() * SIM_WIDTH)
    const cy = Math.floor(random() * SIM_HEIGHT)
    const radius = 4 + random() * 8
    for (let yy = -radius; yy <= radius; yy += 1) {
      for (let xx = -radius; xx <= radius; xx += 1) {
        if (xx * xx + yy * yy > radius * radius) continue
        const x = ((cx + xx) % SIM_WIDTH + SIM_WIDTH) % SIM_WIDTH
        const y = ((cy + yy) % SIM_HEIGHT + SIM_HEIGHT) % SIM_HEIGHT
        bField[y * SIM_WIDTH + x] = 0.9
      }
    }
  }
  return { aField, bField }
}

export function ReactionDiffusionDemo({ reducedMotion }: DemoComponentProps) {
  const [preset, setPreset] = useState<Preset>('coral')
  const [feed, setFeed] = useState(presets.coral.feed)
  const [kill, setKill] = useState(presets.coral.kill)
  const [palette, setPalette] = useState<Palette>('magma')
  const [brush, setBrush] = useState(8)
  const [stepsPerFrame, setStepsPerFrame] = useState(8)
  const [running, setRunning] = useState(true)
  const [status, setStatus] = useState<string>('chemicals seeded — they will react and diffuse.')

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const size = useResizeObserver(container)
  const { seed, remix } = useSeed()

  const fieldRef = useRef<{ a: Float32Array; b: Float32Array; aNext: Float32Array; bNext: Float32Array } | null>(null)
  const pointerRef = useRef({ x: -1, y: -1, active: false })
  const animationRef = useRef<number>(0)
  const paletteRef = useRef(palettes[palette])
  const feedRef = useRef(feed)
  const killRef = useRef(kill)
  const stepsRef = useRef(stepsPerFrame)
  const brushRef = useRef(brush)
  const runningRef = useRef(running)
  const reducedMotionRef = useRef(reducedMotion)

  useEffect(() => { paletteRef.current = palettes[palette] }, [palette])
  useEffect(() => { feedRef.current = feed }, [feed])
  useEffect(() => { killRef.current = kill }, [kill])
  useEffect(() => { stepsRef.current = stepsPerFrame }, [stepsPerFrame])
  useEffect(() => { brushRef.current = brush }, [brush])
  useEffect(() => { runningRef.current = running }, [running])
  useEffect(() => { reducedMotionRef.current = reducedMotion }, [reducedMotion])

  useEffect(() => {
    const { aField, bField } = seedField(seed)
    fieldRef.current = {
      a: aField,
      b: bField,
      aNext: new Float32Array(aField.length),
      bNext: new Float32Array(bField.length),
    }
  }, [seed])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    const imageBuffer = context.createImageData(SIM_WIDTH, SIM_HEIGHT)

    const step = () => {
      const field = fieldRef.current
      if (!field) return
      const { a, b, aNext, bNext } = field
      const f = feedRef.current
      const k = killRef.current
      const dA = 1.0
      const dB = 0.5

      const iterations = reducedMotionRef.current ? 2 : runningRef.current ? Math.max(1, Math.floor(stepsRef.current)) : 0

      for (let iter = 0; iter < iterations; iter += 1) {
        for (let y = 1; y < SIM_HEIGHT - 1; y += 1) {
          const rowAbove = (y - 1) * SIM_WIDTH
          const row = y * SIM_WIDTH
          const rowBelow = (y + 1) * SIM_WIDTH
          for (let x = 1; x < SIM_WIDTH - 1; x += 1) {
            const i = row + x
            const aCenter = a[i]
            const bCenter = b[i]
            const laplaceA =
              a[i - 1] * 0.2 +
              a[i + 1] * 0.2 +
              a[rowAbove + x] * 0.2 +
              a[rowBelow + x] * 0.2 +
              a[rowAbove + x - 1] * 0.05 +
              a[rowAbove + x + 1] * 0.05 +
              a[rowBelow + x - 1] * 0.05 +
              a[rowBelow + x + 1] * 0.05 -
              aCenter
            const laplaceB =
              b[i - 1] * 0.2 +
              b[i + 1] * 0.2 +
              b[rowAbove + x] * 0.2 +
              b[rowBelow + x] * 0.2 +
              b[rowAbove + x - 1] * 0.05 +
              b[rowAbove + x + 1] * 0.05 +
              b[rowBelow + x - 1] * 0.05 +
              b[rowBelow + x + 1] * 0.05 -
              bCenter
            const reaction = aCenter * bCenter * bCenter
            aNext[i] = aCenter + dA * laplaceA - reaction + f * (1 - aCenter)
            bNext[i] = bCenter + dB * laplaceB + reaction - (k + f) * bCenter
            if (aNext[i] < 0) aNext[i] = 0
            if (aNext[i] > 1) aNext[i] = 1
            if (bNext[i] < 0) bNext[i] = 0
            if (bNext[i] > 1) bNext[i] = 1
          }
        }
        field.a = aNext
        field.b = bNext
        field.aNext = a
        field.bNext = b
      }

      const pointer = pointerRef.current
      if (pointer.active) {
        const radius = brushRef.current
        const px = Math.round(pointer.x * SIM_WIDTH)
        const py = Math.round(pointer.y * SIM_HEIGHT)
        for (let yy = -radius; yy <= radius; yy += 1) {
          for (let xx = -radius; xx <= radius; xx += 1) {
            if (xx * xx + yy * yy > radius * radius) continue
            const sx = px + xx
            const sy = py + yy
            if (sx < 1 || sx >= SIM_WIDTH - 1 || sy < 1 || sy >= SIM_HEIGHT - 1) continue
            field.b[sy * SIM_WIDTH + sx] = 0.95
          }
        }
      }

      const palette = paletteRef.current
      const data = imageBuffer.data
      for (let i = 0; i < SIM_WIDTH * SIM_HEIGHT; i += 1) {
        const value = 1 - field.b[i]
        const [r, g, blue] = paletteSample(palette, value)
        const offset = i * 4
        data[offset] = r
        data[offset + 1] = g
        data[offset + 2] = blue
        data[offset + 3] = 255
      }
      context.putImageData(imageBuffer, 0, 0)
      animationRef.current = window.requestAnimationFrame(step)
    }

    animationRef.current = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(animationRef.current)
  }, [])

  const summary = useMemo(
    () => `Feed ${feed.toFixed(4)} | kill ${kill.toFixed(4)} | preset ${preset} | ${running ? 'running' : 'paused'}.`,
    [feed, kill, preset, running],
  )

  const applyPreset = (name: Preset) => {
    setPreset(name)
    setFeed(presets[name].feed)
    setKill(presets[name].kill)
    setStatus(`Switched to ${name} regime. Watch the texture re-stabilize.`)
  }

  const clear = () => {
    const { aField, bField } = seedField(seed)
    fieldRef.current = {
      a: aField,
      b: bField,
      aNext: new Float32Array(aField.length),
      bNext: new Float32Array(bField.length),
    }
    setStatus('Field reseeded from current seed.')
  }

  return (
    <ImmersiveDemo
      caption={summary}
      controls={
        <>
          <Parameter label="preset">
            <select
              value={preset}
              onChange={(event) => applyPreset(event.target.value as Preset)}
              className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]"
            >
              {Object.keys(presets).map((option) => (
                <option key={option} value={option} className="bg-[#120f15]">{option}</option>
              ))}
            </select>
          </Parameter>
          <Parameter label="palette">
            <select
              value={palette}
              onChange={(event) => setPalette(event.target.value as Palette)}
              className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]"
            >
              {Object.keys(palettes).map((option) => (
                <option key={option} value={option} className="bg-[#120f15]">{option}</option>
              ))}
            </select>
          </Parameter>
          <Parameter label="feed rate" value={feed.toFixed(4)}>
            <input type="range" min="0.01" max="0.1" step="0.0005" value={feed} onChange={(event) => setFeed(Number(event.target.value))} />
          </Parameter>
          <Parameter label="kill rate" value={kill.toFixed(4)}>
            <input type="range" min="0.04" max="0.08" step="0.0005" value={kill} onChange={(event) => setKill(Number(event.target.value))} />
          </Parameter>
          <Parameter label="brush radius" value={`${brush}`}>
            <input type="range" min="2" max="20" step="1" value={brush} onChange={(event) => setBrush(Number(event.target.value))} />
          </Parameter>
          <Parameter label="steps per frame" value={`${stepsPerFrame}`}>
            <input type="range" min="1" max="20" step="1" value={stepsPerFrame} onChange={(event) => setStepsPerFrame(Number(event.target.value))} />
          </Parameter>
          <div className="instrument-panel flex flex-wrap gap-2 px-3 py-3">
            <button type="button" onClick={() => setRunning((value) => !value)} className="control-button" data-variant="primary">
              {running ? 'pause reaction' : 'resume reaction'}
            </button>
            <button type="button" onClick={clear} className="control-button">reseed</button>
            <SeedControls seed={seed} onRandomize={remix} />
          </div>
          <p className="text-sm text-[var(--soft)] sm:col-span-2 lg:col-span-3 xl:col-span-4">{status} Drag inside the canvas to inject extra reactant — the pattern remembers where you touched it.</p>
        </>
      }
    >
      <div
        ref={setContainer}
        className="relative h-full w-full cursor-crosshair"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          const rect = event.currentTarget.getBoundingClientRect()
          pointerRef.current = {
            x: (event.clientX - rect.left) / rect.width,
            y: (event.clientY - rect.top) / rect.height,
            active: true,
          }
        }}
        onPointerMove={(event) => {
          if (!pointerRef.current.active) return
          const rect = event.currentTarget.getBoundingClientRect()
          pointerRef.current.x = (event.clientX - rect.left) / rect.width
          pointerRef.current.y = (event.clientY - rect.top) / rect.height
        }}
        onPointerUp={() => { pointerRef.current.active = false }}
        onPointerCancel={() => { pointerRef.current.active = false }}
        onPointerLeave={() => { pointerRef.current.active = false }}
      >
        <canvas
          ref={canvasRef}
          width={SIM_WIDTH}
          height={SIM_HEIGHT}
          className="h-full w-full"
          style={{ imageRendering: size.width > 800 ? 'auto' : 'pixelated' }}
        />
        <div className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ background: 'radial-gradient(circle at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)' }} />
      </div>
    </ImmersiveDemo>
  )
}
