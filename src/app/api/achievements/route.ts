import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { computeUserStats } from '@/lib/stats';
import { criteriaProgress, isCriteriaMet } from '@/lib/gamification';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/// Achievement catalog joined with the current user's unlock state. Shape
/// matches what src/app/dashboard/achievements/page.tsx renders.
export async function GET() {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [catalog, unlocks, stats] = await Promise.all([
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany({ where: { userId: user.id } }),
    computeUserStats(user.id),
  ]);
  const unlockByAchievementId = new Map(unlocks.map((u) => [u.achievementId, u]));

  const achievements = catalog.map((ach) => {
    const unlock = unlockByAchievementId.get(ach.id);
    const earned = Boolean(unlock?.unlockedAt) || isCriteriaMet(ach.criteriaType, ach.criteriaValue, stats);
    return {
      id: ach.id,
      key: ach.key,
      name: ach.name,
      description: ach.description,
      category: ach.category,
      icon: ach.icon,
      color: ach.color,
      xp: ach.xpReward,
      earned,
      date: unlock?.unlockedAt
        ? new Date(unlock.unlockedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : undefined,
      progress: earned ? 100 : criteriaProgress(ach.criteriaType, ach.criteriaValue, stats),
    };
  });

  return NextResponse.json({ error: null, achievements });
}
