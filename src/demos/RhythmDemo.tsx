import { useEffect, useMemo, useRef, useState } from 'react'
import { DemoControls } from '../components/DemoControls'
import { Parameter } from '../components/Parameter'
import { SeedControls } from '../components/SeedControls'
import { useSeed } from '../hooks/useSeed'
import { playPulse, type PulseVoice, createSafeAudioContext } from '../lib/audio'
import type { DemoComponentProps } from '../lib/demoTypes'
import { clamp } from '../lib/geometry'
import { euclideanRhythm } from '../lib/music'
import { createSeededRandom, pickOne, randomBetween } from '../lib/random'

const voices: PulseVoice[] = ['soft-click', 'wood-block', 'sine-ping', 'low-tom', 'plucked-blip']

const defaults = {
  steps: 16,
  pulses: 5,
  rotation: 2,
  tempo: 96,
  accentStrength: 0.55,
  swing: 0.08,
  voice: 'wood-block' as PulseVoice,
  volume: 0.14,
}

function makeDefaultAccents(steps: number) {
  return Array.from({ length: steps }, (_, index) => index % 4 === 0)
}

export function RhythmDemo({ reducedMotion }: DemoComponentProps) {
  const [steps, setSteps] = useState(defaults.steps)
  const [pulses, setPulses] = useState(defaults.pulses)
  const [rotation, setRotation] = useState(defaults.rotation)
  const [tempo, setTempo] = useState(defaults.tempo)
  const [accentStrength, setAccentStrength] = useState(defaults.accentStrength)
  const [swing, setSwing] = useState(defaults.swing)
  const [voice, setVoice] = useState<PulseVoice>(defaults.voice)
  const [volume, setVolume] = useState(defaults.volume)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [playhead, setPlayhead] = useState(0)
  const [audioStatus, setAudioStatus] = useState('Sound is off until you press play.')
  const [manualPattern, setManualPattern] = useState<boolean[] | null>(null)
  const [accents, setAccents] = useState<boolean[]>(() => makeDefaultAccents(defaults.steps))
  const timerRef = useRef<number | null>(null)
  const stepRef = useRef(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const { seed, remix } = useSeed()

  const generatedPattern = useMemo(() => euclideanRhythm(steps, pulses, rotation), [steps, pulses, rotation])
  const pattern = manualPattern ?? generatedPattern
  const currentSummary = `Current rhythm: ${pattern.filter(Boolean).length} pulses distributed over ${steps} steps, rotated by ${rotation} steps, playing at ${tempo} BPM.`

  useEffect(() => {
    setManualPattern(null)
    setAccents(makeDefaultAccents(steps))
    stepRef.current = 0
    setPlayhead(0)
  }, [steps, pulses, rotation])

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!playing) {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
      return
    }

    const intervalMs = (60 / tempo) * 1000 * 0.5
    const runStep = async () => {
      const index = stepRef.current % steps
      setPlayhead(index)

      if (pattern[index] && !muted) {
        try {
          const context = audioContextRef.current ?? await createSafeAudioContext()
          audioContextRef.current = context
          const accent = accents[index] ? 1 + accentStrength : 1
          playPulse(context, context.currentTime + 0.01, voice, volume, accent)
          setAudioStatus('Audio is active. Use mute or pause to silence the loop.')
        } catch (error) {
          setAudioStatus(error instanceof Error ? error.message : 'Audio is unavailable in this browser, but the visual score still works.')
        }
      }

      stepRef.current = (stepRef.current + 1) % steps
      const swingOffset = index % 2 === 0 ? 1 : 1 + swing
      const nextDelay = reducedMotion ? intervalMs * 1.25 : intervalMs * swingOffset
      timerRef.current = window.setTimeout(runStep, nextDelay)
    }

    void runStep()

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [playing, tempo, steps, pattern, muted, voice, volume, swing, accents, accentStrength, reducedMotion])

  const reset = () => {
    setSteps(defaults.steps)
    setPulses(defaults.pulses)
    setRotation(defaults.rotation)
    setTempo(defaults.tempo)
    setAccentStrength(defaults.accentStrength)
    setSwing(defaults.swing)
    setVoice(defaults.voice)
    setVolume(defaults.volume)
    setMuted(false)
    setPlaying(false)
    setManualPattern(null)
    setAccents(makeDefaultAccents(defaults.steps))
    stepRef.current = 0
    setPlayhead(0)
  }

  const remixPattern = () => {
    const random = createSeededRandom(seed)
    const nextSteps = Math.round(randomBetween(random, 8, 24))
    const nextPulses = Math.round(randomBetween(random, 2, nextSteps - 1))
    setSteps(nextSteps)
    setPulses(nextPulses)
    setRotation(Math.floor(randomBetween(random, 0, nextSteps)))
    setTempo(Math.round(randomBetween(random, 68, 140)))
    setSwing(Number(randomBetween(random, 0, 0.22).toFixed(2)))
    setAccentStrength(Number(randomBetween(random, 0.2, 0.9).toFixed(2)))
    setVoice(pickOne(random, voices))
    setVolume(Number(randomBetween(random, 0.1, 0.2).toFixed(2)))
    remix()
  }

  const radius = 120
  const center = 155

  return (
    <DemoControls
      actions={
        <>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setPlaying((value) => !value)} className="control-button" data-variant="primary">
              {playing ? 'pause' : 'play'}
            </button>
            <button type="button" onClick={() => setMuted((value) => !value)} className="control-button">
              {muted ? 'unmute' : 'mute'}
            </button>
            <button
              type="button"
              onClick={() => {
                const next = stepRef.current % steps
                setPlayhead(next)
                stepRef.current = (next + 1) % steps
              }}
              className="control-button"
            >
              step
            </button>
            <button type="button" onClick={reset} className="control-button">
              reset
            </button>
            <button type="button" onClick={remixPattern} className="control-button">
              remix
            </button>
            <SeedControls seed={seed} onRandomize={remixPattern} />
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(String(seed))
                  setAudioStatus(`Seed ${seed} copied to clipboard.`)
                } catch {
                  setAudioStatus('Clipboard is unavailable, but the current seed stays visible.')
                }
              }}
              className="control-button"
            >
              copy seed
            </button>
          </div>
          <p className="text-sm text-[var(--soft)]">{currentSummary}</p>
          <p className="text-sm text-[var(--soft)]">{audioStatus}</p>
          <Parameter label="steps" value={String(steps)}>
            <input type="range" min="4" max="32" step="1" value={steps} onChange={(event) => setSteps(Number(event.target.value))} />
          </Parameter>
          <Parameter label="pulses" value={String(pulses)}>
            <input type="range" min="0" max={steps} step="1" value={pulses} onChange={(event) => setPulses(clamp(Number(event.target.value), 0, steps))} />
          </Parameter>
          <Parameter label="rotation" value={String(rotation)}>
            <input type="range" min="0" max={Math.max(0, steps - 1)} step="1" value={rotation} onChange={(event) => setRotation(Number(event.target.value))} />
          </Parameter>
          <Parameter label="tempo" value={`${tempo} bpm`}>
            <input type="range" min="40" max="180" step="1" value={tempo} onChange={(event) => setTempo(Number(event.target.value))} />
          </Parameter>
          <Parameter label="accent strength" value={accentStrength.toFixed(2)}>
            <input type="range" min="0" max="1" step="0.01" value={accentStrength} onChange={(event) => setAccentStrength(Number(event.target.value))} />
          </Parameter>
          <Parameter label="swing" value={swing.toFixed(2)}>
            <input type="range" min="0" max="0.35" step="0.01" value={swing} onChange={(event) => setSwing(Number(event.target.value))} />
          </Parameter>
          <Parameter label="voice / timbre">
            <select value={voice} onChange={(event) => setVoice(event.target.value as PulseVoice)} className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]">
              {voices.map((option) => (
                <option key={option} value={option} className="bg-[#120f15]">
                  {option}
                </option>
              ))}
            </select>
          </Parameter>
          <Parameter label="volume" value={volume.toFixed(2)}>
            <input type="range" min="0" max="0.4" step="0.01" value={volume} onChange={(event) => setVolume(Number(event.target.value))} />
          </Parameter>
          <p className="text-sm text-[var(--soft)]">Click a step to toggle it. Shift-click an active step to accent it.</p>
          <p className="text-sm text-[var(--soft)]">Canvas description: a looping circle of steps shows which pulses are active, accented, and currently being played.</p>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div className="flex items-center justify-center rounded-[1.25rem] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_45%),rgba(0,0,0,0.2)] p-4">
          <svg viewBox="0 0 310 310" role="img" aria-label={currentSummary} className="max-w-[310px]">
            <circle cx={center} cy={center} r={radius + 12} fill="none" stroke="var(--rule)" strokeWidth="1" />
            <circle cx={center} cy={center} r={radius - 24} fill="none" stroke="var(--rule)" strokeWidth="1" strokeDasharray="4 8" />
            {pattern.map((isActive, index) => {
              const angle = (Math.PI * 2 * index) / steps - Math.PI / 2
              const x = center + Math.cos(angle) * radius
              const y = center + Math.sin(angle) * radius
              const accented = accents[index]
              const active = playhead === index
              return (
                <g
                  key={`${index}-${isActive}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`step ${index + 1}, ${isActive ? 'active' : 'inactive'}${accented ? ', accented' : ''}`}
                  className="cursor-pointer"
                  onClick={(event) => {
                    if (event.shiftKey) {
                      setAccents((current) => current.map((item, accentIndex) => (accentIndex === index ? !item : item)))
                      return
                    }
                    const next = [...pattern]
                    next[index] = !next[index]
                    setManualPattern(next)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      const next = [...pattern]
                      next[index] = !next[index]
                      setManualPattern(next)
                    }
                    if (event.key.toLowerCase() === 'a') {
                      event.preventDefault()
                      setAccents((current) => current.map((item, accentIndex) => (accentIndex === index ? !item : item)))
                    }
                  }}
                >
                  <line x1={center} y1={center} x2={x} y2={y} stroke="var(--rule)" strokeWidth="1" opacity={0.45} />
                  <circle cx={x} cy={y} r={active ? 18 : 14} fill={isActive ? (accented ? 'var(--accent)' : 'var(--accent-2)') : 'var(--surface-subtle)'} stroke={active ? 'var(--accent-3)' : 'var(--rule-strong)'} strokeWidth={active ? 3 : accented ? 2 : 1.5} />
                  <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fill={isActive ? '#111' : 'var(--text-faint)'}>{index + 1}</text>
                  <circle cx={x} cy={y} r={22} fill="transparent" />
                </g>
              )
            })}
            <circle cx={center} cy={center} r="34" fill="var(--surface-note)" stroke="var(--rule-strong)" />
            <text x={center} y={center - 2} textAnchor="middle" fontSize="12" fill="var(--text)">{tempo} bpm</text>
            <text x={center} y={center + 14} textAnchor="middle" fontSize="10" fill="var(--text-faint)">{voice}</text>
          </svg>
        </div>
        <div className="surface-note p-4 text-sm text-[var(--text-muted)]">
          <p className="meta-label mb-3">pulse machine</p>
          <div className="grid grid-cols-4 gap-2">
            {pattern.map((isActive, index) => {
              const active = playhead === index
              const accented = accents[index]
              return (
                <button
                  key={`cell-${index}`}
                  type="button"
                  onClick={(event) => {
                    if (event.shiftKey) {
                      setAccents((current) => current.map((item, accentIndex) => (accentIndex === index ? !item : item)))
                      return
                    }
                    const next = [...pattern]
                    next[index] = !next[index]
                    setManualPattern(next)
                  }}
                  className="rounded-[0.75rem] border px-3 py-3 text-left text-xs"
                  style={{
                    borderColor: active ? 'var(--accent-3)' : 'var(--rule)',
                    background: isActive ? (accented ? 'var(--accent)' : 'var(--accent-soft)') : 'var(--surface-subtle)',
                    color: isActive ? '#17120e' : 'var(--text-muted)',
                  }}
                >
                  <div className="font-[var(--mono-font)]">{String(index + 1).padStart(2, '0')}</div>
                  <div>{isActive ? (accented ? 'accent' : 'pulse') : 'rest'}</div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </DemoControls>
  )
}
