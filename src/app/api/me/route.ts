import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { computeUserStats } from '@/lib/stats';
import { levelForXp, nextLevelXp, totalXpForLevel } from '@/lib/gamification';
import { apiError, withErrorHandling } from '@/lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withErrorHandling('me', async () => {
  const user = await getOrCreateUser();
  if (!user) return apiError('Unauthorized', 401);

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
    isDemo: user.isDemo,
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
});

export async function PATCH(request: Request) {
  try {
    const user = await getOrCreateUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    let body: unknown;
    try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid profile payload' }, { status: 400 });
    const input = body as Record<string, unknown>;
    const allowed = new Set(['name', 'username', 'bio', 'learningGoal', 'preferredLang', 'timezone', 'avatarId']);
    if (Object.keys(input).some((key) => !allowed.has(key))) return NextResponse.json({ error: 'Unknown profile field' }, { status: 400 });
    const data: Record<string, string | number | null> = {};
    const optionalText = (key: 'name' | 'bio' | 'learningGoal', max: number) => {
      if (!(key in input)) return null;
      if (input[key] !== null && typeof input[key] !== 'string') return 'invalid';
      const value = input[key] === null ? null : (input[key] as string).trim();
      if (value !== null && value.length > max) return 'invalid';
      data[key] = value || null;
      return null;
    };
    if (optionalText('name', 80) || optionalText('bio', 500) || optionalText('learningGoal', 200)) return NextResponse.json({ error: 'Invalid profile text value' }, { status: 400 });
    if ('username' in input) { if (typeof input.username !== 'string' || !/^[a-zA-Z0-9_]{3,30}$/.test(input.username)) return NextResponse.json({ error: 'Username must be 3-30 letters, numbers, or underscores' }, { status: 400 }); data.username = input.username.toLowerCase(); }
    if ('preferredLang' in input) { if (typeof input.preferredLang !== 'string' || !/^[a-z]{2,10}(-[A-Z]{2})?$/.test(input.preferredLang)) return NextResponse.json({ error: 'Invalid preferred language' }, { status: 400 }); data.preferredLang = input.preferredLang; }
    if ('timezone' in input) { if (typeof input.timezone !== 'string' || input.timezone.length > 64) return NextResponse.json({ error: 'Invalid timezone' }, { status: 400 }); data.timezone = input.timezone; }
    if ('avatarId' in input) { if (!Number.isInteger(input.avatarId) || (input.avatarId as number) < 1 || (input.avatarId as number) > 20) return NextResponse.json({ error: 'Invalid avatar' }, { status: 400 }); data.avatarId = input.avatarId as number; }
    if (!Object.keys(data).length) return NextResponse.json({ error: 'No profile fields provided' }, { status: 400 });
    const updated = await prisma.user.update({ where: { id: user.id }, data });
    return NextResponse.json({ success: true, user: updated });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return apiError('That username is already taken', 409);
    }
    console.error('[api/me] PATCH failed', err);
    return apiError('Failed to update profile', 500);
  }
}