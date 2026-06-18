'use client';

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useAuth, useUser } from "@clerk/nextjs";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import Loader from '@/components/Loader';

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { isLoaded: isAuthLoaded, userId } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAuthLoaded && isUserLoaded && userId) {
      setShowBanner(true);
    }
  }, [isAuthLoaded, isUserLoaded, userId]);

  const people = [
    { id: 1, name: "Sarah Johnson", designation: "Educator", image: "/Avatar.png" },
    { id: 2, name: "Michael Chen",  designation: "Developer", image: "/Avatar.png" },
    { id: 3, name: "Emma Wilson",   designation: "Student",   image: "/Avatar.png" },
    { id: 4, name: "David Kim",     designation: "Parent",    image: "/Avatar.png" },
  ];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#fff' }}>
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Welcome-back banner for signed-in users */}
      {showBanner && (
        <div className="bg-[#7D54FF] text-white py-2 px-6 flex items-center justify-between">
          <p className="text-sm">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}! Continue your learning journey.
          </p>
          <Link href="/dashboard">
            <button className="bg-white text-[#7D54FF] px-3 py-1 rounded-full text-xs font-medium hover:bg-opacity-90 transition-colors">
              Go to Dashboard
            </button>
          </Link>
        </div>
      )}

      {/* Header */}
      <header className="py-4 px-6 flex items-center justify-between max-w-7xl mx-auto">
        <Image src="/sanjog-logo.svg" alt="Sanjog Logo" width={120} height={40} className="object-contain" />
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="redirect">
              <button className="px-4 py-2 text-[#7D54FF] border border-[#7D54FF] rounded-full hover:bg-[#FAF7FF] transition-colors text-sm">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="redirect">
              <button className="px-4 py-2 bg-gradient-to-r from-[#7D54FF] to-[#9B7CFF] text-white rounded-full hover:opacity-90 transition-opacity text-sm">
                Sign up
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <button className="px-4 py-2 text-[#7D54FF] border border-[#7D54FF] rounded-full hover:bg-[#FAF7FF] transition-colors text-sm">
                Dashboard
              </button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-6 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#2D1B69] mb-6">
              The best place to <span className="text-[#7D54FF]">learn</span><br />
              and <span className="text-[#FFC83D]">play</span> for all
            </h1>
            <p className="text-[#7E7A93] mb-8 max-w-xl mx-auto">
              Discover thousands of fun and interactive activities to build real sign-language skills.
            </p>

            <div className="flex flex-col items-center justify-center mb-8">
              <div className="flex flex-row items-center justify-center w-full">
                <AnimatedTooltip items={people} />
                <span className="text-[#7E7A93] text-sm ml-2">+1,000 more</span>
              </div>
              <p className="text-xs text-[#7E7A93] mt-2">Join our community of learners</p>
            </div>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <SignedIn>
                <Link href="/dashboard">
                  <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#7D54FF] to-[#9B7CFF] text-white rounded-full hover:opacity-90 transition-opacity">
                    Go to Dashboard
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="ml-2">
                      <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="currentColor" />
                    </svg>
                  </button>
                </Link>
              </SignedIn>
              <SignedOut>
                <SignUpButton mode="redirect">
                  <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#7D54FF] to-[#9B7CFF] text-white rounded-full hover:opacity-90 transition-opacity">
                    Get Started Free
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="ml-2">
                      <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="currentColor" />
                    </svg>
                  </button>
                </SignUpButton>
                <SignInButton mode="redirect">
                  <button className="inline-flex items-center px-6 py-3 text-[#7D54FF] border border-[#7D54FF] rounded-full hover:bg-[#FAF7FF] transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>

          {/* Hero images */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="transform rotate-[-3deg]">
              <div className="rounded-3xl overflow-hidden shadow-lg aspect-square bg-[#EAE4FF] flex items-center justify-center">
                <Image src="/mudra.jpg" alt="Signing gesture" width={300} height={300} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="transform translate-y-4">
              <div className="rounded-3xl overflow-hidden shadow-lg aspect-square bg-[#EAE4FF] flex items-center justify-center">
                <Image src="/mudra.jpg" alt="Learning together" width={300} height={300} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="transform rotate-[3deg]">
              <div className="rounded-3xl overflow-hidden shadow-lg aspect-square bg-[#EAE4FF] flex items-center justify-center">
                <Image src="/mudra.jpg" alt="Practice session" width={300} height={300} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-[#FAF7FF]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#2D1B69]">
              Our <span className="text-[#7D54FF]">Interactive</span> Features
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#ffecf0] p-6 rounded-xl">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-4">
                <span className="text-xl">🎮</span>
              </div>
              <h3 className="text-xl font-bold text-[#2D1B69] mb-2">Fun Games</h3>
              <p className="text-[#7E7A93] text-sm mb-4">
                Interactive games designed to make learning sign language engaging and memorable.
              </p>
              <span className="text-xs text-[#7E7A93]">Fun and interactive</span>
            </div>
            <div className="bg-[#7D54FF] p-6 rounded-xl text-white">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-4">
                <span className="text-xl">🧠</span>
              </div>
              <h3 className="text-xl font-bold mb-2">AI Recognition</h3>
              <p className="text-sm mb-4 text-white/90">
                Real-time gesture detection gives instant feedback so you improve with every attempt.
              </p>
              <span className="text-xs text-white/80">Powered by computer vision</span>
            </div>
            <div className="bg-[#FFC83D] p-6 rounded-xl">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-4">
                <span className="text-xl">👥</span>
              </div>
              <h3 className="text-xl font-bold text-[#2D1B69] mb-2">Learn with Friends</h3>
              <p className="text-[#7E7A93] text-sm mb-4">
                Invite friends, compare progress on the leaderboard, and practice together.
              </p>
              <span className="text-xs text-[#7E7A93]">Social learning experience</span>
            </div>
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#2D1B69] mb-6">Join a Thriving Learning Community</h2>
          <p className="text-[#7E7A93] mb-12 max-w-2xl mx-auto">
            Learn alongside thousands of students from around the world who are mastering sign language with Sanjog.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto mb-12">
            {[
              { label: "Registered Learners", value: "3M+" },
              { label: "Practice Activities", value: "5k+" },
              { label: "Signs Covered", value: "80+" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#EAE4FF] rounded-full flex items-center justify-center mb-3">
                  <span className="text-[#7D54FF] font-bold text-sm">{stat.value}</span>
                </div>
                <div className="text-sm text-[#7E7A93]">{stat.label}</div>
              </div>
            ))}
          </div>
          <SignedOut>
            <SignUpButton mode="redirect">
              <button className="px-8 py-3 bg-gradient-to-r from-[#7D54FF] to-[#9B7CFF] text-white rounded-full hover:opacity-90 transition-opacity">
                Join Our Community
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard/community">
              <button className="px-8 py-3 bg-gradient-to-r from-[#7D54FF] to-[#9B7CFF] text-white rounded-full hover:opacity-90 transition-opacity">
                Visit Community
              </button>
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 px-6 bg-[#FAF7FF]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#2D1B69]">
              The <span className="text-[#7D54FF]">process</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {[
                { icon: "📚", title: "Large dataset of sign language", desc: "Built on a comprehensive dataset of ASL gestures, continuously expanded." },
                { icon: "🤖", title: "AI-powered recognition", desc: "Advanced algorithms blend multiple techniques for accurate gesture detection." },
                { icon: "⚡", title: "Instant feedback", desc: "Know immediately whether your sign was correct — no waiting, no guessing." },
                { icon: "📈", title: "Progress tracking", desc: "XP, streaks, achievements, and leaderboards keep you motivated every day." },
              ].map((step) => (
                <div key={step.title} className="flex items-start gap-6">
                  <div className="w-10 h-10 bg-[#EAE4FF] rounded-lg flex items-center justify-center flex-shrink-0 text-lg">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-[#2D1B69] mb-1">{step.title}</h3>
                    <p className="text-sm text-[#7E7A93]">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#EAE4FF] p-4 rounded-xl">
              <div className="bg-white rounded-lg overflow-hidden shadow-md">
                <Image src="/hero-img.png" alt="Sanjog App Interface" width={500} height={400} className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#FAF7FF] py-8 px-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <Image src="/sanjog-logo.svg" alt="Sanjog Logo" width={120} height={32} className="object-contain mb-4" />
            <p className="text-[#7E7A93] text-sm">Learn sign language with AI-powered gesture recognition.</p>
          </div>
          <div>
            <h3 className="font-bold text-[#2D1B69] mb-4">Learn</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/dashboard/lessons" className="text-[#7E7A93] hover:text-[#7D54FF]">Lessons</Link></li>
              <li><Link href="/dashboard/challenges" className="text-[#7E7A93] hover:text-[#7D54FF]">Challenges</Link></li>
              <li><Link href="/dashboard/community" className="text-[#7E7A93] hover:text-[#7D54FF]">Community</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-[#2D1B69] mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <SignedOut>
                <li>
                  <SignInButton mode="redirect">
                    <button className="text-[#7E7A93] hover:text-[#7D54FF]">Sign In</button>
                  </SignInButton>
                </li>
                <li>
                  <SignUpButton mode="redirect">
                    <button className="text-[#7E7A93] hover:text-[#7D54FF]">Sign Up</button>
                  </SignUpButton>
                </li>
              </SignedOut>
              <SignedIn>
                <li><Link href="/dashboard/profile" className="text-[#7E7A93] hover:text-[#7D54FF]">My Profile</Link></li>
                <li><Link href="/dashboard" className="text-[#7E7A93] hover:text-[#7D54FF]">Dashboard</Link></li>
              </SignedIn>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-200">
          <p className="text-[#7E7A93] text-center text-sm">© {new Date().getFullYear()} Sanjog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
