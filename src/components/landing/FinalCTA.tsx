import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HandMesh } from "@/components/art/hand-mesh";
import { Reveal } from "./reveal";

export default function FinalCTA() {
  return (
    <section className="px-4 pb-20 sm:px-6 md:pb-28">
      <Reveal className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-2xl bg-zinc-950 px-6 py-14 text-center sm:px-12 md:py-20">
          <HandMesh sign="5" className="pointer-events-none absolute -right-10 -top-6 size-72 text-white/[0.07] md:-right-4" />
          <HandMesh sign="L" className="pointer-events-none absolute -bottom-12 -left-12 size-64 text-white/[0.05]" />
          <h2 className="relative font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Your first sign takes a minute.
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-[16px] text-white/70">
            Free, in your browser, no credit card. Pick a letter and see how Sanjog reads your hand.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-[15px] font-medium text-zinc-950 transition-colors hover:bg-white/90"
            >
              Start practising free <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex h-11 items-center rounded-lg border border-white/20 px-5 text-[15px] font-medium text-white transition-colors hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
