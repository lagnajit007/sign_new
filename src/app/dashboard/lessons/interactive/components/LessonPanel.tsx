"use client";

import { motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Learning panel: identity → reference → one tip → compact lesson progress.
 * Lesson progress shows real mastery (from the database), one dot per sign.
 */
export default function LessonPanel({
  target,
  lessonType,
  index,
  lessons,
  mastered,
  imageUrl,
  hasHandImage,
  tip,
  onPrevious,
  onNext,
  onJump,
}: {
  target: string;
  lessonType: "alphabet" | "number";
  index: number;
  lessons: string[];
  mastered: Set<string>;
  imageUrl: string;
  hasHandImage: boolean;
  tip: string;
  onPrevious: () => void;
  onNext: () => void;
  onJump: (index: number) => void;
}) {
  const reduce = useReducedMotion();
  const done = lessons.filter((s) => mastered.has(s)).length;
  const kind = lessonType === "alphabet" ? "Letter" : "Number";

  return (
    <div className="flex h-full min-h-0 flex-col p-4 lg:p-5">
      {/* 1. Identity */}
      <div className="flex shrink-0 items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-fg-subtle">
            {kind} {index + 1} of {lessons.length}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-fg">
            Learn <span className="text-brand">{target}</span>
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevious}
            disabled={index === 0}
            aria-label="Previous sign"
            className="grid size-8 place-items-center rounded-lg border border-line text-fg-muted transition-colors hover:bg-subtle hover:text-fg disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={index === lessons.length - 1}
            aria-label="Next sign"
            className="grid size-8 place-items-center rounded-lg border border-line text-fg-muted transition-colors hover:bg-subtle hover:text-fg disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* 2. Reference: takes all remaining height, shrinks first on short screens */}
      <figure className="relative my-3 flex min-h-0 flex-1 flex-col items-center justify-center rounded-xl border border-line bg-canvas p-3">
        <motion.img
          key={target}
          initial={reduce ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          src={imageUrl}
          alt={hasHandImage ? `ASL hand shape for the letter ${target}` : `The ${kind.toLowerCase()} ${target}`}
          className={cn("min-h-0 w-full max-w-[280px] flex-1 object-contain", hasHandImage && "dark:invert")}
        />
        <figcaption className="mt-2 shrink-0 text-[11px] text-fg-subtle">
          {hasHandImage ? "Reference hand shape (ASL)" : "Hand-shape drawing coming soon"}
        </figcaption>
      </figure>

      {/* 3. One contextual tip */}
      <div className="flex shrink-0 items-start gap-2.5 rounded-xl bg-subtle p-3">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
        <p className="text-sm leading-snug text-fg-muted">{tip}</p>
      </div>

      {/* 4. Lesson progress: compact, one dot per sign (click to jump) */}
      <div className="mt-3 shrink-0 border-t border-line pt-3">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-fg-muted">Lesson progress</span>
          <span className="tabular-nums text-fg">
            {done} of {lessons.length} mastered
          </span>
        </div>
        <ol className="flex flex-wrap gap-1" aria-label="Signs in this lesson">
          {lessons.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => onJump(i)}
                aria-label={`${kind} ${s}${mastered.has(s) ? ", mastered" : ""}${i === index ? ", current" : ""}`}
                aria-current={i === index ? "step" : undefined}
                className={cn(
                  "grid size-5 place-items-center rounded text-[9px] font-semibold transition-colors",
                  mastered.has(s) ? "bg-brand text-brand-fg" : "bg-subtle text-fg-subtle hover:bg-subtle-hover",
                  i === index && "ring-2 ring-brand ring-offset-1 ring-offset-panel",
                )}
              >
                {s}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
