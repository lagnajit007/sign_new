"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { MotionConfig } from "motion/react";
import { useTheme } from "next-themes";
import {
  Award,
  BookOpen,
  Hand,
  LayoutDashboard,
  LineChart,
  Moon,
  Settings,
  Sun,
  Target,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import {
  DashboardButton,
  DashboardShell,
  type DashboardShellNavItem,
  type DashboardShellNavSection,
} from "@/components/block/dashboard-shell";
import { useApi } from "@/hooks/use-api";
import { ProgressBar } from "@/components/app/primitives";
import { Flame } from "@/components/art/flame";

const NAVIGATION: DashboardShellNavSection[] = [
  {
    id: "learn",
    title: "Learn",
    items: [
      { id: "/dashboard", label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
      { id: "/dashboard/lessons", label: "Lessons", icon: BookOpen, href: "/dashboard/lessons" },
      { id: "/dashboard/lessons/interactive", label: "Practice", icon: Hand, href: "/dashboard/lessons/interactive" },
    ],
  },
  {
    id: "progress",
    title: "Progress",
    items: [
      { id: "/dashboard/progress", label: "Progress", icon: LineChart, href: "/dashboard/progress" },
      { id: "/dashboard/challenges", label: "Challenges", icon: Target, href: "/dashboard/challenges" },
      { id: "/dashboard/achievements", label: "Achievements", icon: Award, href: "/dashboard/achievements" },
    ],
  },
  {
    id: "community",
    title: "Community",
    items: [
      { id: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy, href: "/dashboard/leaderboard" },
      { id: "/dashboard/community", label: "Activity", icon: Users, href: "/dashboard/community" },
    ],
  },
];

const SECONDARY: DashboardShellNavItem[] = [
  { id: "/dashboard/profile", label: "Profile", icon: UserRound, href: "/dashboard/profile" },
  { id: "/dashboard/settings", label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

const ALL_ITEMS = [...NAVIGATION.flatMap((s) => s.items), ...SECONDARY];

/** Longest href prefix wins, so /dashboard/lessons/interactive → Practice. */
function activeItemFor(pathname: string): DashboardShellNavItem | undefined {
  return ALL_ITEMS.filter((i) => i.href && (pathname === i.href || pathname.startsWith(`${i.href}/`))).sort(
    (a, b) => (b.href?.length ?? 0) - (a.href?.length ?? 0),
  )[0];
}

interface Me {
  name: string | null;
  xp: number;
  level: number;
  levelFloorXp: number;
  nextLevelXp: number;
  streakDays: number;
}

interface Prefs {
  reducedMotion: boolean;
  fontScale: number;
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === "dark";
  return (
    <DashboardButton
      variant="ghost"
      size="icon"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </DashboardButton>
  );
}

function LevelCard({ me, failed }: { me: Me | null; failed: boolean }) {
  if (failed && !me) return null;
  if (!me) return <div className="h-[74px] animate-pulse rounded-lg bg-(--obsidian-dashboard-shell-muted)" />;
  const span = Math.max(1, me.nextLevelXp - me.levelFloorXp);
  const pct = ((me.xp - me.levelFloorXp) / span) * 100;
  return (
    <Link
      href="/dashboard/progress"
      className="block rounded-lg border border-(--obsidian-dashboard-shell-border) p-3 text-[12px] transition-colors hover:bg-(--obsidian-dashboard-shell-hover)"
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-(--obsidian-dashboard-shell-foreground)">Level {me.level}</span>
        <span className="flex items-center gap-1 text-(--obsidian-dashboard-shell-text-muted)">
          <Flame size={11} animated={me.streakDays > 0} dim={me.streakDays === 0} />
          {me.streakDays} day{me.streakDays === 1 ? "" : "s"}
        </span>
      </div>
      <ProgressBar value={pct} className="mt-2" label="Progress to next level" />
      <div className="mt-1.5 tabular-nums text-(--obsidian-dashboard-shell-text-subtle)">
        {me.xp.toLocaleString()} / {me.nextLevelXp.toLocaleString()} XP
      </div>
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const active = activeItemFor(pathname);
  const me = useApi<Me>("/api/me");
  const prefs = useApi<Prefs>("/api/settings");

  // Client pages can't export metadata; keep the tab title in sync here.
  useEffect(() => {
    document.title = `${active?.label ?? "Dashboard"} · Sanjog`;
  }, [active?.label]);

  // Settings page broadcasts saves so preferences apply without a reload.
  const reloadPrefs = prefs.reload;
  useEffect(() => {
    window.addEventListener("sanjog:settings", reloadPrefs);
    return () => window.removeEventListener("sanjog:settings", reloadPrefs);
  }, [reloadPrefs]);

  // Apply saved accessibility preferences.
  useEffect(() => {
    const root = document.documentElement;
    const scale = prefs.data?.fontScale ?? 100;
    if (scale !== 100) {
      root.dataset.fontScale = String(scale);
      root.style.setProperty("--sj-font-scale", String(scale / 100));
    } else {
      delete root.dataset.fontScale;
      root.style.removeProperty("--sj-font-scale");
    }
  }, [prefs.data?.fontScale]);

  // Persist sidebar width between visits.
  const [sidebarWidth, setSidebarWidth] = useState(220);
  useEffect(() => {
    const saved = Number(localStorage.getItem("sanjog:sidebar-width"));
    if (saved >= 180 && saved <= 400) setSidebarWidth(saved);
  }, []);

  const brand = useMemo(
    () => ({
      name: "Sanjog",
      logo: <Image src="/S-logo.svg" alt="" width={20} height={20} className="size-5 dark:invert" />,
    }),
    [],
  );

  return (
    <MotionConfig reducedMotion={prefs.data?.reducedMotion ? "always" : "user"}>
      <div className="h-dvh bg-canvas">
        <DashboardShell
          brand={brand}
          navigation={NAVIGATION}
          secondaryNavigation={SECONDARY}
          activeItemId={active?.id}
          linkComponent={Link}
          title={active?.label ?? "Dashboard"}
          headerActions={
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <div className="ml-1 flex items-center">
                <UserButton appearance={{ elements: { avatarBox: "size-7" } }} />
              </div>
            </div>
          }
          sidebarFooter={<LevelCard me={me.data} failed={Boolean(me.error)} />}
          sidebarWidth={sidebarWidth}
          onSidebarWidthChange={(w) => {
            setSidebarWidth(w);
            localStorage.setItem("sanjog:sidebar-width", String(w));
          }}
          navigationLabel="Main"
        >
          {children}
        </DashboardShell>
      </div>
    </MotionConfig>
  );
}
