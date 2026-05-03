import { Link } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { GalleryNav } from '../components/GalleryNav'
import { Hero } from '../components/Hero'
import { author } from '../content/author'
import { manifesto } from '../content/manifesto'
import { demos } from '../demos'

type HomePageProps = {
  reducedMotion: boolean
}

export function HomePage({ reducedMotion }: HomePageProps) {
  return (
    <>
      <Hero manifesto={manifesto} author={author} reducedMotion={reducedMotion} />
      <GalleryNav demos={demos} mode="links" />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-16 md:px-6">
        <section className="grid gap-4 rounded-[2rem] border border-[var(--line)] bg-[var(--bg-elevated)] p-5 text-[var(--muted)] md:grid-cols-3 md:p-6">
          <div>
            <h2 className="mb-2 font-[var(--hero-font)] text-3xl text-[var(--text)]">What this gallery argues</h2>
            <p>Programming becomes art when structure, timing, interaction, and meaning are chosen on purpose.</p>
          </div>
          <p>This homepage is now the threshold: choose a piece, step into it, and study one behavior at a time.</p>
          <p>{reducedMotion ? 'Motion is softened right now, so each piece favors stillness and stepping.' : 'Motion is live right now, so algorithms can reveal their own rhythm.'}</p>
        </section>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {demos.map((demo, index) => (
            <Link
              key={demo.id}
              to={`/demo/${demo.id}`}
              className="group rounded-[2rem] border border-[var(--line)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow)] transition hover:border-[var(--accent)] hover:translate-y-[-2px]"
            >
              <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[var(--soft)]">room {String(index + 1).padStart(2, '0')}</p>
              <h2 className="mb-3 font-[var(--hero-font)] text-3xl tracking-[-0.04em] text-[var(--text)]">{demo.title}</h2>
              <p className="mb-4 text-[var(--muted)]">{demo.shortDescription}</p>
              <div className="mb-4 flex flex-wrap gap-2 text-xs text-[var(--soft)]">
                {demo.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-[var(--line)] px-2 py-1">{tag}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text)]">Enter this piece</span>
                <span className="text-[var(--accent-2)] group-hover:text-[var(--accent)]">→</span>
              </div>
            </Link>
          ))}
        </section>
      </main>
      <Footer author={author} />
    </>
  )
}
