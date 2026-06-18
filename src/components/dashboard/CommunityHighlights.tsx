import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";
import { timeAgo } from "@/lib/dashboard-utils";
import EmptyState from "@/components/dashboard/EmptyState";

interface CommunityHighlightsProps {
  communityFeed: Array<{
    id: string;
    signLabel: string;
    correct: boolean;
    createdAt: Date;
    user: { name: string | null; level: number } | null;
  }>;
}

export default function CommunityHighlights({ communityFeed }: CommunityHighlightsProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-ink">Community</h2>
        <Link href="/dashboard/community" className="text-brand text-sm flex items-center hover:underline gap-1">
          Visit community <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {communityFeed.length > 0 ? (
        <div className="bg-surface rounded-2xl p-4 border border-brand-soft">
          <div className="space-y-3">
            {communityFeed.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 py-2 border-b border-brand-soft/50 last:border-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-[#9B7CFF] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {entry.user?.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-ink truncate">
                    <span className="font-medium">{entry.user?.name || "A learner"}</span>{" "}
                    <span className="text-ink-soft font-normal">
                      practiced <span className="font-medium">{entry.signLabel}</span>
                    </span>
                  </div>
                  <div className="text-xs text-ink-soft flex items-center gap-2">
                    <span>{timeAgo(entry.createdAt)}</span>
                    {entry.correct && <span className="text-green-600">· Correct</span>}
                  </div>
                </div>
                <div className="text-xs text-ink-soft bg-bg rounded-lg px-2.5 py-1.5 text-center">
                  Lvl {entry.user?.level || "?"}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-4">
            <Link
              href="/dashboard/community"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-bg text-brand rounded-full text-sm font-medium hover:bg-brand-soft transition-colors"
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
  );
}
