"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#faq", label: "FAQ" },
  { href: "/about", label: "About" },
];

/** Signed-in visitors are redirected to /dashboard server-side, so this is the signed-out nav. */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-200",
        scrolled || open ? "border-line bg-canvas/85 backdrop-blur-md" : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 rounded-lg" aria-label="Sanjog home">
          <Image src="/S-logo.svg" alt="" width={22} height={22} className="dark:invert" />
          <span className="text-[15px] font-semibold tracking-tight text-fg">Sanjog</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="rounded-lg px-3 py-1.5 text-sm text-fg-muted transition-colors hover:bg-subtle hover:text-fg">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/sign-in" className="rounded-lg px-3 py-1.5 text-sm font-medium text-fg-muted transition-colors hover:text-fg">
            Sign in
          </Link>
          <Link href="/sign-up" className="rounded-lg bg-brand px-3.5 py-1.5 text-sm font-medium text-brand-fg transition-colors hover:bg-brand-hover">
            Start free
          </Link>
        </div>

        <button
          className="grid size-9 place-items-center rounded-lg text-fg hover:bg-subtle md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-line px-4 pb-5 pt-3 md:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-2 py-2.5 text-[15px] text-fg-muted hover:bg-subtle hover:text-fg">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link href="/sign-in" className="rounded-lg border border-line px-3 py-2 text-center text-sm font-medium text-fg">
              Sign in
            </Link>
            <Link href="/sign-up" className="rounded-lg bg-brand px-3 py-2 text-center text-sm font-medium text-brand-fg">
              Start free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
