import type { PropsWithChildren, ReactNode } from 'react'

type ImmersiveDemoProps = PropsWithChildren<{
  controls?: ReactNode
  overlay?: ReactNode
  caption?: ReactNode
  aspect?: 'tall' | 'cinema'
}>

export function ImmersiveDemo({ children, controls, overlay, caption, aspect = 'cinema' }: ImmersiveDemoProps) {
  const stageClass = aspect === 'tall'
    ? 'h-[78vh] min-h-[520px]'
    : 'h-[68vh] min-h-[440px]'

  return (
    <div className="flex flex-col gap-4">
      <div className={`relative overflow-hidden rounded-[1.25rem] border border-[var(--rule)] bg-[#06050a] ${stageClass}`}>
        {children}
        {overlay ? (
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 md:p-4">
            <div className="pointer-events-auto self-start max-w-md">
              {overlay}
            </div>
          </div>
        ) : null}
      </div>
      {controls ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {controls}
        </div>
      ) : null}
      {caption ? <p className="text-sm text-[var(--text-faint)]">{caption}</p> : null}
    </div>
  )
}
