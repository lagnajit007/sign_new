import { prisma } from './prisma';
import type { UserStats } from './gamification';

const ALPHABET_COUNT = 26;
const NUMBER_COUNT = 10;

export interface AggregateStats extends UserStats {
  totalAttempts: number;
  correctAttempts: number;
  overallAccuracy: number; // 0..1 across all attempts
}

/// Compute a user's aggregate gamification stats from their progress + attempts.
/// Shared by /api/me, /api/attempts (achievement evaluation), and /api/progress.
export async function computeUserStats(userId: string): Promise<AggregateStats> {
  const [completedProgress, attemptAgg, correctCount, bestCorrect, challengesCompleted] =
    await Promise.all([
      prisma.signProgress.findMany({
        where: { userId, completed: true },
        select: { lessonType: true },
      }),
      prisma.recognitionAttempt.count({ where: { userId } }),
      prisma.recognitionAttempt.count({ where: { userId, correct: true } }),
      prisma.recognitionAttempt.findFirst({
        where: { userId, correct: true },
        orderBy: { confidence: 'desc' },
        select: { confidence: true },
      }),
      prisma.userChallenge.count({ where: { userId, completed: true } }),
    ]);

  const alphabetCompleted = completedProgress.filter((p) => p.lessonType === 'alphabet').length;
  const numberCompleted = completedProgress.filter((p) => p.lessonType === 'number').length;
  const lessonsCompleted = completedProgress.length;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streakDays: true },
  });

  return {
    lessonsCompleted,
    alphabetCompleted,
    numberCompleted,
    streakDays: user?.streakDays ?? 0,
    bestSessionAccuracy: bestCorrect?.confidence ?? 0,
    challengesCompleted,
    totalAttempts: attemptAgg,
    correctAttempts: correctCount,
    overallAccuracy: attemptAgg > 0 ? correctCount / attemptAgg : 0,
  };
}

export { ALPHABET_COUNT, NUMBER_COUNT };
