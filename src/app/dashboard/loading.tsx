import { PageBody, Skeleton } from "@/components/app/primitives";

export default function DashboardLoading() {
  return (
    <PageBody className="space-y-4" aria-busy="true" aria-label="Loading">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-line bg-panel p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-5 h-6 w-24" />
            <Skeleton className="mt-2 h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-line bg-panel p-4 lg:col-span-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-6 h-[150px] w-full" />
        </div>
        <div className="rounded-xl border border-line bg-panel p-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-6 h-16 w-16 rounded-xl" />
          <Skeleton className="mt-6 h-2 w-full" />
        </div>
      </div>
    </PageBody>
  );
}
