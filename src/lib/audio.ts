import { midiToFrequency } from './music'

export type PulseVoice = 'soft-click' | 'wood-block' | 'sine-ping' | 'low-tom' | 'plucked-blip'
export type ToneVoice = 'sine' | 'triangle' | 'plucked'

let sharedContext: AudioContext | null = null

export async function createSafeAudioContext() {
  if (typeof window === 'undefined') {
    throw new Error('Audio unavailable outside the browser.')
  }

  const AudioCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtor) {
    throw new Error('Audio is unavailable in this browser.')
  }

  if (!sharedContext) {
    sharedContext = new AudioCtor()
  }

  if (sharedContext.state === 'suspended') {
    await sharedContext.resume()
  }

  return sharedContext
}

export function playPercussiveTone(
  context: AudioContext,
  time: number,
  options: {
    frequency: number
    duration: number
    gain: number
    type?: OscillatorType
    filterFrequency?: number
  },
) {
  const oscillator = context.createOscillator()
  const gainNode = context.createGain()
  const filter = context.createBiquadFilter()
  oscillator.type = options.type ?? 'sine'
  oscillator.frequency.setValueAtTime(options.frequency, time)
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(options.filterFrequency ?? 2400, time)
  gainNode.gain.setValueAtTime(0.0001, time)
  gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, options.gain), time + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, time + options.duration)
  oscillator.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(context.destination)
  oscillator.start(time)
  oscillator.stop(time + options.duration + 0.03)
  oscillator.onended = () => {
    oscillator.disconnect()
    filter.disconnect()
    gainNode.disconnect()
  }
}

export function playNoiseTick(
  context: AudioContext,
  time: number,
  options: { duration: number; gain: number; filterFrequency: number },
) {
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * options.duration), context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let index = 0; index < data.length; index += 1) {
    data[index] = (Math.random() * 2 - 1) * Math.exp(-index / data.length)
  }

  const source = context.createBufferSource()
  const filter = context.createBiquadFilter()
  const gainNode = context.createGain()
  source.buffer = buffer
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(options.filterFrequency, time)
  gainNode.gain.setValueAtTime(options.gain, time)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, time + options.duration)
  source.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(context.destination)
  source.start(time)
  source.stop(time + options.duration + 0.02)
  source.onended = () => {
    source.disconnect()
    filter.disconnect()
    gainNode.disconnect()
  }
}

export function playPulse(
  context: AudioContext,
  time: number,
  voice: PulseVoice,
  gain: number,
  accent = 1,
) {
  const scaledGain = gain * accent
  if (voice === 'soft-click') {
    playNoiseTick(context, time, { duration: 0.045, gain: scaledGain, filterFrequency: 1800 })
    return
  }
  if (voice === 'wood-block') {
    playNoiseTick(context, time, { duration: 0.055, gain: scaledGain, filterFrequency: 1000 })
    playPercussiveTone(context, time, { frequency: 420, duration: 0.05, gain: scaledGain * 0.9, type: 'triangle', filterFrequency: 1400 })
    return
  }
  if (voice === 'low-tom') {
    playPercussiveTone(context, time, { frequency: 110, duration: 0.16, gain: scaledGain, type: 'sine', filterFrequency: 600 })
    return
  }
  if (voice === 'plucked-blip') {
    playPercussiveTone(context, time, { frequency: 320, duration: 0.09, gain: scaledGain, type: 'triangle', filterFrequency: 1800 })
    return
  }
  playPercussiveTone(context, time, { frequency: 580, duration: 0.08, gain: scaledGain, type: 'sine', filterFrequency: 2200 })
}

export function playTonalNote(
  context: AudioContext,
  time: number,
  options: { midi: number; duration: number; gain: number; voice: ToneVoice },
) {
  const frequency = midiToFrequency(options.midi)
  if (options.voice === 'plucked') {
    playPercussiveTone(context, time, { frequency, duration: options.duration, gain: options.gain, type: 'triangle', filterFrequency: 1800 })
    return
  }
  playPercussiveTone(context, time, {
    frequency,
    duration: options.duration,
    gain: options.gain,
    type: options.voice === 'triangle' ? 'triangle' : 'sine',
    filterFrequency: options.voice === 'triangle' ? 1400 : 2200,
  })
}
