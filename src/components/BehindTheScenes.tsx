import type { BehindTheScenesData } from '../lib/demoTypes'

export function BehindTheScenes({ data, whyArt }: { data: BehindTheScenesData; whyArt: string }) {
  return (
    <div className="surface-placard grid gap-4 px-4 py-4 text-sm text-[var(--text-muted)] md:grid-cols-[1.15fr_0.85fr] md:px-5 md:py-5">
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <span className="meta-label text-[var(--accent-2)]">source study</span>
          <span className="h-px flex-1 bg-[var(--rule)]" />
          <span className="font-[var(--mono-font)] text-[0.68rem] uppercase tracking-[0.18em] text-[var(--text-faint)]">annotated</span>
        </div>
        <section>
          <h4 className="mb-2 text-base text-[var(--text)]">What you are seeing</h4>
          <p>{data.overview}</p>
        </section>
        <section>
          <h4 className="mb-2 text-base text-[var(--text)]">How it works</h4>
          <div className="space-y-3">
            {data.explanation.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
        <section>
          <h4 className="mb-2 text-base text-[var(--text)]">Source file</h4>
          <a
            href={data.sourceFile.href}
            target="_blank"
            rel="noreferrer"
            className="control-button inline-flex"
          >
            {data.sourceFile.label}
          </a>
        </section>
        <section>
          <h4 className="mb-2 text-base text-[var(--text)]">Code walkthrough</h4>
          <div className="space-y-4">
            {data.snippets.map((snippet, index) => (
              <article key={snippet.title} className="surface-note px-3 py-3">
                <div className="mb-2 flex items-center gap-3">
                  <span className="font-[var(--mono-font)] text-[0.68rem] uppercase tracking-[0.18em] text-[var(--accent-2)]">snippet {String(index + 1).padStart(2, '0')}</span>
                  <h5 className="text-sm font-medium text-[var(--text)]">{snippet.title}</h5>
                </div>
                <pre className="overflow-x-auto rounded-[0.8rem] border border-[var(--rule)] bg-[var(--surface-strong)] p-4 font-[var(--mono-font)] text-xs leading-relaxed text-[var(--accent-3)]">
                  <code>{snippet.code}</code>
                </pre>
                <p className="mt-3 text-xs leading-relaxed text-[var(--text-faint)]">{snippet.note}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
      <div className="space-y-5">
        <section className="surface-note px-4 py-4">
          <h4 className="mb-2 text-base text-[var(--text)]">Important parameters</h4>
          <ul className="space-y-2">
            {data.parameters.map((parameter) => (
              <li key={parameter.name}>
                <span className="font-medium text-[var(--text)]">{parameter.name}:</span> {parameter.meaning}
              </li>
            ))}
          </ul>
        </section>
        {data.distinctions?.length ? (
          <section className="surface-note px-4 py-4">
            <h4 className="mb-2 text-base text-[var(--text)]">Important distinctions</h4>
            <ul className="list-disc space-y-1 pl-5">
              {data.distinctions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}
        <section className="surface-note px-4 py-4">
          <h4 className="mb-2 text-base text-[var(--text)]">Try changing this</h4>
          <ul className="list-disc space-y-1 pl-5">
            {data.tryThis.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="surface-note px-4 py-4">
          <h4 className="mb-2 text-base text-[var(--text)]">Why it matters</h4>
          <p>{whyArt}</p>
        </section>
      </div>
    </div>
  )
}
