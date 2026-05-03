import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion'
import { DemoPage } from './pages/DemoPage'
import { HomePage } from './pages/HomePage'

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
      <Routes>
        <Route path="/" element={<HomePage reducedMotion={reducedMotion} />} />
        <Route path="/demo/:demoId" element={<DemoPage reducedMotion={reducedMotion} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
