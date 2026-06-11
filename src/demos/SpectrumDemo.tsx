import { useEffect, useMemo, useRef, useState } from 'react'
import { ImmersiveDemo } from '../components/ImmersiveDemo'
import { Parameter } from '../components/Parameter'
import { createSafeAudioContext } from '../lib/audio'
import type { DemoComponentProps } from '../lib/demoTypes'

type ChordName = 'cmaj9' | 'amin7' | 'lydian' | 'dorian-flow' | 'phrygian' | 'open-fifths'

type Visual = 'ribbon' | 'starburst' | 'rings'

const chords: Record<ChordName, number[]> = {
  cmaj9: [48, 55, 60, 64, 67, 71, 74],
  amin7: [45, 52, 57, 60, 64, 67, 72],
  lydian: [48, 55, 60, 62, 66, 69, 71],
  'dorian-flow': [50, 53, 57, 60, 62, 65, 69],
  phrygian: [48, 51, 55, 58, 60, 63, 67],
  'open-fifths': [48, 55, 60, 67, 72, 79],
}

const visuals: Visual[] = ['ribbon', 'starburst', 'rings']

const palette: [number, number, number][] = [
  [10, 6, 22],
  [50, 12, 80],
  [180, 64, 140],
  [255, 160, 90],
  [255, 230, 180],
]

