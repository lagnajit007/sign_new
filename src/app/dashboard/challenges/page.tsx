"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Puzzle,
  CheckCircle,
  Clock,
  Zap,
  Award,
  TrendingUp,
  ChevronRight,
  Filter,
  Search,
  Calendar,
  ArrowUpRight,
  AlertCircle,
  Sparkles,
  Play,
} from "lucide-react"
import Button from "@/components/Button"
import ErrorState from "@/components/ErrorState"
import KpiCard from "@/components/KpiCard"
import { ChallengeCardSkeleton, SkeletonBox } from "@/components/skeletons/SkeletonCard"

interface ChallengeItem {
  id: number | string
  name: string
  description: string
  category: string
  difficulty: string
  icon: string
  color: string
  reward: string
  completed: boolean
  progress?: number
  timeLeft?: string
  completedDate?: string
}

export default function ChallengesPage() {
  const [challengeFilter, setChallengeFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("expiring")
  const [animateItems, setAnimateItems] = useState(false)

  // Challenge data — fetched from the API (catalog + this user's progress).
  // Starts empty so the UI shape is preserved while loading.
  const [challenges, setChallenges] = useState<ChallengeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChallenges = useCallback(() => {
    let active = true
    setError(null)
    setIsLoading(true)
    fetch("/api/challenges")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.challenges) setChallenges(data.challenges)
      })
      .catch(() => { if (active) setError("Failed to load challenges. Please try again.") })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(fetchChallenges, [fetchChallenges])

  // Calculate challenge statistics
  const totalChallenges = challenges.length
  const activeChallenges = challenges.filter((c) => !c.completed).length
  const completedChallenges = challenges.filter((c) => c.completed).length
  const expiringChallenges = challenges.filter(
    (c) => !c.completed && (c.timeLeft === "Today" || c.timeLeft === "8 hours"),
  ).length
  const totalXP = challenges.reduce((sum, c) => sum + Number.parseInt(c.reward.split(" ")[0]), 0)

  // Apply filters and sorting
  const filteredChallenges = challenges
    .filter((challenge) => {
      // Filter by status
      if (challengeFilter === "active") return !challenge.completed
      if (challengeFilter === "completed") return challenge.completed
      if (challengeFilter === "daily") return challenge.category === "daily"
      if (challengeFilter === "weekly") return challenge.category === "weekly"
      if (challengeFilter === "monthly") return challenge.category === "monthly"
      return true // "all" filter
    })
    .filter((challenge) => {
      // Filter by difficulty
      if (difficultyFilter === "all") return true
      return challenge.difficulty === difficultyFilter
    })
    .filter((challenge) => {
      // Filter by search query
      if (!searchQuery) return true
      return (
        challenge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })
    .sort((a, b) => {
      // Sort based on selected sort option
      if (sortBy === "expiring") {
        // Sort by time left (for active) or completion date (for completed)
        if (!a.completed && !b.completed) {
          // Both active - sort by time left
          if (a.timeLeft === "Today" && b.timeLeft !== "Today") return -1
          if (a.timeLeft !== "Today" && b.timeLeft === "Today") return 1
          if (a.timeLeft === "Tomorrow" && b.timeLeft !== "Tomorrow") return -1
          if (a.timeLeft !== "Tomorrow" && b.timeLeft === "Tomorrow") return 1
          // Extract numeric values from timeLeft strings (optional field)
          const aTime = Number.parseInt((a.timeLeft ?? "").split(" ")[0]) || 100
          const bTime = Number.parseInt((b.timeLeft ?? "").split(" ")[0]) || 100
          return aTime - bTime
        } else if (a.completed && b.completed) {
          // Both completed - sort by completion date (most recent first)
          if (a.completedDate === "Today" && b.completedDate !== "Today") return -1
          if (a.completedDate !== "Today" && b.completedDate === "Today") return 1
          if (a.completedDate === "Yesterday" && b.completedDate !== "Yesterday") return -1
          if (a.completedDate !== "Yesterday" && b.completedDate === "Yesterday") return 1
          return 0
        } else {
          // One active, one completed
          return a.completed ? 1 : -1 // Active first
        }
      } else if (sortBy === "reward-high") {
        // Sort by reward (high to low)
        const aReward = Number.parseInt(a.reward.split(" ")[0])
        const bReward = Number.parseInt(b.reward.split(" ")[0])
        return bReward - aReward
      } else if (sortBy === "progress") {
        // Sort by progress (high to low)
        const aProgress = a.completed ? 100 : a.progress || 0
        const bProgress = b.completed ? 100 : b.progress || 0
        return bProgress - aProgress
      } else if (sortBy === "alphabetical") {
        return a.name.localeCompare(b.name)
      }
      return 0
    })

  // Difficulty color mapping
  const difficultyColor = {
    easy: "text-[#22C55E]",
    medium: "text-[#FFC83D]",
    hard: "text-[#FF7A59]",
  }

  const difficultyBgColor = {
    easy: "bg-[#22C55E] bg-opacity-10",
    medium: "bg-[#FFC83D] bg-opacity-10",
    hard: "bg-[#FF7A59] bg-opacity-10",
  }

  // Animation effect when filter changes
  useEffect(() => {
    setAnimateItems(false)
    const timer = setTimeout(() => {
      setAnimateItems(true)
    }, 50)
    return () => clearTimeout(timer)
  }, [challengeFilter, difficultyFilter, sortBy, searchQuery])

  return (
    <div className="flex min-h-screen bg-[#FAF7FF]">
      {/* Left Sidebar */}
      {/* <Sidebar activePage="challenges" /> */}

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#2D1B69] mb-2">Challenges</h1>
              <p className="text-[#7E7A93]">Complete challenges to earn XP and badges</p>
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7E7A93] w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search challenges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white border border-[#EAE4FF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7D54FF] focus:border-transparent w-full md:w-64 text-sm"
                />
              </div>
              <Button
                variant={filtersOpen ? "primary" : "outline"}
                size="md"
                icon={Filter}
                onClick={() => setFiltersOpen(!filtersOpen)}
                aria-label="Toggle filters"
              />
            </div>
          </div>

          {/* Filter Panel */}
          {filtersOpen && (
            <div className="mt-4 bg-white rounded-xl p-5 shadow-sm border border-[#EAE4FF] animate-in fade-in duration-200">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[#2D1B69] mb-3">Challenge Type</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setChallengeFilter("all")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        challengeFilter === "all"
                          ? "bg-[#7D54FF] text-white"
                          : "bg-[#FAF7FF] text-[#7E7A93] hover:bg-[#EAE4FF] hover:text-[#7D54FF]"
                      } transition-colors`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setChallengeFilter("active")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        challengeFilter === "active"
                          ? "bg-[#22C55E] text-white"
                          : "bg-[#FAF7FF] text-[#7E7A93] hover:bg-[#22C55E] hover:bg-opacity-20 hover:text-[#22C55E]"
                      } transition-colors`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setChallengeFilter("completed")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        challengeFilter === "completed"
                          ? "bg-[#5EC8FF] text-white"
                          : "bg-[#FAF7FF] text-[#7E7A93] hover:bg-[#5EC8FF] hover:bg-opacity-20 hover:text-[#5EC8FF]"
                      } transition-colors`}
                    >
                      Completed
                    </button>
                    <button
                      onClick={() => setChallengeFilter("daily")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        challengeFilter === "daily"
                          ? "bg-[#FFC83D] text-white"
                          : "bg-[#FAF7FF] text-[#7E7A93] hover:bg-[#FFC83D] hover:bg-opacity-20 hover:text-[#FFC83D]"
                      } transition-colors`}
                    >
                      Daily
                    </button>
                    <button
                      onClick={() => setChallengeFilter("weekly")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        challengeFilter === "weekly"
                          ? "bg-[#FF7A59] text-white"
                          : "bg-[#FAF7FF] text-[#7E7A93] hover:bg-[#FF7A59] hover:bg-opacity-20 hover:text-[#FF7A59]"
                      } transition-colors`}
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => setChallengeFilter("monthly")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        challengeFilter === "monthly"
                          ? "bg-[#5EC8FF] text-white"
                          : "bg-[#FAF7FF] text-[#7E7A93] hover:bg-[#5EC8FF] hover:bg-opacity-20 hover:text-[#5EC8FF]"
                      } transition-colors`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[#2D1B69] mb-3">Difficulty</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setDifficultyFilter("all")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        difficultyFilter === "all"
                          ? "bg-[#7D54FF] text-white"
                          : "bg-[#FAF7FF] text-[#7E7A93] hover:bg-[#EAE4FF] hover:text-[#7D54FF]"
                      } transition-colors`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setDifficultyFilter("easy")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        difficultyFilter === "easy"
                          ? "bg-[#22C55E] text-white"
                          : "bg-[#FAF7FF] text-[#7E7A93] hover:bg-[#22C55E] hover:bg-opacity-20 hover:text-[#22C55E]"
                      } transition-colors`}
                    >
                      Easy
                    </button>
                    <button
                      onClick={() => setDifficultyFilter("medium")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        difficultyFilter === "medium"
                          ? "bg-[#FFC83D] text-white"
                          : "bg-[#FAF7FF] text-[#7E7A93] hover:bg-[#FFC83D] hover:bg-opacity-20 hover:text-[#FFC83D]"
                      } transition-colors`}
                    >
                      Medium
                    </button>
                    <button
                      onClick={() => setDifficultyFilter("hard")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        difficultyFilter === "hard"
                          ? "bg-[#FF7A59] text-white"
                          : "bg-[#FAF7FF] text-[#7E7A93] hover:bg-[#FF7A59] hover:bg-opacity-20 hover:text-[#FF7A59]"
                      } transition-colors`}
                    >
                      Hard
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[#2D1B69] mb-3">Sort By</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSortBy("expiring")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        sortBy === "expiring"
                          ? "bg-[#7D54FF] text-white"
                          : "bg-[#FAF7FF] text-[#7E7A93] hover:bg-[#EAE4FF] hover:text-[#7D54FF]"
                      } transition-colors`}
                    >
                      Expiring Soon
                    </button>
                    <button
                      onClick={() => setSortBy("reward-high")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        sortBy === "reward-high"
                          ? "bg-[#7D54FF] text-white"
                          : "bg-[#FAF7FF] text-[#7E7A93] hover:bg-[#EAE4FF] hover:text-[#7D54FF]"
                      } transition-colors`}
                    >
                      Highest Reward
                    </button>
                    <button
                      onClick={() => setSortBy("progress")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        sortBy === "progress"
                          ? "bg-[#7D54FF] text-white"
                          : "bg-[#FAF7FF] text-[#7E7A93] hover:bg-[#EAE4FF] hover:text-[#7D54FF]"
                      } transition-colors`}
                    >
                      Most Progress
                    </button>
                    <button
                      onClick={() => setSortBy("alphabetical")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        sortBy === "alphabetical"
                          ? "bg-[#7D54FF] text-white"
                          : "bg-[#FAF7FF] text-[#7E7A93] hover:bg-[#EAE4FF] hover:text-[#7D54FF]"
                      } transition-colors`}
                    >
                      Alphabetical
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Challenge Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard icon={Puzzle} label="Active Challenges" value={activeChallenges} color="purple" />
          <KpiCard icon={CheckCircle} label="Completed" value={completedChallenges} color="green" />
          <KpiCard icon={Clock} label="Expiring Soon" value={expiringChallenges} color="orange" />
          <KpiCard icon={Sparkles} label="Total XP Available" value={totalXP} color="purple" />
        </div>

        {/* Challenge Progress Overview */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-[#EAE4FF] mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#2D1B69]">Challenge Progress</h2>
            <div className="text-sm text-[#7E7A93]">
              {completedChallenges}/{totalChallenges} Completed
            </div>
          </div>

          <div className="h-3 bg-[#FAF7FF] rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-[#7D54FF] to-[#5EC8FF] rounded-full transition-all duration-1000"
              style={{ width: `${totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard
              icon={Zap}
              label="Daily Challenges"
              value={`${challenges.filter((c) => c.category === "daily" && c.completed).length}/${challenges.filter((c) => c.category === "daily").length}`}
              color="yellow"
            />
            <KpiCard
              icon={Calendar}
              label="Weekly Challenges"
              value={`${challenges.filter((c) => c.category === "weekly" && c.completed).length}/${challenges.filter((c) => c.category === "weekly").length}`}
              color="orange"
            />
            <KpiCard
              icon={Award}
              label="Monthly Challenges"
              value={`${challenges.filter((c) => c.category === "monthly" && c.completed).length}/${challenges.filter((c) => c.category === "monthly").length}`}
              color="blue"
            />
          </div>
        </div>

        {/* Challenge Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#2D1B69] mb-4">
            {isLoading ? (
              <SkeletonBox className="h-6 w-44 inline-block" />
            ) : (
              `${filteredChallenges.length} ${challengeFilter !== "all" ? challengeFilter : ""} Challenges`
            )}
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <ChallengeCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredChallenges.map((challenge, index) => (
                <div
                  key={challenge.id}
                  className={`bg-white rounded-xl overflow-hidden shadow-sm border border-[#EAE4FF] hover:shadow-md transition-all duration-300 ${
                    animateItems ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div className={`bg-gradient-to-r ${challenge.color} h-2`}></div>
                  <div className="p-5">
                    <div className="flex items-start">
                      <div className={`w-14 h-14 bg-gradient-to-b ${challenge.color} rounded-xl flex items-center justify-center text-2xl mr-4 shrink-0`}>
                        <span className="text-white">{challenge.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-bold text-[#2D1B69] text-lg">{challenge.name}</h3>
                          <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColor[challenge.difficulty as keyof typeof difficultyColor]} ${difficultyBgColor[challenge.difficulty as keyof typeof difficultyBgColor]} capitalize`}>
                            {challenge.difficulty}
                          </div>
                        </div>
                        <p className="text-sm text-[#7E7A93] mt-1 line-clamp-2">{challenge.description}</p>
                        {challenge.completed ? (
                          <div className="flex items-center mt-3 text-xs text-[#22C55E]">
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Completed {challenge.completedDate}
                          </div>
                        ) : challenge.progress && challenge.progress > 0 ? (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-[#7E7A93] mb-1">
                              <span>Progress</span><span>{challenge.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-[#FAF7FF] rounded-full overflow-hidden">
                              <div className={`h-full rounded-full bg-gradient-to-r ${challenge.color}`} style={{ width: `${challenge.progress}%` }} />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center mt-3 text-xs text-[#7E7A93]">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            {challenge.timeLeft ? `Time left: ${challenge.timeLeft}` : "Not started"}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <div className="text-xs font-medium bg-[#EAE4FF] text-[#7D54FF] px-2 py-1 rounded-full">
                        {challenge.reward}
                      </div>
                        {!challenge.completed && (
                        <Button variant="ghost" size="sm" href="/dashboard/lessons/interactive" icon={ChevronRight} iconPosition="right">
                          Start Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="mt-6">
            <ErrorState title="Failed to Load" message={error} onRetry={fetchChallenges} />
          </div>
        )}

        {/* No challenges found — only show after load */}
        {!error && !isLoading && filteredChallenges.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-[#EAE4FF]">
            <div className="w-16 h-16 bg-[#FAF7FF] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-[#7E7A93]" />
            </div>
            <h3 className="text-lg font-bold text-[#2D1B69] mb-2">No challenges found</h3>
            <p className="text-[#7E7A93] mb-4">No challenges match your current filters.</p>
            <Button variant="primary" size="sm" onClick={() => { setChallengeFilter("all"); setDifficultyFilter("all"); setSearchQuery("") }}>
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="w-[300px] bg-white p-6 hidden lg:block sticky top-0 h-screen overflow-y-auto">
        <h2 className="text-xl font-bold text-[#2D1B69] mb-6">Challenge Stats</h2>

        {/* XP from challenges — derived from completed ones */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-[#7E7A93]">XP from Challenges</div>
            <div className="text-xl font-bold text-[#2D1B69]">
              {challenges.filter(c => c.completed).reduce((sum, c) => sum + Number.parseInt(c.reward), 0).toLocaleString()}
            </div>
          </div>
          <div className="h-2 bg-[#FAF7FF] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#7D54FF] rounded-full"
              style={{ width: `${totalChallenges > 0 ? Math.round((completedChallenges / totalChallenges) * 100) : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-2">
            <span className="text-[#7E7A93]">{completedChallenges} completed</span>
            <span className="text-[#7E7A93]">{totalChallenges} total</span>
          </div>
        </div>

        {/* Challenge Categories */}
        <div className="mb-6">
          <div className="text-lg font-bold text-[#2D1B69] mb-4">Categories</div>
          <div className="space-y-3">
            {[
              { label: "Daily",   icon: Zap,        color: "text-[#FFC83D]", bg: "bg-[#FFC83D]", filter: "daily" },
              { label: "Weekly",  icon: Calendar,    color: "text-[#22C55E]", bg: "bg-[#22C55E]", filter: "weekly" },
              { label: "Monthly", icon: TrendingUp,  color: "text-[#5EC8FF]", bg: "bg-[#5EC8FF]", filter: "monthly" },
            ].map((cat) => (
              <button
                key={cat.label}
                onClick={() => setChallengeFilter(cat.filter)}
                className="w-full flex items-center justify-between p-3 bg-[#FAF7FF] rounded-lg hover:bg-[#FAF7FF] transition-colors text-left"
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full ${cat.bg} bg-opacity-20 flex items-center justify-center mr-3`}>
                    <cat.icon className={`w-4 h-4 ${cat.color}`} />
                  </div>
                  <div className="text-sm text-[#2D1B69]">{cat.label}</div>
                </div>
                <div className="text-sm font-medium text-[#7E7A93]">
                  {challenges.filter((c) => c.category === cat.filter.toLowerCase()).length}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent completions */}
        <div>
          <h3 className="text-lg font-bold text-[#2D1B69] mb-4">Recently Completed</h3>

          {challenges.filter((c) => c.completed).length === 0 ? (
            <div className="bg-[#FAF7FF] rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">🎯</div>
              <p className="text-xs text-[#7E7A93]">Complete a challenge to see it here!</p>
                <Button variant="ghost" size="sm" onClick={() => setChallengeFilter("all")}>
                  Browse challenges →
                </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {challenges.filter((c) => c.completed).slice(0, 3).map((challenge) => (
                <div key={challenge.id} className="flex items-start gap-3 group hover:bg-[#FAF7FF] p-2 rounded-lg transition-colors">
                  <div className="bg-[#EAE4FF] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-[#7D54FF]" />
                  </div>
                  <div>
                    <div className="font-medium text-[#2D1B69] text-sm group-hover:text-[#7D54FF] transition-colors">
                      {challenge.name}
                    </div>
                    <div className="text-xs text-[#7E7A93]">{challenge.completedDate || "Completed"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100">
            <Button variant="outline" className="w-full justify-center" href="/dashboard/achievements" icon={ArrowUpRight}>
              View Achievements
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
