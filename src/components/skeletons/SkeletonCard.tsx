"use client"

// Base shimmer animation used by all skeletons
export const shimmer = `
  relative overflow-hidden before:absolute before:inset-0 
  before:-translate-x-full before:animate-[shimmer_1.5s_infinite] 
  before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent
`

// Pulse base — simpler for small elements
export function SkeletonBox({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`bg-[#EAE4FF] rounded-lg animate-pulse ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}

// Stat card skeleton (dashboard, progress)
export function StatCardSkeleton() {
  return (
    <div className="bg-white p-4 rounded-xl animate-pulse" aria-hidden="true">
      <div className="flex items-center justify-between mb-3">
        <SkeletonBox className="h-4 w-24" />
        <SkeletonBox className="h-8 w-8 rounded-full" />
      </div>
      <SkeletonBox className="h-8 w-20 mb-3" />
      <SkeletonBox className="h-2 w-full rounded-full" />
    </div>
  )
}

// Achievement card skeleton
export function AchievementCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#EAE4FF] animate-pulse" aria-hidden="true">
      <SkeletonBox className="h-2 w-full rounded-none" />
      <div className="p-5 flex items-start gap-4">
        <SkeletonBox className="w-14 h-14 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBox className="h-5 w-32" />
          <SkeletonBox className="h-3 w-full" />
          <SkeletonBox className="h-3 w-3/4" />
          <SkeletonBox className="h-2 w-full rounded-full mt-3" />
        </div>
      </div>
      <div className="px-5 pb-4 flex justify-between items-center">
        <SkeletonBox className="h-6 w-16 rounded-full" />
        <SkeletonBox className="h-4 w-14" />
      </div>
    </div>
  )
}

// Challenge card skeleton
export function ChallengeCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#EAE4FF] animate-pulse" aria-hidden="true">
      <SkeletonBox className="h-2 w-full rounded-none" />
      <div className="p-5 flex items-start gap-4">
        <SkeletonBox className="w-14 h-14 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between">
            <SkeletonBox className="h-5 w-28" />
            <SkeletonBox className="h-5 w-14 rounded-full" />
          </div>
          <SkeletonBox className="h-3 w-full" />
          <SkeletonBox className="h-3 w-2/3" />
          <SkeletonBox className="h-2 w-full rounded-full mt-3" />
        </div>
      </div>
      <div className="px-5 pb-4 flex justify-between items-center">
        <SkeletonBox className="h-6 w-16 rounded-full" />
        <SkeletonBox className="h-4 w-20" />
      </div>
    </div>
  )
}

// Community post skeleton
export function PostSkeleton() {
  return (
    <div className="border border-gray-100 rounded-xl p-5 animate-pulse bg-white" aria-hidden="true">
      <div className="flex items-center gap-3 mb-4">
        <SkeletonBox className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <SkeletonBox className="h-4 w-32" />
          <SkeletonBox className="h-3 w-20" />
        </div>
      </div>
      <SkeletonBox className="h-5 w-3/4 mb-3" />
      <SkeletonBox className="h-3 w-full mb-2" />
      <SkeletonBox className="h-3 w-5/6 mb-4" />
      <div className="flex gap-2 mb-4">
        <SkeletonBox className="h-6 w-20 rounded-full" />
        <SkeletonBox className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-gray-50">
        <SkeletonBox className="h-4 w-16" />
        <div className="flex gap-3">
          <SkeletonBox className="h-4 w-10" />
          <SkeletonBox className="h-4 w-10" />
        </div>
      </div>
    </div>
  )
}

// Leaderboard row skeleton
export function LeaderboardRowSkeleton() {
  return (
    <div className="flex items-center justify-between animate-pulse py-2" aria-hidden="true">
      <div className="flex items-center gap-3">
        <SkeletonBox className="w-6 h-6 rounded-full flex-shrink-0" />
        <SkeletonBox className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="space-y-1.5">
          <SkeletonBox className="h-4 w-24" />
          <SkeletonBox className="h-3 w-16" />
        </div>
      </div>
      <div className="space-y-1.5 text-right">
        <SkeletonBox className="h-4 w-16 ml-auto" />
        <SkeletonBox className="h-3 w-12 ml-auto" />
      </div>
    </div>
  )
}

// Lesson card skeleton
export function LessonCardSkeleton() {
  return (
    <div className="block bg-white rounded-xl overflow-hidden animate-pulse border border-gray-100" aria-hidden="true">
      <SkeletonBox className="h-32 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <SkeletonBox className="h-5 w-20 rounded-full" />
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-3 w-3/4" />
      </div>
    </div>
  )
}

// Progress chart skeleton
export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 animate-pulse" aria-hidden="true">
      <div className="flex justify-between items-center mb-6">
        <SkeletonBox className="h-6 w-32" />
        <SkeletonBox className="h-4 w-48" />
      </div>
      {/* Bar chart placeholder */}
      <div className="flex items-end gap-2 h-40 px-2">
        {[60, 80, 45, 90, 70, 55, 85].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <SkeletonBox className="w-full rounded-t" style={{ height: `${h}%` } as React.CSSProperties} />
            <SkeletonBox className="h-3 w-6" />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4 pt-4 border-t border-gray-50">
        <SkeletonBox className="h-4 w-28" />
        <SkeletonBox className="h-4 w-20" />
        <SkeletonBox className="h-4 w-24" />
      </div>
    </div>
  )
}

// Profile header skeleton
export function ProfileHeaderSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 mb-6 animate-pulse" aria-hidden="true">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <SkeletonBox className="w-24 h-24 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <SkeletonBox className="h-7 w-48" />
          <SkeletonBox className="h-4 w-64" />
          <SkeletonBox className="h-3 w-full rounded-full mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonBox className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="space-y-1.5">
              <SkeletonBox className="h-3 w-14" />
              <SkeletonBox className="h-5 w-10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Dashboard sidebar leaderboard skeleton
export function SidebarLeaderboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-hidden="true">
      {[1,2,3].map(i => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SkeletonBox className="w-10 h-10 rounded-full" />
            <div className="space-y-1.5">
              <SkeletonBox className="h-4 w-20" />
              <SkeletonBox className="h-3 w-14" />
            </div>
          </div>
          <SkeletonBox className="h-4 w-10" />
        </div>
      ))}
    </div>
  )
}

// Generic grid of skeletons
export function SkeletonGrid({
  count = 6,
  Card,
}: {
  count?: number
  Card: React.FC
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} />
      ))}
    </div>
  )
}
