import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'

type HeroProps = {
  manifesto: {
    eyebrow: string
    title: string
    lines: string[]
  }
  author: {
    shortName: string
    fullName: string
    portrait: string
    blogLabel: string
    blog: string
    about: string
    projects: string
    bio: string
    summary: string
  }
  reducedMotion: boolean
}

export function Hero({ manifesto, author, reducedMotion }: HeroProps) {
  const [offsets, setOffsets] = useState(Array.from({ length: 16 }, () => 0))
  const [remix, setRemix] = useState(0)

  const letters = useMemo(
    () =>
      manifesto.title.split('').map((letter, index) => ({
        letter,
        tilt: ((index + 1) * 9 + remix * 7) % 20 - 10,
        y: offsets[index] ?? 0,
      })),
    [manifesto.title, offsets, remix],
  )

  return (
    <section id="top" className="relative mx-auto flex min-h-[98svh] w-full max-w-7xl flex-col justify-center gap-10 px-4 py-8 md:px-6 md:py-12">
      <div className="pointer-events-none absolute inset-x-0 top-8 h-[28rem] bg-[radial-gradient(circle_at_20%_30%,rgba(255,122,89,0.2),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(107,227,255,0.18),transparent_30%),radial-gradient(circle_at_center,rgba(216,255,98,0.08),transparent_40%)] blur-3xl" />
      <div className="relative grid items-end gap-8 lg:grid-cols-[1.55fr_0.45fr]">
        <div>
          <p className="mb-5 text-sm uppercase tracking-[0.34em] text-[var(--soft)]">{manifesto.eyebrow}</p>
          <div
            className="mb-8 flex flex-wrap items-end gap-x-2 gap-y-1 md:gap-x-4"
            onPointerMove={(event) => {
              const rect = event.currentTarget.getBoundingClientRect()
              const ratio = (event.clientX - rect.left) / rect.width - 0.5
              const next = manifesto.title.split('').map((_, index) => ratio * ((index % 3) - 1) * 24)
              setOffsets(next)
            }}
            onPointerLeave={() => setOffsets(Array.from({ length: manifesto.title.length }, () => 0))}
          >
            {letters.map(({ letter, tilt, y }, index) => (
              <motion.span
                key={`${letter}-${index}-${remix}`}
                animate={{ y: reducedMotion ? 0 : y, rotate: reducedMotion ? 0 : tilt }}
                transition={{ type: 'spring', stiffness: 150, damping: 15 }}
                className={`select-none font-[var(--hero-font)] text-[clamp(3.6rem,11vw,9rem)] leading-none tracking-[-0.12em] ${letter === '+' ? 'mx-2 text-[var(--accent-2)]' : 'text-[var(--text)]'}`}
              >
                {letter === ' ' ? '\u00A0' : letter}
              </motion.span>
            ))}
          </div>
          <div className="max-w-3xl space-y-3 text-xl text-[var(--muted)] md:text-2xl md:leading-relaxed">
            {manifesto.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/demo/gesture" className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-black transition hover:translate-y-[-1px] hover:bg-[var(--accent-3)]">
              Enter the first room
            </Link>
            <button
              type="button"
              onClick={() => setRemix((value) => value + 1)}
              className="rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] px-6 py-3 text-sm text-[var(--text)] transition hover:border-[var(--accent-2)]"
            >
              Remix the opening
            </button>
            <a href="#source-philosophy" className="rounded-full border border-[var(--line)] px-6 py-3 text-sm text-[var(--muted)] transition hover:text-[var(--text)]">
              View source philosophy
            </a>
          </div>
        </div>
        <aside className="relative rounded-[2rem] border border-[var(--line)] bg-[var(--bg-elevated)] p-4 shadow-[var(--shadow)] md:p-5">
          <img src={author.portrait} alt={author.shortName} className="mb-4 aspect-[4/5] w-full rounded-[1.5rem] object-cover object-center" />
          <p className="mb-2 text-xs uppercase tracking-[0.28em] text-[var(--soft)]">curated by</p>
          <h2 className="font-[var(--hero-font)] text-3xl tracking-[-0.04em] text-[var(--text)]">{author.shortName}</h2>
          <p className="mt-3 text-sm text-[var(--muted)]">{author.bio}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <a href={author.blog} className="rounded-full border border-[var(--line)] px-3 py-2 text-[var(--text)] transition hover:border-[var(--accent)]">read declarative</a>
            <a href={author.about} className="rounded-full border border-[var(--line)] px-3 py-2 text-[var(--text)] transition hover:border-[var(--accent)]">about kush</a>
            <a href={author.projects} className="rounded-full border border-[var(--line)] px-3 py-2 text-[var(--text)] transition hover:border-[var(--accent)]">projects</a>
          </div>
        </aside>
      </div>
      <div id="source-philosophy" className="grid gap-4 md:grid-cols-4">
        {[
          'Correctness does not erase style.',
          'A constraint gives the work a boundary.',
          'The source is part of the piece.',
          'An algorithm can carry mood.',
        ].map((note) => (
          <div key={note} className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--muted)] shadow-[var(--shadow)]">
            {note}
          </div>
        ))}
      </div>
    </section>
  )
}
