import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { computeUserStats } from '@/lib/stats';
import { levelForXp, nextLevelXp, totalXpForLevel } from '@/lib/gamification';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stats = await computeUserStats(user.id);
  const level = levelForXp(user.xp);

  return NextResponse.json({
    id: user.id,
    clerkId: user.clerkId,
    name: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio,
    learningGoal: user.learningGoal,
    preferredLang: user.preferredLang,
    timezone: user.timezone,
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

export async function PATCH(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await getOrCreateUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    const allowedFields = [
      'name', 'username', 'bio', 'learningGoal', 'preferredLang', 'timezone', 'avatarId',
    ];

    const data: Record<string, any> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) data[key] = body[key];
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
