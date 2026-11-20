"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { BASE, BONES, POSES } from "@/components/art/hand-poses";

/** The hand draws itself once as the band scrolls in: bones first, then the points light up. */
function DrawnHand() {
  const reduce = useReducedMotion();
  const pts = [...BASE, ...POSES.L];
  const view = { once: true, margin: "0px 0px -15% 0px" } as const;
  return (
    <motion.svg
      viewBox="0 0 100 100"
      aria-hidden
      className="h-full w-auto drop-shadow-[0_0_24px_rgb(167_139_250/0.45)]"
      // Ambient: the hand breathes, barely. A held pose is never perfectly still.
      animate={reduce ? undefined : { y: [0, -3, 0], rotate: [0, -1.2, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.6 }}
    >
      {BONES.map(([a, b], k) => (
        <motion.line
          key={k}
          x1={pts[a][0]}
          y1={pts[a][1]}
          x2={pts[b][0]}
          y2={pts[b][1]}
          stroke="#a78bfa"
          strokeOpacity={0.75}
          strokeWidth={0.7}
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={view}
          transition={{ duration: 0.5, delay: 0.2 + k * 0.03, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
      {pts.map(([x, y], k) => (
        <motion.circle
          key={k}
          cx={x}
          cy={y}
          r={k === 0 ? 1.5 : 1.15}
          fill={k % 4 === 0 ? "#ffffff" : "#ddd6fe"}
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={view}
          transition={{ duration: 0.3, delay: 0.7 + k * 0.025 }}
        />
      ))}
    </motion.svg>
  );
}

export default function FinalCTA() {
  return (
    <section className="px-3 py-3 sm:px-4 sm:py-4" aria-labelledby="cta-heading">
      <div className="relative overflow-hidden rounded-[var(--mk-r-5)] bg-[#0b0b0e] px-6 pb-20 pt-16 text-center sm:px-12 sm:pb-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[70%] bg-[radial-gradient(ellipse_45%_60%_at_50%_30%,rgb(124_92_255/0.22),transparent_70%)]"
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="relative mx-auto flex h-48 justify-center sm:h-60">
          <DrawnHand />
        </div>

        <h2 id="cta-heading" className="mk-h2 relative mt-6 text-white">
          Your first letter takes ten seconds.
        </h2>
        <p className="relative mx-auto mt-4 max-w-md text-[17px] leading-relaxed text-zinc-400">
          Free, in your browser, and your video never leaves your device.
        </p>
        <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/sign-up"
            className="group inline-flex h-11 items-center gap-2 rounded-lg bg-white pl-5 pr-[1.125rem] text-[15px] font-medium text-zinc-950 transition-[background-color,transform] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:bg-zinc-200 focus-visible:outline-violet-300 active:scale-[0.98] active:duration-100"
          >
            Start practising free <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex h-11 items-center rounded-lg px-5 text-[15px] font-medium text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.18)] transition-[background-color,box-shadow,transform] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:bg-white/[0.06] hover:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.32)] focus-visible:outline-violet-300 active:scale-[0.98] active:duration-100"
          >
            See how it works
          </a>
        </div>
      </div>
    </section>
  );
}
