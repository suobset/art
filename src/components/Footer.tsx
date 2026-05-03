export function Footer({ author }: { author: { shortName: string; blog: string; artDomain: string; resume: string; site: string } }) {
  return (
    <footer className="mx-auto mt-8 w-full max-w-7xl px-4 pb-12 md:px-6">
      <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow)] md:p-6">
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr_0.7fr]">
          <div>
            <h2 className="mb-2 font-[var(--hero-font)] text-2xl text-[var(--text)]">art + algorithms</h2>
            <p className="text-sm text-[var(--muted)]">A digital gallery about code used with expressive intent: visual, procedural, readable, and open to inspection.</p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[var(--soft)]">By Kush S.</h3>
            <p className="text-sm text-[var(--muted)]">Visit <a href={author.blog} className="text-[var(--accent-2)] underline-offset-4 hover:underline">declarative</a>, browse <a href={author.resume} className="text-[var(--accent-2)] underline-offset-4 hover:underline">resume</a>, or share the gallery from <a href={author.artDomain} className="text-[var(--accent-2)] underline-offset-4 hover:underline">art.skushagra.com</a>.</p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[var(--soft)]">License</h3>
            <p className="text-sm text-[var(--muted)]">MIT licensed. Source, explanations, and process are meant to be studied, remixed, and built on.</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4 text-xs text-[var(--soft)]">
          <span>Built for the open web.</span>
          <span>{author.shortName} · <a href={author.site} className="hover:text-[var(--text)]">skushagra.com</a> · MIT</span>
        </div>
      </div>
    </footer>
  )
}
