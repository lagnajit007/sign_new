import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";

interface DailyQuestProps {
  activeChallenge: {
    challenge: { name: string; description: string; rewardXp: number; goal: number };
    progress: number;
  } | undefined;
}

export default function DailyQuest({ activeChallenge }: DailyQuestProps) {
  if (activeChallenge) {
    const progressPct = Math.min(100, Math.round((activeChallenge.progress / activeChallenge.challenge.goal) * 100));

    return (
      <section>
        <h2 className="text-xl font-bold text-ink mb-4">Daily Quest</h2>
        <div className="bg-gradient-to-br from-[#FF8C00]/10 via-coral/5 to-pink/10 rounded-2xl p-6 border border-[#FF8C00]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8C00]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FF8C00]/10 rounded-full text-xs font-medium text-[#FF8C00]">
                  <Sparkles className="w-3.5 h-3.5" /> Active Quest
                </div>
                <h3 className="text-lg font-bold text-ink">{activeChallenge.challenge.name}</h3>
                <p className="text-sm text-ink-soft">{activeChallenge.challenge.description}</p>
                <div className="flex items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full font-medium">
                    +{activeChallenge.challenge.rewardXp} XP
                  </span>
                  <span className="text-ink-soft">
                    Progress: {activeChallenge.progress} / {activeChallenge.challenge.goal}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="h-2.5 bg-[#FF8C00]/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF8C00] to-coral rounded-full transition-all duration-1000"
                  style={{ width: `${progressPct}%` }}
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
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xl font-bold text-ink mb-4">Daily Quest</h2>
      <EmptyState
        icon="⚔️"
        title="No Active Quest"
        description="Daily challenges help you stay consistent. Start a lesson to begin earning quest progress."
        actionLabel="Browse Challenges"
        actionHref="/dashboard/challenges"
      />
    </section>
  );
}
