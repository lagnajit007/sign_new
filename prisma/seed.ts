import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Achievement catalog. criteriaType/criteriaValue drive automatic unlocking in
// /api/attempts (see src/lib/gamification.ts). Social/manual ones use "manual"
// and won't auto-unlock until those features are persisted.
const achievements = [
  { key: 'first-step', name: 'First Step', description: 'Complete your first lesson', category: 'beginner', icon: '🚀', color: 'from-[#ff9160] to-[#ff6265]', xpReward: 50, criteriaType: 'lessons_completed', criteriaValue: 1 },
  { key: 'quick-learner', name: 'Quick Learner', description: 'Complete 5 lessons', category: 'beginner', icon: '⚡', color: 'from-[#704ee7] to-[#684ad6]', xpReward: 100, criteriaType: 'lessons_completed', criteriaValue: 5 },
  { key: 'alphabet-master', name: 'Alphabet Master', description: 'Learn all alphabet signs', category: 'intermediate', icon: '🔤', color: 'from-[#3874ff] to-[#684ad6]', xpReward: 200, criteriaType: 'alphabet_completed', criteriaValue: 26 },
  { key: 'number-whiz', name: 'Number Whiz', description: 'Learn all number signs', category: 'intermediate', icon: '🔢', color: 'from-[#57e371] to-[#3acbe8]', xpReward: 200, criteriaType: 'number_completed', criteriaValue: 10 },
  { key: 'week-warrior', name: 'Week Warrior', description: 'Maintain a 7-day streak', category: 'commitment', icon: '🔥', color: 'from-[#f0c332] to-[#ff9160]', xpReward: 150, criteriaType: 'streak_days', criteriaValue: 7 },
  { key: 'perfect-score', name: 'Perfect Score', description: 'Get 100% on any practice session', category: 'advanced', icon: '🎯', color: 'from-[#ff6265] to-[#ff4f5e]', xpReward: 300, criteriaType: 'perfect_session', criteriaValue: 1 },
  { key: 'social-butterfly', name: 'Social Butterfly', description: 'Join 5 community discussions', category: 'social', icon: '🦋', color: 'from-[#3acbe8] to-[#3874ff]', xpReward: 100, criteriaType: 'manual', criteriaValue: 5 },
  { key: 'challenge-champion', name: 'Challenge Champion', description: 'Complete 10 challenges', category: 'advanced', icon: '🏆', color: 'from-[#f0c332] to-[#ff9160]', xpReward: 300, criteriaType: 'challenges_completed', criteriaValue: 10 },
  { key: 'lessons-10', name: 'Dedicated Learner', description: 'Complete 10 lessons', category: 'commitment', icon: '📚', color: 'from-[#704ee7] to-[#684ad6]', xpReward: 150, criteriaType: 'lessons_completed', criteriaValue: 10 },
  { key: 'thousand-xp', name: '1000 XP Club', description: 'Earn 1000 XP', category: 'advanced', icon: '💎', color: 'from-[#57e371] to-[#3acbe8]', xpReward: 250, criteriaType: 'manual', criteriaValue: 1000 },
];

// Challenge catalog. goal is the target count; progress accrues in UserChallenge.
const challenges = [
  { key: 'alphabet-rush', name: 'Alphabet Rush', description: 'Learn 5 new alphabet signs in one day', category: 'daily', difficulty: 'easy', icon: '🔤', color: 'from-[#704ee7] to-[#684ad6]', rewardXp: 100, goal: 5, period: 'daily' },
  { key: 'perfect-practice', name: 'Perfect Practice', description: 'Complete a practice session with 100% accuracy', category: 'weekly', difficulty: 'medium', icon: '🎯', color: 'from-[#ff9160] to-[#ff6265]', rewardXp: 200, goal: 1, period: 'weekly' },
  { key: 'seven-day-streak', name: '7-Day Streak', description: 'Practice sign language for 7 consecutive days', category: 'monthly', difficulty: 'medium', icon: '🔥', color: 'from-[#f0c332] to-[#ff9160]', rewardXp: 300, goal: 7, period: 'monthly' },
  { key: 'number-master', name: 'Number Master', description: 'Learn all number signs (0-9)', category: 'monthly', difficulty: 'hard', icon: '🔢', color: 'from-[#3874ff] to-[#684ad6]', rewardXp: 400, goal: 10, period: 'monthly' },
  { key: 'speed-signer', name: 'Speed Signer', description: 'Complete 3 lessons in under 30 minutes', category: 'daily', difficulty: 'hard', icon: '⚡', color: 'from-[#ff6265] to-[#ff4f5e]', rewardXp: 150, goal: 3, period: 'daily' },
  { key: 'morning-practice', name: 'Morning Practice', description: 'Complete a lesson before 9 AM', category: 'daily', difficulty: 'easy', icon: '🌅', color: 'from-[#f0c332] to-[#ff9160]', rewardXp: 50, goal: 1, period: 'daily' },
];

async function main() {
  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { key: a.key },
      update: a,
      create: a,
    });
  }
  for (const c of challenges) {
    await prisma.challenge.upsert({
      where: { key: c.key },
      update: c,
      create: c,
    });
  }
  console.log(`Seeded ${achievements.length} achievements and ${challenges.length} challenges.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
