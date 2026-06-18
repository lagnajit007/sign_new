export default function Loading() {
  return (
    <div className="flex min-h-screen bg-[#FAF7FF] items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-[#EAE4FF] border-t-[#7D54FF] rounded-full animate-spin mb-4"></div>
        <p className="text-[#7E7A93]">Loading challenges...</p>
      </div>
    </div>
  )
}