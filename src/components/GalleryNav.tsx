import { Link } from 'react-router-dom'
import type { DemoDefinition } from '../lib/demoTypes'

const labels: Record<string, string> = {
  gesture: 'gesture',
  grid: 'grid',
  choreography: 'choreography',
  weather: 'weather',
  poem: 'poem',
  garden: 'garden',
  light: 'light',
  type: 'type',
  maze: 'maze',
  source: 'source',
}

export function GalleryNav({ demos, activeId }: { demos: DemoDefinition[]; mode?: 'links'; activeId?: string }) {
  return (
    <nav id="gallery" aria-label="Gallery navigation" className="mx-auto mb-8 w-full max-w-7xl px-4 md:px-6">
      <div className="demo-scroll flex gap-2 overflow-x-auto rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] p-2 shadow-[var(--shadow)]">
        {demos.map((demo) => {
          const active = demo.id === activeId
          return (
            <Link
              key={demo.id}
              to={`/demo/${demo.id}`}
              className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${active ? 'bg-[var(--text)] text-[var(--bg)]' : 'text-[var(--muted)] hover:bg-[var(--line)] hover:text-[var(--text)]'}`}
            >
              {labels[demo.id] ?? demo.title.toLowerCase()}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
