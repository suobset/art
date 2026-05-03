export function SeedControls({ seed, onRandomize }: { seed: number; onRandomize: () => void }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
      <span className="control-chip px-3 py-2 font-[var(--mono-font)] text-xs text-[var(--text)]">seed {seed}</span>
      <button type="button" onClick={onRandomize} className="control-button">
        remix seed
      </button>
    </div>
  )
}
