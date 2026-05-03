import type { BehindTheScenesData } from '../lib/demoTypes'

export function BehindTheScenes({ data, whyArt }: { data: BehindTheScenesData; whyArt: string }) {
  return (
    <div className="grid gap-4 rounded-[1.5rem] border border-[var(--line)] bg-[var(--bg-panel)] p-4 text-sm text-[var(--muted)] md:grid-cols-[1.15fr_0.85fr] md:p-5">
      <div className="space-y-5">
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
            className="inline-flex rounded-full border border-[var(--line)] px-3 py-2 text-xs text-[var(--text)] transition hover:border-[var(--accent-2)]"
          >
            {data.sourceFile.label}
          </a>
        </section>
        <section>
          <h4 className="mb-2 text-base text-[var(--text)]">Code walkthrough</h4>
          <div className="space-y-4">
            {data.snippets.map((snippet) => (
              <article key={snippet.title} className="rounded-[1.25rem] border border-[var(--line)] bg-black/20 p-3">
                <h5 className="mb-2 text-sm font-medium text-[var(--text)]">{snippet.title}</h5>
                <pre className="overflow-x-auto rounded-2xl bg-black/35 p-4 font-[var(--mono-font)] text-xs text-[var(--accent-3)]">
                  <code>{snippet.code}</code>
                </pre>
                <p className="mt-3 text-xs leading-relaxed text-[var(--soft)]">{snippet.note}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
      <div className="space-y-5">
        <section>
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
          <section>
            <h4 className="mb-2 text-base text-[var(--text)]">Important distinctions</h4>
            <ul className="list-disc space-y-1 pl-5">
              {data.distinctions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}
        <section>
          <h4 className="mb-2 text-base text-[var(--text)]">Try changing this</h4>
          <ul className="list-disc space-y-1 pl-5">
            {data.tryThis.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h4 className="mb-2 text-base text-[var(--text)]">Why it matters</h4>
          <p>{whyArt}</p>
        </section>
      </div>
    </div>
  )
}
