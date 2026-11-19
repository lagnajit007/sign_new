import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./reveal";

export default function Mission() {
  return (
    <section className="px-4 sm:px-6" style={{ paddingTop: "var(--mk-section-y)" }} aria-labelledby="mission-heading">
      <Reveal className="mx-auto grid max-w-[1080px] gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <h2 id="mission-heading" className="text-[15px] font-medium text-fg-subtle lg:pt-3">
          Why we built it
        </h2>
        <div>
          <p className="max-w-[22em] text-[clamp(1.6rem,3vw,2.35rem)] font-medium leading-[1.22] tracking-[-0.022em] text-fg">
            Around 70 million deaf people sign as their first language. Learning the alphabet is a real first step toward
            talking with them.
          </p>
          <div className="mt-8 max-w-[34rem] space-y-4 text-[16px] leading-relaxed text-fg-muted">
            <p>
              Good practice with feedback is hard to find and often expensive. Sanjog started in 2023 as a final-year project by
              five computer science students, built to tell you on every attempt whether your handshape reads correctly.
            </p>
            <p className="text-[13px] text-fg-subtle">Figure: World Federation of the Deaf.</p>
          </div>
          <Link
            href="/about"
            className="mt-6 inline-flex items-center gap-1.5 rounded text-[15px] font-medium text-fg underline-offset-4 hover:underline"
          >
            Read our story <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
