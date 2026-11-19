"use client";

import { Check, Clock } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { Badge, ErrorState, PageBody, Panel, ProgressBar, Skeleton } from "@/components/app/primitives";

interface Challenge {
  id: string;
  key: string;
  name: string;
  description: string;
  difficulty: string;
  icon: string;
  color: string;
  rewardXp: number;
  goal: number;
  current: number;
  period: "daily" | "weekly" | "monthly" | "none";
  completed: boolean;
  progress: number;
  completedAt: string | null;
  timeLeftMs: number | null;
}

const PERIOD_TITLES: Record<Challenge["period"], string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  none: "Milestones",
};

function formatTimeLeft(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  if (h >= 48) return `${Math.floor(h / 24)} days left`;
  if (h >= 1) return `${h}h left`;
  return `${Math.max(1, Math.floor(ms / 60_000))}m left`;
}

function ChallengeRow({ c }: { c: Challenge }) {
  return (
    <li className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0">
      <span
        className="grid size-9 shrink-0 place-items-center rounded-lg text-lg"
        style={{ background: `color-mix(in oklab, ${c.color} 14%, transparent)` }}
        aria-hidden
      >
        {c.icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[13px] font-medium text-fg">{c.name}</p>
          {c.completed && (
            <Badge tone="positive">
              <Check className="size-3" aria-hidden /> Done
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-fg-subtle">{c.description}</p>
        <div className="mt-2 flex items-center gap-2 sm:max-w-sm">
          <ProgressBar value={c.progress} label={`${c.name} progress`} />
          <span className="shrink-0 text-xs tabular-nums text-fg-subtle">
            {c.current}/{c.goal}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <Badge tone="brand">+{c.rewardXp} XP</Badge>
        {c.timeLeftMs !== null && !c.completed && (
          <span className="flex items-center gap-1 text-[11px] text-fg-subtle">
            <Clock className="size-3" aria-hidden />
            {formatTimeLeft(c.timeLeftMs)}
          </span>
        )}
      </div>
    </li>
  );
}

export default function ChallengesPage() {
  const { data, error, loading, reload } = useApi<{ challenges: Challenge[] }>("/api/challenges");

  if (error) {
    return (
      <PageBody>
        <Panel>
          <ErrorState message={error} onRetry={reload} />
        </Panel>
      </PageBody>
    );
  }

  const challenges = data?.challenges ?? [];
  const groups = (["daily", "weekly", "monthly", "none"] as const)
    .map((period) => ({ period, items: challenges.filter((c) => c.period === period) }))
    .filter((g) => g.items.length > 0);

  return (
    <PageBody className="space-y-4">
      <p className="max-w-2xl text-[13px] text-fg-muted">
        Challenges track your real practice automatically. Daily ones reset at midnight UTC, weekly ones on Monday. Each reward is paid once per period.
      </p>
      {loading && !data
        ? [0, 1].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)
        : groups.map((g) => (
            <Panel
              key={g.period}
              title={PERIOD_TITLES[g.period]}
              action={
                <span className="text-xs text-fg-subtle">
                  {g.items.filter((c) => c.completed).length}/{g.items.length} done
                </span>
              }
              bodyClassName="p-0"
            >
              <ul>
                {g.items.map((c) => (
                  <ChallengeRow key={c.id} c={c} />
                ))}
              </ul>
            </Panel>
          ))}
    </PageBody>
  );
}
