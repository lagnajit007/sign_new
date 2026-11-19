# Environment Setup

Never commit secret values. Configure values in the matching provider dashboards.

## Vercel / Next.js

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk browser key for the same production Clerk instance as the secret key |
| `CLERK_SECRET_KEY` | Yes | Clerk server key; never prefix with `NEXT_PUBLIC_` |
| `DATABASE_URL` | Yes | Supabase pooled Postgres URL for Prisma runtime |
| `DIRECT_URL` | Yes | Direct/session Postgres URL for Prisma migrations |
| `NEXT_PUBLIC_RECOGNITION_API_URL` | Yes | HTTPS URL of deployed recognition backend |
| `NEXT_PUBLIC_APP_URL` | Yes | Canonical deployed frontend URL |

## Recognition backend

| Variable | Required | Purpose |
| --- | --- | --- |
| `FRONTEND_ORIGIN` | Yes in production | Comma-separated exact HTTPS Vercel origins; do not use `*` |
| `MODEL_PATH` | Usually | Absolute deployed path to trusted `model.p` |
| `RATELIMIT_PER_MINUTE` | Yes | Per-IP inference request limit |
| `FLASK_DEBUG` | No | Must remain `false` in production |
| `PORT` | Platform supplied | HTTP listener port |

## External configuration

1. In Clerk, use one production instance, enable the intended email verification method, and add the exact production sign-in/sign-up redirects.
2. In Supabase, keep application tables private from the Data API unless RLS and ownership policies are reviewed and enabled.
3. In Vercel, set every required variable for Production (and Preview only if intended), then trigger a fresh deployment.
4. In the backend host, set the exact Vercel production origin before enabling traffic.