"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Trophy } from "lucide-react";
import { celebrate } from "@/lib/celebrate";

/** End-of-set summary with real numbers (no frame-based "accuracy"). */
export default function CompletionScreen({
  lessonLabel,
  masteredThisSession,
  firstTry,
  xp,
  seconds,
  onRestart,
}: {
  lessonLabel: string;
  masteredThisSession: number;
  firstTry: number;
  xp: number;
  seconds: number;
  onRestart: () => void;
}) {
  const reduce = useReducedMotion();
  const trophyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (masteredThisSession > 0) celebrate(trophyRef.current);
  }, [masteredThisSession]);

  const stats = [
    { label: "Signs mastered", value: masteredThisSession },
    { label: "First try", value: firstTry },
    { label: "XP earned", value: `+${xp}` },
    { label: "Time", value: `${Math.floor(seconds / 60)}m ${seconds % 60}s` },
  ];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="complete-title">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-2xl border border-line bg-panel p-6 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.5)]"
      >
        <div ref={trophyRef} className="mx-auto grid size-14 place-items-center rounded-full bg-brand-tint text-brand">
          <Trophy className="size-6" aria-hidden />
        </div>
        <h2 id="complete-title" className="mt-4 text-center font-display text-xl font-semibold tracking-tight text-fg">
          {lessonLabel} complete
        </h2>
        <p className="mt-1 text-center text-sm text-fg-muted">Nice work. Here&apos;s this session.</p>
        <dl className="mt-6 grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-line bg-canvas p-3">
              <dt className="text-xs text-fg-subtle">{s.label}</dt>
              <dd className="mt-1 font-display text-xl font-semibold tabular-nums text-fg">{s.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 grid gap-2">
          <button
            type="button"
            onClick={onRestart}
            autoFocus
            className="h-10 rounded-lg bg-brand text-sm font-medium text-brand-fg transition-colors hover:bg-brand-hover"
          >
            Practise this set again
          </button>
          <Link href="/dashboard/lessons" className="grid h-10 place-items-center rounded-lg border border-line text-sm font-medium text-fg hover:bg-subtle">
            Back to lessons
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
