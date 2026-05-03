import type { ReactNode } from 'react'

export function Parameter({ label, value, children }: { label: string; value?: string; children: ReactNode }) {
  return (
    <label className="instrument-panel flex flex-col gap-2 px-3 py-3 text-sm text-[var(--text-muted)]">
      <span className="flex items-center justify-between gap-4">
        <span className="meta-label text-[0.66rem] text-[var(--text-faint)]">{label}</span>
        {value ? <span className="font-[var(--mono-font)] text-xs text-[var(--text)]">{value}</span> : null}
      </span>
      {children}
    </label>
  )
}
