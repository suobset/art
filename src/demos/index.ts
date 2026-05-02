import { demoLabels } from '../content/demoCopy'
import type { DemoDefinition } from '../lib/demoTypes'
import { FlowFieldDemo } from './FlowFieldDemo'
import { PixelConstraintDemo } from './PixelConstraintDemo'
import { SortingChoreographyDemo } from './SortingChoreographyDemo'
import { CellularAutomataDemo } from './CellularAutomataDemo'
import { GenerativePoetryDemo } from './GenerativePoetryDemo'
import { RecursiveGardenDemo } from './RecursiveGardenDemo'

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
  {
    id: 'weather',
    title: demoLabels.cellular,
    shortDescription: 'A local rule system where weather-like complexity emerges from neighbor counts and repetition.',
    whyArt: 'The artist does not draw every frame. The artist writes the conditions for becoming.',
    tags: ['rules', 'emergence', 'grid'],
    component: CellularAutomataDemo,
    behindTheScenes: {
      concept: 'Each cell only checks nearby cells. The surprise comes from how those tiny decisions propagate across the whole plane.',
      codeExcerpt: `const neighbors = countNeighbors(world, x, y)
if (cell === 1) return survive.has(neighbors) ? 1 : 0
return birth.has(neighbors) ? 1 : 0`,
      parameters: [
        { name: 'birth values', meaning: 'Neighbor counts that create new cells.' },
        { name: 'survival values', meaning: 'Neighbor counts that keep existing cells alive.' },
        { name: 'speed', meaning: 'How quickly the system reveals its weather.' },
      ],
      tryThis: ['Draw a few dense clusters, then step slowly instead of running.', 'Try the cave preset and then erase a channel to redirect the growth.'],
    },
  },
  {
    id: 'poem',
    title: demoLabels.poetry,
    shortDescription: 'A local text generator that acts like a collaborator while keeping its grammar visible.',
    whyArt: 'A program can be a collaborator without pretending to be a person.',
    tags: ['language', 'grammar', 'remix'],
    component: GenerativePoetryDemo,
    behindTheScenes: {
      concept: 'The poem is built from hand-written banks and a clear template. Locking a word turns the system into a constrained revision partner.',
      codeExcerpt: `line := noun + verb + optional texture + place
if (lockedWord) noun = lockedWord
texture appears more often as temperature rises`,
      parameters: [
        { name: 'mood', meaning: 'Swaps the vocabulary set.' },
        { name: 'temperature', meaning: 'Raises the chance of detours and texture phrases.' },
        { name: 'punctuation density', meaning: 'Changes the breathing pattern of the line.' },
      ],
      tryThis: ['Lock one word in each line and regenerate until the poem starts to feel authored.', 'Lower punctuation and raise temperature to make the syntax loosen.'],
    },
  },
  {
    id: 'garden',
    title: demoLabels.garden,
    shortDescription: 'A branching system where repetition with variation feels less like math homework and more like memory.',
    whyArt: 'Recursion is memory with a shape.',
    tags: ['svg', 'recursion', 'growth'],
    component: RecursiveGardenDemo,
    behindTheScenes: {
      concept: 'Each branch calls for smaller branches. Variation in angle, depth, and asymmetry stops the repetition from feeling mechanical.',
      codeExcerpt: `grow(x2, y2, nextLength, angle + spread, depth - 1)
grow(x2, y2, nextLength, angle - spread, depth - 1)`,
      parameters: [
        { name: 'depth', meaning: 'How many times the tree remembers to branch.' },
        { name: 'asymmetry', meaning: 'How much the left and right decisions differ.' },
        { name: 'wind', meaning: 'A small offset that makes the static structure feel alive.' },
      ],
      tryThis: ['Increase asymmetry until the tree starts to feel weathered rather than idealized.', 'Switch seasons without changing the seed to see palette act like lighting design.'],
    },
  },

]
