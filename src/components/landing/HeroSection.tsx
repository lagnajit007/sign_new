import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HeroStage from "./HeroStage";
import { StageWindow } from "./StageWindow";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-heading">
      {/* A faint ambient light behind the stage: no edges, so it's light, not a plate. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[38%] -z-10 h-[720px] bg-[radial-gradient(ellipse_50%_45%_at_50%_40%,rgb(124_92_255/0.09),transparent_72%)]"
      />

      <div className="mx-auto max-w-3xl px-5 pt-16 text-center sm:pt-24 md:pt-28">
        <h1 id="hero-heading" className="mk-display animate-sj-enter text-fg">
          Learn to sign,
          <br />
          one letter at a time.
        </h1>
        <p className="mk-lede mx-auto mt-6 max-w-[34rem] animate-sj-enter [animation-delay:60ms]">
          Hold up a letter to your webcam. Sanjog reads your hand and tells you instantly whether it&apos;s right.
        </p>
        <div className="mt-9 flex animate-sj-enter flex-wrap items-center justify-center gap-x-6 gap-y-3 [animation-delay:120ms]">
          <Link
            href="/sign-up"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-brand pl-6 pr-5 text-[15px] font-medium text-brand-fg shadow-[0_1px_0_rgb(255_255_255/0.2)_inset,0_8px_20px_-8px_rgb(91_60_230/0.6)] transition-colors hover:bg-brand-hover"
          >
            Start practising free <ArrowRight className="size-4" aria-hidden />
          </Link>
          <a
            href="#how-it-works"
            className="rounded-md text-[15px] font-medium text-fg-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
          >
            See how it works
          </a>
        </div>
        <ul className="mt-8 flex animate-sj-enter flex-wrap justify-center gap-x-7 gap-y-1 text-[13px] text-fg-subtle [animation-delay:160ms]">
          <li>Free to use</li>
          <li>Runs in your browser</li>
          <li>Video stays on your device</li>
        </ul>
      </div>

      {/* The product is the hero: a wide practice window, dissolving at its foot. */}
      <div className="mx-auto mt-14 max-w-[1120px] animate-sj-enter px-3 [animation-delay:200ms] sm:mt-16 sm:px-6">
        <StageWindow
          address="sanjog.app/practice"
          hero
          fadeFoot
          bodyClassName="h-[420px] sm:h-[clamp(440px,48vw,600px)]"
        >
          <HeroStage />
        </StageWindow>
        <p className="mt-1 text-center text-[12px] text-fg-subtle">Illustration of a practice session</p>
      </div>
    </section>
  );
}
