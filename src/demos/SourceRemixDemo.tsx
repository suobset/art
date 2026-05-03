import { useMemo, useState } from 'react'
import { DemoControls } from '../components/DemoControls'
import { Parameter } from '../components/Parameter'
import type { DemoComponentProps } from '../lib/demoTypes'
import { createSeededRandom } from '../lib/random'

const defaultSource = `orbit = 5.2
petals = 7
jitter = 0.32
thickness = 1.4`

type Constants = {
  orbit: number
  petals: number
  jitter: number
  thickness: number
}

function parseSource(source: string): { values: Constants | null; error: string } {
  const result: Partial<Constants> = {}
  for (const line of source.split('\n')) {
    const match = line.match(/^\s*(orbit|petals|jitter|thickness)\s*=\s*(-?\d+(?:\.\d+)?)\s*$/)
    if (!match) {
      return { values: null, error: `Could not read: ${line || '(blank line)'}` }
    }
    result[match[1] as keyof Constants] = Number(match[2])
  }
  if (result.orbit === undefined || result.petals === undefined || result.jitter === undefined || result.thickness === undefined) {
    return { values: null, error: 'Each constant needs one line.' }
  }
  return { values: result as Constants, error: '' }
}

function mutate(source: string) {
  const parsed = parseSource(source)
  if (!parsed.values) return source
  const random = createSeededRandom(Date.now())
  return `orbit = ${(parsed.values.orbit + (random() - 0.5) * 2).toFixed(2)}\npetals = ${Math.max(3, Math.round(parsed.values.petals + (random() - 0.5) * 4))}\njitter = ${Math.max(0, parsed.values.jitter + (random() - 0.5) * 0.2).toFixed(2)}\nthickness = ${Math.max(0.6, parsed.values.thickness + (random() - 0.5) * 0.6).toFixed(2)}`
}

export function SourceRemixDemo(_: DemoComponentProps) {
  const [source, setSource] = useState(defaultSource)
  const [applied, setApplied] = useState(defaultSource)
  const [error, setError] = useState('')

  const parsed = useMemo(() => parseSource(applied), [applied])
  const values = parsed.values ?? { orbit: 5.2, petals: 7, jitter: 0.32, thickness: 1.4 }
  const petals = Array.from({ length: values.petals }, (_, index) => {
    const angle = (Math.PI * 2 * index) / values.petals
    const radius = 58 + Math.sin(angle * values.orbit) * 22
    const x = 180 + Math.cos(angle) * radius
    const y = 160 + Math.sin(angle) * radius
    const controlX = 180 + Math.cos(angle + values.jitter) * (radius + 34)
    const controlY = 160 + Math.sin(angle + values.jitter) * (radius + 34)
    return { x, y, controlX, controlY }
  })

  return (
    <DemoControls
      actions={
        <>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                const next = parseSource(source)
                if (!next.values) {
                  setError(next.error)
                  return
                }
                setError('')
                setApplied(source)
              }}
              className="rounded-full border border-[var(--line)] px-3 py-2 text-sm text-[var(--text)]"
            >
              apply
            </button>
            <button type="button" onClick={() => { setSource(defaultSource); setApplied(defaultSource); setError('') }} className="rounded-full border border-[var(--line)] px-3 py-2 text-sm text-[var(--text)]">
              reset
            </button>
            <button type="button" onClick={() => setSource((current) => mutate(current))} className="rounded-full border border-[var(--line)] px-3 py-2 text-sm text-[var(--text)]">
              random safe mutation
            </button>
          </div>
          <Parameter label="editable constants">
            <textarea value={source} onChange={(event) => setSource(event.target.value)} rows={8} className="rounded-xl border border-[var(--line)] bg-black/20 px-3 py-2 font-[var(--mono-font)] text-xs" />
          </Parameter>
          <p className="text-sm text-[var(--soft)]">Invalid edits are handled gently. The artwork changes only when the tiny source passes the parser.</p>
          {error ? <p className="rounded-xl border border-[var(--accent)] bg-[rgba(255,122,89,0.12)] px-3 py-2 text-sm text-[var(--text)]">{error}</p> : null}
        </>
      }
    >
      <div className="grid h-full gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.25rem] bg-[radial-gradient(circle_at_top,rgba(255,95,210,0.18),transparent_35%),#120d16] p-4">
          <svg viewBox="0 0 360 320" role="img" aria-label="An abstract flower changes shape as source constants are edited.">
            {petals.map((petal, index) => (
              <path
                key={`${petal.x}-${petal.y}`}
                d={`M 180 160 Q ${petal.controlX} ${petal.controlY} ${petal.x} ${petal.y} Q ${180 + (petal.controlX - 180) * 0.4} ${160 + (petal.controlY - 160) * 0.4} 180 160`}
                fill="none"
                stroke={`hsl(${index * (320 / values.petals) + 18} 92% 70%)`}
                strokeWidth={values.thickness}
                opacity={0.9}
              />
            ))}
            <circle cx="180" cy="160" r="12" fill="#f6eedf" />
          </svg>
        </div>
        <div className="space-y-4 rounded-[1.25rem] bg-black/20 p-4 text-sm text-[var(--muted)]">
          <p className="text-[var(--text)]">Applied source</p>
          <pre className="overflow-x-auto rounded-2xl bg-black/25 p-3 font-[var(--mono-font)] text-xs text-[var(--accent-3)]">{applied}</pre>
          <p>Try changing <span className="font-[var(--mono-font)] text-[var(--text)]">petals</span> to a prime number, then raise <span className="font-[var(--mono-font)] text-[var(--text)]">orbit</span>.</p>
          <p className="text-[var(--soft)]">Canvas description: a readable set of constants controls the flower-like drawing. The source is part of the piece.</p>
        </div>
      </div>
    </DemoControls>
  )
}
