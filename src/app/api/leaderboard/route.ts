import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { levelForXp } from '@/lib/gamification';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/// Leaderboard ranked by XP. scope=global ranks by lifetime XP; scope=weekly
/// ranks by correct-attempt volume in the last 7 days (a proxy for weekly XP).
export async function GET(request: Request) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const scope = new URL(request.url).searchParams.get('scope') ?? 'global';
  if (!['global', 'weekly'].includes(scope)) {
    return NextResponse.json({ error: `Invalid scope "${scope}"; must be "global" or "weekly"` }, { status: 400 });
  }

  if (scope === 'weekly') {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const grouped = await prisma.recognitionAttempt.groupBy({
      by: ['userId'],
      where: { correct: true, createdAt: { gte: since } },
      _count: { _all: true },
      orderBy: { _count: { userId: 'desc' } },
      take: 10,
    });
    const users = await prisma.user.findMany({
      where: { id: { in: grouped.map((g) => g.userId) } },
    });
    const userById = new Map(users.map((u) => [u.id, u]));
    const rows = grouped.map((g, i) => {
      const u = userById.get(g.userId);
      return {
        rank: i + 1,
        id: g.userId,
        name: u?.name ?? 'Learner',
        points: g._count._all * 10,
        level: levelForXp(u?.xp ?? 0),
        avatar: '/Avatar.png',
        isCurrentUser: g.userId === user.id,
      };
    });
    return NextResponse.json({ scope, entries: rows });
  }

  const top = await prisma.user.findMany({
    orderBy: { xp: 'desc' },
    take: 10,
  });
  const entries = top.map((u, i) => ({
    rank: i + 1,
    id: u.id,
    name: u.name ?? 'Learner',
    points: u.xp,
    level: levelForXp(u.xp),
    avatar: '/Avatar.png',
    isCurrentUser: u.id === user.id,
  }));

  return NextResponse.json({ error: null, scope: 'global', entries });
}
