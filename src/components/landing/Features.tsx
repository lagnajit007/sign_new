"use client"

import { useRef } from "react"
import { useScrollReveal } from "@/lib/animations"
import { Camera, Brain, BarChart3, Users, Shield, Sparkles } from "lucide-react"

const features = [
  {
    icon: Camera,
    title: "Real-Time Camera Recognition",
    description: "Uses your webcam with TensorFlow-powered handpose tracking. No special hardware needed.",
    color: "text-brand",
    bg: "bg-brand/10",
  },
  {
    icon: Brain,
    title: "AI-Powered Feedback",
    description: "Advanced computer vision analyzes hand shape, position, and movement for accurate feedback.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Detailed analytics on accuracy, streaks, XP, and mastery across every sign you learn.",
    color: "text-sky",
    bg: "bg-sky/10",
  },
  {
    icon: Sparkles,
    title: "Gamified Experience",
    description: "Earn achievements, compete on leaderboards, and stay motivated with daily challenges.",
    color: "text-gold",
    bg: "bg-gold/10",
  },
  {
    icon: Users,
    title: "Community Learning",
    description: "See what others are practicing, share progress, and learn together in a supportive environment.",
    color: "text-coral",
    bg: "bg-coral/10",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Camera data processes locally in your browser. Nothing is stored, recorded, or transmitted.",
    color: "text-pink",
    bg: "bg-pink/10",
  },
]

export default function Features() {
  const sectionRef = useRef<HTMLDivElement>(null!)
  useScrollReveal(sectionRef)

  return (
    <section id="features" data-reveal ref={sectionRef} className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-soft rounded-full text-brand text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink mb-4">
            Everything You Need to Learn
          </h2>
          <p className="text-lg text-ink-soft">
            Built from the ground up for accessible, effective sign language education.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" data-reveal-child>
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="bg-surface rounded-2xl p-6 border border-brand-soft shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.bg}`}>
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-bold text-ink mb-2">{feature.title}</h3>
                <p className="text-ink-soft text-sm leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
