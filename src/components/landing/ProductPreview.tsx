import type { LandingPreview } from "@/lib/landing-preview";
import { Avatar } from "@/components/app/avatar";
import { ActivityBars } from "@/components/app/charts";
import { Reveal } from "./reveal";
import { StageWindow } from "./StageWindow";

const SIGNS = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"];

/**
 * The dashboard, simplified to four numbers, one quiet chart and the top
 * three learners, built from a seeded demo learner's real practice history.
 */
export default function ProductPreview({ data }: { data: LandingPreview }) {
  const { learner, stats, week, leaders } = data;
  const figures = [
    { label: "Total XP", value: learner.xp.toLocaleString() },
    { label: "Streak", value: `${learner.streakDays} days` },
    { label: "Signs mastered", value: `${stats.mastered} / 36` },
    { label: "Accuracy", value: `${stats.accuracy}%` },
  ];

  return (
    <section className="px-3 sm:px-6" style={{ paddingTop: "var(--mk-section-y)" }} aria-labelledby="preview-heading">
      <Reveal className="mx-auto max-w-2xl px-2 text-center">
        <h2 id="preview-heading" className="mk-h2 text-fg">
          Your progress, at a glance
        </h2>
        <p className="mk-lede mx-auto mt-4 max-w-md">Every correct sign adds to your streak, your XP and the letters you&apos;ve mastered.</p>
      </Reveal>

      <Reveal delay={0.08} className="mx-auto mt-14 max-w-[1080px]">
        <StageWindow address="sanjog.app/dashboard" fadeFoot>
          <div className="pointer-events-none select-none bg-canvas" aria-hidden>
            <dl className="grid grid-cols-2 gap-y-8 px-6 pb-8 pt-9 sm:px-10 lg:grid-cols-4">
              {figures.map((f) => (
                <div key={f.label}>
                  <dt className="text-[13px] text-fg-subtle">{f.label}</dt>
                  <dd className="mt-1.5 whitespace-nowrap text-[28px] font-semibold tracking-[-0.02em] text-fg tabular-nums sm:text-[32px]">
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="grid border-t border-line lg:grid-cols-[1.55fr_1fr]">
              <div className="px-6 py-7 sm:px-10">
                <div className="text-[14px] font-medium text-fg">This week</div>
                <div className="mt-6">
                  <ActivityBars data={week} height={132} tone="soft" />
                </div>
              </div>
              <div className="border-t border-line px-6 py-7 sm:px-10 lg:border-l lg:border-t-0">
                <div className="text-[14px] font-medium text-fg">Top learners</div>
                <ol className="mt-4">
                  {leaders.slice(0, 3).map((u, i) => (
                    <li key={u.id} className="flex items-center gap-3 py-2.5 text-[14px]">
                      <span className="w-3 text-fg-subtle tabular-nums">{i + 1}</span>
                      <Avatar name={u.name} avatarId={u.avatarId} size={26} />
                      <span className="min-w-0 flex-1 truncate text-fg">{u.name}</span>
                      <span className="text-fg-muted tabular-nums">{u.xp.toLocaleString()}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Filler under the fade: the signs grid, the next thing on the real page. */}
            <div className="grid grid-cols-9 gap-2 border-t border-line px-6 py-7 sm:grid-cols-12 sm:px-10 lg:grid-cols-[repeat(18,minmax(0,1fr))]">
              {SIGNS.map((s, k) => (
                <span key={s} className={`h-9 rounded-md ${k < stats.mastered ? "bg-[#efeff1]" : "border border-line"}`} />
              ))}
            </div>
          </div>
        </StageWindow>
        <p className="mt-2 text-center text-[12px] text-fg-subtle">
          Built from the app&apos;s own components, with {learner.name.split(" ")[0]}&apos;s practice data. {learner.name.split(" ")[0]} is a demo learner.
        </p>
      </Reveal>
    </section>
  );
}
