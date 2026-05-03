import { useMemo, useRef, useState } from 'react'
import { DemoControls } from '../components/DemoControls'
import { Parameter } from '../components/Parameter'
import { SeedControls } from '../components/SeedControls'
import { useAnimationFrame } from '../hooks/useAnimationFrame'
import { useResizeObserver } from '../hooks/useResizeObserver'
import { useSeed } from '../hooks/useSeed'
import { setupHiDpiCanvas } from '../lib/canvas'
import { palettes, type PaletteName } from '../lib/color'
import { clamp } from '../lib/geometry'
import type { DemoComponentProps } from '../lib/demoTypes'

const moods = Object.keys(palettes) as PaletteName[]

export function ShaderWithoutShadersDemo({ reducedMotion }: DemoComponentProps) {
  const [frequency, setFrequency] = useState(4.2)
  const [phase, setPhase] = useState(0.8)
  const [distortion, setDistortion] = useState(0.35)
  const [resolution, setResolution] = useState(10)
  const [animate, setAnimate] = useState(true)
  const [palette, setPalette] = useState<PaletteName>('velvet')
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const pointerRef = useRef({ x: 0.5, y: 0.5 })
  const size = useResizeObserver(container)
  const { seed, remix } = useSeed()

  const colors = useMemo(() => palettes[palette], [palette])

  useAnimationFrame(
    (_, elapsed) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const width = Math.max(size.width - 12, 280)
      const height = 340
      const block = width < 420 ? Math.max(resolution, 10) : resolution
      const context = setupHiDpiCanvas(canvas, width, height)
      if (!context) return
      const time = reducedMotion || !animate ? phase : phase + elapsed * 0.0005
      context.clearRect(0, 0, width, height)

      for (let y = 0; y < height; y += block) {
        for (let x = 0; x < width; x += block) {
          const nx = x / width - 0.5
          const ny = y / height - 0.5
          const radius = Math.hypot(nx + pointerRef.current.x - 0.5, ny + pointerRef.current.y - 0.5)
          const wave = Math.sin((nx * frequency + time + seed * 0.00001) * 3.1)
          const ripple = Math.cos((ny * frequency - time) * 2.7)
          const flare = Math.sin((radius * 16 - time * 3) * (1 + distortion * 2))
          const brightness = clamp((wave + ripple + flare + 3) / 6, 0, 1)
          const colorIndex = Math.floor(brightness * (colors.length - 0.01))
          context.fillStyle = colors[colorIndex]
          context.fillRect(x, y, block + 1, block + 1)
        }
      }
    },
    size.width > 0,
  )

  return (
    <DemoControls
      actions={
        <>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setAnimate((value) => !value)} className="rounded-full border border-[var(--line)] px-3 py-2 text-sm text-[var(--text)]">
              {animate ? 'pause' : 'animate'}
            </button>
            <button type="button" onClick={() => setPhase((value) => value + 0.35)} className="rounded-full border border-[var(--line)] px-3 py-2 text-sm text-[var(--text)]">
              freeze frame
            </button>
            <SeedControls seed={seed} onRandomize={remix} />
          </div>
          <Parameter label="frequency" value={frequency.toFixed(1)}>
            <input type="range" min="1" max="9" step="0.1" value={frequency} onChange={(event) => setFrequency(Number(event.target.value))} />
          </Parameter>
          <Parameter label="phase" value={phase.toFixed(1)}>
            <input type="range" min="0" max="6.3" step="0.1" value={phase} onChange={(event) => setPhase(Number(event.target.value))} />
          </Parameter>
          <Parameter label="palette">
            <select value={palette} onChange={(event) => setPalette(event.target.value as PaletteName)} className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2">
              {moods.map((option) => (
                <option key={option} value={option} className="bg-[#120f15]">
                  {option}
                </option>
              ))}
            </select>
          </Parameter>
          <Parameter label="distortion" value={distortion.toFixed(2)}>
            <input type="range" min="0" max="1" step="0.05" value={distortion} onChange={(event) => setDistortion(Number(event.target.value))} />
          </Parameter>
          <Parameter label="resolution" value={`${resolution}px`}>
            <input type="range" min="6" max="18" step="1" value={resolution} onChange={(event) => setResolution(Number(event.target.value))} />
          </Parameter>
          <p className="text-sm text-[var(--soft)]">Canvas description: arithmetic wave fields are mapped to color blocks. Pointer position changes the apparent light source.</p>
        </>
      }
    >
      <div
        ref={setContainer}
        className="relative h-[340px] overflow-hidden rounded-[1.25rem] bg-[#09070d]"
        tabIndex={0}
        role="img"
        aria-label="Luminous color patterns shift through arithmetic waves."
        onPointerMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect()
          pointerRef.current = {
            x: clamp((event.clientX - bounds.left) / bounds.width, 0, 1),
            y: clamp((event.clientY - bounds.top) / bounds.height, 0, 1),
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') pointerRef.current.x = clamp(pointerRef.current.x - 0.05, 0, 1)
          if (event.key === 'ArrowRight') pointerRef.current.x = clamp(pointerRef.current.x + 0.05, 0, 1)
          if (event.key === 'ArrowUp') pointerRef.current.y = clamp(pointerRef.current.y - 0.05, 0, 1)
          if (event.key === 'ArrowDown') pointerRef.current.y = clamp(pointerRef.current.y + 0.05, 0, 1)
        }}
      >
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
    </DemoControls>
  )
}
