import Link from "next/link"
import { ArrowLeft, Heart, Eye, Globe, Code, MapPin, Mail, Github, Linkedin } from "lucide-react"

const team = [
  { name: "Team Member 1", role: "Role", initials: "TM", gradient: "from-brand to-purple-400" },
  { name: "Team Member 2", role: "Role", initials: "TM", gradient: "from-sky to-blue-400" },
  { name: "Team Member 3", role: "Role", initials: "TM", gradient: "from-gold to-orange-400" },
  { name: "Team Member 4", role: "Role", initials: "TM", gradient: "from-success to-emerald-400" },
  { name: "Team Member 5", role: "Role", initials: "TM", gradient: "from-coral to-red-400" },
]

const roadmap = [
  { year: "2023", title: "Research & Prototype", desc: "Initial thesis project exploring AI sign language recognition." },
  { year: "2024", title: "Post-Graduation Development", desc: "Expanded beyond academic prototype with improved AI." },
  { year: "2025", title: "Production Platform", desc: "Full rewrite with modern tech stack and gamified experience." },
  { year: "2026", title: "Community Growth", desc: "Expanding sign language support and learning community." },
  { year: "2027+", title: "Future Vision", desc: "Mobile apps, more sign languages, educational partnerships." },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-ink-soft hover:text-brand text-sm font-medium mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <h1 className="text-4xl sm:text-5xl font-bold text-ink mb-4">About Sanjog</h1>
        <p className="text-lg text-ink-soft mb-16 max-w-2xl">
          Making sign language accessible through the power of AI and a deep commitment to inclusive communication.
        </p>

        {/* Mission */}
        <section className="mb-16">
          <div className="bg-bg rounded-3xl p-8 md:p-12 border border-brand-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-brand" />
              </div>
              <h2 className="text-2xl font-bold text-ink">Our Mission</h2>
            </div>
            <p className="text-ink-soft leading-relaxed text-lg">
              To make sign language learning accessible, engaging, and effective for everyone —
              using AI to provide real-time feedback that was previously only available through
              expensive one-on-one instruction.
            </p>
          </div>
        </section>

        {/* Vision */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-sky/10 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-sky" />
            </div>
            <h2 className="text-2xl font-bold text-ink">Our Vision</h2>
          </div>
          <p className="text-ink-soft leading-relaxed">
            A world where language is never a barrier. We envision a future where anyone,
            anywhere can learn sign language for free, supported by AI that makes practice
            as effective as learning with a human tutor.
          </p>
        </section>

        {/* Accessibility Commitment */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-brand/5 to-purple-50 rounded-3xl p-8 md:p-12 border border-brand/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-brand" />
              </div>
              <h2 className="text-2xl font-bold text-ink">Accessibility Commitment</h2>
            </div>
            <div className="space-y-4 text-ink-soft leading-relaxed">
              <p>
                Accessibility isn&apos;t a feature — it&apos;s the foundation of everything we build.
                Sanjog was created to bridge the communication gap between deaf and hearing communities.
              </p>
              <p>
                Every design decision is guided by one question: &ldquo;Does this make sign language
                learning more accessible?&rdquo; If the answer is no, we go back to the drawing board.
              </p>
              <p>
                We are committed to keeping core learning features free, because we believe
                communication is a human right, not a commodity.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                {["Free forever", "Browser-based", "Privacy-first", "Open feedback"].map((item) => (
                  <span key={item} className="px-4 py-2 bg-surface rounded-full text-sm font-medium text-ink border border-brand-soft">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-gold" />
            </div>
            <h2 className="text-2xl font-bold text-ink">Our Story</h2>
          </div>
          <div className="space-y-4 text-ink-soft leading-relaxed">
            <p>
              Sanjog started as a final-year Bachelor of Computer Science project. A team of five students
              shared a common observation: sign language learning tools were either expensive, ineffective,
              or required in-person instruction.
            </p>
            <p>
              They set out to build something different — a platform that uses AI to give learners
              the same quality of feedback they would get from a human teacher, but accessible from
              anywhere, at any time, for free.
            </p>
            <p>
              After graduation, the project didn&apos;t end. The team continued refining the AI models,
              redesigning the user experience, and rebuilding the platform with modern technology.
              What started as a thesis experiment is now a production-ready learning platform
              used by learners around the world.
            </p>
          </div>
        </section>

        {/* The Team */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
              <Linkedin className="w-5 h-5 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-ink">The Team</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member) => (
              <div key={member.name} className="bg-bg rounded-2xl p-6 border border-brand-soft text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center mx-auto mb-3`}>
                  <span className="text-white text-xl font-bold">{member.initials}</span>
                </div>
                <h3 className="font-bold text-ink">{member.name}</h3>
                <p className="text-xs text-brand font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Technology */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-coral/10 rounded-xl flex items-center justify-center">
              <Code className="w-5 h-5 text-coral" />
            </div>
            <h2 className="text-2xl font-bold text-ink">Technology</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Frontend", value: "Next.js 14, Tailwind CSS, Framer Motion" },
              { label: "AI/ML", value: "TensorFlow.js, Handpose model, custom gesture classifier" },
              { label: "Backend", value: "Next.js API routes, Prisma ORM" },
              { label: "Database", value: "PostgreSQL via Supabase" },
              { label: "Auth", value: "Clerk authentication" },
              { label: "Animation", value: "GSAP, ScrollTrigger, Framer Motion" },
            ].map((tech) => (
              <div key={tech.label} className="bg-bg rounded-xl p-4 border border-brand-soft">
                <div className="text-xs text-ink-soft mb-1">{tech.label}</div>
                <div className="text-sm font-semibold text-ink">{tech.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Roadmap */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-pink/10 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-pink" />
            </div>
            <h2 className="text-2xl font-bold text-ink">Roadmap</h2>
          </div>
          <div className="space-y-4">
            {roadmap.map((item) => (
              <div key={item.year} className="flex items-start gap-4 bg-bg rounded-xl p-4 border border-brand-soft">
                <span className="text-xs font-bold text-brand bg-brand-soft px-2.5 py-1 rounded-full flex-shrink-0 mt-0.5">
                  {item.year}
                </span>
                <div>
                  <div className="text-sm font-semibold text-ink">{item.title}</div>
                  <div className="text-xs text-ink-soft">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-brand" />
            </div>
            <h2 className="text-2xl font-bold text-ink">Contact</h2>
          </div>
          <p className="text-ink-soft mb-4">
            Have questions, feedback, or want to contribute? We&apos;d love to hear from you.
          </p>
          <Link
            href="mailto:hello@sanjog.app"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-full text-sm font-semibold hover:bg-brand-dark transition-all"
          >
            <Mail className="w-4 h-4" />
            hello@sanjog.app
          </Link>
        </section>
      </div>
    </div>
  )
}
