'use client';

import { motion } from 'motion/react';
import { Lightbulb, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import Button from '@/components/Button';
import { getSignTip } from '../signTips';

interface LessonPanelProps {
  targetSign: string;
  lessonType: 'alphabet' | 'number';
  currentIndex: number;
  totalLessons: number;
  completedCount: number;
  imageUrl: string;
  hasHandImage?: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export default function LessonPanel({
  targetSign,
  lessonType,
  currentIndex,
  totalLessons,
  completedCount,
  imageUrl,
  hasHandImage = false,
  onPrevious,
  onNext,
}: LessonPanelProps) {
  const label = lessonType === 'alphabet' ? 'Letter' : 'Number';
  const tip = getSignTip(targetSign);

  return (
    <div className="h-full flex flex-col justify-between p-4 lg:p-6 overflow-hidden select-none">
      {/* ─── Zone 1: Lesson Identity ─── */}
      <div className="shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-tint px-2.5 py-0.5 text-xs font-semibold text-brand tracking-wide uppercase">
              <BookOpen className="size-3" />
              {lessonType === 'alphabet' ? 'Alphabet' : 'Number'}
            </span>
            <span className="text-xs text-fg-muted font-medium">
              {label} {currentIndex + 1} of {totalLessons}
            </span>
          </div>

          {/* Quick prev / next */}
          <div className="flex items-center gap-1">
            <Button
              variant="icon"
              size="sm"
              icon={ChevronLeft}
              onClick={onPrevious}
              disabled={currentIndex === 0}
              aria-label="Previous sign"
            />
            <Button
              variant="icon"
              size="sm"
              icon={ChevronRight}
              onClick={onNext}
              disabled={currentIndex === totalLessons - 1}
              aria-label="Next sign"
            />
          </div>
        </div>

        <h1 className="mt-2 font-display text-2xl lg:text-3xl font-bold tracking-tight text-fg">
          Sign for <span className="text-brand">"{targetSign}"</span>
        </h1>
      </div>

      {/* ─── Zone 2: Reference Hand Gesture (Prominent & Responsive) ─── */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center my-3 relative">
        <div className="relative w-full h-full max-h-[260px] rounded-2xl border border-line bg-canvas p-3 flex flex-col items-center justify-center overflow-hidden shadow-sm">
          {/* Target letter watermark / badge */}
          <span className="absolute left-3 top-3 grid size-8 place-items-center rounded-lg bg-brand-tint font-display text-base font-bold text-brand shadow-sm">
            {targetSign}
          </span>

          <motion.img
            key={targetSign}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            src={imageUrl}
            alt={
              hasHandImage
                ? `ASL hand shape for letter ${targetSign}`
                : `Reference for sign ${targetSign}`
            }
            className={`w-full h-full object-contain max-h-[210px] ${
              hasHandImage ? 'dark:invert' : ''
            }`}
          />

          <span className="text-[11px] text-fg-subtle mt-1 font-medium">
            {hasHandImage ? 'ASL fingerspelling reference' : 'Standard sign representation'}
          </span>
        </div>
      </div>

      {/* ─── Zone 3: Contextual Guidance (Single Focused Quick Tip) ─── */}
      <div className="shrink-0 mb-3">
        <div className="rounded-xl border border-line bg-subtle p-3 flex items-start gap-2.5">
          <div className="mt-0.5 rounded-md bg-brand-tint p-1 text-brand shrink-0">
            <Lightbulb className="size-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-fg tracking-tight">Form Guidance</p>
            <p className="mt-0.5 text-xs text-fg-muted leading-relaxed line-clamp-2">
              {tip}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Zone 4: Lesson Progress & Completion Summary ─── */}
      <div className="shrink-0 pt-3 border-t border-line flex items-center justify-between text-xs text-fg-muted">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-fg">Lesson Progress:</span>
          <span className="tabular-nums font-bold text-brand bg-brand-tint px-2 py-0.5 rounded-full">
            {completedCount} / {totalLessons} mastered
          </span>
        </div>

        {/* Micro milestone dots */}
        <div className="flex items-center gap-1" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => {
            const milestone = Math.floor(((i + 1) / 6) * totalLessons);
            const isReached = completedCount >= milestone;
            return (
              <span
                key={i}
                className={`size-1.5 rounded-full transition-colors ${
                  isReached ? 'bg-brand' : 'bg-line-strong'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
