'use client';

import { motion } from 'framer-motion';
import { Trophy, Clock, Target, Zap, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface CompletionScreenProps {
  accuracy: number;
  xpEarned: number;
  totalXp: number;
  timeTaken: number;
  signsMastered: number;
  totalSigns: number;
  achievementsUnlocked: number;
  onContinue: () => void;
}

export default function CompletionScreen({
  accuracy,
  xpEarned,
  totalXp,
  timeTaken,
  signsMastered,
  totalSigns,
  achievementsUnlocked,
  onContinue,
}: CompletionScreenProps) {
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;
  const grade = accuracy >= 90 ? 'S' : accuracy >= 80 ? 'A' : accuracy >= 70 ? 'B' : accuracy >= 60 ? 'C' : 'D';
  const gradeColor =
    grade === 'S' ? 'text-yellow-400' :
    grade === 'A' ? 'text-green-400' :
    grade === 'B' ? 'text-blue-400' :
    grade === 'C' ? 'text-orange-400' : 'text-red-400';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="bg-white rounded-3xl max-w-lg w-full mx-auto shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7D54FF] to-[#9B7CFF] p-6 text-center text-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 15 }}
            className="w-20 h-20 rounded-full bg-white/20 mx-auto mb-3 flex items-center justify-center"
          >
            <Trophy className="w-10 h-10" />
          </motion.div>
          <h2 className="text-2xl font-bold">Lesson Complete!</h2>
          <p className="text-white/80 text-sm mt-1">Great work on this lesson</p>
        </div>

        {/* Grade */}
        <div className="flex justify-center -mt-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: 'spring', damping: 12 }}
            className={`w-20 h-20 rounded-full bg-gray-900 border-4 border-white flex items-center justify-center ${gradeColor} text-3xl font-black shadow-lg`}
          >
            {grade}
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 p-6">
          <StatCard icon={Target} label="Accuracy" value={`${accuracy}%`} color="text-green-500" />
          <StatCard icon={Zap} label="XP Earned" value={`+${xpEarned}`} color="text-[#7D54FF]" />
          <StatCard icon={Clock} label="Time Taken" value={`${minutes}m ${seconds}s`} color="text-blue-500" />
          <StatCard icon={Award} label="Signs Mastered" value={`${signsMastered}/${totalSigns}`} color="text-orange-500" />
        </div>

        {/* Achievements */}
        {achievementsUnlocked > 0 && (
          <div className="px-6 pb-2">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
              <span className="text-sm font-medium text-yellow-700">
                🏆 {achievementsUnlocked} achievement{achievementsUnlocked > 1 ? 's' : ''} unlocked!
              </span>
            </div>
          </div>
        )}

        {/* XP Bar */}
        <div className="px-6 pb-4">
          <div className="flex justify-between text-xs text-[#7E7A93] mb-1">
            <span>Total XP</span>
            <span>{totalXp} XP</span>
          </div>
          <div className="h-2 bg-[#EAE4FF] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#7D54FF] to-[#9B7CFF] rounded-full"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="p-6 pt-2">
          <button
            onClick={onContinue}
            className="w-full py-3 bg-gradient-to-r from-[#7D54FF] to-[#9B7CFF] text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            Continue Learning
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            href="/dashboard/lessons"
            className="block w-full text-center text-sm text-[#7E7A93] hover:text-[#7D54FF] mt-3 transition-colors"
          >
            Back to Lessons
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-[#FAF7FF] rounded-xl p-3 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xs text-[#7E7A93]">{label}</div>
        <div className={`text-lg font-bold ${color}`}>{value}</div>
      </div>
    </div>
  );
}
