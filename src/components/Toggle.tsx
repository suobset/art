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
      className="control-button flex items-center gap-2 text-left"
    >
      <span className="font-[var(--mono-font)] text-[0.7rem] uppercase tracking-[0.18em] text-[var(--text-faint)]">
        {pressed ? 'on' : 'off'}
      </span>
      <span>{children}</span>
    </button>
  )
}
