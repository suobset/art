import { demoLabels } from '../content/demoCopy'
import type { DemoDefinition } from '../lib/demoTypes'
import { CellularAutomataDemo } from './CellularAutomataDemo'
import { FlowFieldDemo } from './FlowFieldDemo'
import { GenerativePoetryDemo } from './GenerativePoetryDemo'
import { KineticTypeDemo } from './KineticTypeDemo'
import { PathfindingPersonalityDemo } from './PathfindingPersonalityDemo'
import { PixelConstraintDemo } from './PixelConstraintDemo'
import { RecursiveGardenDemo } from './RecursiveGardenDemo'
import { ShaderWithoutShadersDemo } from './ShaderWithoutShadersDemo'
import { SortingChoreographyDemo } from './SortingChoreographyDemo'
import { SourceRemixDemo } from './SourceRemixDemo'

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
      codeExcerpt: `const neighbors = countNeighbors(world, x, y)\nif (cell === 1) return survive.has(neighbors) ? 1 : 0\nreturn birth.has(neighbors) ? 1 : 0`,
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
      codeExcerpt: `line := noun + verb + optional texture + place\nif (lockedWord) noun = lockedWord\ntexture appears more often as temperature rises`,
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
      codeExcerpt: `grow(x2, y2, nextLength, angle + spread, depth - 1)\ngrow(x2, y2, nextLength, angle - spread, depth - 1)`,
      parameters: [
        { name: 'depth', meaning: 'How many times the tree remembers to branch.' },
        { name: 'asymmetry', meaning: 'How much the left and right decisions differ.' },
        { name: 'wind', meaning: 'A small offset that makes the static structure feel alive.' },
      ],
      tryThis: ['Increase asymmetry until the tree starts to feel weathered rather than idealized.', 'Switch seasons without changing the seed to see palette act like lighting design.'],
    },
  },
  {
    id: 'light',
    title: demoLabels.shader,
    shortDescription: 'A luminous pattern built from arithmetic alone: waves, distance, and color mapping without WebGL.',
    whyArt: 'Arithmetic can glow.',
    tags: ['canvas', 'math', 'light'],
    component: ShaderWithoutShadersDemo,
    behindTheScenes: {
      concept: 'Sine waves, radial distance, and color quantization combine into something that looks lit from inside.',
      codeExcerpt: `const wave = sin((x * frequency + phase) * 3.1)\nconst flare = sin(radius * 16 - time * 3)\nconst brightness = clamp((wave + flare + 2) / 4, 0, 1)`,
      parameters: [
        { name: 'frequency', meaning: 'How tightly the wave bands repeat.' },
        { name: 'distortion', meaning: 'How much the pattern refuses smooth regularity.' },
        { name: 'resolution', meaning: 'How coarse or fine the fake pixels feel.' },
      ],
      tryThis: ['Lower the resolution until the image becomes a woven screen instead of a gradient.', 'Pause the animation and move the pointer to compose a still frame.'],
    },
  },
  {
    id: 'type',
    title: demoLabels.type,
    shortDescription: 'A typographic stage where letters act like bodies with weight, spring, and personal space.',
    whyArt: 'Words do not have to sit still.',
    tags: ['type', 'motion', 'layout'],
    component: KineticTypeDemo,
    behindTheScenes: {
      concept: 'Each letter gets its own transform based on pointer position, spacing, and a few force-like parameters. Layout becomes choreography.',
      codeExcerpt: `offsetX = pointerPull * intensity\noffsetY = sin(index + pointer.x) * elasticity - gravity\nrotate = mix(-10, 10, pointer.y)`,
      parameters: [
        { name: 'gravity', meaning: 'How much letters sink back toward a baseline.' },
        { name: 'elasticity', meaning: 'How springy the rebound feels.' },
        { name: 'spacing', meaning: 'How much breathing room the phrase gets.' },
      ],
      tryThis: ['Type a short phrase with repeating letters and move the pointer slowly across it.', 'Drop motion intensity to zero and then bring it back to feel the composition wake up.'],
    },
  },
  {
    id: 'maze',
    title: demoLabels.pathfinding,
    shortDescription: 'A maze where different search strategies feel cautious, greedy, exhaustive, or impulsive.',
    whyArt: 'Even problem solving has temperament.',
    tags: ['search', 'grid', 'comparison'],
    component: PathfindingPersonalityDemo,
    behindTheScenes: {
      concept: 'The path may be similar, but the search frontier expands with a different personality depending on the algorithm and heuristic pressure.',
      codeExcerpt: `priority = cost + heuristic(next, end) * heuristicStrength\nfrontier.push({ point: next, cost, priority })`,
      parameters: [
        { name: 'algorithm', meaning: 'Changes whether search feels broad, deep, patient, or goal-hungry.' },
        { name: 'heuristic strength', meaning: 'Pushes A* toward greed or restraint.' },
        { name: 'maze density', meaning: 'Controls how much resistance the search meets.' },
      ],
      tryThis: ['Set heuristic strength to zero and compare A* to Dijkstra.', 'Drag the end point into a corner and watch DFS wander before it commits.'],
    },
  },
  {
    id: 'source',
    title: demoLabels.source,
    shortDescription: 'A small live-edit piece where the audience touches the procedure, not only the result.',
    whyArt: 'Open source lets the audience touch the process.',
    tags: ['source', 'parser', 'remix'],
    component: SourceRemixDemo,
    behindTheScenes: {
      concept: 'Only a few constants are editable, but that is enough to expose the work as readable procedure instead of a sealed image.',
      codeExcerpt: `if (!line.matches(allowedPattern)) showGentleError()\nconstants[name] = Number(value)\nredraw(constants)`,
      parameters: [
        { name: 'orbit', meaning: 'How fast the petal controls cycle around the center.' },
        { name: 'petals', meaning: 'How many strokes the figure remembers to draw.' },
        { name: 'jitter', meaning: 'How much each petal slips away from perfect symmetry.' },
      ],
      tryThis: ['Change one number at a time and notice how little source is needed to redirect the whole image.', 'Try an invalid line and see how the piece protects the edit without pretending nothing happened.'],
    },
  },
]
