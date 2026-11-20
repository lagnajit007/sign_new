import Link from "next/link";
import Image from "next/image";

const PRODUCT = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#faq", label: "Questions" },
];
const COMPANY = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/sign-in", label: "Sign in" },
];

function Column({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-[13px] text-fg-subtle">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="rounded text-[14px] text-fg-muted transition-colors duration-200 hover:text-fg">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="mk-frame">
      <div className="grid gap-10 px-5 py-14 sm:px-10 md:grid-cols-[1.6fr_1fr_1fr] lg:px-14">
        <div className="max-w-xs">
          <Link href="/" className="flex w-fit items-center gap-2 rounded-lg" aria-label="Sanjog home">
            <Image src="/S-logo.svg" alt="" width={20} height={20} className="dark:invert" />
            <span className="text-[15px] font-medium text-fg">Sanjog</span>
          </Link>
          <p className="mt-3 text-[14px] leading-relaxed text-fg-subtle">
            Practise the sign language alphabet and numbers with live feedback from your webcam.
          </p>
        </div>
        <Column title="Product" links={PRODUCT} />
        <Column title="Company" links={COMPANY} />
      </div>
      <div className="flex items-center justify-between border-t border-[var(--mk-rule)] px-5 py-6 text-[13px] text-fg-subtle sm:px-10 lg:px-14">
        <span>© {new Date().getFullYear()} Sanjog</span>
        <span>Video never leaves your device</span>
      </div>
    </footer>
  );
}