function paletteSample(t: number) {
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

function midiToFrequency(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

type VoiceNode = {
  osc: OscillatorNode
  detune: OscillatorNode
  filter: BiquadFilterNode
  gain: GainNode
  lfo: OscillatorNode
  lfoGain: GainNode
  pan: StereoPannerNode
}

export function SpectrumDemo({ reducedMotion }: DemoComponentProps) {
  const [chord, setChord] = useState<ChordName>('cmaj9')
  const [visual, setVisual] = useState<Visual>('ribbon')
  const [brightness, setBrightness] = useState(0.55)
  const [drift, setDrift] = useState(0.4)
  const [density, setDensity] = useState(0.7)
  const [volume, setVolume] = useState(0.32)
  const [playing, setPlaying] = useState(false)
  const [status, setStatus] = useState('Audio is suspended until you start the drone.')

  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const ctxRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const voicesRef = useRef<VoiceNode[]>([])
  const animationRef = useRef<number>(0)
  const historyRef = useRef<Uint8Array[]>([])
  const visualRef = useRef(visual)

  const brightnessRef = useRef(brightness)
  const densityRef = useRef(density)
  const reducedRef = useRef(reducedMotion)
  useEffect(() => { brightnessRef.current = brightness }, [brightness])
  useEffect(() => { densityRef.current = density }, [density])
  useEffect(() => { reducedRef.current = reducedMotion }, [reducedMotion])
  useEffect(() => { visualRef.current = visual }, [visual])

  useEffect(() => () => stopDrone(), [])

  useEffect(() => {
    const master = masterRef.current
    const ctx = ctxRef.current
    if (master && ctx) {
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setTargetAtTime(playing ? volume : 0.0001, ctx.currentTime, 0.08)
    }
  }, [volume, playing])

  useEffect(() => {
    if (!playing) return
    rebuildVoices()
  }, [chord, drift, playing])

  useEffect(() => {
    const voices = voicesRef.current
    const ctx = ctxRef.current
    if (!voices.length || !ctx) return
    const cutoff = 180 + brightness * 5800
    voices.forEach((voice) => {
      voice.filter.frequency.setTargetAtTime(cutoff, ctx.currentTime, 0.2)
    })
  }, [brightness])

  function rebuildVoices() {
    const ctx = ctxRef.current
    const master = masterRef.current
    if (!ctx || !master) return
    voicesRef.current.forEach((voice) => {
      voice.osc.stop()
      voice.detune.stop()
      voice.lfo.stop()
      voice.gain.disconnect()
      voice.osc.disconnect()
      voice.detune.disconnect()
      voice.filter.disconnect()
      voice.lfo.disconnect()
      voice.lfoGain.disconnect()
      voice.pan.disconnect()
    })

    const notes = chords[chord]
    const driftHz = 0.04 + drift * 0.3
    voicesRef.current = notes.map((midi, index) => {
      const baseFreq = midiToFrequency(midi)
      const osc = ctx.createOscillator()
      const detune = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      const pan = ctx.createStereoPanner()

      osc.type = index < 2 ? 'sawtooth' : 'sine'
      detune.type = 'sine'
      detune.frequency.value = 4 + drift * 12
      const detuneGain = ctx.createGain()
      detuneGain.gain.value = 1.5 + drift * 5
      detune.connect(detuneGain)
      detuneGain.connect(osc.detune)

      osc.frequency.value = baseFreq

      filter.type = 'lowpass'
      filter.frequency.value = 200 + brightness * 5800
      filter.Q.value = 0.4

      gain.gain.value = 0
      gain.gain.setTargetAtTime(0.07 + Math.random() * 0.04, ctx.currentTime, 1.4)

      lfo.frequency.value = driftHz * (0.5 + Math.random())
      lfoGain.gain.value = 0.018 + drift * 0.05
      lfo.connect(lfoGain)
      lfoGain.connect(gain.gain)

      pan.pan.value = (index / Math.max(notes.length - 1, 1)) * 2 - 1

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(pan)
      pan.connect(master)

      osc.start()
      detune.start()
      lfo.start()

      return { osc, detune, filter, gain, lfo, lfoGain, pan }
    })
  }

  async function startDrone() {
    try {
      const ctx = await createSafeAudioContext()
      ctxRef.current = ctx
      if (!masterRef.current) {
        const master = ctx.createGain()
        master.gain.value = 0.0001
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 2048
        analyser.smoothingTimeConstant = 0.82
        master.connect(analyser)
        analyser.connect(ctx.destination)
        masterRef.current = master
        analyserRef.current = analyser
      }
      setPlaying(true)
      setStatus('Drone active. Slide brightness to open the filter; chord change cross-fades.')
      runVisual()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Audio is unavailable in this browser.')
    }
  }

  function stopDrone() {
    setPlaying(false)
    if (animationRef.current) {
      window.cancelAnimationFrame(animationRef.current)
      animationRef.current = 0
    }
    const ctx = ctxRef.current
    const master = masterRef.current
    if (ctx && master) {
      master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.15)
    }
    setStatus('Drone faded. The visual will idle.')
  }

  function runVisual() {
    if (animationRef.current) {
      window.cancelAnimationFrame(animationRef.current)
    }
    const renderFrame = () => {
      drawFrame()
      animationRef.current = window.requestAnimationFrame(renderFrame)
    }
    animationRef.current = window.requestAnimationFrame(renderFrame)
  }

  function drawFrame() {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) return
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    const cssWidth = canvas.clientWidth
    const cssHeight = canvas.clientHeight
    canvas.width = Math.floor(cssWidth * ratio)
    canvas.height = Math.floor(cssHeight * ratio)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)

    const bins = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(bins)

    if (visualRef.current === 'ribbon') {
      const history = historyRef.current
      history.push(bins.slice(0, 256))
      if (history.length > 96) history.shift()
      ctx.fillStyle = `rgba(6, 5, 12, ${reducedRef.current ? 0.4 : 0.18})`
      ctx.fillRect(0, 0, cssWidth, cssHeight)
      const cellW = cssWidth / 256
      const cellH = cssHeight / 96
      for (let h = 0; h < history.length; h += 1) {
        const row = history[h]
        for (let b = 0; b < 256; b += 1) {
          const value = row[b] / 255
          if (value < 0.04) continue
          const [r, g, bl] = paletteSample(value)
          ctx.fillStyle = `rgba(${r | 0}, ${g | 0}, ${bl | 0}, ${value * 0.85})`
          ctx.fillRect(b * cellW, h * cellH, cellW + 1, cellH + 1)
        }
      }
    } else if (visualRef.current === 'starburst') {
      ctx.fillStyle = `rgba(6, 5, 12, ${reducedRef.current ? 0.4 : 0.22})`
      ctx.fillRect(0, 0, cssWidth, cssHeight)
      const cx = cssWidth / 2
      const cy = cssHeight / 2
      const radius = Math.min(cssWidth, cssHeight) * 0.42
      const rays = Math.min(bins.length, 256)
      ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < rays; i += 1) {
        const value = bins[i] / 255
        if (value < 0.05) continue
        const angle = (i / rays) * Math.PI * 2
        const len = value * radius * (0.7 + densityRef.current * 0.6)
        const [r, g, b] = paletteSample(value)
        ctx.strokeStyle = `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${0.18 + value * 0.7})`
        ctx.lineWidth = 1 + value * 3
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(angle) * radius * 0.18, cy + Math.sin(angle) * radius * 0.18)
        ctx.lineTo(cx + Math.cos(angle) * (radius * 0.18 + len), cy + Math.sin(angle) * (radius * 0.18 + len))
        ctx.stroke()
      }
      ctx.globalCompositeOperation = 'source-over'
    } else {
      ctx.fillStyle = `rgba(6, 5, 12, ${reducedRef.current ? 0.4 : 0.16})`
      ctx.fillRect(0, 0, cssWidth, cssHeight)
      const cx = cssWidth / 2
      const cy = cssHeight / 2
      const maxRadius = Math.min(cssWidth, cssHeight) * 0.48
      const ringCount = 56
      ctx.globalCompositeOperation = 'lighter'
      for (let ring = 0; ring < ringCount; ring += 1) {
        const t = ring / ringCount
        const idx = Math.floor(t * 220) + 4
        const value = (bins[idx] || 0) / 255
        if (value < 0.05) continue
        const [r, g, b] = paletteSample(value)
        ctx.strokeStyle = `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${0.08 + value * 0.6})`
        ctx.lineWidth = 0.6 + value * 2.4
        ctx.beginPath()
        ctx.arc(cx, cy, t * maxRadius, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.globalCompositeOperation = 'source-over'
    }
  }

  const summary = useMemo(
    () => `Chord ${chord} · drift ${drift.toFixed(2)} · brightness ${brightness.toFixed(2)} · visual ${visual}`,
    [chord, drift, brightness, visual],
  )

  return (
    <ImmersiveDemo
      caption={summary}
      controls={
        <>
          <Parameter label="chord">
            <select value={chord} onChange={(event) => setChord(event.target.value as ChordName)} className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]">
              {Object.keys(chords).map((option) => <option key={option} value={option} className="bg-[#120f15]">{option}</option>)}
            </select>
          </Parameter>
          <Parameter label="visualization">
            <select value={visual} onChange={(event) => setVisual(event.target.value as Visual)} className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]">
              {visuals.map((option) => <option key={option} value={option} className="bg-[#120f15]">{option}</option>)}
            </select>
          </Parameter>
          <Parameter label="brightness" value={brightness.toFixed(2)}>
            <input type="range" min="0" max="1" step="0.01" value={brightness} onChange={(event) => setBrightness(Number(event.target.value))} />
          </Parameter>
          <Parameter label="drift" value={drift.toFixed(2)}>
            <input type="range" min="0" max="1" step="0.01" value={drift} onChange={(event) => setDrift(Number(event.target.value))} />
          </Parameter>
          <Parameter label="density" value={density.toFixed(2)}>
            <input type="range" min="0" max="1" step="0.01" value={density} onChange={(event) => setDensity(Number(event.target.value))} />
          </Parameter>
          <Parameter label="volume" value={volume.toFixed(2)}>
            <input type="range" min="0" max="0.6" step="0.01" value={volume} onChange={(event) => setVolume(Number(event.target.value))} />
          </Parameter>
          <div className="instrument-panel flex flex-wrap gap-2 px-3 py-3">
            {playing ? (
              <button type="button" onClick={stopDrone} className="control-button" data-variant="primary">stop drone</button>
            ) : (
              <button type="button" onClick={startDrone} className="control-button" data-variant="primary">start drone</button>
            )}
          </div>
          <p className="text-sm text-[var(--soft)] sm:col-span-2 lg:col-span-3 xl:col-span-4">{status}</p>
        </>
      }
    >
      <div ref={containerRef} className="relative h-full w-full" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(80,30,140,0.35), transparent 60%), radial-gradient(circle at 75% 70%, rgba(255,120,80,0.18), transparent 55%), #06050a' }}>
        <canvas ref={canvasRef} className="h-full w-full" />
        {!playing ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="surface-note max-w-md px-5 py-5 text-center text-[var(--text-muted)]">
              <p className="meta-label mb-2">audible piece</p>
              <p className="mb-4 text-sm leading-relaxed">
                A drifting drone built from a chord of detuned oscillators plays through a slowly opening filter. Its spectrum becomes the picture.
              </p>
              <button type="button" className="control-button" data-variant="primary" onClick={startDrone}>start drone</button>
            </div>
          </div>
        ) : null}
      </div>
    </ImmersiveDemo>
  )
}
