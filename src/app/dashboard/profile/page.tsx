"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import {
  User, Mail, Calendar, Clock, Award, Settings as SettingsIcon,
  BarChart3, LogOut, Camera, BadgeCheck, ShieldCheck,
  ChevronRight, ChevronLeft, Star, Trophy, Target, Zap,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import KpiCard from "@/components/KpiCard"
import Button from "@/components/Button"
import EditProfileModal from "@/components/EditProfileModal"
import ErrorState from "@/components/ErrorState"
import Head from "next/head"

interface MeData {
  id: string
  name: string | null
  username: string | null
  email: string | null
  bio: string | null
  learningGoal: string | null
  preferredLang: string | null
  timezone: string | null
  avatarId: number
  xp: number
  level: number
  levelFloorXp: number
  nextLevelXp: number
  streakDays: number
  createdAt: string
  stats: {
    lessonsCompleted: number
    alphabetCompleted: number
    numberCompleted: number
    totalAttempts: number
    correctAttempts: number
    accuracy: number
    challengesCompleted: number
  }
}

interface Achievement {
  id: string
  name: string
  icon: string
  color: string
  earned: boolean
  unlockedAt: string | null
  progress: number
  xp: number
}

interface ProgressData {
  recentActivity: { signLabel: string; correct: boolean; createdAt: string }[]
  summary: { xp: number; lessonsCompleted: number; accuracy: number; streakDays: number }
}

