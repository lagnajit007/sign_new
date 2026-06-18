import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { computeUserStats } from '@/lib/stats';
import {
  applyAttempt,
  computeStreak,
  criteriaProgress,
  isCriteriaMet,
  levelForXp,
  RECOGNITION_CONFIDENCE_THRESHOLD,
} from '@/lib/gamification';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AttemptBody {
  signLabel?: string;
  lessonType?: string;
  predictedLabel?: string;
  confidence?: number;
  correct?: boolean;
}

/// Record a recognition attempt, update progress/XP/streak/achievements, and
/// return what changed so the lesson UI can celebrate it.
export async function POST(request: Request) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: AttemptBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { signLabel, lessonType, predictedLabel, confidence, correct } = body;
  if (
    typeof signLabel !== 'string' ||
    typeof lessonType !== 'string' ||
    typeof predictedLabel !== 'string' ||
    typeof confidence !== 'number' ||
    typeof correct !== 'boolean'
  ) {
    return NextResponse.json({ error: 'Missing or invalid attempt fields' }, { status: 400 });
  }

  const now = new Date();

  // 1) Log the attempt (append-only).
  await prisma.recognitionAttempt.create({
    data: {
      userId: user.id,
      signLabel,
      lessonType,
      predictedLabel,
      confidence,
      correct,
    },
  });

  // 2) Update per-sign progress.
  const existingProgress = await prisma.signProgress.findUnique({
    where: { userId_signLabel: { userId: user.id, signLabel } },
  });
  const wasAlreadyCompleted = existingProgress?.completed ?? false;

  const outcome = applyAttempt({
    correct,
    confidence,
    wasAlreadyCompleted,
  });

  const completesNow =
    correct && confidence >= RECOGNITION_CONFIDENCE_THRESHOLD;

  await prisma.signProgress.upsert({
    where: { userId_signLabel: { userId: user.id, signLabel } },
    update: {
      attempts: { increment: 1 },
      bestAccuracy: Math.max(existingProgress?.bestAccuracy ?? 0, confidence),
      completed: wasAlreadyCompleted || completesNow,
      completedAt: wasAlreadyCompleted
        ? existingProgress?.completedAt
        : completesNow
          ? now
          : null,
    },
    create: {
      userId: user.id,
      signLabel,
      lessonType,
      attempts: 1,
      bestAccuracy: confidence,
      completed: completesNow,
      completedAt: completesNow ? now : null,
    },
  });

  // 3) Update XP, level, and streak on the user.
  const newStreak = computeStreak(user.streakDays, user.lastActiveDate, now);
  const newXp = user.xp + outcome.xpGained;
  const newLevel = levelForXp(newXp);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      xp: newXp,
      level: newLevel,
      streakDays: newStreak,
      lastActiveDate: now,
    },
  });

  // 4) Re-evaluate achievements against fresh stats.
  const stats = await computeUserStats(user.id);
  const catalog = await prisma.achievement.findMany();
  const existingUnlocks = await prisma.userAchievement.findMany({
    where: { userId: user.id },
  });
  const unlockedById = new Map(existingUnlocks.map((u) => [u.achievementId, u]));

  const unlockedAchievements: { key: string; name: string; xpReward: number }[] = [];
  let bonusXp = 0;

  for (const ach of catalog) {
    const met = isCriteriaMet(ach.criteriaType, ach.criteriaValue, stats);
    const progress = criteriaProgress(ach.criteriaType, ach.criteriaValue, stats);
    const prior = unlockedById.get(ach.id);
    const alreadyUnlocked = Boolean(prior?.unlockedAt);

    if (met && !alreadyUnlocked) {
      await prisma.userAchievement.upsert({
        where: { userId_achievementId: { userId: user.id, achievementId: ach.id } },
        update: { unlockedAt: now, progress: 100 },
        create: { userId: user.id, achievementId: ach.id, unlockedAt: now, progress: 100 },
      });
      bonusXp += ach.xpReward;
      unlockedAchievements.push({ key: ach.key, name: ach.name, xpReward: ach.xpReward });
    } else if (!alreadyUnlocked) {
      // Keep progress fresh for not-yet-earned achievements.
      await prisma.userAchievement.upsert({
        where: { userId_achievementId: { userId: user.id, achievementId: ach.id } },
        update: { progress },
        create: { userId: user.id, achievementId: ach.id, progress },
      });
    }
  }

  // 5) Apply achievement bonus XP (may bump the level again).
  let finalXp = newXp;
  let finalLevel = newLevel;
  if (bonusXp > 0) {
    finalXp = newXp + bonusXp;
    finalLevel = levelForXp(finalXp);
    await prisma.user.update({
      where: { id: user.id },
      data: { xp: finalXp, level: finalLevel },
    });
  }

  return NextResponse.json({
    error: null,
    xpGained: outcome.xpGained + bonusXp,
    totalXp: finalXp,
    level: finalLevel,
    leveledUp: finalLevel > user.level,
    streakDays: newStreak,
    newlyCompleted: outcome.newlyCompleted,
    unlockedAchievements,
  });
}
