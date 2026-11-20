import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HeroStage from "./HeroStage";
import { StageWindow } from "./StageWindow";

export default function HeroSection() {
  return (
    <section className="border-b border-[var(--mk-rule)]" aria-labelledby="hero-heading">
      <div className="mx-auto max-w-3xl px-5 pb-14 pt-16 text-center sm:pb-16 sm:pt-24 md:pt-28">
        <h1 id="hero-heading" className="mk-display animate-sj-enter text-fg">
          Learn to sign,
          <br />
          one letter at a time.
        </h1>
        <p className="mk-lede mx-auto mt-6 max-w-[32rem] animate-sj-enter [animation-delay:60ms]">
          Hold up a letter to your webcam. Sanjog reads your hand and tells you instantly whether it&apos;s right.
        </p>
        <div className="mt-9 flex animate-sj-enter flex-wrap items-center justify-center gap-x-6 gap-y-3 [animation-delay:120ms]">
          <Link href="/sign-up" className="mk-btn-primary group">
            Start practising free
            <ArrowRight className="size-4 transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-0.5" aria-hidden />
          </Link>
          <a href="#how-it-works" className="mk-link">
            See how it works
          </a>
        </div>
        <ul className="mt-7 flex animate-sj-enter flex-wrap justify-center gap-x-6 gap-y-1 text-[13px] text-fg-subtle [animation-delay:160ms]">
          <li>Free to use</li>
          <li>Runs in your browser</li>
          <li>Video stays on your device</li>
        </ul>
      </div>

      {/* The stage: a soft dusk plate; the window is inset on three sides and runs off the bottom. */}
      <div className="px-3 pb-3 sm:px-4 sm:pb-4">
        <div
          className="relative h-[460px] animate-sj-enter overflow-hidden rounded-[var(--mk-r-5)] px-3 pt-8 [animation-delay:200ms] sm:h-[clamp(500px,52vw,640px)] sm:px-[7%] sm:pt-[5.5%]"
          style={{ background: "var(--mk-plate-dusk)" }}
        >
          <StageWindow address="sanjog.app/practice" hero bodyClassName="h-[430px] sm:h-[clamp(480px,42vw,600px)]">
            <HeroStage />
          </StageWindow>
        </div>
        <p className="mt-3 text-center text-[12px] text-fg-subtle">Illustration of a practice session</p>
      </div>
    </section>
  );
}
