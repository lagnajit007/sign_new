import { Check } from "lucide-react";
import type { LandingPreview } from "@/lib/landing-preview";
import { Avatar } from "@/components/app/avatar";
import { Flame } from "@/components/art/flame";
import { HandMesh } from "@/components/art/hand-mesh";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

/**
 * Bento: one hero tile (feedback) and four supporting tiles of different kinds:
 * an object (streak), a stat (36 signs), a component (leaderboard) and a
 * diagram (privacy). One frame for all tiles; copy is a run-in line outside
 * the picture, at page size.
 */

function Tile({
  lead,
  rest,
  className,
  pictureClassName,
  delay = 0,
  children,
}: {
  lead: string;
  rest: string;
  className?: string;
  pictureClassName?: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <Reveal delay={delay} className={cn("flex", className)}>
      <article className="flex w-full flex-col overflow-hidden rounded-[22px] bg-[var(--mk-tile)]">
        <div className={cn("relative flex-1", pictureClassName)}>{children}</div>
        <p className="px-7 pb-7 pt-5 text-[17px] leading-snug text-fg-subtle sm:px-8 sm:pb-8">
          <strong className="font-semibold text-fg">{lead}</strong> {rest}
        </p>
      </article>
    </Reveal>
  );
}

const WEEK = ["M", "T", "W", "T", "F", "S", "S"];

export default function Features({ leaders }: { leaders: LandingPreview["leaders"] | null }) {
  return (
    <section id="features" className="scroll-mt-20 px-4 sm:px-6" style={{ paddingTop: "var(--mk-section-y)" }} aria-labelledby="features-heading">
      <div className="mx-auto max-w-[1080px]">
        <Reveal className="max-w-2xl">
          <h2 id="features-heading" className="mk-h2 text-fg">
            Everything you need to practise.<br className="hidden sm:block" /> Nothing you don&apos;t.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-6 md:grid-rows-[auto_auto_auto]">
          {/* Hero tile: the camera panel hung from the top-right corner. */}
          <Tile
            className="md:col-span-4 md:row-span-2"
            pictureClassName="min-h-[340px] md:min-h-[440px]"
            lead="Feedback on every sign."
            rest="Hold a letter and see what Sanjog reads, with a confidence score."
          >
            <div
              aria-hidden
              className="absolute bottom-0 left-7 right-0 top-7 overflow-hidden rounded-tl-[14px] bg-[#0d0d10] shadow-[var(--mk-shadow-window)] sm:left-10 sm:top-10"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_45%_45%,rgb(255_255_255/0.07),transparent_70%)]" />
              <HandMesh sign="L" className="absolute left-[38%] top-1/2 h-[82%] w-auto -translate-x-1/2 -translate-y-1/2 text-[#a78bfa]" />
              <div className="absolute bottom-6 left-6 flex h-10 items-center gap-3 rounded-full bg-white px-4 text-[14px] shadow-[0_8px_24px_-8px_rgb(0_0_0/0.6)]">
                <span className="font-semibold text-fg">L</span>
                <span className="tabular-nums text-fg-muted">94%</span>
                <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                  <Check className="size-3.5" strokeWidth={2.6} /> Correct
                </span>
              </div>
            </div>
          </Tile>

          {/* Object: the streak flame and this week. */}
          <Tile
            className="md:col-span-2"
            pictureClassName="flex min-h-[188px] flex-col items-center justify-center gap-4 pt-6"
            delay={0.08}
            lead="Streaks that stick."
            rest="A few minutes a day keeps it going."
          >
            <Flame size={52} animated={false} />
            <div className="flex gap-1.5" aria-hidden>
              {WEEK.map((d, i) => (
                <span
                  key={i}
                  className={cn(
                    "grid size-7 place-items-center rounded-full text-[11px] font-medium",
                    i < 4 ? "bg-zinc-800 text-white" : i === 4 ? "bg-brand text-white" : "bg-white text-fg-subtle shadow-[inset_0_0_0_1px_var(--sj-line)]",
                  )}
                >
                  {d}
                </span>
              ))}
            </div>
          </Tile>

          {/* Stat: one real number at display size. */}
          <Tile
            className="md:col-span-2"
            pictureClassName="flex min-h-[188px] items-center px-7 pt-8 sm:px-8"
            delay={0.16}
            lead="Every handshape."
            rest="All 26 letters and the numbers 0 to 9."
          >
            <div className="whitespace-nowrap text-[104px] font-semibold leading-none tracking-[-0.05em] text-fg">
              36 <span className="text-[22px] font-medium tracking-[-0.01em] text-fg-subtle">signs</span>
            </div>
          </Tile>

          {/* Component: the top of the leaderboard, on a card hung from the top edge. */}
          <Tile
            className="md:col-span-2"
            pictureClassName="flex min-h-[180px] items-center px-7 pt-7 sm:px-8"
            delay={0.08}
            lead="Learn alongside others."
            rest="Weekly leaderboards you can leave anytime."
          >
            {leaders && leaders.length > 0 ? (
              <ol className="w-full rounded-[14px] bg-white px-4 py-2 shadow-[var(--mk-shadow-window)]" aria-hidden>
                {leaders.slice(0, 3).map((u, i) => (
                  <li key={u.id} className="flex items-center gap-3 py-2 text-[14px]">
                    <span className="w-3 text-fg-subtle tabular-nums">{i + 1}</span>
                    <Avatar name={u.name} avatarId={u.avatarId} size={24} />
                    <span className="min-w-0 flex-1 truncate text-fg">{u.name.split(" ")[0]}</span>
                    <span className="text-fg-muted tabular-nums">{u.xp.toLocaleString()}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-[15px] text-fg-subtle">Be the first on the board.</p>
            )}
          </Tile>

          {/* Diagram: what leaves your device. */}
          <Tile
            className="md:col-span-4"
            pictureClassName="flex min-h-[180px] items-center justify-center px-7 pt-7 sm:px-10"
            delay={0.16}
            lead="Private by design."
            rest="Your video never leaves your device. Only 42 numbers describing your hand are checked."
          >
            <ol className="flex w-full max-w-lg flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-0" aria-label="What leaves your device">
              <li className="rounded-[14px] bg-white px-5 py-4 shadow-[var(--mk-shadow-window)]">
                <span className="block text-[15px] font-medium text-fg">Your browser</span>
                <span className="text-[13px] text-fg-subtle">Camera and tracking</span>
              </li>
              <li className="flex flex-1 flex-row items-center gap-3 px-5 text-[12px] text-fg-subtle sm:flex-col sm:gap-0 sm:px-3">
                <span className="order-2 tabular-nums sm:order-none sm:mb-1.5">42 numbers</span>
                <span aria-hidden className="relative h-6 w-px bg-line-strong sm:h-px sm:w-full">
                  <span className="absolute -bottom-0.5 -left-[3px] size-[7px] rounded-full bg-brand sm:-right-0.5 sm:-top-[3px] sm:bottom-auto sm:left-auto" />
                </span>
              </li>
              <li className="rounded-[14px] bg-white px-5 py-4 shadow-[var(--mk-shadow-window)]">
                <span className="block text-[15px] font-medium text-fg">Sanjog</span>
                <span className="text-[13px] text-fg-subtle">Checks and saves</span>
              </li>
            </ol>
          </Tile>
        </div>
      </div>
    </section>
  );
}
