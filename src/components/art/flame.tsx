"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Layered streak flame: an outer tongue, a hot middle and a pale core, each
 * with its own gradient and a slightly offset flicker. The flicker uses
 * transform only and stops under prefers-reduced-motion (see globals.css).
 */
export function Flame({
  size = 16,
  animated = true,
  dim = false,
  className,
  title,
}: {
  size?: number;
  animated?: boolean;
  /** Greyed-out flame for a zero-day streak. */
  dim?: boolean;
  className?: string;
  title?: string;
}) {
  const id = useId().replace(/:/g, "");
  const outer = `${id}-outer`;
  const mid = `${id}-mid`;
  const core = `${id}-core`;

  return (
    <svg
      viewBox="0 0 64 80"
      width={size}
      height={(size * 80) / 64}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      className={cn("shrink-0 overflow-visible", dim && "opacity-40 grayscale", className)}
    >
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id={outer} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff9a4a" />
          <stop offset="55%" stopColor="#f5591f" />
          <stop offset="100%" stopColor="#d6331c" />
        </linearGradient>
        <linearGradient id={mid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffc35a" />
          <stop offset="100%" stopColor="#ff7a1f" />
        </linearGradient>
        <radialGradient id={core} cx="50%" cy="70%" r="60%">
          <stop offset="0%" stopColor="#fffbe8" />
          <stop offset="60%" stopColor="#ffe08a" />
          <stop offset="100%" stopColor="#ffc24d" />
        </radialGradient>
      </defs>

      <g className={animated ? "sj-flame-outer" : undefined}>
        <path
          fill={`url(#${outer})`}
          d="M32 3c3.6 11.4 17 19.6 19.6 36.6C54.2 57 44.6 75.4 32 77 18.6 75.6 9.6 64.6 11.4 48.4c1.1-10 7.6-15.6 10-24.2 3.5 5.6 3.9 10.6 7.6 13.4C28.6 25.4 27.4 13.8 32 3Z"
        />
      </g>
      <g className={animated ? "sj-flame-mid" : undefined}>
        <path
          fill={`url(#${mid})`}
          d="M33.2 25.5c2.9 8.2 11.2 13.8 11.2 26.2 0 12.2-6.2 18.6-12.4 18.6-7.2 0-12.2-6.1-11.2-15.2.8-7 5.6-9.8 6.8-14.8 1.8 3.8 2.8 6.6 5 7.8.9-8.1-1.1-14.6.6-22.6Z"
        />
      </g>
      <g className={animated ? "sj-flame-core" : undefined}>
        <path
          fill={`url(#${core})`}
          d="M32.2 45.5c2.7 5.4 6.1 9.2 6.1 15.4 0 5.2-2.9 8.6-6.3 8.6-4 0-6.3-3.2-6.3-7.2 0-5.4 4.4-8.6 6.5-16.8Z"
        />
      </g>
    </svg>
  );
}
