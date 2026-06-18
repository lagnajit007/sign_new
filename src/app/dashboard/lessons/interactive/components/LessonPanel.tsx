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
              <BookOpen className="w-4 h-4 text-[#7D54FF]" />
              <span className="text-xs font-medium text-[#7D54FF] uppercase tracking-wider">
                {lessonType === 'alphabet' ? 'Alphabet' : 'Number'} Lesson
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-[#2D1B69]">
              Sign for <span className="text-[#7D54FF]">"{targetSign}"</span>
            </h1>
            <p className="text-sm text-[#7E7A93] mt-1">{description}</p>
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
            <span className="text-xs font-medium text-[#7E7A93] px-2">
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
        <div className="bg-[#FAF7FF] rounded-2xl p-4 flex items-center justify-center">
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
        <div className="bg-[#FFFDF5] border border-[#FFEAA7] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-[#FFC83D]" />
            <h3 className="font-semibold text-sm text-[#2D1B69]">Learning Tips</h3>
          </div>
          <ul className="space-y-1.5">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#7E7A93]">
                <span className="text-[#FFC83D] mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Progress Section */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-[#2D1B69]">Lesson Progress</span>
            <span className="text-[#7D54FF] font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-[#EAE4FF] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#7D54FF] to-[#9B7CFF] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(progress)}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
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
                      isReached ? 'bg-[#7D54FF]' : 'bg-[#EAE4FF]'
                    }`}
                  />
                  <span className="text-[10px] text-[#7E7A93] mt-0.5">{milestone}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lesson info footer */}
        <div className="flex items-center gap-3 text-xs text-[#7E7A93] pt-2 border-t border-[#EAE4FF]">
          <span className="bg-[#EAE4FF] text-[#7D54FF] px-2.5 py-1 rounded-full font-medium">
            {difficulty}
          </span>
          <span>{label} {currentIndex + 1} of {totalLessons}</span>
        </div>
      </div>
    </div>
  );
}
