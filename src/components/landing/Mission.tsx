import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BASE, BONES, POSES } from "@/components/art/hand-poses";
import { Reveal } from "./reveal";

/** A quiet landmark field: the 21 points in hairline grey, one violet fingertip. Static on purpose. */
function LandmarkField() {
  const pts = [...BASE, ...POSES.B];
  return (
    <svg viewBox="0 0 100 100" aria-hidden className="h-full w-auto">
      {BONES.map(([a, b], k) => (
        <line key={k} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke="#d4d4d8" strokeWidth={0.35} strokeLinecap="round" />
      ))}
      {pts.map(([x, y], k) => (
        <circle key={k} cx={x} cy={y} r={k === 12 ? 1.3 : 0.9} fill={k === 12 ? "#7c5cff" : "#a1a1aa"} />
      ))}
    </svg>
  );
}

export default function Mission() {
  return (
    <section className="mk-section" aria-labelledby="mission-heading">
      <Reveal className="grid items-center gap-12 px-5 sm:px-10 lg:grid-cols-[1.35fr_1fr] lg:gap-16 lg:px-14">
        <div>
          <h2 id="mission-heading" className="text-[15px] font-medium text-fg-subtle">
            Why we built it
          </h2>
          <p className="mt-5 max-w-[22em] text-[clamp(1.6rem,3vw,2.35rem)] font-medium leading-[1.2] tracking-[-0.024em] text-fg">
            Around 70 million deaf people sign as their first language. Learning the alphabet is a real first step toward talking
            with them.
          </p>
          <p className="mt-7 max-w-[34rem] text-[16px] leading-relaxed text-fg-muted">
            Good practice with feedback is hard to find and often expensive. Sanjog started in 2023 as a final-year project by five
            computer science students, built to tell you on every attempt whether your handshape reads correctly.
          </p>
          <p className="mt-3 text-[13px] text-fg-subtle">Figure: World Federation of the Deaf.</p>
          <Link href="/about" className="mk-link mt-7 inline-flex items-center gap-1.5 !text-fg">
            Read our story <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
        <div className="hidden h-[380px] items-center justify-center rounded-[var(--mk-r-4)] bg-[var(--mk-tile)] lg:flex">
          <div className="h-[78%]">
            <LandmarkField />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
