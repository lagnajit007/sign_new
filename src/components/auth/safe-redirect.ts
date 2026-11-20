/** Only same-site paths are honoured as a post-auth destination (no open redirects). */
export function safeRedirect(value: string | string[] | undefined, fallback = "/dashboard"): string {
  const v = Array.isArray(value) ? value[0] : value;
  if (!v || !v.startsWith("/") || v.startsWith("//") || v.startsWith("/\\")) return fallback;
  return v;
}
