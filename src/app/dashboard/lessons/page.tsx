"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { Badge, ErrorState, PageBody, Panel, ProgressBar, Skeleton } from "@/components/app/primitives";
import { cn } from "@/lib/utils";

interface ProgressResponse {
  mastered: string[];
  weakSigns: { signLabel: string; bestAccuracy: number; attempts: number }[];
  completionData: { id: string; name: string; total: number; completed: number }[];
}

const SETS = [
  { id: "alphabet", title: "Alphabet", description: "Fingerspell the 26 letters, A to Z.", signs: [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"] },
  { id: "number", title: "Numbers", description: "Sign the digits 0 to 9.", signs: [..."0123456789"] },
] as const;

type Filter = "all" | "todo" | "mastered";

export default function LessonsPage() {
  const { data, error, loading, reload } = useApi<ProgressResponse>("/api/progress");
  const [filter, setFilter] = useState<Filter>("all");

  const mastered = useMemo(() => new Set(data?.mastered ?? []), [data]);
  const practising = useMemo(() => new Set((data?.weakSigns ?? []).map((w) => w.signLabel)), [data]);

  return (
    <PageBody className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-[13px] text-fg-muted">
          Pick a sign to practise with your camera. A sign is mastered the first time it&apos;s recognised with at least 70% confidence.
        </p>
        <div role="radiogroup" aria-label="Filter signs" className="flex rounded-lg border border-line bg-panel p-0.5 text-xs">
          {(["all", "todo", "mastered"] as const).map((f) => (
            <button
              key={f}
              role="radio"
              aria-checked={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "h-7 rounded-md px-2.5 font-medium capitalize text-fg-muted transition-colors",
                filter === f ? "bg-subtle text-fg" : "hover:text-fg",
              )}
            >
              {f === "todo" ? "To learn" : f}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <Panel>
          <ErrorState message={error} onRetry={reload} />
        </Panel>
      ) : (
        SETS.map((set) => {
          const done = set.signs.filter((s) => mastered.has(s)).length;
          const visible = set.signs.filter((s) =>
            filter === "all" ? true : filter === "mastered" ? mastered.has(s) : !mastered.has(s),
          );
          return (
            <Panel
              key={set.id}
              title={set.title}
              description={set.description}
              action={
                loading ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  <div className="flex w-36 items-center gap-2">
                    <ProgressBar value={(done / set.signs.length) * 100} label={`${set.title} progress`} />
                    <span className="shrink-0 text-xs tabular-nums text-fg-subtle">
                      {done}/{set.signs.length}
                    </span>
                  </div>
                )
              }
            >
              {visible.length === 0 ? (
                <p className="py-6 text-center text-xs text-fg-subtle">
                  {filter === "mastered" ? "Nothing mastered here yet." : "Every sign in this set is mastered."}
                </p>
              ) : (
                <ul className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2">
                  {visible.map((sign) => {
                    const isMastered = mastered.has(sign);
                    const isPractising = !isMastered && practising.has(sign);
                    return (
                      <li key={sign}>
                        <Link
                          href={`/dashboard/lessons/interactive?set=${set.id}&sign=${sign}`}
                          className={cn(
                            "group relative flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border bg-panel transition-colors",
                            isMastered ? "border-brand/30 bg-brand-tint" : "border-line hover:border-line-strong hover:bg-subtle",
                          )}
                          aria-label={`${set.id === "number" ? "Number" : "Letter"} ${sign}${isMastered ? ", mastered" : isPractising ? ", in progress" : ""}`}
                        >
                          <span className={cn("font-display text-2xl font-semibold", isMastered ? "text-brand" : "text-fg")}>
                            {sign}
                          </span>
                          {loading ? (
                            <Skeleton className="h-3 w-10" />
                          ) : isMastered ? (
                            <span className="flex items-center gap-0.5 text-[11px] text-brand">
                              <Check className="size-3" aria-hidden /> Mastered
                            </span>
                          ) : isPractising ? (
                            <Badge tone="caution">Practising</Badge>
                          ) : (
                            <span className="text-[11px] text-fg-subtle">Not started</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          );
        })
      )}
    </PageBody>
  );
}
