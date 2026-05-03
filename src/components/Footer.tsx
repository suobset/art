export function Footer({ author }: { author: { shortName: string; blog: string; artDomain: string; resume: string; site: string } }) {
  return (
    <footer className="mx-auto mt-8 w-full max-w-7xl px-4 pb-12 md:px-6">
      <div className="surface-frame px-5 py-5 md:px-6 md:py-6">
        <div className="grid gap-6 md:grid-cols-[1.05fr_0.95fr_0.7fr]">
          <div>
            <p className="meta-label mb-3">museum placard</p>
            <h2 className="mb-2 font-[var(--hero-font)] text-2xl text-[var(--text)]">art + algorithms</h2>
            <p className="text-sm text-[var(--text-muted)]">A computational art zine disguised as a gallery map: visual experiments, readable source, and algorithms treated like materials.</p>
          </div>
          <div>
            <p className="meta-label mb-3">field links</p>
            <p className="text-sm text-[var(--text-muted)]">Visit <a href={author.blog} className="text-[var(--accent-2)] underline-offset-4 hover:underline">declarative</a>, browse <a href={author.resume} className="text-[var(--accent-2)] underline-offset-4 hover:underline">resume</a>, or share the gallery from <a href={author.artDomain} className="text-[var(--accent-2)] underline-offset-4 hover:underline">art.skushagra.com</a>.</p>
          </div>
          <div>
            <p className="meta-label mb-3">rights</p>
            <p className="text-sm text-[var(--text-muted)]">MIT licensed. The source, notes, and process are meant to be studied, remixed, and built on.</p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 border-t border-[var(--rule)] pt-4 text-xs text-[var(--text-faint)] md:grid-cols-[1fr_auto] md:items-center">
          <span>Built for the open web, with room labels, source notes, and no decorative fluff standing in for the work.</span>
          <span>{author.shortName} · <a href={author.site} className="hover:text-[var(--text)]">skushagra.com</a> · MIT</span>
        </div>
      </div>
    </footer>
  )
}
