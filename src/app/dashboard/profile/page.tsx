"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useClerk, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import {
  User,
  Mail,
  Calendar,
  Clock,
  Edit,
  Award,
  Settings,
  BarChart3,
  Lock,
  Bell,
  MessageSquare,
  LogOut,
  Camera,
  BadgeCheck,
  ShieldCheck,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Crown,
  Star,
  Sparkles,
} from "lucide-react"
import Sidebar from "@/components/sidebar"



// Avatar data with unlocking thresholds
const avatars = [
  {
    id: 1,
    name: "Default",
    image: "/Avatar.png",
    unlocked: true,
    default: true,
    unlockCriteria: "Default avatar",
  },
  {
    id: 2,
    name: "Beginner",
    image: "/Avatar_b.png",
    unlocked: true,
    default: false,
    unlockCriteria: "Complete 5 lessons",
  },
  {
    id: 3,
    name: "Enthusiast",
    image: "/Avatar_b.png",
    unlocked: true,
    default: false,
    unlockCriteria: "Reach Level 5",
  },
  {
    id: 4,
    name: "Explorer",
    image: "/Avatar_b.png",
    unlocked: false,
    default: false,
    unlockCriteria: "Complete 20 lessons",
    requiredLevel: 8,
  },
  {
    id: 5,
    name: "Champion",
    image: "/placeholder.svg?height=100&width=100&text=5",
    unlocked: false,
    default: false,
    unlockCriteria: "Earn 10 badges",
    requiredLevel: 10,
  },
  {
    id: 6,
    name: "Master",
    image: "/Avatar_b.png",
    unlocked: false,
    default: false,
    unlockCriteria: "Maintain a 30-day streak",
    requiredLevel: 15,
  },
  {
    id: 7,
    name: "Legend",
    image: "/Avatar_b.png",
    unlocked: false,
    default: false,
    unlockCriteria: "Complete all alphabet and number lessons",
    requiredLevel: 20,
  },
  {
    id: 8,
    name: "Guru",
    image: "/Avatar_b.png",
    unlocked: false,
    default: false,
    unlockCriteria: "Achieve 95% accuracy across all lessons",
    requiredLevel: 25,
  },
]

// Shape of /api/me response
interface MeData {
  xp: number
  level: number
  nextLevelXp: number
  levelFloorXp: number
  streakDays: number
  stats: {
    lessonsCompleted: number
    accuracy: number
    alphabetCompleted: number
    numberCompleted: number
  }
}

