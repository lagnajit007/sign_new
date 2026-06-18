"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
  Award,
  BookOpen,
  BarChart2,
  Download,
} from "lucide-react"
import { StatCardSkeleton, ChartSkeleton } from "@/components/skeletons/SkeletonCard"

const ProgressBar = ({ value, max, color }: { value: number; max: number; color: string }) => {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="h-2 bg-[#FAF7FF] rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  )
}

interface ActivityRow {
  id: string
  name: string
  category: string
  confidence: number
  createdAt: string
}

interface CompletionItem {
  id: number
  name: string
  total: number
  completed: number
  color: string
}

interface Summary {
  xp: number
  lessonsCompleted: number
  accuracy: number
  streakDays: number
}

export default function ProgressPage() {
  const [timeRange, setTimeRange] = useState("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedCategory, setSelectedCategory] = useState("all")

  const [activityData, setActivityData] = useState([
    { day: "Sun", value: 0 },
    { day: "Mon", value: 0 },
    { day: "Tue", value: 0 },
    { day: "Wed", value: 0 },
    { day: "Thu", value: 0 },
    { day: "Fri", value: 0 },
    { day: "Sat", value: 0 },
  ])
  const [completionData, setCompletionData] = useState<CompletionItem[]>([
    { id: 1, name: "Alphabets", total: 26, completed: 0, color: "bg-[#7D54FF]" },
    { id: 2, name: "Numbers",   total: 10, completed: 0, color: "bg-[#5EC8FF]" },
  ])
  const [summary, setSummary]               = useState<Summary | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityRow[]>([])
  const [loading, setLoading]               = useState(true)

  useEffect(() => {
    let active = true
    fetch("/api/progress")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!active || !d) return
        if (d.activityData)  setActivityData(d.activityData)
        if (d.completionData) setCompletionData(d.completionData)
        if (d.summary)        setSummary(d.summary)
        if (d.recentActivity) setRecentActivity(d.recentActivity)
      })
      .catch((err) => console.error("Progress: fetch /api/progress failed", err))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  // Derived totals for right sidebar
  const totalSigns     = completionData.reduce((s, c) => s + c.total, 0)
  const completedSigns = completionData.reduce((s, c) => s + c.completed, 0)
  const overallPct     = totalSigns > 0 ? Math.round((completedSigns / totalSigns) * 100) : 0
  const dashOffset     = Math.round(283 - (overallPct / 100) * 283)

  // Stats cards
  const statCards = [
    { label: "Total XP",           value: loading ? "—" : (summary?.xp ?? 0).toLocaleString(),            color: "text-[#7D54FF]", bg: "bg-[#EAE4FF]", icon: Award },
    { label: "Lessons Completed",  value: loading ? "—" : String(summary?.lessonsCompleted ?? 0),           color: "text-[#22C55E]", bg: "bg-[#d4f8dc]", icon: BookOpen },
    { label: "Accuracy",           value: loading ? "—" : `${summary?.accuracy ?? 0}%`,                    color: "text-[#FF7A59]", bg: "bg-[#ffe9e2]", icon: BarChart2 },
    { label: "Streak",             value: loading ? "—" : `${summary?.streakDays ?? 0} day${(summary?.streakDays ?? 0) !== 1 ? "s" : ""}`, color: "text-[#FFC83D]", bg: "bg-[#fff8da]", icon: Clock },
  ]

  // Date navigation
  const getDateRangeText = () => {
    const today = new Date(currentDate)
    if (timeRange === "week") {
      const start = new Date(today); start.setDate(today.getDate() - today.getDay())
      const end   = new Date(start);  end.setDate(start.getDate() + 6)
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    }
    if (timeRange === "month") return today.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    return String(today.getFullYear())
  }

  const navigateDate = (dir: number) => {
    const d = new Date(currentDate)
    if (timeRange === "week")  d.setDate(d.getDate() + dir * 7)
    if (timeRange === "month") d.setMonth(d.getMonth() + dir)
    if (timeRange === "year")  d.setFullYear(d.getFullYear() + dir)
    setCurrentDate(d)
  }

  // Activity filter: map category strings from API to select options
  const filteredActivity = selectedCategory === "all"
    ? recentActivity
    : recentActivity.filter((a) => a.category === selectedCategory)

  // Chart scaling: max value on y-axis
  const maxActivity = Math.max(...activityData.map((d) => d.value), 10)
  const toY = (v: number) => 200 - Math.round((v / maxActivity) * 180) // 180px usable height

  return (
    <div className="flex min-h-screen bg-[#FAF7FF]">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#2D1B69] mb-1">Your Progress</h1>
            <p className="text-[#7E7A93]">Track your learning journey and achievements</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <div className="bg-white rounded-lg p-1 flex">
              {["week", "month", "year"].map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1.5 rounded-md text-sm capitalize transition-colors ${
                    timeRange === r ? "bg-[#7D54FF] text-white" : "text-[#7E7A93] hover:bg-gray-100"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <button
              title="Export not yet available"
              className="p-2 bg-white rounded-lg hover:bg-gray-100 flex items-center justify-center opacity-50 cursor-not-allowed"
              disabled
            >
              <Download className="w-5 h-5 text-[#7E7A93]" />
            </button>
          </div>
        </div>

        {/* Date navigation */}
        <div className="bg-white rounded-xl p-4 mb-6 flex items-center justify-between">
          <button onClick={() => navigateDate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Previous date range">
            <ChevronLeft className="w-5 h-5 text-[#7E7A93]" />
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#7D54FF]" />
            <span className="font-medium text-[#2D1B69]">{getDateRangeText()}</span>
          </div>
          <button onClick={() => navigateDate(1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Next date range">
            <ChevronRight className="w-5 h-5 text-[#7E7A93]" />
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((s, i) => (
            <div key={i} className="bg-white p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-[#7E7A93]">{s.label}</div>
                <div className={`w-8 h-8 rounded-full ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
              <div className={`text-2xl font-bold ${loading ? "text-[#7E7A93]" : "text-[#2D1B69]"}`}>{s.value}</div>
              {loading && <div className="mt-2 h-1.5 bg-[#FAF7FF] rounded-full w-16 animate-pulse" />}
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Activity Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#2D1B69]">Weekly Activity</h2>
              <div className="flex items-center gap-4 text-xs text-[#7E7A93]">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#7D54FF] inline-block" />Attempts</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#FFC83D] inline-block" />Target (50)</span>
              </div>
            </div>

            {/* Bar chart — simpler and more reliable than SVG cubic curves */}
            <div className="w-full h-48 flex items-end gap-2 px-2">
              {activityData.map((d, i) => {
                const pct = maxActivity > 0 ? Math.min(100, Math.round((d.value / maxActivity) * 100)) : 0
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-[#7E7A93]">{d.value || ""}</span>
                    <div className="w-full bg-[#FAF7FF] rounded-t-lg overflow-hidden" style={{ height: "140px" }}>
                      <div
                        className="w-full bg-[#7D54FF] rounded-t-lg transition-all duration-500"
                        style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#7E7A93]">{d.day}</span>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
              <div>
                <span className="text-[#7E7A93]">Daily Avg: </span>
                <span className="font-medium text-[#2D1B69]">
                  {Math.round(activityData.reduce((a, c) => a + c.value, 0) / activityData.length)}
                </span>
              </div>
              <div>
                <span className="text-[#7E7A93]">Best Day: </span>
                <span className="font-medium text-[#22C55E]">
                  {Math.max(...activityData.map((d) => d.value))} attempts
                </span>
              </div>
            </div>
          </div>

          {/* Completion */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-lg font-bold text-[#2D1B69] mb-6">Completion Progress</h2>
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div key={n} className="animate-pulse">
                    <div className="h-3 bg-[#FAF7FF] rounded w-full mb-2" />
                    <div className="h-2 bg-[#FAF7FF] rounded w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {completionData.map((c) => (
                  <div key={c.id}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-[#2D1B69]">{c.name}</span>
                      <span className="text-sm text-[#7E7A93]">
                        {c.completed}/{c.total} ({c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0}%)
                      </span>
                    </div>
                    <ProgressBar value={c.completed} max={c.total} color={c.color} />
                  </div>
                ))}

                {/* Empty state */}
                {completedSigns === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-[#7E7A93] mb-3">No lessons completed yet.</p>
                    <Link href="/dashboard/lessons/interactive" className="text-sm text-[#7D54FF] hover:underline">
                      Start practicing →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#2D1B69] mb-2 sm:mb-0">Recent Activity</h2>
            <select
              className="bg-[#FAF7FF] border-0 rounded-lg px-3 py-2 text-sm text-[#7E7A93] focus:ring-2 focus:ring-[#7D54FF]"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Activities</option>
              <option value="alphabets">Alphabets</option>
              <option value="numbers">Numbers</option>
            </select>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-[#FAF7FF] flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 bg-[#FAF7FF] rounded w-48 mb-1" />
                    <div className="h-2 bg-[#FAF7FF] rounded w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredActivity.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#FAF7FF] rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-[#7E7A93]" />
              </div>
              <h3 className="font-bold text-[#2D1B69] mb-1">No activity yet</h3>
              <p className="text-sm text-[#7E7A93] mb-4">
                {selectedCategory === "all"
                  ? "Sign a few letters to see your history here."
                  : `No ${selectedCategory} activity recorded yet.`}
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                {selectedCategory !== "all" && (
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="px-4 py-2 border border-[#EAE4FF] text-[#7E7A93] rounded-lg text-sm hover:bg-gray-50"
                  >
                    Show All
                  </button>
                )}
                <Link
                  href="/dashboard/lessons/interactive"
                  className="px-4 py-2 bg-[#7D54FF] text-white rounded-full shadow-btn transition-transform hover:scale-[1.03] active:translate-y-1 active:shadow-none text-sm hover:bg-[#6840E0]"
                >
                  Start Practicing
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivity.map((activity) => {
                const isCorrect = activity.confidence > 0.7
                return (
                  <div key={activity.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.category === "alphabets" ? "bg-[#EAE4FF]" : "bg-[#EAE4FF]"
                    }`}>
                      <BookOpen className={`w-5 h-5 ${activity.category === "alphabets" ? "text-[#7D54FF]" : "text-[#5EC8FF]"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[#2D1B69] truncate">{activity.name}</div>
                      <div className="text-xs text-[#7E7A93]">
                        {new Date(activity.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        {" · "}
                        <span className={isCorrect ? "text-[#22C55E]" : "text-[#FF7A59]"}>
                          {Math.round(activity.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                      isCorrect ? "bg-[#d4f8dc] text-[#22C55E]" : "bg-[#ffe9e2] text-[#FF7A59]"
                    }`}>
                      {isCorrect ? "✓ Correct" : "✗ Practice"}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar — clean card, no hexagon clip */}
      <div className="w-[300px] hidden lg:block sticky top-0 h-screen overflow-y-auto bg-white border-l border-gray-100 p-6">
        <h2 className="text-xl font-bold text-[#2D1B69] mb-6">Learning Summary</h2>

        {/* Progress Circle */}
        <div className="flex justify-center mb-6">
          <svg className="w-36 h-36" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#EAE4FF" strokeWidth="10" />
            <circle
              cx="50" cy="50" r="45"
              fill="none" stroke="#7D54FF" strokeWidth="10"
              strokeDasharray="283"
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
            <text x="50" y="50" textAnchor="middle" fill="#7D54FF" fontSize="16" fontWeight="bold" dominantBaseline="middle">
              {overallPct}%
            </text>
          </svg>
        </div>

        {/* Live stats */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-[#2D1B69]">Signs Learned</span>
            <span>
              <span className="font-bold text-[#7D54FF]">{completedSigns}</span>
              <span className="text-[#7E7A93]">/{totalSigns}</span>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-[#2D1B69]">Streak</span>
            <span className="font-bold text-[#FFC83D] flex items-center gap-1">
              {loading ? "—" : `${summary?.streakDays ?? 0} days`} 🔥
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-[#2D1B69]">Accuracy</span>
            <span className="font-bold text-[#FF7A59]">{loading ? "—" : `${summary?.accuracy ?? 0}%`}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-[#2D1B69]">Total XP</span>
            <span className="font-bold text-[#7D54FF]">{loading ? "—" : (summary?.xp ?? 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h3 className="text-lg font-bold text-[#2D1B69] mb-4">Recommendations</h3>
          <div className="space-y-3">
            <div className="bg-[#FAF7FF] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-[#7D54FF]" />
                <span className="font-medium text-[#2D1B69] text-sm">Keep practicing</span>
              </div>
              <p className="text-xs text-[#7E7A93] mb-2">
                Use the interactive mode daily to build recognition speed.
              </p>
              <Link href="/dashboard/lessons/interactive" className="text-xs text-[#7D54FF] flex items-center hover:underline">
                Practice Now <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
            <div className="bg-[#FAF7FF] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-[#22C55E]" />
                <span className="font-medium text-[#2D1B69] text-sm">Complete Challenges</span>
              </div>
              <p className="text-xs text-[#7E7A93] mb-2">
                Challenges earn bonus XP and help solidify your skills.
              </p>
              <Link href="/dashboard/challenges" className="text-xs text-[#7D54FF] flex items-center hover:underline">
                View Challenges <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
