import Link from "next/link";
import { ArrowRight } from "lucide-react";
import RecognitionDemo from "./RecognitionDemo";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Quiet dotted grid behind the hero, fading out toward the edges. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(var(--sj-line-strong)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-24">
        <div className="animate-sj-enter">
          <p className="text-sm font-medium text-brand">Fingerspelling practice · A–Z and 0–9</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-fg sm:text-5xl lg:text-[3.6rem]">
            Learn to sign,
            <br />
            one letter at a time.
          </h1>
          <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-fg-muted">
            Hold up your hand and make a letter. Sanjog reads the shape through your webcam and tells you straight away
            whether it&apos;s right, and how sure it is.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/sign-up"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-[15px] font-medium text-brand-fg transition-colors hover:bg-brand-hover"
            >
              Start practising free <ArrowRight className="size-4" aria-hidden />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-11 items-center rounded-lg border border-line bg-panel px-5 text-[15px] font-medium text-fg transition-colors hover:bg-subtle"
            >
              See how it works
            </a>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-fg-subtle">
            <li>Free to use</li>
            <li aria-hidden>·</li>
            <li>Runs in your browser</li>
            <li aria-hidden>·</li>
            <li>Video never leaves your device</li>
          </ul>
        </div>

        <div className="animate-sj-enter [animation-delay:120ms]">
          <div className="overflow-hidden rounded-2xl border border-line bg-zinc-900 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.35)]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
              <div className="flex gap-1.5" aria-hidden>
                <span className="size-2.5 rounded-full bg-white/15" />
                <span className="size-2.5 rounded-full bg-white/15" />
                <span className="size-2.5 rounded-full bg-white/15" />
              </div>
              <span className="text-xs text-white/50">Practice</span>
              <span className="w-10" />
            </div>
            <div className="aspect-[4/3]">
              <RecognitionDemo />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
