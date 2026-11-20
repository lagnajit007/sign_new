"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import type { LandingPreview } from "@/lib/landing-preview";
import { Avatar } from "@/components/app/avatar";
import { Flame } from "@/components/art/flame";
import { BASE, BONES, POSES } from "@/components/art/hand-poses";
import { BlurSwap, EASE_OUT, RollingNumber, SPRING, useBeats, useInViewOnce } from "@/components/motion";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

/**
 * Bento: one hero tile (feedback, with a short loop) and four supporting tiles
 * of different kinds: an object (streak), a stat (36), a component
 * (leaderboard) and a diagram (privacy). One frame for all tiles; copy is a
 * run-in line outside the picture. Each supporting tile does one small thing
 * once, as it arrives.
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
      <article className="flex w-full flex-col overflow-hidden rounded-[var(--mk-r-4)] bg-[var(--mk-tile)]">
        <div className={cn("relative flex-1", pictureClassName)}>{children}</div>
        <p className="px-7 pb-7 pt-5 text-[17px] leading-snug text-fg-subtle sm:px-8 sm:pb-8">
          <strong className="font-semibold text-fg">{lead}</strong> {rest}
        </p>
      </article>
    </Reveal>
  );
}

const MINI = [
  ["ready", 900],
  ["points", 1300],
  ["read", 1500],
  ["correct", 2200],
] as const;
const ORDER = [0, 1, 5, 9, 13, 17, 2, 6, 10, 14, 18, 3, 7, 11, 15, 19, 4, 8, 12, 16, 20];
const DELAY = Object.fromEntries(ORDER.map((p, k) => [p, k * 0.04]));

/** Hero tile: the camera panel hung from the top-right corner, playing a short read. */
function FeedbackDemo() {
  const root = useRef<HTMLDivElement>(null);
  const active = useInView(root, { margin: "-15% 0px" });
  const { beat, reduce } = useBeats(MINI, active, "correct");
  const pts = [...BASE, ...POSES.L];
  const on = beat !== "ready";
  const read = beat === "read" || beat === "correct";
  const ok = beat === "correct";
  return (
    <div
      ref={root}
      aria-hidden
      className="absolute inset-x-7 bottom-0 top-7 overflow-hidden rounded-t-[var(--mk-r-3)] bg-[#0d0d10] shadow-[var(--mk-shadow-window)] sm:inset-x-10 sm:top-10"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_50%_42%,rgb(255_255_255/0.07),transparent_70%)]" />
      <svg viewBox="0 0 100 100" className="absolute inset-x-0 top-[6%] mx-auto h-[62%] w-auto">
        {BONES.map(([a, b], k) => (
          <motion.line
            key={k}
            x1={pts[a][0]}
            y1={pts[a][1]}
            x2={pts[b][0]}
            y2={pts[b][1]}
            initial={false}
            animate={{ pathLength: on || reduce ? 1 : 0, opacity: on || reduce ? 1 : 0 }}
            transition={{ pathLength: { duration: 0.5, delay: on ? 0.45 + k * 0.018 : 0, ease: EASE_OUT }, opacity: { duration: 0.25, delay: on ? 0.4 : 0 } }}
            stroke={ok ? "rgb(110 231 183 / 0.85)" : "rgb(167 139 250 / 0.85)"}
            style={{ transition: "stroke 400ms" }}
            strokeWidth={0.8}
            strokeLinecap="round"
          />
        ))}
        {pts.map(([x, y], k) => (
          <motion.circle
            key={k}
            cx={x}
            cy={y}
            r={k === 0 ? 1.6 : 1.25}
            initial={false}
            animate={{ opacity: on || reduce ? 1 : 0, scale: on || reduce ? 1 : 0.4 }}
            transition={{ opacity: { duration: 0.25, delay: on ? DELAY[k] : 0 }, scale: { ...SPRING, delay: on ? DELAY[k] : 0 } }}
            fill={ok ? "#d1fae5" : "#ede9fe"}
            style={{ transition: "fill 400ms", transformBox: "fill-box", transformOrigin: "center" }}
          />
        ))}
      </svg>
      <div className="absolute inset-x-0 bottom-[12%] flex justify-center">
      <motion.div
        layout={!reduce}
        transition={SPRING}
        className="flex h-10 items-center gap-3 rounded-full bg-white px-4 text-[14px] shadow-[0_8px_24px_-8px_rgb(0_0_0/0.6)]"
      >
        <BlurSwap swapKey={read ? "read" : "wait"} className="gap-3">
          {read ? (
            <>
              <span className="font-semibold text-fg">L</span>
              <span className="flex items-baseline text-fg-muted">
                <RollingNumber value="94" play={read} />%
              </span>
            </>
          ) : (
            <span className="text-fg-muted">{on ? "Reading your hand…" : "Show your hand"}</span>
          )}
        </BlurSwap>
        {ok && (
          <motion.span
            className="inline-flex items-center gap-1 font-medium text-emerald-700"
            initial={{ opacity: 0, x: -6, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            <Check className="size-3.5" strokeWidth={2.6} /> Correct
          </motion.span>
        )}
      </motion.div>
      </div>
    </div>
  );
}

const WEEK = ["M", "T", "W", "T", "F", "S", "S"];

