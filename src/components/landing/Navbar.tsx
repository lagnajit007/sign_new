"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"

const navLinks = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#features", label: "Features" },
  { href: "#story", label: "Our Story" },
  { href: "#faq", label: "FAQ" },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/sanjog-logo.svg" alt="Sanjog" width={110} height={36} className="object-contain" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-ink-soft hover:text-brand text-sm font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
            <SignedOut>
              <SignInButton mode="redirect">
                <button className="px-4 py-2 text-brand border border-brand rounded-full text-sm font-medium hover:bg-bg transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="redirect">
                <button className="px-5 py-2 bg-brand text-white rounded-full text-sm font-semibold hover:bg-brand-dark transition-all hover:scale-[1.02] active:scale-[0.98] shadow-btn">
                  Start Free
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="px-5 py-2 bg-brand text-white rounded-full text-sm font-semibold hover:bg-brand-dark transition-all"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </nav>

          <button
            className="md:hidden p-2 text-ink"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-brand-soft px-4 py-6 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block text-ink-soft hover:text-brand text-sm font-medium"
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-3 pt-2">
            <SignedOut>
              <SignInButton mode="redirect">
                <button className="flex-1 px-4 py-2 text-brand border border-brand rounded-full text-sm font-medium">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="redirect">
                <button className="flex-1 px-4 py-2 bg-brand text-white rounded-full text-sm font-semibold">
                  Start Free
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="flex-1 px-4 py-2 bg-brand text-white rounded-full text-sm font-semibold text-center"
              >
                Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
      )}
    </header>
  )
}
