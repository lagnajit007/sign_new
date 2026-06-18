import { Construction } from "lucide-react"

export default function ComingSoonCard({ title, description }: { title?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-[#EAE4FF] rounded-full flex items-center justify-center mb-4">
        <Construction className="w-8 h-8 text-[#7D54FF]" />
      </div>
      <h3 className="text-lg font-bold text-[#2D1B69] mb-1">{title ?? "Coming Soon"}</h3>
      <p className="text-sm text-[#7E7A93] max-w-xs">
        {description ?? "This feature is under construction. Check back later!"}
      </p>
    </div>
  )
}