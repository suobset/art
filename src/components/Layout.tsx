import type { PropsWithChildren } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Toggle } from './Toggle'

type LayoutProps = PropsWithChildren<{
  reducedMotion: boolean
  onToggleReducedMotion: () => void
  paperMode: boolean
  onTogglePaperMode: () => void
}>

export function Layout({
  reducedMotion,
  onToggleReducedMotion,
  paperMode,
  onTogglePaperMode,
  children,
}: LayoutProps) {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="app-shell relative overflow-hidden">
      <header className="sticky top-0 z-50 border-b border-[var(--rule-strong)] bg-[color:color-mix(in_srgb,var(--bg)_84%,transparent)] backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-3 md:grid-cols-[1fr_auto] md:px-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="technical-rule pt-3 font-[var(--hero-font)] text-2xl tracking-[-0.08em] text-[var(--text)] md:text-[1.7rem]">
              art + algorithms
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <a
              href="https://skushagra.com"
              className="control-button"
              data-variant="ghost"
            >
              Created by Kush S.
            </a>
            <Toggle pressed={paperMode} onPressedChange={onTogglePaperMode}>
              {paperMode ? 'night mode' : 'paper mode'}
            </Toggle>
            <Toggle pressed={reducedMotion} onPressedChange={onToggleReducedMotion}>
              {reducedMotion ? 'motion paused' : 'reduce motion'}
            </Toggle>
            <Link
              to={isHome ? '/demo/gesture' : '/'}
              className="control-button"
              data-variant="accent"
            >
              {isHome ? 'enter gallery ->' : 'gallery home ->'}
            </Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}
