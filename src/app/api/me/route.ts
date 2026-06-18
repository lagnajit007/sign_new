import { NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/user';
import { computeUserStats } from '@/lib/stats';
import { levelForXp, nextLevelXp, totalXpForLevel } from '@/lib/gamification';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/// Current user's profile + aggregate stats. Feeds dashboard, profile header.
export async function GET() {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stats = await computeUserStats(user.id);
  const level = levelForXp(user.xp);

  return NextResponse.json({
    error: null,
    id: user.id,
    name: user.name,
    email: user.email,
    avatarId: user.avatarId,
    xp: user.xp,
    level,
    levelFloorXp: totalXpForLevel(level),
    nextLevelXp: nextLevelXp(user.xp),
    streakDays: user.streakDays,
    createdAt: user.createdAt,
    stats: {
      lessonsCompleted: stats.lessonsCompleted,
      alphabetCompleted: stats.alphabetCompleted,
      numberCompleted: stats.numberCompleted,
      totalAttempts: stats.totalAttempts,
      correctAttempts: stats.correctAttempts,
      accuracy: Math.round(stats.overallAccuracy * 100),
      challengesCompleted: stats.challengesCompleted,
    },
  });
}
