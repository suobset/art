import { useEffect, useState } from 'react'
import { demos } from './demos'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion'
import { Hero } from './components/Hero'
import { GalleryNav } from './components/GalleryNav'
import { Layout } from './components/Layout'
import { DemoCard } from './components/DemoCard'
import { manifesto } from './content/manifesto'

function App() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [forceReducedMotion, setForceReducedMotion] = useState(false)
  const [paperMode, setPaperMode] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = paperMode ? 'paper' : 'dark'
  }, [paperMode])

  const reducedMotion = prefersReducedMotion || forceReducedMotion

  return (
    <Layout
      reducedMotion={reducedMotion}
      onToggleReducedMotion={() => setForceReducedMotion((value) => !value)}
      paperMode={paperMode}
      onTogglePaperMode={() => setPaperMode((value) => !value)}
    >
      <Hero manifesto={manifesto} />
      <GalleryNav demos={demos} />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-16 md:px-6">
        <section className="grid gap-4 rounded-[2rem] border border-[var(--line)] bg-[var(--bg-elevated)] p-5 text-[var(--muted)] md:grid-cols-3 md:p-6">
          <div>
            <h2 className="mb-2 font-[var(--hero-font)] text-3xl text-[var(--text)]">What this gallery argues</h2>
            <p>Programming becomes art when structure, timing, interaction, and meaning are chosen on purpose.</p>
          </div>
          <p>The pieces below are meant to be touched, paused, edited, and studied.</p>
          <p>{reducedMotion ? 'Motion is softened right now, so each piece favors stillness and stepping.' : 'Motion is live right now, so algorithms can reveal their own rhythm.'}</p>
        </section>
        {demos.map((demo) => (
          <DemoCard key={demo.id} demo={demo} reducedMotion={reducedMotion} />
        ))}
      </main>
    </Layout>
  )
}

export default App
