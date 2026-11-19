import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
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
import { verifyRecognition } from '@/lib/recognition-signature';
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
  predictedLabel?: unknown;
  confidence?: unknown;
  issuedAt?: unknown;
  nonce?: unknown;
  signature?: unknown;
}

/**
 * Record a recognition attempt. The attempt is always logged; XP, streak,
 * mastery, achievements and challenges are only awarded when scoring is enabled
 * and the result carries a valid signature from the recognition backend.
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

    const { signLabel, lessonType, predictedLabel, confidence } = body;
    const allowed = lessonType === 'alphabet' ? ALPHABET : lessonType === 'number' ? NUMBERS : [];
    // The model can predict any of A–Z/0–9 regardless of the lesson.
    const anyLabel = [...ALPHABET, ...NUMBERS];
    if (
      typeof signLabel !== 'string' ||
      typeof lessonType !== 'string' ||
      typeof predictedLabel !== 'string' ||
      typeof confidence !== 'number' || !Number.isFinite(confidence) || confidence < 0 || confidence > 1 ||
      !allowed.includes(signLabel) || !anyLabel.includes(predictedLabel)
    ) {
      return apiError('Missing or invalid attempt fields', 400);
    }

    // Simple per-user rate limit backed by the attempts table (works on serverless).
    const recent = await prisma.recognitionAttempt.count({
      where: { userId: user.id, createdAt: { gte: new Date(Date.now() - RATE_LIMIT_WINDOW_MS) } },
    });
    if (recent >= RATE_LIMIT_COUNT) return apiError('Too many attempts, slow down a little', 429);

    const verification = verifyRecognition({
      predictedLabel,
      confidence,
      issuedAt: typeof body.issuedAt === 'number' ? body.issuedAt : undefined,
      nonce: typeof body.nonce === 'string' ? body.nonce : undefined,
      signature: typeof body.signature === 'string' ? body.signature : undefined,
    });
    const scoring = serverScoringEnabled() && verification.ok;
    const nonce = verification.ok ? (body.nonce as string) : null;

    const correct = predictedLabel === signLabel && confidence >= RECOGNITION_CONFIDENCE_THRESHOLD;
    const now = new Date();

    const result = await prisma.$transaction(
      async (tx) => {
        // 1) Learning log. The unique nonce makes a signed result redeemable once.
        await tx.recognitionAttempt.create({
          data: { userId: user.id, signLabel, lessonType, predictedLabel, confidence, correct, nonce },
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
      return NextResponse.json({
        error: null,
        scoringEnabled: false,
        reason: serverScoringEnabled() ? verification.ok ? null : verification.reason : 'disabled',
        correct,
        xpGained: 0,
      });
    }

    return NextResponse.json({ error: null, scoringEnabled: true, correct, ...result });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return apiError('This recognition result was already recorded', 409);
    }
    console.error('[api/attempts] failed', err);
    return apiError('Failed to record attempt', 500);
  }
}
