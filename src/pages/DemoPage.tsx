import { useEffect } from 'react'
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
  const demo = index === -1 ? null : demos[index]

  useEffect(() => {
    document.title = demo ? `${demo.title} - art + algorithms` : 'art + algorithms'
  }, [demo])

  if (index === -1) {
    return <Navigate to="/" replace />
  }
  const activeDemo = demos[index]!
  const previous = demos[(index - 1 + demos.length) % demos.length]
  const next = demos[(index + 1) % demos.length]

  return (
    <>
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 md:px-6">
        <div className="surface-frame px-5 py-5 md:px-6 md:py-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="meta-label mb-2">art + algorithms · single work view</p>
              <h1 className="font-[var(--hero-font)] text-4xl tracking-[-0.05em] text-[var(--text)] md:text-5xl">{activeDemo.title}</h1>
            </div>
            <Link to="/" className="control-button">
              back to gallery
            </Link>
          </div>
          <div className="grid gap-4 text-[var(--text-muted)] md:grid-cols-[1.5fr_1fr]">
            <p>{activeDemo.shortDescription}</p>
            <p>Curated by {author.shortName}. Hosted at <a href={author.artDomain} className="text-[var(--accent-2)] underline-offset-4 hover:underline">art.skushagra.com</a>.</p>
          </div>
        </div>
        <GalleryNav demos={demos} mode="links" activeId={activeDemo.id} />
        <DemoCard demo={activeDemo} reducedMotion={reducedMotion} forceOpen />
        <div className="grid gap-4 md:grid-cols-2">
          <Link to={`/demo/${previous.id}`} className="surface-note px-5 py-5 text-[var(--text-muted)] transition hover:border-[var(--accent)]">
            <p className="meta-label mb-2">previous room</p>
            <p className="font-[var(--hero-font)] text-2xl text-[var(--text)]">{previous.title}</p>
          </Link>
          <Link to={`/demo/${next.id}`} className="surface-note px-5 py-5 text-right text-[var(--text-muted)] transition hover:border-[var(--accent)]">
            <p className="meta-label mb-2">next room</p>
            <p className="font-[var(--hero-font)] text-2xl text-[var(--text)]">{next.title}</p>
          </Link>
        </div>
      </section>
      <Footer author={author} />
    </>
  )
}
