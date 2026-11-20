import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getLandingPreview } from "@/lib/landing-preview"
import Navbar from "@/components/landing/Navbar"
import HeroSection from "@/components/landing/HeroSection"
import ProductPreview from "@/components/landing/ProductPreview"
import Features from "@/components/landing/Features"
import HowItWorks from "@/components/landing/HowItWorks"
import Mission from "@/components/landing/Mission"
import FAQ from "@/components/landing/FAQ"
import FinalCTA from "@/components/landing/FinalCTA"
import Footer from "@/components/landing/Footer"

// Server-rendered so the page is visible to crawlers and paints immediately;
// signed-in visitors go straight to their dashboard.
export default async function LandingPage() {
  const { userId } = await auth()
  if (userId) redirect("/dashboard")

  const preview = await getLandingPreview()

  return (
    <div data-surface="marketing" className="min-h-screen bg-canvas text-fg">
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-[60] rounded-lg bg-brand px-4 py-2 font-medium text-brand-fg focus:not-sr-only"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="mk-frame border-b border-[var(--mk-rule)]">
        <HeroSection />
        {preview && <ProductPreview data={preview} />}
        <Features leaders={preview?.leaders ?? null} />
        <HowItWorks />
        <Mission />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
