import { PrismaClient, type Prisma } from '@prisma/client';
import {
  applyAttempt,
  isCriteriaMet,
  levelForXp,
  RECOGNITION_CONFIDENCE_THRESHOLD,
  type UserStats,
} from '../src/lib/gamification';

const prisma = new PrismaClient();

// ── Catalogs ────────────────────────────────────────────────────────────────
// `color` is a single hex accent rendered with inline styles (no Tailwind
// class strings in the database). Every criteriaType here is evaluated
// automatically in src/lib/gamification.ts; every challenge key is evaluated
// in src/lib/challenges.ts.

const achievements = [
  { key: 'first-step', name: 'First Step', description: 'Master your first sign', category: 'beginner', icon: '🚀', color: '#F97316', xpReward: 50, criteriaType: 'lessons_completed', criteriaValue: 1 },
  { key: 'quick-learner', name: 'Quick Learner', description: 'Master 5 signs', category: 'beginner', icon: '⚡', color: '#7C3AED', xpReward: 100, criteriaType: 'lessons_completed', criteriaValue: 5 },
  { key: 'lessons-10', name: 'Dedicated Learner', description: 'Master 10 signs', category: 'commitment', icon: '📚', color: '#6366F1', xpReward: 150, criteriaType: 'lessons_completed', criteriaValue: 10 },
  { key: 'number-whiz', name: 'Number Whiz', description: 'Master all 10 number signs', category: 'intermediate', icon: '🔢', color: '#0EA5E9', xpReward: 200, criteriaType: 'number_completed', criteriaValue: 10 },
  { key: 'alphabet-master', name: 'Alphabet Master', description: 'Master all 26 letter signs', category: 'intermediate', icon: '🔤', color: '#2563EB', xpReward: 300, criteriaType: 'alphabet_completed', criteriaValue: 26 },
  { key: 'three-day-streak', name: 'On a Roll', description: 'Practice 3 days in a row', category: 'commitment', icon: '🌱', color: '#16A34A', xpReward: 75, criteriaType: 'streak_days', criteriaValue: 3 },
  { key: 'week-warrior', name: 'Week Warrior', description: 'Practice 7 days in a row', category: 'commitment', icon: '🔥', color: '#EA580C', xpReward: 150, criteriaType: 'streak_days', criteriaValue: 7 },
  { key: 'challenge-champion', name: 'Challenge Champion', description: 'Complete 10 challenges', category: 'advanced', icon: '🏆', color: '#CA8A04', xpReward: 300, criteriaType: 'challenges_completed', criteriaValue: 10 },
];

const challenges = [
  { key: 'daily-practice', name: 'Daily Practice', description: 'Sign 15 letters or numbers correctly today', category: 'daily', difficulty: 'easy', icon: '✋', color: '#7C3AED', rewardXp: 50, goal: 15, period: 'daily' },
  { key: 'alphabet-rush', name: 'Alphabet Rush', description: 'Master 3 new letter signs today', category: 'daily', difficulty: 'medium', icon: '🔤', color: '#2563EB', rewardXp: 100, goal: 3, period: 'daily' },
  { key: 'weekly-variety', name: 'Variety Week', description: 'Sign 12 different signs correctly this week', category: 'weekly', difficulty: 'medium', icon: '🎯', color: '#DB2777', rewardXp: 150, goal: 12, period: 'weekly' },
  { key: 'seven-day-streak', name: '7-Day Streak', description: 'Practice 7 days in a row', category: 'monthly', difficulty: 'medium', icon: '🔥', color: '#EA580C', rewardXp: 250, goal: 7, period: 'monthly' },
  { key: 'number-master', name: 'Number Master', description: 'Master all number signs (0–9)', category: 'milestone', difficulty: 'hard', icon: '🔢', color: '#0EA5E9', rewardXp: 300, goal: 10, period: 'none' },
  { key: 'alphabet-complete', name: 'Full Alphabet', description: 'Master all 26 letter signs', category: 'milestone', difficulty: 'hard', icon: '🏅', color: '#CA8A04', rewardXp: 500, goal: 26, period: 'none' },
];

// ── Demo learners ───────────────────────────────────────────────────────────
// Clearly labelled sample accounts (isDemo = true, clerkId "demo_*") so the
// leaderboard and feed aren't empty before real users join. They can never
// sign in, and SHOW_DEMO_USERS=false hides them everywhere.

