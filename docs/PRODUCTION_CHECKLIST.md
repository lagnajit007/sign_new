# Sanjog production checklist

Updated 2026-11-19. ✅ done in code · 🧑 needs you · ⏳ still open

## P0: Blockers (the app didn't work)

- ✅ Camera allowed: `Permissions-Policy: camera=(self)` (`next.config.ts`)
- ✅ CSP allows the recognition API origin and the TF.js model hosts (tfhub/Kaggle/GCS)
- ✅ Letter predictions no longer return 500. The model's string labels are used directly (`backend/app.py`), with tests
- ✅ Landmarks normalised the same way as in training (divided by the video size, then the min subtracted)
- ✅ `/api/attempts` no longer crashes. Attempts are always saved, and XP only goes to signed results
- ✅ Migration drift fixed: the init migration is restored, and the changes now live in 2 new migrations
- ✅ `/about` is public. The sign-in redirect no longer depends on `NEXT_PUBLIC_APP_URL`
- ✅ The error boundary no longer disables server rendering for the whole app
- 🧑 **The Supabase project in `.env` no longer exists** ("tenant not found"). Create a new free project (DEPLOYMENT.md §1)

## P1: Auth, integrity, correctness

- ✅ XP can't be forged. The backend HMAC-signs each prediction, and the API checks the signature, its age (120 s) and the single-use nonce
- ✅ XP, streak, achievement and challenge writes run in one transaction with atomic increments. Each reward pays out exactly once
- ✅ Per-user rate limit on attempts (20/min), backed by the database so it works on serverless
- ✅ Clerk webhook (`/api/webhooks/clerk`) handles create, update and delete. Lazy creation stays as a fallback
- ✅ A `UserSettings` row is created with each user. Before this, the leaderboard and feed excluded most people
- ✅ One privacy and demo filter (`src/lib/community.ts`) is shared by the API and the server-rendered dashboard
- ✅ Every API route returns JSON errors. Pages show an error state instead of a misleading empty state
- ✅ Duplicate username returns 409
- ✅ Backend: TensorFlow removed (the image is about 2 GB smaller), gunicorn and flask-cors CVE versions bumped, gthread workers, ProxyFix, JSON errors, 16 KB body limit, per-IP limit instead of one global throttle
- ✅ Client sends at most 1 request at a time with no retry storms, detects camera errors by `err.name`, and shows a "waking up" state for the free host
- ✅ `vercel-build` runs `prisma migrate deploy`
- 🧑 Create the Hugging Face Space and set its secrets (DEPLOYMENT.md §2)
- 🧑 Add the Clerk webhook and its secret (DEPLOYMENT.md §3)
- 🧑 Set the Vercel env vars, then redeploy (DEPLOYMENT.md §4)
- 🧑 Shut down the old Railway service so it stops billing

## P2: No fake data

- ✅ Landing: removed "98% accurate", "+2,450 XP", "thousands of learners", the "~94%" claim and the fake "Watch Demo" button
- ✅ Landing: the "Camera feed placeholder" is replaced by an animated hand-landmark illustration, labelled "Illustration"
- ✅ Landing: placeholder team and stats sections deleted. Privacy FAQ now accurate (landmarks are sent, video is not)
- ✅ Random pass/fail "Letter A" lesson deleted. Every sign links to the real practice engine (`?set=&sign=`)
- ✅ Dashboard: no fake bell badge, no "~5 min remaining". The daily goal counts today only, and "signs mastered" is real
- ✅ Progress: the week/month/year control really queries the data. Weak signs shown, real `correct` field used
- ✅ Challenges are computed from real practice per UTC period, with a real time left. Achievements that couldn't be earned are removed
- ✅ Avatars are initials on a chosen colour (no repeated stock image). Unlock text that didn't match the logic is gone
- ✅ Settings only show options that actually work: theme, text size, reduced motion, privacy. Email and sound toggles are removed
- ✅ Catalog colours are stored as hex and rendered inline. Tailwind class strings in the database never generated CSS
- ✅ 8 seeded **demo learners**, each with a "Demo" badge everywhere. Hidden with `SHOW_DEMO_USERS=false`. Real users rank alongside them by real XP

## UI

- ✅ Tailwind v4, ObsidianUI Dashboard Shell (MIT): resizable sidebar, mobile drawer, grouped navigation, saved width
- ✅ Neutral token system (`bg-panel`, `text-fg`, `border-line` …) with one violet accent. Light, dark and system themes
- ✅ Rebuilt Overview, Lessons, Progress, Challenges, Achievements, Leaderboard (new, sortable), Activity, Profile and Settings
- ✅ The landing page is server-rendered, so there's no full-screen loader before content
- ⏳ Practice screen: recoloured to the new tokens but not re-laid out. Visually check it once the database is up
- ⏳ Run the design audit on the signed-in screens once the database is up (they can't render without one)

## P3: Hygiene

- ✅ Dead code removed: about 25 unused components and utilities, debug page, clear-session route, global preloader (it added a forced 1 s overlay)
- ✅ `.kilo/` gitignored. `.env.example` committed. Lint script fixed (0 errors). CI workflow added
- ✅ DEPLOYMENT.md rewritten for the free stack
- ⏳ Remove unused dependencies (styled-components, emotion, headlessui, chart.js, gsap, framer-motion duplicate) after a visual pass
- ⏳ **Sign reference images or videos.** Lessons show the letter but not how to form the hand shape. This needs real licensed media; do not generate it
- ⏳ Error monitoring (e.g. Sentry free tier) if you want to know about production errors
