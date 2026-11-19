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
import { serverScoringEnabled } from '@/lib/scoring-policy';
import { isValidFeatures, recognize } from '@/lib/recognizer';
import { challengeCount, periodStart } from '@/lib/challenges';
import { apiError } from '@/lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const NUMBERS = '0123456789'.split('');

/** Per-user write budget: at most this many attempts per window. */
const RATE_LIMIT_COUNT = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;

interface AttemptBody {
  signLabel?: unknown;
  lessonType?: unknown;
  /** 42 hand-shape features (see landmarksToFeatures). */
  features?: unknown;
}

/**
 * Record a recognition attempt. The client sends the hand-shape features, not a
 * verdict: the server runs the recognizer itself, so the result (and any XP)
 * can't be forged. Attempts are always logged; rewards require scoring to be on.
 */
export async function POST(request: Request) {
  try {
    const user = await getOrCreateUser();
    if (!user) return apiError('Unauthorized', 401);
    if (user.isDemo) return apiError('Demo accounts are read-only', 403);

    let body: AttemptBody;
    try {
      body = await request.json();
    } catch {
      return apiError('Invalid JSON body', 400);
    }

    const { signLabel, lessonType, features } = body;
    const allowed = lessonType === 'alphabet' ? ALPHABET : lessonType === 'number' ? NUMBERS : [];
    if (typeof signLabel !== 'string' || typeof lessonType !== 'string' || !allowed.includes(signLabel)) {
      return apiError('Missing or invalid attempt fields', 400);
    }
    if (!isValidFeatures(features)) {
      return apiError('features must be 42 hand-shape values between 0 and 1', 400);
    }
    const { prediction: predictedLabel, confidence } = recognize(features);

    // Simple per-user rate limit backed by the attempts table (works on serverless).
    const recent = await prisma.recognitionAttempt.count({
      where: { userId: user.id, createdAt: { gte: new Date(Date.now() - RATE_LIMIT_WINDOW_MS) } },
    });
    if (recent >= RATE_LIMIT_COUNT) return apiError('Too many attempts, slow down a little', 429);

    const scoring = serverScoringEnabled();

    const correct = predictedLabel === signLabel && confidence >= RECOGNITION_CONFIDENCE_THRESHOLD;
    const now = new Date();

    const result = await prisma.$transaction(
      async (tx) => {
        // 1) Learning log.
        await tx.recognitionAttempt.create({
          data: { userId: user.id, signLabel, lessonType, predictedLabel, confidence, correct },
        });

        if (!scoring) return null;

        // 2) Per-sign progress.
        const existing = await tx.signProgress.findUnique({
          where: { userId_signLabel: { userId: user.id, signLabel } },
        });
        const wasAlreadyCompleted = existing?.completed ?? false;
        const outcome = applyAttempt({ correct, confidence, wasAlreadyCompleted });
        const completesNow = correct && !wasAlreadyCompleted;

        await tx.signProgress.upsert({
          where: { userId_signLabel: { userId: user.id, signLabel } },
          update: {
            attempts: { increment: 1 },
            bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, confidence),
            ...(completesNow ? { completed: true, completedAt: now } : {}),
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

        // 3) XP (atomic increment) and streak.
        const fresh = await tx.user.findUniqueOrThrow({ where: { id: user.id } });
        const streakDays = computeStreak(fresh.streakDays, fresh.lastActiveDate, now);
        await tx.user.update({
          where: { id: user.id },
          data: { xp: { increment: outcome.xpGained }, streakDays, lastActiveDate: now },
        });

        // 4) Challenges: pay each reward once per period window.
        let bonusXp = 0;
        const completedChallenges: { key: string; name: string; rewardXp: number }[] = [];
        const challenges = await tx.challenge.findMany();
        for (const ch of challenges) {
          const count = await challengeCount(tx, user.id, ch.key, ch.period, streakDays, now);
          const progress = Math.min(count, ch.goal);
          await tx.userChallenge.upsert({
            where: { userId_challengeId: { userId: user.id, challengeId: ch.id } },
            update: {},
            create: { userId: user.id, challengeId: ch.id, progress },
          });
          if (count >= ch.goal) {
            const claimed = await tx.userChallenge.updateMany({
              where: {
                userId: user.id,
                challengeId: ch.id,
                OR: [{ completedAt: null }, { completedAt: { lt: periodStart(ch.period, now) } }],
              },
              data: { completed: true, completedAt: now, progress },
            });
            if (claimed.count === 1) {
              bonusXp += ch.rewardXp;
              completedChallenges.push({ key: ch.key, name: ch.name, rewardXp: ch.rewardXp });
            }
          } else {
            await tx.userChallenge.update({
              where: { userId_challengeId: { userId: user.id, challengeId: ch.id } },
              data: { progress },
            });
          }
        }

        // 5) Achievements: conditional update so each unlock is paid exactly once.
        const stats = await computeUserStats(user.id, tx);
        const unlockedAchievements: { key: string; name: string; xpReward: number }[] = [];
        const catalog = await tx.achievement.findMany();
        for (const ach of catalog) {
          const progress = criteriaProgress(ach.criteriaType, ach.criteriaValue, stats);
          await tx.userAchievement.upsert({
            where: { userId_achievementId: { userId: user.id, achievementId: ach.id } },
            update: {},
            create: { userId: user.id, achievementId: ach.id, progress },
          });
          if (isCriteriaMet(ach.criteriaType, ach.criteriaValue, stats)) {
            const claimed = await tx.userAchievement.updateMany({
              where: { userId: user.id, achievementId: ach.id, unlockedAt: null },
              data: { unlockedAt: now, progress: 100 },
            });
            if (claimed.count === 1) {
              bonusXp += ach.xpReward;
              unlockedAchievements.push({ key: ach.key, name: ach.name, xpReward: ach.xpReward });
            }
          } else {
            await tx.userAchievement.updateMany({
              where: { userId: user.id, achievementId: ach.id, unlockedAt: null },
              data: { progress },
            });
          }
        }

        // 6) Bonus XP and level.
        const afterXp = await tx.user.update({
          where: { id: user.id },
          data: { xp: { increment: bonusXp } },
          select: { xp: true },
        });
        const level = levelForXp(afterXp.xp);
        await tx.user.update({ where: { id: user.id }, data: { level } });

        return {
          xpGained: outcome.xpGained + bonusXp,
          totalXp: afterXp.xp,
          level,
          leveledUp: level > fresh.level,
          streakDays,
          newlyCompleted: outcome.newlyCompleted,
          unlockedAchievements,
          completedChallenges,
        };
      },
      { timeout: 15_000, maxWait: 5_000 },
    );

    if (!result) {
      return NextResponse.json({ error: null, scoringEnabled: false, correct, predictedLabel, confidence, xpGained: 0 });
    }

    return NextResponse.json({ error: null, scoringEnabled: true, correct, predictedLabel, confidence, ...result });
  } catch (err) {
    console.error('[api/attempts] failed', err);
    return apiError('Failed to record attempt', 500);
  }
}
