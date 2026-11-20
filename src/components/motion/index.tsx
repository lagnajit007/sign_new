"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Small motion kit for the marketing surface. Everything animates transform,
 * opacity or filter only, springs rather than linear tweens, and falls back to
 * the final state for people who prefer reduced motion.
 */

export const SPRING = { type: "spring" as const, stiffness: 260, damping: 30, mass: 0.9 };
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** True once the element has entered the viewport. */
export function useInViewOnce<T extends Element>(margin = "0px 0px -12% 0px") {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { once: true, margin: margin as `${number}px` });
  return [ref, inView] as const;
}

/** Fade-and-rise on first scroll into view, on a spring. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ ...SPRING, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Per-digit vertical roll. Each digit is a column 0–9 that springs to its
 * value; separators stay put. `play` starts it (e.g. when in view).
 */
export function RollingNumber({ value, play = true, className, delay = 0 }: { value: string; play?: boolean; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  const chars = [...value];
  let digitIndex = 0;
  return (
    <span className={className} aria-label={value} role="text">
      <span aria-hidden className="inline-flex tabular-nums">
        {chars.map((c, i) => {
          if (!/\d/.test(c))
            return (
              <span key={i} className="inline-block h-[1em] leading-none">
                {c}
              </span>
            );
          const d = Number(c);
          const k = digitIndex++;
          return (
            // The invisible digit sizes the slot to the font's own width; the column rolls over it.
            <span key={i} className="relative inline-block h-[1em] overflow-hidden leading-none">
              <span className="invisible">{c}</span>
              <motion.span
                className="absolute inset-x-0 top-0 flex flex-col"
                initial={false}
                animate={{ y: `${-(reduce || play ? d : 0)}em` }}
                transition={reduce ? { duration: 0 } : { ...SPRING, stiffness: 140, damping: 22, delay: delay + k * 0.06 }}
              >
                {Array.from({ length: 10 }, (_, n) => (
                  <span key={n} className="block h-[1em] text-center leading-none">
                    {n}
                  </span>
                ))}
              </motion.span>
            </span>
          );
        })}
      </span>
    </span>
  );
}

/** Text that changes state: the old line blurs out as the new one blurs in. */
export function BlurSwap({ swapKey, children, className }: { swapKey: string; children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className={`relative inline-grid ${className ?? ""}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={swapKey}
          className="col-start-1 row-start-1 inline-flex items-center gap-[inherit] whitespace-nowrap"
          initial={reduce ? false : { opacity: 0, y: 4, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? undefined : { opacity: 0, y: -4, filter: "blur(6px)" }}
          transition={{ duration: 0.32, ease: EASE_OUT }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * Drives a looping sequence of named beats while `active` is true. Each beat
 * has a duration in ms; the loop returns to the first beat. Reduced motion
 * parks on `poster`.
 */
export function useBeats<B extends string>(beats: readonly (readonly [B, number])[], active: boolean, poster: B) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    if (reduce || !active) return;
    const t = setTimeout(() => {
      if (i === beats.length - 1) setCycle((c) => c + 1);
      setI((n) => (n + 1) % beats.length);
    }, beats[i][1]);
    return () => clearTimeout(t);
  }, [i, active, reduce, beats]);
  return { beat: reduce ? poster : beats[i][0], cycle, reduce: !!reduce };
}
