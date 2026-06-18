import KpiCard from "@/components/dashboard/KpiCard";
import { formatXp } from "@/lib/dashboard-utils";
import { TOTAL_LESSONS } from "@/lib/dashboard-utils";

interface KpiGridProps {
  level: number;
  levelTitle: string;
  levelProgress: number;
  xp: number;
  nextXp: number;
  accuracy: number;
  totalAttempts: number;
  correctAttempts: number;
  signsMastered: number;
  streakDays: number;
  lessonsCompleted: number;
  challengesDone: number;
  userRank: number;
  topUsers: any[];
}

export default function KpiGrid({
  level,
  levelTitle: title,
  levelProgress,
  xp,
  nextXp,
  accuracy,
  totalAttempts,
  correctAttempts,
  signsMastered,
  streakDays,
  lessonsCompleted,
  challengesDone,
  userRank,
  topUsers,
}: KpiGridProps) {
  const isNewUser = totalAttempts === 0 && level === 1 && streakDays === 0;

  return (
    <section>
      <h2 className="text-xl font-bold text-ink mb-4">Learning Overview</h2>
      {isNewUser ? (
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
            sublabel={title}
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
            sublabel={totalAttempts > 0 ? `${correctAttempts}/${totalAttempts}` : "No attempts"}
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
            sublabel={streakDays >= 7 ? "On fire!" : streakDays > 0 ? "Keep going!" : "Start today!"}
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
            color="#FF82C3"
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
  );
}
