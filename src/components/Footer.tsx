export function Footer() {
  return (
    <footer className="mx-auto mt-8 w-full max-w-7xl px-4 pb-12 md:px-6">
      <div className="grid gap-4 rounded-[2rem] border border-[var(--line)] bg-[var(--bg-elevated)] p-5 text-sm text-[var(--muted)] md:grid-cols-3 md:p-6">
        <div>
          <h2 className="mb-2 font-[var(--hero-font)] text-2xl text-[var(--text)]">Source philosophy</h2>
          <p>The work is the image, the behavior, and the readable procedure that produces both.</p>
        </div>
        <p>Every demo includes a short code excerpt because open source should make the process touchable.</p>
        <p>Correctness matters here. So do pacing, mood, friction, and surprise.</p>
      </div>
    </footer>
  )
}
