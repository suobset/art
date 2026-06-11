import { demoLabels } from '../content/demoCopy'
import type { DemoDefinition } from '../lib/demoTypes'
import { AttractorDemo } from './AttractorDemo'
import { CameraLensDemo } from './CameraLensDemo'
import { CellularAutomataDemo } from './CellularAutomataDemo'
import { FlowFieldDemo } from './FlowFieldDemo'
import { GenerativePoetryDemo } from './GenerativePoetryDemo'
import { IncantationDemo } from './IncantationDemo'
import { KineticTypeDemo } from './KineticTypeDemo'
import { MurmurationDemo } from './MurmurationDemo'
import { PathfindingPersonalityDemo } from './PathfindingPersonalityDemo'
import { PhyllotaxisDemo } from './PhyllotaxisDemo'
import { PixelConstraintDemo } from './PixelConstraintDemo'
import { PondDemo } from './PondDemo'
import { PrismDemo } from './PrismDemo'
import { ReactionDiffusionDemo } from './ReactionDiffusionDemo'
import { RecursiveGardenDemo } from './RecursiveGardenDemo'
import { ShaderWithoutShadersDemo } from './ShaderWithoutShadersDemo'
import { SortingChoreographyDemo } from './SortingChoreographyDemo'
import { SourceRemixDemo } from './SourceRemixDemo'
import { SpectrumDemo } from './SpectrumDemo'

const repoRoot = 'https://github.com/suobset/art/blob/main'

