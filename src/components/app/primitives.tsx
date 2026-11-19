import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/* Small, server-safe building blocks for app screens. They use the Sanjog
   token utilities (bg-panel, text-fg, border-line …) defined in globals.css,
   so every screen follows light/dark mode automatically. */

export function PageBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-4 py-5 sm:px-6 sm:py-6", className)} {...props} />;
}

export function Panel({
  title,
  description,
  action,
  className,
  bodyClassName,
  children,
  as: Tag = "section",
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children?: ReactNode;
  as?: "section" | "div" | "article";
}) {
  return (
    <Tag className={cn("min-w-0 animate-sj-enter rounded-xl border border-line bg-panel", className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0">
            {title && <h2 className="truncate text-[13px] font-semibold text-fg">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-fg-subtle">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </Tag>
  );
}

export function Stat({
  label,
  value,
  hint,
  icon,
  trend,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  trend?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 animate-sj-enter flex-col justify-between gap-3 rounded-xl border border-line bg-panel p-4">
      <div className="flex items-center justify-between gap-2 text-xs text-fg-muted">
        <span className="flex items-center gap-1.5 truncate">
          {icon && <span className="text-fg-subtle [&_svg]:size-3.5">{icon}</span>}
          {label}
        </span>
        {trend}
      </div>
      <div>
        <div className="font-display text-2xl font-semibold tabular-nums tracking-tight text-fg">{value}</div>
        {hint && <div className="mt-1 truncate text-xs text-fg-subtle">{hint}</div>}
      </div>
    </div>
  );
}

type Tone = "neutral" | "brand" | "positive" | "caution" | "negative";
const toneClass: Record<Tone, string> = {
  neutral: "bg-subtle text-fg-muted",
  brand: "bg-brand-tint text-brand",
  positive: "bg-positive-tint text-positive",
  caution: "bg-caution-tint text-caution",
  negative: "bg-negative-tint text-negative",
};

export function Badge({ tone = "neutral", className, ...props }: ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1 rounded-md px-1.5 text-[11px] font-medium leading-none",
        toneClass[tone],
        className,
      )}
      {...props}
    />
  );
}

/** Marks seeded sample learners so they're never mistaken for real people. */
export function DemoBadge() {
  return (
    <Badge tone="neutral" title="Sample learner shown until more people join">
      Demo
    </Badge>
  );
}

export function ProgressBar({ value, className, label }: { value: number; className?: string; label?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-subtle", className)}
    >
      {/* scaleX instead of width: compositor-only, no layout per frame */}
      <div
        className="h-full origin-left rounded-full bg-brand transition-transform duration-500"
        style={{ transform: `scaleX(${pct / 100})` }}
      />
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 px-6 py-10 text-center", className)}>
      {icon && <div className="mb-1 grid size-9 place-items-center rounded-lg bg-subtle text-fg-subtle [&_svg]:size-4">{icon}</div>}
      <p className="text-sm font-medium text-fg">{title}</p>
      {description && <p className="max-w-sm text-xs leading-relaxed text-fg-subtle">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-2 px-6 py-10 text-center">
      <p className="text-sm font-medium text-fg">Couldn&apos;t load this</p>
      <p className="max-w-sm text-xs text-fg-subtle">{message ?? "Something went wrong. Check your connection and try again."}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 h-8 rounded-lg border border-line bg-panel px-3 text-xs font-medium text-fg hover:bg-subtle">
          Try again
        </button>
      )}
    </div>
  );
}

const buttonBase =
  "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5";
const buttonVariant = {
  primary: "bg-brand text-brand-fg hover:bg-brand-hover",
  secondary: "border border-line bg-panel text-fg hover:bg-subtle",
  ghost: "text-fg-muted hover:bg-subtle hover:text-fg",
};

export function Button({
  variant = "secondary",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof buttonVariant }) {
  return <button type="button" className={cn(buttonBase, buttonVariant[variant], className)} {...props} />;
}

export function ButtonLink({
  variant = "secondary",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: keyof typeof buttonVariant }) {
  return <Link className={cn(buttonBase, buttonVariant[variant], className)} {...props} />;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-subtle", className)} />;
}

/** Relative time like "5m ago", stable on server and client for a given `now`. */
export function timeAgo(date: string | Date, now: number = Date.now()): string {
  const s = Math.max(0, Math.round((now - new Date(date).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
