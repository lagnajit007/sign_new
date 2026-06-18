/**
 * Centralised frontend config.
 * Every env-var the app depends on lives here — never scattered across files.
 *
 * ── Required (set in .env.local) ──────────────────────────────────────────
 * NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY  — Clerk publishable key
 * CLERK_SECRET_KEY                   — Clerk secret key (server-only)
 * DATABASE_URL                       — Supabase pooler URL (port 6543, pgbouncer=true)
 * DIRECT_URL                         — Supabase session-mode pooler (port 5432, migrations)
 *
 * ── Optional ──────────────────────────────────────────────────────────────
 * NEXT_PUBLIC_RECOGNITION_API_URL    — Flask backend base URL (default: http://127.0.0.1:5000)
 * NEXT_PUBLIC_APP_URL                — Deployed frontend origin (used for CORS allow-list)
 * NEXT_PUBLIC_CLERK_SIGN_IN_URL      — (default: /sign-in)
 * NEXT_PUBLIC_CLERK_SIGN_UP_URL      — (default: /sign-up)
 * NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL — (default: /dashboard)
 * NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL — (default: /dashboard)
 * NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL — (default: /)
 */

/** Base URL of the Flask sign-recognition backend. */
export const RECOGNITION_API_URL =
  process.env.NEXT_PUBLIC_RECOGNITION_API_URL ?? "http://127.0.0.1:5000";

/** Deployed frontend origin — used when locking CORS on the backend. */
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/** Whether we're in development mode. */
export const IS_DEV = process.env.NODE_ENV === "development";

/** Whether we're in production mode. */
export const IS_PROD = process.env.NODE_ENV === "production";

/**
 * Asserts that a required server-side env var exists.
 * Call during module init for early failure rather than runtime surprises.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/** Daashboard routes that require authentication (redirect target for middleware). */
export const DASHBOARD_ROUTES = [
  '/dashboard',
  '/dashboard/lessons',
  '/dashboard/achievements',
  '/dashboard/challenges',
  '/dashboard/progress',
  '/dashboard/community',
  '/dashboard/profile',
] as const;
