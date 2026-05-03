import { useEffect, useMemo, useState } from 'react'
import { DemoControls } from '../components/DemoControls'
import { Parameter } from '../components/Parameter'
import type { DemoComponentProps } from '../lib/demoTypes'
import { createSeededRandom } from '../lib/random'

type Algorithm = 'bubble' | 'insertion' | 'quicksort' | 'merge'
type Step = { values: number[]; active: number[]; swap: boolean }

function createValues() {
  const generator = createSeededRandom(Date.now())
  return Array.from({ length: 22 }, () => Math.floor(generator() * 96) + 8)
}

function bubbleSort(values: number[]) {
  const working = [...values]
  const steps: Step[] = []
  for (let i = 0; i < working.length; i += 1) {
    for (let j = 0; j < working.length - i - 1; j += 1) {
      steps.push({ values: [...working], active: [j, j + 1], swap: false })
      if (working[j] > working[j + 1]) {
        ;[working[j], working[j + 1]] = [working[j + 1], working[j]]
        steps.push({ values: [...working], active: [j, j + 1], swap: true })
      }
    }
  }
  return steps
}

function insertionSort(values: number[]) {
  const working = [...values]
  const steps: Step[] = []
  for (let i = 1; i < working.length; i += 1) {
    let j = i
    while (j > 0) {
      steps.push({ values: [...working], active: [j - 1, j], swap: false })
      if (working[j - 1] <= working[j]) {
        break
      }
      ;[working[j - 1], working[j]] = [working[j], working[j - 1]]
      steps.push({ values: [...working], active: [j - 1, j], swap: true })
      j -= 1
    }
  }
  return steps
}

function quickSort(values: number[]) {
  const working = [...values]
  const steps: Step[] = []
  const visit = (start: number, end: number) => {
    if (start >= end) return
    const pivot = working[end]
    let split = start
    for (let index = start; index < end; index += 1) {
      steps.push({ values: [...working], active: [index, end], swap: false })
      if (working[index] <= pivot) {
        ;[working[index], working[split]] = [working[split], working[index]]
        steps.push({ values: [...working], active: [index, split], swap: true })
        split += 1
      }
    }
    ;[working[split], working[end]] = [working[end], working[split]]
    steps.push({ values: [...working], active: [split, end], swap: true })
    visit(start, split - 1)
    visit(split + 1, end)
  }
  visit(0, working.length - 1)
  return steps
}

function mergeSort(values: number[]) {
  const working = [...values]
  const steps: Step[] = []
  const merge = (start: number, mid: number, end: number) => {
    const merged: number[] = []
    let left = start
    let right = mid
    while (left < mid && right < end) {
      steps.push({ values: [...working], active: [left, right], swap: false })
      if (working[left] < working[right]) {
        merged.push(working[left])
        left += 1
      } else {
        merged.push(working[right])
        right += 1
      }
    }
    while (left < mid) merged.push(working[left++])
    while (right < end) merged.push(working[right++])
    merged.forEach((value, offset) => {
      working[start + offset] = value
      steps.push({ values: [...working], active: [start + offset], swap: true })
    })
  }
  const visit = (start: number, end: number) => {
    if (end - start <= 1) return
    const mid = Math.floor((start + end) / 2)
    visit(start, mid)
    visit(mid, end)
    merge(start, mid, end)
  }
  visit(0, working.length)
  return steps
}

function makeSteps(algorithm: Algorithm, values: number[]) {
  if (algorithm === 'bubble') return bubbleSort(values)
  if (algorithm === 'insertion') return insertionSort(values)
  if (algorithm === 'quicksort') return quickSort(values)
  return mergeSort(values)
}

export function SortingChoreographyDemo({ reducedMotion }: DemoComponentProps) {
  const [algorithm, setAlgorithm] = useState<Algorithm>('bubble')
  const [tempo, setTempo] = useState(280)
  const [colorMode, setColorMode] = useState<'value' | 'movement'>('value')
  const [playing, setPlaying] = useState(true)
  const [baseValues, setBaseValues] = useState<number[]>(() => createValues())
  const [stepIndex, setStepIndex] = useState(0)

  const steps = useMemo(() => makeSteps(algorithm, baseValues), [algorithm, baseValues])
  const current = steps[Math.min(stepIndex, Math.max(steps.length - 1, 0))] ?? {
    values: baseValues,
    active: [],
    swap: false,
  }

  useEffect(() => {
    if (!playing || reducedMotion) {
      return
    }
    const timer = window.setInterval(() => {
      setStepIndex((index) => {
        if (index >= steps.length - 1) {
          return index
        }
        return index + 1
      })
    }, tempo)
    return () => window.clearInterval(timer)
  }, [playing, reducedMotion, steps.length, tempo])

  return (
    <DemoControls
      actions={
        <>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setPlaying((value) => !value)} className="rounded-full border border-[var(--line)] px-3 py-2 text-sm text-[var(--text)]">
              {playing ? 'pause' : 'play'}
            </button>
            <button type="button" onClick={() => setStepIndex((index) => Math.min(index + 1, steps.length - 1))} className="rounded-full border border-[var(--line)] px-3 py-2 text-sm text-[var(--text)]">
              step
            </button>
            <button type="button" onClick={() => { setBaseValues(createValues()); setStepIndex(0) }} className="rounded-full border border-[var(--line)] px-3 py-2 text-sm text-[var(--text)]">
              shuffle
            </button>
            <button type="button" onClick={() => { setBaseValues(createValues()); setStepIndex(0); setPlaying(true) }} className="rounded-full border border-[var(--line)] px-3 py-2 text-sm text-[var(--text)]">
              reset
            </button>
          </div>
          <Parameter label="algorithm">
            <select value={algorithm} onChange={(event) => { setAlgorithm(event.target.value as Algorithm); setStepIndex(0) }} className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2">
              <option value="bubble" className="bg-[#120f15]">bubble</option>
              <option value="insertion" className="bg-[#120f15]">insertion</option>
              <option value="quicksort" className="bg-[#120f15]">quicksort</option>
              <option value="merge" className="bg-[#120f15]">merge sort</option>
            </select>
          </Parameter>
          <Parameter label="tempo" value={`${tempo}ms`}>
            <input type="range" min="80" max="500" step="20" value={tempo} onChange={(event) => setTempo(Number(event.target.value))} />
          </Parameter>
          <Parameter label="color mode">
            <button type="button" onClick={() => setColorMode((mode) => (mode === 'value' ? 'movement' : 'value'))} className="rounded-xl border border-[var(--line)] px-3 py-2 text-left">
              {colorMode === 'value' ? 'color by value' : 'color by movement'}
            </button>
          </Parameter>
          <p className="text-sm text-[var(--soft)]">Canvas description: bars rise and swap in steps. Different sorting algorithms move with different rhythms.</p>
        </>
      }
    >
      <div className="flex h-[340px] items-end gap-2 rounded-[1.25rem] bg-black/25 p-4" role="img" aria-label="Sorting bars animate through comparisons and swaps.">
        {current.values.map((value, index) => {
          const active = current.active.includes(index)
          const color = colorMode === 'value'
            ? `hsl(${Math.round((value / 104) * 290 + 20)} 86% 64%)`
            : active
              ? '#ff7a59'
              : current.swap
                ? '#6be3ff'
                : '#f6eedf'
          return (
            <div key={`${index}-${value}`} className="flex-1 rounded-t-full transition-all duration-200" style={{ height: `${value * 2.5}px`, background: color, opacity: active ? 1 : 0.82 }} />
          )
        })}
      </div>
    </DemoControls>
  )
}
