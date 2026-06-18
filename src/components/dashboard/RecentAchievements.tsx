import Link from "next/link";
import { ChevronRight } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";

interface RecentAchievementsProps {
  earnedAchievements: Array<{
    id: string;
    achievement: {
      color: string | null;
      icon: string | null;
      name: string;
      xpReward: number;
    };
    unlockedAt: Date | null;
  }>;
}

export default function RecentAchievements({ earnedAchievements }: RecentAchievementsProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-ink">Recent Achievements</h2>
        <Link href="/dashboard/achievements" className="text-brand text-sm flex items-center hover:underline gap-1">
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {earnedAchievements.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {earnedAchievements.slice(0, 4).map((ua) => (
            <div key={ua.id} className="bg-surface rounded-2xl p-4 text-center border border-brand-soft hover:shadow-md transition-shadow">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2 text-2xl"
                style={{ backgroundColor: ua.achievement.color || "#EAE4FF" }}
              >
                {ua.achievement.icon || "🏆"}
              </div>
              <h4 className="font-semibold text-ink text-sm">{ua.achievement.name}</h4>
              <p className="text-xs text-ink-soft mt-0.5">
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
  );
}
