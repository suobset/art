import { Link } from 'react-router-dom'
import { useEffect } from 'react'
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
  useEffect(() => {
    document.title = 'art + algorithms'
  }, [])
  return (
    <>
      <Hero manifesto={manifesto} author={author} reducedMotion={reducedMotion} />
      <GalleryNav demos={demos} mode="links" />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-16 md:px-6">
        <section className="surface-frame grid gap-4 px-5 py-5 text-[var(--text-muted)] md:grid-cols-3 md:px-6 md:py-6">
          <div>
            <p className="meta-label mb-3">premise / room zero</p>
            <h2 className="font-[var(--hero-font)] text-3xl text-[var(--text)]">What this gallery argues</h2>
          </div>
          <p>Programming becomes art when structure, timing, interaction, and meaning are chosen on purpose.</p>
          <p>{reducedMotion ? 'Motion is softened right now, so each piece favors stillness and stepping.' : 'Motion is live right now, so algorithms can reveal their own rhythm.'}</p>
        </section>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {demos.map((demo, index) => (
            <Link
              key={demo.id}
              to={`/demo/${demo.id}`}
              className="surface-placard group px-5 py-5 transition hover:border-[var(--accent)] hover:translate-y-[-2px]"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="meta-label">room {String(index + 1).padStart(2, '0')}</p>
                <span className="font-[var(--mono-font)] text-xs text-[var(--text-faint)]">enter -></span>
              </div>
              <h2 className="mb-3 font-[var(--hero-font)] text-3xl tracking-[-0.04em] text-[var(--text)]">{demo.title}</h2>
              <p className="mb-4 text-[var(--text-muted)]">{demo.shortDescription}</p>
              <div className="mb-4 flex flex-wrap gap-2 text-xs text-[var(--text-faint)]">
                {demo.tags.map((tag) => (
                  <span key={tag} className="control-chip px-2 py-1">{tag}</span>
                ))}
              </div>
              <div className="technical-rule pt-3 text-sm text-[var(--text)]">
                This room studies {demo.tags[0]} as a medium.
              </div>
            </Link>
          ))}
        </section>
      </main>
      <Footer author={author} />
    </>
  )
}
