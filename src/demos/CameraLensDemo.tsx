import { useEffect, useMemo, useRef, useState } from 'react'
import { ImmersiveDemo } from '../components/ImmersiveDemo'
import { Parameter } from '../components/Parameter'
import { useResizeObserver } from '../hooks/useResizeObserver'
import type { DemoComponentProps } from '../lib/demoTypes'

type LensMode = 'ascii' | 'halftone' | 'kaleidoscope' | 'contour'
type LensPalette = 'mono' | 'magma' | 'lagoon' | 'paper'

const modes: LensMode[] = ['ascii', 'halftone', 'kaleidoscope', 'contour']
const palettes: LensPalette[] = ['mono', 'magma', 'lagoon', 'paper']

const ASCII_RAMP = ' .\'`,:;-+*o#@'

const palettesRgb: Record<LensPalette, [number, number, number][]> = {
  mono: [
    [14, 12, 18],
    [60, 56, 64],
    [128, 122, 108],
    [200, 198, 180],
    [246, 240, 224],
  ],
  magma: [
    [10, 6, 18],
    [60, 14, 70],
    [180, 50, 90],
    [248, 144, 73],
    [254, 232, 196],
  ],
  lagoon: [
    [6, 12, 22],
    [12, 56, 86],
    [60, 150, 170],
    [121, 215, 239],
    [240, 252, 235],
  ],
  paper: [
    [239, 229, 211],
    [200, 175, 145],
    [180, 71, 40],
    [69, 35, 22],
    [25, 19, 14],
  ],
}

function paletteSample(palette: [number, number, number][], t: number) {
  const x = Math.max(0, Math.min(1, t)) * (palette.length - 1)
  const i = Math.floor(x)
  const f = x - i
  const a = palette[i]
  const b = palette[Math.min(palette.length - 1, i + 1)]
  return [
    a[0] + (b[0] - a[0]) * f,
    a[1] + (b[1] - a[1]) * f,
    a[2] + (b[2] - a[2]) * f,
  ] as const
}

type Status =
  | { kind: 'idle' }
  | { kind: 'starting' }
  | { kind: 'running' }
  | { kind: 'error'; message: string }

