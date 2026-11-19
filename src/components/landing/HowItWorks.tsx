import { Reveal } from "./reveal";

const STEPS = [
  {
    title: "Allow your camera",
    body: "Open a lesson and turn on your webcam. Nothing is recorded; tracking happens in your browser.",
  },
  {
    title: "Make the sign",
    body: "Copy the hand shape for the letter or number. Sanjog finds 21 points on your hand and reads the shape.",
  },
  {
    title: "Get instant feedback",
    body: "See what it recognised and how confident it is. Hold it steady to master the sign and earn XP.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-20 md:py-28" aria-labelledby="how-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="max-w-2xl">
          <h2 id="how-heading" className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            How it works
          </h2>
          <p className="mt-3 text-[16px] text-fg-muted">Three steps, about ten seconds per sign.</p>
        </Reveal>
        <ol className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <Reveal delay={i * 0.06} className="border-t border-line-strong pt-5">
                <span className="font-mono text-xs text-brand">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-lg font-semibold text-fg">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
