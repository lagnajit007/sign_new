import { Bell } from "lucide-react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { getTimeOfDay } from "@/utils/date-utils";
import { getOrCreateUser } from "@/lib/user";
import { computeUserStats } from "@/lib/stats";
import { prisma } from "@/lib/prisma";
import { levelForXp, nextLevelXp, totalXpForLevel } from "@/lib/gamification";
import { levelTitle, formatXp } from "@/lib/dashboard-utils";

import WelcomeHero from "@/components/dashboard/WelcomeHero";
import KpiGrid from "@/components/dashboard/KpiGrid";
import ContinueLearning from "@/components/dashboard/ContinueLearning";
import DailyQuest from "@/components/dashboard/DailyQuest";
import LevelProgress from "@/components/dashboard/LevelProgress";
import RecentAchievements from "@/components/dashboard/RecentAchievements";
import LeaderboardPreview from "@/components/dashboard/LeaderboardPreview";
import RecentActivity from "@/components/dashboard/RecentActivity";
import CommunityHighlights from "@/components/dashboard/CommunityHighlights";

export const dynamic = "force-dynamic";

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

  try {
    clerkUser = await currentUser();
    dbUser = await getOrCreateUser();
  } catch {}

  if (dbUser) {
    const userId = dbUser.id;

    try {
      stats = await computeUserStats(userId);
    } catch {}

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
    } catch {}

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
    } catch {}

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
    } catch {}
  }

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
  const correctAttempts = stats?.correctAttempts ?? 0;

  const firstName = clerkUser?.firstName || clerkUser?.fullName?.split(" ")[0] || "there";
  const timeOfDay = getTimeOfDay();

  const dailyGoal = 5;
  const dailyProgress = Math.min(dailyGoal, totalAttempts);
  const dailyPct = Math.min(100, Math.round((dailyProgress / dailyGoal) * 100));

  const activeChallenge = userChallenges.find((uc) => !uc.completed);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      <div className="flex justify-end items-center gap-3">
        <button className="relative p-2.5 bg-brand-soft rounded-lg hover:bg-brand-soft/70 transition-colors">
          <Bell className="w-5 h-5 text-ink-soft" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-coral rounded-full flex items-center justify-center text-[10px] text-white font-bold">3</span>
        </button>
        <Link href="/dashboard/profile">
          <div className="px-3 py-2 flex items-center gap-3 bg-brand-soft rounded-lg cursor-pointer hover:bg-brand-soft transition-colors">
            <span className="text-gray-600 font-medium text-sm">{firstName}</span>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
          </div>
        </Link>
      </div>

      <WelcomeHero
        clerkUser={clerkUser}
        firstName={firstName}
        timeOfDay={timeOfDay}
        level={level}
        levelTitle={levelTitle(level)}
        xp={xp}
        nextXp={nextXp}
        streakDays={streakDays}
        dailyProgress={dailyProgress}
        dailyGoal={dailyGoal}
        dailyPct={dailyPct}
      />

      <KpiGrid
        level={level}
        levelTitle={levelTitle(level)}
        levelProgress={levelProgress}
        xp={xp}
        nextXp={nextXp}
        accuracy={accuracy}
        totalAttempts={totalAttempts}
        correctAttempts={correctAttempts}
        signsMastered={signsMastered}
        streakDays={streakDays}
        lessonsCompleted={lessonsCompleted}
        challengesDone={challengesDone}
        userRank={userRank}
        topUsers={topUsers}
      />

      <ContinueLearning
        currentLesson={currentLesson}
        completedLetters={completedLetters}
        lessonsCompleted={lessonsCompleted}
      />

      <DailyQuest activeChallenge={activeChallenge} />

      <LevelProgress
        level={level}
        levelProgress={levelProgress}
        xp={xp}
        xpIntoLevel={xpIntoLevel}
        xpForLevel={xpForLevel}
        nextXp={nextXp}
        levelTitle={levelTitle(level)}
      />

      <RecentAchievements earnedAchievements={earnedAchievements} />

      <LeaderboardPreview
        topUsers={topUsers}
        dbUserId={dbUser?.id}
        clerkUserImageUrl={clerkUser?.imageUrl}
        dbUserName={dbUser?.name}
        userRank={userRank}
        xp={xp}
      />

      <RecentActivity recentActivity={recentActivity} />

      <CommunityHighlights communityFeed={communityFeed as any} />

      <div className="h-8" />
    </div>
  );
}
