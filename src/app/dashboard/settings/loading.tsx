import { SkeletonBox } from "@/components/skeletons/SkeletonCard"

export default function SettingsLoading() {
  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6 animate-pulse">
      <SkeletonBox className="h-8 w-32 mb-2" />
      <SkeletonBox className="h-4 w-64 mb-8" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-[#ECE8FF] p-6 mb-4">
          <SkeletonBox className="h-5 w-48 mb-4" />
          <SkeletonBox className="h-12 w-full mb-3" />
          <SkeletonBox className="h-12 w-full" />
        </div>
      ))}
    </div>
  )
}