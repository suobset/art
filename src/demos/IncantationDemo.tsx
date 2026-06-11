import { useEffect, useMemo, useRef, useState } from 'react'
import { ImmersiveDemo } from '../components/ImmersiveDemo'
import { Parameter } from '../components/Parameter'
import { SeedControls } from '../components/SeedControls'
import { useSeed } from '../hooks/useSeed'
import type { DemoComponentProps } from '../lib/demoTypes'
import { createSeededRandom, pickOne } from '../lib/random'

type Mood = 'tide' | 'forest' | 'kiln' | 'silence'

const moods: Mood[] = ['tide', 'forest', 'kiln', 'silence']

type Bank = {
  openers: string[]
  subjects: string[]
  verbs: string[]
  modifiers: string[]
  places: string[]
  closers: string[]
}

const banks: Record<Mood, Bank> = {
  tide: {
    openers: ['Listen.', 'Then,', 'In the long blue,', 'You arrive.', 'Slowly,'],
    subjects: ['the gull', 'a green wave', 'salt', 'the long blue rope', 'the moon', 'a quiet hand', 'one fisherman', 'the rented sky'],
    verbs: ['remembers', 'unties', 'returns to', 'leans against', 'forgives', 'is rewriting', 'mistakes', 'has finished'],
    modifiers: ['without speaking', 'in cursive', 'beneath the dock', 'with a soft accent', 'on the tide', 'patiently', 'twice over'],
    places: ['the harbor', 'the breakwater', 'a closed lighthouse', 'the line where weather changes', 'an empty boat', 'the old wharf'],
    closers: ['and then is quiet.', 'and you are still here.', 'and the day keeps going.', 'because nothing else is asked of it.'],
  },
  forest: {
    openers: ['Listen.', 'Here,', 'Step gently.', 'Far enough in,', 'In the green dark,'],
    subjects: ['the moss', 'a deer', 'one cold spring', 'the leaf', 'the path', 'an old letter', 'the slow wood'],
    verbs: ['holds', 'is reading', 'forgets', 'follows', 'returns to', 'is being written by', 'recognizes'],
    modifiers: ['without ceremony', 'in three small syllables', 'where the light is thin', 'with patience', 'in the wet grass', 'at low volume'],
    places: ['the clearing', 'the foxglove', 'a stand of birches', 'the river bend', 'the disused fence', 'the green silence'],
    closers: ['and waits.', 'and is enough.', 'as if it were always so.', 'because the forest agrees.'],
  },
  kiln: {
    openers: ['Stay close.', 'Quietly,', 'Here is the work.', 'In the long heat,', 'Without ceremony,'],
    subjects: ['the kiln', 'the small bowl', 'red clay', 'a careful hand', 'the maker', 'the flame', 'one slow vessel'],
    verbs: ['accepts', 'is naming', 'gathers', 'releases', 'remembers', 'is teaching', 'unmakes'],
    modifiers: ['in a steady voice', 'without finishing', 'inside the orange', 'with both hands', 'after the long fire'],
    places: ['the studio', 'the cooling shelf', 'a row of jars', 'the work table', 'the slow afternoon', 'the morning light'],
    closers: ['and stays whole.', 'and is offered.', 'and is glad to be small.', 'and waits to be used.'],
  },
  silence: {
    openers: ['Hush.', 'Now,', 'Notice.', 'The room agrees.', 'At last,'],
    subjects: ['the lamp', 'a long sentence', 'the cat', 'this room', 'the unfinished book', 'one open window', 'the soft floor'],
    verbs: ['agrees', 'is listening to', 'forgets', 'holds', 'lets in', 'is rewritten by', 'becomes'],
    modifiers: ['in low light', 'without arguing', 'in the corner', 'with the door closed', 'gently', 'after a long day'],
    places: ['the desk', 'the doorway', 'the chair beside you', 'a quiet kitchen', 'the wide stillness', 'the simple evening'],
    closers: ['and the room thanks you.', 'and you exhale.', 'and that is the poem.', 'and is finally still.'],
  },
}

type Line = { text: string; words: string[] }

function generatePoem(seed: number, mood: Mood, lineCount: number): Line[] {
  const random = createSeededRandom(seed)
  const bank = banks[mood]
  const lines: Line[] = []
  for (let i = 0; i < lineCount; i += 1) {
    const opener = i === 0 ? pickOne(random, bank.openers) : (random() < 0.3 ? pickOne(random, bank.openers) : '')
    const subject = pickOne(random, bank.subjects)
    const verb = pickOne(random, bank.verbs)
    const modifier = random() < 0.6 ? pickOne(random, bank.modifiers) : ''
    const place = random() < 0.7 ? `at ${pickOne(random, bank.places)}` : ''
    const closer = i === lineCount - 1 ? pickOne(random, bank.closers) : (random() < 0.2 ? pickOne(random, bank.closers) : '')

    const parts: string[] = []
    if (opener) parts.push(opener)
    parts.push(`${subject} ${verb}`)
    if (modifier) parts.push(modifier)
    if (place) parts.push(place)
    if (closer) parts.push(closer)
    const text = parts.join(' ').replace(/\s+/g, ' ').trim()
    const words = text.split(/(\s+)/).filter((piece) => piece.trim().length > 0)
    lines.push({ text, words })
  }
  return lines
}

