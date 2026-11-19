'use client';

import { motion } from 'framer-motion';
import { Lightbulb, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import Button from '@/components/Button';

interface LessonPanelProps {
  targetSign: string;
  lessonType: 'alphabet' | 'number';
  currentIndex: number;
  totalLessons: number;
  description: string;
  difficulty: string;
  imageUrl: string;
  tips: string[];
  progress: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function LessonPanel({
  targetSign,
  lessonType,
  currentIndex,
  totalLessons,
  description,
  difficulty,
  imageUrl,
  tips,
  progress,
  onPrevious,
  onNext,
}: LessonPanelProps) {
  const label = lessonType === 'alphabet' ? 'Letter' : 'Number';

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 lg:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-brand" />
              <span className="text-xs font-medium text-brand uppercase tracking-wider">
                {lessonType === 'alphabet' ? 'Alphabet' : 'Number'} Lesson
              </span>
            </div>
            <h1 className="font-display text-2xl lg:text-3xl font-semibold tracking-tight text-fg">
              Sign for <span className="text-brand">"{targetSign}"</span>
            </h1>
            <p className="text-sm text-fg-subtle mt-1">{description}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="icon"
              size="sm"
              icon={ChevronLeft}
              onClick={onPrevious}
              disabled={currentIndex === 0}
              aria-label="Previous sign"
            />
            <span className="text-xs font-medium text-fg-subtle px-2">
              {currentIndex + 1}/{totalLessons}
            </span>
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

        {/* Sign Visualization */}
        <div className="bg-canvas rounded-2xl p-4 flex items-center justify-center">
          <motion.img
            key={targetSign}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            src={imageUrl}
            alt={`Sign for ${targetSign}`}
            className="object-contain w-48 h-48 lg:w-56 lg:h-56"
          />
        </div>

        {/* Learning Tips */}
        <div className="bg-caution-tint border border-line rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-caution" />
            <h3 className="font-semibold text-sm text-fg">Learning Tips</h3>
          </div>
          <ul className="space-y-1.5">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-fg-subtle">
                <span className="text-caution mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Progress Section */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-fg">Lesson Progress</span>
            <span className="text-brand font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-brand-tint rounded-full overflow-hidden">
            <motion.div
              className="h-full origin-left bg-brand rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: Math.round(progress) / 100 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <div className="flex justify-between mt-1">
            {Array.from({ length: Math.min(totalLessons, 5) }).map((_, i) => {
              const milestone = Math.floor((i + 1) / 5 * totalLessons);
              const isReached = currentIndex >= milestone;
              return (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isReached ? 'bg-brand' : 'bg-brand-tint'
                    }`}
                  />
                  <span className="text-[10px] text-fg-subtle mt-0.5">{milestone}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lesson info footer */}
        <div className="flex items-center gap-3 text-xs text-fg-subtle pt-2 border-t border-line">
          <span className="bg-brand-tint text-brand px-2.5 py-1 rounded-full font-medium">
            {difficulty}
          </span>
          <span>{label} {currentIndex + 1} of {totalLessons}</span>
        </div>
      </div>
    </div>
  );
}
