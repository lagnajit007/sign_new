import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { apiError, withErrorHandling } from '@/lib/api';
import { activityUserWhere, displayName, publicUserSelect } from '@/lib/community';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Recent correct signs from users who share their activity. */
export const GET = withErrorHandling('community/feed', async (request: Request) => {
  const user = await getOrCreateUser();
  if (!user) return apiError('Unauthorized', 401);

  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 20, 1), 50);

  const attempts = await prisma.recognitionAttempt.findMany({
    where: { correct: true, user: activityUserWhere() },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { user: { select: publicUserSelect } },
  });

  const feed = attempts.map((a) => ({
    id: a.id,
    userId: a.userId,
    signLabel: a.signLabel,
    lessonType: a.lessonType,
    correct: a.correct,
    confidence: Math.round(a.confidence * 100),
    createdAt: a.createdAt,
    user: {
      name: displayName(a.user),
      username: a.user.username,
      avatarId: a.user.avatarId,
      xp: a.user.xp,
      level: a.user.level,
      isDemo: a.user.isDemo,
    },
  }));

  return NextResponse.json({ error: null, feed });
});
