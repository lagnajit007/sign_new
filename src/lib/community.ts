import type { Prisma } from '@prisma/client';

/**
 * One place for "who may appear in public lists". Used by the leaderboard,
 * the community feed and the server-rendered dashboard so they can't drift.
 *
 * - Users without a settings row get the defaults (public, visible).
 * - Seeded demo learners are shown unless SHOW_DEMO_USERS=false.
 */

export function showDemoUsers(): boolean {
  return process.env.SHOW_DEMO_USERS !== 'false';
}

function demoFilter(): Prisma.UserWhereInput {
  return showDemoUsers() ? {} : { isDemo: false };
}

/** Users who may appear on leaderboards. */
export function leaderboardUserWhere(): Prisma.UserWhereInput {
  return {
    ...demoFilter(),
    OR: [
      { settings: { is: null } },
      { settings: { is: { showLeaderboard: true, profileVisibility: 'public' } } },
    ],
  };
}

/** Users whose activity may appear in the community feed. */
export function activityUserWhere(): Prisma.UserWhereInput {
  return {
    ...demoFilter(),
    OR: [
      { settings: { is: null } },
      { settings: { is: { showActivity: true, profileVisibility: 'public' } } },
    ],
  };
}

/** Public-safe user fields for lists. Never includes email or clerkId. */
export const publicUserSelect = {
  id: true,
  name: true,
  username: true,
  avatarId: true,
  xp: true,
  level: true,
  streakDays: true,
  isDemo: true,
  lastActiveDate: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;

export function displayName(u: { name: string | null; username: string | null }): string {
  return u.name || (u.username ? `@${u.username}` : 'Learner');
}
