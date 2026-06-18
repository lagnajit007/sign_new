"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Trophy,
  BadgeCheck,
  Star,
  Lock,
  Calendar,
  ChevronRight,
  Info,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
} from "lucide-react"
import {
  AchievementCardSkeleton,
  SkeletonBox,
} from "@/components/skeletons/SkeletonCard"

interface AchievementItem {
  id: number | string
  name: string
  description: string
  category: string
  icon: string
  color: string
  earned: boolean
  date?: string
  progress?: number
  xp: number
}

// Loading-state fallback. Real unlock state is fetched from /api/achievements;
// this just preserves the UI shape so the grid never flashes empty.
const INITIAL_ACHIEVEMENTS: AchievementItem[] = []

export default function AchievementsPage() {
  const [achievementFilter, setAchievementFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState("recent")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [animateItems, setAnimateItems] = useState(false)

  // Achievement data — initialised with the catalog shape as a loading
  // fallback, then replaced with the user's real unlock state from the API.
  const [achievements, setAchievements] = useState(() => INITIAL_ACHIEVEMENTS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch("/api/achievements")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.achievements) setAchievements(data.achievements)
      })
      .catch(() => {})
      .finally(() => { if (active) setIsLoading(false) })
    return () => {
      active = false
    }
  }, [])

  // Categories for filtering
  const categories = [
    { id: "all", name: "All Categories" },
    { id: "beginner", name: "Beginner" },
    { id: "intermediate", name: "Intermediate" },
    { id: "advanced", name: "Advanced" },
    { id: "commitment", name: "Commitment" },
    { id: "social", name: "Social" },
  ]

  // Filter achievements based on selected category and search query
  const filteredAchievements = achievements
    .filter((achievement) => {
      // Filter by status (earned, in-progress, locked)
      if (achievementFilter === "earned") return achievement.earned
      if (achievementFilter === "in-progress") return !achievement.earned && (achievement.progress ?? 0) > 0
      if (achievementFilter === "locked")
        return !achievement.earned && (!achievement.progress || achievement.progress === 0)
      return true // "all" filter
    })
    .filter((achievement) => {
      // Filter by category
      if (categoryFilter === "all") return true
      return achievement.category === categoryFilter
    })
    .filter((achievement) => {
      // Filter by search query
      if (!searchQuery) return true
      return (
        achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        achievement.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })
    .sort((a, b) => {
      // Sort based on selected sort option
      if (sortBy === "recent") {
        // Sort by date (for earned) or progress (for unearned)
        if (a.earned && b.earned) {
          return new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
        } else if (!a.earned && !b.earned) {
          return (b.progress || 0) - (a.progress || 0)
        } else {
          return a.earned ? -1 : 1 // Earned first
        }
      } else if (sortBy === "xp-high") {
        return b.xp - a.xp
      } else if (sortBy === "xp-low") {
        return a.xp - b.xp
      } else if (sortBy === "alphabetical") {
        return a.name.localeCompare(b.name)
      }
      return 0
    })

  // Animation effect when filter changes
  useEffect(() => {
    setAnimateItems(false)
    const timer = setTimeout(() => {
      setAnimateItems(true)
    }, 50)
    return () => clearTimeout(timer)
  }, [achievementFilter, categoryFilter, sortBy, searchQuery])

  // Live user data for sidebar
  const [meData, setMeData] = useState<{xp:number; level:number; nextLevelXp:number; levelFloorXp:number; name?:string} | null>(null)
  useEffect(() => {
    fetch("/api/me").then(r => r.ok ? r.json() : null).then(d => { if (d) setMeData(d) }).catch(() => {})
  }, [])

  // Calculate achievement statistics
  const totalAchievements = achievements.length
  const earnedAchievements = achievements.filter((a) => a.earned).length
  const inProgressAchievements = achievements.filter((a) => !a.earned && (a.progress ?? 0) > 0).length
  const lockedAchievements = achievements.filter((a) => !a.earned && (!a.progress || a.progress === 0)).length
  const totalXP = achievements.filter((a) => a.earned).reduce((sum, a) => sum + a.xp, 0)
  const possibleXP = achievements.reduce((sum, a) => sum + a.xp, 0)

  return (
    <div className="flex min-h-screen bg-[#FAF7FF]">
      {/* Left Sidebar - Removed to prevent double implementation */}
      
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#2D1B69] mb-2">Achievements</h1>
              <p className="text-[#7E7A93]">Track your progress and earn badges as you learn sign language</p>
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7E7A93] w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search achievements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white border border-[#EAE4FF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7D54FF] focus:border-transparent w-full md:w-64 text-sm"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 ${
                  showFilters ? "bg-[#7D54FF] text-white" : "bg-white text-[#7E7A93]"
                } rounded-lg hover:bg-opacity-90 flex items-center justify-center transition-colors`}
                aria-label="Toggle filters"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 bg-white rounded-xl p-5 shadow-sm border border-[#EAE4FF] animate-in fade-in duration-200">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[#2D1B69] mb-3">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setAchievementFilter("all")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        achievementFilter === "all"
                          ? "bg-[#7D54FF] text-white"
                          : "bg-[#FAF7FF] text-[#7E7A93] hover:bg-[#EAE4FF] hover:text-[#7D54FF]"
                      } transition-colors`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setAchievementFilter("earned")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        achievementFilter === "earned"
                          ? "bg-[#22C55E] text-white"
                          : "bg-[#FAF7FF] text-[#7E7A93] hover:bg-[#22C55E] hover:bg-opacity-20 hover:text-[#22C55E]"
                      } transition-colors`}
                    >
                      Earned
                    </button>
                    <button
                      onClick={() => setAchievementFilter("in-progress")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        achievementFilter === "in-progress"
                          ? "bg-[#FFC83D] text-white"
                          : "bg-[#FAF7FF] text-[#7E7A93] hover:bg-[#FFC83D] hover:bg-opacity-20 hover:text-[#FFC83D]"
                      } transition-colors`}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => setAchievementFilter("locked")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        achievementFilter === "locked"
                          ? "bg-[#7E7A93] text-white"
                          : "bg-[#FAF7FF] text-[#7E7A93] hover:bg-gray-200"
                      } transition-colors`}
                    >
                      Locked
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[#2D1B69] mb-3">Category</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setCategoryFilter(category.id)}
                        className={`px-3 py-1.5 rounded-md text-sm ${
                          categoryFilter === category.id
                            ? "bg-[#7D54FF] text-white"
                            : "bg-[#FAF7FF] text-[#7E7A93] hover:bg-[#EAE4FF] hover:text-[#7D54FF]"
                        } transition-colors`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[#2D1B69] mb-3">Sort By</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSortBy("recent")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        sortBy === "recent"
                          ? "bg-[#7D54FF] text-white"
                          : "bg-[#FAF7FF] text-[#7E7A93] hover:bg-[#EAE4FF] hover:text-[#7D54FF]"
                      } transition-colors`}
                    >
                      Most Recent
                    </button>
                    <button
                      onClick={() => setSortBy("xp-high")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        sortBy === "xp-high"
                          ? "bg-[#7D54FF] text-white"
                          : "bg-[#FAF7FF] text-[#7E7A93] hover:bg-[#EAE4FF] hover:text-[#7D54FF]"
                      } transition-colors`}
                    >
                      XP (High to Low)
                    </button>
                    <button
                      onClick={() => setSortBy("xp-low")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        sortBy === "xp-low"
                          ? "bg-[#7D54FF] text-white"
                          : "bg-[#FAF7FF] text-[#7E7A93] hover:bg-[#EAE4FF] hover:text-[#7D54FF]"
                      } transition-colors`}
                    >
                      XP (Low to High)
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

        {/* Achievement Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-[#EAE4FF] animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <SkeletonBox className="h-3 w-28" />
                    <SkeletonBox className="h-8 w-16" />
                  </div>
                  <SkeletonBox className="w-12 h-12 rounded-full flex-shrink-0" />
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-[#EAE4FF]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[#7E7A93] mb-1">Total Achievements</div>
                    <div className="text-2xl font-bold text-[#2D1B69]">{totalAchievements}</div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#EAE4FF] flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-6 h-6 text-[#7D54FF]" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-[#EAE4FF]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[#7E7A93] mb-1">Earned</div>
                    <div className="text-2xl font-bold text-[#2D1B69]">{earnedAchievements}</div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#22C55E] bg-opacity-20 flex items-center justify-center flex-shrink-0">
                    <BadgeCheck className="w-6 h-6 text-[#22C55E]" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-[#EAE4FF]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[#7E7A93] mb-1">In Progress</div>
                    <div className="text-2xl font-bold text-[#2D1B69]">{inProgressAchievements}</div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#FFC83D] bg-opacity-20 flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 text-[#FFC83D]" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-[#EAE4FF]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[#7E7A93] mb-1">Locked</div>
                    <div className="text-2xl font-bold text-[#2D1B69]">{lockedAchievements}</div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#FF7A59] bg-opacity-20 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-6 h-6 text-[#FF7A59]" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-[#EAE4FF] sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[#7E7A93] mb-1">Total XP Earned</div>
                    <div className="text-2xl font-bold text-[#2D1B69]">{totalXP}</div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#7D54FF] bg-opacity-20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-[#7D54FF]" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-[#7E7A93]">
                  {possibleXP > 0 ? Math.round((totalXP / possibleXP) * 100) : 0}% of possible XP
                </div>
              </div>
            </>
          )}
        </div>

        {/* XP Progress Bar */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-[#EAE4FF] mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-[#2D1B69]">Achievement Progress</h2>
            <div className="text-sm text-[#7E7A93]">
              {earnedAchievements}/{totalAchievements} Achievements Earned
            </div>
          </div>
          <div className="h-3 bg-[#FAF7FF] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#7D54FF] to-[#5EC8FF] rounded-full transition-all duration-1000"
              style={{ width: `${totalAchievements > 0 ? (earnedAchievements / totalAchievements) * 100 : 0}%` }}
            ></div>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#FAF7FF] p-3 rounded-lg">
              <div className="text-sm text-[#7E7A93]">Beginner</div>
              <div className="text-lg font-bold text-[#2D1B69]">
                {achievements.filter((a) => a.category === "beginner" && a.earned).length}/
                {achievements.filter((a) => a.category === "beginner").length}
              </div>
            </div>
            <div className="bg-[#FAF7FF] p-3 rounded-lg">
              <div className="text-sm text-[#7E7A93]">Intermediate</div>
              <div className="text-lg font-bold text-[#2D1B69]">
                {achievements.filter((a) => a.category === "intermediate" && a.earned).length}/
                {achievements.filter((a) => a.category === "intermediate").length}
              </div>
            </div>
            <div className="bg-[#FAF7FF] p-3 rounded-lg">
              <div className="text-sm text-[#7E7A93]">Advanced</div>
              <div className="text-lg font-bold text-[#2D1B69]">
                {achievements.filter((a) => a.category === "advanced" && a.earned).length}/
                {achievements.filter((a) => a.category === "advanced").length}
              </div>
            </div>
            <div className="bg-[#FAF7FF] p-3 rounded-lg">
              <div className="text-sm text-[#7E7A93]">Social</div>
              <div className="text-lg font-bold text-[#2D1B69]">
                {achievements.filter((a) => a.category === "social" && a.earned).length}/
                {achievements.filter((a) => a.category === "social").length}
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#2D1B69] mb-4">
            {isLoading ? (
              <SkeletonBox className="h-6 w-48 inline-block" />
            ) : (
              `${filteredAchievements.length} ${achievementFilter !== "all" ? achievementFilter : ""} Achievements`
            )}
          </h2>

          {/* Skeleton grid while loading */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <AchievementCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAchievements.map((achievement, index) => (
                <div
                  key={achievement.id}
                  className={`bg-white rounded-xl overflow-hidden shadow-sm border border-[#EAE4FF] hover:shadow-md transition-all duration-300 ${
                    animateItems ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div className={`bg-gradient-to-r ${achievement.color} h-2`}></div>
                  <div className="p-5">
                    <div className="flex items-start">
                      <div
                        className={`w-14 h-14 bg-gradient-to-b ${achievement.color} rounded-xl flex items-center justify-center text-2xl mr-4 shrink-0`}
                      >
                        <span className="text-white">{achievement.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-bold text-[#2D1B69] text-lg">{achievement.name}</h3>
                          {achievement.earned && <BadgeCheck className="w-5 h-5 text-[#22C55E]" />}
                        </div>
                        <p className="text-sm text-[#7E7A93] mt-1 line-clamp-2">{achievement.description}</p>

                        {achievement.earned ? (
                          <div className="flex items-center mt-3 text-xs text-[#7E7A93]">
                            <Calendar className="w-3.5 h-3.5 mr-1" />
                            Earned on {achievement.date}
                          </div>
                        ) : achievement.progress && achievement.progress > 0 ? (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-[#7E7A93] mb-1">
                              <span>Progress</span>
                              <span>{achievement.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-[#FAF7FF] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full bg-gradient-to-r ${achievement.color}`}
                                style={{ width: `${achievement.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center mt-3 text-xs text-[#7E7A93]">
                            <Lock className="w-3.5 h-3.5 mr-1" />
                            Complete the requirements to unlock
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <div className="text-xs font-medium bg-[#EAE4FF] text-[#7D54FF] px-2 py-1 rounded-full">
                        +{achievement.xp} XP
                      </div>
                      <button className="text-xs text-[#7E7A93] flex items-center hover:text-[#7D54FF] transition-colors">
                        Details <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* No achievements found */}
        {filteredAchievements.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-[#EAE4FF]">
            <div className="w-16 h-16 bg-[#FAF7FF] rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-[#7E7A93]" />
            </div>
            <h3 className="text-lg font-bold text-[#2D1B69] mb-2">No achievements found</h3>
            <p className="text-[#7E7A93] mb-4">No achievements match your current filter criteria.</p>
            <button
              onClick={() => {
                setAchievementFilter("all")
                setCategoryFilter("all")
                setSearchQuery("")
              }}
              className="px-4 py-2 bg-[#7D54FF] text-white rounded-full shadow-btn transition-transform hover:scale-[1.03] active:translate-y-1 active:shadow-none hover:bg-[#6840E0] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="w-[300px] bg-white p-6 hidden lg:block sticky top-0 h-screen overflow-y-auto">
        <h2 className="text-xl font-bold text-[#2D1B69] mb-6">Your Profile</h2>

        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#FFC83D] bg-[#EAE4FF] flex items-center justify-center">
              <span className="text-3xl">👤</span>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#FFC83D] rounded-full w-8 h-8 flex items-center justify-center">
              <span className="text-white font-bold text-xs">{meData?.level ?? 1}</span>
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-[#2D1B69] mb-1">{meData?.name ?? "Loading…"}</h3>
          <p className="text-sm text-[#7E7A93]">Level {meData?.level ?? "—"} • {meData ? (meData.xp).toLocaleString() : "—"} XP</p>
        </div>

        {/* XP Progress */}
        {meData && (
          <div className="mb-6">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[#7E7A93]">Next Level</span>
              <span className="text-[#7D54FF] font-medium">
                {meData.nextLevelXp - meData.levelFloorXp > 0
                  ? `${Math.round(((meData.xp - meData.levelFloorXp) / (meData.nextLevelXp - meData.levelFloorXp)) * 100)}%`
                  : "100%"}
              </span>
            </div>
            <div className="h-2 bg-[#FAF7FF] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#7D54FF] rounded-full"
                style={{
                  width: `${meData.nextLevelXp - meData.levelFloorXp > 0
                    ? Math.round(((meData.xp - meData.levelFloorXp) / (meData.nextLevelXp - meData.levelFloorXp)) * 100)
                    : 100}%`
                }}
              />
            </div>
            <div className="flex justify-between text-xs mt-2">
              <span className="text-[#7E7A93]">{meData.xp.toLocaleString()} XP</span>
              <span className="text-[#7E7A93]">{meData.nextLevelXp.toLocaleString()} XP</span>
            </div>
          </div>
        )}

        {/* Recent Achievements */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#2D1B69]">Recent Badges</h3>
            <Link href="/dashboard/profile" className="text-[#7D54FF] text-sm flex items-center hover:underline">
              Profile <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {achievements.filter((a) => a.earned).length === 0 ? (
            <div className="bg-[#FAF7FF] rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">🏆</div>
              <p className="text-xs text-[#7E7A93]">Complete activities to earn your first badge!</p>
              <Link href="/dashboard/lessons" className="text-xs text-[#7D54FF] mt-2 inline-block hover:underline">
                Start a lesson →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {achievements.filter((a) => a.earned).slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="flex items-center group hover:bg-[#FAF7FF] p-2 rounded-lg transition-colors">
                  <div className={`w-10 h-10 bg-gradient-to-b ${achievement.color} rounded-lg flex items-center justify-center text-base mr-3 shrink-0`}>
                    <span className="text-white">{achievement.icon}</span>
                  </div>
                  <div>
                    <div className="font-medium text-[#2D1B69] text-sm group-hover:text-[#7D54FF] transition-colors">{achievement.name}</div>
                    <div className="text-xs text-[#7E7A93]">+{achievement.xp} XP</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link
              href="/dashboard/challenges"
              className="flex items-center justify-center w-full p-3 text-[#7D54FF] border border-[#EAE4FF] bg-[#FAF7FF] rounded-lg hover:bg-[#EAE4FF] transition-colors"
            >
              <ArrowUpRight className="w-4 h-4 mr-2" />
              View Challenges
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
