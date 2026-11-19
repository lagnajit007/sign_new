"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { BASE, BONES, POSES } from "@/components/art/hand-poses";

/**
 * The practice screen, simplified to what the story needs: the reference for
 * the current letter on the left, the tracked hand on the right, and one
 * feedback chip. Everything moves because the hand moved: the hand forms the
 * sign, the chip reads it, then the next letter's reference arrives.
 * It's an illustration, not a recording (captioned outside the window).
 */

const SEQUENCE = ["L", "B", "A"] as const;
const CONFIDENCE: Record<string, number> = { A: 91, B: 88, L: 94 };
const LESSON_INDEX: Record<string, number> = { A: 1, B: 2, L: 12 };

export default function HeroStage() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [read, setRead] = useState(false);

  useEffect(() => {
    if (reduce) {
      setRead(true);
      return;
    }
    setRead(false);
    const t1 = setTimeout(() => setRead(true), 1300);
    const t2 = setTimeout(() => setI((n) => (n + 1) % SEQUENCE.length), 3600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [i, reduce]);

  const sign = SEQUENCE[i];
  const pts = [...BASE, ...POSES[sign]];
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 110, damping: 19 };
  const fade = reduce ? { duration: 0 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="grid h-full grid-cols-1 gap-3 bg-[#f6f6f7] p-3 sm:grid-cols-[0.82fr_1.18fr] sm:gap-4 sm:p-4">
      {/* Lesson side: the reference for the sign being practised. */}
      <div className="hidden flex-col rounded-[var(--mk-radius-inner)] bg-canvas p-5 shadow-[0_0_0_1px_rgb(24_24_27/0.05)] sm:flex">
        <div className="text-[12px] text-fg-subtle">
          Letter {LESSON_INDEX[sign]} of 26
        </div>
        <div className="mt-1 text-[22px] font-semibold tracking-tight text-fg">Learn {sign}</div>
        <div className="relative mt-2 h-[52%]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={sign}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={fade}
            >
              <Image src={`/signs/${sign}.svg`} alt="" width={220} height={220} className="h-[min(78%,240px)] w-auto" />
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Filler: the lesson's letter strip, quiet bars rather than words. */}
        <div className="mt-6 flex gap-1.5" aria-hidden>
          {Array.from({ length: 9 }, (_, k) => (
            <span key={k} className={`h-6 flex-1 rounded-[5px] ${k === 4 ? "bg-zinc-800" : "bg-[#efeff1]"}`} />
          ))}
        </div>
      </div>

      {/* Camera side: the tracked hand and the one piece of feedback. */}
      <div className="relative overflow-hidden rounded-[var(--mk-radius-inner)] bg-[#0d0d10]">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_45%,rgb(255_255_255/0.06),transparent_70%)]"
        />
        <svg viewBox="0 0 100 100" className="absolute inset-x-0 top-[6%] mx-auto h-[62%] w-auto" aria-hidden>
          {BONES.map(([a, b], k) => (
            <motion.line
              key={k}
              initial={false}
              animate={{ x1: pts[a][0], y1: pts[a][1], x2: pts[b][0], y2: pts[b][1] }}
              transition={spring}
              stroke={read ? "rgb(110 231 183 / 0.85)" : "rgb(167 139 250 / 0.85)"}
              style={{ transition: "stroke 300ms" }}
              strokeWidth={0.8}
              strokeLinecap="round"
            />
          ))}
          {pts.map(([x, y], k) => (
            <motion.circle
              key={k}
              initial={false}
              animate={{ cx: x, cy: y }}
              transition={spring}
              r={k === 0 ? 1.6 : 1.25}
              fill={read ? "#d1fae5" : "#ede9fe"}
              style={{ transition: "fill 300ms" }}
            />
          ))}
        </svg>

        <div className="absolute inset-x-0 bottom-[19%] flex justify-center" aria-live="polite">
          <motion.div
            layout={!reduce}
            transition={fade}
            className="flex h-10 items-center gap-3 rounded-full bg-white px-4 text-[14px] shadow-[0_8px_24px_-8px_rgb(0_0_0/0.6)]"
          >
            {read ? (
              <>
                <span className="font-semibold text-fg">{sign}</span>
                <span className="tabular-nums text-fg-muted">{CONFIDENCE[sign]}%</span>
                <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                  <Check className="size-3.5" strokeWidth={2.6} aria-hidden /> Correct
                </span>
              </>
            ) : (
              <span className="text-fg-muted">Reading your hand…</span>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
