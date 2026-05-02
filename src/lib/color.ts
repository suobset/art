export const palettes = {
  ember: ['#ff7a59', '#ffd166', '#f4f1de', '#ef476f'],
  lagoon: ['#6be3ff', '#4ecdc4', '#f7fff7', '#1a759f'],
  moss: ['#d8ff62', '#4d7c0f', '#fefae0', '#bc6c25'],
  velvet: ['#ff5fd2', '#7b2cbf', '#ffe5ec', '#4cc9f0'],
} as const

export type PaletteName = keyof typeof palettes

export function mapValueToColor(scale: string[], index: number) {
  return scale[((index % scale.length) + scale.length) % scale.length]
}

export function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '')
  const full = normalized.length === 3 ? normalized.split('').map((c) => c + c).join('') : normalized
  const value = Number.parseInt(full, 16)
  const red = (value >> 16) & 255
  const green = (value >> 8) & 255
  const blue = value & 255
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}
