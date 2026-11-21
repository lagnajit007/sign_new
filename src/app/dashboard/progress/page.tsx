"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Sparkles, Target } from "lucide-react";
import { Flame } from "@/components/art/flame";
import { useApi } from "@/hooks/use-api";
import { ActivityBars } from "@/components/app/charts";
import { IsoFigure } from "@/components/iso/IsoFigure";
import {
  Badge,
  ButtonLink,
  EmptyState,
  ErrorState,
  PageBody,
  Panel,
  ProgressBar,
  Skeleton,
  Stat,
  timeAgo,
} from "@/components/app/primitives";
import { cn } from "@/lib/utils";

type Range = "week" | "month" | "year";

interface ProgressResponse {
  range: Range;
  activityData: { label: string; attempts: number; correct: number }[];
  completionData: { id: string; name: string; total: number; completed: number }[];
  recentActivity: {
    id: string;
    signLabel: string;
    lessonType: string;
    predictedLabel: string;
    correct: boolean;
    confidence: number;
    createdAt: string;
  }[];
  weakSigns: { signLabel: string; lessonType: string; bestAccuracy: number; attempts: number }[];
  summary: { xp: number; lessonsCompleted: number; accuracy: number; streakDays: number; totalAttempts: number };
}

const RANGES: { id: Range; label: string; caption: string }[] = [
  { id: "week", label: "7 days", caption: "Last 7 days" },
  { id: "month", label: "30 days", caption: "Last 30 days" },
  { id: "year", label: "12 months", caption: "Last 12 months" },
];

