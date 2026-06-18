"use client"

import { useRef } from "react"
import { Webcam, ScanLine, BarChart3, Zap } from "lucide-react"
import { useScrollReveal } from "@/lib/animations"

const steps = [
  {
    icon: Webcam,
    title: "Open Your Webcam",
    description: "Position your hands in front of the camera. Sanjog uses real-time computer vision to track your gestures.",
    color: "text-brand",
    bg: "bg-brand/10",
  },
  {
    icon: ScanLine,
    title: "AI Recognizes Your Sign",
    description: "Our TensorFlow-powered model analyzes your hand shape, position, and movement — giving instant feedback.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: BarChart3,
    title: "Track & Improve",
    description: "Earn XP, build streaks, unlock achievements, and watch your accuracy grow with every practice session.",
    color: "text-gold",
    bg: "bg-gold/10",
  },
]

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null!)
  useScrollReveal(sectionRef)

  return (
    <section id="how-it-works" data-reveal ref={sectionRef} className="py-20 md:py-28 bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-soft rounded-full text-brand text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink mb-4">
            Three Steps to Start Signing
          </h2>
          <p className="text-lg text-ink-soft">
            No downloads, no setup. Just open your browser and begin learning.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div
                key={step.title}
                data-reveal-child
                className="relative bg-surface rounded-2xl p-8 border border-brand-soft shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-brand text-white text-lg font-bold mb-6">
                  {i + 1}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${step.bg}`}>
                  <Icon className={`w-6 h-6 ${step.color}`} />
                </div>
                <h3 className="text-xl font-bold text-ink mb-3">{step.title}</h3>
                <p className="text-ink-soft text-sm leading-relaxed">{step.description}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 text-brand-soft">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
