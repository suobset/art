import type { ReactNode } from 'react'

export function Parameter({ label, value, children }: { label: string; value?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2 rounded-2xl border border-[var(--line)] bg-black/10 p-3 text-sm text-[var(--muted)]">
      <span className="flex items-center justify-between gap-4">
        <span>{label}</span>
        {value ? <span className="font-[var(--mono-font)] text-xs text-[var(--text)]">{value}</span> : null}
      </span>
      {children}
    </label>
  )
}
