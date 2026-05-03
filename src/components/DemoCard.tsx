import { useState } from 'react'
import type { DemoDefinition } from '../lib/demoTypes'
import { BehindTheScenes } from './BehindTheScenes'

export function DemoCard({ demo, reducedMotion, forceOpen = false }: { demo: DemoDefinition; reducedMotion: boolean; forceOpen?: boolean }) {
  const [open, setOpen] = useState(forceOpen)
  const DemoComponent = demo.component

  return (
    <section id={demo.id} className="rounded-[2rem] border border-[var(--line)] bg-[var(--bg-elevated)] p-4 shadow-[var(--shadow)] md:p-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.28em] text-[var(--soft)]">{demo.tags.join(' · ')}</p>
          <h2 className="font-[var(--hero-font)] text-3xl tracking-[-0.04em] text-[var(--text)]">{demo.title}</h2>
          <p className="max-w-2xl text-[var(--muted)]">{demo.shortDescription}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--text)] transition hover:border-[var(--accent-2)]"
        >
          Behind the scenes
        </button>
      </div>
      <DemoComponent reducedMotion={reducedMotion} />
      <div className="mt-4 rounded-2xl border border-[var(--line)] bg-black/15 p-4 text-sm text-[var(--muted)]">
        <span className="font-medium text-[var(--text)]">Why this is art:</span> {demo.whyArt}
      </div>
      {open ? <div className="mt-4"><BehindTheScenes data={demo.behindTheScenes} whyArt={demo.whyArt} /></div> : null}
    </section>
  )
}
