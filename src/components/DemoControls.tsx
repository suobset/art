import type { PropsWithChildren, ReactNode } from 'react'

export function DemoControls({ children, actions }: PropsWithChildren<{ actions?: ReactNode }>) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-h-[320px] overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))] p-3 md:p-4">
        {children}
      </div>
      <div className="space-y-3">
        {actions}
      </div>
    </div>
  )
}
