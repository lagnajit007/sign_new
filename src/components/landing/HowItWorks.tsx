"use client";

import { useRef } from "react";
import { useInView } from "motion/react";
import { Check, Video } from "lucide-react";
import { HandMesh } from "@/components/art/hand-mesh";
import { BlurSwap, useBeats } from "@/components/motion";
import { Reveal } from "./reveal";

/** Step 3's micro-demo: the feedback the learner sees, arriving on its own loop. */
function FeedbackLoop() {
  const ref = useRef<HTMLSpanElement>(null);
  const active = useInView(ref, { margin: "-10% 0px" });
  const { beat } = useBeats([["reading", 1400], ["correct", 2400]] as const, active, "correct");
  return (
    <span ref={ref} className="inline-flex h-10 items-center rounded-full bg-white px-4 text-[14px] shadow-[var(--mk-shadow-window)]">
      <BlurSwap swapKey={beat} className="gap-3">
        {beat === "correct" ? (
          <>
            <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
              <Check className="size-3.5" strokeWidth={2.6} aria-hidden /> Correct
            </span>
            <span className="text-fg-muted tabular-nums">+10 XP</span>
          </>
        ) : (
          <span className="text-fg-muted">Reading your hand…</span>
        )}
      </BlurSwap>
    </span>
  );
}

const STEPS = [
  {
    title: "Turn on your camera",
    body: "Nothing is recorded. Tracking runs in your browser.",
    visual: (
      <span className="inline-flex h-10 items-center gap-2.5 rounded-full bg-white px-4 text-[14px] text-fg shadow-[var(--mk-shadow-window)]">
        <Video className="size-4 text-fg-subtle" aria-hidden />
        Camera on
        <span className="size-1.5 rounded-full bg-emerald-500" />
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
    visual: <FeedbackLoop />,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mk-section scroll-mt-20 !pb-0" aria-labelledby="how-heading">
      <div className="px-4 sm:px-10 lg:px-14">
        <Reveal>
          <h2 id="how-heading" className="mk-runin max-w-[24ch]">
            <strong>How it works.</strong> Three steps, about ten seconds per sign.
          </h2>
        </Reveal>
      </div>

      <ol className="mt-14 grid border-t border-[var(--mk-rule)] md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className={i > 0 ? "border-t border-[var(--mk-rule)] md:border-l md:border-t-0" : ""}>
            <Reveal delay={i * 0.1} className="flex h-full flex-col">
              <div className="grid h-48 place-items-center bg-[var(--mk-tile)]" aria-hidden>
                {s.visual}
              </div>
              <div className="flex gap-4 border-t border-[var(--mk-rule)] px-7 py-7 sm:px-8">
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
    </section>
  );
}
