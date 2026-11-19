import Link from "next/link";
import Image from "next/image";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/sign-in", label: "Sign in" },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line px-4 sm:px-6">
      <div className="mx-auto flex max-w-[1080px] flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between">
        <div className="max-w-sm">
          <Link href="/" className="flex items-center gap-2 rounded-lg" aria-label="Sanjog home">
            <Image src="/S-logo.svg" alt="" width={20} height={20} className="dark:invert" />
            <span className="text-sm font-semibold text-fg">Sanjog</span>
          </Link>
          <p className="mt-2 text-sm text-fg-subtle">Practise the sign language alphabet and numbers with live feedback from your webcam.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="rounded text-sm text-fg-muted transition-colors hover:text-fg">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mx-auto max-w-[1080px] pb-10 text-xs text-fg-subtle">© {new Date().getFullYear()} Sanjog</div>
    </footer>
  );
}