export function CameraLensDemo({ reducedMotion }: DemoComponentProps) {
  const [mode, setMode] = useState<LensMode>('halftone')
  const [palette, setPalette] = useState<LensPalette>('lagoon')
  const [tile, setTile] = useState(10)
  const [contrast, setContrast] = useState(0.6)
  const [mirrors, setMirrors] = useState(6)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const size = useResizeObserver(container)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const sampleRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number>(0)

  const modeRef = useRef(mode)
  const paletteRef = useRef(palette)
  const tileRef = useRef(tile)
  const contrastRef = useRef(contrast)
  const mirrorsRef = useRef(mirrors)
  const reducedMotionRef = useRef(reducedMotion)

  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => { paletteRef.current = palette }, [palette])
  useEffect(() => { tileRef.current = tile }, [tile])
  useEffect(() => { contrastRef.current = contrast }, [contrast])
  useEffect(() => { mirrorsRef.current = mirrors }, [mirrors])
  useEffect(() => { reducedMotionRef.current = reducedMotion }, [reducedMotion])

  useEffect(() => {
    if (!sampleRef.current) {
      sampleRef.current = document.createElement('canvas')
    }
    return () => {
      const stream = streamRef.current
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const startCamera = async () => {
    if (status.kind === 'starting' || status.kind === 'running') return
    setStatus({ kind: 'starting' })
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 360 }, facingMode: 'user' },
        audio: false,
      })
      streamRef.current = stream
      const video = videoRef.current
      if (!video) {
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        setStatus({ kind: 'error', message: 'Hidden video element missing — please retry.' })
        return
      }
      video.srcObject = stream
      video.muted = true
      await video.play()
      setStatus({ kind: 'running' })
      requestRender()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Camera access was declined.'
      setStatus({ kind: 'error', message })
    }
  }

  const stopCamera = () => {
    const stream = streamRef.current
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    if (animationRef.current) {
      window.cancelAnimationFrame(animationRef.current)
      animationRef.current = 0
    }
    setStatus({ kind: 'idle' })
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (canvas && context) {
      context.fillStyle = '#06050a'
      context.fillRect(0, 0, canvas.width, canvas.height)
    }
  }

  const requestRender = () => {
    if (animationRef.current) {
      window.cancelAnimationFrame(animationRef.current)
    }
    const renderFrame = () => {
      drawFrame()
      animationRef.current = window.requestAnimationFrame(renderFrame)
    }
    animationRef.current = window.requestAnimationFrame(renderFrame)
  }

  const drawFrame = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const sample = sampleRef.current
    if (!video || !canvas || !sample) return
    if (!video.videoWidth || !video.videoHeight) return

    const tileSize = Math.max(4, tileRef.current)
    const targetWidth = Math.max(80, Math.floor(canvas.clientWidth / tileSize))
    const targetHeight = Math.max(60, Math.floor(canvas.clientHeight / tileSize))
    sample.width = targetWidth
    sample.height = targetHeight
    const sampleCtx = sample.getContext('2d', { willReadFrequently: true })
    if (!sampleCtx) return

    sampleCtx.save()
    sampleCtx.translate(targetWidth, 0)
    sampleCtx.scale(-1, 1)
    sampleCtx.drawImage(video, 0, 0, targetWidth, targetHeight)
    sampleCtx.restore()
    const frame = sampleCtx.getImageData(0, 0, targetWidth, targetHeight)

    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    const cssWidth = canvas.clientWidth
    const cssHeight = canvas.clientHeight
    canvas.width = Math.floor(cssWidth * ratio)
    canvas.height = Math.floor(cssHeight * ratio)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)

    ctx.fillStyle = '#06050a'
    ctx.fillRect(0, 0, cssWidth, cssHeight)

    const cellW = cssWidth / targetWidth
    const cellH = cssHeight / targetHeight
    const data = frame.data
    const paletteRgb = palettesRgb[paletteRef.current]
    const contrastPow = 1 / (0.4 + contrastRef.current * 1.4)

    const currentMode = modeRef.current
    if (currentMode === 'kaleidoscope') {
      drawKaleidoscope(ctx, frame, cssWidth, cssHeight, mirrorsRef.current, paletteRgb, contrastPow)
      return
    }

    for (let y = 0; y < targetHeight; y += 1) {
      for (let x = 0; x < targetWidth; x += 1) {
        const offset = (y * targetWidth + x) * 4
        const r = data[offset]
        const g = data[offset + 1]
        const b = data[offset + 2]
        const luminance = Math.pow((0.299 * r + 0.587 * g + 0.114 * b) / 255, contrastPow)
        const [pr, pg, pb] = paletteSample(paletteRgb, luminance)
        const px = x * cellW
        const py = y * cellH

        if (currentMode === 'halftone') {
          const radius = Math.max(0.4, (cellW * 0.62) * (0.2 + luminance * 0.9))
          ctx.fillStyle = `rgb(${pr | 0}, ${pg | 0}, ${pb | 0})`
          ctx.beginPath()
          ctx.arc(px + cellW * 0.5, py + cellH * 0.5, radius * 0.6, 0, Math.PI * 2)
          ctx.fill()
        } else if (currentMode === 'ascii') {
          const charIndex = Math.min(ASCII_RAMP.length - 1, Math.floor(luminance * (ASCII_RAMP.length - 0.001)))
          ctx.fillStyle = `rgb(${pr | 0}, ${pg | 0}, ${pb | 0})`
          ctx.font = `${Math.max(8, cellH * 1)}px var(--mono-font)`
          ctx.textBaseline = 'middle'
          ctx.textAlign = 'center'
          ctx.fillText(ASCII_RAMP[charIndex], px + cellW * 0.5, py + cellH * 0.5)
        } else if (currentMode === 'contour') {
          const bandedLum = Math.floor(luminance * 6) / 6
          const [cr, cg, cb] = paletteSample(paletteRgb, bandedLum)
          ctx.fillStyle = `rgb(${cr | 0}, ${cg | 0}, ${cb | 0})`
          ctx.fillRect(px, py, cellW + 1, cellH + 1)
        }
      }
    }
  }

  function drawKaleidoscope(
    ctx: CanvasRenderingContext2D,
    frame: ImageData,
    width: number,
    height: number,
    slices: number,
    paletteRgb: [number, number, number][],
    contrastPow: number,
  ) {
    const cx = width / 2
    const cy = height / 2
    const radius = Math.min(width, height) * 0.55
    const wedge = (Math.PI * 2) / slices
    ctx.fillStyle = '#06050a'
    ctx.fillRect(0, 0, width, height)

    const data = frame.data
    const fw = frame.width
    const fh = frame.height

    for (let slice = 0; slice < slices; slice += 1) {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(slice * wedge)
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(radius, 0)
      ctx.arc(0, 0, radius, 0, wedge)
      ctx.closePath()
      ctx.clip()

      const step = Math.max(2, Math.floor(tileRef.current * 0.6))
      for (let r = 0; r < radius; r += step) {
        for (let a = 0; a < wedge; a += step / Math.max(radius, 1)) {
          const px = Math.cos(a) * r
          const py = Math.sin(a) * r
          const sampleX = Math.min(fw - 1, Math.max(0, Math.floor(((r / radius) * fw))))
          const sampleY = Math.min(fh - 1, Math.max(0, Math.floor((a / wedge) * fh)))
          const idx = (sampleY * fw + sampleX) * 4
          const lr = data[idx]
          const lg = data[idx + 1]
          const lb = data[idx + 2]
          const luminance = Math.pow((0.299 * lr + 0.587 * lg + 0.114 * lb) / 255, contrastPow)
          const [pr, pg, pb] = paletteSample(paletteRgb, luminance)
          ctx.fillStyle = `rgb(${pr | 0}, ${pg | 0}, ${pb | 0})`
          ctx.fillRect(px, py, step, step)
        }
      }
      ctx.restore()
    }
  }

  const summary = useMemo(() => {
    if (status.kind === 'idle') return 'Camera permission has not been requested yet.'
    if (status.kind === 'starting') return 'Asking the browser for camera access.'
    if (status.kind === 'error') return `Camera unavailable: ${status.message}`
    return `Camera active · ${mode} · ${palette} · ${size.width.toFixed(0)}×${size.height.toFixed(0)} stage`
  }, [status, mode, palette, size.width, size.height])

  return (
    <ImmersiveDemo
      caption={summary}
      controls={
        <>
          <Parameter label="lens">
            <select value={mode} onChange={(event) => setMode(event.target.value as LensMode)} className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]">
              {modes.map((option) => <option key={option} value={option} className="bg-[#120f15]">{option}</option>)}
            </select>
          </Parameter>
          <Parameter label="palette">
            <select value={palette} onChange={(event) => setPalette(event.target.value as LensPalette)} className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]">
              {palettes.map((option) => <option key={option} value={option} className="bg-[#120f15]">{option}</option>)}
            </select>
          </Parameter>
          <Parameter label="tile size" value={`${tile}px`}>
            <input type="range" min="4" max="28" step="1" value={tile} onChange={(event) => setTile(Number(event.target.value))} />
          </Parameter>
          <Parameter label="contrast" value={contrast.toFixed(2)}>
            <input type="range" min="0.1" max="1.6" step="0.05" value={contrast} onChange={(event) => setContrast(Number(event.target.value))} />
          </Parameter>
          {mode === 'kaleidoscope' ? (
            <Parameter label="mirror slices" value={String(mirrors)}>
              <input type="range" min="3" max="14" step="1" value={mirrors} onChange={(event) => setMirrors(Number(event.target.value))} />
            </Parameter>
          ) : null}
          <div className="instrument-panel flex flex-wrap gap-2 px-3 py-3">
            {status.kind === 'running' ? (
              <button type="button" onClick={stopCamera} className="control-button" data-variant="primary">stop camera</button>
            ) : (
              <button type="button" onClick={startCamera} className="control-button" data-variant="primary" disabled={status.kind === 'starting'}>
                {status.kind === 'starting' ? 'requesting…' : 'enable camera'}
              </button>
            )}
          </div>
          <p className="text-sm text-[var(--soft)] sm:col-span-2 lg:col-span-3 xl:col-span-4">Your camera stream stays in this browser — it is never sent over the network. Stop the camera at any time.</p>
        </>
      }
    >
      <div ref={setContainer} className="relative h-full w-full">
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas ref={canvasRef} className="h-full w-full" />
        {status.kind !== 'running' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="surface-note max-w-md px-5 py-5 text-center text-[var(--text-muted)]">
              <p className="meta-label mb-2">camera lens</p>
              <p className="mb-4 text-sm leading-relaxed">
                {status.kind === 'error'
                  ? `The browser refused camera access. ${status.message}`
                  : 'This piece reinterprets a live video feed as ASCII characters, halftone dots, kaleidoscope tiles, or contour bands. Frames are processed locally in the browser.'}
              </p>
              {status.kind !== 'starting' ? (
                <button type="button" className="control-button" data-variant="primary" onClick={startCamera}>
                  {status.kind === 'error' ? 'try again' : 'enable camera'}
                </button>
              ) : (
                <p className="text-sm">requesting permission…</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </ImmersiveDemo>
  )
}