export default function ProgressPage() {
  const [range, setRange] = useState<Range>("week");
  const { data, error, loading, reload } = useApi<ProgressResponse>(`/api/progress?range=${range}`);
  const caption = RANGES.find((r) => r.id === range)!.caption;

  if (error) {
    return (
      <PageBody>
        <Panel>
          <ErrorState message={error} onRetry={reload} />
        </Panel>
      </PageBody>
    );
  }

  const s = data?.summary;
  const rangeAttempts = data?.activityData.reduce((n, d) => n + d.attempts, 0) ?? 0;
  const rangeCorrect = data?.activityData.reduce((n, d) => n + d.correct, 0) ?? 0;

  return (
    <PageBody className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading && !data ? (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[104px] rounded-xl" />)
        ) : (
          <>
            <Stat label="Total XP" icon={<Sparkles />} value={s?.xp.toLocaleString() ?? "0"} />
            <Stat label="Streak" icon={<Flame animated={(s?.streakDays ?? 0) > 0} dim={(s?.streakDays ?? 0) === 0} />} value={`${s?.streakDays ?? 0} days`} />
            <Stat label="Signs mastered" icon={<CheckCircle2 />} value={`${s?.lessonsCompleted ?? 0} / 36`} />
            <Stat
              label="Accuracy"
              icon={<Target />}
              value={s?.totalAttempts ? `${s.accuracy}%` : "—"}
              hint={`${s?.totalAttempts ?? 0} attempts all-time`}
            />
          </>
        )}
      </div>

      <Panel
        title="Activity"
        description={`${caption} · ${rangeCorrect} correct of ${rangeAttempts} attempts (UTC)`}
        action={
          <div role="radiogroup" aria-label="Time range" className="flex rounded-lg border border-line p-0.5 text-xs">
            {RANGES.map((r) => (
              <button
                key={r.id}
                role="radio"
                aria-checked={range === r.id}
                onClick={() => setRange(r.id)}
                className={cn(
                  "h-6 rounded-md px-2 font-medium text-fg-muted transition-colors",
                  range === r.id ? "bg-subtle text-fg" : "hover:text-fg",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      >
        {loading && !data ? (
          <Skeleton className="h-[200px] w-full" />
        ) : rangeAttempts === 0 ? (
          <EmptyState
            title="No attempts in this period"
            description="Mark a day on the calendar to see how a steady practice habit grows."
            illustration={<IsoFigure name="progress-activity" />}
            action={<ButtonLink variant="primary" href="/dashboard/lessons">Practise a sign</ButtonLink>}
          />
        ) : (
          <ActivityBars
            data={(data?.activityData ?? []).map((d) => ({ label: d.label, total: d.attempts, highlight: d.correct }))}
            height={200}
          />
        )}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Course completion">
          {loading && !data ? (
            <Skeleton className="h-[280px] w-full" />
          ) : s?.lessonsCompleted === 0 ? (
            <EmptyState
              title="No signs mastered yet"
              description="Choose a tile, then start with a sign that feels familiar."
              illustration={<IsoFigure name="progress-mastery" />}
              action={<ButtonLink variant="primary" href="/dashboard/lessons">Browse lessons</ButtonLink>}
            />
          ) : (
            <ul className="space-y-4">
              {(data?.completionData ?? []).map((c) => (
                <li key={c.id}>
                  <div className="mb-1.5 flex justify-between text-[13px]">
                    <span className="text-fg">{c.name}</span>
                    <span className="tabular-nums text-fg-subtle">
                      {c.completed}/{c.total}
                    </span>
                  </div>
                  <ProgressBar value={(c.completed / c.total) * 100} label={`${c.name} completion`} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Needs practice" description="Attempted but not yet mastered, lowest confidence first" className="lg:col-span-2" bodyClassName="p-0">
          {loading && !data ? (
            <Skeleton className="m-4 h-[240px]" />
          ) : (data?.weakSigns.length ?? 0) === 0 ? (
            <EmptyState
              title="Nothing flagged"
              description="Signs you attempt but haven't mastered will appear here."
              illustration={<IsoFigure name="progress-needs-practice" />}
            />
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line text-left text-xs text-fg-subtle">
                  <th className="px-4 py-2 font-normal">Sign</th>
                  <th className="px-2 py-2 font-normal">Best confidence</th>
                  <th className="px-2 py-2 font-normal">Attempts</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {data!.weakSigns.map((w) => (
                  <tr key={w.signLabel} className="border-b border-line last:border-0">
                    <td className="px-4 py-2.5 font-medium text-fg">{w.signLabel}</td>
                    <td className="px-2 py-2.5 tabular-nums text-fg-muted">{w.bestAccuracy}%</td>
                    <td className="px-2 py-2.5 tabular-nums text-fg-muted">{w.attempts}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Link
                        className="text-xs font-medium text-brand hover:underline"
                        href={`/dashboard/lessons/interactive?set=${w.lessonType}&sign=${w.signLabel}`}
                      >
                        Practise
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </div>

      <Panel title="Recent attempts" bodyClassName="p-0">
        {loading && !data ? (
          <Skeleton className="m-4 h-[220px]" />
        ) : (data?.recentActivity.length ?? 0) === 0 ? (
          <EmptyState
            title="No attempts yet"
            description="Your practice history will appear here."
            illustration={<IsoFigure name="progress-recent-attempts" />}
            action={<ButtonLink variant="primary" href="/dashboard/lessons">Practise a sign</ButtonLink>}
          />
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-xs text-fg-subtle">
                <th className="px-4 py-2 font-normal">Target</th>
                <th className="px-2 py-2 font-normal">Recognised as</th>
                <th className="px-2 py-2 font-normal">Confidence</th>
                <th className="px-2 py-2 font-normal">Result</th>
                <th className="px-4 py-2 text-right font-normal">When</th>
              </tr>
            </thead>
            <tbody>
              {data!.recentActivity.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-2.5 font-medium text-fg">{a.signLabel}</td>
                  <td className="px-2 py-2.5 text-fg-muted">{a.predictedLabel}</td>
                  <td className="px-2 py-2.5 tabular-nums text-fg-muted">{a.confidence}%</td>
                  <td className="px-2 py-2.5">
                    {a.correct ? <Badge tone="positive">Correct</Badge> : <Badge tone="neutral">Missed</Badge>}
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-fg-subtle">{timeAgo(a.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </PageBody>
  );
}
