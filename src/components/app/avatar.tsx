import { cn } from "@/lib/utils";

/**
 * Initials avatar. `avatarId` (1–8) picks one of the profile colours the user
 * chooses on the Profile page — no stock photos or placeholder images.
 */
export const AVATAR_COLORS = [
  { id: 1, name: "Violet", bg: "#6d4aff", fg: "#ffffff" },
  { id: 2, name: "Ocean", bg: "#0e7490", fg: "#ffffff" },
  { id: 3, name: "Rose", bg: "#be185d", fg: "#ffffff" },
  { id: 4, name: "Forest", bg: "#15803d", fg: "#ffffff" },
  { id: 5, name: "Amber", bg: "#b45309", fg: "#ffffff" },
  { id: 6, name: "Slate", bg: "#334155", fg: "#ffffff" },
  { id: 7, name: "Indigo", bg: "#4338ca", fg: "#ffffff" },
  { id: 8, name: "Coral", bg: "#c2410c", fg: "#ffffff" },
] as const;

export function initials(name: string | null | undefined): string {
  const clean = (name ?? "").replace(/^@/, "").trim();
  if (!clean) return "?";
  const parts = clean.split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function Avatar({
  name,
  avatarId = 1,
  size = 24,
  className,
}: {
  name: string | null | undefined;
  avatarId?: number | null;
  size?: number;
  className?: string;
}) {
  const color = AVATAR_COLORS.find((c) => c.id === avatarId) ?? AVATAR_COLORS[0];
  return (
    <span
      aria-hidden
      className={cn("inline-grid shrink-0 select-none place-items-center rounded-full font-semibold", className)}
      style={{ width: size, height: size, background: color.bg, color: color.fg, fontSize: Math.max(9, Math.round(size * 0.4)) }}
    >
      {initials(name)}
    </span>
  );
}
