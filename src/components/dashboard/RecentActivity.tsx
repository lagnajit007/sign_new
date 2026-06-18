import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { timeAgo } from "@/lib/dashboard-utils";
import EmptyState from "@/components/dashboard/EmptyState";

interface RecentActivityProps {
  recentActivity: Array<{
    id: string;
    lessonType: string;
    signLabel: string;
    correct: boolean;
    confidence: number;
    createdAt: Date;
  }>;
}

export default function RecentActivity({ recentActivity }: RecentActivityProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-ink">Recent Activity</h2>
        <Link href="/dashboard/progress" className="text-brand text-sm flex items-center hover:underline gap-1">
          View progress <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {recentActivity.length > 0 ? (
        <div className="bg-surface rounded-2xl p-4 border border-brand-soft">
          <div className="relative pl-6 space-y-0">
            {recentActivity.slice(0, 6).map((entry, i) => (
              <div key={entry.id} className="relative pb-5 last:pb-0">
                {i < Math.min(recentActivity.length - 1, 5) && (
                  <div className="absolute left-0 top-2 bottom-0 w-px bg-brand-soft" />
                )}
                <div className={`absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 ${
                  entry.correct ? "border-green-500 bg-green-50" : "border-red-400 bg-red-50"
                }`} />
                <div className="ml-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink">
                      {entry.lessonType === "alphabet" ? "Letter" : "Number"}: {entry.signLabel}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      entry.correct ? "bg-green-50 text-green-700" : "bg-red-50 text-red-500"
                    }`}>
                      {entry.correct ? "Correct" : "Incorrect"}
                    </span>
                  </div>
                  <div className="text-xs text-ink-soft flex items-center gap-2 mt-0.5">
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
  );
}
