# Deployment guide (free tier)

Sanjog runs on three free services:

| Piece | Service | Notes |
| --- | --- | --- |
| Web app (Next.js) | **Vercel** Hobby | `vercel-build` runs `prisma migrate deploy` before `next build` |
| Database | **Supabase** Free | Pauses after ~7 days without traffic; resume it from the dashboard |
| Auth | **Clerk** Free | Webhook keeps the `User` table in sync |

How a lesson works: the browser tracks the hand with TF.js and turns 21 landmarks into 42 numbers. The trained sign model (`src/lib/recognizer`, exported from `backend/models/model.p`) runs right in the browser for instant feedback. When a sign is completed, the browser sends those 42 numbers to `/api/attempts`, which runs the same model on the server, then saves the attempt and awards XP. The client never sends a verdict, so XP can't be faked. Video never leaves the browser, and there is no separate recognition server to host.

---

## 1. Supabase

1. Create a project at supabase.com (Free plan) and choose a region close to your users.
2. Go to **Connect → ORMs → Prisma** and copy:
   - `DATABASE_URL`: the transaction pooler, port **6543**. Append `?pgbouncer=true&connection_limit=5&pool_timeout=20`.
   - `DIRECT_URL`: the session pooler, port **5432**.
3. Put both in `.env.local`, then run:

```bash
npx prisma migrate deploy
```

```bash
npm run db:seed
```

The seed creates the achievement and challenge catalogs, plus 8 **demo learners** (`isDemo = true`, labelled "Demo" in the UI). Re-run the seed any time to refresh their dates. Set `SEED_DEMO_USERS=false` to skip them, and `SHOW_DEMO_USERS=false` on Vercel to hide them.

## 2. Clerk

1. Create an application and copy the publishable and secret keys.
2. Under **Webhooks → Add endpoint**, set the URL to `https://<your-app>.vercel.app/api/webhooks/clerk` and subscribe to `user.created`, `user.updated` and `user.deleted`. Copy the signing secret.
3. Before real launch, switch to a **production** Clerk instance. Production keys start with `pk_live_` / `sk_live_` and need your own domain.
4. **Sign-in methods** (Configure → User & authentication). The app's own sign-in and sign-up pages support exactly these, so the instance must match:
   - **Email:** on, required, verified with an email code; sign-in with email.
   - **Password:** on.
   - **Phone number** and **Username:** off. If either is required, sign-up gets stuck asking for it.
   - **SSO connections:** Google and LinkedIn (OIDC) on for sign-up and sign-in; nothing else.
5. **Google and LinkedIn in production.** The development instance uses Clerk's shared OAuth credentials. A production instance needs your own:
   - Google: create an OAuth client (Web application) in Google Cloud Console and paste the client ID and secret into Clerk's Google connection. Add the redirect URI Clerk shows there.
   - LinkedIn: create an app at linkedin.com/developers, add the "Sign In with LinkedIn using OpenID Connect" product, and paste its client ID and secret into Clerk's LinkedIn connection, with the redirect URI Clerk shows.

## 3. Vercel

Import the repo and set these environment variables (see `.env.example`):

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | From Clerk |
| `CLERK_WEBHOOK_SIGNING_SECRET` | From the Clerk webhook |
| `DATABASE_URL`, `DIRECT_URL` | From Supabase |
| `NEXT_PUBLIC_APP_URL` | `https://<your-app>.vercel.app` |
| `SANJOG_SCORING_ENABLED` | `true` (or `false` to pause XP while still saving practice) |
| `SHOW_DEMO_USERS` | `true` (switch to `false` once you have real users) |

`vercel.json` pins the server functions to Tokyo (`hnd1`), next to the Supabase database. If you create the database in another region, change this to the nearest Vercel region.

## 4. Smoke test after deploy

- `/` loads signed out, and `/dashboard` redirects to sign-in.
- Sign up. Your row appears in Supabase `User` (webhook), with a `UserSettings` row.
- Open **Practice**, allow the camera, and confirm there are no CSP errors in the console. The hand model takes a few seconds to download the first time.
- Sign a letter. The attempt is saved, XP increases, and you appear on the leaderboard next to the Demo learners.

## Local development

```bash
cp .env.example .env.local
```

```bash
npm install && npm run dev
```

## Retraining the sign model

`backend/` holds the Python side: the trained model (`models/model.p`), a Flask reference server and its tests. After retraining, export the new weights for the web app and check they match:

```bash
npm run export:model
```

```bash
npm run test:model
```

To run the tests:

```bash
npm run typecheck && npm run lint && npm run test:model && npm run test:backend
```
