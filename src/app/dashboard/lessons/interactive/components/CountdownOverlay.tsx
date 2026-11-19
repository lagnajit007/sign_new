"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FastForward, Pause } from "lucide-react";
import { stepDuration, type CountdownStep, type PauseReason } from "../practice-machine";

const R = 54;
const CIRC = 2 * Math.PI * R;

/**
 * Presentational 3-2-1-GO overlay. Timing lives in use-practice-session (one
 * timer); this only draws the current step. The ring depletes over each step.
 */
export default function CountdownOverlay({
  step,
  paused,
  targetSign,
  imageUrl,
  hasHandImage,
  onSkip,
}: {
  step: CountdownStep;
  paused: PauseReason | null;
  targetSign: string;
  imageUrl: string;
  hasHandImage: boolean;
  onSkip: () => void;
}) {
  const reduce = useReducedMotion();
  const ms = stepDuration(step);

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950/60" role="timer" aria-live="assertive">
      {/* Target reminder: what to make, visible during preparation */}
      <div className="absolute left-3 top-3 flex items-center gap-2.5 rounded-xl border border-white/10 bg-zinc-950/80 p-1.5 pr-3">
        <span className="grid size-11 place-items-center overflow-hidden rounded-lg bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className={hasHandImage ? "size-10 object-contain" : "size-9 object-contain"} />
        </span>
        <span className="text-xs text-white/60">
          Get ready for <span className="block text-sm font-semibold text-white">{targetSign}</span>
        </span>
      </div>

      {!paused && (
        <button
          type="button"
          onClick={onSkip}
          className="absolute right-3 top-3 inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/10 px-3 text-xs font-medium text-white/85 transition-colors hover:bg-white/20 hover:text-white"
        >
          <FastForward className="size-3.5" aria-hidden />
          Skip <span className="text-white/50">Space</span>
        </button>
      )}

      {paused ? (
        <div className="flex flex-col items-center gap-3 px-6 text-center">
          <span className="grid size-14 place-items-center rounded-full border border-white/15 text-white/80">
            <Pause className="size-6" aria-hidden />
          </span>
          <p className="text-sm font-medium text-white">Paused</p>
          <p className="max-w-xs text-xs text-white/60">
            {paused === "tab-hidden" ? "Come back to this tab to continue the countdown." : "Your camera disconnected. Reconnect it to continue."}
          </p>
        </div>
      ) : (
        <div className="relative grid size-36 place-items-center lg:size-44">
          <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90" aria-hidden>
            <circle cx="60" cy="60" r={R} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="3" />
            {step !== "go" && (
              <circle
                key={`${step}`}
                cx="60"
                cy="60"
                r={R}
                fill="none"
                stroke="var(--sj-brand-hover)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={0}
                style={reduce ? undefined : { animation: `sj-ring-deplete ${ms}ms linear forwards` }}
              />
            )}
          </svg>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={String(step)}
              initial={reduce ? false : { scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reduce ? undefined : { scale: 1.15, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={
                step === "go"
                  ? "font-display text-5xl font-semibold tracking-tight text-emerald-300 lg:text-6xl"
                  : "font-display text-6xl font-semibold tabular-nums text-white lg:text-7xl"
              }
            >
              {step === "go" ? "Go" : step}
            </motion.span>
          </AnimatePresence>
        </div>
      )}

      {!paused && <p className="mt-5 text-xs text-white/70">Put your hand in the guide and make the sign</p>}
      <span className="sr-only">{paused ? "Countdown paused" : step === "go" ? "Go" : `${step}`}</span>
    </div>
  );
}
