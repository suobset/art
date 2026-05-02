import { useMemo, useState } from 'react'
import { DemoControls } from '../components/DemoControls'
import { Parameter } from '../components/Parameter'
import { SeedControls } from '../components/SeedControls'
import { useSeed } from '../hooks/useSeed'
import type { DemoComponentProps } from '../lib/demoTypes'
import { createSeededRandom, randomBetween } from '../lib/random'

type Season = 'spring' | 'summer' | 'autumn' | 'winter'
type Branch = { x1: number; y1: number; x2: number; y2: number; depth: number; leaf: boolean }

const palettes: Record<Season, { branch: string; leaves: string[]; sky: string }> = {
  spring: { branch: '#5c4033', leaves: ['#c7f9cc', '#80ed99', '#57cc99'], sky: '#112019' },
  summer: { branch: '#6f4e37', leaves: ['#d8ff62', '#90be6d', '#43aa8b'], sky: '#101a13' },
  autumn: { branch: '#5d4037', leaves: ['#ffb703', '#fb8500', '#e63946'], sky: '#1d140f' },
  winter: { branch: '#d6d3f0', leaves: ['#f1f5f9', '#cbd5e1', '#94a3b8'], sky: '#0c1320' },
}

function grow(
  random: () => number,
  x: number,
  y: number,
  length: number,
  angle: number,
  depth: number,
  asymmetry: number,
  leafDensity: number,
  store: Branch[],
) {
  const x2 = x + Math.cos(angle) * length
  const y2 = y - Math.sin(angle) * length
  const leaf = depth <= 1 || random() < leafDensity * 0.35
  store.push({ x1: x, y1: y, x2, y2, depth, leaf })
  if (depth === 0) return
  const spread = randomBetween(random, 0.2, 0.55) + asymmetry * 0.08
  const nextLength = length * randomBetween(random, 0.68, 0.82)
  grow(random, x2, y2, nextLength, angle + spread, depth - 1, asymmetry, leafDensity, store)
  grow(random, x2, y2, nextLength, angle - spread * (1 + asymmetry * 0.4), depth - 1, asymmetry, leafDensity, store)
  if (random() > 0.62) {
    grow(random, x2, y2, nextLength * 0.72, angle + randomBetween(random, -0.4, 0.4), depth - 1, asymmetry, leafDensity, store)
  }
}

export function RecursiveGardenDemo({ reducedMotion }: DemoComponentProps) {
  const [branchingAngle, setBranchingAngle] = useState(0.38)
  const [depth, setDepth] = useState(7)
  const [asymmetry, setAsymmetry] = useState(0.25)
  const [leafDensity, setLeafDensity] = useState(0.7)
  const [wind, setWind] = useState(0.2)
  const [season, setSeason] = useState<Season>('summer')
  const [hoveredDepth, setHoveredDepth] = useState<number | null>(null)
  const { seed, remix } = useSeed()

  const branches = useMemo(() => {
    const random = createSeededRandom(seed)
    const store: Branch[] = []
    grow(random, 300, 320, 72, Math.PI / 2, depth, asymmetry + branchingAngle, leafDensity, store)
    return store
  }, [asymmetry, branchingAngle, depth, leafDensity, seed])

  const palette = palettes[season]

  return (
    <DemoControls
      actions={
        <>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { setBranchingAngle(0.38); setDepth(7); setAsymmetry(0.25); setLeafDensity(0.7); setWind(0.2); setSeason('summer') }} className="rounded-full border border-[var(--line)] px-3 py-2 text-sm text-[var(--text)]">
              reset
            </button>
            <SeedControls seed={seed} onRandomize={remix} />
          </div>
          <Parameter label="branching angle" value={branchingAngle.toFixed(2)}>
            <input type="range" min="0.15" max="0.8" step="0.01" value={branchingAngle} onChange={(event) => setBranchingAngle(Number(event.target.value))} />
          </Parameter>
          <Parameter label="depth" value={String(depth)}>
            <input type="range" min="4" max="9" step="1" value={depth} onChange={(event) => setDepth(Number(event.target.value))} />
          </Parameter>
          <Parameter label="asymmetry" value={asymmetry.toFixed(2)}>
            <input type="range" min="0" max="0.8" step="0.01" value={asymmetry} onChange={(event) => setAsymmetry(Number(event.target.value))} />
          </Parameter>
          <Parameter label="leaf density" value={leafDensity.toFixed(2)}>
            <input type="range" min="0.2" max="1" step="0.05" value={leafDensity} onChange={(event) => setLeafDensity(Number(event.target.value))} />
          </Parameter>
          <Parameter label="wind" value={wind.toFixed(2)}>
            <input type="range" min="0" max="1" step="0.05" value={wind} onChange={(event) => setWind(Number(event.target.value))} />
          </Parameter>
          <Parameter label="season">
            <select value={season} onChange={(event) => setSeason(event.target.value as Season)} className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2">
              <option value="spring" className="bg-[#120f15]">spring</option>
              <option value="summer" className="bg-[#120f15]">summer</option>
              <option value="autumn" className="bg-[#120f15]">autumn</option>
              <option value="winter" className="bg-[#120f15]">winter</option>
            </select>
          </Parameter>
          <p className="text-sm text-[var(--soft)]">Hover any branch to reveal its recursion depth. In reduced motion the tree stays still.</p>
        </>
      }
    >
      <div className="rounded-[1.25rem] p-2" style={{ background: palette.sky }}>
        <svg viewBox="0 0 600 340" role="img" aria-label="A recursive tree grows from repeated branching rules.">
          {branches.map((branch, index) => {
            const sway = reducedMotion ? 0 : Math.sin(index * 0.8 + wind * 5) * wind * 6 * (1 - branch.depth / (depth + 1))
            return (
              <g key={`${branch.x1}-${branch.y1}-${index}`}>
                <line
                  x1={branch.x1}
                  y1={branch.y1}
                  x2={branch.x2 + sway}
                  y2={branch.y2}
                  stroke={hoveredDepth === null || hoveredDepth === branch.depth ? palette.branch : 'rgba(255,255,255,0.14)'}
                  strokeWidth={Math.max(1, branch.depth * 0.8)}
                  onPointerEnter={() => setHoveredDepth(branch.depth)}
                  onPointerLeave={() => setHoveredDepth(null)}
                />
                {branch.leaf ? (
                  <circle
                    cx={branch.x2 + sway}
                    cy={branch.y2}
                    r={2 + branch.depth * 0.3}
                    fill={palette.leaves[index % palette.leaves.length]}
                    opacity={0.88}
                  />
                ) : null}
              </g>
            )
          })}
        </svg>
      </div>
    </DemoControls>
  )
}
