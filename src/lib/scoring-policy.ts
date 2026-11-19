/**
 * Trusted-scoring policy.
 *
 * XP, streaks, sign mastery, achievements and challenges are only awarded for
 * recognition results that carry a valid HMAC signature from the recognition
 * backend (see src/lib/recognition-signature.ts). Scoring additionally requires
 * the deployment flag, so it can be switched off without a redeploy of the
 * backend:
 *
 *   SANJOG_SCORING_ENABLED=true   and   RECOGNITION_SIGNING_SECRET=<shared secret>
 *
 * The learning log (RecognitionAttempt rows) is never gated: practice history
 * stays useful even while scoring is off.
 */

export function serverScoringEnabled(): boolean {
  return process.env.SANJOG_SCORING_ENABLED === 'true' && Boolean(process.env.RECOGNITION_SIGNING_SECRET);
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
