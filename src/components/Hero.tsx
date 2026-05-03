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

  const splitIndex = manifesto.title.indexOf('a', 5)
  const firstLine = letters.slice(0, splitIndex)
  const secondLine = letters.slice(splitIndex)

  return (
    <section id="top" className="relative mx-auto flex min-h-[98svh] w-full max-w-7xl flex-col justify-center gap-10 px-4 py-8 md:px-6 md:py-12">
      <div className="pointer-events-none absolute inset-x-0 top-8 bottom-16 notebook-grid opacity-40" />
      <div className="pointer-events-none absolute left-4 top-28 hidden h-[26rem] w-px bg-[var(--rule)] md:block" />
      <div className="relative grid items-end gap-8 lg:grid-cols-[1.5fr_0.5fr]">
        <div className="surface-frame px-6 py-8 md:px-8 md:py-10">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <p className="meta-label">{manifesto.eyebrow}</p>
            <span className="h-px w-12 bg-[var(--accent-2)]" />
          </div>
          <div
            className="title-guide mb-8"
            onPointerMove={(event) => {
              const rect = event.currentTarget.getBoundingClientRect()
              const ratio = (event.clientX - rect.left) / rect.width - 0.5
              const next = manifesto.title.split('').map((_, index) => ratio * ((index % 3) - 1) * 24)
              setOffsets(next)
            }}
            onPointerLeave={() => setOffsets(Array.from({ length: manifesto.title.length }, () => 0))}
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-end gap-x-2 gap-y-1 md:gap-x-4">
                {firstLine.map(({ letter, tilt, y }, index) => (
                  <motion.span
                    key={`${letter}-${index}-${remix}-top`}
                    animate={{ y: reducedMotion ? 0 : y, rotate: reducedMotion ? 0 : tilt }}
                    transition={{ type: 'spring', stiffness: 150, damping: 15 }}
                    className={`select-none font-[var(--hero-font)] text-[clamp(3.9rem,11vw,8.8rem)] leading-none tracking-[-0.12em] ${letter === '+' ? 'mx-2 text-[var(--accent-2)]' : 'text-[var(--text)]'}`}
                  >
                    {letter === ' ' ? '\u00A0' : letter}
                  </motion.span>
                ))}
              </div>
              <div className="flex flex-wrap items-end gap-x-2 gap-y-1 md:gap-x-4">
                {secondLine.map(({ letter, tilt, y }, index) => (
                  <motion.span
                    key={`${letter}-${index}-${remix}-bottom`}
                    animate={{ y: reducedMotion ? 0 : y, rotate: reducedMotion ? 0 : tilt }}
                    transition={{ type: 'spring', stiffness: 150, damping: 15 }}
                    className="select-none font-[var(--hero-font)] text-[clamp(3.9rem,11vw,8.8rem)] leading-none tracking-[-0.12em] text-[var(--text)]"
                  >
                    {letter === ' ' ? '\u00A0' : letter}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
          <div className="max-w-3xl space-y-3 text-xl text-[var(--text-muted)] md:text-2xl md:leading-relaxed">
            {manifesto.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/demo/gesture" className="control-button" data-variant="primary">
              Enter the first room
            </Link>
            <button
              type="button"
              onClick={() => setRemix((value) => value + 1)}
              className="control-button"
            >
              Remix the opening
            </button>
            <a href="#source-philosophy" className="control-button" data-variant="ghost">
              View source philosophy
            </a>
          </div>
        </div>
        <aside className="surface-placard px-4 py-4 md:px-5 md:py-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="meta-label">curated by</span>
          </div>
          <img src={author.portrait} alt={author.shortName} className="mb-4 aspect-[4/5] w-full rounded-[1.1rem_0.5rem_1.2rem_0.55rem] object-cover object-center" />
          <h2 className="font-[var(--hero-font)] text-3xl tracking-[-0.04em] text-[var(--text)]">{author.shortName}</h2>
          <p className="mt-2 font-[var(--mono-font)] text-[0.7rem] uppercase tracking-[0.24em] text-[var(--accent-2)]">systems / compilers / cybersecurity</p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{author.bio}</p>
          <div className="mt-4 grid gap-2 text-sm">
            <a href={author.blog} className="control-button" data-variant="ghost">declarative {'->'}</a>
            <a href={author.about} className="control-button" data-variant="ghost">about kush {'->'}</a>
            <a href={author.projects} className="control-button" data-variant="ghost">projects {'->'}</a>
            <a href="https://github.com/sponsors/suobset" className="control-button" data-variant="ghost">support on github {'->'}</a>
          </div>
        </aside>
      </div>
      <div id="source-philosophy" className="grid gap-4 md:grid-cols-4">
        {[
          'Correctness does not erase style.',
          'A constraint gives the work a boundary.',
          'The source is part of the piece.',
          'An algorithm can carry mood.',
        ].map((note, index) => (
          <div key={note} className="surface-note px-4 py-4 text-sm text-[var(--text-muted)]">
            <div className="mb-2 flex items-center gap-3">
              <span className="font-[var(--mono-font)] text-[0.68rem] uppercase tracking-[0.18em] text-[var(--accent-2)]">note {String(index + 1).padStart(2, '0')}</span>
              <span className="h-px flex-1 bg-[var(--rule)]" />
            </div>
            <p>{note}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
