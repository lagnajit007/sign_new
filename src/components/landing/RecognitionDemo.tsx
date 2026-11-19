"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Animated illustration of the lesson view: a 21-point hand skeleton (the
 * same landmark layout the real hand tracker produces) morphs between signs
 * while the confidence meter fills. It's a drawing, not a recording, and is
 * labelled as such.
 */

import { BASE, BONES, POSES } from "@/components/art/hand-poses";

const SEQUENCE = ["A", "B", "L", "5"] as const;
const CONFIDENCE: Record<string, number> = { A: 0.91, B: 0.88, L: 0.94, "5": 0.86 };

export default function RecognitionDemo() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<"reading" | "correct">("reading");

  useEffect(() => {
    if (reduce) {
      setPhase("correct");
      return;
    }
    setPhase("reading");
    const t1 = setTimeout(() => setPhase("correct"), 1400);
    const t2 = setTimeout(() => setI((n) => (n + 1) % SEQUENCE.length), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [i, reduce]);

  const sign = SEQUENCE[i];
  const pts = [...BASE, ...POSES[sign]];
  const conf = phase === "correct" ? CONFIDENCE[sign] : 0.35;
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 120, damping: 18 };

  return (
    <div className="relative h-full w-full bg-gradient-to-br from-zinc-900 to-zinc-800">
      <svg viewBox="0 0 100 100" className="absolute inset-0 m-auto h-[82%] w-auto" aria-hidden>
        {BONES.map(([a, b], k) => (
          <motion.line
            key={k}
            initial={false}
            animate={{ x1: pts[a][0], y1: pts[a][1], x2: pts[b][0], y2: pts[b][1] }}
            transition={spring}
            stroke="rgb(155 133 255 / 0.9)"
            strokeWidth={0.9}
            strokeLinecap="round"
          />
        ))}
        {pts.map(([x, y], k) => (
          <motion.circle
            key={k}
            initial={false}
            animate={{ cx: x, cy: y }}
            transition={spring}
            r={k === 0 ? 1.8 : 1.4}
            fill={k % 4 === 0 ? "#ffffff" : "#b9a8ff"}
          />
        ))}
      </svg>

      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-black/50 px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm">
        Target: <span className="font-semibold text-white">{sign}</span>
      </div>
      <div className="absolute right-4 top-4 rounded-md bg-white/10 px-2 py-1 text-[10px] uppercase tracking-wide text-white/60">
        Illustration
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center gap-3 rounded-xl bg-black/55 px-4 py-3 backdrop-blur-sm">
          <div className="flex-1">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-white/70">Recognition confidence</span>
              <span className="text-xs font-bold tabular-nums text-white">{Math.round(conf * 100)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className={phase === "correct" ? "h-full origin-left rounded-full bg-emerald-400" : "h-full origin-left rounded-full bg-white/40"}
                initial={false}
                animate={{ scaleX: conf }}
                transition={reduce ? { duration: 0 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
          <div className="w-16 text-right text-xs" aria-live="polite">
            {phase === "correct" ? (
              <span className="font-medium text-emerald-400">Correct ✓</span>
            ) : (
              <span className="text-white/60">Reading…</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
