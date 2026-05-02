import type { PropsWithChildren } from 'react'

type ToggleProps = PropsWithChildren<{
  pressed: boolean
  onPressedChange: () => void
}>

export function Toggle({ pressed, onPressedChange, children }: ToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onPressedChange}
      className="rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-1.5 text-sm text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--text)]"
    >
      {children}
    </button>
  )
}
