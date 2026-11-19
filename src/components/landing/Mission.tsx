import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./reveal";

export default function Mission() {
  return (
    <section className="border-y border-line bg-panel/60 py-20 md:py-24" aria-labelledby="mission-heading">
      <Reveal className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <h2 id="mission-heading" className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          Why we built it
        </h2>
        <div className="space-y-4 text-[16px] leading-relaxed text-fg-muted">
          <p>
            Around 70 million deaf people use a sign language as their first language, according to the World Federation of the
            Deaf. Learning even the alphabet is a real step toward talking with them, but good practice with feedback is hard to
            find and often expensive.
          </p>
          <p>
            Sanjog started in 2023 as a final-year computer science project by five students. It&apos;s free, it runs in your
            browser, and it tells you on every attempt whether your hand shape reads correctly.
          </p>
          <Link href="/about" className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-brand hover:underline">
            Read our story <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
