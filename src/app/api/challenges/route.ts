import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { apiError, withErrorHandling } from '@/lib/api';
import { challengeCount, completedThisPeriod, periodEnd } from '@/lib/challenges';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Challenge catalog with live progress for the current period window. */
export const GET = withErrorHandling('challenges', async () => {
  const user = await getOrCreateUser();
  if (!user) return apiError('Unauthorized', 401);

  const now = new Date();
  const [catalog, userChallenges] = await Promise.all([
    prisma.challenge.findMany({ orderBy: { rewardXp: 'asc' } }),
    prisma.userChallenge.findMany({ where: { userId: user.id } }),
  ]);
  const byChallenge = new Map(userChallenges.map((c) => [c.challengeId, c]));

  const challenges = await Promise.all(
    catalog.map(async (ch) => {
      const uc = byChallenge.get(ch.id);
      const done = completedThisPeriod(uc?.completedAt, ch.period, now);
      const count = done ? ch.goal : await challengeCount(prisma, user.id, ch.key, ch.period, user.streakDays, now);
      const end = periodEnd(ch.period, now);
      return {
        id: ch.id,
        key: ch.key,
        name: ch.name,
        description: ch.description,
        category: ch.category,
        difficulty: ch.difficulty,
        icon: ch.icon,
        color: ch.color,
        rewardXp: ch.rewardXp,
        goal: ch.goal,
        current: Math.min(count, ch.goal),
        period: ch.period,
        completed: done,
        progress: Math.min(100, Math.round((count / ch.goal) * 100)),
        completedAt: done ? uc?.completedAt ?? null : null,
        endsAt: end,
        timeLeftMs: end ? end.getTime() - now.getTime() : null,
      };
    }),
  );

  return NextResponse.json({ error: null, challenges });
});
