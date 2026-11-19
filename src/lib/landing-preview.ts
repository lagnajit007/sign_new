import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";
import { computeUserStats } from "./stats";
import { levelForXp } from "./gamification";
import { displayName } from "./community";

/**
 * Data for the landing page's product preview: the real dashboard components
 * rendered with a seeded demo learner's practice history (labelled as such on
 * the page). Cached for an hour so the marketing page stays fast. Returns null
 * when there are no demo learners, and the page then skips the preview.
 */

export interface LandingPreview {
  learner: { name: string; avatarId: number; xp: number; level: number; streakDays: number };
  stats: { mastered: number; accuracy: number; attempts: number };
  week: { label: string; total: number; highlight: number }[];
  leaders: { id: string; name: string; avatarId: number; xp: number; level: number; streakDays: number }[];
}

const DAY = 86_400_000;

async function load(): Promise<LandingPreview | null> {
  const leaders = await prisma.user.findMany({
    where: { isDemo: true },
    orderBy: { xp: "desc" },
    take: 5,
    select: { id: true, name: true, username: true, avatarId: true, xp: true, streakDays: true, lastActiveDate: true },
  });
  const top = leaders[0];
  if (!top) return null;

  // The week leading up to the learner's last practice, so a stale seed still shows activity.
  const end = top.lastActiveDate ?? new Date();
  const endDay = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  const start = new Date(endDay - 6 * DAY);

  const [stats, attempts] = await Promise.all([
    computeUserStats(top.id),
    prisma.recognitionAttempt.findMany({
      where: { userId: top.id, createdAt: { gte: start, lt: new Date(endDay + DAY) } },
      select: { createdAt: true, correct: true },
    }),
  ]);

  const week = Array.from({ length: 7 }, (_, i) => {
    const s = start.getTime() + i * DAY;
    const inDay = attempts.filter((a) => a.createdAt.getTime() >= s && a.createdAt.getTime() < s + DAY);
    return {
      label: new Date(s).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      total: inDay.length,
      highlight: inDay.filter((a) => a.correct).length,
    };
  });

  return {
    learner: {
      name: displayName(top),
      avatarId: top.avatarId,
      xp: top.xp,
      level: levelForXp(top.xp),
      streakDays: top.streakDays,
    },
    stats: {
      mastered: stats.lessonsCompleted,
      accuracy: Math.round(stats.overallAccuracy * 100),
      attempts: stats.totalAttempts,
    },
    week,
    leaders: leaders.map((u) => ({
      id: u.id,
      name: displayName(u),
      avatarId: u.avatarId,
      xp: u.xp,
      level: levelForXp(u.xp),
      streakDays: u.streakDays,
    })),
  };
}

export const getLandingPreview = unstable_cache(
  async () => {
    try {
      return await load();
    } catch (err) {
      console.error("[landing-preview] failed", err);
      return null;
    }
  },
  ["landing-preview-v1"],
  { revalidate: 3600 },
);
