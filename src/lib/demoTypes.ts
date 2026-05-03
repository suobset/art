import type { ComponentType } from 'react'

export type DemoComponentProps = {
  reducedMotion: boolean
}

export type BehindTheScenesData = {
  overview: string
  explanation: string[]
  parameters: Array<{
    name: string
    meaning: string
  }>
  snippets: Array<{
    title: string
    code: string
    note: string
  }>
  tryThis: string[]
  distinctions?: string[]
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
