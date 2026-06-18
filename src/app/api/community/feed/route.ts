import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/// Community activity feed: recent recognition attempts across all users who
/// have opted in to sharing their activity (showActivity = true).
export async function GET(request: Request) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 20, 1), 50);

  const attempts = await prisma.recognitionAttempt.findMany({
    where: {
      user: {
        settings: { showActivity: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarId: true,
          xp: true,
          level: true,
        },
      },
    },
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
      name: a.user.name ?? 'Learner',
      username: a.user.username,
      avatarId: a.user.avatarId,
      xp: a.user.xp,
      level: a.user.level,
    },
  }));

  return NextResponse.json({ error: null, feed });
}
