"use client"

import ErrorState from "@/components/ErrorState"

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="p-4 lg:p-6">
      <ErrorState title="Page Error" message={error.message || "Something went wrong loading this page."} onRetry={reset} />
    </div>
  )
}