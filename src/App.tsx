import { useEffect, useState } from 'react'
import { demos } from './demos'
import { Hero } from './components/Hero'
import { GalleryNav } from './components/GalleryNav'
import { Layout } from './components/Layout'
import { DemoCard } from './components/DemoCard'
import { manifesto } from './content/manifesto'

function App() {
  const [forceReducedMotion, setForceReducedMotion] = useState(false)
  const [paperMode, setPaperMode] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = paperMode ? 'paper' : 'dark'
  }, [paperMode])

  return (
    <Layout
      reducedMotion={forceReducedMotion}
      onToggleReducedMotion={() => setForceReducedMotion((value) => !value)}
      paperMode={paperMode}
      onTogglePaperMode={() => setPaperMode((value) => !value)}
    >
      <Hero manifesto={manifesto} />
      <GalleryNav demos={demos} />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-16 md:px-6">
        {demos.map((demo) => (
          <DemoCard key={demo.id} demo={demo} reducedMotion={forceReducedMotion} />
        ))}
      </main>
    </Layout>
  )
}

export default App
