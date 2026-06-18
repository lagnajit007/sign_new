import {
  StatCardSkeleton,
  ChartSkeleton,
  SkeletonBox,
} from "@/components/skeletons/SkeletonCard"

export default function ProgressLoading() {
  return (
    <div className="flex-1 p-6 overflow-auto bg-[#FAF7FF]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <SkeletonBox className="h-8 w-44" />
          <SkeletonBox className="h-4 w-64" />
        </div>
        <SkeletonBox className="h-10 w-48 rounded-xl" />
      </div>

      {/* Date nav */}
      <SkeletonBox className="h-14 w-full rounded-xl mb-6" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <div className="bg-white rounded-xl p-6 animate-pulse space-y-4">
          <SkeletonBox className="h-6 w-40" />
          {[1, 2].map((n) => (
            <div key={n} className="space-y-2">
              <div className="flex justify-between">
                <SkeletonBox className="h-4 w-24" />
                <SkeletonBox className="h-4 w-16" />
              </div>
              <SkeletonBox className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl p-6 animate-pulse space-y-4">
        <SkeletonBox className="h-6 w-36" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonBox className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <SkeletonBox className="h-4 w-56" />
              <SkeletonBox className="h-3 w-32" />
            </div>
            <SkeletonBox className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
