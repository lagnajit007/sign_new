"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Animated illustration of the lesson view: a 21-point hand skeleton (the
 * same landmark layout the real hand tracker produces) morphs between signs
 * while the confidence meter fills. It's a drawing, not a recording, and is
 * labelled as such.
 */

type Pt = [number, number];
const BASE: Pt[] = [[50, 90]];

// Landmarks 1–20 per sign, in a 100×100 box (y grows downward).
const POSES: Record<string, Pt[]> = {
  "5": [
    [38, 82], [30, 72], [25, 63], [21, 55],
    [40, 55], [37, 40], [35, 30], [33, 21],
    [50, 53], [50, 37], [50, 26], [50, 16],
    [59, 55], [61, 40], [63, 30], [64, 22],
    [67, 59], [71, 47], [74, 40], [76, 33],
  ],
  B: [
    [42, 82], [44, 74], [50, 70], [56, 68],
    [42, 55], [42, 40], [42, 30], [42, 21],
    [50, 53], [50, 38], [50, 27], [50, 17],
    [58, 55], [58, 40], [58, 30], [58, 22],
    [65, 59], [65, 45], [65, 37], [65, 30],
  ],
  A: [
    [38, 82], [33, 72], [32, 62], [33, 53],
    [40, 55], [39, 46], [43, 54], [45, 61],
    [50, 53], [50, 44], [52, 53], [53, 61],
    [59, 55], [59, 46], [60, 55], [60, 62],
    [67, 59], [66, 51], [66, 58], [65, 64],
  ],
  L: [
    [37, 80], [27, 74], [19, 70], [11, 67],
    [40, 55], [39, 40], [38, 30], [37, 20],
    [50, 53], [50, 46], [52, 55], [53, 62],
    [59, 55], [59, 47], [60, 56], [60, 63],
    [67, 59], [66, 52], [66, 59], [65, 65],
  ],
};
const SEQUENCE = ["A", "B", "L", "5"] as const;
const CONFIDENCE: Record<string, number> = { A: 0.91, B: 0.88, L: 0.94, "5": 0.86 };

const BONES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20],
];

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
                className={phase === "correct" ? "h-full rounded-full bg-emerald-400" : "h-full rounded-full bg-white/40"}
                initial={false}
                animate={{ width: `${conf * 100}%` }}
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
