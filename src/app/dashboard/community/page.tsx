import { Construction } from "lucide-react"

export default function CommunityPage() {
  return (
    <div className="flex-1 p-6 overflow-auto flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-[#EAE4FF] rounded-full flex items-center justify-center mx-auto mb-6">
          <Construction className="w-10 h-10 text-[#7D54FF]" />
        </div>
        <h1 className="text-2xl font-bold text-[#2D1B69] mb-2">Community — Coming Soon</h1>
        <p className="text-[#7E7A93] mb-6">
          We&apos;re building a space for learners to connect, share tips, and practise together.
          Stay tuned!
        </p>
      </div>
    </div>
  )
}
