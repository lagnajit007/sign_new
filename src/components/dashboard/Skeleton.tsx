export function HeroSkeleton() {
  return (
    <div className="rounded-3xl p-8 mb-8 bg-gradient-to-r from-[#7D54FF]/60 to-[#9B7CFF]/60 animate-pulse">
      <div className="h-4 w-24 bg-white/30 rounded mb-4" />
      <div className="h-8 w-72 bg-white/30 rounded mb-3" />
      <div className="h-8 w-56 bg-white/30 rounded mb-6" />
      <div className="flex gap-4 items-center">
        <div className="h-10 w-36 bg-white/30 rounded-full" />
        <div className="h-4 w-32 bg-white/30 rounded" />
      </div>
      <div className="mt-6 flex gap-6">
        <div className="h-12 w-28 bg-white/20 rounded-xl" />
        <div className="h-12 w-28 bg-white/20 rounded-xl" />
        <div className="h-12 w-28 bg-white/20 rounded-xl" />
      </div>
    </div>
  );
}

export function KpiGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl p-5 bg-gray-200 animate-pulse min-h-[140px]">
          <div className="w-10 h-10 bg-gray-300 rounded-xl mb-6" />
          <div className="h-3 w-20 bg-gray-300 rounded mb-1" />
          <div className="h-6 w-16 bg-gray-300 rounded" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ className = "h-48" }: { className?: string }) {
  return (
    <div className={`rounded-2xl p-6 bg-white animate-pulse ${className}`}>
      <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
      <div className="h-6 w-48 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-24 bg-gray-200 rounded mb-4" />
      <div className="h-2 bg-gray-200 rounded-full mb-4" />
      <div className="h-10 w-28 bg-gray-200 rounded-full" />
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-3 w-32 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-20 bg-gray-200 rounded" />
          </div>
          <div className="h-3 w-12 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

export function AchievementsSkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div className="w-14 h-14 bg-gray-200 rounded-xl" />
          <div className="h-3 w-16 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}
