import { demoLabels } from '../content/demoCopy'
import type { DemoDefinition } from '../lib/demoTypes'
import { FlowFieldDemo } from './FlowFieldDemo'
import { PixelConstraintDemo } from './PixelConstraintDemo'
import { SortingChoreographyDemo } from './SortingChoreographyDemo'

export const demos: DemoDefinition[] = [
  {
    id: 'gesture',
    title: demoLabels.flowField,
    shortDescription: 'Particles drift through a field that feels closer to gesture drawing than simulation demo theater.',
    whyArt: 'A brushstroke can be simulated as a behavior, not just a mark.',
    tags: ['canvas', 'motion', 'seeded'],
    component: FlowFieldDemo,
    behindTheScenes: {
      concept: 'Each particle samples the angle of an invisible field. Small changes to curl, speed, and disturbance make the whole piece feel like a different hand.',
      codeExcerpt: `for (const particle of particles) {\n  const angle = fieldAt(particle.x, particle.y, seed) + pointerPull\n  particle.x += Math.cos(angle) * speed\n  particle.y += Math.sin(angle) * speed\n}`,
      parameters: [
        { name: 'density', meaning: 'How many marks are being drawn at once.' },
        { name: 'curl', meaning: 'How tightly the invisible field bends.' },
        { name: 'trail length', meaning: 'How quickly old marks fade away.' },
      ],
      tryThis: ['Lower the trail fade and increase curl for smoky spirals.', 'Click the field several times and watch one disturbance echo through many particles.'],
    },
  },
  {
    id: 'grid',
    title: demoLabels.pixelGrid,
    shortDescription: 'A tiny grid editor where the data structure and the drawing are almost the same object.',
    whyArt: 'A limit is not a cage. It is a shape.',
    tags: ['grid', 'constraint', 'ascii'],
    component: PixelConstraintDemo,
    behindTheScenes: {
      concept: 'The image is just a 32 by 18 array of numbers. Palette changes make the same structure read as poster, tapestry, or icon.',
      codeExcerpt: `grid[y][x] = colorIndex\nif (mirrorMode) {\n  grid[y][width - 1 - x] = colorIndex\n}`,
      parameters: [
        { name: 'palette', meaning: 'Changes the emotional temperature without changing the structure.' },
        { name: 'brush size', meaning: 'How much of the grid changes per gesture.' },
        { name: 'mirror mode', meaning: 'Whether one action becomes two.' },
      ],
      tryThis: ['Turn mirror mode off for asymmetry, then back on to see the composition lock into a new rule.', 'Copy the ASCII output and notice how little data is needed to keep the image alive.'],
    },
  },
  {
    id: 'choreography',
    title: demoLabels.sorting,
    shortDescription: 'Ordering numbers is the task; how they travel toward order is the dance.',
    whyArt: 'An algorithm has a gait.',
    tags: ['algorithm', 'tempo', 'comparison'],
    component: SortingChoreographyDemo,
    behindTheScenes: {
      concept: 'Every sorting method reaches the same destination, but with a different rhythm of hesitation, swap, and sweep.',
      codeExcerpt: `steps.push({ values, active: [i, j], swap: false })\nif (values[i] > values[j]) {\n  swap(values, i, j)\n  steps.push({ values, active: [i, j], swap: true })\n}`,
      parameters: [
        { name: 'algorithm', meaning: 'Changes the movement vocabulary.' },
        { name: 'tempo', meaning: 'Decides whether the piece reads as pulse, march, or shimmer.' },
        { name: 'color mode', meaning: 'Lets value or motion take visual priority.' },
      ],
      tryThis: ['Switch from insertion to quicksort at the same tempo and feel how the rhythm jumps.', 'Use step mode to study a single comparison like a frame in choreography notation.'],
    },
  },
]
