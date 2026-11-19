import type { Prisma, PrismaClient } from '@prisma/client';

/**
 * Challenges are evaluated live from the learning log, inside the current
 * period window (UTC). A UserChallenge row only records when a challenge was
 * last completed, so the reward is paid once per window.
 *
 * Every key here must exist in prisma/seed.ts; unknown keys report 0 progress.
 */

type Db = PrismaClient | Prisma.TransactionClient;

export type ChallengePeriod = 'daily' | 'weekly' | 'monthly' | 'none';

export function periodStart(period: string, now: Date = new Date()): Date {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  switch (period) {
    case 'daily':
      return d;
    case 'weekly': {
      const dow = (d.getUTCDay() + 6) % 7; // Monday = 0
      d.setUTCDate(d.getUTCDate() - dow);
      return d;
    }
    case 'monthly':
      return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    default:
      return new Date(0);
  }
}

export function periodEnd(period: string, now: Date = new Date()): Date | null {
  const start = periodStart(period, now);
  switch (period) {
    case 'daily':
      return new Date(start.getTime() + 86_400_000);
    case 'weekly':
      return new Date(start.getTime() + 7 * 86_400_000);
    case 'monthly':
      return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
    default:
      return null;
  }
}

/** Current raw count toward a challenge's goal. */
export async function challengeCount(
  db: Db,
  userId: string,
  key: string,
  period: string,
  streakDays: number,
  now: Date = new Date(),
): Promise<number> {
  const since = periodStart(period, now);
  switch (key) {
    case 'daily-practice':
      return db.recognitionAttempt.count({ where: { userId, correct: true, createdAt: { gte: since } } });
    case 'alphabet-rush':
      return db.signProgress.count({
        where: { userId, lessonType: 'alphabet', completed: true, completedAt: { gte: since } },
      });
    case 'weekly-variety': {
      const rows = await db.recognitionAttempt.findMany({
        where: { userId, correct: true, createdAt: { gte: since } },
        distinct: ['signLabel'],
        select: { signLabel: true },
      });
      return rows.length;
    }
    case 'seven-day-streak':
      return streakDays;
    case 'number-master':
      return db.signProgress.count({ where: { userId, lessonType: 'number', completed: true } });
    case 'alphabet-complete':
      return db.signProgress.count({ where: { userId, lessonType: 'alphabet', completed: true } });
    default:
      return 0;
  }
}

/** True when a stored completion belongs to the current period window. */
export function completedThisPeriod(completedAt: Date | null | undefined, period: string, now: Date = new Date()): boolean {
  if (!completedAt) return false;
  return completedAt >= periodStart(period, now);
}
