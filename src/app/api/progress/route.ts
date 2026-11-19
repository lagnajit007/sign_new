import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { ALPHABET_COUNT, NUMBER_COUNT, computeUserStats } from '@/lib/stats';
import { apiError, withErrorHandling } from '@/lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Range = 'week' | 'month' | 'year';
const DAY = 86_400_000;

function buckets(range: Range, now: Date) {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  if (range === 'year') {
    return Array.from({ length: 12 }, (_, i) => {
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11 + i, 1));
      const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
      return { label: start.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }), start, end };
    });
  }
  const days = range === 'month' ? 30 : 7;
  return Array.from({ length: days }, (_, i) => {
    const start = new Date(today - (days - 1 - i) * DAY);
    const label =
      range === 'week'
        ? start.toLocaleString('en-US', { weekday: 'short', timeZone: 'UTC' })
        : start.toLocaleString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    return { label, start, end: new Date(start.getTime() + DAY) };
  });
}

/** Analytics for the progress page. `?range=week|month|year` (UTC buckets). */
export const GET = withErrorHandling('progress', async (request: Request) => {
  const user = await getOrCreateUser();
  if (!user) return apiError('Unauthorized', 401);

  const param = new URL(request.url).searchParams.get('range') ?? 'week';
  if (param !== 'week' && param !== 'month' && param !== 'year') {
    return apiError('range must be week, month or year', 400);
  }
  const range: Range = param;
  const now = new Date();
  const slots = buckets(range, now);

  const [recentAttempts, rangeAttempts, signProgress, stats] = await Promise.all([
    prisma.recognitionAttempt.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.recognitionAttempt.findMany({
      where: { userId: user.id, createdAt: { gte: slots[0].start } },
      select: { createdAt: true, correct: true },
    }),
    prisma.signProgress.findMany({ where: { userId: user.id } }),
    computeUserStats(user.id),
  ]);

  const activityData = slots.map((s) => {
    const inSlot = rangeAttempts.filter((a) => a.createdAt >= s.start && a.createdAt < s.end);
    return { label: s.label, attempts: inSlot.length, correct: inSlot.filter((a) => a.correct).length };
  });

  const completionData = [
    { id: 'alphabet', name: 'Alphabet', total: ALPHABET_COUNT, completed: stats.alphabetCompleted },
    { id: 'number', name: 'Numbers', total: NUMBER_COUNT, completed: stats.numberCompleted },
  ];

  const recentActivity = recentAttempts.map((a) => ({
    id: a.id,
    signLabel: a.signLabel,
    lessonType: a.lessonType,
    predictedLabel: a.predictedLabel,
    correct: a.correct,
    confidence: Math.round(a.confidence * 100),
    createdAt: a.createdAt,
  }));

  const weakSigns = signProgress
    .filter((p) => p.attempts > 0 && !p.completed)
    .sort((a, b) => a.bestAccuracy - b.bestAccuracy)
    .slice(0, 5)
    .map((p) => ({
      signLabel: p.signLabel,
      lessonType: p.lessonType,
      bestAccuracy: Math.round(p.bestAccuracy * 100),
      attempts: p.attempts,
    }));

  const mastered = signProgress.filter((p) => p.completed).map((p) => p.signLabel);

  return NextResponse.json({
    error: null,
    range,
    activityData,
    completionData,
    recentActivity,
    weakSigns,
    mastered,
    summary: {
      xp: user.xp,
      lessonsCompleted: stats.lessonsCompleted,
      accuracy: Math.round(stats.overallAccuracy * 100),
      streakDays: user.streakDays,
      totalAttempts: stats.totalAttempts,
    },
  });
});
