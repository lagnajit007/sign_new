"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import Loader from "@/components/Loader"
import Navbar from "@/components/landing/Navbar"
import HeroSection from "@/components/landing/HeroSection"
import HowItWorks from "@/components/landing/HowItWorks"
import AIShowcase from "@/components/landing/AIShowcase"
import LearningJourney from "@/components/landing/LearningJourney"
import Features from "@/components/landing/Features"
import WhySanjogExists from "@/components/landing/WhySanjogExists"
import OurStory from "@/components/landing/OurStory"
import MeetTheTeam from "@/components/landing/MeetTheTeam"
import CommunityAndImpact from "@/components/landing/CommunityAndImpact"
import FAQ from "@/components/landing/FAQ"
import FinalCTA from "@/components/landing/FinalCTA"
import Footer from "@/components/landing/Footer"

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true)
  const { isLoaded: isAuthLoaded, userId } = useAuth()
  const { isLoaded: isUserLoaded } = useUser()
  const pageRef = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isAuthLoaded && isUserLoaded && userId) {
      window.location.href = "/dashboard"
    }
  }, [isAuthLoaded, isUserLoaded, userId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader />
      </div>
    )
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <AIShowcase />
      <LearningJourney />
      <Features />
      <WhySanjogExists />
      <OurStory />
      <MeetTheTeam />
      <CommunityAndImpact />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  )
}
