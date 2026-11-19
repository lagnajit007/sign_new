"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Hand, Loader2, RotateCcw, ScanLine, TriangleAlert } from "lucide-react";
import type { Phase } from "../practice-machine";

/** Small ring for the current hold: deliberately unlike the lesson progress bar. */
function HoldRing({ value }: { value: number }) {
  const r = 9;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 24 24" className="size-9 -rotate-90 shrink-0" aria-hidden>
      <circle cx="12" cy="12" r={r} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="2.5" />
      <circle
        cx="12"
        cy="12"
        r={r}
        fill="none"
        stroke="#6ee7b7"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value)}
        className="transition-[stroke-dashoffset] duration-200 ease-linear"
      />
    </svg>
  );
}

function Row({ icon, title, body, children }: { icon: React.ReactNode; title: string; body?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">{title}</p>
        {body && <p className="mt-0.5 truncate text-xs text-zinc-400">{body}</p>}
      </div>
      {children}
    </div>
  );
}

const iconBox = "grid size-9 shrink-0 place-items-center rounded-full";
const primaryBtn =
  "inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--sj-brand-hover)] px-3.5 text-sm font-medium text-white transition-colors hover:bg-[#7c5cff] disabled:opacity-60";
const ghostBtn = "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white";

export default function FeedbackCard({
  phase,
  cameraOn,
  target,
  nextSign,
  tip,
  onContinue,
  onRetry,
  onRetrySave,
}: {
  phase: Phase;
  cameraOn: boolean;
  target: string;
  nextSign: string | null;
  tip: string;
  onContinue: () => void;
  onRetry: () => void;
  onRetrySave: () => void;
}) {
  const reduce = useReducedMotion();

  let key = "idle";
  let content: React.ReactNode;

  if (!cameraOn && phase.kind !== "success" && phase.kind !== "paused") {
    key = "idle";
    content = <Row icon={<span className={`${iconBox} bg-white/5 text-zinc-400`}><Hand className="size-4" /></span>} title="Start your camera to practise" body={`You'll make the sign for ${target}.`} />;
  } else if (phase.kind === "countdown") {
    key = "countdown";
    content = <Row icon={<span className={`${iconBox} bg-white/5 text-zinc-300`}><Hand className="size-4" /></span>} title={`Get ready to sign ${target}`} body={tip} />;
  } else if (phase.kind === "paused") {
    key = "paused";
    content = (
      <Row
        icon={<span className={`${iconBox} bg-amber-400/15 text-amber-300`}><TriangleAlert className="size-4" /></span>}
        title="Practice paused"
        body={phase.reason === "tab-hidden" ? "Return to this tab to continue." : "Reconnect your camera and press Start camera."}
      />
    );
  } else if (phase.kind === "recognizing") {
    key = `rec-${phase.sub}`;
    if (phase.sub === "waiting") {
      content = <Row icon={<span className={`${iconBox} bg-white/5 text-zinc-300`}><ScanLine className="size-4" /></span>} title="Show your hand" body="Hold it inside the guide, palm facing the camera." />;
    } else if (phase.sub === "detected") {
      content = <Row icon={<span className={`${iconBox} bg-[var(--sj-brand-hover)]/20 text-violet-200`}><Hand className="size-4" /></span>} title="Hand detected" body={`Now form the ${target} sign.`} />;
    } else if (phase.sub === "incorrect") {
      content = (
        <Row
          icon={<span className={`${iconBox} bg-amber-400/15 text-amber-300`}><Hand className="size-4" /></span>}
          title={phase.detected ? `That looks like ${phase.detected}` : "Not quite yet"}
          body={tip}
        />
      );
    } else {
      content = (
        <Row icon={<HoldRing value={phase.holdProgress} />} title={`Hold your ${target} steady`} body="Almost there. Keep your hand still." />
      );
    }
  } else if (phase.kind === "success") {
    key = `success-${phase.save}`;
    const icon = (
      <motion.span
        initial={reduce ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className={`${iconBox} bg-emerald-400/20 text-emerald-300`}
      >
        <Check className="size-5" />
      </motion.span>
    );
    if (phase.save === "saving") {
      content = (
        <Row icon={icon} title={`Great job, that's ${target}!`} body="Saving your progress…">
          <button type="button" disabled className={primaryBtn}>
            <Loader2 className="size-4 animate-spin" aria-hidden /> Saving
          </button>
        </Row>
      );
    } else if (phase.save === "failed") {
      content = (
        <Row icon={icon} title={`Great job, that's ${target}!`} body="We couldn't save this one.">
          <button type="button" onClick={onRetrySave} className={primaryBtn}>
            Try again
          </button>
          <button type="button" onClick={onContinue} className={ghostBtn}>
            Skip
          </button>
        </Row>
      );
    } else {
      content = (
        <Row
          icon={icon}
          title={`Great job, that's ${target}!`}
          body={phase.xp > 0 ? `+${phase.xp} XP` : "Practice saved."}
        >
          <button type="button" onClick={onContinue} className={primaryBtn} autoFocus>
            {nextSign ? <>Continue to {nextSign}</> : "Finish"}
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </Row>
      );
    }
  } else {
    content = <Row icon={<span className={`${iconBox} bg-white/5 text-zinc-300`}><Hand className="size-4" /></span>} title="Ready when you are" />;
  }

  const canRetry = cameraOn && (phase.kind === "recognizing" || (phase.kind === "success" && phase.save !== "saving"));

  return (
    <div className="rounded-xl bg-white/[0.04] p-3" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={key}
          initial={reduce ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
      {canRetry && (
        <div className="mt-2.5 flex justify-end border-t border-white/5 pt-2">
          <button type="button" onClick={onRetry} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-400 hover:bg-white/5 hover:text-white">
            <RotateCcw className="size-3.5" aria-hidden /> Reset sign
          </button>
        </div>
      )}
    </div>
  );
}
