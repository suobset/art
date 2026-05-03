import { useMemo, useState } from 'react'
import { DemoControls } from '../components/DemoControls'
import { Parameter } from '../components/Parameter'
import { createSeededRandom, pickOne } from '../lib/random'

type Mood = 'tender' | 'electric' | 'grave'

type Banks = {
  nouns: string[]
  verbs: string[]
  textures: string[]
  places: string[]
}

const banks: Record<Mood, Banks> = {
  tender: {
    nouns: ['window', 'teacup', 'thread', 'shoulder', 'moth', 'breath'],
    verbs: ['waits', 'leans', 'collects', 'forgets', 'folds'],
    textures: ['softly', 'between lamps', 'with warm dust', 'without hurry'],
    places: ['in the hall', 'by the sink', 'near the piano', 'beneath the stair'],
  },
  electric: {
    nouns: ['neon', 'circuit', 'glass', 'signal', 'street', 'cursor'],
    verbs: ['sparks', 'jumps', 'fractures', 'loops', 'stares'],
    textures: ['through static', 'at full pulse', 'with chrome patience', 'after midnight'],
    places: ['under rain', 'inside the grid', 'near the antenna', 'behind the screen'],
  },
  grave: {
    nouns: ['ash', 'bell', 'river', 'stone', 'archive', 'echo'],
    verbs: ['returns', 'rests', 'opens', 'surrenders', 'drifts'],
    textures: ['without witnesses', 'like old velvet', 'in low weather', 'after the names'],
    places: ['under soil', 'at the threshold', 'behind the chapel', 'where the light thins'],
  },
}

function buildPoem(
  mood: Mood,
  randomness: number,
  lineLength: number,
  punctuationDensity: number,
  locks: string[],
  revision: number,
) {
  const random = createSeededRandom(Date.now() + revision * 97)
  const bank = banks[mood]
  const lines = Array.from({ length: lineLength }, (_, index) => {
    const locked = locks[index]
    const noun = locked || pickOne(random, bank.nouns)
    const verb = pickOne(random, bank.verbs)
    const texture = random() > 0.5 - randomness * 0.2 ? pickOne(random, bank.textures) : ''
    const place = pickOne(random, bank.places)
    const punctuation = random() < punctuationDensity ? pickOne(random, [',', ';', ':']) : ''
    return [noun, verb, texture, punctuation, place].filter(Boolean).join(' ')
  })
  return lines
}

export function GenerativePoetryDemo() {
  const [mood, setMood] = useState<Mood>('tender')
  const [randomness, setRandomness] = useState(0.5)
  const [lineLength, setLineLength] = useState(4)
  const [punctuationDensity, setPunctuationDensity] = useState(0.35)
  const [locks, setLocks] = useState<string[]>([])
  const [revision, setRevision] = useState(0)
  const [showGrammar, setShowGrammar] = useState(false)

  const poem = useMemo(
    () => buildPoem(mood, randomness, lineLength, punctuationDensity, locks, revision),
    [mood, randomness, lineLength, punctuationDensity, locks, revision],
  )

  return (
    <DemoControls
      actions={
        <>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setRevision((value) => value + 1)} className="control-button">
              regenerate
            </button>
            <button type="button" onClick={() => setLocks([])} className="control-button">
              reset locks
            </button>
            <button type="button" onClick={() => setShowGrammar((value) => !value)} className="control-button">
              {showGrammar ? 'hide grammar' : 'reveal grammar'}
            </button>
          </div>
          <Parameter label="mood">
            <select value={mood} onChange={(event) => setMood(event.target.value as Mood)} className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]">
              <option value="tender" className="bg-[#120f15]">tender</option>
              <option value="electric" className="bg-[#120f15]">electric</option>
              <option value="grave" className="bg-[#120f15]">grave</option>
            </select>
          </Parameter>
          <Parameter label="temperature" value={randomness.toFixed(2)}>
            <input type="range" min="0.1" max="1" step="0.05" value={randomness} onChange={(event) => setRandomness(Number(event.target.value))} />
          </Parameter>
          <Parameter label="line count" value={String(lineLength)}>
            <input type="range" min="3" max="6" step="1" value={lineLength} onChange={(event) => setLineLength(Number(event.target.value))} />
          </Parameter>
          <Parameter label="punctuation density" value={punctuationDensity.toFixed(2)}>
            <input type="range" min="0" max="1" step="0.05" value={punctuationDensity} onChange={(event) => setPunctuationDensity(Number(event.target.value))} />
          </Parameter>
          <p className="text-sm text-[var(--soft)]">Click the first word in any line to freeze it. The next regeneration keeps it and rewrites the rest.</p>
        </>
      }
    >
      <div className="grid h-full gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.25rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent)] p-5">
          <div className="space-y-4 font-[var(--hero-font)] text-2xl leading-tight text-[var(--text)] md:text-3xl">
            {poem.map((line, index) => {
              const [firstWord, ...rest] = line.split(' ')
              const locked = locks[index] === firstWord
              return (
                <p key={`${line}-${index}`}>
                  <button
                    type="button"
                    onClick={() => setLocks((current) => {
                      const next = [...current]
                      next[index] = locked ? '' : firstWord
                      return next
                    })}
                    className={`mr-2 rounded-full px-2 py-1 text-left ${locked ? 'bg-[var(--accent)] text-black' : 'bg-white/6 text-[var(--accent-3)]'}`}
                  >
                    {firstWord}
                  </button>
                  {rest.join(' ')}
                </p>
              )
            })}
          </div>
        </div>
        <div className="space-y-4 rounded-[1.25rem] bg-black/20 p-4 text-sm text-[var(--muted)]">
          <p>Template: <span className="font-[var(--mono-font)] text-[var(--text)]">noun + verb + optional texture + place</span></p>
          {showGrammar ? (
            <pre className="overflow-x-auto rounded-2xl bg-black/25 p-3 font-[var(--mono-font)] text-xs text-[var(--accent-2)]">
{`line := noun verb [texture] place\ntexture appears more often as temperature rises\nlocked words skip noun selection on regeneration`}
            </pre>
          ) : null}
          <p className="text-[var(--soft)]">Canvas description: a local text generator chooses from hand-written word banks. No external model is involved.</p>
        </div>
      </div>
    </DemoControls>
  )
}