export default function ProfilePage() {
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedAvatar, setSelectedAvatar] = useState(1)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [avatarPage, setAvatarPage] = useState(0)
  const avatarsPerPage = 4

  // Live stats from /api/me — fallback to zeros while loading
  const [meData, setMeData] = useState<MeData | null>(null)
  const [earnedCount, setEarnedCount] = useState(0)

  useEffect(() => {
    fetch("/api/me")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch me data");
        return r.json();
      })
      .then((d) => { if (d) setMeData(d) })
      .catch((err) => console.error("Profile: fetch /api/me failed", err))
    fetch("/api/achievements")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch achievements");
        return r.json();
      })
      .then((d) => { if (d?.achievements) setEarnedCount(d.achievements.filter((a: {earned: boolean}) => a.earned).length) })
      .catch((err) => console.error("Profile: fetch /api/achievements failed", err))
  }, [])

  // Derive display values — use live data when available, fallback otherwise
  const liveXp           = meData?.xp ?? 0
  const liveLevel        = meData?.level ?? 1
  const liveNextLevelXp  = meData?.nextLevelXp ?? 100
  const liveFloorXp      = meData?.levelFloorXp ?? 0
  const liveStreak       = meData?.streakDays ?? 0
  const liveLessons      = meData?.stats.lessonsCompleted ?? 0
  const liveAccuracy     = meData ? `${meData.stats.accuracy}%` : "—"
  const liveXpIntoLevel  = liveXp - liveFloorXp
  const liveXpForLevel   = liveNextLevelXp - liveFloorXp
  const levelPct         = liveXpForLevel > 0
    ? Math.round((liveXpIntoLevel / liveXpForLevel) * 100)
    : 0

  // Static parts kept as-is (bio, social links, certificates, recent lessons mock)
  const userData = {
    name: "Jenny Wilson",
    email: "jenny.wilson@example.com",
    joinedDate: "March 15, 2023",
    timeSpent: "24h 45m",
    bio: "Learning sign language to communicate better with my cousin who is deaf. I'm enjoying the journey and the Sanjog platform has been really helpful!",
    socialLinks: {
      twitter: "jennyW",
      instagram: "jenny.wilson",
      linkedin: "jennyWilson",
    },
    achievements: [
      {
        id: 1,
        name: "First Step",
        icon: "🚀",
        color: "from-[#FF7A59] to-[#FF7A59]",
        date: "Mar 15, 2023",
      },
      {
        id: 2,
        name: "Quick Learner",
        icon: "⚡",
        color: "from-[#7D54FF] to-[#6840E0]",
        date: "Mar 17, 2023",
      },
      {
        id: 3,
        name: "Alphabet Master",
        icon: "🔤",
        color: "from-[#5EC8FF] to-[#6840E0]",
        date: "Mar 25, 2023",
      },
      {
        id: 5,
        name: "Week Warrior",
        icon: "🔥",
        color: "from-[#FFC83D] to-[#FF7A59]",
        date: "Apr 1, 2023",
        
      },
      {
        id: 9,
        name: "Early Bird",
        icon: "🌅",
        color: "from-[#FF7A59] to-[#FF7A59]",
        date: "Mar 20, 2023",
      },
      {
        id: 10,
        name: "Night Owl",
        icon: "🌙",
        color: "from-[#7D54FF] to-[#6840E0]",
        date: "Mar 22, 2023",
      },
    ],
    recentLessons: [
      {
        id: 1,
        name: "Letter K",
        category: "Alphabets",
        date: "Today",
        accuracy: "95%",
        icon: "🔤",
        iconBg: "bg-[#ffe9ac]",
        iconColor: "text-[#ff2600]",
      },
      {
        id: 2,
        name: "Numbers 1-5",
        category: "Numbers",
        date: "Yesterday",
        accuracy: "90%",
        icon: "🔢",
        iconBg: "bg-[#EAE4FF]",
        iconColor: "text-[#5EC8FF]",
      },
      {
        id: 3,
        name: "Common Greetings",
        category: "Phrases",
        date: "2 days ago",
        accuracy: "85%",
        icon: "👋",
        iconBg: "bg-[#EAE4FF]",
        iconColor: "text-[#6840E0]",
      },
    ],
    certificates: [
      {
        id: 1,
        name: "ASL Alphabet Mastery",
        issueDate: "April 5, 2023",
        image: "/certificate.jpg",
      },
      {
        id: 2,
        name: "Sign Language Basics",
        issueDate: "March 30, 2023",
        image: "/certificate.jpg",
      },
    ],
    progressStats: [
      { label: "Alphabets", completed: 14, total: 26, color: "bg-[#7D54FF]" },
      { label: "Numbers", completed: 8, total: 10, color: "bg-[#5EC8FF]" },
      { label: "Common Words", completed: 12, total: 50, color: "bg-[#22C55E]" },
      { label: "Phrases", completed: 5, total: 30, color: "bg-[#FF7A59]" },
    ],
  }

  // Calculate total pages for avatar pagination
  const totalAvatarPages = Math.ceil(avatars.length / avatarsPerPage)

  // Get current page avatars
  const currentAvatars = avatars.slice(avatarPage * avatarsPerPage, (avatarPage + 1) * avatarsPerPage)

  // Handle avatar page navigation
  const nextAvatarPage = () => {
    if (avatarPage < totalAvatarPages - 1) {
      setAvatarPage(avatarPage + 1)
    }
  }

  const prevAvatarPage = () => {
    if (avatarPage > 0) {
      setAvatarPage(avatarPage - 1)
    }
  }

  // Handle avatar selection
  const handleAvatarSelect = (id: number) => {
    const avatar = avatars.find((a) => a.id === id)
    if (avatar && avatar.unlocked) {
      setSelectedAvatar(id)
    }
  }

  // Close modal when avatar is selected
  useEffect(() => {
    if (showAvatarModal) {
      // Keep modal open
    } else {
      // Reset to first page when modal is closed
      setAvatarPage(0)
    }
  }, [showAvatarModal])

  const handleSignOut = () => {
    signOut(() => router.push("/"));
  };

  return (
    <div className="flex min-h-screen bg-[#FAF7FF]">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="relative mb-4 md:mb-0 md:mr-6">
              <div
                className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#7D54FF] cursor-pointer"
                onClick={() => setShowAvatarModal(true)}
              >
                <Image
                  src={isLoaded && user?.imageUrl ? user.imageUrl : "/Avatar.png"}
                  alt={isLoaded && user?.fullName ? user.fullName : "User"}
                  width={96}
                  height={96}
                  className="object-cover"
                  priority
                />
              </div>
              <div className="absolute bottom-0 right-0 bg-[#7D54FF] rounded-full w-8 h-8 flex items-center justify-center">
                <span className="text-white font-bold text-xs">{liveLevel}</span>
              </div>
              
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-[#2D1B69] mb-1">
                    {isLoaded && user?.fullName ? user.fullName : userData.name}
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-[#7E7A93]">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {isLoaded && user?.primaryEmailAddress ? user.primaryEmailAddress.emailAddress : userData.email}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined {isLoaded && user?.createdAt 
                        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                        : userData.joinedDate}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-[#7D54FF] text-white rounded-full shadow-btn transition-transform hover:scale-[1.03] active:translate-y-1 active:shadow-none hover:bg-[#6840E0] text-sm">
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button className="flex items-center justify-center w-9 h-9 bg-[#FAF7FF] rounded-lg hover:bg-gray-200" aria-label="Settings">
                    <Settings className="w-5 h-5 text-[#7E7A93]" />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#7E7A93]">Level Progress</span>
                  <span className="text-[#7D54FF] font-medium">
                    {liveXpIntoLevel}/{liveXpForLevel} XP ({levelPct}%)
                  </span>
                </div>
                <div className="h-2 bg-[#FAF7FF] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#7D54FF] rounded-full"
                    style={{ width: `${levelPct}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#FFC83D] bg-opacity-20 flex items-center justify-center mr-3">
                <Clock className="w-5 h-5 text-[#FFC83D]" />
              </div>
              <div>
                <div className="text-sm text-[#7E7A93]">Streak</div>
                <div className="text-lg font-bold text-[#2D1B69]">{liveStreak} days</div>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#22C55E] bg-opacity-20 flex items-center justify-center mr-3">
                <Award className="w-5 h-5 text-[#22C55E]" />
              </div>
              <div>
                <div className="text-sm text-[#7E7A93]">Lessons</div>
                <div className="text-lg font-bold text-[#2D1B69]">{liveLessons}</div>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#5EC8FF] bg-opacity-20 flex items-center justify-center mr-3">
                <BarChart3 className="w-5 h-5 text-[#5EC8FF]" />
              </div>
              <div>
                <div className="text-sm text-[#7E7A93]">Accuracy</div>
                <div className="text-lg font-bold text-[#2D1B69]">{liveAccuracy}</div>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#FF7A59] bg-opacity-20 flex items-center justify-center mr-3">
                <Clock className="w-5 h-5 text-[#FF7A59]" />
              </div>
              <div>
                <div className="text-sm text-[#7E7A93]">Time Spent</div>
                <div className="text-lg font-bold text-[#2D1B69]">{userData.timeSpent}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="bg-white rounded-t-xl p-1 flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-3 text-sm font-medium rounded-lg ${
              activeTab === "overview" ? "bg-[#EAE4FF] text-[#7D54FF]" : "text-[#7E7A93] hover:bg-gray-100"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("achievements")}
            className={`flex-1 py-3 text-sm font-medium rounded-lg ${
              activeTab === "achievements" ? "bg-[#EAE4FF] text-[#7D54FF]" : "text-[#7E7A93] hover:bg-gray-100"
            }`}
          >
            Achievements
          </button>
          <button
            onClick={() => setActiveTab("avatars")}
            className={`flex-1 py-3 text-sm font-medium rounded-lg ${
              activeTab === "avatars" ? "bg-[#EAE4FF] text-[#7D54FF]" : "text-[#7E7A93] hover:bg-gray-100"
            }`}
          >
            Avatars
          </button>
          <button
            onClick={() => setActiveTab("progress")}
            className={`flex-1 py-3 text-sm font-medium rounded-lg ${
              activeTab === "progress" ? "bg-[#EAE4FF] text-[#7D54FF]" : "text-[#7E7A93] hover:bg-gray-100"
            }`}
          >
            Progress
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 py-3 text-sm font-medium rounded-lg ${
              activeTab === "settings" ? "bg-[#EAE4FF] text-[#7D54FF]" : "text-[#7E7A93] hover:bg-gray-100"
            }`}
          >
            Settings
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-xl p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div>
              {/* Bio Section */}
              {userData.bio && (
                <div className="mb-8">
                  <h2 className="text-lg font-bold text-[#2D1B69] mb-4">About Me</h2>
                  <p className="text-[#7E7A93]">
                    {isLoaded && user
                      ? `Hi, I'm ${user.fullName || user.firstName || "there"}! ${userData.bio.split("Learning")[1] || ""}`
                      : userData.bio}
                  </p>
                </div>
              )}

              {/* Achievements Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[#2D1B69]">Achievements</h2>
                  <button
                    onClick={() => setActiveTab("achievements")}
                    className="text-[#7D54FF] text-sm flex items-center"
                  >
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {userData.achievements.slice(0, 6).map((achievement) => (
                    <div key={achievement.id} className="flex flex-col items-center hover">
                      <div
                        className={`bg-gradient-to-b ${achievement.color} w-20 h-20 clip-hexagon flex items-center justify-center mb-2 hover-lift`}
                      >
                        <div className="text-white text-xl">{achievement.icon}</div>
                      </div>
                      <div className="text-xs text-center">
                        <div className="font-medium text-[#2D1B69]">{achievement.name}</div>
                        <div className="text-[#7E7A93]">{achievement.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Avatar Collection Preview */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[#2D1B69]">Avatar Collection</h2>
                  <button onClick={() => setActiveTab("avatars")} className="text-[#7D54FF] text-sm flex items-center">
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {avatars
                    .filter((avatar) => avatar.unlocked)
                    .slice(0, 4)
                    .map((avatar) => (
                      <div
                        key={avatar.id}
                        className={`flex flex-col items-center p-3 rounded-lg ${
                          selectedAvatar === avatar.id ? "bg-[#EAE4FF]" : "bg-[#FAF7FF]"
                        } cursor-pointer hover:bg-[#EAE4FF] transition-colors`}
                        onClick={() => handleAvatarSelect(avatar.id)}
                      >
                        <div className="relative mb-2">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white">
                            <Image
                              src={avatar.id === 1 && isLoaded && user?.imageUrl ? user.imageUrl : avatar.image || "/placeholder.svg"}
                              alt={avatar.name}
                              width={64}
                              height={64}
                              className="object-cover"
                            />
                          </div>
                          {selectedAvatar === avatar.id && (
                            <div className="absolute -bottom-1 -right-1 bg-[#22C55E] rounded-full w-6 h-6 flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="text-xs font-medium text-center text-[#2D1B69]">{avatar.name}</div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Recent Lessons — mock, hidden behind live_data check */}
              {liveLessons > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[#2D1B69]">Recent Lessons</h2>
                    <Link href="/dashboard/lessons" className="text-[#7D54FF] text-sm flex items-center">
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {userData.recentLessons.map((lesson) => (
                      <div key={lesson.id} className="flex items-center bg-[#FAF7FF] p-4 rounded-lg">
                        <div className={`w-12 h-12 ${lesson.iconBg} rounded-lg flex items-center justify-center mr-4`}>
                          <span className={`${lesson.iconColor} text-xl`}>{lesson.icon}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-[#2D1B69]">{lesson.name}</h3>
                              <div className="text-xs text-[#7E7A93]">
                                {lesson.category} • {lesson.date}
                              </div>
                            </div>
                            <div className="bg-white text-xs font-medium px-2 py-1 rounded-full text-[#22C55E]">
                              {lesson.accuracy}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certificates — hidden until certificate system is built */}
              {false && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[#2D1B69]">Certificates</h2>
                    <Link href="/dashboard/certificates" className="text-[#7D54FF] text-sm flex items-center">
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === "achievements" && (
            <div>
              {/* Achievement Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#FAF7FF] p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-[#7E7A93]">Total Achievements</div>
                      <div className="text-2xl font-bold text-[#2D1B69]">{earnedCount}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#EAE4FF] flex items-center justify-center">
                      <Award className="w-5 h-5 text-[#7D54FF]" />
                    </div>
                  </div>
                </div>

                <div className="bg-[#FAF7FF] p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-[#7E7A93]">Total XP</div>
                      <div className="text-2xl font-bold text-[#2D1B69]">{liveXp}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#FFC83D] bg-opacity-20 flex items-center justify-center">
                      <BadgeCheck className="w-5 h-5 text-[#FFC83D]" />
                    </div>
                  </div>
                </div>

                <div className="bg-[#FAF7FF] p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-[#7E7A93]">Current Level</div>
                      <div className="text-2xl font-bold text-[#2D1B69]">{liveLevel}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#7D54FF] bg-opacity-20 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-[#7D54FF]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* All Achievements */}
              <h2 className="text-lg font-bold text-[#2D1B69] mb-4">All Achievements</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {userData.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="bg-white rounded-xl border border-gray-100 p-4 hover:border-[#7D54FF] transition-colors"
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`bg-gradient-to-b ${achievement.color} w-16 h-16 rounded-xl flex items-center justify-center mb-3`}
                      >
                        <div className="text-white text-xl">{achievement.icon}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-[#2D1B69]">{achievement.name}</div>
                        <div className="text-xs text-[#7E7A93] mt-1">Earned on {achievement.date}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Locked Achievements (examples) */}
                <div className="bg-white rounded-xl border border-gray-100 p-4 opacity-50">
                  <div className="flex flex-col items-center">
                    <div className="bg-gradient-to-b from-[#7E7A93] to-[#7E7A93] w-16 h-16 rounded-xl flex items-center justify-center mb-3">
                      <div className="text-white text-xl">🏆</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-[#2D1B69]">Perfect Score</div>
                      <div className="text-xs text-[#7E7A93] mt-1">Get 100% on any lesson</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-4 opacity-50">
                  <div className="flex flex-col items-center">
                    <div className="bg-gradient-to-b from-[#7E7A93] to-[#7E7A93] w-16 h-16 rounded-xl flex items-center justify-center mb-3">
                      <div className="text-white text-xl">🌟</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-[#2D1B69]">30-Day Streak</div>
                      <div className="text-xs text-[#7E7A93] mt-1">Practice for 30 consecutive days</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Avatars Tab */}
          {activeTab === "avatars" && (
            <div>
              {/* Avatar Collection */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-[#2D1B69] mb-4">Your Avatar Collection</h2>
                <p className="text-[#7E7A93] mb-4">
                  Unlock new avatars by completing lessons, earning badges, and reaching higher levels. Select an avatar
                  to use it on your profile.
                </p>

                <div className="bg-[#FAF7FF] p-4 rounded-xl mb-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#7D54FF] bg-opacity-20 flex items-center justify-center mr-3">
                      <Sparkles className="w-5 h-5 text-[#7D54FF]" />
                    </div>
                    <div>
                      <div className="font-medium text-[#2D1B69]">Currently Using</div>
                      <div className="text-sm text-[#7E7A93]">
                        {avatars.find((a) => a.id === selectedAvatar)?.name || "Default"} Avatar
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Unlocked Avatars */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#2D1B69]">Unlocked Avatars</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevAvatarPage}
                      disabled={avatarPage === 0}
                      className={`p-1 rounded-full ${
                        avatarPage === 0 ? "text-gray-300 cursor-not-allowed" : "text-[#7E7A93] hover:bg-gray-100"
                      }`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-[#7E7A93]">
                      {avatarPage + 1} / {totalAvatarPages}
                    </span>
                    <button
                      onClick={nextAvatarPage}
                      disabled={avatarPage >= totalAvatarPages - 1}
                      className={`p-1 rounded-full ${
                        avatarPage >= totalAvatarPages - 1
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-[#7E7A93] hover:bg-gray-100"
                      }`}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {currentAvatars.map((avatar) => (
                    <div
                      key={avatar.id}
                      className={`relative flex flex-col items-center p-4 rounded-lg ${
                        avatar.unlocked
                          ? selectedAvatar === avatar.id
                            ? "bg-[#EAE4FF]"
                            : "bg-white border border-gray-100 hover:border-[#7D54FF]"
                          : "bg-gray-100 opacity-70"
                      } transition-colors ${avatar.unlocked ? "cursor-pointer" : "cursor-not-allowed"}`}
                      onClick={() => avatar.unlocked && handleAvatarSelect(avatar.id)}
                    >
                      <div className="relative mb-3">
                        <div
                          className={`w-20 h-20 rounded-full overflow-hidden ${
                            avatar.unlocked ? "border-2 border-white" : "border-2 border-gray-200"
                          }`}
                        >
                          <Image
                            src={avatar.id === 1 && isLoaded && user?.imageUrl ? user.imageUrl : avatar.image || "/placeholder.svg"}
                            alt={avatar.name}
                            width={80}
                            height={80}
                            className={`object-cover ${!avatar.unlocked && "grayscale"}`}
                          />
                        </div>
                        {selectedAvatar === avatar.id && (
                          <div className="absolute -bottom-1 -right-1 bg-[#22C55E] rounded-full w-6 h-6 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                        {!avatar.unlocked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center">
                              <Lock className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-[#2D1B69] mb-1">{avatar.name}</div>
                        {avatar.unlocked ? (
                          <div className="text-xs text-[#22C55E] flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Unlocked
                          </div>
                        ) : (
                          <div className="text-xs text-[#7E7A93]">
                            {avatar.requiredLevel ? `Requires Level ${avatar.requiredLevel}` : avatar.unlockCriteria}
                          </div>
                        )}
                      </div>

                      {avatar.default && (
                        <div className="absolute top-2 left-2 bg-[#FFC83D] text-white text-xs px-2 py-0.5 rounded-full">
                          Default
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Avatar Unlocking Progress */}
              <div>
                <h3 className="font-bold text-[#2D1B69] mb-4">Avatar Unlocking Progress</h3>
                <div className="bg-white border border-gray-100 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium text-[#2D1B69]">Avatars Unlocked</div>
                    <div className="text-sm text-[#7E7A93]">
                      {avatars.filter((a) => a.unlocked).length}/{avatars.length}
                    </div>
                  </div>
                  <div className="h-2 bg-[#FAF7FF] rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-[#7D54FF] rounded-full"
                      style={{ width: `${(avatars.filter((a) => a.unlocked).length / avatars.length) * 100}%` }}
                    ></div>
                  </div>

                  <div className="space-y-4 mt-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-[#EAE4FF] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Crown className="w-4 h-4 text-[#7D54FF]" />
                      </div>
                      <div>
                        <div className="font-medium text-[#2D1B69]">Next Avatar: Explorer</div>
                        <div className="text-sm text-[#7E7A93] mb-2">Complete 20 lessons to unlock</div>
                        <div className="flex items-center text-xs text-[#7E7A93]">
                          <div className="flex-1 h-1.5 bg-[#FAF7FF] rounded-full overflow-hidden mr-2">
                            <div
                              className="h-full bg-[#7D54FF] rounded-full"
                              style={{ width: `${Math.min(100, (liveLessons / 20) * 100)}%` }}
                            ></div>
                          </div>
                          <span>
                            {liveLessons}/20 (
                            {Math.min(100, Math.round((liveLessons / 20) * 100))}
                            %)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-[#FFC83D] bg-opacity-20 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Star className="w-4 h-4 text-[#FFC83D]" />
                      </div>
                      <div>
                        <div className="font-medium text-[#2D1B69]">Champion Avatar</div>
                        <div className="text-sm text-[#7E7A93] mb-2">Earn 10 badges to unlock</div>
                        <div className="flex items-center text-xs text-[#7E7A93]">
                          <div className="flex-1 h-1.5 bg-[#FAF7FF] rounded-full overflow-hidden mr-2">
                            <div
                              className="h-full bg-[#FFC83D] rounded-full"
                              style={{ width: `${Math.min(100, (earnedCount / 10) * 100)}%` }}
                            ></div>
                          </div>
                          <span>
                            {earnedCount}/10 ({Math.min(100, Math.round((earnedCount / 10) * 100))}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === "progress" && (
            <div>
              {/* Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-[#FAF7FF] p-4 rounded-xl">
                  <h3 className="text-lg font-bold text-[#2D1B69] mb-4">Overall Completion</h3>
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <svg className="w-36 h-36" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#EAE4FF" strokeWidth="10" />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#7D54FF"
                          strokeWidth="10"
                          strokeDasharray="283"
                          strokeDashoffset="170"
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                        />
                        <text
                          x="50"
                          y="50"
                          textAnchor="middle"
                          fill="#7D54FF"
                          fontSize="16"
                          fontWeight="bold"
                          dominantBaseline="middle"
                        >
                          40%
                        </text>
                      </svg>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[#7E7A93]">39 out of 80 lessons completed</p>
                  </div>
                </div>

                <div className="bg-[#FAF7FF] p-4 rounded-xl">
                  <h3 className="text-lg font-bold text-[#2D1B69] mb-4">Learning Categories</h3>
                  <div className="space-y-4">
                    {userData.progressStats.map((stat, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <div className="text-sm font-medium text-[#2D1B69]">{stat.label}</div>
                          <div className="text-sm text-[#7E7A93]">
                            {stat.completed}/{stat.total} ({Math.round((stat.completed / stat.total) * 100)}%)
                          </div>
                        </div>
                        <div className="h-2 bg-white rounded-full overflow-hidden">
                          <div
                            className={`h-full ${stat.color} rounded-full`}
                            style={{ width: `${(stat.completed / stat.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weekly Activity */}
              <div className="bg-[#FAF7FF] p-4 rounded-xl mb-6">
                <h3 className="text-lg font-bold text-[#2D1B69] mb-4">Weekly Activity</h3>
                <div className="flex items-end justify-between h-40">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
                    // Generate random height for demo
                    const height = [35, 60, 45, 80, 65, 90, 30][index]

                    return (
                      <div key={day} className="flex flex-col items-center">
                        <div
                          className="w-12 bg-[#7D54FF] bg-opacity-20 rounded-t-md hover:bg-opacity-30 transition-all cursor-pointer"
                          style={{ height: `${height}%` }}
                        >
                          <div
                            className="w-full bg-[#7D54FF] rounded-t-md transition-all"
                            style={{ height: `${height * 0.7}%` }}
                          ></div>
                        </div>
                        <div className="mt-2 text-xs text-[#7E7A93]">{day}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Learning Time Distribution */}
              <div className="bg-[#FAF7FF] p-4 rounded-xl">
                <h3 className="text-lg font-bold text-[#2D1B69] mb-4">Learning Time Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#7D54FF] bg-opacity-20 flex items-center justify-center mr-2">
                        <Clock className="w-4 h-4 text-[#7D54FF]" />
                      </div>
                      <div className="text-sm text-[#7E7A93]">Morning</div>
                    </div>
                    <div className="text-xl font-bold text-[#2D1B69]">6h 45m</div>
                    <div className="text-xs text-[#7E7A93]">27% of total time</div>
                  </div>

                  <div className="bg-white p-3 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#FFC83D] bg-opacity-20 flex items-center justify-center mr-2">
                        <Clock className="w-4 h-4 text-[#FFC83D]" />
                      </div>
                      <div className="text-sm text-[#7E7A93]">Afternoon</div>
                    </div>
                    <div className="text-xl font-bold text-[#2D1B69]">10h 30m</div>
                    <div className="text-xs text-[#7E7A93]">42% of total time</div>
                  </div>

                  <div className="bg-white p-3 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#5EC8FF] bg-opacity-20 flex items-center justify-center mr-2">
                        <Clock className="w-4 h-4 text-[#5EC8FF]" />
                      </div>
                      <div className="text-sm text-[#7E7A93]">Evening</div>
                    </div>
                    <div className="text-xl font-bold text-[#2D1B69]">7h 30m</div>
                    <div className="text-xs text-[#7E7A93]">31% of total time</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div>
              {/* Settings Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Settings */}
                <div className="bg-[#FAF7FF] p-4 rounded-xl">
                  <h3 className="text-lg font-bold text-[#2D1B69] mb-4">Account Settings</h3>

                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <User className="w-5 h-5 text-[#7D54FF] mr-3" />
                          <span className="text-[#2D1B69]">Personal Information</span>
                        </div>
                        <button className="text-xs text-[#7D54FF] hover:underline">Edit</button>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Mail className="w-5 h-5 text-[#7D54FF] mr-3" />
                          <span className="text-[#2D1B69]">Email & Password</span>
                        </div>
                        <button className="text-xs text-[#7D54FF] hover:underline">Edit</button>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Bell className="w-5 h-5 text-[#7D54FF] mr-3" />
                          <span className="text-[#2D1B69]">Notifications</span>
                        </div>
                        <button className="text-xs text-[#7D54FF] hover:underline">Edit</button>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Lock className="w-5 h-5 text-[#7D54FF] mr-3" />
                          <span className="text-[#2D1B69]">Privacy Settings</span>
                        </div>
                        <button className="text-xs text-[#7D54FF] hover:underline">Edit</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className="bg-[#FAF7FF] p-4 rounded-xl">
                  <h3 className="text-lg font-bold text-[#2D1B69] mb-4">Preferences</h3>

                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Settings className="w-5 h-5 text-[#FFC83D] mr-3" />
                          <span className="text-[#2D1B69]">Learning Preferences</span>
                        </div>
                        <button className="text-xs text-[#7D54FF] hover:underline">Edit</button>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <MessageSquare className="w-5 h-5 text-[#FFC83D] mr-3" />
                          <span className="text-[#2D1B69]">Community Settings</span>
                        </div>
                        <button className="text-xs text-[#7D54FF] hover:underline">Edit</button>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Bell className="w-5 h-5 text-[#FFC83D] mr-3" />
                          <span className="text-[#2D1B69]">Notification Preferences</span>
                        </div>
                        <button className="text-xs text-[#7D54FF] hover:underline">Edit</button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button 
                      onClick={handleSignOut}
                      className="flex items-center text-[#FF7A59] hover:text-[#FF7A59]"
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Avatar Selection Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#2D1B69]">Choose Your Avatar</h2>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100 text-[#7E7A93]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <p className="text-[#7E7A93]">
                  Select an avatar to represent you across the platform. Unlock more avatars by completing lessons and
                  earning achievements.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {avatars.map((avatar) => (
                  <div
                    key={avatar.id}
                    className={`relative flex flex-col items-center p-4 rounded-lg ${
                      avatar.unlocked
                        ? selectedAvatar === avatar.id
                          ? "bg-[#EAE4FF]"
                          : "bg-white border border-gray-100 hover:border-[#7D54FF]"
                        : "bg-gray-100 opacity-70"
                    } transition-colors ${avatar.unlocked ? "cursor-pointer" : "cursor-not-allowed"}`}
                    onClick={() => avatar.unlocked && handleAvatarSelect(avatar.id)}
                  >
                    <div className="relative mb-3">
                      <div
                        className={`w-20 h-20 rounded-full overflow-hidden ${
                          avatar.unlocked ? "border-2 border-white" : "border-2 border-gray-200"
                        }`}
                      >
                        <Image
                          src={avatar.id === 1 && isLoaded && user?.imageUrl ? user.imageUrl : avatar.image || "/placeholder.svg"}
                          alt={avatar.name}
                          width={80}
                          height={80}
                          className={`object-cover ${!avatar.unlocked && "grayscale"}`}
                        />
                      </div>
                      {selectedAvatar === avatar.id && (
                        <div className="absolute -bottom-1 -right-1 bg-[#22C55E] rounded-full w-6 h-6 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {!avatar.unlocked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-[#2D1B69] mb-1">{avatar.name}</div>
                      {avatar.unlocked ? (
                        <div className="text-xs text-[#22C55E] flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Unlocked
                        </div>
                      ) : (
                        <div className="text-xs text-[#7E7A93]">{avatar.unlockCriteria}</div>
                      )}
                    </div>

                    {avatar.default && (
                      <div className="absolute top-2 left-2 bg-[#FFC83D] text-white text-xs px-2 py-0.5 rounded-full">
                        Default
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="px-4 py-2 border border-[#EAE4FF] text-[#7E7A93] rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="px-4 py-2 bg-[#7D54FF] text-white rounded-full shadow-btn transition-transform hover:scale-[1.03] active:translate-y-1 active:shadow-none hover:bg-[#6840E0]"
                >
                  Save Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
