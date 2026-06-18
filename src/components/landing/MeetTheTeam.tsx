"use client"

import { useRef } from "react"
import { useScrollReveal } from "@/lib/animations"
import { Linkedin, Github, Users } from "lucide-react"
import Link from "next/link"

const team = [
  {
    name: "Team Member 1",
    role: "Role Placeholder",
    bio: "Short bio placeholder describing background and contributions to Sanjog.",
    initials: "TM",
    gradient: "from-brand to-purple-400",
  },
  {
    name: "Team Member 2",
    role: "Role Placeholder",
    bio: "Short bio placeholder describing background and contributions to Sanjog.",
    initials: "TM",
    gradient: "from-sky to-blue-400",
  },
  {
    name: "Team Member 3",
    role: "Role Placeholder",
    bio: "Short bio placeholder describing background and contributions to Sanjog.",
    initials: "TM",
    gradient: "from-gold to-orange-400",
  },
  {
    name: "Team Member 4",
    role: "Role Placeholder",
    bio: "Short bio placeholder describing background and contributions to Sanjog.",
    initials: "TM",
    gradient: "from-success to-emerald-400",
  },
  {
    name: "Team Member 5",
    role: "Role Placeholder",
    bio: "Short bio placeholder describing background and contributions to Sanjog.",
    initials: "TM",
    gradient: "from-coral to-red-400",
  },
]

export default function MeetTheTeam() {
  const sectionRef = useRef<HTMLDivElement>(null!)
  useScrollReveal(sectionRef)

  return (
    <section id="team" data-reveal ref={sectionRef} className="py-20 md:py-28 bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-soft rounded-full text-brand text-sm font-medium mb-4">
            <Users className="w-4 h-4" />
            Meet the Team
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink mb-4">
            Built by People Who Care
          </h2>
          <p className="text-lg text-ink-soft">
            A small team passionate about making sign language accessible to everyone.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6" data-reveal-child>
          {team.map((member) => (
            <div
              key={member.name}
              className="bg-surface rounded-2xl p-6 border border-brand-soft shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 text-center group"
            >
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center mx-auto mb-4`}>
                <span className="text-white text-2xl font-bold">{member.initials}</span>
              </div>
              <h3 className="text-lg font-bold text-ink mb-1">{member.name}</h3>
              <p className="text-xs text-brand font-medium mb-3">{member.role}</p>
              <p className="text-xs text-ink-soft leading-relaxed mb-4">{member.bio}</p>
              <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href="#" className="text-ink-soft hover:text-brand transition-colors" aria-label="LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </Link>
                <Link href="#" className="text-ink-soft hover:text-brand transition-colors" aria-label="GitHub">
                  <Github className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12" data-reveal-child>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-6 py-3 text-brand border border-brand rounded-full text-sm font-semibold hover:bg-bg transition-all"
          >
            Learn More About Us
          </Link>
        </div>
      </div>
    </section>
  )
}
