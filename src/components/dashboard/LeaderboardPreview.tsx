import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { levelForXp } from "@/lib/gamification";
import { formatXp } from "@/lib/dashboard-utils";
import EmptyState from "@/components/dashboard/EmptyState";

interface LeaderboardPreviewProps {
  topUsers: Array<{
    id: string;
    name: string | null;
    xp: number;
  }>;
  dbUserId: string | undefined;
  clerkUserImageUrl: string | undefined;
  dbUserName: string | undefined;
  userRank: number;
  xp: number;
}

export default function LeaderboardPreview({
  topUsers,
  dbUserId,
  clerkUserImageUrl,
  dbUserName,
  userRank,
  xp,
}: LeaderboardPreviewProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-ink">Leaderboard</h2>
        <Link href="/dashboard/community" className="text-brand text-sm flex items-center hover:underline gap-1">
          View full board <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {topUsers.length > 0 ? (
        <div className="bg-surface rounded-2xl p-4 border border-brand-soft">
          {topUsers.map((entry, index) => {
            const isMe = entry.id === dbUserId;
            return (
              <div
                key={entry.id}
                className={`flex items-center justify-between py-3 px-3 ${
                  isMe ? "bg-bg rounded-xl -mx-1 px-4" : ""
                } ${index < topUsers.length - 1 ? "border-b border-brand-soft/50" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? "bg-yellow-100 text-yellow-700" :
                    index === 1 ? "bg-gray-100 text-gray-600" :
                    index === 2 ? "bg-orange-100 text-orange-700" :
                    "bg-brand-soft text-ink-soft"
                  }`}>
                    {index + 1}
                  </div>
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100">
                    {isMe && clerkUserImageUrl ? (
                      <Image src={clerkUserImageUrl} alt={entry.name || "User"} width={36} height={36} className="object-cover" />
                    ) : entry.name ? (
                      <div className="w-full h-full flex items-center justify-center bg-brand/10 text-brand font-bold text-sm">
                        {entry.name.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-sm">?</div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-ink text-sm flex items-center gap-1.5">
                      {entry.name || "Anonymous"}
                      {isMe && <span className="text-xs bg-brand/10 text-brand px-1.5 py-0.5 rounded font-medium">You</span>}
                      {index === 0 && <span className="text-xs">👑</span>}
                    </div>
                    <div className="text-xs text-ink-soft">Lvl {levelForXp(entry.xp)}</div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-ink">{formatXp(entry.xp)} XP</div>
              </div>
            );
          })}

          {userRank > 5 && (
            <div className="text-center mt-3 pt-3 border-t border-brand-soft/50">
              <span className="text-sm text-ink-soft">
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
  );
}
