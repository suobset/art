import { useEffect, useMemo, useRef, useState } from 'react'
import { DemoControls } from '../components/DemoControls'
import { Parameter } from '../components/Parameter'
import { SeedControls } from '../components/SeedControls'
import { useSeed } from '../hooks/useSeed'
import { createSafeAudioContext, playTonalNote, type ToneVoice } from '../lib/audio'
import type { DemoComponentProps } from '../lib/demoTypes'
import { clamp } from '../lib/geometry'
import {
  clampMidi,
  degreeToMidi,
  delayPhrase,
  getScaleDegrees,
  invertPhrase,
  type NoteEvent,
  type NoteName,
  NOTE_NAMES,
  retrogradePhrase,
  type ScaleName,
  transposePhrase,
} from '../lib/music'
import { createSeededRandom, pickOne, randomBetween } from '../lib/random'

type MotionStyle = 'mostly stepwise' | 'mixed' | 'leaping' | 'arch' | 'wave'
type IntervalRule = 'seconds and thirds' | 'thirds and fourths' | 'open fifths'
type Transformation = 'delay only' | 'transpose up a fifth' | 'transpose down a fourth' | 'invert around root' | 'retrograde' | 'retrograde inversion' | 'contrary motion'

const scales: ScaleName[] = ['major', 'minor', 'dorian', 'mixolydian', 'pentatonic', 'chromatic']
const motionStyles: MotionStyle[] = ['mostly stepwise', 'mixed', 'leaping', 'arch', 'wave']
const intervalRules: IntervalRule[] = ['seconds and thirds', 'thirds and fourths', 'open fifths']
const transformations: Transformation[] = ['delay only', 'transpose up a fifth', 'transpose down a fourth', 'invert around root', 'retrograde', 'retrograde inversion', 'contrary motion']
const toneVoices: ToneVoice[] = ['sine', 'triangle', 'plucked']

const defaults = {
  root: 'C' as NoteName,
  scale: 'dorian' as ScaleName,
  phraseLength: 7,
  motionStyle: 'mixed' as MotionStyle,
  intervalRule: 'seconds and thirds' as IntervalRule,
  voiceDelay: 2,
  transformation: 'invert around root' as Transformation,
  tempo: 88,
  range: 15,
  density: 0.75,
  volume: 0.12,
  voice: 'triangle' as ToneVoice,
}

function makePhrase(options: {
  root: NoteName
  scale: ScaleName
  phraseLength: number
  motionStyle: MotionStyle
  intervalRule: IntervalRule
  range: number
  density: number
  seed: number
}) {
  const random = createSeededRandom(options.seed)
  const degrees = getScaleDegrees(options.scale)
  const centerDegree = Math.floor(degrees.length * 1.5)
  let currentDegree = centerDegree
  let beat = 0
  const notes: NoteEvent[] = []

  const motionChoices = (() => {
    if (options.intervalRule === 'open fifths') return [0, 2, 4]
    if (options.intervalRule === 'thirds and fourths') return [1, 2, 3]
    return [1, 1, 2]
  })()

  for (let index = 0; index < options.phraseLength; index += 1) {
    const duration = pickOne(random, [0.5, 0.75, 1, 1.25])
    if (random() > options.density) {
      beat += duration
      continue
    }

    const direction = random() > 0.5 ? 1 : -1
    const stepSize = pickOne(random, motionChoices)
    if (options.motionStyle === 'mostly stepwise') {
      currentDegree += direction * Math.min(stepSize, 1)
    } else if (options.motionStyle === 'leaping') {
      currentDegree += direction * Math.max(2, stepSize + 1)
    } else if (options.motionStyle === 'arch') {
      const midpoint = options.phraseLength / 2
      currentDegree += index < midpoint ? stepSize : -stepSize
    } else if (options.motionStyle === 'wave') {
      currentDegree = centerDegree + Math.round(Math.sin(index * 1.1) * 3)
    } else {
      currentDegree += direction * stepSize
    }

    const midi = clampMidi(degreeToMidi(options.root, options.scale, currentDegree, 4), 60 - options.range, 72 + options.range)
    notes.push({
      midi,
      start: beat,
      duration,
      velocity: Number(randomBetween(random, 0.68, 1).toFixed(2)),
      voice: 0,
    })
    beat += duration
  }

  return { notes, totalBeats: Math.max(beat, 4) }
}

