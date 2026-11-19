/** Centralised frontend configuration. */
export const IS_DEV = process.env.NODE_ENV === "development";
export const IS_PROD = process.env.NODE_ENV === "production";

const recognitionApiUrl = process.env.NEXT_PUBLIC_RECOGNITION_API_URL;
/**
 * Local development may use the Flask default. Production deliberately has no
 * localhost fallback: the lesson screen surfaces a service-unavailable state
 * until NEXT_PUBLIC_RECOGNITION_API_URL is configured.
 */
export const RECOGNITION_API_URL = recognitionApiUrl ?? (IS_DEV ? "http://127.0.0.1:7860" : "");
export const RECOGNITION_API_CONFIGURED = Boolean(recognitionApiUrl) || IS_DEV;

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? (IS_DEV ? "http://localhost:3000" : "");

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const DASHBOARD_ROUTES = [
  '/dashboard', '/dashboard/lessons', '/dashboard/achievements',
  '/dashboard/challenges', '/dashboard/progress', '/dashboard/community', '/dashboard/profile',
] as const;