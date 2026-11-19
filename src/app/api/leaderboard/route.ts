import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { levelForXp, XP_PER_CORRECT_SIGN } from '@/lib/gamification';
import { apiError, withErrorHandling } from '@/lib/api';
import { displayName, leaderboardUserWhere, publicUserSelect } from '@/lib/community';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LIMIT = 25;

/**
 * Leaderboard.
 * - scope=global: lifetime XP.
 * - scope=weekly: XP from correct signs in the last 7 days (correct attempts ×
 *   XP_PER_CORRECT_SIGN; mastery and achievement bonuses are lifetime-only).
 */
export const GET = withErrorHandling('leaderboard', async (request: Request) => {
  const user = await getOrCreateUser();
  if (!user) return apiError('Unauthorized', 401);

  const scope = new URL(request.url).searchParams.get('scope') ?? 'global';
  if (scope !== 'global' && scope !== 'weekly') {
    return apiError('scope must be "global" or "weekly"', 400);
  }

  const where = leaderboardUserWhere();

  if (scope === 'weekly') {
    const since = new Date(Date.now() - 7 * 86_400_000);
    const grouped = await prisma.recognitionAttempt.groupBy({
      by: ['userId'],
      where: { correct: true, createdAt: { gte: since }, user: where },
      _count: { _all: true },
      orderBy: { _count: { userId: 'desc' } },
      take: LIMIT,
    });
    const users = await prisma.user.findMany({
      where: { id: { in: grouped.map((g) => g.userId) } },
      select: publicUserSelect,
    });
    const byId = new Map(users.map((u) => [u.id, u]));
    const entries = grouped.flatMap((g, i) => {
      const u = byId.get(g.userId);
      if (!u) return [];
      return [{
        rank: i + 1,
        id: u.id,
        name: displayName(u),
        username: u.username,
        points: g._count._all * XP_PER_CORRECT_SIGN,
        level: levelForXp(u.xp),
        streakDays: u.streakDays,
        avatarId: u.avatarId,
        isDemo: u.isDemo,
        isCurrentUser: u.id === user.id,
      }];
    });
    return NextResponse.json({ error: null, scope, entries });
  }

  const top = await prisma.user.findMany({
    where,
    orderBy: [{ xp: 'desc' }, { createdAt: 'asc' }],
    take: LIMIT,
    select: publicUserSelect,
  });
  const entries = top.map((u, i) => ({
    rank: i + 1,
    id: u.id,
    name: displayName(u),
    username: u.username,
    points: u.xp,
    level: levelForXp(u.xp),
    streakDays: u.streakDays,
    avatarId: u.avatarId,
    isDemo: u.isDemo,
    isCurrentUser: u.id === user.id,
  }));

  return NextResponse.json({ error: null, scope: 'global', entries });
});
