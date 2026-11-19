"use client";

import { useApi } from "@/hooks/use-api";
import { Avatar } from "@/components/app/avatar";
import { ButtonLink, DemoBadge, EmptyState, ErrorState, PageBody, Panel, Skeleton, timeAgo } from "@/components/app/primitives";

interface FeedItem {
  id: string;
  signLabel: string;
  lessonType: string;
  confidence: number;
  createdAt: string;
  user: { name: string; username: string | null; avatarId: number; level: number; isDemo: boolean };
}

export default function CommunityPage() {
  const { data, error, loading, reload } = useApi<{ feed: FeedItem[] }>("/api/community/feed?limit=50");

  return (
    <PageBody className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-fg-muted">Correct signs from learners who share their activity.</p>
        <ButtonLink href="/dashboard/settings" variant="ghost">
          Privacy settings
        </ButtonLink>
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
        ) : (data?.feed.length ?? 0) === 0 ? (
          <EmptyState title="No activity yet" description="When learners sign letters and numbers correctly, it shows up here." />
        ) : (
          <ul>
            {data!.feed.map((a) => (
              <li key={a.id} className="flex items-center gap-3 border-b border-line px-4 py-2.5 text-[13px] last:border-0">
                <Avatar name={a.user.name} avatarId={a.user.avatarId} size={28} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-fg-muted">
                    <span className="font-medium text-fg">{a.user.name}</span> signed{" "}
                    {a.lessonType === "number" ? "number" : "letter"}{" "}
                    <span className="font-medium text-fg">“{a.signLabel}”</span>
                  </p>
                  <p className="text-xs text-fg-subtle">
                    Level {a.user.level} · {a.confidence}% confidence
                  </p>
                </div>
                {a.user.isDemo && <DemoBadge />}
                <time className="shrink-0 text-xs text-fg-subtle" dateTime={a.createdAt}>
                  {timeAgo(a.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </PageBody>
  );
}
