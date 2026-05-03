import type { PropsWithChildren, ReactNode } from 'react'

export function DemoControls({ children, actions }: PropsWithChildren<{ actions?: ReactNode }>) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="surface-frame min-h-[320px] overflow-hidden px-3 py-3 md:px-4 md:py-4">
        {children}
      </div>
      <div className="space-y-3">
        {actions}
      </div>
    </div>
  )
}
