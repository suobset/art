import type { BehindTheScenesData } from '../lib/demoTypes'

export function BehindTheScenes({ data, whyArt }: { data: BehindTheScenesData; whyArt: string }) {
  return (
    <div className="grid gap-4 rounded-[1.5rem] border border-[var(--line)] bg-[var(--bg-panel)] p-4 text-sm text-[var(--muted)] md:grid-cols-[1.4fr_1fr]">
      <div className="space-y-4">
        <section>
          <h4 className="mb-1 text-base text-[var(--text)]">What you are seeing</h4>
          <p>{data.concept}</p>
        </section>
        <section>
          <h4 className="mb-1 text-base text-[var(--text)]">How it works</h4>
          <pre className="overflow-x-auto rounded-2xl bg-black/30 p-4 font-[var(--mono-font)] text-xs text-[var(--accent-3)]">
            <code>{data.codeExcerpt}</code>
          </pre>
        </section>
      </div>
      <div className="space-y-4">
        <section>
          <h4 className="mb-1 text-base text-[var(--text)]">Important parameters</h4>
          <ul className="space-y-2">
            {data.parameters.map((parameter) => (
              <li key={parameter.name}>
                <span className="font-medium text-[var(--text)]">{parameter.name}:</span> {parameter.meaning}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h4 className="mb-1 text-base text-[var(--text)]">Try changing this</h4>
          <ul className="list-disc space-y-1 pl-5">
            {data.tryThis.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h4 className="mb-1 text-base text-[var(--text)]">Why it matters</h4>
          <p>{whyArt}</p>
        </section>
      </div>
    </div>
  )
}
