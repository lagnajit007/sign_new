import type { LandingPreview } from "@/lib/landing-preview";
import PreviewBody from "./PreviewBody";
import { Reveal } from "./reveal";
import { StageWindow } from "./StageWindow";

/** The dashboard on a mist plate, built from a seeded demo learner's real practice history. */
export default function ProductPreview({ data }: { data: LandingPreview }) {
  const first = data.learner.name.split(" ")[0];
  return (
    <section className="mk-section" aria-labelledby="preview-heading">
      <Reveal className="px-5 sm:px-10 lg:px-14">
        <h2 id="preview-heading" className="mk-runin max-w-[24ch]">
          <strong>Your progress, at a glance.</strong> Every correct sign adds to your streak and XP.
        </h2>
      </Reveal>

      <Reveal delay={0.06} className="mt-12 px-3 sm:px-4">
        <div
          className="relative h-[560px] overflow-hidden rounded-[var(--mk-r-5)] px-3 pt-8 sm:h-[520px] sm:px-[6%] sm:pt-[4.5%]"
          style={{ background: "var(--mk-plate-mist)" }}
        >
          <StageWindow address="sanjog.app/dashboard">
            <PreviewBody data={data} />
          </StageWindow>
        </div>
        <p className="mt-3 px-2 text-center text-[12px] text-fg-subtle">
          Built from the app&apos;s own components with {first}&apos;s practice data. {first} is a demo learner.
        </p>
      </Reveal>
    </section>
  );
}
