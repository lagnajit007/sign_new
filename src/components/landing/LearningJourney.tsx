"use client"

import { useRef } from "react"
import Link from "next/link"
import { BookOpen, Sparkles, ArrowRight, ChevronRight } from "lucide-react"
import { useScrollReveal } from "@/lib/animations"

const paths = [
  {
    icon: "A",
    title: "Alphabet",
    description: "Master all 26 ASL letters with guided lessons and real-time feedback.",
    count: "26 letters",
    href: "/dashboard/lessons",
    gradient: "from-brand to-purple-400",
  },
  {
    icon: "#",
    title: "Numbers",
    description: "Learn number signs from 0 to 10 with progressive difficulty.",
    count: "10 numbers",
    href: "/dashboard/lessons",
    gradient: "from-sky to-blue-400",
  },
  {
    icon: "✦",
    title: "Interactive Practice",
    description: "Free-form practice mode with live camera recognition and instant feedback.",
    count: "Unlimited",
    href: "/dashboard/lessons/interactive",
    gradient: "from-gold to-orange-400",
  },
]

export default function LearningJourney() {
  const sectionRef = useRef<HTMLDivElement>(null!)
  useScrollReveal(sectionRef)

  return (
    <section id="learning-journey" data-reveal ref={sectionRef} className="py-20 md:py-28 bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-soft rounded-full text-brand text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            Learning Journey
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink mb-4">
            Choose Your Path
          </h2>
          <p className="text-lg text-ink-soft">
            Structured lessons designed for beginners. Progress at your own pace.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8" data-reveal-child>
          {paths.map((path) => (
            <Link
              key={path.title}
              href={path.href}
              className="group relative bg-surface rounded-2xl p-8 border border-brand-soft shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${path.gradient} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2`} />
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${path.gradient} flex items-center justify-center text-white text-xl font-bold mb-5`}>
                {path.icon}
              </div>
              <h3 className="text-xl font-bold text-ink mb-2 group-hover:text-brand transition-colors">
                {path.title}
              </h3>
              <p className="text-ink-soft text-sm leading-relaxed mb-4">{path.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-soft bg-bg px-3 py-1 rounded-full">{path.count}</span>
                <span className="text-brand text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Start <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12" data-reveal-child>
          <Link
            href="/dashboard/lessons"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-full text-sm font-semibold hover:bg-brand-dark transition-all hover:scale-[1.02]"
          >
            View All Lessons <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
