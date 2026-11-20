"use client";

import Image from "next/image";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useRef } from "react";
import { Check } from "lucide-react";
import { BASE, BONES, POSES } from "@/components/art/hand-poses";
import { BlurSwap, EASE_OUT, RollingNumber, SPRING, useBeats } from "@/components/motion";

/**
 * The practice screen as a looping hero demo. Four beats, and every change has
 * a cause: the hand appears and its 21 points are found, the model reads it
 * (confidence rolls up while the camera leans in on the result), it's correct,
 * then the hand drops (the cause of the reset) and the next letter arrives.
 * Reduced motion shows the "correct" beat for L as a still.
 */

const SEQUENCE = ["L", "B", "A"] as const;
const CONFIDENCE: Record<string, number> = { A: 91, B: 88, L: 94 };
const LESSON_INDEX: Record<string, number> = { A: 1, B: 2, L: 12 };
const BEATS = [
  ["ready", 1300],
  ["landmarks", 1500],
  ["reading", 1600],
  ["correct", 2600],
  ["drop", 800],
] as const;
type Beat = (typeof BEATS)[number][0];

// Points appear wrist first, then knuckles, then out to the fingertips.
const ORDER = [0, 1, 5, 9, 13, 17, 2, 6, 10, 14, 18, 3, 7, 11, 15, 19, 4, 8, 12, 16, 20];
const APPEAR_DELAY = Object.fromEntries(ORDER.map((p, k) => [p, k * 0.045]));

export default function HeroStage() {
  // The loop only runs while it's on screen.
  const root = useRef<HTMLDivElement>(null);
  const active = useInView(root, { margin: "-10% 0px" });
  const { beat, cycle, reduce } = useBeats<Beat>(BEATS, active, "correct");
  const sign = SEQUENCE[cycle % SEQUENCE.length];
  const pts = [...BASE, ...POSES[sign]];
  const handOn = beat !== "ready" && beat !== "drop";
  const read = beat === "reading" || beat === "correct" || beat === "drop";
  const ok = beat === "correct" || beat === "drop";
  const pushIn = beat === "reading" || beat === "correct";
  const conf = CONFIDENCE[sign];

  return (
    <div ref={root} className="grid h-full grid-cols-1 gap-3 bg-[#f6f6f7] p-3 sm:grid-cols-[0.8fr_1.2fr] sm:gap-4 sm:p-4">
      {/* Lesson side: the reference for the sign being practised. */}
      <div className="hidden flex-col rounded-[var(--mk-r-2)] bg-canvas p-5 shadow-[0_0_0_1px_rgb(24_24_27/0.05)] sm:flex">
        <BlurSwap swapKey={`meta-${sign}`} className="text-[12px] text-fg-subtle">
          Letter {LESSON_INDEX[sign]} of 26
        </BlurSwap>
        <BlurSwap swapKey={`title-${sign}`} className="mt-1 text-[22px] font-semibold tracking-tight text-fg">
          Learn {sign}
        </BlurSwap>
        <div className="relative mt-3 h-[56%]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={sign}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
            >
              <Image src={`/signs/${sign}.svg`} alt="" width={220} height={220} className="h-[min(80%,240px)] w-auto" />
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

      {/* Camera side. */}
      <div className="relative overflow-hidden rounded-[var(--mk-r-2)] bg-[#0d0d10]">
        <motion.div
          className="absolute inset-0"
          style={{ transformOrigin: "50% 78%" }}
          animate={{ scale: pushIn && !reduce ? 1.06 : 1 }}
          transition={{ duration: 1.4, ease: EASE_OUT }}
        >
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_42%,rgb(255_255_255/0.06),transparent_70%)]" />

          <svg viewBox="0 0 100 100" className="absolute inset-x-0 top-[5%] mx-auto h-[56%] w-auto" aria-hidden>
            {BONES.map(([a, b], k) => (
              <motion.line
                key={k}
                initial={false}
                animate={{
                  x1: pts[a][0], y1: pts[a][1], x2: pts[b][0], y2: pts[b][1],
                  pathLength: handOn || reduce ? 1 : 0,
                  opacity: handOn || reduce ? 1 : 0,
                }}
                transition={{
                  default: SPRING,
                  pathLength: { duration: 0.6, delay: handOn ? 0.55 + k * 0.02 : 0, ease: EASE_OUT },
                  opacity: { duration: 0.3, delay: handOn ? 0.5 : 0 },
                }}
                stroke={ok ? "rgb(110 231 183 / 0.85)" : "rgb(167 139 250 / 0.85)"}
                style={{ transition: "stroke 400ms" }}
                strokeWidth={0.8}
                strokeLinecap="round"
              />
            ))}
            {pts.map(([x, y], k) => (
              <motion.circle
                key={k}
                initial={false}
                animate={{
                  cx: x,
                  cy: handOn || reduce ? y : y + 6,
                  opacity: handOn || reduce ? 1 : 0,
                  scale: handOn || reduce ? 1 : 0.4,
                }}
                transition={{
                  default: SPRING,
                  opacity: { duration: 0.28, delay: handOn ? APPEAR_DELAY[k] : 0.01 * k },
                  scale: { ...SPRING, delay: handOn ? APPEAR_DELAY[k] : 0 },
                }}
                r={k === 0 ? 1.6 : 1.25}
                fill={ok ? "#d1fae5" : "#ede9fe"}
                style={{ transition: "fill 400ms", transformBox: "fill-box", transformOrigin: "center" }}
              />
            ))}
          </svg>

          {/* The one piece of feedback; it resizes smoothly as its content changes. */}
          <div className="absolute inset-x-0 bottom-[22%] flex justify-center" aria-live="polite">
            <motion.div
              layout={!reduce}
              transition={SPRING}
              className="flex h-11 items-center gap-3 overflow-hidden rounded-full bg-white px-4 text-[14px] shadow-[0_10px_30px_-10px_rgb(0_0_0/0.7)]"
            >
              <BlurSwap swapKey={read ? "read" : beat === "landmarks" ? "finding" : "ready"} className="gap-3">
                {read ? (
                  <>
                    <span className="font-semibold text-fg">{sign}</span>
                    <span className="relative h-1.5 w-20 overflow-hidden rounded-full bg-zinc-200">
                      <motion.span
                        className={`absolute inset-y-0 left-0 w-full origin-left rounded-full ${ok ? "bg-emerald-500" : "bg-brand"}`}
                        style={{ transition: "background-color 400ms" }}
                        initial={false}
                        animate={{ scaleX: read ? conf / 100 : 0 }}
                        transition={{ duration: reduce ? 0 : 1.2, ease: EASE_OUT }}
                      />
                    </span>
                    <span className="flex items-baseline text-fg-muted">
                      <RollingNumber value={String(conf)} play={read} />%
                    </span>
                  </>
                ) : beat === "landmarks" ? (
                  <span className="text-fg-muted">Reading your hand…</span>
                ) : (
                  <span className="text-fg-muted">Show your hand</span>
                )}
              </BlurSwap>
              <AnimatePresence initial={false}>
                {ok && (
                  <motion.span
                    key="ok"
                    className="inline-flex items-center gap-1 font-medium text-emerald-700"
                    initial={{ opacity: 0, x: -6, filter: "blur(4px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(4px)" }}
                    transition={{ duration: 0.3, ease: EASE_OUT }}
                  >
                    <Check className="size-3.5" strokeWidth={2.6} aria-hidden /> Correct
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
