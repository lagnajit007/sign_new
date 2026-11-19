'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FastForward } from 'lucide-react';
import Button from '@/components/Button';

export type CountdownStep = 3 | 2 | 1 | 'GO' | 'DONE';

interface CountdownOverlayProps {
  targetSign: string;
  onComplete: () => void;
  onSkip: () => void;
}

export default function CountdownOverlay({
  targetSign,
  onComplete,
  onSkip,
}: CountdownOverlayProps) {
  const [step, setStep] = useState<CountdownStep>(3);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (step === 3) {
      timer = setTimeout(() => setStep(2), 1000);
    } else if (step === 2) {
      timer = setTimeout(() => setStep(1), 1000);
    } else if (step === 1) {
      timer = setTimeout(() => setStep('GO'), 1000);
    } else if (step === 'GO') {
      timer = setTimeout(() => {
        setStep('DONE');
        onComplete();
      }, 500);
    }

    return () => clearTimeout(timer);
  }, [step, onComplete]);

  // Support Spacebar or Enter to skip countdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        onSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSkip]);

  if (step === 'DONE') return null;

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/55 backdrop-blur-[2px] transition-all duration-300">
      {/* Target letter reminder header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white/90">
        <div className="flex items-center gap-2 bg-black/60 rounded-full px-3.5 py-1.5 border border-white/10 backdrop-blur-md">
          <span className="text-xs text-white/60 font-medium">Get ready for</span>
          <span className="text-sm font-bold text-brand bg-white px-2 py-0.5 rounded-full">{targetSign}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={FastForward}
          onClick={onSkip}
          className="!text-white/80 hover:!text-white !bg-white/10 hover:!bg-white/20 !border-0 text-xs backdrop-blur-md"
        >
          Skip <span className="opacity-60 text-[10px] ml-1">(Space)</span>
        </Button>
      </div>

      {/* Centered Countdown Animation */}
      <div className="relative flex items-center justify-center">
        {/* Subtle circular pulse ring */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute size-36 lg:size-44 rounded-full border-2 border-brand/40 bg-brand/10"
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={String(step)}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.25, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center select-none"
          >
            {step === 'GO' ? (
              <span className="font-display text-5xl lg:text-7xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(34,197,94,0.6)]">
                GO!
              </span>
            ) : (
              <span className="font-display text-6xl lg:text-8xl font-black text-white tabular-nums drop-shadow-[0_4px_24px_rgba(125,84,255,0.7)]">
                {step}
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="mt-6 text-xs text-white/70 font-medium tracking-wide">
        Position your hand in the camera guide
      </p>
    </div>
  );
}