function transformPhrase(
  phrase: NoteEvent[],
  transformation: Transformation,
  delay: number,
  axisMidi: number,
  totalBeats: number,
) {
  let transformed = phrase.map((note) => ({ ...note, voice: 1 }))

  if (transformation === 'transpose up a fifth') {
    transformed = transposePhrase(transformed, 7)
  } else if (transformation === 'transpose down a fourth') {
    transformed = transposePhrase(transformed, -5)
  } else if (transformation === 'invert around root') {
    transformed = invertPhrase(transformed, axisMidi)
  } else if (transformation === 'retrograde') {
    transformed = retrogradePhrase(transformed, totalBeats)
  } else if (transformation === 'retrograde inversion') {
    transformed = retrogradePhrase(invertPhrase(transformed, axisMidi), totalBeats)
  } else if (transformation === 'contrary motion') {
    transformed = invertPhrase(transformed, phrase[0]?.midi ?? axisMidi)
  }

  return delayPhrase(transformed, delay).map((note) => ({ ...note, voice: 1 }))
}

export function CounterpointDemo({ reducedMotion }: DemoComponentProps) {
  const [root, setRoot] = useState<NoteName>(defaults.root)
  const [scale, setScale] = useState<ScaleName>(defaults.scale)
  const [phraseLength, setPhraseLength] = useState(defaults.phraseLength)
  const [motionStyle, setMotionStyle] = useState<MotionStyle>(defaults.motionStyle)
  const [intervalRule, setIntervalRule] = useState<IntervalRule>(defaults.intervalRule)
  const [voiceDelay, setVoiceDelay] = useState(defaults.voiceDelay)
  const [transformation, setTransformation] = useState<Transformation>(defaults.transformation)
  const [tempo, setTempo] = useState(defaults.tempo)
  const [range, setRange] = useState(defaults.range)
  const [density, setDensity] = useState(defaults.density)
  const [volume, setVolume] = useState(defaults.volume)
  const [voice, setVoice] = useState<ToneVoice>(defaults.voice)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [playheadBeat, setPlayheadBeat] = useState(0)
  const [audioStatus, setAudioStatus] = useState('Sound is off until you press play.')
  const tickRef = useRef<number | null>(null)
  const beatRef = useRef(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const { seed, remix, setSeed } = useSeed()

  const phraseData = useMemo(
    () => makePhrase({ root, scale, phraseLength, motionStyle, intervalRule, range, density, seed }),
    [root, scale, phraseLength, motionStyle, intervalRule, range, density, seed],
  )

  const axisMidi = degreeToMidi(root, scale, 0, 4)
  const secondVoice = useMemo(
    () => transformPhrase(phraseData.notes, transformation, voiceDelay, axisMidi, phraseData.totalBeats),
    [phraseData, transformation, voiceDelay, axisMidi],
  )

  const notes = useMemo(() => [...phraseData.notes, ...secondVoice], [phraseData.notes, secondVoice])
  const totalBeats = useMemo(() => Math.max(phraseData.totalBeats, ...secondVoice.map((note) => note.start + note.duration), 4), [phraseData.totalBeats, secondVoice])
  const midiRange = useMemo(() => {
    const midis = notes.map((note) => note.midi)
    return {
      min: Math.min(...midis, axisMidi - range),
      max: Math.max(...midis, axisMidi + range),
    }
  }, [notes, axisMidi, range])
  const summary = `Current counterpoint: ${root} ${scale} phrase, ${motionStyle} motion, second voice enters ${voiceDelay} beats later with ${transformation}.`

  useEffect(() => {
    beatRef.current = 0
    setPlayheadBeat(0)
  }, [seed, root, scale, phraseLength, motionStyle, intervalRule, voiceDelay, transformation, tempo, range, density])

  useEffect(() => {
    return () => {
      if (tickRef.current !== null) {
        window.clearTimeout(tickRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!playing) {
      if (tickRef.current !== null) {
        window.clearTimeout(tickRef.current)
      }
      return
    }

    const beatDurationMs = (60 / tempo) * 1000 * 0.25
    const runTick = async () => {
      const currentBeat = beatRef.current
      setPlayheadBeat(currentBeat)

      if (!muted) {
        try {
          const context = audioContextRef.current ?? await createSafeAudioContext()
          audioContextRef.current = context
          const dueNotes = notes.filter((note) => Math.abs(note.start - currentBeat) < 0.001)
          dueNotes.forEach((note) => {
            playTonalNote(context, context.currentTime + 0.01, {
              midi: note.midi,
              duration: Math.max(0.12, note.duration * 0.38),
              gain: volume * note.velocity,
              voice,
            })
          })
          setAudioStatus('Audio is active. Use mute or pause to silence the voices.')
        } catch (error) {
          setAudioStatus(error instanceof Error ? error.message : 'Audio is unavailable in this browser, but the visual score still works.')
        }
      }

      const nextBeat = Number((currentBeat + 0.25).toFixed(2))
      beatRef.current = nextBeat >= totalBeats ? 0 : nextBeat
      tickRef.current = window.setTimeout(runTick, reducedMotion ? beatDurationMs * 1.3 : beatDurationMs)
    }

    void runTick()

    return () => {
      if (tickRef.current !== null) {
        window.clearTimeout(tickRef.current)
      }
    }
  }, [playing, muted, tempo, notes, totalBeats, volume, voice, reducedMotion])

  const reset = () => {
    setRoot(defaults.root)
    setScale(defaults.scale)
    setPhraseLength(defaults.phraseLength)
    setMotionStyle(defaults.motionStyle)
    setIntervalRule(defaults.intervalRule)
    setVoiceDelay(defaults.voiceDelay)
    setTransformation(defaults.transformation)
    setTempo(defaults.tempo)
    setRange(defaults.range)
    setDensity(defaults.density)
    setVolume(defaults.volume)
    setVoice(defaults.voice)
    setPlaying(false)
    setMuted(false)
    beatRef.current = 0
    setPlayheadBeat(0)
  }

  const remixPhrase = () => {
    const random = createSeededRandom(seed)
    setRoot(pickOne(random, [...NOTE_NAMES]))
    setScale(pickOne(random, scales))
    setPhraseLength(Math.round(randomBetween(random, 5, 10)))
    setMotionStyle(pickOne(random, motionStyles))
    setIntervalRule(pickOne(random, intervalRules))
    setVoiceDelay(Number(randomBetween(random, 1, 4).toFixed(1)))
    setTransformation(pickOne(random, transformations))
    setTempo(Math.round(randomBetween(random, 60, 128)))
    setRange(Math.round(randomBetween(random, 8, 18)))
    setDensity(Number(randomBetween(random, 0.45, 0.95).toFixed(2)))
    setVoice(pickOne(random, toneVoices))
    setVolume(Number(randomBetween(random, 0.1, 0.16).toFixed(2)))
    remix()
  }

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
                const nextBeat = Number((beatRef.current + 0.25).toFixed(2))
                beatRef.current = nextBeat >= totalBeats ? 0 : nextBeat
                setPlayheadBeat(beatRef.current)
              }}
              className="control-button"
            >
              step
            </button>
            <button type="button" onClick={reset} className="control-button">reset</button>
            <button type="button" onClick={remixPhrase} className="control-button">remix</button>
            <SeedControls seed={seed} onRandomize={() => setSeed(seed)} />
          </div>
          <p className="text-sm text-[var(--soft)]">{summary}</p>
          <p className="text-sm text-[var(--soft)]">{audioStatus}</p>
          <Parameter label="root note">
            <select value={root} onChange={(event) => setRoot(event.target.value as NoteName)} className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]">
              {NOTE_NAMES.map((note) => <option key={note} value={note} className="bg-[#120f15]">{note}</option>)}
            </select>
          </Parameter>
          <Parameter label="scale">
            <select value={scale} onChange={(event) => setScale(event.target.value as ScaleName)} className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]">
              {scales.map((option) => <option key={option} value={option} className="bg-[#120f15]">{option}</option>)}
            </select>
          </Parameter>
          <Parameter label="phrase length" value={String(phraseLength)}>
            <input type="range" min="4" max="12" step="1" value={phraseLength} onChange={(event) => setPhraseLength(Number(event.target.value))} />
          </Parameter>
          <Parameter label="motion style">
            <select value={motionStyle} onChange={(event) => setMotionStyle(event.target.value as MotionStyle)} className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]">
              {motionStyles.map((option) => <option key={option} value={option} className="bg-[#120f15]">{option}</option>)}
            </select>
          </Parameter>
          <Parameter label="interval rule">
            <select value={intervalRule} onChange={(event) => setIntervalRule(event.target.value as IntervalRule)} className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]">
              {intervalRules.map((option) => <option key={option} value={option} className="bg-[#120f15]">{option}</option>)}
            </select>
          </Parameter>
          <Parameter label="voice delay" value={`${voiceDelay.toFixed(1)} beats`}>
            <input type="range" min="0" max="4" step="0.5" value={voiceDelay} onChange={(event) => setVoiceDelay(Number(event.target.value))} />
          </Parameter>
          <Parameter label="transformation">
            <select value={transformation} onChange={(event) => setTransformation(event.target.value as Transformation)} className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]">
              {transformations.map((option) => <option key={option} value={option} className="bg-[#120f15]">{option}</option>)}
            </select>
          </Parameter>
          <Parameter label="tempo" value={`${tempo} bpm`}>
            <input type="range" min="40" max="160" step="1" value={tempo} onChange={(event) => setTempo(Number(event.target.value))} />
          </Parameter>
          <Parameter label="range" value={`${range} semitones`}>
            <input type="range" min="6" max="20" step="1" value={range} onChange={(event) => setRange(Number(event.target.value))} />
          </Parameter>
          <Parameter label="density" value={density.toFixed(2)}>
            <input type="range" min="0.3" max="1" step="0.01" value={density} onChange={(event) => setDensity(Number(event.target.value))} />
          </Parameter>
          <Parameter label="voice" >
            <select value={voice} onChange={(event) => setVoice(event.target.value as ToneVoice)} className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]">
              {toneVoices.map((option) => <option key={option} value={option} className="bg-[#120f15]">{option}</option>)}
            </select>
          </Parameter>
          <Parameter label="volume" value={volume.toFixed(2)}>
            <input type="range" min="0" max="0.4" step="0.01" value={volume} onChange={(event) => setVolume(Number(event.target.value))} />
          </Parameter>
          <p className="text-sm text-[var(--soft)]">Canvas description: a piano-roll style score shows an original phrase and a second voice derived from it by a rule.</p>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.25rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent),rgba(0,0,0,0.18)] p-4">
          <svg viewBox="0 0 520 320" role="img" aria-label={summary} className="w-full">
            {Array.from({ length: midiRange.max - midiRange.min + 1 }, (_, index) => {
              const midi = midiRange.max - index
              const y = index * 16
              return (
                <g key={midi}>
                  <line x1="0" y1={y} x2="520" y2={y} stroke="var(--rule)" strokeWidth="1" />
                  {index < midiRange.max - midiRange.min ? <text x="4" y={y + 12} fontSize="8" fill="var(--text-faint)">{midi}</text> : null}
                </g>
              )
            })}
            {Array.from({ length: Math.ceil(totalBeats * 4) + 1 }, (_, index) => {
              const x = (index / (totalBeats * 4)) * 520
              return <line key={`beat-${index}`} x1={x} y1="0" x2={x} y2="320" stroke={index % 4 === 0 ? 'var(--rule-strong)' : 'var(--rule)'} strokeWidth="1" />
            })}
            {notes.map((note, index) => {
              const x = (note.start / totalBeats) * 520
              const width = (note.duration / totalBeats) * 520
              const y = ((midiRange.max - note.midi) / Math.max(1, midiRange.max - midiRange.min + 1)) * 304
              const fill = note.voice === 0 ? 'var(--accent-2)' : 'var(--accent)'
              return <rect key={`${note.voice}-${index}-${note.start}`} x={x + 3} y={y + 2} rx="5" width={Math.max(width - 6, 10)} height="12" fill={fill} opacity={note.voice === 0 ? 0.88 : 0.72} />
            })}
            <line x1={(playheadBeat / totalBeats) * 520} y1="0" x2={(playheadBeat / totalBeats) * 520} y2="320" stroke="var(--accent-3)" strokeWidth="3" />
          </svg>
        </div>
        <div className="surface-note p-4 text-sm text-[var(--text-muted)]">
          <p className="meta-label mb-3">voice relationship</p>
          <ul className="space-y-3">
            <li><span className="font-medium text-[var(--text)]">voice 1:</span> generated from {root} {scale} using {motionStyle} motion.</li>
            <li><span className="font-medium text-[var(--text)]">voice 2:</span> enters {voiceDelay} beats later using {transformation}.</li>
            <li><span className="font-medium text-[var(--text)]">interval rule:</span> {intervalRule} shapes how far the melody tends to move.</li>
            <li><span className="font-medium text-[var(--text)]">read it silently:</span> even muted, the score still shows imitation, delay, and contradiction.</li>
          </ul>
        </div>
      </div>
    </DemoControls>
  )
}
