import { SkeletonBox } from "@/components/skeletons/SkeletonCard"

export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 animate-pulse space-y-6">
      {/* Header skeleton */}
      <div className="bg-white rounded-2xl border border-[#ECE8FF] p-6">
        <SkeletonBox className="h-8 w-48 mb-2" />
        <SkeletonBox className="h-4 w-72 mb-4" />
        <SkeletonBox className="h-3 w-full mb-1" />
        <SkeletonBox className="h-2 w-full rounded-full mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[#FAF7FF] rounded-xl p-4">
              <SkeletonBox className="h-3 w-16 mb-2" />
              <SkeletonBox className="h-6 w-20" />
            </div>
          ))}
        </div>
      </div>
      {/* Lesson grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-[#ECE8FF] p-5">
            <SkeletonBox className="h-4 w-24 mb-3" />
            <SkeletonBox className="h-5 w-40 mb-2" />
            <SkeletonBox className="h-3 w-full mb-1" />
            <SkeletonBox className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}