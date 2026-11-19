import type { Prisma, PrismaClient } from '@prisma/client';
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
export async function computeUserStats(
  userId: string,
  db: PrismaClient | Prisma.TransactionClient = prisma,
): Promise<AggregateStats> {
  // Four queries in parallel (fits the pool of 5): progress, one attempts
  // aggregate, challenge count and the user's streak.
  const [completedProgress, agg, challengesCompleted, user] = await Promise.all([
    db.signProgress.findMany({
      where: { userId, completed: true },
      select: { lessonType: true },
    }),
    db.$queryRaw<{ total: number; correct: number; best: number }[]>`
      SELECT COUNT(*)::int AS total,
             (COUNT(*) FILTER (WHERE correct))::int AS correct,
             COALESCE(MAX(confidence) FILTER (WHERE correct), 0)::float8 AS best
      FROM "RecognitionAttempt" WHERE "userId" = ${userId}`,
    db.userChallenge.count({ where: { userId, completed: true } }),
    db.user.findUnique({ where: { id: userId }, select: { streakDays: true } }),
  ]);

  const attemptAgg = agg[0]?.total ?? 0;
  const correctCount = agg[0]?.correct ?? 0;
  const alphabetCompleted = completedProgress.filter((p) => p.lessonType === 'alphabet').length;
  const numberCompleted = completedProgress.filter((p) => p.lessonType === 'number').length;
  const lessonsCompleted = completedProgress.length;

  return {
    lessonsCompleted,
    alphabetCompleted,
    numberCompleted,
    streakDays: user?.streakDays ?? 0,
    bestSessionAccuracy: agg[0]?.best ?? 0,
    challengesCompleted,
    totalAttempts: attemptAgg,
    correctAttempts: correctCount,
    overallAccuracy: attemptAgg > 0 ? correctCount / attemptAgg : 0,
  };
}

export { ALPHABET_COUNT, NUMBER_COUNT };
