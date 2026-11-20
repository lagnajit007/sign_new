"use client";

import { motion, useReducedMotion } from "motion/react";
import type { LandingPreview } from "@/lib/landing-preview";
import { Avatar } from "@/components/app/avatar";
import { RollingNumber, SPRING, useInViewOnce } from "@/components/motion";

const SIGNS = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"];

/**
 * The dashboard, simplified: four numbers that roll in once, a quiet weekly
 * chart whose bars grow once (today lands last, in full violet), and the top
 * three learners. Calm on purpose: no loops, no camera moves.
 */
export default function PreviewBody({ data }: { data: LandingPreview }) {
  const { learner, stats, week, leaders } = data;
  const [ref, inView] = useInViewOnce<HTMLDivElement>("0px 0px -20% 0px");
  const reduce = useReducedMotion();
  const play = inView || !!reduce;
  const figures = [
    { label: "Total XP", value: learner.xp.toLocaleString("en-US"), unit: "" },
    { label: "Streak", value: String(learner.streakDays), unit: " days" },
    { label: "Signs mastered", value: String(stats.mastered), unit: " / 36" },
    { label: "Accuracy", value: String(stats.accuracy), unit: "%" },
  ];
  const max = Math.max(1, ...week.map((d) => d.total));

  return (
    <div ref={ref} className="pointer-events-none select-none bg-canvas" aria-hidden>
      <dl className="grid grid-cols-2 lg:grid-cols-4">
        {figures.map((f, i) => (
          <div
            key={f.label}
            className={`px-6 py-7 sm:px-8 ${i % 2 === 1 ? "border-l border-[var(--mk-rule)]" : ""} ${i >= 2 ? "border-t border-[var(--mk-rule)] lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}
          >
            <dt className="text-[13px] text-fg-subtle">{f.label}</dt>
            <dd className="mt-2 flex items-baseline whitespace-nowrap text-[30px] font-semibold tracking-[-0.02em] text-fg sm:text-[34px]">
              <RollingNumber value={f.value} play={play} delay={i * 0.08} />
              {f.unit && <span className="ml-0.5 text-[0.62em] font-medium text-fg-subtle">{f.unit.trim() === "%" ? "%" : f.unit}</span>}
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid border-t border-[var(--mk-rule)] lg:grid-cols-[1.55fr_1fr]">
        <div className="px-6 py-7 sm:px-8">
          <div className="text-[14px] font-medium text-fg">This week</div>
          <div className="mt-6 flex h-[132px] items-end gap-2">
            {week.map((d, i) => {
              const today = i === week.length - 1;
              return (
                <div key={i} className="flex h-full flex-1 flex-col justify-end gap-2">
                  <motion.div
                    className={`w-full origin-bottom rounded-[5px] ${today ? "bg-brand" : "bg-brand/25"}`}
                    style={{ height: `${Math.max(4, (d.highlight / max) * 100)}%` }}
                    initial={reduce ? false : { scaleY: 0 }}
                    animate={{ scaleY: play ? 1 : 0 }}
                    transition={{ ...SPRING, stiffness: 120, damping: 20, delay: 0.25 + i * 0.07 + (today ? 0.15 : 0) }}
                  />
                  <span className={`text-center text-[11px] ${today ? "font-medium text-fg" : "text-fg-subtle"}`}>{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="border-t border-[var(--mk-rule)] px-6 py-7 sm:px-8 lg:border-l lg:border-t-0">
          <div className="text-[14px] font-medium text-fg">Top learners</div>
          <ol className="mt-4">
            {leaders.slice(0, 3).map((u, i) => (
              <li key={u.id} className="flex items-center gap-3 py-2.5 text-[14px]">
                <span className="w-3 text-fg-subtle tabular-nums">{i + 1}</span>
                <Avatar name={u.name} avatarId={u.avatarId} size={26} />
                <span className="min-w-0 flex-1 truncate text-fg">{u.name}</span>
                <span className="text-fg-muted tabular-nums">{u.xp.toLocaleString("en-US")}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Filler past the plate's edge: the signs grid, the next thing on the real page. */}
      <div className="grid grid-cols-9 gap-2 border-t border-[var(--mk-rule)] px-6 py-7 sm:grid-cols-12 sm:px-8 lg:grid-cols-[repeat(18,minmax(0,1fr))]">
        {SIGNS.map((s, k) => (
          <span key={s} className={`h-9 rounded-md ${k < stats.mastered ? "bg-[#efeff1]" : "border border-line"}`} />
        ))}
      </div>
    </div>
  );
}
