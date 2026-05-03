import { useState } from 'react'
import type { DemoDefinition } from '../lib/demoTypes'
import { BehindTheScenes } from './BehindTheScenes'

export function DemoCard({ demo, reducedMotion, forceOpen = false }: { demo: DemoDefinition; reducedMotion: boolean; forceOpen?: boolean }) {
  const [open, setOpen] = useState(forceOpen)
  const DemoComponent = demo.component

  return (
    <section id={demo.id} className="surface-frame px-4 py-4 md:px-6 md:py-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="meta-label mb-2">{demo.tags.join(' · ')}</p>
          <h2 className="font-[var(--hero-font)] text-3xl tracking-[-0.04em] text-[var(--text)]">{demo.title}</h2>
          <p className="max-w-2xl text-[var(--text-muted)]">{demo.shortDescription}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="control-button"
        >
          {open ? 'hide source study' : 'behind the scenes'}
        </button>
      </div>
      <DemoComponent reducedMotion={reducedMotion} />
      <div className="surface-note mt-4 px-4 py-4 text-sm text-[var(--text-muted)]">
        <div className="mb-2 flex items-center gap-3">
          <span className="meta-label text-[var(--accent-2)]">why this is art</span>
          <span className="h-px flex-1 bg-[var(--rule)]" />
        </div>
        {demo.whyArt}
      </div>
      {open ? <div className="mt-4"><BehindTheScenes data={demo.behindTheScenes} whyArt={demo.whyArt} /></div> : null}
    </section>
  )
}
