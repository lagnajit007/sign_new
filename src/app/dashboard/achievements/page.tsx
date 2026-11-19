"use client";

import { Lock } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { ErrorState, PageBody, Panel, ProgressBar, Skeleton } from "@/components/app/primitives";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  xp: number;
  earned: boolean;
  unlockedAt: string | null;
  progress: number;
}

export default function AchievementsPage() {
  const { data, error, loading, reload } = useApi<{ achievements: Achievement[] }>("/api/achievements");

  if (error) {
    return (
      <PageBody>
        <Panel>
          <ErrorState message={error} onRetry={reload} />
        </Panel>
      </PageBody>
    );
  }

  const list = data?.achievements ?? [];
  const earned = list.filter((a) => a.earned).length;

  return (
    <PageBody className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-fg-muted">
          {loading && !data ? "Loading…" : `${earned} of ${list.length} unlocked. Each one adds bonus XP the moment you earn it.`}
        </p>
        {!loading && list.length > 0 && (
          <div className="flex w-48 items-center gap-2">
            <ProgressBar value={(earned / list.length) * 100} label="Achievements unlocked" />
          </div>
        )}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading && !data
          ? Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-[148px] rounded-xl" />)
          : list.map((a) => (
              <li
                key={a.id}
                className={cn("flex flex-col rounded-xl border border-line bg-panel p-4", !a.earned && "bg-canvas")}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={cn("grid size-10 place-items-center rounded-xl text-xl", !a.earned && "grayscale")}
                    style={{ background: `color-mix(in oklab, ${a.color} ${a.earned ? 16 : 8}%, transparent)` }}
                    aria-hidden
                  >
                    {a.icon}
                  </span>
                  <span className="text-xs tabular-nums text-fg-subtle">+{a.xp} XP</span>
                </div>
                <p className={cn("mt-3 text-[13px] font-medium", a.earned ? "text-fg" : "text-fg-muted")}>{a.name}</p>
                <p className="mt-0.5 text-xs text-fg-subtle">{a.description}</p>
                <div className="mt-auto pt-3">
                  {a.earned ? (
                    <p className="text-xs text-positive">
                      Unlocked{" "}
                      {a.unlockedAt &&
                        new Date(a.unlockedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="size-3 shrink-0 text-fg-subtle" aria-label="Locked" />
                      <ProgressBar value={a.progress} label={`${a.name} progress`} />
                      <span className="shrink-0 text-[11px] tabular-nums text-fg-subtle">{a.progress}%</span>
                    </div>
                  )}
                </div>
              </li>
            ))}
      </ul>
    </PageBody>
  );
}
