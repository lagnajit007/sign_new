/**
 * Trusted-scoring policy.
 *
 * Recognition runs on the server inside /api/attempts (src/lib/recognizer), so
 * the client never submits a verdict and XP can't be forged. Scoring is on by
 * default; set SANJOG_SCORING_ENABLED=false to pause XP, streaks, mastery,
 * achievements and challenges without a redeploy of anything else. The learning
 * log (RecognitionAttempt rows) is always written.
 */

export function serverScoringEnabled(): boolean {
  return process.env.SANJOG_SCORING_ENABLED !== 'false';
}

/** Shown on the lesson screen when the API reports scoring is off. */
export const SCORING_UNAVAILABLE_BANNER =
  "Practice is being saved, but XP and streaks aren't being awarded right now.";

/** Fields that are NEVER writable by the client via profile/settings routes. */
export const TRUSTED_REWARD_FIELDS = [
  'xp',
  'streakDays',
  'lastActiveDate',
  'level',
  'completed',
  'unlockedAt',
  'progress',
  'rewardXp',
] as const;

export type TrustedRewardField = (typeof TRUSTED_REWARD_FIELDS)[number];
