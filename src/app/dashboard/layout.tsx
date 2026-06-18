"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import PageTransition from "@/components/PageTransition"
import CustomCursor from "@/components/CustomCursor"
import Sidebar from "@/components/sidebar"
import Loader from "@/components/Loader"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { useAuth } from "@clerk/nextjs"

type ActivePage = 'dashboard' | 'lessons' | 'achievements' | 'challenges' | 'progress' | 'community'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId } = useAuth()
  const pathname = usePathname()
  const [isLoading, setIsLoading]           = useState(true)
  const [enableCustomCursor, setEnableCustomCursor] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed]     = useState(false)
  const previousPathname = useRef(pathname)
  const initialLoadRef   = useRef(true)

  const getActivePage = useCallback((): ActivePage => {
    const page = pathname.split('/')[2]
    const valid: ActivePage[] = ['dashboard','lessons','achievements','challenges','progress','community']
    return valid.includes(page as ActivePage) ? page as ActivePage : 'dashboard'
  }, [pathname])

  const activePage = getActivePage()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEnableCustomCursor(localStorage.getItem('enableCustomCursor') === 'true')
    }
  }, [])

  useEffect(() => {
    if (isLoaded && !userId) {
      window.location.href = "/sign-in"
    }
  }, [isLoaded, userId])

  useEffect(() => {
    if (!isLoaded) return
    if (initialLoadRef.current) {
      const t = setTimeout(() => { setIsLoading(false); initialLoadRef.current = false }, 800)
      return () => clearTimeout(t)
    }
  }, [isLoaded, pathname])

  useEffect(() => {
    if (initialLoadRef.current || !isLoaded) return
    if (previousPathname.current === pathname) return
    if (previousPathname.current.startsWith('/dashboard') && pathname.startsWith('/dashboard')) {
      setIsLoading(true)
      const t = setTimeout(() => setIsLoading(false), 400)
      previousPathname.current = pathname
      return () => clearTimeout(t)
    }
    previousPathname.current = pathname
  }, [pathname, isLoaded])

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF7FF]">
        <Loader color="#7D54FF" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF7FF] flex">
      {enableCustomCursor && <CustomCursor />}

      <Sidebar
        activePage={activePage}
        onToggle={() => setSidebarCollapsed(c => !c)}
        isCollapsed={sidebarCollapsed}
      />

      {/* Margin tracks sidebar width */}
      <div className={`flex-1 flex transition-all duration-500 ${sidebarCollapsed ? "ml-[70px]" : "ml-[300px]"}`}>
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-white bg-opacity-70 z-50 flex items-center justify-center backdrop-blur-sm"
              style={{ left: sidebarCollapsed ? 70 : 300 }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center"
              >
                <Loader color="#7D54FF" />
                <motion.div
                  initial={{ width: 0 }} animate={{ width: 100 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="h-1 bg-[#7D54FF] rounded-full mt-4"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  )
}