import { useMemo, useState } from 'react'
import { DemoControls } from '../components/DemoControls'
import { Parameter } from '../components/Parameter'
import { clamp, lerp } from '../lib/geometry'
import type { DemoComponentProps } from '../lib/demoTypes'

export function KineticTypeDemo({ reducedMotion }: DemoComponentProps) {
  const [phrase, setPhrase] = useState('letters as bodies')
  const [gravity, setGravity] = useState(0.6)
  const [elasticity, setElasticity] = useState(0.45)
  const [spacing, setSpacing] = useState(1)
  const [motionIntensity, setMotionIntensity] = useState(0.7)
  const [paused, setPaused] = useState(false)
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.5, active: false })

  const letters = useMemo(() => phrase.split(''), [phrase])

  return (
    <DemoControls
      actions={
        <>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setPaused((value) => !value)} className="control-button">
              {paused ? 'resume' : 'pause'}
            </button>
            <button
              type="button"
              onClick={() => {
                setPhrase('letters as bodies')
                setGravity(0.6)
                setElasticity(0.45)
                setSpacing(1)
                setMotionIntensity(0.7)
              }}
              className="control-button"
            >
              reset
            </button>
          </div>
          <Parameter label="phrase">
            <input value={phrase} onChange={(event) => setPhrase(event.target.value.slice(0, 28))} className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]" />
          </Parameter>
          <Parameter label="gravity" value={gravity.toFixed(2)}>
            <input type="range" min="0" max="1" step="0.05" value={gravity} onChange={(event) => setGravity(Number(event.target.value))} />
          </Parameter>
          <Parameter label="elasticity" value={elasticity.toFixed(2)}>
            <input type="range" min="0.1" max="1" step="0.05" value={elasticity} onChange={(event) => setElasticity(Number(event.target.value))} />
          </Parameter>
          <Parameter label="spacing" value={spacing.toFixed(1)}>
            <input type="range" min="0.4" max="2.4" step="0.1" value={spacing} onChange={(event) => setSpacing(Number(event.target.value))} />
          </Parameter>
          <Parameter label="motion intensity" value={motionIntensity.toFixed(2)}>
            <input type="range" min="0" max="1" step="0.05" value={motionIntensity} onChange={(event) => setMotionIntensity(Number(event.target.value))} />
          </Parameter>
          <p className="text-sm text-[var(--soft)]">Move the pointer across the phrase, or use arrow keys while the stage is focused.</p>
        </>
      }
    >
      <div
        className="relative flex h-[340px] items-center justify-center overflow-hidden rounded-[1.25rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_40%),#0f0d12]"
        tabIndex={0}
        role="img"
        aria-label="Letters shift and settle as if they have weight and spring."
        onPointerMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect()
          setPointer({ x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height, active: true })
        }}
        onPointerLeave={() => setPointer((current) => ({ ...current, active: false }))}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') setPointer((current) => ({ ...current, x: clamp(current.x - 0.04, 0, 1), active: true }))
          if (event.key === 'ArrowRight') setPointer((current) => ({ ...current, x: clamp(current.x + 0.04, 0, 1), active: true }))
          if (event.key === 'ArrowUp') setPointer((current) => ({ ...current, y: clamp(current.y - 0.04, 0, 1), active: true }))
          if (event.key === 'ArrowDown') setPointer((current) => ({ ...current, y: clamp(current.y + 0.04, 0, 1), active: true }))
        }}
      >
        <div className="flex flex-wrap justify-center px-6 text-center font-[var(--hero-font)] text-[clamp(2.4rem,7vw,5rem)] tracking-[-0.08em] text-[var(--text)]">
          {letters.map((letter, index) => {
            const anchor = letters.length <= 1 ? 0.5 : index / Math.max(letters.length - 1, 1)
            const distanceFromPointer = Math.abs(pointer.x - anchor)
            const offsetX = pointer.active && !reducedMotion && !paused ? (0.5 - distanceFromPointer) * 48 * motionIntensity : 0
            const offsetY = reducedMotion || paused ? 0 : Math.sin(index * 0.7 + pointer.x * 5) * 18 * elasticity - gravity * 12
            const rotate = reducedMotion || paused ? 0 : lerp(-10, 10, clamp(pointer.y + anchor * 0.2, 0, 1)) * motionIntensity
            return (
              <span
                key={`${letter}-${index}`}
                className="inline-block whitespace-pre transition-transform duration-150"
                style={{ transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotate}deg)`, paddingInline: `${spacing * 0.12}em` }}
              >
                {letter === ' ' ? '\u00A0' : letter}
              </span>
            )
          })}
        </div>
      </div>
    </DemoControls>
  )
}
