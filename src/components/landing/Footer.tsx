"use client"

import Link from "next/link"
import Image from "next/image"
import { SignedOut, SignedIn, SignInButton, SignUpButton } from "@clerk/nextjs"

const footerLinks = {
  learn: [
    { label: "Lessons", href: "/dashboard/lessons" },
    { label: "Challenges", href: "/dashboard/challenges" },
    { label: "Community", href: "/dashboard/community" },
    { label: "Progress", href: "/dashboard/progress" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Our Story", href: "/#story" },
    { label: "Meet the Team", href: "/#team" },
    { label: "FAQ", href: "/#faq" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-white border-t border-brand-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Image src="/sanjog-logo.svg" alt="Sanjog" width={110} height={36} className="object-contain mb-4" />
            <p className="text-ink-soft text-sm leading-relaxed max-w-xs">
              AI-powered sign language learning platform. Learn at your own pace with real-time feedback.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-ink mb-4">Learn</h3>
            <ul className="space-y-3">
              {footerLinks.learn.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-ink-soft hover:text-brand transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-ink mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-ink-soft hover:text-brand transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-ink mb-4">Account</h3>
            <ul className="space-y-3">
              <SignedOut>
                <li>
                  <SignInButton mode="redirect">
                    <button className="text-sm text-ink-soft hover:text-brand transition-colors">Sign In</button>
                  </SignInButton>
                </li>
                <li>
                  <SignUpButton mode="redirect">
                    <button className="text-sm text-ink-soft hover:text-brand transition-colors">Sign Up</button>
                  </SignUpButton>
                </li>
              </SignedOut>
              <SignedIn>
                <li>
                  <Link href="/dashboard" className="text-sm text-ink-soft hover:text-brand transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/profile" className="text-sm text-ink-soft hover:text-brand transition-colors">
                    Profile
                  </Link>
                </li>
              </SignedIn>
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-ink-soft hover:text-brand transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-brand-soft flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-soft">
            &copy; {new Date().getFullYear()} Sanjog. All rights reserved.
          </p>
          <p className="text-xs text-ink-soft">
            Built with care for accessible communication.
          </p>
        </div>
      </div>
    </footer>
  )
}
