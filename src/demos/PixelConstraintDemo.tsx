import { useMemo, useState } from 'react'
import { DemoControls } from '../components/DemoControls'
import { Parameter } from '../components/Parameter'
import { createSeededRandom } from '../lib/random'

const width = 32
const height = 18
const palettes = {
  dusk: ['#201a23', '#ff7a59', '#ffd166', '#f6eedf'],
  tide: ['#102a43', '#1f7a8c', '#bfdbf7', '#f7f9f9'],
  grove: ['#1b3022', '#4f772d', '#90a955', '#ecf39e'],
}

type PaletteName = keyof typeof palettes

function makeGrid(fill = 0) {
  return Array.from({ length: height }, () => Array.from({ length: width }, () => fill))
}

function exportAscii(grid: number[][]) {
  const glyphs = [' ', '.', '*', '#']
  return grid.map((row) => row.map((cell) => glyphs[cell] ?? '?').join('')).join('\n')
}

export function PixelConstraintDemo() {
  const [copyMessage, setCopyMessage] = useState('')
  const [grid, setGrid] = useState<number[][]>(() => makeGrid())
  const [palette, setPalette] = useState<PaletteName>('dusk')
  const [brushSize, setBrushSize] = useState(1)
  const [mirror, setMirror] = useState(true)
  const [selectedColor, setSelectedColor] = useState(1)
  const [showData, setShowData] = useState(false)

  const colors = palettes[palette]
  const ascii = useMemo(() => exportAscii(grid), [grid])

  const paint = (x: number, y: number, color = selectedColor) => {
    setGrid((current) => {
      const next = current.map((row) => [...row])
      for (let yy = y - brushSize + 1; yy <= y + brushSize - 1; yy += 1) {
        for (let xx = x - brushSize + 1; xx <= x + brushSize - 1; xx += 1) {
          if (yy < 0 || yy >= height || xx < 0 || xx >= width) {
            continue
          }
          next[yy][xx] = color
          if (mirror) {
            next[yy][width - 1 - xx] = color
          }
        }
      }
      return next
    })
  }

  const mutate = () => {
    const generator = createSeededRandom(Date.now())
    setGrid((current) =>
      current.map((row) =>
        row.map((cell) => (generator() > 0.92 ? Math.floor(generator() * colors.length) : cell)),
      ),
    )
  }

  return (
    <DemoControls
      actions={
        <>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setGrid(makeGrid())} className="control-button">
              reset
            </button>
            <button type="button" onClick={mutate} className="control-button">
              random mutation
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(ascii)
                  setCopyMessage('ascii copied to clipboard')
                } catch {
                  setCopyMessage('clipboard unavailable: copy from the text panel below')
                }
              }}
              className="control-button"
            >
              export as ascii
            </button>
          </div>
          <Parameter label="palette">
            <select value={palette} onChange={(event) => setPalette(event.target.value as PaletteName)} className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]">
              {Object.keys(palettes).map((name) => (
                <option key={name} value={name} className="bg-[#120f15]">
                  {name}
                </option>
              ))}
            </select>
          </Parameter>
          <Parameter label="brush size" value={String(brushSize)}>
            <input type="range" min="1" max="3" step="1" value={brushSize} onChange={(event) => setBrushSize(Number(event.target.value))} />
          </Parameter>
          <Parameter label="mirror mode">
            <button type="button" onClick={() => setMirror((value) => !value)} className="control-button w-full justify-start">
              {mirror ? 'horizontal symmetry on' : 'horizontal symmetry off'}
            </button>
          </Parameter>
          <Parameter label="show data representation">
            <button type="button" onClick={() => setShowData((value) => !value)} className="control-button w-full justify-start">
              {showData ? 'hide raw grid' : 'show raw grid'}
            </button>
          </Parameter>
          <p className="text-sm text-[var(--soft)]">Canvas description: a 32 by 18 grid that turns small numbers into a picture. Each cell is keyboard focusable.</p>
          {copyMessage ? <p className="text-sm text-[var(--soft)]">{copyMessage}</p> : null}
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {colors.map((color, index) => (
            <button
              key={color}
              type="button"
              aria-pressed={selectedColor === index}
              onClick={() => setSelectedColor(index)}
              className="h-10 w-10 rounded-full border border-white/20"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="grid gap-[2px] rounded-xl bg-black/30 p-2" style={{ gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))` }}>
          {grid.flatMap((row, y) =>
            row.map((cell, x) => (
              <button
                key={`${x}-${y}`}
                type="button"
                aria-label={`cell ${x + 1}, ${y + 1}`}
                onPointerDown={() => paint(x, y)}
                onPointerEnter={(event) => {
                  if (event.buttons === 1) {
                    paint(x, y)
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === ' ' || event.key === 'Enter') {
                    event.preventDefault()
                    paint(x, y)
                  }
                  if (event.key === 'Backspace') {
                    event.preventDefault()
                    paint(x, y, 0)
                  }
                }}
                className="aspect-square rounded-[2px] border border-black/10 transition focus-visible:z-10"
                style={{ backgroundColor: colors[cell] }}
              />
            )),
          )}
        </div>
        <pre className="overflow-x-auto rounded-2xl bg-black/20 p-3 font-[var(--mono-font)] text-xs text-[var(--muted)]">{ascii}</pre>
        {showData ? (
          <pre className="overflow-x-auto rounded-2xl bg-black/20 p-3 font-[var(--mono-font)] text-xs text-[var(--muted)]">
            {JSON.stringify(grid)}
          </pre>
        ) : null}
      </div>
    </DemoControls>
  )
}
