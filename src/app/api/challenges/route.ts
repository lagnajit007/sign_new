import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/// Challenge catalog joined with the current user's progress. Shape matches
/// what src/app/dashboard/challenges/page.tsx renders.
export async function GET() {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [catalog, userChallenges] = await Promise.all([
    prisma.challenge.findMany(),
    prisma.userChallenge.findMany({ where: { userId: user.id } }),
  ]);
  const progressByChallengeId = new Map(userChallenges.map((c) => [c.challengeId, c]));

  const challenges = catalog.map((ch) => {
    const uc = progressByChallengeId.get(ch.id);
    const progress = uc ? Math.min(100, Math.round((uc.progress / ch.goal) * 100)) : 0;
    return {
      id: ch.id,
      key: ch.key,
      name: ch.name,
      description: ch.description,
      category: ch.category,
      difficulty: ch.difficulty,
      icon: ch.icon,
      color: ch.color,
      reward: `${ch.rewardXp} XP`,
      goal: ch.goal,
      period: ch.period,
      completed: uc?.completed ?? false,
      progress,
      completedDate: uc?.completedAt
        ? new Date(uc.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : undefined,
    };
  });

  return NextResponse.json({ error: null, challenges });
}