export const demos: DemoDefinition[] = [
  {
    id: 'gesture',
    title: demoLabels.flowField,
    shortDescription: 'Particles drift through a field that feels closer to gesture drawing than simulation demo theater.',
    whyArt: 'A brushstroke can be simulated as a behavior, not just a mark.',
    tags: ['canvas', 'motion', 'seeded'],
    component: FlowFieldDemo,
    behindTheScenes: {
      sourceFile: {
        label: 'src/demos/FlowFieldDemo.tsx',
        href: `${repoRoot}/src/demos/FlowFieldDemo.tsx`,
      },
      overview: 'Each particle acts like a tiny brush hair. It does not know the whole painting. It only asks the field which way to lean next, and the accumulation of those tiny decisions becomes a stroke.',
      explanation: [
        'A flow field is just a function that returns a direction for any point on the canvas. In this demo, that direction comes from a few layered sine and cosine waves plus a pointer disturbance.',
        'The seed matters because it changes the field consistently. Two different seeds are not random noise in the everyday sense; they are two different invisible landscapes that every particle agrees to follow.',
        'The visual style comes from several artistic choices: how many particles are active, how quickly old marks fade, how strongly the pointer bends the field, and how color cycles across the swarm.',
      ],
      parameters: [
        { name: 'density', meaning: 'How many active marks are being drawn. Small screens cap the count so the drawing stays fluid.' },
        { name: 'curl', meaning: 'How tightly the invisible directional field bends back on itself.' },
        { name: 'speed', meaning: 'How far each particle moves on every frame.' },
        { name: 'trail length', meaning: 'How much of the previous frame stays visible.' },
        { name: 'color mood', meaning: 'Which palette the field uses to feel ember-like, lagoon-like, mossy, or velvet-like.' },
      ],
      snippets: [
        {
          title: 'The particle update loop',
          code: `for (const particle of particles) {\n  const angle = fieldAt(particle.x, particle.y) + timeOffset\n  const nextX = particle.x + Math.cos(angle) * speed\n  const nextY = particle.y + Math.sin(angle) * speed\n\n  drawLine(particle.x, particle.y, nextX, nextY)\n  particle.x = nextX\n  particle.y = nextY\n}`,
          note: 'This is the heart of the piece. There is no stored path. The path appears because we repeatedly ask for a direction and then commit to it.',
        },
        {
          title: 'How the field bends',
          code: `const drift = sin((x + seed * 0.001) * 0.011)\nconst swirl = sin((x * 0.013 + y * 0.01 + seed * 0.0004) * curl)\nconst pull = pointerActive\n  ? clamp(1 - distance(x, y, pointer.x, pointer.y) / 140, 0, 1) * 2.4\n  : 0\n\nreturn drift + swirl + pull + pulse`,
          note: 'This is where mathematics turns into style. Tiny coefficient changes alter the field from calm stream to knotted turbulence.',
        },
        {
          title: 'Why trails feel painterly',
          code: `context.fillStyle = rgba(background, trailFade)\ncontext.fillRect(0, 0, width, height)`,
          note: 'Instead of clearing the whole canvas every frame, the demo paints a translucent dark veil over the old image. That makes motion behave like residue.',
        },
      ],
      tryThis: ['Lower the trail fade and increase curl for smoky spirals.', 'Click the field several times and notice that one disturbance can echo through many particles.', 'Compare two moods at the same seed to separate structure from palette.'],
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
      sourceFile: {
        label: 'src/demos/PixelConstraintDemo.tsx',
        href: `${repoRoot}/src/demos/PixelConstraintDemo.tsx`,
      },
      overview: 'This piece starts with a severe limit: 32 columns, 18 rows, and a tiny palette. That limit is not there to imitate technical weakness. It is there to create a specific kind of visual thinking.',
      explanation: [
        'The image is just a two-dimensional array of small integers. A cell value of 0 might mean background; 1, 2, and 3 choose other palette entries. The display is simply a readable skin over those numbers.',
        'Mirror mode is a good example of computational authorship. One stroke does not just draw; it declares a symmetry rule. The computer carries that rule out faster and more perfectly than a person would.',
        'The ASCII export matters because it reveals how thin the representation is. An image can survive translation into text if the underlying structure is strong enough.',
      ],
      parameters: [
        { name: 'palette', meaning: 'Changes the emotional register of the same numerical structure.' },
        { name: 'brush size', meaning: 'Determines how much of the grid changes per mark.' },
        { name: 'mirror mode', meaning: 'Turns one gesture into a bilateral rule.' },
        { name: 'show data representation', meaning: 'Lets visitors inspect the raw array, not just the rendered image.' },
      ],
      snippets: [
        {
          title: 'The image really is an array',
          code: `const grid = Array.from({ length: 18 }, () =>\n  Array.from({ length: 32 }, () => 0)\n)`,
          note: 'There is no hidden raster engine here. The artwork starts as a small table of values.',
        },
        {
          title: 'Painting with symmetry',
          code: `next[y][x] = color\nif (mirrorMode) {\n  next[y][width - 1 - x] = color\n}`,
          note: 'This is where the tool becomes expressive. A single decision is mirrored into a second one, and that enforced echo shapes the composition.',
        },
        {
          title: 'ASCII is another rendering mode',
          code: `const glyphs = [' ', '.', '*', '#']\nreturn grid\n  .map((row) => row.map((cell) => glyphs[cell]).join(''))\n  .join('\\n')`,
          note: 'The same data can appear as color blocks or characters. The representation changes, but the composition persists.',
        },
      ],
      tryThis: ['Turn mirror mode off for asymmetry, then back on to feel the piece re-enter a rule.', 'Copy the ASCII output and inspect how little information is needed to keep the image alive.', 'Switch palettes without repainting anything.'],
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
      sourceFile: {
        label: 'src/demos/SortingChoreographyDemo.tsx',
        href: `${repoRoot}/src/demos/SortingChoreographyDemo.tsx`,
      },
      overview: 'All four algorithms solve the same problem, but they move through it with strikingly different rhythms. The point is not merely that they differ in complexity; it is that they feel different in motion.',
      explanation: [
        'The demo precomputes a sequence of states called steps. Each step contains a snapshot of the values plus the bars currently being compared or swapped. The animation is just a performer walking through that score.',
        'Bubble sort keeps nudging neighbors, insertion sort carries one value backward until it fits, quicksort creates dramatic pivots and partitions, and merge sort builds order in chunks before stitching them together.',
        'By exposing play, pause, and step controls, the piece lets you watch an algorithm as choreography instead of only as an answer machine.',
      ],
      parameters: [
        { name: 'algorithm', meaning: 'Chooses which movement vocabulary generates the step score.' },
        { name: 'tempo', meaning: 'Controls whether the sequence reads as shimmer, walk, or march.' },
        { name: 'color mode', meaning: 'Either colors the bars by value or emphasizes movement events.' },
      ],
      snippets: [
        {
          title: 'Bubble sort: local nudges',
          code: `for (let j = 0; j < values.length - i - 1; j += 1) {\n  steps.push({ values: [...values], active: [j, j + 1], swap: false })\n  if (values[j] > values[j + 1]) {\n    swap(values, j, j + 1)\n    steps.push({ values: [...values], active: [j, j + 1], swap: true })\n  }\n}`,
          note: 'Bubble sort reads like a repeated social correction: compare neighbors, swap if needed, repeat until the largest values drift upward.',
        },
        {
          title: 'Insertion sort: carrying a value backward',
          code: `while (j > 0) {\n  steps.push({ values: [...values], active: [j - 1, j], swap: false })\n  if (values[j - 1] <= values[j]) break\n  swap(values, j - 1, j)\n  steps.push({ values: [...values], active: [j - 1, j], swap: true })\n  j -= 1\n}`,
          note: 'Insertion sort feels more purposeful than bubble sort. A value enters the partially sorted line and keeps moving until it belongs.',
        },
        {
          title: 'Quicksort: pivot and partition',
          code: `const pivot = values[end]\nfor (let index = start; index < end; index += 1) {\n  steps.push({ values: [...values], active: [index, end], swap: false })\n  if (values[index] <= pivot) {\n    swap(values, index, split)\n    steps.push({ values: [...values], active: [index, split], swap: true })\n    split += 1\n  }\n}`,
          note: 'Quicksort has a more theatrical structure: choose a pivot, separate the crowd around it, then recurse into smaller scenes.',
        },
        {
          title: 'Merge sort: stitch ordered chunks',
          code: `while (left < mid && right < end) {\n  steps.push({ values: [...values], active: [left, right], swap: false })\n  merged.push(values[left] < values[right] ? values[left++] : values[right++])\n}\nmerged.forEach((value, offset) => {\n  values[start + offset] = value\n  steps.push({ values: [...values], active: [start + offset], swap: true })\n})`,
          note: 'Merge sort is less about swapping in place and more about composing larger sorted fragments from smaller ones.',
        },
      ],
      tryThis: ['Hold tempo constant and switch algorithms to compare their gait directly.', 'Use step mode to see how merge sort differs from the swap-heavy algorithms.', 'Watch quicksort in movement color mode so pivot-driven events stand out.'],
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
      sourceFile: {
        label: 'src/demos/CellularAutomataDemo.tsx',
        href: `${repoRoot}/src/demos/CellularAutomataDemo.tsx`,
      },
      overview: 'Each cell knows almost nothing. It only checks its immediate neighbors. The surprise is that tiny local logic can still produce large-scale texture, growth, collapse, and drift.',
      explanation: [
        'A cellular automaton advances in generations. On each generation, every cell counts nearby live cells and decides whether it should be alive in the next frame.',
        'Birth values and survival values are the entire rule system. If a dead cell has one of the allowed birth counts, it turns on. If a live cell has one of the allowed survival counts, it stays on.',
        'That rule feels small enough to fit on a napkin, but the repeated application of it can create behavior that looks biological, meteorological, or architectural.',
      ],
      parameters: [
        { name: 'birth values', meaning: 'Neighbor counts that create a live cell from a dead one.' },
        { name: 'survival values', meaning: 'Neighbor counts that let a live cell persist.' },
        { name: 'speed', meaning: 'How quickly the world advances through generations.' },
        { name: 'cell size', meaning: 'How granular the weather appears on screen.' },
      ],
      snippets: [
        {
          title: 'Counting neighbors',
          code: `for (let yy = -1; yy <= 1; yy += 1) {\n  for (let xx = -1; xx <= 1; xx += 1) {\n    if (xx === 0 && yy === 0) continue\n    count += world[y + yy]?.[x + xx] ?? 0\n  }\n}`,
          note: 'The automaton has only local awareness. It never scans the whole image for meaning.',
        },
        {
          title: 'One generation step',
          code: `const neighbors = countNeighbors(world, x, y)\nif (cell === 1) {\n  return survivalRule.has(neighbors) ? 1 : 0\n}\nreturn birthRule.has(neighbors) ? 1 : 0`,
          note: 'This is the entire law of the world. Complexity arrives not by adding many exceptions, but by repeating a tiny rule for every cell.',
        },
        {
          title: 'Drawing is editing initial conditions',
          code: `next[y][x] = drawMode\nreturn next`,
          note: 'When you paint into the grid, you are not drawing the final picture. You are seeding the next few generations.',
        },
      ],
      tryThis: ['Draw a few dense clusters, then step slowly instead of running.', 'Try the cave preset and then erase a channel to redirect growth.', 'Change the cell size after the same seed and notice how scale changes the mood of the system.'],
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
      sourceFile: {
        label: 'src/demos/GenerativePoetryDemo.tsx',
        href: `${repoRoot}/src/demos/GenerativePoetryDemo.tsx`,
      },
      overview: 'This poem generator is deliberately small, local, and legible. It uses hand-written word banks and a simple grammar rather than a remote model or an attempt to imitate human consciousness.',
      explanation: [
        'A mood selects a vocabulary bank. That bank contains nouns, verbs, textures, and places. The generator then assembles lines by choosing words from those buckets according to a visible template.',
        'Temperature does not mean hidden intelligence here. It just changes how often the generator makes a more ornamental choice, such as including an extra texture phrase.',
        'The lock interaction matters artistically because it turns the visitor into a co-editor. You can freeze a word and ask the system to rewrite around it, which is closer to constrained revision than to autonomous authorship.',
      ],
      parameters: [
        { name: 'mood', meaning: 'Switches among different hand-authored vocabularies.' },
        { name: 'temperature', meaning: 'Raises the chance of extra descriptive detours.' },
        { name: 'line count', meaning: 'Changes the scale of the poem.' },
        { name: 'punctuation density', meaning: 'Changes how often the generator inserts pauses.' },
      ],
      snippets: [
        {
          title: 'The grammar is explicit',
          code: `line := noun + verb + optional texture + place`,
          note: 'The structure is visible on purpose. The piece is not trying to hide its machinery.',
        },
        {
          title: 'Choosing from hand-written banks',
          code: `const bank = banks[mood]\nconst noun = lockedWord || pickOne(random, bank.nouns)\nconst verb = pickOne(random, bank.verbs)\nconst texture = random() > threshold ? pickOne(random, bank.textures) : ''\nconst place = pickOne(random, bank.places)`,
          note: 'The expressive material comes from authored word lists, not scraped corpora or an opaque probability cloud.',
        },
        {
          title: 'Locking a word',
          code: `next[index] = locked ? '' : firstWord`,
          note: 'This tiny mechanic is what makes the generator feel collaborative. One word can anchor a line while the surrounding language changes.',
        },
      ],
      distinctions: [
        'This demo does not call any external AI or LLM service.',
        'It does not predict text from a giant training set; it samples from small local vocabularies written for this project.',
        'Its authorship is shared between the writer of the word banks, the designer of the grammar, and the visitor choosing locks and controls.',
      ],
      tryThis: ['Lock one word in each line and regenerate until the poem starts to feel authored rather than merely random.', 'Lower punctuation and raise temperature to loosen the syntax.', 'Switch moods without changing line count to hear the same structure speak differently.'],
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
      sourceFile: {
        label: 'src/demos/RecursiveGardenDemo.tsx',
        href: `${repoRoot}/src/demos/RecursiveGardenDemo.tsx`,
      },
      overview: 'A recursive drawing is a rule that calls itself. A branch makes smaller branches, which make smaller branches, until the structure decides it has said enough.',
      explanation: [
        'The tree begins with one trunk segment. From the end of that segment, the program recursively spawns child branches with smaller lengths and changed angles.',
        'Depth sets how many generations of memory the tree keeps. Asymmetry prevents perfect mirror balance, which helps the tree feel weathered or biological instead of diagrammatic.',
        'The season palette is a reminder that the same geometry can carry different moods when color and atmosphere shift. Shape is not the only artistic choice.',
      ],
      parameters: [
        { name: 'branching angle', meaning: 'How wide each split opens.' },
        { name: 'depth', meaning: 'How many times the system recursively branches before stopping.' },
        { name: 'asymmetry', meaning: 'How differently the left and right branches behave.' },
        { name: 'wind', meaning: 'A small motion offset that makes the structure feel less frozen.' },
      ],
      snippets: [
        {
          title: 'Each branch begets more branches',
          code: `grow(random, x2, y2, nextLength, angle + spread, depth - 1, ...)\ngrow(random, x2, y2, nextLength, angle - spread, depth - 1, ...)`,
          note: 'This is the recursive leap. A branch does not draw the whole tree; it delegates smaller versions of itself.',
        },
        {
          title: 'Variation keeps recursion organic',
          code: `const spread = randomBetween(random, 0.2, 0.55) + asymmetry * 0.08\nconst nextLength = length * randomBetween(random, 0.68, 0.82)`,
          note: 'Without small differences in angle and scale, recursion can look like a sterile diagram. Variation is what makes it feel alive.',
        },
        {
          title: 'Leaves are depth-aware accents',
          code: `const leaf = depth <= 1 || random() < leafDensity * 0.35`,
          note: 'Leaves are not painted everywhere. They appear where the structure thins out, which helps the tree read as growth rather than decoration.',
        },
      ],
      tryThis: ['Increase asymmetry until the tree starts to feel weathered rather than idealized.', 'Switch seasons without changing the seed to separate geometry from palette.', 'Reduce wind and increase depth to study the branch architecture more clearly.'],
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
      sourceFile: {
        label: 'src/demos/ShaderWithoutShadersDemo.tsx',
        href: `${repoRoot}/src/demos/ShaderWithoutShadersDemo.tsx`,
      },
      overview: 'This piece imitates some of the visual logic people associate with shaders, but it does it in ordinary canvas code. The glow comes from arithmetic patterns, not from a 3D pipeline.',
      explanation: [
        'Each visible block samples a few mathematical functions: horizontal waves, vertical ripples, and a radial flare based on distance from an apparent light source.',
        'Those values are blended into a brightness number between 0 and 1. That brightness is then mapped into a palette, so color becomes a translation of mathematics.',
        'The result feels luminous because periodic functions create smooth variation, and the palette turns those gradients into bands that the eye reads as light.',
      ],
      parameters: [
        { name: 'frequency', meaning: 'How tightly the wave system oscillates.' },
        { name: 'phase', meaning: 'Where the periodic cycle is sampled right now.' },
        { name: 'distortion', meaning: 'How much the radial flare unsettles the wave pattern.' },
        { name: 'resolution', meaning: 'How large each sampled block is.' },
      ],
      snippets: [
        {
          title: 'Sample arithmetic instead of pixels alone',
          code: `const wave = Math.sin((nx * frequency + time + seed * 0.00001) * 3.1)\nconst ripple = Math.cos((ny * frequency - time) * 2.7)\nconst flare = Math.sin((radius * 16 - time * 3) * (1 + distortion * 2))`,
          note: 'These are just functions returning numbers. What makes them visual is how consistently they are sampled across space.',
        },
        {
          title: 'Turn values into color bands',
          code: `const brightness = clamp((wave + ripple + flare + 3) / 6, 0, 1)\nconst colorIndex = Math.floor(brightness * (colors.length - 0.01))\ncontext.fillStyle = colors[colorIndex]`,
          note: 'Brightness is not yet an image. Palette mapping is what gives that number an emotional and visual identity.',
        },
        {
          title: 'Resolution changes the surface quality',
          code: `for (let y = 0; y < height; y += block) {\n  for (let x = 0; x < width; x += block) {\n    context.fillRect(x, y, block + 1, block + 1)\n  }\n}`,
          note: 'Lower resolution does not just reduce detail. It changes the visual texture from glow to mosaic.',
        },
      ],
      tryThis: ['Lower the resolution until the image becomes a woven screen instead of a gradient.', 'Pause the animation and move the pointer to compose a still frame.', 'Keep the same frequency but switch palettes to compare geometry and atmosphere.'],
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
      sourceFile: {
        label: 'src/demos/KineticTypeDemo.tsx',
        href: `${repoRoot}/src/demos/KineticTypeDemo.tsx`,
      },
      overview: 'This is not typography as a frozen layout. Each letter is treated as an actor with state: it can lean, drift, bunch up, and settle differently depending on the forces around it.',
      explanation: [
        'The phrase is split into characters, and each character gets a position derived from its index plus a dynamic offset based on pointer location and the current control values.',
        'Gravity, elasticity, and spacing are not literal physics, but they are useful metaphors. They give visitors an intuitive mental model for how the piece will respond.',
        'Because each letter is transformed independently, text stops being a single block and becomes a composition of moving bodies.',
      ],
      parameters: [
        { name: 'phrase', meaning: 'The text used as material.' },
        { name: 'gravity', meaning: 'How strongly letters fall back toward a baseline.' },
        { name: 'elasticity', meaning: 'How springy their vertical response feels.' },
        { name: 'spacing', meaning: 'How much room each letter gets to breathe.' },
        { name: 'motion intensity', meaning: 'How dramatically pointer movement affects the phrase.' },
      ],
      snippets: [
        {
          title: 'Text becomes a list of bodies',
          code: `const letters = phrase.split('')`,
          note: 'This small step is conceptually important. The piece stops treating the phrase as one immutable string and starts treating it as many independent forms.',
        },
        {
          title: 'Per-letter transforms',
          code: `const offsetX = pointerActive ? (0.5 - distanceFromPointer) * 48 * motionIntensity : 0\nconst offsetY = Math.sin(index * 0.7 + pointer.x * 5) * 18 * elasticity - gravity * 12\nconst rotate = mix(-10, 10, pointer.y) * motionIntensity`,
          note: 'Each letter uses the same formula family, but different inputs. That shared rule plus local variation is what makes the phrase feel coherent rather than chaotic.',
        },
        {
          title: 'Spacing is part of the composition',
          code: "style={{ paddingInline: `${spacing * 0.12}em` }}",
          note: 'Spacing is not merely typographic hygiene here. It changes how the moving bodies collide visually and how the phrase breathes.',
        },
      ],
      tryThis: ['Type a short phrase with repeating letters and move the pointer slowly across it.', 'Drop motion intensity to zero and bring it back to feel the phrase wake up.', 'Compare high gravity to high elasticity; one makes the phrase heavy, the other buoyant.'],
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
      sourceFile: {
        label: 'src/demos/PathfindingPersonalityDemo.tsx',
        href: `${repoRoot}/src/demos/PathfindingPersonalityDemo.tsx`,
      },
      overview: 'Pathfinding is usually presented as a sober engineering task: find a route from A to B. This piece keeps the task intact but makes the search behavior itself visible and characterful.',
      explanation: [
        'The maze is a grid of walls and open cells. Start and end points define the problem. The interesting part is how the search frontier expands through that space.',
        'Breadth-first search expands in waves, depth-first search commits to corridors and backtracks later, Dijkstra measures path cost methodically, and A* adds a heuristic that pulls the search toward the goal.',
        'Watching the visited set grow is the key artistic move here. It lets the algorithm reveal its temperament, not just its answer.',
      ],
      parameters: [
        { name: 'algorithm', meaning: 'Chooses the search style.' },
        { name: 'maze density', meaning: 'Sets how much resistance the search must navigate.' },
        { name: 'heuristic strength', meaning: 'Controls how aggressively A* trusts its guess about the goal direction.' },
        { name: 'speed', meaning: 'Changes whether the search reads as a flash or a thought process.' },
      ],
      snippets: [
        {
          title: 'Neighbors define local motion',
          code: `return [\n  { x: point.x + 1, y: point.y },\n  { x: point.x - 1, y: point.y },\n  { x: point.x, y: point.y + 1 },\n  { x: point.x, y: point.y - 1 },\n]`,
          note: 'Every algorithm here uses the same local geography. The personality differences come from search policy, not from cheating with different worlds.',
        },
        {
          title: 'DFS commits to a corridor',
          code: `const current = stack.pop()\nvisited.add(key(current))\nfor (const next of neighbors(current).reverse()) {\n  if (!wall(next) && !visited.has(key(next))) stack.push(next)\n}`,
          note: 'Depth-first search dives quickly. It feels decisive, but it may wander far down an unhelpful path before returning.',
        },
        {
          title: 'Dijkstra and A* score the frontier',
          code: `const cost = current.cost + 1\nconst priority = algorithm === 'astar'\n  ? cost + heuristic(next, end) * heuristicStrength\n  : cost\nfrontier.push({ point: next, cost, priority })`,
          note: 'Dijkstra trusts accumulated cost alone. A* adds a guess about future distance, which makes it feel more goal-aware and sometimes more impatient.',
        },
      ],
      tryThis: ['Set heuristic strength to zero and compare A* to Dijkstra.', 'Drag the end point into a corner and watch DFS wander before it commits.', 'Increase maze density and lower speed so the frontier growth becomes legible.'],
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
      sourceFile: {
        label: 'src/demos/SourceRemixDemo.tsx',
        href: `${repoRoot}/src/demos/SourceRemixDemo.tsx`,
      },
      overview: 'The artwork is not only the flower-like image. It is also the tiny readable program that generates it. Changing a few constants is enough to move the work from one personality to another.',
      explanation: [
        'The editable text area is intentionally constrained. Visitors are not asked to write arbitrary JavaScript. They are asked to modify a small, safe vocabulary of numeric constants.',
        'The parser checks whether each line matches one of the allowed constant assignments. If it does, the drawing updates. If it does not, the piece responds gently instead of crashing or pretending the input was valid.',
        'This matters because source code here is not backstage machinery. It is part of the encounter. The visitor is allowed to touch the spell, not only admire the result.',
      ],
      parameters: [
        { name: 'orbit', meaning: 'How quickly petal control points cycle around the center.' },
        { name: 'petals', meaning: 'How many main strokes are drawn.' },
        { name: 'jitter', meaning: 'How far the control points slide from perfect symmetry.' },
        { name: 'thickness', meaning: 'How delicate or insistent each stroke appears.' },
      ],
      snippets: [
        {
          title: 'Parse only a safe mini-language',
          code: `const match = line.match(\n  /^(orbit|petals|jitter|thickness)\\s*=\\s*(-?\\d+(?:\\.\\d+)?)$/\n)\nif (!match) return { values: null, error: 'Could not read line' }`,
          note: 'The input is constrained on purpose. This keeps the piece approachable while still making the source feel real and consequential.',
        },
        {
          title: 'Apply only valid edits',
          code: `const next = parseSource(source)\nif (!next.values) {\n  setError(next.error)\n  return\n}\nsetApplied(source)`,
          note: 'A good live-edit experience needs graceful failure. Invalid text becomes feedback, not a broken artwork.',
        },
        {
          title: 'Draw petals from a few constants',
          code: `const angle = (Math.PI * 2 * index) / petals\nconst radius = 58 + Math.sin(angle * orbit) * 22\nconst x = 180 + Math.cos(angle) * radius\nconst y = 160 + Math.sin(angle) * radius`,
          note: 'Very little code is needed to generate a visibly rich form. That is one of the main arguments of the whole site.',
        },
      ],
      tryThis: ['Change one number at a time and notice how little source is needed to redirect the whole image.', 'Try a prime number for petals, then raise orbit.', 'Enter an invalid line on purpose and watch how the piece protects the editing experience.'],
    },
  },
  {
    id: 'diffusion',
    title: demoLabels.diffusion,
    shortDescription: 'Two chemicals push against each other on a tiny grid until coral, fingerprints, and zebra-stripes emerge from arithmetic alone.',
    whyArt: 'A picture can grow itself if the conditions are honest.',
    tags: ['simulation', 'chemistry', 'emergence'],
    component: ReactionDiffusionDemo,
    behindTheScenes: {
      sourceFile: {
        label: 'src/demos/ReactionDiffusionDemo.tsx',
        href: `${repoRoot}/src/demos/ReactionDiffusionDemo.tsx`,
      },
      overview: 'This piece simulates two imaginary substances diffusing across a small grid. Substance B feeds on substance A and is removed at a steady rate. Those two opposing tendencies, repeated thousands of times per second, are enough to produce coral, mitotic blobs, fingerprint ridges, and zebra stripes.',
      explanation: [
        'The model is called Gray–Scott. It is one of the simplest reaction-diffusion systems that still produces a startling variety of life-like textures. The whole world fits into four numbers: feed, kill, and two diffusion rates.',
        'Each cell looks at its neighbors using a small Laplacian stencil, mixes some neighbor concentration into its own, then applies the chemistry: A and 2B turn into 3B, plus a constant trickle of A from outside and a constant loss of B.',
        'Painting into the canvas seeds extra B into the system. The pattern is not drawn — it grows from those introductions. That is why the marks you make often become channels, mouths, or pores rather than persistent strokes.',
      ],
      parameters: [
        { name: 'preset', meaning: 'Switches between named regimes (coral, fingerprint, spots, mitosis, flow) which choose different feed and kill values.' },
        { name: 'feed rate', meaning: 'How fast new substance A enters every cell. Higher values fill the world; lower values starve the reaction.' },
        { name: 'kill rate', meaning: 'How fast substance B is removed. Tiny changes flip the world between thick blobs and delicate filaments.' },
        { name: 'brush radius', meaning: 'How big a smear of B your pointer injects.' },
        { name: 'steps per frame', meaning: 'How many simulation ticks happen between paints. More steps = denser texture for the same wall-clock time.' },
        { name: 'palette', meaning: 'Maps the concentration of B to a color ramp; only changes the rendering, not the chemistry.' },
      ],
      snippets: [
        {
          title: 'The reaction in one line',
          code: `aNext[i] = a[i] + dA * laplaceA - reaction + feed * (1 - a[i])\nbNext[i] = b[i] + dB * laplaceB + reaction - (kill + feed) * b[i]`,
          note: 'These two lines are the whole physics. Everything else — coral, fingerprints, dots — is what they do when you iterate them across the grid.',
        },
        {
          title: 'A nine-point Laplacian',
          code: `const laplaceB =\n  b[i - 1] * 0.2 + b[i + 1] * 0.2 + b[above] * 0.2 + b[below] * 0.2 +\n  b[above - 1] * 0.05 + b[above + 1] * 0.05 +\n  b[below - 1] * 0.05 + b[below + 1] * 0.05 -\n  b[i]`,
          note: 'A Laplacian asks "how different am I from my neighbors?" Diffusion is just the cell trying to be more like its surroundings.',
        },
        {
          title: 'Painting injects a reactant',
          code: `for (let yy = -radius; yy <= radius; yy += 1) {\n  for (let xx = -radius; xx <= radius; xx += 1) {\n    if (xx * xx + yy * yy > radius * radius) continue\n    field.b[(py + yy) * width + (px + xx)] = 0.95\n  }\n}`,
          note: 'Painting does not draw the picture. It seeds the reaction. The texture that appears is the system\'s answer.',
        },
      ],
      tryThis: [
        'Pause the reaction and slowly drag a long line — then resume and watch the line become a tributary.',
        'Switch from coral to mitosis with the same seed; the world will rearrange itself within seconds.',
        'Drop kill rate while feed stays the same and notice the texture thickening into puddles.',
      ],
    },
  },
  {
    id: 'cosmos',
    title: demoLabels.cosmos,
    shortDescription: 'A 3D phyllotaxis field, projected to the canvas with raw matrices. Drag to orbit. Slide the angle to turn a sunflower into a wheel.',
    whyArt: 'A single irrational number is enough to build a body.',
    tags: ['3d', 'phyllotaxis', 'projection'],
    component: PhyllotaxisDemo,
    behindTheScenes: {
      sourceFile: {
        label: 'src/demos/PhyllotaxisDemo.tsx',
        href: `${repoRoot}/src/demos/PhyllotaxisDemo.tsx`,
      },
      overview: 'Phyllotaxis is the rule sunflowers, pinecones, and cactus spines use to pack seeds without overlap. Each new point is rotated by a fixed angle around the center. When that angle is the golden angle (~137.5°), the packing becomes optimal.',
      explanation: [
        'This piece extends the idea into 3D. The same generative rule is wrapped onto a sphere, a torus, a flat disk, and a pollen-like spheroid. The rotation per step is the only thing changing — the shape comes from how that rotation is interpreted.',
        'There is no 3D library here. The points are rotated by two angles using cosine and sine, then projected to 2D with a simple perspective divide. Depth determines size and alpha, so closer points feel bigger and brighter.',
        'Dragging the canvas changes the target rotation; the renderer eases toward it. When you let go, an idle orbit keeps the structure breathing.',
      ],
      parameters: [
        { name: 'mode', meaning: 'Selects which surface the phyllotaxis is wrapped onto.' },
        { name: 'generative angle', meaning: 'The rotation applied between consecutive points. Sliding it half a degree can split a tight spiral into rings.' },
        { name: 'points', meaning: 'How many points are placed. Larger counts read as cloth; smaller counts read as a constellation.' },
        { name: 'twist', meaning: 'A secondary winding that controls how the surface flexes (e.g. torus minor angle, spiral height, pollen sway).' },
        { name: 'point size', meaning: 'How big each projected dot is at the front of the camera.' },
        { name: 'trail fade', meaning: 'How quickly previous frames disappear. Low fade leaves silky motion trails; high fade keeps the geometry crisp.' },
      ],
      snippets: [
        {
          title: 'Phyllotaxis on a sphere',
          code: `for (let i = 0; i < count; i += 1) {\n  const phi = Math.acos(1 - 2 * (i + 0.5) / count)\n  const theta = i * goldenAngleRadians\n  point[i] = {\n    x: Math.sin(phi) * Math.cos(theta),\n    y: Math.sin(phi) * Math.sin(theta),\n    z: Math.cos(phi),\n  }\n}`,
          note: 'This is the Vogel-style placement on a sphere. The latitude phi gives uniform area; the longitude theta uses the golden angle to avoid clustering.',
        },
        {
          title: 'A tiny perspective projection',
          code: `const y1 = p.y * cosX - p.z * sinX\nconst z1 = p.y * sinX + p.z * cosX\nconst x2 = p.x * cosY + z1 * sinY\nconst z2 = -p.x * sinY + z1 * cosY\nconst persp = fov / (z2 + fov)`,
          note: 'Two axis rotations and a divide. That is the whole 3D pipeline this piece uses — no WebGL.',
        },
        {
          title: 'Depth sorts the dots',
          code: `projected.sort((a, b) => b.depth - a.depth)\nfor (const point of projected) {\n  context.globalAlpha = 1.4 / point.depth\n  context.beginPath()\n  context.arc(point.sx, point.sy, point.r, 0, Math.PI * 2)\n  context.fill()\n}`,
          note: 'Painter\'s algorithm. The farthest points are drawn first so the closer ones can sit on top of them — depth without a depth buffer.',
        },
      ],
      tryThis: [
        'Set the angle to 137.50 and walk it down by 0.05 — the geometry rearranges visibly with each tick.',
        'Drop points to 200 and trail to 0.06 to see a constellation drawing its own gestures.',
        'Switch to torus and raise twist; the donut starts to look braided.',
      ],
    },
  },
  {
    id: 'lens',
    title: demoLabels.lens,
    shortDescription: 'Your webcam, reinterpreted as ASCII characters, halftone dots, contour bands, or a kaleidoscope of mirrored slices.',
    whyArt: 'A camera is also a sentence about resolution.',
    tags: ['camera', 'halftone', 'kaleidoscope'],
    component: CameraLensDemo,
    behindTheScenes: {
      sourceFile: {
        label: 'src/demos/CameraLensDemo.tsx',
        href: `${repoRoot}/src/demos/CameraLensDemo.tsx`,
      },
      overview: 'A live camera feed is just a stream of frames. Each frame is a grid of red, green, and blue numbers. This piece downsamples those numbers, converts them to a single brightness value per tile, and chooses a way to draw that brightness — a character, a dot, a band, or a kaleidoscope wedge.',
      explanation: [
        'Camera permission is requested explicitly and the stream is never sent over the network. All processing happens in the same browser tab and the stream is released when you stop the camera.',
        'Each frame is mirrored horizontally so the experience feels like a mirror rather than a security camera. The mirroring happens on a hidden canvas before sampling, so every mode benefits from it.',
        'The four lenses are different choices about what counts as a pixel. ASCII picks a character from a luminance ramp. Halftone draws variable-radius circles. Contour quantizes brightness into a small number of bands. Kaleidoscope clips the canvas into wedges and stamps the same sample into each one.',
      ],
      parameters: [
        { name: 'lens', meaning: 'Which interpreter renders the frame.' },
        { name: 'tile size', meaning: 'How big each sample is. Smaller tiles read as detailed, larger tiles read as graphic.' },
        { name: 'contrast', meaning: 'A gamma-style curve applied to luminance before palette lookup.' },
        { name: 'mirror slices', meaning: 'Only used by the kaleidoscope lens — how many wedges share the same sample.' },
        { name: 'palette', meaning: 'How brightness becomes color. Mono and paper are friendly to print; lagoon and magma push toward photographic.' },
      ],
      snippets: [
        {
          title: 'Permission is requested explicitly',
          code: `const stream = await navigator.mediaDevices.getUserMedia({\n  video: { width: { ideal: 640 }, height: { ideal: 360 }, facingMode: 'user' },\n  audio: false,\n})`,
          note: 'The browser shows its own prompt. If you decline, the piece falls back to its idle card and tells you why nothing is rendering.',
        },
        {
          title: 'Frames are sampled on a tiny canvas',
          code: `sampleCtx.save()\nsampleCtx.translate(targetWidth, 0)\nsampleCtx.scale(-1, 1)\nsampleCtx.drawImage(video, 0, 0, targetWidth, targetHeight)\nsampleCtx.restore()\nconst frame = sampleCtx.getImageData(0, 0, targetWidth, targetHeight)`,
          note: 'The downsample is the whole point. Throwing away pixels is what makes the interpretation feel like authorship instead of a webcam preview.',
        },
        {
          title: 'A character can be a pixel',
          code: `const luminance = Math.pow((0.299 * r + 0.587 * g + 0.114 * b) / 255, contrastPow)\nconst charIndex = Math.floor(luminance * (ASCII_RAMP.length - 0.001))\nctx.fillText(ASCII_RAMP[charIndex], x, y)`,
          note: 'A character has a measurable ink density. That single fact lets text become an image.',
        },
      ],
      tryThis: [
        'Switch to ASCII at the largest tile size and read your face as a paragraph.',
        'Raise the mirror slices on the kaleidoscope until your gesture becomes a snowflake.',
        'Try the paper palette in a brightly lit room for a screen-printed look.',
      ],
      distinctions: [
        'The webcam stream is processed entirely in this browser tab.',
        'Nothing is uploaded to a server, sent to an AI service, or persisted between sessions.',
        'Stopping the camera releases the device so the indicator light turns off immediately.',
      ],
    },
  },
  {
    id: 'spectrum',
    title: demoLabels.spectrum,
    shortDescription: 'A breathing chord of detuned oscillators plays through an opening filter. Its FFT becomes the picture.',
    whyArt: 'Sound has a shape; the spectrum is one of its honest portraits.',
    tags: ['audio', 'spectrum', 'drone'],
    component: SpectrumDemo,
    behindTheScenes: {
      sourceFile: {
        label: 'src/demos/SpectrumDemo.tsx',
        href: `${repoRoot}/src/demos/SpectrumDemo.tsx`,
      },
      overview: 'A small ensemble of oscillators plays the notes of a chord. Each voice has a slow LFO modulating its volume and a second oscillator pulling its pitch around slightly, so the drone never sits still. A shared low-pass filter sets the brightness. An AnalyserNode reads the master mix and turns it into the picture.',
      explanation: [
        'There is no audio file. Every sample you hear is generated in real time by the Web Audio API. The chord is just a list of MIDI numbers converted to frequencies.',
        'Brightness moves the cutoff of a low-pass filter from a muffled 200 Hz up to about 6 kHz. Drift controls how aggressively the detune and amplitude LFOs wander.',
        'The visual is the audio. A 2048-point FFT (Analyser) yields 1024 magnitude bins per frame. The ribbon mode stacks recent frames into a waterfall; starburst draws bins as radial lines; rings maps bin index to circle radius.',
      ],
      parameters: [
        { name: 'chord', meaning: 'Which set of MIDI pitches the voices are tuned to.' },
        { name: 'brightness', meaning: 'Cutoff of the master low-pass filter — sweeps the drone from foggy to glassy.' },
        { name: 'drift', meaning: 'How wide and how fast each voice slowly detunes itself.' },
        { name: 'density', meaning: 'Influences how aggressively the starburst extends rays for each FFT bin.' },
        { name: 'volume', meaning: 'Master gain. Cross-faded smoothly so chord changes never click.' },
        { name: 'visualization', meaning: 'Selects between waterfall (ribbon), radial rays (starburst), and concentric rings.' },
      ],
      snippets: [
        {
          title: 'A voice is just a small graph',
          code: `osc.connect(filter)\nfilter.connect(gain)\ngain.connect(pan)\npan.connect(master)\nosc.start()`,
          note: 'Each note is its own oscillator, with its own LFO modulating its gain. Drone music is patience plus addition.',
        },
        {
          title: 'Pulling pitches apart with a second oscillator',
          code: `const detuneGain = ctx.createGain()\ndetuneGain.gain.value = 1.5 + drift * 5\ndetune.connect(detuneGain)\ndetuneGain.connect(osc.detune)`,
          note: 'Audio-rate modulation of detune produces the swarming, slightly out-of-tune feel that makes drones feel alive instead of synthesized.',
        },
        {
          title: 'The picture is the spectrum',
          code: `const bins = new Uint8Array(analyser.frequencyBinCount)\nanalyser.getByteFrequencyData(bins)\nhistory.push(bins.slice(0, 256))\nif (history.length > 96) history.shift()`,
          note: 'There is no separate visualizer. The same numbers that describe the sound describe the painting.',
        },
      ],
      tryThis: [
        'Start on cmaj9 with brightness at 0.2 and slowly walk it to 1.0 — the chord opens like a door.',
        'Switch chord while the drone is playing; the cross-fade keeps the moment without a click.',
        'Compare ribbon and rings — both are reading the same FFT, just laid out differently.',
      ],
    },
  },
  {
    id: 'attractor',
    title: demoLabels.attractor,
    shortDescription: 'Lorenz, Aizawa, Halvorsen, Thomas, and Three-Scroll attractors integrated forward through phase space and orbited by hand.',
    whyArt: 'Determinism does not have to be predictable.',
    tags: ['3d', 'chaos', 'math'],
    component: AttractorDemo,
    behindTheScenes: {
      sourceFile: {
        label: 'src/demos/AttractorDemo.tsx',
        href: `${repoRoot}/src/demos/AttractorDemo.tsx`,
      },
      overview: 'Each attractor is a system of three coupled differential equations. There is no randomness inside the math. Two points that start a hair apart will follow trajectories that diverge dramatically — and yet both stay bound to the same beautiful shape.',
      explanation: [
        'Every frame, the piece advances each starting point by a small time step using forward Euler integration. The new position depends only on the current one, so each line is a memory of every decision the system has made.',
        'A short warmup is run on the seed points before drawing so the visible curve is already on the attractor, not still falling toward it.',
        'The 3D points are rotated by mouse drag and projected to 2D with the same tiny perspective trick the cosmos demo uses. The painter\'s algorithm and additive blending make denser regions glow.',
      ],
      parameters: [
        { name: 'attractor', meaning: 'Which set of equations to integrate. Each one has its own ecology of shapes.' },
        { name: 'streams', meaning: 'How many independent starting points are running at the same time, drawn in different palette tones.' },
        { name: 'integration speed', meaning: 'How many time steps are advanced per animation frame. More steps unfurl the curve faster.' },
        { name: 'trail fade', meaning: 'How quickly previous frames are veiled. Low fade keeps the whole history visible.' },
        { name: 'line width', meaning: 'How heavy the stroke is. Thicker lines turn the trajectory into ribbon; thinner lines into vapor.' },
        { name: 'palette', meaning: 'How each stream is colored. The math is identical regardless of the palette.' },
      ],
      snippets: [
        {
          title: 'Lorenz in three lines of math',
          code: `const dx = sigma * (p.y - p.x)\nconst dy = p.x * (rho - p.z) - p.y\nconst dz = p.x * p.y - beta * p.z\nreturn { x: p.x + dx * dt, y: p.y + dy * dt, z: p.z + dz * dt }`,
          note: 'These three equations are everything Lorenz needed to expose that weather is bounded but unpredictable. The whole butterfly emerges from iterating them.',
        },
        {
          title: 'Trails are just stored history',
          code: `for (let i = 0; i < iterations; i += 1) {\n  pt = step(attractor, pt, dt)\n  tail.push({ x: pt.x, y: pt.y, z: pt.z })\n  if (tail.length > 1400) tail.shift()\n}`,
          note: 'The line you see is not a single object. It is a sliding window of remembered positions, drawn one short segment at a time.',
        },
        {
          title: 'Two-axis rotation, no library',
          code: `const y1 = sy * cosX - sz * sinX\nconst z1 = sy * sinX + sz * cosX\nconst x2 = sx * cosY + z1 * sinY\nconst z2 = -sx * sinY + z1 * cosY\nconst persp = fov / (z2 + fov)`,
          note: 'The whole 3D pipeline. Cosine, sine, divide. No matrix library is needed to look around a chaotic system.',
        },
      ],
      tryThis: [
        'Run multiple streams on Lorenz and notice they all live on the same butterfly even though they never overlap exactly.',
        'Slow the integration speed to 60 and watch a single trajectory cross itself again and again.',
        'Switch to Thomas and crank trail fade down to 0.04 — the system writes a cursive web.',
      ],
    },
  },
  {
    id: 'pond',
    title: demoLabels.pond,
    shortDescription: 'A 2D wave equation simulated on a grid. Click to drop pebbles, drag to draw fingerprints, choose still water, breeze, rain, or storm.',
    whyArt: 'Touch is not removed from the medium. It is the medium.',
    tags: ['physics', 'simulation', 'water'],
    component: PondDemo,
    behindTheScenes: {
      sourceFile: {
        label: 'src/demos/PondDemo.tsx',
        href: `${repoRoot}/src/demos/PondDemo.tsx`,
      },
      overview: 'A pond is just a height field on a grid. Each cell stores how high the water is now and how high it was a moment ago. The wave equation says the next height of a cell is the average of its neighbors\' current heights, minus its own past height, with a tiny loss for friction.',
      explanation: [
        'There is no separate "ripple" object. The visible ripples are emergent: thousands of tiny averagings, repeated every frame, drift outward and meet other averagings coming back from the walls.',
        'Painting injects energy directly into the height field. Dragging the pointer is the same operation many times in a row, which is why a long swipe writes a channel instead of a single dot.',
        'Damping is the surface tension of the simulation. Set it too low and ripples die instantly. Set it too high and the pond never settles — small mistakes accumulate into noise.',
      ],
      parameters: [
        { name: 'palette', meaning: 'How the height (and its gradient) maps to color. Inkwell is moonlit, copper feels heated, paper looks like printed paper.' },
        { name: 'weather', meaning: 'Sets the ambient activity. Still is silent; breeze drops a rare pebble; rain and storm scatter many at once.' },
        { name: 'surface tension', meaning: 'Per-step damping factor. Closer to 1.0 means longer-lived ripples.' },
        { name: 'propagation steps', meaning: 'How many wave-equation iterations are run between renders. More steps mean faster-moving ripples.' },
        { name: 'touch intensity', meaning: 'How strongly your pointer (and the weather) imprints the surface.' },
      ],
      snippets: [
        {
          title: 'One step of the wave equation',
          code: `const value =\n  (current[i - 1] + current[i + 1] +\n   current[i - width] + current[i + width]) / 2\n  - previous[i]\nprevious[i] = value * damp`,
          note: 'This single line is the entire physics. Average the neighbors, subtract your own past, lose a touch to friction. Run it everywhere, every frame.',
        },
        {
          title: 'Touching the field is just an injection',
          code: `for (let yy = -radius; yy <= radius; yy += 1) {\n  for (let xx = -radius; xx <= radius; xx += 1) {\n    if (xx * xx + yy * yy > radius * radius) continue\n    const falloff = 1 - Math.sqrt(xx * xx + yy * yy) / radius\n    current[(y + yy) * width + (x + xx)] += amount * falloff\n  }
}`,
          note: 'Drawing into the pond is not a special operation. It is the same field your pointer is editing that the physics is editing.',
        },
        {
          title: 'Color from the gradient',
          code: `const shade = 0.5 + (value - (left + top) * 0.4) * 0.55\nconst [r, g, b] = paletteSample(palette, shade)`,
          note: 'The pond is not just shaded by height. It is shaded by the difference between a cell and its neighbors — which is what light from a moving water surface actually looks like.',
        },
      ],
      tryThis: [
        'Switch to still water, drop one pebble in the center, and watch the reflection patterns form an interference figure.',
        'Drag a slow curve across the surface and try to make the wake last longer by raising the surface tension.',
        'Compare rain and storm at the same damping — storm tips the pond toward chaos within a few seconds.',
      ],
    },
  },
  {
    id: 'prism',
    title: demoLabels.prism,
    shortDescription: 'Real GLSL fragment shaders rendered to a fullscreen quad: aurora, fluid noise, raymarched gyroid cathedral, and a Julia glassmind.',
    whyArt: 'The image is computed once per pixel, sixty times a second — by the GPU.',
    tags: ['webgl', 'glsl', 'light'],
    component: PrismDemo,
    behindTheScenes: {
      sourceFile: {
        label: 'src/demos/PrismDemo.tsx',
        href: `${repoRoot}/src/demos/PrismDemo.tsx`,
      },
      overview: 'This piece is the inverse of "light from arithmetic". Instead of pretending to be a shader from JavaScript, every visible pixel really is computed by a shader running on the GPU. Four different fragment programs are bundled, each writing color into the same fullscreen quad.',
      explanation: [
        'The vertex shader does almost nothing — it just draws two triangles that cover the entire canvas. All the visual work happens in the fragment shader, which runs once per pixel.',
        'Four uniforms feed each shader: resolution, time, pointer, and two slider-controlled scalars (intensity and complexity). The same uniform names mean each shader can ignore the controls it does not care about.',
        'Aurora layers fractal Brownian noise into a ribbon and a halo. Fluid is a stack of rotated sinusoids modulating each other. Cathedral raymarches a gyroid-clipped sphere with shading and a glow accumulator. Glassmind iterates a Julia set every frame to a different complex parameter.',
      ],
      parameters: [
        { name: 'shader', meaning: 'Which fragment program is uploaded to the GPU. Switching recompiles and rebinds uniforms.' },
        { name: 'intensity', meaning: 'A scalar each shader uses for glow, contact, or highlight strength.' },
        { name: 'complexity', meaning: 'A second scalar that increases octaves of noise, lattice frequency, or zoom depth.' },
        { name: 'time scale', meaning: 'Multiplies the time uniform. Setting it to 0 freezes the picture.' },
      ],
      snippets: [
        {
          title: 'A fragment program is a function from pixel to color',
          code: `void main() {\n  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);\n  // ... compute color from uv, u_time, u_pointer ...\n  gl_FragColor = vec4(color, 1.0);\n}`,
          note: 'There is no central scene graph. Each pixel asks "what should I be?" and answers itself.',
        },
        {
          title: 'Raymarching a gyroid',
          code: `for (int i = 0; i < 64; i++) {\n  vec3 hit = ro + rd * t;\n  float d = map(hit);\n  glow += 0.012 / (0.01 + d * d);\n  if (d < 0.001) { found = true; break; }\n  t += d * 0.8;\n}`,
          note: 'Raymarching steps along the camera ray, asking the distance field how close it is. The smaller the step, the closer the surface — and the more glow accumulates near it.',
        },
        {
          title: 'Compile, link, draw',
          code: `const program = createProgram(gl, FRAGMENTS[shader])\ngl.useProgram(program)\ngl.uniform1f(uniforms.u_time, time)\ngl.drawArrays(gl.TRIANGLES, 0, 6)`,
          note: 'The whole pipeline is six vertices and a handful of uniforms. Everything else is the GPU doing math at scale.',
        },
      ],
      tryThis: [
        'Set time scale to 0 on the cathedral shader, then move the pointer to compose a still photograph.',
        'Switch to glassmind and slide complexity up; the Julia set zooms into self-similarity until your screen is a single curl.',
        'Run aurora with intensity at 0 and slowly raise it; the halo is what lets the noise read as light.',
      ],
      distinctions: [
        'This demo actually uses WebGL — not a canvas approximation.',
        'Every shader is human-readable inside the source file; you can copy/paste them into a shader playground.',
        'Nothing is sent to a network service; the GPU does the work locally.',
      ],
    },
  },
  {
    id: 'murmuration',
    title: demoLabels.murmuration,
    shortDescription: 'Up to six hundred boids steered by separation, alignment, and cohesion. Your cursor is either predator or attractor.',
    whyArt: 'A crowd does not need a conductor to compose itself.',
    tags: ['flocking', 'emergence', 'motion'],
    component: MurmurationDemo,
    behindTheScenes: {
      sourceFile: {
        label: 'src/demos/MurmurationDemo.tsx',
        href: `${repoRoot}/src/demos/MurmurationDemo.tsx`,
      },
      overview: 'Reynolds boids: each agent looks at its nearby neighbors and applies three small forces — push away from anyone too close, steer toward the average heading, drift toward the local center of mass. The flock is what emerges from these three local rules repeated everywhere.',
      explanation: [
        'A naive boids simulation is O(n²), which gets expensive past a few hundred agents. This piece tucks each frame\'s boids into a spatial hash so each one only checks its own cell and the eight neighbors — fast enough to run hundreds without dropping below sixty frames per second.',
        'Multiple flocks share the canvas but only listen to their own kind. They will weave through each other without alignment or cohesion, but if you switch the pointer to attract, both flocks are drawn to the same focus.',
        'The pointer is implemented as a soft force, not a hard constraint. Attract gently pulls boids in; flee pushes them away. Silent removes the cursor from the math entirely.',
      ],
      parameters: [
        { name: 'palette', meaning: 'Which colors mark each flock. Pure decoration; the math is unchanged.' },
        { name: 'pointer', meaning: 'How the cursor influences the flock — attract, flee, or be silent.' },
        { name: 'boids', meaning: 'Total agents across all flocks.' },
        { name: 'flocks', meaning: 'How many independent groups exist. Each only listens to its own.' },
        { name: 'separation / alignment / cohesion', meaning: 'The three classical Reynolds weights. Pushing one up while another stays low changes the personality of the flock.' },
        { name: 'trail fade', meaning: 'Opacity of the previous frame. Low fade leaves long murmuration ribbons.' },
      ],
      snippets: [
        {
          title: 'Three forces, computed locally',
          code: `for (const other of neighbors) {\n  if (other.flock === b.flock) {\n    alignSum += other.velocity\n    cohSum += other.position\n  }\n  if (distance < separationRadius) {\n    sep -= (other.position - b.position).normalized()\n  }\n}`,
          note: 'No bird has a name. No bird knows the shape of the flock. The shape is a side effect of every bird trying to obey the same three rules.',
        },
        {
          title: 'A spatial hash keeps it tractable',
          code: `const cx = Math.floor(b.x / cellSize)\nconst cy = Math.floor(b.y / cellSize)\ngrid[cy * cols + cx].push(i)`,
          note: 'Every frame, the boids are tossed into a grid. Each cell only has to consider its own bucket plus the surrounding ones — bringing the cost from O(n²) to roughly O(n).',
        },
        {
          title: 'The cursor is a soft force',
          code: `const strength = (1 - dist / 320) * 0.42 * (pointerMode === 'flee' ? -1 : 1)\nax += (dx / dist) * strength\nay += (dy / dist) * strength`,
          note: 'There is no hard constraint and no path-following. The boids only know that a force exists nearby; whether to obey it is governed by every other force on them at the same moment.',
        },
      ],
      tryThis: [
        'Drop separation to zero and watch the flock collapse into a single dot — alignment alone is not enough to keep them apart.',
        'Run two flocks with the pointer set to attract; both will overlap and unfold like braided ribbons.',
        'Switch to flee and circle a flock from the outside; it will reshape itself the way real starlings do around a hawk.',
      ],
    },
  },
  {
    id: 'incantation',
    title: demoLabels.incantation,
    shortDescription: 'The browser actually speaks a small generated poem aloud while the words choreograph themselves in time with the reading.',
    whyArt: 'A program can read to you.',
    tags: ['voice', 'language', 'choreography'],
    component: IncantationDemo,
    behindTheScenes: {
      sourceFile: {
        label: 'src/demos/IncantationDemo.tsx',
        href: `${repoRoot}/src/demos/IncantationDemo.tsx`,
      },
      overview: 'A small grammar generates a short poem from hand-written word banks. The browser\'s built-in SpeechSynthesis API reads it aloud while word-boundary events highlight each spoken word in the room. The piece tries to give code the temperament of a recital.',
      explanation: [
        'The poem itself is generated locally, the same way the older poetry room does it: an opener, a subject and verb, an optional modifier and place, sometimes a closer — pieces drawn from authored word lists scoped to a mood.',
        'When you press recite, each line becomes a SpeechSynthesisUtterance. The voice is whichever local voice you pick. The piece subscribes to the utterance\'s onboundary event, which fires as each word is about to be spoken; that index is used to highlight and gently lift the current word.',
        'Speech synthesis varies a lot between browsers and operating systems. The piece falls back gracefully: if no voices are available, the text still appears, and if SpeechSynthesis is missing entirely the room becomes a silent reading.',
      ],
      parameters: [
        { name: 'mood', meaning: 'Switches the vocabulary bank — tide, forest, kiln, or silence.' },
        { name: 'voice', meaning: 'Which local SpeechSynthesisVoice will speak. Mac and iOS have generous voice catalogs; some Linux browsers ship none.' },
        { name: 'line count', meaning: 'How many lines the grammar should compose.' },
        { name: 'rate', meaning: 'Speaking rate. Slower rates make the piece read like a meditation.' },
        { name: 'pitch', meaning: 'Pitch multiplier; pairs naturally with rate to age or lighten the voice.' },
      ],
      snippets: [
        {
          title: 'A line is composed from word banks',
          code: `const subject = pickOne(random, bank.subjects)\nconst verb = pickOne(random, bank.verbs)\nconst modifier = random() < 0.6 ? pickOne(random, bank.modifiers) : ''\nconst place = random() < 0.7 ? \`at \${pickOne(random, bank.places)}\` : ''`,
          note: 'There is no language model here. The "writer" is the author of these small vocabularies and the grammar that arranges them.',
        },
        {
          title: 'Synthesis reads it aloud',
          code: `const utter = new SpeechSynthesisUtterance(line.text)\nutter.rate = rate\nutter.pitch = pitch\nutter.voice = chosenVoice\nwindow.speechSynthesis.speak(utter)`,
          note: 'The Web Speech API is built into modern browsers and runs entirely on the user\'s device.',
        },
        {
          title: 'Word boundaries drive the choreography',
          code: `utter.onboundary = (event) => {\n  if (event.name !== 'word') return\n  let accumulated = 0\n  for (let wordIndex = 0; wordIndex < line.words.length; wordIndex += 1) {\n    const length = line.words[wordIndex].length + 1\n    if (event.charIndex < accumulated + length) {\n      setActiveWord(wordIndex)\n      return\n    }\n    accumulated += length\n  }\n}`,
          note: 'The visual cue is not guessed; it is reported by the speech engine as it speaks. The room can move with the voice because the voice is telling it where it is.',
        },
      ],
      tryThis: [
        'Switch the mood from tide to kiln while paused; the words update, and the next recital pulls from a different vocabulary.',
        'Drop the rate to 0.7 and the pitch to 0.85 to push the voice toward incantation.',
        'Open the demo on two different browsers and compare which voices each one ships with — the same code becomes a different reading.',
      ],
      distinctions: [
        'The poem and the speech are both produced locally — no network call.',
        'No language model is involved; the words come from hand-written banks.',
        'If the browser exposes no voices, the piece falls back to silent reading without crashing.',
      ],
    },
  },
]
