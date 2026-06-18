// Pure gamification rules. Kept free of Prisma/Clerk so they're easy to reason
// about and unit-test. API routes call these and persist the results.

export const XP_PER_CORRECT_SIGN = 10;
export const XP_SIGN_MASTERED_BONUS = 40; // awarded the first time a sign is completed
export const RECOGNITION_CONFIDENCE_THRESHOLD = 0.7;

/// Total cumulative XP required to have reached a given level.
/// Level 1 starts at 0 XP; each level costs a growing amount.
export function totalXpForLevel(level: number): number {
  if (level <= 1) return 0;
  // Quadratic-ish curve: level N requires 100 * (N-1) * N / 2 cumulative XP.
  // L2=100, L3=300, L4=600, L5=1000, ...
  return (100 * (level - 1) * level) / 2;
}

/// The level a user is at for a given cumulative XP total.
export function levelForXp(xp: number): number {
  let level = 1;
  while (totalXpForLevel(level + 1) <= xp) {
    level += 1;
  }
  return level;
}

/// XP needed to reach the next level (cumulative), for progress bars.
export function nextLevelXp(xp: number): number {
  const level = levelForXp(xp);
  return totalXpForLevel(level + 1);
}

export interface AttemptInput {
  correct: boolean;
  confidence: number;
  /** Whether this sign had not been completed before this attempt. */
  wasAlreadyCompleted: boolean;
}

export interface AttemptOutcome {
  xpGained: number;
  /** True if this attempt newly completes (masters) the sign. */
  newlyCompleted: boolean;
}

/// Decide XP and completion for a single recognition attempt.
/// A correct, confident attempt awards base XP; the first time a sign is
/// confidently signed correctly it is "mastered" and earns a bonus.
export function applyAttempt(input: AttemptInput): AttemptOutcome {
  if (!input.correct || input.confidence < RECOGNITION_CONFIDENCE_THRESHOLD) {
    return { xpGained: 0, newlyCompleted: false };
  }
  const newlyCompleted = !input.wasAlreadyCompleted;
  const xpGained = XP_PER_CORRECT_SIGN + (newlyCompleted ? XP_SIGN_MASTERED_BONUS : 0);
  return { xpGained, newlyCompleted };
}

/// Snapshot of a user's stats used to evaluate achievement criteria.
export interface UserStats {
  lessonsCompleted: number; // distinct signs completed
  alphabetCompleted: number;
  numberCompleted: number;
  streakDays: number;
  bestSessionAccuracy: number; // 0..1, highest single-attempt confidence on a correct sign
  challengesCompleted: number;
}

/// Returns the set of achievement criteria types that are currently satisfied,
/// mapped to whether they're met. The API joins this against the catalog to
/// figure out which achievements to unlock and how to show progress.
export function isCriteriaMet(
  criteriaType: string,
  criteriaValue: number,
  stats: UserStats,
): boolean {
  switch (criteriaType) {
    case 'lessons_completed':
      return stats.lessonsCompleted >= criteriaValue;
    case 'signs_completed':
      return stats.lessonsCompleted >= criteriaValue;
    case 'alphabet_completed':
      return stats.alphabetCompleted >= criteriaValue;
    case 'number_completed':
      return stats.numberCompleted >= criteriaValue;
    case 'streak_days':
      return stats.streakDays >= criteriaValue;
    case 'perfect_session':
      return stats.bestSessionAccuracy >= 1;
    case 'challenges_completed':
      return stats.challengesCompleted >= criteriaValue;
    default:
      // "manual" / social criteria not yet automatable in V1.
      return false;
  }
}

/// Progress (0..100) toward a criteria, for not-yet-earned achievements.
export function criteriaProgress(
  criteriaType: string,
  criteriaValue: number,
  stats: UserStats,
): number {
  if (criteriaValue <= 0) return 0;
  let current = 0;
  switch (criteriaType) {
    case 'lessons_completed':
    case 'signs_completed':
      current = stats.lessonsCompleted;
      break;
    case 'alphabet_completed':
      current = stats.alphabetCompleted;
      break;
    case 'number_completed':
      current = stats.numberCompleted;
      break;
    case 'streak_days':
      current = stats.streakDays;
      break;
    case 'perfect_session':
      current = Math.round(stats.bestSessionAccuracy * criteriaValue);
      break;
    case 'challenges_completed':
      current = stats.challengesCompleted;
      break;
    default:
      return 0;
  }
  return Math.min(100, Math.round((current / criteriaValue) * 100));
}

/// Compute the new streak day-count from the previous streak and last-active
/// date. Same calendar day = unchanged; consecutive day = +1; any gap = reset
/// to 1. A null lastActiveDate means this is the user's first activity.
export function computeStreak(
  previousStreak: number,
  lastActiveDate: Date | null,
  now: Date,
): number {
  if (!lastActiveDate) return Math.max(1, previousStreak);
  const dayMs = 24 * 60 * 60 * 1000;
  const startOfDay = (d: Date) => Math.floor(d.getTime() / dayMs);
  const diff = startOfDay(now) - startOfDay(lastActiveDate);
  if (diff <= 0) return Math.max(1, previousStreak); // same day, unchanged
  if (diff === 1) return previousStreak + 1; // consecutive day
  return 1; // gap, reset
}