const DEMO_LEARNERS = [
  { slug: 'aarav', pace: 1.2, name: 'Aarav Mehta', username: 'aarav_signs', avatarId: 2, skill: 0.9, activity: 0.9, goal: 'Talk with my cousin who is Deaf' },
  { slug: 'priya', pace: 1.1, name: 'Priya Nair', username: 'priya_n', avatarId: 3, skill: 0.85, activity: 0.8, goal: 'Finish the alphabet this month' },
  { slug: 'rohan', pace: 1.0, name: 'Rohan Das', username: 'rohan_d', avatarId: 4, skill: 0.75, activity: 0.7, goal: 'Practice 10 minutes a day' },
  { slug: 'ananya', pace: 1.0, name: 'Ananya Iyer', username: 'ananya', avatarId: 5, skill: 0.8, activity: 0.55, goal: 'Learn numbers for work' },
  { slug: 'kabir', pace: 0.9, name: 'Kabir Singh', username: 'kabir_s', avatarId: 6, skill: 0.65, activity: 0.5, goal: null },
  { slug: 'meera', pace: 0.8, name: 'Meera Joshi', username: 'meera_j', avatarId: 7, skill: 0.7, activity: 0.4, goal: 'Sign my name fluently' },
  { slug: 'arjun', pace: 0.8, name: 'Arjun Rao', username: 'arjun_r', avatarId: 8, skill: 0.6, activity: 0.3, goal: null },
  { slug: 'ishita', pace: 0.7, name: 'Ishita Banerjee', username: 'ishita_b', avatarId: 1, skill: 0.55, activity: 0.2, goal: 'Just getting started' },
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const NUMBERS = '0123456789'.split('');
const DAYS = 30;
const DAY_MS = 86_400_000;

/** Deterministic PRNG (mulberry32) so the demo data is the same on every seed. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

async function seedCatalog() {
  // Remove catalog entries that no longer exist (e.g. old unearnable ones).
  await prisma.achievement.deleteMany({ where: { key: { notIn: achievements.map((a) => a.key) } } });
  await prisma.challenge.deleteMany({ where: { key: { notIn: challenges.map((c) => c.key) } } });
  for (const a of achievements) {
    await prisma.achievement.upsert({ where: { key: a.key }, update: a, create: a });
  }
  for (const c of challenges) {
    await prisma.challenge.upsert({ where: { key: c.key }, update: c, create: c });
  }
}

async function seedDemoLearner(learner: (typeof DEMO_LEARNERS)[number], now: Date) {
  const rand = rng(hashString(learner.slug));
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  // Learners work through numbers first if they want them, else the alphabet.
  const order = learner.slug === 'ananya' ? [...NUMBERS, ...ALPHABET] : [...ALPHABET, ...NUMBERS];
  const typeOf = (s: string) => (NUMBERS.includes(s) ? 'number' : 'alphabet');

  const attempts: Omit<Prisma.RecognitionAttemptCreateManyInput, 'userId'>[] = [];
  const progress = new Map<string, { attempts: number; best: number; completedAt: Date | null }>();
  const activeDays: number[] = [];
  let cursor = 0; // index into `order` of the sign being learned
  let xp = 0;

  // Most recent days are more likely to be active so streaks look natural.
  for (let d = DAYS - 1; d >= 0; d--) {
    const recencyBoost = d < 7 ? 0.15 : 0;
    if (rand() > learner.activity + recencyBoost) continue;
    activeDays.push(d);
    const dayStart = today - d * DAY_MS;
    const sessionStart = dayStart + (8 + Math.floor(rand() * 13)) * 3_600_000; // 08:00–21:00 UTC
    const count = 6 + Math.floor(rand() * 18);
    // New signs this learner can master today (e.g. pace 1.2 → 1, sometimes 2).
    let newAllowance = Math.floor(learner.pace) + (rand() < learner.pace % 1 ? 1 : 0);

    for (let i = 0; i < count; i++) {
      // Mostly practise the current sign, sometimes review an earlier one.
      const review = cursor > 0 && (newAllowance <= 0 || rand() < 0.3);
      const sign = order[review ? Math.floor(rand() * cursor) : Math.min(cursor, order.length - 1)];
      const isCorrect = rand() < learner.skill;
      const confidence = isCorrect
        ? Math.min(0.99, RECOGNITION_CONFIDENCE_THRESHOLD + 0.05 + rand() * 0.25)
        : 0.3 + rand() * 0.45;
      const predicted = isCorrect ? sign : order[Math.floor(rand() * order.length)];
      const correct = predicted === sign && confidence >= RECOGNITION_CONFIDENCE_THRESHOLD;
      const createdAt = new Date(Math.min(sessionStart + i * (40_000 + rand() * 80_000), now.getTime() - 60_000));

      const p = progress.get(sign) ?? { attempts: 0, best: 0, completedAt: null };
      const outcome = applyAttempt({ correct, confidence, wasAlreadyCompleted: p.completedAt !== null });
      xp += outcome.xpGained;
      p.attempts += 1;
      p.best = Math.max(p.best, confidence);
      if (outcome.newlyCompleted) {
        p.completedAt = createdAt;
        if (!review) {
          cursor = Math.min(cursor + 1, order.length);
          newAllowance -= 1;
        }
      }
      progress.set(sign, p);

      attempts.push({ signLabel: sign, lessonType: typeOf(sign), predictedLabel: predicted, confidence: Math.round(confidence * 10000) / 10000, correct, createdAt });
    }
  }

  // Streak: consecutive active days ending today or yesterday.
  const active = new Set(activeDays);
  let streakDays = 0;
  for (let d = active.has(0) ? 0 : 1; active.has(d); d++) streakDays++;
  const lastActiveDate = attempts.length ? attempts.reduce((m, a) => (a.createdAt! > m ? (a.createdAt as Date) : m), new Date(0)) : null;

  const completed = [...progress.entries()].filter(([, p]) => p.completedAt);
  const stats: UserStats = {
    lessonsCompleted: completed.length,
    alphabetCompleted: completed.filter(([s]) => typeOf(s) === 'alphabet').length,
    numberCompleted: completed.filter(([s]) => typeOf(s) === 'number').length,
    streakDays,
    bestSessionAccuracy: Math.max(0, ...attempts.filter((a) => a.correct).map((a) => a.confidence)),
    challengesCompleted: 0,
  };

  const catalog = await prisma.achievement.findMany();
  const unlocked = catalog.filter((a) => isCriteriaMet(a.criteriaType, a.criteriaValue, stats));
  xp += unlocked.reduce((sum, a) => sum + a.xpReward, 0);

  const user = await prisma.user.create({
    data: {
      clerkId: `demo_${learner.slug}`,
      name: learner.name,
      username: learner.username,
      learningGoal: learner.goal,
      avatarId: learner.avatarId,
      isDemo: true,
      xp,
      level: levelForXp(xp),
      streakDays,
      lastActiveDate,
      createdAt: new Date(today - DAYS * DAY_MS),
      settings: { create: {} },
    },
  });

  await prisma.recognitionAttempt.createMany({ data: attempts.map((a) => ({ ...a, userId: user.id })) });
  await prisma.signProgress.createMany({
    data: [...progress.entries()].map(([sign, p]) => ({
      userId: user.id,
      signLabel: sign,
      lessonType: typeOf(sign),
      attempts: p.attempts,
      bestAccuracy: Math.round(p.best * 10000) / 10000,
      completed: p.completedAt !== null,
      completedAt: p.completedAt,
    })),
  });
  if (unlocked.length) {
    await prisma.userAchievement.createMany({
      data: unlocked.map((a) => ({ userId: user.id, achievementId: a.id, progress: 100, unlockedAt: lastActiveDate ?? now })),
    });
  }

  return { name: learner.name, xp, streakDays, mastered: completed.length, attempts: attempts.length };
}

async function main() {
  await seedCatalog();
  console.log(`Seeded ${achievements.length} achievements and ${challenges.length} challenges.`);

  if (process.env.SEED_DEMO_USERS === 'false') {
    console.log('SEED_DEMO_USERS=false — skipping demo learners.');
    return;
  }

  // Idempotent: replace all demo learners (cascades to their data). Real users are untouched.
  await prisma.user.deleteMany({ where: { isDemo: true } });
  const now = new Date();
  for (const learner of DEMO_LEARNERS) {
    const r = await seedDemoLearner(learner, now);
    console.log(`  demo: ${r.name.padEnd(16)} xp=${String(r.xp).padStart(5)} streak=${r.streakDays} mastered=${r.mastered} attempts=${r.attempts}`);
  }
  console.log(`Seeded ${DEMO_LEARNERS.length} demo learners. Re-run the seed to refresh their dates.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
