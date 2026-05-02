import type { ComponentType } from 'react'

export type DemoComponentProps = {
  reducedMotion: boolean
}

export type BehindTheScenesData = {
  concept: string
  codeExcerpt: string
  parameters: Array<{
    name: string
    meaning: string
  }>
  tryThis: string[]
}

export type DemoDefinition = {
  id: string
  title: string
  shortDescription: string
  whyArt: string
  tags: string[]
  component: ComponentType<DemoComponentProps>
  behindTheScenes: BehindTheScenesData
}
