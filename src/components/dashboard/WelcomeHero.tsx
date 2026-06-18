import Link from "next/link";
import { Zap, Target, Flame } from "lucide-react";
import { formatXp } from "@/lib/dashboard-utils";
import { HeroSkeleton } from "@/components/dashboard/Skeleton";

interface WelcomeHeroProps {
  clerkUser: any;
  firstName: string;
  timeOfDay: string;
  level: number;
  levelTitle: string;
  xp: number;
  nextXp: number;
  streakDays: number;
  dailyProgress: number;
  dailyGoal: number;
  dailyPct: number;
}

export default function WelcomeHero({
  clerkUser,
  firstName,
  timeOfDay,
  level,
  levelTitle: title,
  xp,
  nextXp,
  streakDays,
  dailyProgress,
  dailyGoal,
  dailyPct,
}: WelcomeHeroProps) {
  if (clerkUser === undefined) {
    return <HeroSkeleton />;
  }

  return (
    <section className="bg-gradient-to-br from-brand via-[#8B6BFF] to-[#9B7CFF] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm md:text-base font-medium text-white/80">
              Good {timeOfDay}, {firstName}
            </p>
            <h1 className="text-2xl md:text-4xl font-bold">
              Level {level} — {title}
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
              className="inline-flex items-center gap-2 bg-white text-brand rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
  );
}
