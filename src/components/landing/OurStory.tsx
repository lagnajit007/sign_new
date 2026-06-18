"use client"

import { useRef } from "react"
import { useScrollReveal } from "@/lib/animations"
import { GraduationCap, FileCode, Rocket, Users } from "lucide-react"

const milestones = [
  {
    year: "2023",
    icon: GraduationCap,
    title: "Final Year Project",
    description: "Sanjog began as a Bachelor of Computer Science thesis project by a team of five students exploring AI-powered sign language recognition.",
    color: "text-brand",
    bg: "bg-brand/10",
    border: "border-brand/30",
  },
  {
    year: "2024",
    icon: FileCode,
    title: "Beyond The Prototype",
    description: "After graduation, the team continued development. The prototype evolved with improved recognition algorithms and a more robust architecture.",
    color: "text-sky",
    bg: "bg-sky/10",
    border: "border-sky/30",
  },
  {
    year: "2025",
    icon: Rocket,
    title: "Production Build",
    description: "Complete rewrite with modern tech stack. Real-time TensorFlow inference, gamified progress system, and a polished learning experience.",
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
  },
  {
    year: "2026",
    icon: Users,
    title: "Growing Community",
    description: "Sanjog continues to grow. New features, expanded sign language support, and a thriving community of learners from around the world.",
    color: "text-gold",
    bg: "bg-gold/10",
    border: "border-gold/30",
  },
]

export default function OurStory() {
  const sectionRef = useRef<HTMLDivElement>(null!)
  useScrollReveal(sectionRef)

  return (
    <section id="story" data-reveal ref={sectionRef} className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-soft rounded-full text-brand text-sm font-medium mb-4">
            <GraduationCap className="w-4 h-4" />
            Our Story
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink mb-4">
            From a University Project to a Learning Platform
          </h2>
          <p className="text-lg text-ink-soft">
            What started as a thesis experiment is now helping people around the world learn sign language.
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto" data-reveal-child>
          <div className="absolute left-8 top-0 bottom-0 w-px bg-brand-soft hidden md:block" />

          <div className="space-y-12">
            {milestones.map((m, i) => {
              const Icon = m.icon
              return (
                <div key={m.year} className="relative md:pl-20">
                  <div className={`hidden md:flex absolute left-4 w-9 h-9 rounded-xl items-center justify-center ${m.bg} border ${m.border} -translate-x-1/2`}>
                    <Icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                  <div className="bg-bg rounded-2xl p-6 border border-brand-soft shadow-card hover:shadow-card-hover transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`md:hidden w-9 h-9 rounded-xl flex items-center justify-center ${m.bg}`}>
                        <Icon className={`w-4 h-4 ${m.color}`} />
                      </div>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${m.bg} ${m.color}`}>
                        {m.year}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-ink mb-2">{m.title}</h3>
                    <p className="text-ink-soft text-sm leading-relaxed">{m.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
