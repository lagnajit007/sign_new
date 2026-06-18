import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Zap, Flame, Target, Clock, Trophy, Star, Users, BookOpen, ArrowRight, Sparkles, Bell } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { getTimeOfDay } from "@/utils/date-utils";
import { getOrCreateUser } from "@/lib/user";
import { computeUserStats } from "@/lib/stats";
import { prisma } from "@/lib/prisma";
import { levelForXp, nextLevelXp, totalXpForLevel } from "@/lib/gamification";
import KpiCard from "@/components/dashboard/KpiCard";
import { HeroSkeleton, KpiGridSkeleton, CardSkeleton, ListSkeleton, AchievementsSkeleton } from "@/components/dashboard/Skeleton";
import EmptyState from "@/components/dashboard/EmptyState";

export const dynamic = "force-dynamic";

const TOTAL_LESSONS = 36;
const LEVEL_NAMES = ["Beginner", "Learner", "Apprentice", "Sign Explorer", "Signer", "Master Signer", "Expert", "Grand Master", "Legend"];

function levelTitle(level: number): string {
  return LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)] || "Signer";
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatXp(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`;
  return xp.toLocaleString();
}

export default async function Dashboard() {
  let clerkUser: Awaited<ReturnType<typeof currentUser>> | null = null;
  let dbUser: Awaited<ReturnType<typeof getOrCreateUser>> | null = null;
  let stats: Awaited<ReturnType<typeof computeUserStats>> | null = null;

  let topUsers: Awaited<ReturnType<typeof prisma.user.findMany>> = [];
  let recentActivity: Awaited<ReturnType<typeof prisma.recognitionAttempt.findMany>> = [];
  let earnedAchievements: Awaited<ReturnType<typeof prisma.userAchievement.findMany>> = [];
  let userChallenges: Awaited<ReturnType<typeof prisma.userChallenge.findMany>> = [];
  let currentLesson: { signLabel: string; lessonType: string; completed: boolean; bestAccuracy: number } | null = null;
  let userRank = 0;
  let completedLetters: string[] = [];
  let communityFeed: Awaited<ReturnType<typeof prisma.recognitionAttempt.findMany>> = [];

  // Wrap all data fetching so the page never crashes
  try {
    clerkUser = await currentUser();
    dbUser = await getOrCreateUser();
  } catch {
    // Clerk/DB unavailable — will render with defaults
  }

  if (dbUser) {
    const userId = dbUser.id;

    try {
      stats = await computeUserStats(userId);
    } catch {
      // Stats unavailable
    }

    try {
      [topUsers, recentActivity, earnedAchievements, userChallenges, userRank] = await Promise.all([
        prisma.user.findMany({ orderBy: { xp: "desc" }, take: 5 }),
        prisma.recognitionAttempt.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        prisma.userAchievement.findMany({
          where: { userId, unlockedAt: { not: null } },
          include: { achievement: true },
          orderBy: { unlockedAt: "desc" },
          take: 8,
        }),
        prisma.userChallenge.findMany({
          where: { userId },
          include: { challenge: true },
        }),
        prisma.user.count({ where: { xp: { gt: dbUser.xp } } }).then((c) => c + 1),
      ]);
    } catch {
      // Non-critical data unavailable
    }

    try {
      const progress = await prisma.signProgress.findMany({
        where: { userId },
        select: { signLabel: true, lessonType: true, completed: true, bestAccuracy: true },
        orderBy: [{ lessonType: "asc" }, { signLabel: "asc" }],
      });

      completedLetters = progress.filter((p) => p.completed).map((p) => p.signLabel);

      const nextUncompleted = progress.find((p) => !p.completed);
      if (nextUncompleted) {
        currentLesson = nextUncompleted;
      }
    } catch {
      // Progress unavailable
    }

    try {
      communityFeed = await prisma.recognitionAttempt.findMany({
        where: {
          correct: true,
          userId: { not: userId },
        },
        include: { user: { select: { name: true, xp: true, level: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
    } catch {
      // Community feed unavailable
    }
  }

  // Computed values
  const xp = dbUser?.xp ?? 0;
  const level = levelForXp(xp);
  const nextXp = nextLevelXp(xp);
  const floorXp = totalXpForLevel(level);
  const xpIntoLevel = xp - floorXp;
  const xpForLevel = nextXp - floorXp;
  const levelProgress = xpForLevel > 0 ? Math.min(100, Math.round((xpIntoLevel / xpForLevel) * 100)) : 0;
  const streakDays = dbUser?.streakDays ?? 0;
  const lessonsCompleted = stats?.lessonsCompleted ?? 0;
  const signsMastered = lessonsCompleted;
  const accuracy = stats ? Math.round(stats.overallAccuracy * 100) : 0;
  const challengesDone = stats?.challengesCompleted ?? 0;
  const totalAttempts = stats?.totalAttempts ?? 0;

  const firstName = clerkUser?.firstName || clerkUser?.fullName?.split(" ")[0] || "there";
  const timeOfDay = getTimeOfDay();

  // Daily goal: practice 5 signs is the default
  const dailyGoal = 5;
  const dailyProgress = Math.min(dailyGoal, totalAttempts);
  const dailyPct = Math.min(100, Math.round((dailyProgress / dailyGoal) * 100));

  // Current active challenge
  const activeChallenge = userChallenges.find((uc) => !uc.completed);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* ── User header bar ── */}
      <div className="flex justify-end items-center gap-3">
        <button className="relative p-2.5 bg-[#EAE4FF] rounded-lg hover:bg-[#EAE4FF]/70 transition-colors">
          <Bell className="w-5 h-5 text-[#7E7A93]" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF7A59] rounded-full flex items-center justify-center text-[10px] text-white font-bold">3</span>
        </button>
        <Link href="/dashboard/profile">
          <div className="px-3 py-2 flex items-center gap-3 bg-[#EAE4FF] rounded-lg cursor-pointer hover:bg-[#EAE4FF] transition-colors">
            <span className="text-gray-600 font-medium text-sm">{firstName}</span>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
          </div>
        </Link>
      </div>

      {/* ═══════════════════════════════════════════════════════════
         SECTION 1 — Welcome Hero
      ════════════════════════════════════════════════════════════ */}
      {clerkUser === undefined ? (
        <HeroSkeleton />
      ) : (
        <section className="bg-gradient-to-br from-[#7D54FF] via-[#8B6BFF] to-[#9B7CFF] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm md:text-base font-medium text-white/80">
                  Good {timeOfDay}, {firstName} 👋
                </p>
                <h1 className="text-2xl md:text-4xl font-bold">
                  Level {level} — {levelTitle(level)}
                </h1>
                <p className="text-white/80 text-sm md:text-base">
                  {nextXp > xp
                    ? `${formatXp(nextXp - xp)} XP until Level ${level + 1}`
                    : "Max level reached!"}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 md:p-4 text-center min-w-[100px]">
                  <div className="flex items-center justify-center gap-1 text-xl md:text-2xl font-bold">
                    <Flame className="w-5 h-5 text-orange-300" />
                    {streakDays}
                  </div>
                  <div className="text-xs text-white/70">Day Streak</div>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 md:p-4 text-center min-w-[100px]">
                  <div className="text-xl md:text-2xl font-bold">{formatXp(xp)}</div>
                  <div className="text-xs text-white/70">Total XP</div>
                </div>
              </div>
            </div>

            {/* Daily Goal Progress */}
            <div className="mt-5 bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-white/80" />
                  <span className="text-sm font-medium">Today&apos;s Goal</span>
                </div>
                <span className="text-sm font-medium">
                  {dailyProgress} / {dailyGoal} signs
                </span>
              </div>
              <div className="h-2.5 bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000"
                  style={{ width: `${dailyPct}%` }}
                />
              </div>
              <div className="flex gap-3 mt-4">
                <Link
                  href="/dashboard/lessons/interactive"
                  className="inline-flex items-center gap-2 bg-white text-[#7D54FF] rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Zap className="w-4 h-4" />
                  Continue Learning
                </Link>
                <Link
                  href="/dashboard/lessons"
                  className="inline-flex items-center gap-2 border border-white/30 text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-white/10 transition-all"
                >
                  Browse Lessons
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
         SECTION 2 — Learning Overview KPIs
      ════════════════════════════════════════════════════════════ */}
      <section>
        <h2 className="text-xl font-bold text-[#2D1B69] mb-4">Learning Overview</h2>
        {totalAttempts === 0 && level === 1 && streakDays === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[ 
              { icon: "🎯", label: "Your Level", value: `Level ${level}`, color: "#7D54FF" },
              { icon: "⭐", label: "Total XP", value: "0", color: "#22C55E" },
              { icon: "🎯", label: "Accuracy", value: "—", color: "#5EC8FF" },
              { icon: "📚", label: "Signs Mastered", value: "0", color: "#FF7A59" },
            ].map((kpi, i) => (
              <KpiCard key={i} icon={kpi.icon} label={kpi.label} value={kpi.value} color={kpi.color} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              icon="🎯"
              label="Your Level"
              value={`Level ${level}`}
              sublabel={levelTitle(level)}
              progress={levelProgress}
              color="#7D54FF"
            />
            <KpiCard
              icon="⭐"
              label="Total XP"
              value={formatXp(xp)}
              sublabel={`${formatXp(nextXp - xp)} to next`}
              progress={levelProgress}
              color="#22C55E"
            />
            <KpiCard
              icon="🎯"
              label="Accuracy"
              value={totalAttempts > 0 ? `${accuracy}%` : "—"}
              sublabel={totalAttempts > 0 ? `${stats?.correctAttempts ?? 0}/${totalAttempts}` : "No attempts"}
              progress={accuracy}
              color="#5EC8FF"
            />
            <KpiCard
              icon="📚"
              label="Signs Mastered"
              value={`${signsMastered}`}
              sublabel={`/ ${TOTAL_LESSONS} total`}
              progress={lessonsCompleted > 0 ? Math.round((lessonsCompleted / TOTAL_LESSONS) * 100) : 0}
              color="#FF7A59"
            />
            <KpiCard
              icon="🔥"
              label="Current Streak"
              value={`${streakDays} day${streakDays !== 1 ? "s" : ""}`}
              sublabel={streakDays >= 7 ? "On fire! 🔥" : streakDays > 0 ? "Keep going!" : "Start today!"}
              progress={Math.min(100, Math.round((streakDays / 7) * 100))}
              color="#FF8C00"
            />
            <KpiCard
              icon="📖"
              label="Lessons Done"
              value={`${lessonsCompleted}`}
              sublabel={`${TOTAL_LESSONS - lessonsCompleted} remaining`}
              progress={lessonsCompleted > 0 ? Math.round((lessonsCompleted / TOTAL_LESSONS) * 100) : 0}
              color="#6840E0"
            />
            <KpiCard
              icon="🏆"
              label="Challenges"
              value={`${challengesDone}`}
              sublabel="completed"
              progress={challengesDone > 0 ? Math.min(100, challengesDone * 25) : 0}
              color="#E84393"
            />
            <KpiCard
              icon="👑"
              label="Leaderboard"
              value={userRank > 0 ? `#${userRank}` : "—"}
              sublabel={topUsers.length > 0 ? "global rank" : "No data"}
              color="#00B894"
            />
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════
         SECTION 3 — Continue Learning
      ════════════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#2D1B69">Continue Learning</h2>
          <Link href="/dashboard/lessons" className="text-[#7D54FF] text-sm flex items-center hover:underline gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {lessonsCompleted >= TOTAL_LESSONS ? (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-3xl mb-2">🎉</div>
                <h3 className="text-lg font-bold text-[#2D1B69]">All Lessons Complete!</h3>
                <p className="text-sm text-[#7E7A93] mt-1">You&apos;ve mastered every sign. Try interactive practice or challenges.</p>
                <div className="flex gap-3 mt-4">
                  <Link
                    href="/dashboard/lessons/interactive"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7D54FF] text-white rounded-full text-sm font-medium hover:bg-[#6840E0] transition-colors"
                  >
                    <Zap className="w-4 h-4" /> Interactive Practice
                  </Link>
                  <Link
                    href="/dashboard/challenges"
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#7D54FF] text-[#7D54FF] rounded-full text-sm font-medium hover:bg-[#FAF7FF] transition-colors"
                  >
                    New Challenges
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : currentLesson ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EAE4FF] hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EAE4FF] rounded-full text-xs font-medium text-[#7D54FF]">
                  <BookOpen className="w-3.5 h-3.5" />
                  {currentLesson.lessonType === "alphabet" ? "Alphabet" : "Number"} Lesson
                </div>
                <h3 className="text-lg font-bold text-[#2D1B69]">
                  Currently Learning: Letter{" "}
                  <span className="text-[#7D54FF] text-2xl">{currentLesson.signLabel}</span>
                </h3>
                <div className="flex items-center gap-4 text-sm text-[#7E7A93]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> ~5 min remaining
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" /> Mastery: {Math.round(currentLesson.bestAccuracy * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#7E7A93]">Lesson Progress</span>
                <span className="font-medium text-[#7D54FF]">
                  {completedLetters.length} / {TOTAL_LESSONS} signs
                </span>
              </div>
              <div className="h-2.5 bg-[#EAE4FF] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#7D54FF] to-[#9B7CFF] rounded-full transition-all duration-1000"
                  style={{ width: `${Math.round((completedLetters.length / TOTAL_LESSONS) * 100)}%` }}
                />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <Link
                href={`/dashboard/lessons/${currentLesson.lessonType === "alphabet" ? "alphabets" : "numbers"}/${currentLesson.signLabel.toLowerCase()}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#7D54FF] text-white rounded-full text-sm font-semibold hover:bg-[#6840E0] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard/lessons/interactive"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#EAE4FF] text-[#7E7A93] rounded-full text-sm font-medium hover:border-[#7D54FF] hover:text-[#7D54FF] transition-colors"
              >
                Practice Mode
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EAE4FF]">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-3xl mb-2">🚀</div>
                <h3 className="text-lg font-bold text-[#2D1B69]">Start Your Learning Journey</h3>
                <p className="text-sm text-[#7E7A93] mt-1">Begin with the alphabet and work your way up to signing with confidence.</p>
                <div className="flex gap-3 mt-4">
                  <Link
                    href="/dashboard/lessons"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7D54FF] text-white rounded-full text-sm font-medium hover:bg-[#6840E0] transition-colors"
                  >
                    Start First Lesson <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/dashboard/lessons/interactive"
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#EAE4FF] text-[#7E7A93] rounded-full text-sm font-medium hover:border-[#7D54FF] hover:text-[#7D54FF] transition-colors"
                  >
                    Try Interactive
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════
         SECTION 4 — Daily Challenge
      ════════════════════════════════════════════════════════════ */}
      <section>
        <h2 className="text-xl font-bold text-[#2D1B69] mb-4">Daily Quest</h2>
        {activeChallenge !== undefined ? (
          <div className="bg-gradient-to-br from-[#FF8C00]/10 via-[#FF7A59]/5 to-[#E84393]/10 rounded-2xl p-6 border border-[#FF8C00]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8C00]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FF8C00]/10 rounded-full text-xs font-medium text-[#FF8C00]">
                    <Sparkles className="w-3.5 h-3.5" /> Active Quest
                  </div>
                  <h3 className="text-lg font-bold text-[#2D1B69]">{activeChallenge.challenge.name}</h3>
                  <p className="text-sm text-[#7E7A93]">{activeChallenge.challenge.description}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full font-medium">
                      +{activeChallenge.challenge.rewardXp} XP
                    </span>
                    <span className="text-[#7E7A93]">
                      Progress: {activeChallenge.progress} / {activeChallenge.challenge.goal}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="h-2.5 bg-[#FF8C00]/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF8C00] to-[#FF7A59] rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(100, Math.round((activeChallenge.progress / activeChallenge.challenge.goal) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Link
                  href="/dashboard/lessons/interactive"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF8C00] text-white rounded-full text-sm font-semibold hover:bg-[#e67e00] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Complete Quest <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            icon="⚔️"
            title="No Active Quest"
            description="Daily challenges help you stay consistent. Start a lesson to begin earning quest progress."
            actionLabel="Browse Challenges"
            actionHref="/dashboard/challenges"
          />
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════
         SECTION 5 — XP & Level Progression
      ════════════════════════════════════════════════════════════ */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-[#EAE4FF]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#2D1B69]">Level Progress</h2>
          <span className="text-[#7D54FF] font-bold text-lg">Level {level}</span>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="30" fill="none" stroke="#EAE4FF" strokeWidth="6" />
              <circle
                cx="36" cy="36" r="30"
                fill="none" stroke="#7D54FF" strokeWidth="6"
                strokeDasharray={Math.PI * 60}
                strokeDashoffset={Math.PI * 60 * (1 - levelProgress / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-[#7D54FF]">{levelProgress}%</span>
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-[#7E7A93]">XP Progress</span>
              <span className="font-medium">
                {formatXp(xpIntoLevel)} / {formatXp(xpForLevel)} XP
              </span>
            </div>
            <div className="h-3 bg-[#EAE4FF] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#7D54FF] to-[#9B7CFF] rounded-full transition-all duration-1500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            <p className="text-xs text-[#7E7A93]">
              {nextXp > xp
                ? `${formatXp(nextXp - xp)} XP until Level ${level + 1}`
                : "You've reached the highest level!"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#FAF7FF] rounded-xl p-3 text-center">
            <div className="text-xs text-[#7E7A93]">Current XP</div>
            <div className="text-lg font-bold text-[#2D1B69]">{formatXp(xp)}</div>
          </div>
          <div className="bg-[#FAF7FF] rounded-xl p-3 text-center">
            <div className="text-xs text-[#7E7A93]">Next Level</div>
            <div className="text-lg font-bold text-[#2D1B69]">{level < 9 ? `Level ${level + 1}` : "Max"}</div>
          </div>
          <div className="bg-[#FAF7FF] rounded-xl p-3 text-center col-span-2 sm:col-span-1">
            <div className="text-xs text-[#7E7A93]">Next Unlock</div>
            <div className="text-sm font-bold text-[#7D54FF]">
              {level + 1 < LEVEL_NAMES.length ? LEVEL_NAMES[level] : "Legendary Status"}
            </div>
          </div>
          <div className="bg-[#FAF7FF] rounded-xl p-3 text-center col-span-2 sm:col-span-1">
            <div className="text-xs text-[#7E7A93]">Rank Title</div>
            <div className="text-sm font-bold text-[#FF8C00]">{levelTitle(level)}</div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         SECTION 6 — Recent Achievements
      ════════════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#2D1B69]">Recent Achievements</h2>
          <Link href="/dashboard/achievements" className="text-[#7D54FF] text-sm flex items-center hover:underline gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {earnedAchievements.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {earnedAchievements.slice(0, 4).map((ua) => (
              <div key={ua.id} className="bg-white rounded-2xl p-4 text-center border border-[#EAE4FF] hover:shadow-md transition-shadow">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2 text-2xl"
                  style={{ backgroundColor: ua.achievement.color || "#EAE4FF" }}
                >
                  {ua.achievement.icon || "🏆"}
                </div>
                <h4 className="font-semibold text-[#2D1B69] text-sm">{ua.achievement.name}</h4>
                <p className="text-xs text-[#7E7A93] mt-0.5">
                  {ua.unlockedAt ? new Date(ua.unlockedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                </p>
                <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-yellow-50 rounded-full text-xs font-medium text-yellow-700">
                  +{ua.achievement.xpReward} XP
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🏆"
            title="No Achievements Yet"
            description="Complete lessons, maintain streaks, and master signs to earn achievements and XP bonuses."
            actionLabel="Start Learning"
            actionHref="/dashboard/lessons"
          />
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════
         SECTION 7 — Leaderboard Preview
      ════════════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#2D1B69]">Leaderboard</h2>
          <Link href="/dashboard/community" className="text-[#7D54FF] text-sm flex items-center hover:underline gap-1">
            View full board <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {topUsers.length > 0 ? (
          <div className="bg-white rounded-2xl p-4 border border-[#EAE4FF]">
            {topUsers.map((entry, index) => {
              const isMe = entry.id === dbUser?.id;
              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between py-3 px-3 ${
                    isMe ? "bg-[#FAF7FF] rounded-xl -mx-1 px-4" : ""
                  } ${index < topUsers.length - 1 ? "border-b border-[#EAE4FF]/50" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? "bg-yellow-100 text-yellow-700" :
                      index === 1 ? "bg-gray-100 text-gray-600" :
                      index === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-[#EAE4FF] text-[#7E7A93]"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100">
                      {entry.id === dbUser?.id && clerkUser?.imageUrl ? (
                        <Image src={clerkUser.imageUrl} alt={entry.name || "User"} width={36} height={36} className="object-cover" />
                      ) : entry.name ? (
                        <div className="w-full h-full flex items-center justify-center bg-[#7D54FF]/10 text-[#7D54FF] font-bold text-sm">
                          {entry.name.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-sm">?</div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-[#2D1B69] text-sm flex items-center gap-1.5">
                        {entry.name || "Anonymous"}
                        {isMe && <span className="text-xs bg-[#7D54FF]/10 text-[#7D54FF] px-1.5 py-0.5 rounded font-medium">You</span>}
                        {index === 0 && <span className="text-xs">👑</span>}
                      </div>
                      <div className="text-xs text-[#7E7A93]">Lvl {levelForXp(entry.xp)}</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-[#2D1B69]">{formatXp(entry.xp)} XP</div>
                </div>
              );
            })}

            {userRank > 5 && (
              <div className="text-center mt-3 pt-3 border-t border-[#EAE4FF]/50">
                <span className="text-sm text-[#7E7A93]">
                  You&apos;re #{userRank} globally —{" "}
                  {topUsers.length > 0 && userRank > 5
                    ? `${formatXp(topUsers[0].xp - xp)} XP behind #1`
                    : "keep learning!"}
                </span>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon="👑"
            title="No Leaderboard Data"
            description="Be the first learner to earn XP and top the leaderboard!"
            actionLabel="Start Learning"
            actionHref="/dashboard/lessons"
          />
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════
         SECTION 8 — Recent Activity
      ════════════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#2D1B69]">Recent Activity</h2>
          <Link href="/dashboard/progress" className="text-[#7D54FF] text-sm flex items-center hover:underline gap-1">
            View progress <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recentActivity.length > 0 ? (
          <div className="bg-white rounded-2xl p-4 border border-[#EAE4FF]">
            <div className="relative pl-6 space-y-0">
              {recentActivity.slice(0, 6).map((entry, i) => (
                <div key={entry.id} className="relative pb-5 last:pb-0">
                  {i < Math.min(recentActivity.length - 1, 5) && (
                    <div className="absolute left-0 top-2 bottom-0 w-px bg-[#EAE4FF]" />
                  )}
                  <div className={`absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 ${
                    entry.correct ? "border-green-500 bg-green-50" : "border-red-400 bg-red-50"
                  }`} />
                  <div className="ml-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#2D1B69]">
                        {entry.lessonType === "alphabet" ? "Letter" : "Number"}: {entry.signLabel}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        entry.correct ? "bg-green-50 text-green-700" : "bg-red-50 text-red-500"
                      }`}>
                        {entry.correct ? "Correct" : "Incorrect"}
                      </span>
                    </div>
                    <div className="text-xs text-[#7E7A93] flex items-center gap-2 mt-0.5">
                      <span>
                        {entry.lessonType === "alphabet" ? "Alphabet Practice" : "Number Practice"}
                      </span>
                      <span>·</span>
                      <span>{timeAgo(entry.createdAt)}</span>
                      {entry.confidence > 0 && (
                        <>
                          <span>·</span>
                          <span>{Math.round(entry.confidence * 100)}% confidence</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon="📝"
            title="No Activity Yet"
            description="Your practice attempts, completed lessons, and earned achievements will appear here."
            actionLabel="Start Practicing"
            actionHref="/dashboard/lessons/interactive"
          />
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════
         SECTION 9 — Community Highlights
      ════════════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#2D1B69]">Community</h2>
          <Link href="/dashboard/community" className="text-[#7D54FF] text-sm flex items-center hover:underline gap-1">
            Visit community <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {communityFeed.length > 0 ? (
          <div className="bg-white rounded-2xl p-4 border border-[#EAE4FF]">
            <div className="space-y-3">
              {communityFeed.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 py-2 border-b border-[#EAE4FF]/50 last:border-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7D54FF] to-[#9B7CFF] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {(entry as any).user?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#2D1B69] truncate">
                      <span className="font-medium">{(entry as any).user?.name || "A learner"}</span>{" "}
                      <span className="text-[#7E7A93] font-normal">
                        practiced <span className="font-medium">{entry.signLabel}</span>
                      </span>
                    </div>
                    <div className="text-xs text-[#7E7A93] flex items-center gap-2">
                      <span>{timeAgo(entry.createdAt)}</span>
                      {entry.correct && <span className="text-green-600">· Correct</span>}
                    </div>
                  </div>
                  <div className="text-xs text-[#7E7A93] bg-[#FAF7FF] rounded-lg px-2.5 py-1.5 text-center">
                    Lvl {(entry as any).user?.level || "?"}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-4">
              <Link
                href="/dashboard/community"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FAF7FF] text-[#7D54FF] rounded-full text-sm font-medium hover:bg-[#EAE4FF] transition-colors"
              >
                <Users className="w-4 h-4" /> View Community
              </Link>
            </div>
          </div>
        ) : (
          <EmptyState
            icon="🌍"
            title="No Community Activity Yet"
            description="Community feed shows what other learners are practicing. Start learning and your activity will appear too!"
            actionLabel="Visit Community"
            actionHref="/dashboard/community"
          />
        )}
      </section>

      {/* ── Bottom spacer ── */}
      <div className="h-8" />
    </div>
  );
}