export function IncantationDemo({ reducedMotion }: DemoComponentProps) {
  const [mood, setMood] = useState<Mood>('tide')
  const [lineCount, setLineCount] = useState(6)
  const [rate, setRate] = useState(0.86)
  const [pitch, setPitch] = useState(0.95)
  const [voiceName, setVoiceName] = useState<string>('')
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [poem, setPoem] = useState<Line[]>([])
  const [activeLine, setActiveLine] = useState(-1)
  const [activeWord, setActiveWord] = useState(-1)
  const [phase, setPhase] = useState<'idle' | 'speaking' | 'paused' | 'unsupported' | 'error'>('idle')
  const [status, setStatus] = useState('Press recite to hear the room speak. Captions will animate as it reads.')
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const stoppedRef = useRef(false)
  const lineIndexRef = useRef(0)
  const { seed, remix } = useSeed()

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setPhase('unsupported')
      setStatus('This browser does not expose speech synthesis. The poem still works as text.')
      return
    }
    const loadVoices = () => {
      const list = window.speechSynthesis.getVoices()
      setVoices(list)
      if (!voiceName && list.length) {
        const english = list.find((voice) => voice.lang.toLowerCase().startsWith('en')) || list[0]
        setVoiceName(english.voiceURI)
      }
    }
    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
      window.speechSynthesis.cancel()
    }
  }, [voiceName])

  useEffect(() => {
    setPoem(generatePoem(seed, mood, lineCount))
    setActiveLine(-1)
    setActiveWord(-1)
  }, [seed, mood, lineCount])

  const speakLine = (lines: Line[], index: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    if (index >= lines.length) {
      setPhase('idle')
      setStatus('Finished. The poem stays on screen.')
      setActiveLine(-1)
      setActiveWord(-1)
      return
    }
    if (stoppedRef.current) {
      setPhase('idle')
      return
    }
    const line = lines[index]
    setActiveLine(index)
    setActiveWord(-1)
    const utter = new SpeechSynthesisUtterance(line.text)
    utter.rate = rate
    utter.pitch = pitch
    const chosen = voices.find((voice) => voice.voiceURI === voiceName)
    if (chosen) utter.voice = chosen
    utter.onboundary = (event) => {
      if (event.name !== 'word') return
      const charIndex = event.charIndex
      let accumulated = 0
      for (let wordIndex = 0; wordIndex < line.words.length; wordIndex += 1) {
        const wordLength = line.words[wordIndex].length + 1
        if (charIndex < accumulated + wordLength) {
          setActiveWord(wordIndex)
          return
        }
        accumulated += wordLength
      }
      setActiveWord(line.words.length - 1)
    }
    utter.onend = () => {
      if (stoppedRef.current) {
        setPhase('idle')
        return
      }
      lineIndexRef.current = index + 1
      window.setTimeout(() => speakLine(lines, index + 1), reducedMotion ? 800 : 520)
    }
    utter.onerror = () => {
      setPhase('error')
      setStatus('Speech synthesis raised an error. The poem is still legible above.')
    }
    utteranceRef.current = utter
    window.speechSynthesis.speak(utter)
  }

  const recite = () => {
    if (phase === 'unsupported') return
    stoppedRef.current = false
    if (phase === 'paused') {
      window.speechSynthesis.resume()
      setPhase('speaking')
      setStatus('Resumed. The poem is being spoken.')
      return
    }
    window.speechSynthesis.cancel()
    setPhase('speaking')
    setStatus('Reciting. Captions animate with each spoken word.')
    lineIndexRef.current = 0
    speakLine(poem, 0)
  }

  const pause = () => {
    if (phase !== 'speaking') return
    window.speechSynthesis.pause()
    setPhase('paused')
    setStatus('Paused. Press recite to continue from this word.')
  }

  const stop = () => {
    stoppedRef.current = true
    window.speechSynthesis.cancel()
    setActiveLine(-1)
    setActiveWord(-1)
    setPhase('idle')
    setStatus('Stopped. Press recite to start over.')
  }

  useEffect(() => () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }, [])

  const overlayMood = useMemo(() => {
    if (mood === 'tide') return 'linear-gradient(180deg, rgba(20, 60, 90, 0.55), rgba(6, 12, 28, 0.95))'
    if (mood === 'forest') return 'linear-gradient(180deg, rgba(40, 60, 30, 0.55), rgba(6, 14, 8, 0.95))'
    if (mood === 'kiln') return 'linear-gradient(180deg, rgba(120, 45, 18, 0.55), rgba(20, 8, 4, 0.95))'
    return 'linear-gradient(180deg, rgba(45, 35, 60, 0.5), rgba(8, 6, 14, 0.95))'
  }, [mood])

  return (
    <ImmersiveDemo
      caption={`${mood} · ${poem.length} lines · ${phase}`}
      controls={
        <>
          <Parameter label="mood">
            <select value={mood} onChange={(event) => setMood(event.target.value as Mood)} className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]">
              {moods.map((option) => <option key={option} value={option} className="bg-[#120f15]">{option}</option>)}
            </select>
          </Parameter>
          <Parameter label="voice">
            <select value={voiceName} onChange={(event) => setVoiceName(event.target.value)} className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]">
              {voices.length === 0 ? <option value="" className="bg-[#120f15]">browser default</option> : voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI} className="bg-[#120f15]">{voice.name} · {voice.lang}</option>
              ))}
            </select>
          </Parameter>
          <Parameter label="line count" value={String(lineCount)}>
            <input type="range" min="3" max="10" step="1" value={lineCount} onChange={(event) => setLineCount(Number(event.target.value))} />
          </Parameter>
          <Parameter label="rate" value={rate.toFixed(2)}>
            <input type="range" min="0.5" max="1.4" step="0.01" value={rate} onChange={(event) => setRate(Number(event.target.value))} />
          </Parameter>
          <Parameter label="pitch" value={pitch.toFixed(2)}>
            <input type="range" min="0.6" max="1.4" step="0.01" value={pitch} onChange={(event) => setPitch(Number(event.target.value))} />
          </Parameter>
          <div className="instrument-panel flex flex-wrap gap-2 px-3 py-3">
            <button type="button" onClick={recite} className="control-button" data-variant="primary" disabled={phase === 'unsupported'}>
              {phase === 'paused' ? 'resume' : 'recite'}
            </button>
            <button type="button" onClick={pause} className="control-button" disabled={phase !== 'speaking'}>pause</button>
            <button type="button" onClick={stop} className="control-button" disabled={phase === 'idle' || phase === 'unsupported'}>stop</button>
          </div>
          <div className="instrument-panel flex flex-wrap gap-2 px-3 py-3">
            <button type="button" onClick={() => { stop(); setPoem(generatePoem(seed + 1, mood, lineCount)) }} className="control-button">rewrite poem</button>
            <SeedControls seed={seed} onRandomize={() => { stop(); remix() }} />
          </div>
          <p className="text-sm text-[var(--soft)] sm:col-span-2 lg:col-span-3 xl:col-span-4">{status}</p>
        </>
      }
    >
      <div className="relative h-full w-full" style={{ background: overlayMood }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.18] mix-blend-overlay" style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0, rgba(255,255,255,0.18) 1px, transparent 1px, transparent 64px), repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 48px)' }} />
        </div>
        <div className="relative flex h-full w-full items-center justify-center px-6">
          <div className="max-w-3xl space-y-4 text-left">
            {poem.length === 0 ? (
              <p className="text-center font-[var(--hero-font)] text-2xl text-[var(--text-muted)]">Press recite to generate and speak.</p>
            ) : poem.map((line, lineIndex) => (
              <p
                key={`${lineIndex}-${line.text}`}
                className="font-[var(--hero-font)] text-2xl leading-snug tracking-[-0.01em] md:text-3xl"
                style={{
                  opacity: phase === 'idle' || lineIndex <= activeLine ? 1 : 0.38,
                  transition: 'opacity 320ms ease',
                  color: 'var(--text)',
                }}
              >
                {line.words.map((word, wordIndex) => {
                  const isActive = lineIndex === activeLine && wordIndex === activeWord
                  const isPast = lineIndex < activeLine || (lineIndex === activeLine && wordIndex < activeWord)
                  return (
                    <span
                      key={`${lineIndex}-${wordIndex}`}
                      style={{
                        background: isActive ? 'var(--accent-soft)' : 'transparent',
                        color: isActive ? 'var(--accent-strong)' : isPast ? 'var(--text)' : 'var(--text-muted)',
                        padding: isActive ? '0 0.18em' : '0 0.04em',
                        borderRadius: '0.25rem',
                        transition: 'all 160ms ease',
                        display: 'inline-block',
                        transform: isActive ? 'translateY(-2px) scale(1.04)' : 'translateY(0) scale(1)',
                      }}
                    >
                      {word}
                    </span>
                  )
                })}
              </p>
            ))}
          </div>
        </div>
        {phase === 'unsupported' ? (
          <div className="pointer-events-none absolute inset-x-6 bottom-6 rounded-[1rem] border border-[var(--rule-strong)] bg-black/40 px-4 py-3 text-sm text-[var(--text-muted)] backdrop-blur-md">
            This browser lacks the SpeechSynthesis API. The piece falls back to a silent reading — the words remain.
          </div>
        ) : null}
      </div>
    </ImmersiveDemo>
  )
}
