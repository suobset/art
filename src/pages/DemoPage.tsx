import { Link, Navigate, useParams } from 'react-router-dom'
import { DemoCard } from '../components/DemoCard'
import { Footer } from '../components/Footer'
import { GalleryNav } from '../components/GalleryNav'
import { author } from '../content/author'
import { demos } from '../demos'

type DemoPageProps = {
  reducedMotion: boolean
}

export function DemoPage({ reducedMotion }: DemoPageProps) {
  const { demoId } = useParams()
  const index = demos.findIndex((demo) => demo.id === demoId)

  if (index === -1) {
    return <Navigate to="/" replace />
  }

  const demo = demos[index]
  const previous = demos[(index - 1 + demos.length) % demos.length]
  const next = demos[(index + 1) % demos.length]

  return (
    <>
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 md:px-6">
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow)] md:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.28em] text-[var(--soft)]">art + algorithms · single work view</p>
              <h1 className="font-[var(--hero-font)] text-4xl tracking-[-0.05em] text-[var(--text)] md:text-5xl">{demo.title}</h1>
            </div>
            <Link to="/" className="rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--text)] transition hover:border-[var(--accent)]">
              back to gallery
            </Link>
          </div>
          <div className="grid gap-4 text-[var(--muted)] md:grid-cols-[1.5fr_1fr]">
            <p>{demo.shortDescription}</p>
            <p>Curated by {author.shortName}. Hosted at <a href={author.artDomain} className="text-[var(--accent-2)] underline-offset-4 hover:underline">art.skushagra.com</a>.</p>
          </div>
        </div>
        <GalleryNav demos={demos} mode="links" activeId={demo.id} />
        <DemoCard demo={demo} reducedMotion={reducedMotion} forceOpen />
        <div className="grid gap-4 md:grid-cols-2">
          <Link to={`/demo/${previous.id}`} className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--bg-elevated)] p-5 text-[var(--muted)] transition hover:border-[var(--accent)]">
            <p className="mb-2 text-xs uppercase tracking-[0.28em] text-[var(--soft)]">previous room</p>
            <p className="font-[var(--hero-font)] text-2xl text-[var(--text)]">{previous.title}</p>
          </Link>
          <Link to={`/demo/${next.id}`} className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--bg-elevated)] p-5 text-right text-[var(--muted)] transition hover:border-[var(--accent)]">
            <p className="mb-2 text-xs uppercase tracking-[0.28em] text-[var(--soft)]">next room</p>
            <p className="font-[var(--hero-font)] text-2xl text-[var(--text)]">{next.title}</p>
          </Link>
        </div>
      </section>
      <Footer author={author} />
    </>
  )
}
