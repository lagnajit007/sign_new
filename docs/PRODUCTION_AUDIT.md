# Sanjog Production Audit

Audit date: 2026-10-22

## Critical

| Finding | Root cause | Affected files | Status / verification |
| --- | --- | --- | --- |
| Build quality checks could be bypassed | `next.config.ts` set `ignoreDuringBuilds` and `ignoreBuildErrors` | `next.config.ts` | Fixed. `npx tsc --noEmit` now passes with checks enabled. Full `next build` starts but completion could not be captured in this execution environment. |
| Production could boot with a fake Clerk key | Fallback key was injected into both Next config and root layout | `next.config.ts`, `src/app/layout.tsx`, `src/middleware.ts` | Fixed. A real publishable key is required; protected routes return 503 if Clerk is not configured. |
| Cross-origin recognition API access was effectively unrestricted | Backend CORS callback returned `True` even for unrecognised origins | `backend/app.py` | Open. Must replace permissive callback with strict `FRONTEND_ORIGIN` allow-list and deploy/retest. |
| Recognition may present mock/fallback behavior | Hook sets `isMockMode`; `handGestureService` documents mock predictions | `src/hooks/useHandTrackingFixed.ts`, `src/utils/handGestureService.ts` | Open. Release must not expose simulated recognition as real feedback. |

## High

| Finding | Root cause | Affected files | Status / verification |
| --- | --- | --- | --- |
| Dashboard did not type-check | Query result variables were typed without included relation data; nullable profile name was rejected | `src/app/dashboard/page.tsx`, `src/components/dashboard/LeaderboardPreview.tsx` | Fixed. `npx tsc --noEmit` passes. |
| Settings optimistic update hides failed saves | Client ignores `PATCH` status/error; API accepts values without runtime validation | `src/app/dashboard/settings/page.tsx`, `src/app/api/settings/route.ts` | Open. Must validate field types/ranges server-side and roll back client state on failure. |
| Profile endpoint accepts unvalidated arbitrary values for allowed fields | Whitelist only; no type, length, format, or uniqueness validation | `src/app/api/me/route.ts` | Open. |
| Attempts endpoint trusts client supplied correctness and confidence | No sign-label allow-list, numeric range, or server-side recognition attestation | `src/app/api/attempts/route.ts` | Open. This permits XP/progress manipulation. |
| Community/leaderboard privacy incomplete | Leaderboard does not filter `showLeaderboard`; community feed does not honor `profileVisibility` | API routes and schema | Open. |

## Deployment blockers

- Clerk dashboard configuration and multi-provider email verification cannot be verified from this repository. Test two new email domains and capture Clerk error codes.
- No automated test framework or test script is configured.
- The production recognition service URL, model health, CORS environment, and latency cannot be verified without deployment access and a camera-capable browser.
- Supabase RLS/policies cannot be inspected without the Supabase project connection. Prisma alone does not prove Data API isolation.
- Next reports a parent `C:\Users\USER\package-lock.json`; configure `outputFileTracingRoot` or remove the unrelated lockfile after confirming ownership.