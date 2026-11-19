import { CheckCircle2, Sparkles, Target } from "lucide-react";
import type { LandingPreview } from "@/lib/landing-preview";
import { Avatar } from "@/components/app/avatar";
import { ActivityBars } from "@/components/app/charts";
import { Stat } from "@/components/app/primitives";
import { Flame } from "@/components/art/flame";
import { Reveal } from "./reveal";

/**
 * The real dashboard components, rendered with a seeded demo learner's
 * practice history, inside a browser frame. Labelled as a preview.
 */
export default function ProductPreview({ data }: { data: LandingPreview }) {
  const { learner, stats, week, leaders } = data;
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 md:pb-28" aria-labelledby="preview-heading">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 id="preview-heading" className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          Your progress, at a glance
        </h2>
        <p className="mt-3 text-[16px] text-fg-muted">
          Every attempt feeds your streak, accuracy and the signs you&apos;ve mastered. Here&apos;s the dashboard for one of our demo learners.
        </p>
      </Reveal>

      <Reveal delay={0.08} className="mt-10">
        <div className="overflow-hidden rounded-2xl border border-line bg-canvas shadow-[0_30px_80px_-30px_rgb(24_24_27/0.35)]">
          <div className="flex items-center gap-3 border-b border-line bg-panel px-4 py-2.5">
            <div className="flex gap-1.5" aria-hidden>
              <span className="size-2.5 rounded-full bg-line-strong" />
              <span className="size-2.5 rounded-full bg-line-strong" />
              <span className="size-2.5 rounded-full bg-line-strong" />
            </div>
            <div className="mx-auto rounded-md bg-subtle px-3 py-0.5 text-xs text-fg-subtle">sanjog · overview</div>
            <span className="w-10" />
          </div>

          <div className="pointer-events-none select-none space-y-3 p-3 sm:p-5" aria-hidden>
            <div className="flex items-center gap-2.5 px-1">
              <Avatar name={learner.name} avatarId={learner.avatarId} size={28} />
              <div className="text-sm font-medium text-fg">{learner.name}</div>
              <span className="rounded-md bg-subtle px-1.5 py-0.5 text-[11px] text-fg-muted">Demo learner</span>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat label="Total XP" icon={<Sparkles />} value={learner.xp.toLocaleString()} hint={`Level ${learner.level}`} />
              <Stat label="Streak" icon={<Flame animated={false} />} value={`${learner.streakDays} days`} />
              <Stat label="Signs mastered" icon={<CheckCircle2 />} value={`${stats.mastered} / 36`} />
              <Stat label="Accuracy" icon={<Target />} value={`${stats.accuracy}%`} hint={`${stats.attempts} attempts`} />
            </div>
            <div className="grid gap-3 lg:grid-cols-5">
              <div className="rounded-xl border border-line bg-panel p-4 lg:col-span-3">
                <p className="text-[13px] font-semibold text-fg">This week</p>
                <p className="mb-4 text-xs text-fg-subtle">Attempts per day</p>
                <ActivityBars data={week} height={120} />
              </div>
              <div className="rounded-xl border border-line bg-panel lg:col-span-2">
                <p className="border-b border-line px-4 py-3 text-[13px] font-semibold text-fg">Leaderboard</p>
                <ul>
                  {leaders.slice(0, 5).map((u, i) => (
                    <li key={u.id} className="flex items-center gap-2.5 border-b border-line px-4 py-2 text-[13px] last:border-0">
                      <span className="w-4 tabular-nums text-fg-subtle">{i + 1}</span>
                      <Avatar name={u.name} avatarId={u.avatarId} size={22} />
                      <span className="min-w-0 flex-1 truncate text-fg">{u.name}</span>
                      <span className="tabular-nums text-fg-muted">{u.xp.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-fg-subtle">
          Live preview built from the app&apos;s own components, using a demo learner&apos;s practice data.
        </p>
      </Reveal>
    </section>
  );
}
