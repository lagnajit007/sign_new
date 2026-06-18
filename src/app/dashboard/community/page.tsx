"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Users, Activity, Trophy, Medal, TrendingUp,
  Calendar, CheckCircle, XCircle, ChevronRight,
} from "lucide-react"
import Button from "@/components/Button"
import ErrorState from "@/components/ErrorState"
import KpiCard from "@/components/KpiCard"

interface FeedItem {
  id: string
  userId: string
  signLabel: string
  lessonType: string
  correct: boolean
  confidence: number
  createdAt: string
  user: {
    name: string
    username: string | null
    avatarId: number
    xp: number
    level: number
  }
}

interface LeaderboardEntry {
  rank: number
  id: string
  name: string
  points: number
  level: number
  avatar: string
  isCurrentUser: boolean
}

type Tab = "feed" | "leaderboard"

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<Tab>("feed")
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCommunity = useCallback(() => {
    setError(null)
    setLoading(true)
    Promise.all([
      fetch("/api/community/feed?limit=20").then((r) => r.ok ? r.json() : null),
      fetch("/api/leaderboard?scope=global").then((r) => r.ok ? r.json() : null),
    ])
      .then(([feedData, lbData]) => {
        if (feedData?.feed) setFeed(feedData.feed)
        if (lbData?.entries) setLeaderboard(lbData.entries)
      })
      .catch(() => setError("Failed to load community data. Please try again."))
      .finally(() => setLoading(false))
  }, [])

  useEffect(fetchCommunity, [fetchCommunity])

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const tabs = [
    { id: "feed" as Tab, label: "Activity Feed", icon: Activity },
    { id: "leaderboard" as Tab, label: "Leaderboard", icon: Trophy },
  ]

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#ECE8FF] p-6 shadow-[0_8px_24px_rgba(125,84,255,0.06)]">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#EAE4FF] flex items-center justify-center flex-shrink-0">
            <Users className="w-7 h-7 text-[#7D54FF]" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-[#2D1B69]">Community</h1>
            <p className="text-sm text-[#7E7A93]">See what others are learning and track the top signers</p>
          </div>
          <Button variant="outline" size="sm" href="/dashboard/settings">
            Privacy Settings
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#FAF7FF] p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.id ? "bg-white text-[#7D54FF] shadow-sm" : "text-[#7E7A93] hover:text-[#7D54FF]"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <ErrorState title="Failed to Load" message={error} onRetry={fetchCommunity} />
      )}

      {/* Tab Content */}
      {!error && loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-48" />
                  <div className="h-2 bg-gray-200 rounded w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === "feed" ? (
        <ActivityFeed feed={feed} timeAgo={timeAgo} />
      ) : (
        <LeaderboardView entries={leaderboard} />
      )}
    </div>
  )
}

function ActivityFeed({ feed, timeAgo }: { feed: FeedItem[]; timeAgo: (d: string) => string }) {
  if (feed.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#ECE8FF] p-12 text-center">
        <Activity className="w-12 h-12 mx-auto mb-3 text-[#7E7A93] opacity-40" />
        <h2 className="text-lg font-bold text-[#2D1B69] mb-1">No activity yet</h2>
        <p className="text-sm text-[#7E7A93] mb-4">
          Activity from the community will appear here once learners start practicing.
        </p>
        <Button variant="primary" size="sm" href="/dashboard/lessons/interactive">
          Start Practicing
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#2D1B69]">Recent Activity</h2>
        <span className="text-xs text-[#7E7A93]">{feed.length} activities</span>
      </div>
      {feed.map((item) => (
        <div key={item.id} className="bg-white rounded-xl border border-[#ECE8FF] p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-start gap-3">
            <Link href="/dashboard/profile" className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-[#EAE4FF]">
                <Image
                  src="/Avatar.png"
                  alt={item.user.name}
                  width={40} height={40}
                  className="object-cover"
                />
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href="/dashboard/profile" className="font-medium text-sm text-[#2D1B69] hover:text-[#7D54FF] transition-colors">
                  {item.user.name}
                </Link>
                <span className="text-xs text-[#7E7A93]">Lvl {item.user.level}</span>
                <div className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  item.correct ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                }`}>
                  {item.correct ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {item.correct ? "Correct" : "Incorrect"}
                </div>
              </div>
              <p className="text-sm text-[#7E7A93] mt-0.5">
                Signed <span className="font-medium text-[#2D1B69]">"{item.signLabel}"</span>
                {item.correct ? "" : ` (${item.confidence}% confidence)`}
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-[#7E7A93]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {timeAgo(item.createdAt)}
                </span>
                <span className="capitalize">{item.lessonType}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function LeaderboardView({ entries }: { entries: LeaderboardEntry[] }) {
  const rankColors = ["text-yellow-500", "text-gray-400", "text-orange-500"]

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#ECE8FF] p-12 text-center">
        <Medal className="w-12 h-12 mx-auto mb-3 text-[#7E7A93] opacity-40" />
        <h2 className="text-lg font-bold text-[#2D1B69] mb-1">No leaderboard yet</h2>
        <p className="text-sm text-[#7E7A93] mb-4">Be the first to earn XP and top the charts!</p>
        <Button variant="primary" size="sm" href="/dashboard/lessons/interactive">
          Start Learning
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#2D1B69]">Top Learners</h2>
        <span className="text-xs text-[#7E7A93]">By total XP</span>
      </div>

      <div className="bg-white rounded-2xl border border-[#ECE8FF] divide-y divide-[#ECE8FF]">
        {entries.map((entry, i) => (
          <div
            key={entry.id}
            className={`flex items-center gap-4 p-4 ${
              entry.isCurrentUser ? "bg-[#FAF7FF]" : ""
            }`}
          >
            {/* Rank */}
            <div className="w-8 text-center flex-shrink-0">
              {i < 3 ? (
                <Trophy className={`w-5 h-5 mx-auto ${rankColors[i]}`} />
              ) : (
                <span className="text-sm font-bold text-[#7E7A93]">{entry.rank}</span>
              )}
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#EAE4FF] flex-shrink-0">
              <Image
                src="/Avatar.png"
                alt={entry.name}
                width={40} height={40}
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-[#2D1B69] truncate">
                  {entry.name}
                </span>
                {entry.isCurrentUser && (
                  <span className="text-[10px] font-medium text-[#7D54FF] bg-[#EAE4FF] px-2 py-0.5 rounded-full">
                    You
                  </span>
                )}
              </div>
              <span className="text-xs text-[#7E7A93]">Level {entry.level}</span>
            </div>

            {/* XP */}
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-bold text-[#2D1B69]">{entry.points.toLocaleString()}</div>
              <div className="text-xs text-[#7E7A93]">XP</div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Button variant="ghost" size="sm" icon={TrendingUp} iconPosition="right" href="/dashboard/progress">
          View Your Progress
        </Button>
      </div>
    </div>
  )
}