function StreakObject() {
  const [ref, inView] = useInViewOnce<HTMLDivElement>();
  const reduce = useReducedMotion();
  return (
    <div ref={ref} className="flex flex-col items-center gap-4" aria-hidden>
      <Flame size={52} animated={false} />
      <div className="flex gap-1.5">
        {WEEK.map((d, i) => {
          const done = i < 4;
          const today = i === 4;
          return (
            <span key={i} className="relative grid size-7 place-items-center">
              <span className={cn("absolute inset-0 rounded-full", done ? "bg-zinc-800" : "bg-white shadow-[inset_0_0_0_1px_var(--sj-line)]")} />
              {today && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-brand"
                  initial={reduce ? false : { scale: 0 }}
                  animate={{ scale: inView || reduce ? 1 : 0 }}
                  transition={{ ...SPRING, stiffness: 300, damping: 18, delay: 0.5 }}
                />
              )}
              <span className={cn("relative text-[11px] font-medium", done || today ? "text-white" : "text-fg-subtle")}>{d}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function PrivacyDiagram() {
  const [ref, inView] = useInViewOnce<HTMLOListElement>();
  const reduce = useReducedMotion();
  return (
    <ol ref={ref} className="flex w-full max-w-lg flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-0" aria-label="What leaves your device">
      <li className="rounded-[var(--mk-r-3)] bg-white px-5 py-4 shadow-[var(--mk-shadow-window)]">
        <span className="block text-[15px] font-medium text-fg">Your browser</span>
        <span className="text-[13px] text-fg-subtle">Camera and tracking</span>
      </li>
      <li className="flex flex-1 flex-row items-center gap-3 px-5 text-[12px] text-fg-subtle sm:flex-col sm:gap-0 sm:px-3">
        <span className="order-2 tabular-nums sm:order-none sm:mb-1.5">42 numbers</span>
        <span aria-hidden className="relative h-6 w-px bg-line-strong sm:h-px sm:w-full">
          {/* One dot travels once: the only thing that leaves the device. */}
          <motion.span
            className="absolute left-[-3px] top-[-3px] size-[7px] rounded-full bg-brand max-sm:left-[-3px] sm:top-[-3px]"
            initial={reduce ? false : { left: "0%", top: "-3px", opacity: 0 }}
            animate={inView || reduce ? { left: "calc(100% - 4px)", opacity: 1 } : {}}
            transition={{ duration: 1.4, delay: 0.4, ease: EASE_OUT }}
          />
        </span>
      </li>
      <li className="rounded-[var(--mk-r-3)] bg-white px-5 py-4 shadow-[var(--mk-shadow-window)]">
        <span className="block text-[15px] font-medium text-fg">Sanjog</span>
        <span className="text-[13px] text-fg-subtle">Checks and saves</span>
      </li>
    </ol>
  );
}

function StatRoll() {
  const [ref, inView] = useInViewOnce<HTMLDivElement>();
  return (
    <div ref={ref} className="flex items-baseline whitespace-nowrap text-[104px] font-semibold leading-none tracking-[-0.05em] text-fg">
      <RollingNumber value="36" play={inView} delay={0.2} />
      <span className="ml-3 text-[22px] font-medium tracking-[-0.01em] text-fg-subtle">signs</span>
    </div>
  );
}

export default function Features({ leaders }: { leaders: LandingPreview["leaders"] | null }) {
  return (
    <section id="features" className="mk-section scroll-mt-20" aria-labelledby="features-heading">
      <div className="px-4 sm:px-10 lg:px-14">
        <Reveal>
          <h2 id="features-heading" className="mk-runin max-w-[26ch]">
            <strong>Everything you need to practise.</strong> Nothing you don&apos;t.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-6">
          <Tile
            className="md:col-span-4 md:row-span-2"
            pictureClassName="min-h-[340px] md:min-h-[440px]"
            lead="Feedback on every sign."
            rest="Hold a letter and see what Sanjog reads, with a confidence score."
          >
            <FeedbackDemo />
          </Tile>

          <Tile
            className="md:col-span-2"
            pictureClassName="flex min-h-[188px] items-center justify-center pt-6"
            delay={0.1}
            lead="Streaks that stick."
            rest="A few minutes a day keeps it going."
          >
            <StreakObject />
          </Tile>

          <Tile
            className="md:col-span-2"
            pictureClassName="flex min-h-[188px] items-center px-7 pt-8 sm:px-8"
            delay={0.2}
            lead="Every handshape."
            rest="All 26 letters and the numbers 0 to 9."
          >
            <StatRoll />
          </Tile>

          <Tile
            className="md:col-span-2"
            pictureClassName="flex min-h-[180px] items-center px-7 pt-7 sm:px-8"
            delay={0.1}
            lead="Learn alongside others."
            rest="Weekly leaderboards you can leave anytime."
          >
            {leaders && leaders.length > 0 ? (
              <ol className="w-full rounded-[var(--mk-r-3)] bg-white px-4 py-2 shadow-[var(--mk-shadow-window)]" aria-hidden>
                {leaders.slice(0, 3).map((u, i) => (
                  <li key={u.id} className="flex items-center gap-3 py-2 text-[14px]">
                    <span className="w-3 text-fg-subtle tabular-nums">{i + 1}</span>
                    <Avatar name={u.name} avatarId={u.avatarId} size={24} />
                    <span className="min-w-0 flex-1 truncate text-fg">{u.name.split(" ")[0]}</span>
                    <span className="text-fg-muted tabular-nums">{u.xp.toLocaleString("en-US")}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-[15px] text-fg-subtle">Be the first on the board.</p>
            )}
          </Tile>

          <Tile
            className="md:col-span-4"
            pictureClassName="flex min-h-[180px] items-center justify-center px-7 pt-7 sm:px-10"
            delay={0.2}
            lead="Private by design."
            rest="Your video never leaves your device. Only 42 numbers describing your hand are checked."
          >
            <PrivacyDiagram />
          </Tile>
        </div>
      </div>
    </section>
  );
}