const avatars = [
  { id: 1, name: "Default", image: "/Avatar.png", unlockCriteria: "Default avatar", requiredLessons: 0, requiredLevel: 1 },
  { id: 2, name: "Beginner", image: "/Avatar_b.png", unlockCriteria: "Complete 5 lessons", requiredLessons: 5, requiredLevel: 1 },
  { id: 3, name: "Enthusiast", image: "/Avatar_b.png", unlockCriteria: "Reach Level 5", requiredLessons: 0, requiredLevel: 5 },
  { id: 4, name: "Explorer", image: "/Avatar_b.png", unlockCriteria: "Complete 20 lessons", requiredLessons: 20, requiredLevel: 8 },
  { id: 5, name: "Champion", image: "/Avatar_b.png", unlockCriteria: "Earn 10 badges", requiredLessons: 0, requiredLevel: 10 },
  { id: 6, name: "Master", image: "/Avatar_b.png", unlockCriteria: "Maintain a 30-day streak", requiredLessons: 0, requiredLevel: 15 },
  { id: 7, name: "Legend", image: "/Avatar_b.png", unlockCriteria: "Complete all lessons", requiredLessons: 36, requiredLevel: 20 },
  { id: 8, name: "Guru", image: "/Avatar_b.png", unlockCriteria: "Achieve 95% accuracy", requiredLessons: 0, requiredLevel: 25 },
]

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedAvatarId, setSelectedAvatarId] = useState(1)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [avatarPage, setAvatarPage] = useState(0)

  const [meData, setMeData] = useState<MeData | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const avatarsPerPage = 4

  const fetchProfile = useCallback(() => {
    setError(null)
    setLoading(true)
    Promise.all([
      fetch("/api/me").then(async (r) => (r.ok ? r.json() : null)),
      fetch("/api/achievements").then(async (r) => (r.ok ? r.json() : null)),
      fetch("/api/progress").then(async (r) => (r.ok ? r.json() : null)),
    ]).then(([me, ach, prog]) => {
      setMeData(me)
      setAchievements(ach?.achievements || [])
      setProgressData(prog)
      setSelectedAvatarId(me?.avatarId || 1)
    }).catch(() => setError("Failed to load profile. Please try again.")).finally(() => setLoading(false))
  }, [])

  useEffect(fetchProfile, [fetchProfile])

  const earnedAchievements = achievements.filter((a) => a.earned)
  const inProgress = achievements.filter((a) => !a.earned && a.progress > 0)
  const locked = achievements.filter((a) => !a.earned && (!a.progress || a.progress === 0))
  const liveXp = meData?.xp ?? 0
  const liveLevel = meData?.level ?? 1
  const liveNextLevelXp = meData?.nextLevelXp ?? 100
  const liveFloorXp = meData?.levelFloorXp ?? 0
  const liveStreak = meData?.streakDays ?? 0
  const liveLessons = meData?.stats.lessonsCompleted ?? 0
  const liveAccuracy = meData?.stats.accuracy ?? 0
  const liveAttempts = meData?.stats.totalAttempts ?? 0
  const liveCorrect = meData?.stats.correctAttempts ?? 0
  const liveXpIntoLevel = liveXp - liveFloorXp
  const liveXpForLevel = liveNextLevelXp - liveFloorXp
  const levelPct = liveXpForLevel > 0 ? Math.round((liveXpIntoLevel / liveXpForLevel) * 100) : 0

  const isAvatarUnlocked = (a: typeof avatars[0]) => {
    const meetsLessons = a.requiredLessons <= liveLessons
    const meetsLevel = a.requiredLevel <= liveLevel
    return a.id === 1 || (meetsLessons && meetsLevel)
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "avatars", label: "Avatars", icon: Camera },
    { id: "progress", label: "Progress", icon: BarChart3 },
  ]

  return (
    <>
      <Head><title>Sanjog - Profile</title></Head>

      {error ? (
        <div className="max-w-5xl mx-auto p-4 lg:p-6 space-y-6">
          <div className="bg-white rounded-2xl border border-[#ECE8FF] p-6">
            <ErrorState title="Failed to Load" message={error} onRetry={fetchProfile} />
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl border border-[#ECE8FF] p-6 shadow-[0_8px_24px_rgba(125,84,255,0.06)]">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#FFC83D]">
                <Image
                  src={user?.imageUrl || "/Avatar.png"}
                  alt="Profile"
                  width={96} height={96}
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#7D54FF] text-white text-sm rounded-full w-7 h-7 flex items-center justify-center font-bold">
                {liveLevel}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-bold text-[#2D1B69]">{meData?.name || user?.fullName || "User"}</h1>
                  <p className="text-sm text-[#7E7A93]">@{meData?.username || "user"}</p>
                  {meData?.bio && <p className="text-sm text-[#7E7A93] mt-2 max-w-lg">{meData.bio}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="primary" size="sm" icon={User} onClick={() => setShowEditModal(true)}>
                    Edit Profile
                  </Button>
                  <Button variant="icon" size="md" icon={SettingsIcon} href="/dashboard/settings" />
                </div>
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-[#7E7A93]">
                {meData?.email && (
                  <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" />{meData.email}</span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Joined {meData?.createdAt ? new Date(meData.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Recently"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />Level {liveLevel} &middot; {liveXp} XP
                </span>
              </div>

              {/* Level progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#7E7A93]">Level Progress</span>
                  <span className="text-[#7D54FF] font-medium">{liveXpIntoLevel}/{liveXpForLevel} XP ({levelPct}%)</span>
                </div>
                <div className="h-2 bg-[#FAF7FF] rounded-full overflow-hidden">
                  <div className="h-full bg-[#7D54FF] rounded-full transition-all" style={{ width: `${levelPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Stat cards row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
            <KpiCard icon={Star} label="Streak" value={`${liveStreak} days`} color="yellow" />
            <KpiCard icon={Award} label="Lessons" value={liveLessons} color="green" />
            <KpiCard icon={Target} label="Accuracy" value={`${liveAccuracy}%`} color="blue" />
            <KpiCard icon={Zap} label="Attempts" value={liveAttempts} color="purple" subtitle={`${liveCorrect} correct`} />
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

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "overview" && (
              <OverviewTab
                meData={meData}
                achievements={earnedAchievements}
                progressData={progressData}
                loading={loading}
              />
            )}
            {activeTab === "achievements" && (
              <AchievementsTab
                earned={earnedAchievements}
                inProgress={inProgress}
                locked={locked}
                totalXp={achievements.filter((a) => a.earned).reduce((s, a) => s + a.xp, 0)}
                loading={loading}
              />
            )}
            {activeTab === "avatars" && (
              <AvatarsTab
                avatars={avatars}
                selectedAvatarId={selectedAvatarId}
                onSelect={async (id: number) => {
                  setSelectedAvatarId(id)
                  await fetch("/api/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ avatarId: id }) }).catch(() => {})
                }}
                isUnlocked={isAvatarUnlocked}
                page={avatarPage}
                onPageChange={setAvatarPage}
                perPage={avatarsPerPage}
              />
            )}
            {activeTab === "progress" && (
              <ProgressTab meData={meData} progressData={progressData} loading={loading} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={{
          name: meData?.name || null,
          username: meData?.username || null,
          email: meData?.email || null,
          bio: meData?.bio || null,
          learningGoal: meData?.learningGoal || null,
          preferredLang: meData?.preferredLang || null,
          timezone: meData?.timezone || null,
          avatarId: selectedAvatarId,
        }}
        onSaved={(updated) => {
          setMeData((prev) => prev ? { ...prev, ...updated } : prev)
        }}
      />
    </>
  )
}

// ─── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({ meData, achievements, progressData, loading }: any) {
  const recentActivity = progressData?.recentActivity?.slice(0, 5) || []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Achievements */}
      <div className="bg-white rounded-2xl border border-[#ECE8FF] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#2D1B69]">Recent Achievements</h2>
        </div>
        {achievements.length === 0 ? (
          <div className="text-center py-8 text-[#7E7A93]">
            <Trophy className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No achievements yet</p>
            <p className="text-xs mt-1">Complete lessons to earn achievements</p>
          </div>
        ) : (
          <div className="space-y-3">
            {achievements.slice(0, 4).map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 p-3 bg-[#FAF7FF] rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7D54FF] to-[#6840E0] flex items-center justify-center text-lg">
                  {a.icon || "🏆"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#2D1B69]">{a.name}</div>
                  <div className="text-xs text-[#7E7A93]">+{a.xp} XP</div>
                </div>
                {a.unlockedAt && (
                  <span className="text-xs text-[#7E7A93] flex-shrink-0">
                    {new Date(a.unlockedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        {achievements.length > 4 && (
          <Link href="/dashboard/achievements" className="block text-center text-sm text-[#7D54FF] mt-4 hover:underline">
            View All Achievements
          </Link>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-[#ECE8FF] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#2D1B69]">Recent Activity</h2>
        </div>
        {recentActivity.length === 0 ? (
          <div className="text-center py-8 text-[#7E7A93]">
            <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No activity yet</p>
            <Link href="/dashboard/lessons/interactive" className="text-xs text-[#7D54FF] mt-1 inline-block hover:underline">
              Start your first lesson
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((a: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-[#FAF7FF] rounded-xl">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  a.correct ? "bg-green-100" : "bg-orange-100"
                }`}>
                  {a.correct ? "✓" : "✗"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#2D1B69]">Sign "{a.signLabel}"</div>
                  <div className="text-xs text-[#7E7A93]">{a.correct ? "Correct" : "Incorrect"}</div>
                </div>
                <span className="text-xs text-[#7E7A93] flex-shrink-0">
                  {new Date(a.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
        {recentActivity.length > 0 && (
          <Link href="/dashboard/progress" className="block text-center text-sm text-[#7D54FF] mt-4 hover:underline">
            View Full Progress
          </Link>
        )}
      </div>

      {/* Quick Stats */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-[#ECE8FF] p-6">
        <h2 className="text-lg font-bold text-[#2D1B69] mb-4">Learning Summary</h2>
        {loading ? (
          <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#FAF7FF] p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-[#7D54FF]">{meData?.xp ?? 0}</div>
              <div className="text-xs text-[#7E7A93]">Total XP</div>
            </div>
            <div className="bg-[#FAF7FF] p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-[#22C55E]">{meData?.stats.lessonsCompleted ?? 0}</div>
              <div className="text-xs text-[#7E7A93]">Lessons</div>
            </div>
            <div className="bg-[#FAF7FF] p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-[#FFC83D]">{meData?.streakDays ?? 0}</div>
              <div className="text-xs text-[#7E7A93]">Day Streak</div>
            </div>
            <div className="bg-[#FAF7FF] p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-[#5EC8FF]">{meData?.stats.accuracy ?? 0}%</div>
              <div className="text-xs text-[#7E7A93]">Accuracy</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Achievements Tab ──────────────────────────────────────────────────────────
function AchievementsTab({ earned, inProgress, locked, totalXp, loading }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Stats */}
      <div className="space-y-4">
        <KpiCard icon={Trophy} label="Earned" value={earned.length} color="purple" subtitle={`${totalXp} XP total`} />
        <KpiCard icon={Star} label="In Progress" value={inProgress.length} color="yellow" />
        <KpiCard icon={ShieldCheck} label="Locked" value={locked.length} color="orange" />
      </div>

      {/* Achievement list */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-[#ECE8FF] p-6">
        <h2 className="text-lg font-bold text-[#2D1B69] mb-4">
          {earned.length > 0 ? "Earned Achievements" : "All Achievements"}
        </h2>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : [...earned, ...inProgress, ...locked].length === 0 ? (
          <div className="text-center py-12 text-[#7E7A93]">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-[#2D1B69]">No achievements yet</p>
            <p className="text-sm mt-1">Start practicing to unlock achievements</p>
            <Button variant="primary" size="sm" href="/dashboard/lessons/interactive" className="mt-4">
              Start Practicing
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {[...earned, ...inProgress, ...locked].map((a: any) => (
              <div key={a.id} className="flex items-center gap-4 p-4 bg-[#FAF7FF] rounded-xl">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.color || "from-[#7D54FF] to-[#6840E0]"} flex items-center justify-center text-xl`}>
                  {a.icon || "🏆"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#2D1B69]">{a.name}</div>
                  <div className="text-xs text-[#7E7A93]">{a.description || `+${a.xp} XP`}</div>
                  {!a.earned && a.progress > 0 && (
                    <div className="mt-1.5 h-1.5 bg-white rounded-full overflow-hidden w-32">
                      <div className="h-full bg-[#7D54FF] rounded-full" style={{ width: `${a.progress}%` }} />
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  {a.earned ? (
                    <BadgeCheck className="w-5 h-5 text-[#22C55E]" />
                  ) : a.progress > 0 ? (
                    <span className="text-xs font-medium text-[#FFC83D]">{a.progress}%</span>
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-[#7E7A93]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Avatars Tab ───────────────────────────────────────────────────────────────
function AvatarsTab({ avatars, selectedAvatarId, onSelect, isUnlocked, page, onPageChange, perPage }: any) {
  const totalPages = Math.ceil(avatars.length / perPage)
  const pageAvatars = avatars.slice(page * perPage, (page + 1) * perPage)
  const unlockedCount = avatars.filter((a: any) => isUnlocked(a)).length

  return (
    <div className="bg-white rounded-2xl border border-[#ECE8FF] p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#2D1B69]">Avatar Collection</h2>
          <p className="text-sm text-[#7E7A93]">{unlockedCount}/{avatars.length} unlocked</p>
        </div>
        <div className="flex gap-2">
          <Button variant="icon" size="sm" icon={ChevronLeft} disabled={page === 0} onClick={() => onPageChange(page - 1)} />
          <Button variant="icon" size="sm" icon={ChevronRight} disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)} />
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-[#FAF7FF] rounded-full overflow-hidden mb-6">
        <div className="h-full bg-[#7D54FF] rounded-full transition-all" style={{ width: `${(unlockedCount / avatars.length) * 100}%` }} />
      </div>

      {/* Avatar grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {pageAvatars.map((avatar: any) => {
          const unlocked = isUnlocked(avatar)
          return (
            <motion.div
              key={avatar.id}
              whileHover={unlocked ? { scale: 1.03 } : undefined}
              onClick={() => unlocked && onSelect(avatar.id)}
              className={`relative p-4 rounded-xl text-center cursor-pointer transition-all ${
                selectedAvatarId === avatar.id
                  ? "bg-[#EAE4FF] ring-2 ring-[#7D54FF]"
                  : unlocked
                    ? "bg-[#FAF7FF] hover:bg-[#EAE4FF]"
                    : "bg-gray-100 opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden">
                <Image src={avatar.image} alt={avatar.name} width={64} height={64} className="object-cover" />
              </div>
              <div className="text-sm font-medium text-[#2D1B69]">{avatar.name}</div>
              <div className="text-xs text-[#7E7A93] mt-0.5">
                {unlocked ? (selectedAvatarId === avatar.id ? "Selected" : "Select") : "Locked"}
              </div>
              {selectedAvatarId === avatar.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-[#7D54FF] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Unlock criteria */}
      <div className="mt-6 bg-[#FAF7FF] rounded-xl p-4">
        <h3 className="text-sm font-medium text-[#2D1B69] mb-2">How to Unlock Avatars</h3>
        <div className="space-y-2 text-xs text-[#7E7A93]">
          {avatars.slice(1).map((a: any) => (
            <div key={a.id} className="flex justify-between">
              <span>{a.name}</span>
              <span className={isUnlocked(a) ? "text-[#22C55E]" : ""}>{a.unlockCriteria}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Progress Tab ──────────────────────────────────────────────────────────────
function ProgressTab({ meData, progressData, loading }: any) {
  const completedAlphabet = meData?.stats.alphabetCompleted ?? 0
  const completedNumbers = meData?.stats.numberCompleted ?? 0
  const totalAttempts = meData?.stats.totalAttempts ?? 0
  const correctAttempts = meData?.stats.correctAttempts ?? 0
  const activity = progressData?.recentActivity || []

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const dayCounts: number[] = Array(7).fill(0)
  const today = new Date()
  activity.forEach((a: any) => {
    const d = new Date(a.createdAt)
    const diff = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    if (diff < 7) {
      const idx = d.getDay()
      dayCounts[idx]++
    }
  })

  const maxCount = Math.max(...dayCounts, 1)
  const totalTimeMinutes = activity.length * 0.5
  const hours = Math.floor(totalTimeMinutes / 60)
  const mins = Math.round(totalTimeMinutes % 60)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left panel */}
      <div className="space-y-4">
        <KpiCard icon={Target} label="Accuracy" value={meData?.stats.accuracy ? `${meData.stats.accuracy}%` : "—"} color="blue" />
        <KpiCard icon={Award} label="Alphabets" value={`${completedAlphabet}/26`} color="green" subtitle={`${Math.round((completedAlphabet / 26) * 100)}%`} />
        <KpiCard icon={Award} label="Numbers" value={`${completedNumbers}/10`} color="purple" subtitle={`${Math.round((completedNumbers / 10) * 100)}%`} />
        <KpiCard icon={Clock} label="Est. Practice Time" value={`${hours}h ${mins}m`} color="orange" />
      </div>

      {/* Right panels */}
      <div className="lg:col-span-2 space-y-6">
        {/* Weekly Activity */}
        <div className="bg-white rounded-2xl border border-[#ECE8FF] p-6">
          <h2 className="text-lg font-bold text-[#2D1B69] mb-4">Weekly Activity</h2>
          <div className="flex items-end justify-between h-40 gap-2">
            {weekDays.map((day, i) => {
              const pct = maxCount > 0 ? (dayCounts[i] / maxCount) * 100 : 0
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-[#7E7A93]">{dayCounts[i] || ""}</span>
                  <div className="w-full bg-[#FAF7FF] rounded-t-lg overflow-hidden" style={{ height: "120px" }}>
                    <div
                      className="w-full bg-[#7D54FF] rounded-t-lg transition-all duration-500"
                      style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#7E7A93]">{day}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Completion progress */}
        <div className="bg-white rounded-2xl border border-[#ECE8FF] p-6">
          <h2 className="text-lg font-bold text-[#2D1B69] mb-4">Learning Progress</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#2D1B69] font-medium">Alphabets</span>
                <span className="text-[#7E7A93]">{completedAlphabet}/26 ({Math.round((completedAlphabet / 26) * 100)}%)</span>
              </div>
              <div className="h-2 bg-[#FAF7FF] rounded-full overflow-hidden">
                <div className="h-full bg-[#7D54FF] rounded-full" style={{ width: `${(completedAlphabet / 26) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#2D1B69] font-medium">Numbers</span>
                <span className="text-[#7E7A93]">{completedNumbers}/10 ({Math.round((completedNumbers / 10) * 100)}%)</span>
              </div>
              <div className="h-2 bg-[#FAF7FF] rounded-full overflow-hidden">
                <div className="h-full bg-[#5EC8FF] rounded-full" style={{ width: `${(completedNumbers / 10) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

