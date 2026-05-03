export const NOTE_NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as const

export type NoteName = (typeof NOTE_NAMES)[number]
export type ScaleName = 'major' | 'minor' | 'dorian' | 'mixolydian' | 'pentatonic' | 'chromatic'
export type NoteEvent = {
  midi: number
  start: number
  duration: number
  velocity: number
  voice: number
}

const SCALE_DEGREES: Record<ScaleName, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  pentatonic: [0, 2, 4, 7, 9],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
}

export function midiToFrequency(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

export function clampMidi(midi: number, min: number, max: number) {
  return Math.max(min, Math.min(max, midi))
}

export function getScaleDegrees(scaleName: ScaleName) {
  return SCALE_DEGREES[scaleName]
}

export function noteNameToIndex(note: NoteName) {
  return NOTE_NAMES.indexOf(note)
}

export function degreeToMidi(root: NoteName, scaleName: ScaleName, degree: number, octave = 4) {
  const degrees = getScaleDegrees(scaleName)
  const wrappedDegree = ((degree % degrees.length) + degrees.length) % degrees.length
  const octaveShift = Math.floor(degree / degrees.length)
  const semitone = degrees[wrappedDegree] + noteNameToIndex(root)
  return (octave + 1 + octaveShift) * 12 + semitone
}

export function euclideanRhythm(steps: number, pulses: number, rotation = 0) {
  const clampedSteps = Math.max(1, Math.floor(steps))
  const clampedPulses = Math.max(0, Math.min(clampedSteps, Math.floor(pulses)))
  const pattern = Array.from({ length: clampedSteps }, (_, index) => (
    Math.floor(((index + 1) * clampedPulses) / clampedSteps) !== Math.floor((index * clampedPulses) / clampedSteps)
  ))

  if (rotation === 0) {
    return pattern
  }

  const offset = ((Math.floor(rotation) % clampedSteps) + clampedSteps) % clampedSteps
  return pattern.map((_, index) => pattern[(index - offset + clampedSteps) % clampedSteps])
}

export function transposePhrase(notes: NoteEvent[], semitones: number) {
  return notes.map((note) => ({ ...note, midi: note.midi + semitones }))
}

export function delayPhrase(notes: NoteEvent[], beats: number) {
  return notes.map((note) => ({ ...note, start: note.start + beats }))
}

export function invertPhrase(notes: NoteEvent[], axisMidi: number) {
  return notes.map((note) => ({ ...note, midi: axisMidi - (note.midi - axisMidi) }))
}

export function retrogradePhrase(notes: NoteEvent[], totalBeats: number) {
  return notes.map((note) => ({
    ...note,
    start: totalBeats - note.start - note.duration,
  }))
}
