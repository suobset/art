export function SeedControls({ seed, onRandomize }: { seed: number; onRandomize: () => void }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
      <span className="rounded-full border border-[var(--line)] px-3 py-1 font-[var(--mono-font)] text-xs text-[var(--text)]">seed {seed}</span>
      <button type="button" onClick={onRandomize} className="rounded-full border border-[var(--line)] px-3 py-1 transition hover:border-[var(--accent)] hover:text-[var(--text)]">
        remix
      </button>
    </div>
  )
}
