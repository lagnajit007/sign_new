import { Check } from "lucide-react";
import type { LandingPreview } from "@/lib/landing-preview";
import { Avatar } from "@/components/app/avatar";
import { Flame } from "@/components/art/flame";
import { HandMesh } from "@/components/art/hand-mesh";
import { Reveal } from "./reveal";

const SIGNS = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"];
// Decorative "progress" pattern for the tile grid (not a real user's data).
const SHOWN_MASTERED = new Set([..."ABCDEFGHIL0125"]);

function Card({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-panel">
      <div className="relative flex min-h-44 flex-1 items-center justify-center bg-canvas p-6">{children}</div>
      <div className="border-t border-line p-5">
        <h3 className="text-[15px] font-semibold text-fg">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-fg-muted">{body}</p>
      </div>
    </div>
  );
}

export default function Features({ leaders }: { leaders: LandingPreview["leaders"] | null }) {
  return (
    <section id="features" className="scroll-mt-20 border-y border-line bg-panel/60 py-20 md:py-28" aria-labelledby="features-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="max-w-2xl">
          <h2 id="features-heading" className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Everything you need to practise, nothing you don&apos;t
          </h2>
          <p className="mt-3 text-[16px] text-fg-muted">A focused tool for learning the alphabet and numbers by hand.</p>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-6">
          <Reveal className="md:col-span-4">
            <Card
              title="Feedback on every sign"
              body="A trained model reads 21 points on your hand and names the sign it sees, with a confidence score. A sign counts at 70% or more."
            >
              <div className="flex w-full max-w-md items-center gap-6" aria-hidden>
                <HandMesh sign="L" className="size-28 shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-fg-muted">
                      Target <span className="font-semibold text-fg">L</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-positive-tint px-1.5 py-0.5 text-xs font-medium text-positive">
                      <Check className="size-3" /> Correct
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-subtle">
                    <div className="h-full w-[94%] rounded-full bg-brand" />
                  </div>
                  <div className="flex justify-between text-xs text-fg-subtle">
                    <span>Recognised as L</span>
                    <span className="tabular-nums">94%</span>
                  </div>
                </div>
              </div>
            </Card>
          </Reveal>

          <Reveal className="md:col-span-2" delay={0.05}>
            <Card title="Streaks that stick" body="Practise a little each day. Your streak and XP grow with every correct sign.">
              <div className="flex flex-col items-center gap-3" aria-hidden>
                <Flame size={56} />
                <div className="flex gap-1.5">
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <span
                      key={i}
                      className={`grid size-6 place-items-center rounded-md text-[10px] font-medium ${i < 5 ? "bg-brand-tint text-brand" : "bg-subtle text-fg-subtle"}`}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </Reveal>

          <Reveal className="md:col-span-3">
            <Card title="All 36 signs" body="Work through A–Z and 0–9 at your own pace. A sign is mastered the first time it's recognised.">
              <div className="grid grid-cols-9 gap-1.5" aria-hidden>
                {SIGNS.map((s) => (
                  <span
                    key={s}
                    className={`grid size-7 place-items-center rounded-md text-xs font-semibold ${SHOWN_MASTERED.has(s) ? "bg-brand-tint text-brand" : "border border-line text-fg-subtle"}`}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </Card>
          </Reveal>

          <Reveal className="md:col-span-3" delay={0.05}>
            <Card title="Learn alongside others" body="Weekly and all-time leaderboards. Hide yourself any time in Settings.">
              {leaders && leaders.length > 0 ? (
                <ul className="w-full max-w-xs space-y-2" aria-hidden>
                  {leaders.slice(0, 3).map((u, i) => (
                    <li key={u.id} className="flex items-center gap-2.5 rounded-lg border border-line bg-panel px-3 py-2 text-[13px]">
                      <span className="w-3 tabular-nums text-fg-subtle">{i + 1}</span>
                      <Avatar name={u.name} avatarId={u.avatarId} size={22} />
                      <span className="min-w-0 flex-1 truncate text-fg">{u.name}</span>
                      <span className="rounded bg-subtle px-1 text-[10px] text-fg-muted">Demo</span>
                      <span className="tabular-nums text-fg-muted">{u.xp.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-fg-subtle">Be the first on the board.</p>
              )}
            </Card>
          </Reveal>

          <Reveal className="md:col-span-6">
            <div className="grid items-center gap-6 rounded-2xl border border-line bg-panel p-6 md:grid-cols-[1fr_auto] md:p-8">
              <div>
                <h3 className="text-[15px] font-semibold text-fg">Private by design</h3>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-fg-muted">
                  Your video never leaves your device. Hand tracking and recognition run in your browser; when you finish a
                  sign, only 42 numbers describing your hand&apos;s shape are sent to check it.
                </p>
              </div>
              <ol className="flex items-center gap-2 text-xs sm:gap-3" aria-label="What leaves your device">
                <li className="rounded-xl border border-line bg-canvas px-3 py-2.5 text-center">
                  <span className="block font-medium text-fg">Your browser</span>
                  <span className="text-fg-subtle">video + tracking</span>
                </li>
                <li className="flex flex-col items-center text-fg-subtle">
                  <span className="text-[10px]">42 numbers</span>
                  <span aria-hidden className="h-px w-10 bg-line-strong sm:w-16" />
                </li>
                <li className="rounded-xl border border-line bg-canvas px-3 py-2.5 text-center">
                  <span className="block font-medium text-fg">Sanjog</span>
                  <span className="text-fg-subtle">checks + saves result</span>
                </li>
              </ol>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
