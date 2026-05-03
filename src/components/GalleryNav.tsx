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
      <div className="surface-frame demo-scroll flex gap-2 overflow-x-auto px-3 py-3">
        <div className="mr-2 flex shrink-0 items-center gap-3 px-2">
          <span className="meta-label">floor map</span>
          <span className="h-px w-10 bg-[var(--rule)]" />
        </div>
        {demos.map((demo) => {
          const active = demo.id === activeId
          return (
            <Link
              key={demo.id}
              to={`/demo/${demo.id}`}
              className={`control-button shrink-0 ${active ? 'border-transparent bg-[var(--accent)] text-[#1a140f]' : ''}`}
            >
              {labels[demo.id] ?? demo.title.toLowerCase()}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
