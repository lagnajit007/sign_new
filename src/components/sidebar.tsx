"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { BookOpen, Trophy, Puzzle, BarChart3, Users, LogOut, Home } from "lucide-react"
import { useClerk, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
  activePage?: 'dashboard' | 'lessons' | 'achievements' | 'challenges' | 'progress' | 'community'
}

type PublicMetadata = {
  level?: number
  [key: string]: unknown
}

export default function Sidebar({ 
  isCollapsed: propIsCollapsed, 
  onToggle, 
  activePage = "dashboard" 
}: SidebarProps) {
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  const [internalCollapsed, setInternalCollapsed] = useState(propIsCollapsed || false);
  const [logoError, setLogoError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  
  const isCollapsed = propIsCollapsed !== undefined ? propIsCollapsed : internalCollapsed;
  
  useEffect(() => {
    setLogoError(false);
  }, [isCollapsed]);
  
  const toggleSidebar = () => {
    setInternalCollapsed(!internalCollapsed);
    onToggle?.();
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const userLevel = (user?.publicMetadata as PublicMetadata)?.level || 1;
  const userInitial = user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";

  return (
    <div className={`bg-white flex flex-col fixed h-screen transition-all duration-500 ease-in-out overflow-hidden z-10 ${
      isCollapsed ? "w-[70px]" : "w-[300px]"
    }`}>
      {/* Header */}
      <div className={`p-4 flex items-center transition-all duration-500 ease-in-out ${isCollapsed ? "justify-center" : "gap-2"}`}>
        <div className="flex items-center justify-center">
          {isCollapsed ? (
            logoError ? (
              <div className="w-8 h-10 bg-gray-200 flex items-center justify-center font-bold text-lg text-[#7D54FF]">S</div>
            ) : (
              <Image 
                src="/S-logo.svg" 
                alt="Sanjog" 
                width={28} 
                height={40} 
                onError={() => setLogoError(true)}
                unoptimized={true}
                priority={true}
              />
            )
          ) : (
            logoError ? (
              <div className="w-28 h-10 bg-gray-200 flex items-center justify-center font-bold text-lg text-[#7D54FF]">Sanjog</div>
            ) : (
              <Image 
                src="/sanjog-logo.svg" 
                alt="Sanjog" 
                width={120} 
                height={58} 
                onError={() => setLogoError(true)}
                unoptimized={true}
                priority={true}
              />
            )
          )}
        </div>
        {!isCollapsed && (
          <button 
            onClick={toggleSidebar} 
            className="ml-auto p-1 rounded-lg hover:bg-gray-100"
            aria-label="Collapse sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-[#7E7A93]"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {isCollapsed && (
        <button
          onClick={toggleSidebar}
          className="self-center mt-2 p-1 rounded-full hover:bg-gray-100"
          aria-label="Expand sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-[#7E7A93]"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      )}

      {/* Menu Section */}
      {!isCollapsed && <div className="text-[#7E7A93] mb-2 px-6 transition-opacity duration-500 ease-in-out">Menu</div>}

      <nav className="p-3 flex-1 transition-all duration-500 ease-in-out">
        <Link
          href="/dashboard"
          className={`flex items-center p-3 transition-all duration-500 ease-in-out ${
            activePage === "dashboard" ? "bg-[#EAE4FF] text-[#7D54FF] font-medium" : "text-[#7E7A93] hover:bg-gray-100"
          } rounded-lg ${isCollapsed && "justify-center"}`}
          title="Dashboard"
        >
          <Home className="w-5 h-5 min-w-5" />
          {!isCollapsed && <span className="ml-3">Dashboard</span>}
        </Link>

        <Link
          href="/dashboard/lessons"
          className={`flex items-center p-3 transition-all duration-500 ease-in-out ${
            activePage === "lessons" ? "bg-[#EAE4FF] text-[#7D54FF] font-medium" : "text-[#7E7A93] hover:bg-gray-100"
          } rounded-lg ${isCollapsed && "justify-center"}`}
          title="Lessons"
        >
          <BookOpen className="w-5 h-5 min-w-5" />
          {!isCollapsed && <span className="ml-3">Lessons</span>}
        </Link>

        <Link
          href="/dashboard/achievements"
          className={`flex items-center p-3 transition-all duration-500 ease-in-out ${
            activePage === "achievements" ? "bg-[#EAE4FF] text-[#7D54FF] font-medium" : "text-[#7E7A93] hover:bg-gray-100"
          } rounded-lg ${isCollapsed && "justify-center"}`}
          title="Achievements"
        >
          <Trophy className="w-5 h-5 min-w-5" />
          {!isCollapsed && <span className="ml-3">Achievements</span>}
        </Link>

        <Link
          href="/dashboard/challenges"
          className={`flex items-center p-3 transition-all duration-500 ease-in-out ${
            activePage === "challenges" ? "bg-[#EAE4FF] text-[#7D54FF] font-medium" : "text-[#7E7A93] hover:bg-gray-100"
          } rounded-lg ${isCollapsed && "justify-center"}`}
          title="Challenges"
        >
          <Puzzle className="w-5 h-5 min-w-5" />
          {!isCollapsed && <span className="ml-3">Challenges</span>}
        </Link>

        <Link
          href="/dashboard/progress"
          className={`flex items-center p-3 transition-all duration-500 ease-in-out ${
            activePage === "progress" ? "bg-[#EAE4FF] text-[#7D54FF] font-medium" : "text-[#7E7A93] hover:bg-gray-100"
          } rounded-lg ${isCollapsed && "justify-center"}`}
          title="Progress"
        >
          <BarChart3 className="w-5 h-5 min-w-5" />
          {!isCollapsed && <span className="ml-3">Progress</span>}
        </Link>

        <Link
          href="/dashboard/community"
          className={`flex items-center p-3 transition-all duration-500 ease-in-out ${
            activePage === "community" ? "bg-[#EAE4FF] text-[#7D54FF] font-medium" : "text-[#7E7A93] hover:bg-gray-100"
          } rounded-lg ${isCollapsed && "justify-center"}`}
          title="Community"
        >
          <Users className="w-5 h-5 min-w-5" />
          {!isCollapsed && <span className="ml-3">Community</span>}
        </Link>
      </nav>

      {/* User Section */}
      <div className="mt-auto pt-4 px-3 pb-4 transition-all duration-500 ease-in-out">
        {isLoaded ? (
          user ? (
            !isCollapsed ? (
              <>
                <Link href="/dashboard/profile" passHref>
                  <div className="flex items-center gap-3 mb-4 p-3 bg-[#FAF7FF] rounded-md cursor-pointer hover:bg-[#EAE4FF] transition-all duration-500 ease-in-out">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        {avatarError ? (
                          <div className="w-10 h-10 bg-[#7D54FF] flex items-center justify-center text-white font-medium">
                            {userInitial}
                          </div>
                        ) : (
                          <Image
                            src={user.imageUrl || "/Avatar.png"}
                            alt={user.fullName || "User"}
                            width={40}
                            height={40}
                            className="object-cover"
                            onError={() => setAvatarError(true)}
                          />
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-[#7D54FF] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {userLevel}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-[#2D1B69] group-hover:text-[#7D54FF]">
                        {user.fullName || user.username || "User"}
                      </div>
                      {userEmail && <div className="text-xs text-[#7E7A93]">{userEmail}</div>}
                    </div>
                  </div>
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center justify-center w-full p-3 text-[#FF7A59] border border-[#efefef] rounded-lg hover:bg-red-50 transition-all duration-500 ease-in-out"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Log out
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 transition-all duration-500 ease-in-out">
                <Link
                  href="/dashboard/profile"
                  className="relative"
                  title="View Profile"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    {avatarError ? (
                      <div className="w-10 h-10 bg-[#7D54FF] flex items-center justify-center text-white font-medium">
                        {userInitial}
                      </div>
                    ) : (
                      <Image
                        src={user.imageUrl || "/Avatar.png"}
                        alt={user.fullName || "User"}
                        width={40}
                        height={40}
                        className="object-cover"
                        onError={() => setAvatarError(true)}
                      />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-[#7D54FF] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {userLevel}
                  </div>
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center justify-center w-10 h-10 text-[#FF7A59] border border-[#efefef] rounded-lg hover:bg-gray-50 transition-all duration-500 ease-in-out"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )
          ) : null
        ) : (
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded-full w-full mb-4"></div>
          </div>
        )}
      </div>
    </div>
  )
}