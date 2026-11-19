import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Navbar from "@/components/landing/Navbar"
import HeroSection from "@/components/landing/HeroSection"
import HowItWorks from "@/components/landing/HowItWorks"
import AIShowcase from "@/components/landing/AIShowcase"
import LearningJourney from "@/components/landing/LearningJourney"
import Features from "@/components/landing/Features"
import WhySanjogExists from "@/components/landing/WhySanjogExists"
import OurStory from "@/components/landing/OurStory"
import FAQ from "@/components/landing/FAQ"
import FinalCTA from "@/components/landing/FinalCTA"
import Footer from "@/components/landing/Footer"

// Server-rendered so the marketing page is visible to crawlers and paints
// immediately; signed-in visitors go straight to their dashboard.
export default async function LandingPage() {
  const { userId } = await auth()
  if (userId) redirect("/dashboard")

  return (
    <div className="min-h-screen bg-white">
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-[60] rounded-md bg-brand px-4 py-2 font-semibold text-white focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <HowItWorks />
        <AIShowcase />
        <LearningJourney />
        <Features />
        <WhySanjogExists />
        <OurStory />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
