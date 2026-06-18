import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { getTimeOfDay } from "@/utils/date-utils";
import { getOrCreateUser } from "@/lib/user";
import { computeUserStats } from "@/lib/stats";
import { prisma } from "@/lib/prisma";
import { levelForXp, nextLevelXp, totalXpForLevel } from "@/lib/gamification";
import {
  StatCardSkeleton,
  LessonCardSkeleton,
  SidebarLeaderboardSkeleton,
} from "@/components/skeletons/SkeletonCard";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await currentUser();
  const dbUser = await getOrCreateUser();

  const userStats = dbUser ? await computeUserStats(dbUser.id) : null;
  const xp = dbUser?.xp ?? 0;
  const level = levelForXp(xp);
  const nextLvlXp = nextLevelXp(xp);
  const floorXp = totalXpForLevel(level);
  const xpIntoLevel = xp - floorXp;
  const xpForLevel = nextLvlXp - floorXp;
  const levelProgress = xpForLevel > 0 ? Math.min(100, Math.round((xpIntoLevel / xpForLevel) * 100)) : 0;
  const streakDays = dbUser?.streakDays ?? 0;
  const lessonsCompleted = userStats?.lessonsCompleted ?? 0;
  const totalLessons = 36;
  const lessonsProgress = Math.min(100, Math.round((lessonsCompleted / totalLessons) * 100));

  const stats = [
    {
      id: 1,
      title: "Daily Streak",
      value: `${streakDays} Day${streakDays !== 1 ? "s" : ""}`,
      progress: Math.min(100, Math.round((streakDays / 7) * 100)),
      color: "bg-[#5EC8FF]",
      icon: "🔥",
    },
    {
      id: 2,
      title: "Lessons Completed",
      value: `${lessonsCompleted} / ${totalLessons}`,
      progress: lessonsProgress,
      color: "bg-[#FF7A59]",
      icon: "📚",
    },
    {
      id: 3,
      title: "Total XP",
      value: xp.toLocaleString(),
      progress: levelProgress,
      color: "bg-[#22C55E]",
      icon: "⭐",
    },
  ];

  const courses = [
    {
      id: 1,
      title: "Alphabets",
      subtitle: "Beginner's Guide to Learn Alphabets (A-Z)",
      color: "bg-[#ffe9ac]",
      textColor: "text-[#ff2600]",
      tagColor: "bg-[#ffe9ac]",
      tagText: "ALPHABETS",
      value: "A–Z",
      href: "/dashboard/lessons",
    },
    {
      id: 2,
      title: "Numbers",
      subtitle: "Beginner's Guide to Learn Numbers (0-9)",
      color: "bg-[#EAE4FF]",
      textColor: "text-[#5EC8FF]",
      tagColor: "bg-[#EAE4FF]",
      tagText: "NUMBERS",
      value: "0–9",
      href: "/dashboard/lessons",
    },
    {
      id: 3,
      title: "Interactive",
      subtitle: "Practice signs live with AI recognition",
      color: "bg-[#EAE4FF]",
      textColor: "text-[#6840E0]",
      tagColor: "bg-[#EAE4FF]",
      tagText: "PRACTICE",
      value: "🤖",
      href: "/dashboard/lessons/interactive",
    },
  ];

  // Leaderboard: top users by XP
  const topUsers = await prisma.user.findMany({ orderBy: { xp: "desc" }, take: 3 });
  const leaderboard =
    topUsers.length > 0
      ? topUsers.map((u, i) => ({
          id: u.id,
          name: u.id === dbUser?.id ? user?.fullName || u.name || "You" : u.name || `Learner ${i + 1}`,
          points: u.xp.toLocaleString(),
          level: levelForXp(u.xp),
          avatar: u.id === dbUser?.id ? user?.imageUrl || "/Avatar.png" : "/Avatar.png",
          isCurrentUser: u.id === dbUser?.id,
        }))
      : [
          {
            id: dbUser?.id ?? "me",
            name: user?.fullName || "You",
            points: xp.toLocaleString(),
            level,
            avatar: user?.imageUrl || "/Avatar.png",
            isCurrentUser: true,
          },
        ];

  // Earned achievements count for badge display
  const earnedCount = dbUser
    ? await prisma.userAchievement.count({ where: { userId: dbUser.id, unlockedAt: { not: null } } })
    : 0;

  const timeOfDay = getTimeOfDay();
  // Overall progress across alphabets + numbers
  const totalSigns = 36;
  const overallPct = Math.min(100, Math.round(((userStats?.lessonsCompleted ?? 0) / totalSigns) * 100));
  const dashOffset = Math.round(283 - (overallPct / 100) * 283);

  return (
    <div className="flex min-h-screen bg-[#FAF7FF]">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* User header */}
        <div className="flex justify-end mb-6">
          <Link href="/dashboard/profile">
            <div className="px-3 py-2 flex items-center gap-3 bg-[#EAE4FF] rounded-lg cursor-pointer hover:bg-[#EAE4FF] transition-colors">
              <span className="text-gray-600 font-medium text-sm">{user?.firstName ?? user?.fullName}</span>
              <UserButton
                afterSignOutUrl="/"
                appearance={{ elements: { avatarBox: "w-8 h-8" } }}
              />
            </div>
          </Link>
        </div>

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-[#7D54FF] to-[#9B7CFF] rounded-3xl p-8 mb-8 text-white">
          <div className="text-sm font-medium mb-2 opacity-90">ONLINE COURSE</div>
          <h1 className="text-3xl font-bold mb-6 leading-tight">
            Learn Sign Language<br />with Fun Gestures!
          </h1>
          <Link
            href="/dashboard/lessons"
            className="bg-black text-white rounded-full px-6 py-3 inline-flex items-center gap-2 hover:bg-opacity-80 transition-all w-fit"
          >
            Start Learning
            <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-black" />
            </div>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.id} className={`${stat.color} rounded-2xl p-4 text-white`}>
              <div className="flex items-center mb-2">
                <div className="bg-white bg-opacity-30 p-2 rounded-full mr-3 text-xl">{stat.icon}</div>
                <div>
                  <div className="text-sm opacity-90">{stat.title}</div>
                  <div className="text-xl font-bold">{stat.value}</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{stat.progress}%</span>
                </div>
                <div className="h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all" style={{ width: `${stat.progress}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Learning */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#2D1B69]">Continue Learning</h2>
            <Link href="/dashboard/lessons" className="text-[#7D54FF] text-sm flex items-center hover:underline">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={course.href}
                className="bg-white rounded-xl overflow-hidden block hover:shadow-md transition-all duration-200 group"
              >
                <div className={`${course.color} h-32 flex items-center justify-center`}>
                  <span className={`${course.textColor} text-4xl font-bold`}>{course.value}</span>
                </div>
                <div className="p-4">
                  <div className={`inline-block px-3 py-1 ${course.tagColor} text-[#5EC8FF] text-xs rounded-full mb-3`}>
                    {course.tagText}
                  </div>
                  <h3 className="font-medium text-[#2D1B69] group-hover:text-[#7D54FF] transition-colors">
                    {course.subtitle}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Empty state: no activity yet */}
        {lessonsCompleted === 0 && streakDays === 0 && (
          <div className="bg-white rounded-xl p-6 text-center border border-dashed border-[#EAE4FF]">
            <div className="text-4xl mb-3">👋</div>
            <h3 className="font-bold text-[#2D1B69] mb-1">Welcome! Start your first lesson</h3>
            <p className="text-sm text-[#7E7A93] mb-4">
              Complete your first sign to start earning XP, streaks, and achievements.
            </p>
            <Link
              href="/dashboard/lessons/interactive"
              className="inline-flex items-center px-4 py-2 bg-[#7D54FF] text-white rounded-full shadow-btn transition-transform hover:scale-[1.03] active:translate-y-1 active:shadow-none text-sm hover:bg-[#6840E0] transition-colors"
            >
              Try Interactive Practice <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="w-[300px] bg-white p-6 hidden lg:block border-l border-gray-100">
        <h2 className="text-xl font-bold text-[#2D1B69] mb-6">Statistics</h2>

        {/* Progress Circle — live */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <svg className="w-36 h-36" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#EAE4FF" strokeWidth="10" />
              <circle
                cx="50" cy="50" r="45"
                fill="none" stroke="#7D54FF" strokeWidth="10"
                strokeDasharray="283"
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
              <text x="50" y="50" textAnchor="middle" fill="#7D54FF" fontSize="16" fontWeight="bold" dominantBaseline="middle">
                {overallPct}%
              </text>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#FFC83D] mt-1">
                <Image
                  src={user?.imageUrl || "/Avatar.png"}
                  alt={user?.fullName || "User"}
                  width={80} height={80}
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Greeting */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-[#2D1B69] mb-1">
            Good {timeOfDay}, {user?.firstName || "there"} 🔥
          </h3>
          <p className="text-sm text-[#7E7A93]">Keep signing to hit your daily target!</p>
        </div>

        {/* Badges */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-end gap-1">
              <h3 className="text-lg font-bold text-[#2D1B69]">Badges</h3>
              <span className="text-[#7D54FF] font-bold">{String(earnedCount).padStart(2, "0")}</span>
              <span className="text-[#7E7A93]">/10</span>
            </div>
            <Link href="/dashboard/achievements" className="text-[#7D54FF] text-sm flex items-center hover:underline">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {earnedCount === 0 ? (
            <div className="bg-[#FAF7FF] rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">🏆</div>
              <p className="text-xs text-[#7E7A93]">Complete lessons to earn your first badge!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {[
                { gradient: "from-[#FF7A59] to-[#FF7A59]", label: "First Step" },
                { gradient: "from-[#7D54FF] to-[#6840E0]", label: "Learner" },
                { gradient: "from-[#5EC8FF] to-[#6840E0]", label: "Dedicated" },
              ].slice(0, Math.min(earnedCount, 3)).map((badge, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className={`bg-gradient-to-b ${badge.gradient} w-14 h-14 rounded-xl flex items-center justify-center mb-1`}>
                    <span className="text-white text-lg">🏆</span>
                  </div>
                  <div className="text-xs text-center text-[#7E7A93]">{badge.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div>
          <h3 className="text-lg font-bold text-[#2D1B69] mb-4">Leaderboard</h3>

          {leaderboard.length === 0 ? (
            <p className="text-sm text-[#7E7A93] text-center py-4">No scores yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between ${entry.isCurrentUser ? "bg-[#FAF7FF] rounded-lg p-2 -mx-2" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      <Image src={entry.avatar} alt={entry.name} width={40} height={40} className="object-cover" />
                    </div>
                    <div>
                      <div className="font-medium text-[#2D1B69] text-sm">
                        {entry.name}{entry.isCurrentUser && <span className="text-[#7D54FF] ml-1">(you)</span>}
                      </div>
                      <div className="text-xs text-[#7E7A93]">{entry.points} pts</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-[#7E7A93]">Lvl {entry.level}</div>
                    {index === 0 && <span>👑</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-4">
            <Link href="/dashboard/community" className="text-[#7D54FF] text-sm hover:underline">
              View community
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
