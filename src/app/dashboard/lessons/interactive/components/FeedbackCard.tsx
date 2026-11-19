'use client';

import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Hand, ArrowRight, RotateCcw } from 'lucide-react';
import Button from '@/components/Button';

export type RecognitionState =
  | 'idle'
  | 'countdown'
  | 'waiting'
  | 'detected'
  | 'holding'
  | 'success'
  | 'incorrect'
  | 'error';

interface FeedbackCardProps {
  state: RecognitionState;
  targetSign: string;
  detectedSign?: string | null;
  confidence?: number;
  holdProgress: number; // 0 to 100
  nextSignLabel?: string;
  xpEarned?: number;
  onContinue?: () => void;
  onRetry?: () => void;
}

export default function FeedbackCard({
  state,
  targetSign,
  detectedSign,
  confidence,
  holdProgress,
  nextSignLabel,
  xpEarned,
  onContinue,
  onRetry,
}: FeedbackCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/90 backdrop-blur-sm p-3.5 select-none transition-all duration-200">
      <AnimatePresence mode="wait">
        {/* ─── State: SUCCESS ─── */}
        {state === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-green-400">Great Job! ✓</h4>
                  {xpEarned && xpEarned > 0 ? (
                    <span className="text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full">
                      +{xpEarned} XP
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-zinc-300 mt-0.5">
                  Sign for <span className="font-bold text-white">"{targetSign}"</span> completed successfully!
                </p>
              </div>
            </div>

            {onContinue && (
              <Button
                variant="primary"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                onClick={onContinue}
                className="bg-green-600 hover:bg-green-500 text-white shrink-0 shadow-md shadow-green-900/40"
              >
                {nextSignLabel ? `Continue to ${nextSignLabel}` : 'Complete Lesson'}
                <span className="opacity-70 text-[10px] ml-1 hidden sm:inline">(Space)</span>
              </Button>
            )}
          </motion.div>
        )}

        {/* ─── State: HOLDING STABILITY ─── */}
        {state === 'holding' && (
          <motion.div
            key="holding"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-bold text-white">
                  Hold your "{targetSign}" sign steady
                </span>
                {confidence !== undefined && (
                  <span className="text-[10px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded-full font-mono">
                    {Math.round(confidence * 100)}% confidence
                  </span>
                )}
              </div>
              <span className="text-xs font-mono font-bold text-green-400 tabular-nums">
                {Math.round(holdProgress)}%
              </span>
            </div>

            {/* Stability meter bar */}
            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand to-green-400 rounded-full"
                animate={{ width: `${Math.min(Math.max(holdProgress, 0), 100)}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}

        {/* ─── State: DETECTED BUT WRONG SIGN ─── */}
        {state === 'incorrect' && (
          <motion.div
            key="incorrect"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <AlertCircle className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-200">
                  Detected <span className="font-bold text-amber-400">"{detectedSign}"</span> instead of "{targetSign}"
                </p>
                <p className="text-[11px] text-zinc-400 truncate">
                  Check your finger positioning against the reference illustration.
                </p>
              </div>
            </div>

            {onRetry && (
              <Button
                variant="ghost"
                size="sm"
                icon={RotateCcw}
                onClick={onRetry}
                className="!text-zinc-400 hover:!text-white text-xs shrink-0"
              >
                Reset
              </Button>
            )}
          </motion.div>
        )}

        {/* ─── State: HAND DETECTED WAITING FOR FORM ─── */}
        {state === 'detected' && (
          <motion.div
            key="detected"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2.5"
          >
            <div className="size-8 rounded-full bg-brand/20 text-brand flex items-center justify-center shrink-0">
              <Hand className="size-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-200">
                Hand detected — form sign <span className="text-brand font-bold">"{targetSign}"</span>
              </p>
              <p className="text-[11px] text-zinc-400">
                Align your hand inside the frame and hold the sign steady.
              </p>
            </div>
          </motion.div>
        )}

        {/* ─── State: WAITING (NO HAND) ─── */}
        {state === 'waiting' && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2.5"
          >
            <div className="size-8 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center shrink-0">
              <Hand className="size-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-300">Show your hand</p>
              <p className="text-[11px] text-zinc-500">
                Raise your hand inside the camera guide box to begin.
              </p>
            </div>
          </motion.div>
        )}

        {/* ─── State: COUNTDOWN OR IDLE ─── */}
        {(state === 'idle' || state === 'countdown') && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-brand animate-pulse" />
            <span className="text-xs text-zinc-400">
              {state === 'countdown' ? 'Preparing recognition...' : 'Camera ready. Start when prepared.'}
            </span>
          </motion.div>
        )}

        {/* ─── State: ERROR ─── */}
        {state === 'error' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <AlertCircle className="size-4 text-red-400" />
            <span className="text-xs text-red-300">
              Recognition pipeline error. Please adjust hand distance and lighting.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
