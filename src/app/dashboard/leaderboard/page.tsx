"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Flame } from "@/components/art/flame";
import { useApi } from "@/hooks/use-api";
import { IsoFigure } from "@/components/iso/IsoFigure";
import { Avatar } from "@/components/app/avatar";
import { Badge, DemoBadge, EmptyState, ErrorState, PageBody, Panel, Skeleton } from "@/components/app/primitives";
import { cn } from "@/lib/utils";

interface Entry {
  rank: number;
  id: string;
  name: string;
  username: string | null;
  points: number;
  level: number;
  streakDays: number;
  avatarId: number;
  isDemo: boolean;
  isCurrentUser: boolean;
}

type Scope = "global" | "weekly";
type SortKey = "rank" | "level" | "streakDays";

export default function LeaderboardPage() {
  const [scope, setScope] = useState<Scope>("global");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "rank", dir: 1 });
  const { data, error, loading, reload } = useApi<{ entries: Entry[] }>(`/api/leaderboard?scope=${scope}`);

  const rows = useMemo(() => {
    const list = [...(data?.entries ?? [])];
    list.sort((a, b) => (a[sort.key] - b[sort.key]) * sort.dir || a.rank - b.rank);
    return list;
  }, [data, sort]);

  const me = data?.entries.find((e) => e.isCurrentUser);

  function header(key: SortKey, label: string, className?: string) {
    const active = sort.key === key;
    return (
      <th className={cn("px-2 py-2 font-normal", className)} aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
        <button
          className={cn("inline-flex items-center gap-1 hover:text-fg", active && "text-fg")}
          onClick={() => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : key === "rank" ? 1 : -1 }))}
        >
          {label}
          {active && (sort.dir === 1 ? <ArrowUp className="size-3" aria-hidden /> : <ArrowDown className="size-3" aria-hidden />)}
        </button>
      </th>
    );
  }

  return (
    <PageBody className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Leaderboard period" className="flex rounded-lg border border-line bg-panel p-0.5 text-xs">
          {(
            [
              ["global", "All time"],
              ["weekly", "This week"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={scope === id}
              onClick={() => setScope(id)}
              className={cn(
                "h-7 rounded-md px-3 font-medium text-fg-muted transition-colors",
                scope === id ? "bg-subtle text-fg" : "hover:text-fg",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-fg-subtle">
          {scope === "weekly"
            ? "XP from correct signs in the last 7 days (10 XP each)."
            : "Lifetime XP, including mastery and achievement bonuses."}
          {me ? ` You're #${me.rank}.` : ""}
        </p>
      </div>

      <Panel bodyClassName="p-0">
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading && !data ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title={scope === "weekly" ? "No one has practised this week" : "No learners yet"}
            description="Correct signs earn XP and put you on the board."
            illustration={<IsoFigure name="leaderboard-empty" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-[13px]">
              <thead>
                <tr className="border-b border-line text-left text-xs text-fg-subtle">
                  {header("rank", "#", "w-12 pl-4")}
                  <th className="px-2 py-2 font-normal">Learner</th>
                  {header("level", "Level")}
                  {header("streakDays", "Streak")}
                  <th className="px-4 py-2 text-right font-normal">{scope === "weekly" ? "XP this week" : "XP"}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr
                    key={e.id}
                    className={cn("border-b border-line last:border-0", e.isCurrentUser ? "bg-brand-tint" : "hover:bg-subtle/60")}
                  >
                    <td className="py-2.5 pl-4 pr-2 tabular-nums text-fg-subtle">{e.rank}</td>
                    <td className="px-2 py-2.5">
                      <span className="flex min-w-0 items-center gap-2.5">
                        <Avatar name={e.name} avatarId={e.avatarId} size={26} />
                        <span className="min-w-0">
                          <span className="block truncate text-fg">{e.name}</span>
                          {e.username && <span className="block truncate text-xs text-fg-subtle">@{e.username}</span>}
                        </span>
                        {e.isCurrentUser && <Badge tone="brand">You</Badge>}
                        {e.isDemo && <DemoBadge />}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 tabular-nums text-fg-muted">{e.level}</td>
                    <td className="px-2 py-2.5 tabular-nums text-fg-muted">
                      <span className="inline-flex items-center gap-1">
                        {e.streakDays > 0 && <Flame size={10} animated={false} />}
                        {e.streakDays}d
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium tabular-nums text-fg">{e.points.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <p className="text-xs text-fg-subtle">
        Learners marked <span className="font-medium text-fg-muted">Demo</span> are sample accounts that show how the board works until more people join.
        You can hide yourself from the leaderboard in Settings.
      </p>
    </PageBody>
  );
}
