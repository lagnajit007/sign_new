import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { ALPHABET_COUNT, NUMBER_COUNT, computeUserStats } from '@/lib/stats';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/// Analytics for the progress page: weekly activity, completion-by-category,
/// recent activity, and weak signs.
export async function GET() {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [recentAttempts, weekAttempts, signProgress, stats] = await Promise.all([
    prisma.recognitionAttempt.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.recognitionAttempt.findMany({
      where: { userId: user.id, createdAt: { gte: since } },
      select: { createdAt: true, correct: true },
    }),
    prisma.signProgress.findMany({ where: { userId: user.id } }),
    computeUserStats(user.id),
  ]);

  // Weekly activity: count attempts per weekday.
  const perDay = new Array(7).fill(0);
  for (const a of weekAttempts) {
    perDay[new Date(a.createdAt).getDay()] += 1;
  }
  const activityData = DAY_LABELS.map((day, i) => ({ day, value: perDay[i] }));

  // Completion-by-category (only the categories this app actually teaches).
  const completionData = [
    {
      id: 1,
      name: 'Alphabets',
      total: ALPHABET_COUNT,
      completed: stats.alphabetCompleted,
      color: 'bg-[#7D54FF]',
    },
    {
      id: 2,
      name: 'Numbers',
      total: NUMBER_COUNT,
      completed: stats.numberCompleted,
      color: 'bg-[#5EC8FF]',
    },
  ];

  // Recent activity from the attempt log.
  const recentActivity = recentAttempts.map((a) => ({
    id: a.id,
    type: a.correct ? 'lesson' : 'practice',
    name: a.correct
      ? `Signed "${a.signLabel}" correctly`
      : `Practiced "${a.signLabel}"`,
    category: a.lessonType === 'alphabet' ? 'alphabets' : 'numbers',
    confidence: Math.round(a.confidence * 100),
    createdAt: a.createdAt,
  }));

  // Weak signs: attempted but lowest best-accuracy, not yet completed.
  const weakSigns = [...signProgress]
    .filter((p) => p.attempts > 0 && !p.completed)
    .sort((a, b) => a.bestAccuracy - b.bestAccuracy)
    .slice(0, 5)
    .map((p) => ({
      signLabel: p.signLabel,
      lessonType: p.lessonType,
      bestAccuracy: Math.round(p.bestAccuracy * 100),
      attempts: p.attempts,
    }));

  return NextResponse.json({
    error: null,
    activityData,
    completionData,
    recentActivity,
    weakSigns,
    summary: {
      xp: user.xp,
      lessonsCompleted: stats.lessonsCompleted,
      accuracy: Math.round(stats.overallAccuracy * 100),
      streakDays: user.streakDays,
    },
  });
}
