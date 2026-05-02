import type { PropsWithChildren } from 'react'
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
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,95,210,0.08),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(107,227,255,0.1),transparent_26%)]" />
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[color:color-mix(in_srgb,var(--bg)_72%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <a href="#top" className="font-[var(--hero-font)] text-2xl tracking-[-0.08em]">
            art
          </a>
          <div className="flex flex-wrap items-center gap-2">
            <Toggle pressed={paperMode} onPressedChange={onTogglePaperMode}>
              {paperMode ? 'night mode' : 'paper mode'}
            </Toggle>
            <Toggle pressed={reducedMotion} onPressedChange={onToggleReducedMotion}>
              {reducedMotion ? 'motion paused' : 'reduce motion'}
            </Toggle>
            <a
              href="#gallery"
              className="rounded-full border border-[var(--accent)] px-3 py-1.5 text-sm text-[var(--text)] transition hover:bg-[var(--accent)] hover:text-black"
            >
              enter the gallery
            </a>
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}
