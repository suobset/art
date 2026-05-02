import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'

type HeroProps = {
  manifesto: {
    eyebrow: string
    title: string
    lines: string[]
  }
}

export function Hero({ manifesto }: HeroProps) {
  const [offsets, setOffsets] = useState([0, 0, 0])
  const [remix, setRemix] = useState(0)

  const letters = useMemo(
    () =>
      manifesto.title.split('').map((letter, index) => ({
        letter,
        tilt: ((index + 1) * 9 + remix * 7) % 18 - 9,
        y: offsets[index] ?? 0,
      })),
    [manifesto.title, offsets, remix],
  )

  return (
    <section id="top" className="relative mx-auto flex min-h-[92svh] w-full max-w-7xl flex-col justify-center gap-8 px-4 py-10 md:px-6">
      <div className="max-w-xl">
        <p className="mb-4 text-sm uppercase tracking-[0.28em] text-[var(--soft)]">{manifesto.eyebrow}</p>
        <div
          className="mb-6 flex items-end gap-2 md:gap-4"
          onPointerMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect()
            const ratio = (event.clientX - rect.left) / rect.width - 0.5
            setOffsets([ratio * -22, ratio * 14, ratio * -10])
          }}
          onPointerLeave={() => setOffsets([0, 0, 0])}
        >
          {letters.map(({ letter, tilt, y }, index) => (
            <motion.span
              key={`${letter}-${index}-${remix}`}
              animate={{ y, rotate: tilt }}
              transition={{ type: 'spring', stiffness: 180, damping: 14 }}
              className="select-none font-[var(--hero-font)] text-[clamp(5rem,18vw,12rem)] leading-none tracking-[-0.12em] text-[var(--text)]"
            >
              {letter}
            </motion.span>
          ))}
        </div>
        <div className="space-y-2 text-lg text-[var(--muted)] md:text-xl">
          {manifesto.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <a href="#gallery" className="rounded-full bg-[var(--text)] px-5 py-3 text-sm font-medium text-[var(--bg)] transition hover:translate-y-[-1px]">
          Enter the gallery
        </a>
        <button
          type="button"
          onClick={() => setRemix((value) => value + 1)}
          className="rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] px-5 py-3 text-sm text-[var(--text)] transition hover:border-[var(--accent-2)]"
        >
          Remix the opening
        </button>
        <a href="#source-philosophy" className="rounded-full border border-[var(--line)] px-5 py-3 text-sm text-[var(--muted)] transition hover:text-[var(--text)]">
          View source philosophy
        </a>
      </div>
      <div id="source-philosophy" className="grid gap-4 md:grid-cols-3">
        {[
          'Correctness does not erase style.',
          'A constraint gives the work a boundary.',
          'The source is part of the piece.',
        ].map((note) => (
          <div key={note} className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--muted)] shadow-[var(--shadow)]">
            {note}
          </div>
        ))}
      </div>
    </section>
  )
}
