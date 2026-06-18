"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BookOpen, Trophy, Search, ChevronRight, CheckCircle, RotateCcw } from "lucide-react"
import Button from "@/components/Button"
import KpiCard from "@/components/KpiCard"

interface CompletionItem {
  id: number
  name: string
  total: number
  completed: number
  color: string
}

const CATEGORIES = ["All Lessons", "Alphabets", "Numbers", "Interactive"]

export default function LessonsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All Lessons")
  const [completionData, setCompletionData] = useState<CompletionItem[]>([
    { id: 1, name: "Alphabets", total: 26, completed: 0, color: "bg-[#7D54FF]" },
    { id: 2, name: "Numbers",   total: 10, completed: 0, color: "bg-[#5EC8FF]" },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.completionData) setCompletionData(d.completionData)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const alphabets = completionData.find((c) => c.name === "Alphabets")
  const numbers   = completionData.find((c) => c.name === "Numbers")
  const alphabetPct = alphabets ? Math.round((alphabets.completed / alphabets.total) * 100) : 0
  const numberPct   = numbers   ? Math.round((numbers.completed   / numbers.total)   * 100) : 0

  const popularLessons = [
    { href: "/dashboard/lessons/alphabets/a", icon: "A", bg: "bg-[#ffe9ac]", color: "text-[#ff2600]", name: "Letter A", meta: "Beginner • 2 min" },
    { href: "/dashboard/lessons/interactive", icon: "1", bg: "bg-[#EAE4FF]",  color: "text-[#5EC8FF]", name: "Number 1", meta: "Beginner • 2 min" },
    { href: "/dashboard/lessons/interactive", icon: "Hi", bg: "bg-[#EAE4FF]", color: "text-[#6840E0]", name: "Hello",    meta: "Beginner • 3 min" },
    { href: "/dashboard/lessons/interactive", icon: "Ty", bg: "bg-[#ccf5d1]", color: "text-[#22C55E]", name: "Thank You",meta: "Beginner • 3 min" },
  ]

  const allPaths = [
    {
      href: "/dashboard/lessons/alphabets/a",
      title: "Alphabets (A-Z)",
      desc: "Learn to sign all 26 letters of the alphabet.",
      tag: "26 Lessons", tagColor: "bg-[#EAE4FF] text-[#7D54FF]",
      pct: alphabetPct, barColor: "bg-[#7D54FF]",
    },
    {
      href: "/dashboard/lessons/interactive",
      title: "Numbers (0-9)",
      desc: "Learn to sign numbers from 0 to 9.",
      tag: "10 Lessons", tagColor: "bg-[#EAE4FF] text-[#5EC8FF]",
      pct: numberPct, barColor: "bg-[#5EC8FF]",
    },
    {
      href: "/dashboard/lessons/interactive",
      title: "Interactive Practice",
      desc: "Live AI camera-based sign recognition — try any sign you've learned.",
      tag: "Anytime", tagColor: "bg-[#ccf5d1] text-[#22C55E]",
      pct: null, barColor: "",
    },
  ]

  const filteredPaths = allPaths.filter((p) => {
    const matchesCategory =
      activeCategory === "All Lessons" ||
      p.title.toLowerCase().includes(activeCategory.toLowerCase())
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const filteredPopular = popularLessons.filter((l) => {
    const matchesSearch =
      !searchQuery || l.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      activeCategory === "All Lessons" ||
      (activeCategory === "Alphabets" && l.name.startsWith("Letter")) ||
      (activeCategory === "Numbers"   && l.name.startsWith("Number")) ||
      (activeCategory === "Interactive")
    return matchesSearch && matchesCategory
  })

  const lessonsCompleted = (alphabets?.completed ?? 0) + (numbers?.completed ?? 0)
  const totalLessons     = (alphabets?.total   ?? 0) + (numbers?.total   ?? 0)

  return (
    <div className="flex min-h-screen bg-[#FAF7FF]">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#2D1B69]">Lessons</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7E7A93] w-5 h-5" />
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-[#EAE4FF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7D54FF] focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Category filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-[#EAE4FF] text-[#7D54FF]"
                  : "bg-white border border-[#EAE4FF] text-[#7E7A93] hover:border-[#7D54FF] hover:text-[#7D54FF]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Today's Lesson CTA */}
        <div className="bg-gradient-to-r from-[#7D54FF] to-[#6840E0] rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <div className="text-white text-sm font-medium mb-2">TODAY'S LESSON</div>
              <h2 className="text-white text-2xl font-bold mb-1">Practice Live with AI</h2>
              <p className="text-white/80 text-sm">Show a sign on camera and get instant feedback.</p>
            </div>
            <Button variant="secondary" size="lg" href="/dashboard/lessons/interactive" icon={ChevronRight} iconPosition="right">
              Start Now
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Popular Lessons */}
          {filteredPopular.length > 0 && (
            <div className="bg-white p-4 rounded-xl">
              <h2 className="text-lg font-bold text-[#2D1B69] mb-4">Popular Lessons</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredPopular.map((lesson) => (
                  <Link
                    key={lesson.name}
                    href={lesson.href}
                    className="flex items-center p-3 border border-[#EAE4FF] rounded-lg hover:border-[#7D54FF] hover:bg-[#FAF7FF] transition-colors group"
                  >
                    <div className={`${lesson.bg} w-12 h-12 rounded-lg flex items-center justify-center mr-3 flex-shrink-0`}>
                      <span className={`${lesson.color} text-xl font-bold`}>{lesson.icon}</span>
                    </div>
                    <div>
                      <div className="font-medium text-[#2D1B69] group-hover:text-[#7D54FF] transition-colors">{lesson.name}</div>
                      <div className="text-xs text-[#7E7A93]">{lesson.meta}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#7E7A93] ml-auto" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Learning Paths */}
          <div className="bg-white p-4 rounded-xl">
            <h2 className="text-lg font-bold text-[#2D1B69] mb-4">Learning Paths</h2>

            {filteredPaths.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-[#7E7A93] mb-3">No lessons match your search.</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => { setSearchQuery(""); setActiveCategory("All Lessons") }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPaths.map((path) => (
                  <Link
                    key={path.title}
                    href={path.href}
                    className="block p-4 border border-[#EAE4FF] rounded-lg hover:border-[#7D54FF] hover:bg-[#FAF7FF] transition-colors group"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold text-[#2D1B69] group-hover:text-[#7D54FF] transition-colors">{path.title}</div>
                      <div className={`text-xs ${path.tagColor} px-2 py-1 rounded-full`}>{path.tag}</div>
                    </div>
                    <p className="text-sm text-[#7E7A93] mb-3">{path.desc}</p>
                    {path.pct !== null ? (
                      <>
                        <div className="w-full bg-[#FAF7FF] h-2 rounded-full overflow-hidden">
                          <div className={`${path.barColor} h-full rounded-full transition-all`} style={{ width: `${path.pct}%` }} />
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="text-xs text-[#7E7A93]">
                            {loading ? "Loading…" : `${path.pct}% complete`}
                          </div>
                          <div className="text-xs font-medium text-[#7D54FF]">{path.pct}%</div>
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-[#7E7A93] flex items-center gap-1">
                        <span className="w-2 h-2 bg-[#22C55E] rounded-full inline-block" />
                        Available anytime
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-[300px] bg-white p-6 hidden lg:block sticky top-0 h-screen overflow-y-auto">
        <h2 className="text-xl font-bold text-[#2D1B69] mb-6">Your Progress</h2>

        {/* Progress Circle */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <svg className="w-36 h-36" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#EAE4FF" strokeWidth="10" />
              <circle
                cx="50" cy="50" r="45"
                fill="none" stroke="#7D54FF" strokeWidth="10"
                strokeDasharray="283"
                strokeDashoffset={totalLessons > 0 ? Math.round(283 - (lessonsCompleted / totalLessons) * 283) : 283}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
              <text x="50" y="50" textAnchor="middle" fill="#7D54FF" fontSize="16" fontWeight="bold" dominantBaseline="middle">
                {totalLessons > 0 ? `${Math.round((lessonsCompleted / totalLessons) * 100)}%` : "0%"}
              </text>
            </svg>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <KpiCard icon={CheckCircle} label="Completed" value={loading ? "—" : lessonsCompleted} color="green" subtitle="Lessons" loading={loading} />
          <KpiCard icon={RotateCcw} label="Remaining" value={loading ? "—" : totalLessons - lessonsCompleted} color="purple" subtitle="Lessons" loading={loading} />
          <div className="bg-[#FAF7FF] p-3 rounded-lg col-span-2">
            <div className="text-sm text-[#7E7A93] mb-2">By Category</div>
            {completionData.map((c) => (
              <div key={c.id} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#2D1B69]">{c.name}</span>
                  <span className="text-[#7D54FF]">{c.completed}/{c.total}</span>
                </div>
                <div className="h-1.5 bg-white rounded-full overflow-hidden">
                  <div
                    className={`${c.color} h-full rounded-full`}
                    style={{ width: `${Math.round((c.completed / c.total) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="text-lg font-bold text-[#2D1B69] mb-4">Jump In</h3>
          <div className="space-y-3">
            <Link
              href="/dashboard/lessons/interactive"
              className="flex items-center gap-3 p-3 bg-[#FAF7FF] rounded-lg hover:bg-[#EAE4FF] transition-colors group"
            >
              <div className="bg-[#EAE4FF] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-[#7D54FF]" />
              </div>
              <span className="text-sm text-[#2D1B69] group-hover:text-[#7D54FF] transition-colors">Interactive Practice</span>
              <ChevronRight className="w-4 h-4 text-[#7E7A93] ml-auto" />
            </Link>
            <Link
              href="/dashboard/achievements"
              className="flex items-center gap-3 p-3 bg-[#FAF7FF] rounded-lg hover:bg-[#EAE4FF] transition-colors group"
            >
              <div className="bg-[#EAE4FF] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                <Trophy className="w-4 h-4 text-[#7D54FF]" />
              </div>
              <span className="text-sm text-[#2D1B69] group-hover:text-[#7D54FF] transition-colors">View Achievements</span>
              <ChevronRight className="w-4 h-4 text-[#7E7A93] ml-auto" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
