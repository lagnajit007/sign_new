import { Check } from "lucide-react";
import { HandMesh } from "@/components/art/hand-mesh";
import { Reveal } from "./reveal";

/** Each step's micro-visual is the actual piece of UI the learner meets at that step. */
const STEPS = [
  {
    title: "Turn on your camera",
    body: "Nothing is recorded. Tracking runs in your browser.",
    visual: (
      <span className="inline-flex h-10 items-center gap-2.5 rounded-full bg-white px-4 text-[14px] text-fg shadow-[var(--mk-shadow-window)]">
        <span className="relative flex size-2">
          <span className="absolute inset-0 rounded-full bg-emerald-500" />
        </span>
        Camera on
      </span>
    ),
  },
  {
    title: "Make the sign",
    body: "Copy the handshape. Sanjog finds 21 points on your hand.",
    visual: (
      <span className="grid size-[104px] place-items-center rounded-[18px] bg-[#0d0d10] shadow-[var(--mk-shadow-window)]">
        <HandMesh sign="B" className="h-[78%] w-auto text-[#a78bfa]" />
      </span>
    ),
  },
  {
    title: "See the result",
    body: "Hold it steady to master the sign and earn XP.",
    visual: (
      <span className="inline-flex h-10 items-center gap-3 rounded-full bg-white px-4 text-[14px] shadow-[var(--mk-shadow-window)]">
        <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
          <Check className="size-3.5" strokeWidth={2.6} aria-hidden /> Correct
        </span>
        <span className="text-fg-muted tabular-nums">+10 XP</span>
      </span>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 px-4 sm:px-6" style={{ paddingTop: "var(--mk-section-y)" }} aria-labelledby="how-heading">
      <div className="mx-auto max-w-[1080px]">
        <Reveal className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h2 id="how-heading" className="mk-h2 text-fg">
            How it works
          </h2>
          <p className="mk-lede">Three steps, about ten seconds per sign.</p>
        </Reveal>

        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <Reveal delay={i * 0.08} className="flex h-full flex-col rounded-[22px] bg-[var(--mk-tile)]">
                <div className="grid h-44 place-items-center" aria-hidden>
                  {s.visual}
                </div>
                <div className="flex gap-4 px-7 pb-7 sm:px-8 sm:pb-8">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-white text-[12px] font-medium text-fg-muted shadow-[inset_0_0_0_1px_var(--sj-line-strong)] tabular-nums">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-[17px] font-semibold text-fg">{s.title}</h3>
                    <p className="mt-1 text-[15px] leading-relaxed text-fg-subtle">{s.body}</p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
