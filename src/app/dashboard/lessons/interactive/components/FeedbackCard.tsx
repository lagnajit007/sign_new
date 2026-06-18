'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';

export type FeedbackType = 'correct' | 'incorrect' | 'no-hand' | 'idle' | 'error';

interface FeedbackCardProps {
  type: FeedbackType;
  message: string;
  confidence?: number;
  xpEarned?: number;
  targetSign?: string;
  detectedSign?: string;
  onTryAgain?: () => void;
}

const feedbackConfig = {
  correct: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: CheckCircle,
    iconColor: 'text-green-500',
    title: 'Correct Sign',
    titleColor: 'text-green-700',
  },
  incorrect: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: XCircle,
    iconColor: 'text-orange-500',
    title: 'Try Again',
    titleColor: 'text-orange-700',
  },
  'no-hand': {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    icon: AlertTriangle,
    iconColor: 'text-gray-400',
    title: 'No Hand Detected',
    titleColor: 'text-gray-500',
  },
  idle: {
    bg: 'bg-[#FAF7FF]',
    border: 'border-[#EAE4FF]',
    icon: AlertTriangle,
    iconColor: 'text-[#7D54FF]/50',
    title: 'Waiting…',
    titleColor: 'text-[#7E7A93]',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    title: 'Recognition Error',
    titleColor: 'text-red-700',
  },
};

const positiveMessages = ['Great Job!', 'Awesome!', 'Perfect!', 'Nice Work!', 'Amazing!', 'Well Done!'];

export default function FeedbackCard({ type, message, confidence, xpEarned, targetSign, detectedSign, onTryAgain }: FeedbackCardProps) {
  const config = feedbackConfig[type];
  const Icon = config.icon;
  const randomPositive = positiveMessages[Math.floor(Math.random() * positiveMessages.length)];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={type + (confidence ?? '')}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`rounded-xl border ${config.bg} ${config.border} p-4`}
      >
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${config.iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h4 className={`font-bold text-sm ${config.titleColor}`}>
                {type === 'correct' ? randomPositive : config.title}
              </h4>
              {confidence !== undefined && (
                <span className="text-xs font-semibold text-[#7E7A93] bg-white px-2 py-0.5 rounded-full border">
                  Confidence {Math.round(confidence * 100)}%
                </span>
              )}
            </div>
            <p className="text-sm text-[#7E7A93] mt-1">{message}</p>
            {type === 'correct' && xpEarned && xpEarned > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-1 mt-2 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full"
              >
                <span>✨</span>
                <span>+{xpEarned} XP</span>
              </motion.div>
            )}
            {type === 'incorrect' && detectedSign && targetSign && detectedSign !== targetSign && (
              <p className="text-xs text-[#7E7A93] mt-1">
                Detected <span className="font-semibold text-orange-600">"{detectedSign}"</span> — show <span className="font-semibold">"{targetSign}"</span> instead
              </p>
            )}
            {type === 'incorrect' && onTryAgain && (
              <button
                onClick={onTryAgain}
                className="mt-2 text-xs text-[#7D54FF] hover:text-[#6840E0] font-medium flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Try Again
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
