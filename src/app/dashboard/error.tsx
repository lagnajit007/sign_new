"use client";

import { ErrorState, PageBody } from "@/components/app/primitives";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PageBody>
      <div className="rounded-xl border border-line bg-panel">
        <ErrorState message="This page failed to load. It may be a temporary problem." onRetry={reset} />
      </div>
    </PageBody>
  );
}
