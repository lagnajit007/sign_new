# Deployment guide (free tier)

Sanjog runs on four free services:

| Piece | Service | Notes |
| --- | --- | --- |
| Web app (Next.js) | **Vercel** Hobby | `vercel-build` runs `prisma migrate deploy` before `next build` |
| Database | **Supabase** Free | Pauses after ~7 days without traffic; resume it from the dashboard |
| Auth | **Clerk** Free | Webhook keeps the `User` table in sync |
| Recognition API (Flask) | **Hugging Face Spaces** (Docker, free CPU) | Sleeps when idle; the lesson screen shows a "waking up" banner |

How a lesson works: the browser tracks the hand with TF.js and normalises 21 landmarks into 42 numbers, then calls the Space's `/predict`. The Space returns an HMAC-signed prediction. The browser forwards it to `/api/attempts`, which checks the signature, then saves the attempt and awards XP. Video never leaves the browser.

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

## 2. Recognition API on Hugging Face Spaces

1. Create a free account, then **New Space**: SDK **Docker**, hardware **CPU basic (free)**, name e.g. `sanjog-recognition`.
2. Push the contents of `backend/` to the Space repo. `backend/README.md` already has the Space header (`sdk: docker`, `app_port: 7860`).

```bash
git clone https://huggingface.co/spaces/<user>/sanjog-recognition hf-space
```

   Copy `backend/app.py`, `backend/Dockerfile`, `backend/requirements.txt`, `backend/README.md`, `backend/.dockerignore` and `backend/models/model.p` into it, then commit and push. The model file is under 1 MB, so Git LFS is not needed.
3. Under **Settings → Variables and secrets**, add these secrets:
   - `FRONTEND_ORIGIN`: `https://<your-app>.vercel.app`, plus `,http://localhost:3000` if you also develop against this Space.
   - `RECOGNITION_SIGNING_SECRET`: a random 64-character hex string, the same value you use on Vercel.
4. When the build finishes, open `https://<user>-sanjog-recognition.hf.space/`. It should return `{"status":"healthy","model_loaded":true}`.

## 3. Clerk

1. Create an application and copy the publishable and secret keys.
2. Under **Webhooks → Add endpoint**, set the URL to `https://<your-app>.vercel.app/api/webhooks/clerk` and subscribe to `user.created`, `user.updated` and `user.deleted`. Copy the signing secret.
3. Before real launch, switch to a **production** Clerk instance. Production keys start with `pk_live_` / `sk_live_` and need your own domain.

## 4. Vercel

Import the repo and set these environment variables (see `.env.example`):

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | From Clerk |
| `CLERK_WEBHOOK_SIGNING_SECRET` | From the Clerk webhook |
| `DATABASE_URL`, `DIRECT_URL` | From Supabase |
| `NEXT_PUBLIC_APP_URL` | `https://<your-app>.vercel.app` |
| `NEXT_PUBLIC_RECOGNITION_API_URL` | `https://<user>-sanjog-recognition.hf.space` |
| `RECOGNITION_SIGNING_SECRET` | Same value as the Space secret |
| `SANJOG_SCORING_ENABLED` | `true` |
| `SHOW_DEMO_USERS` | `true` (switch to `false` once you have real users) |

`NEXT_PUBLIC_RECOGNITION_API_URL` is read at **build time**: it is baked into the client and the CSP. Redeploy after changing it.

## 5. Smoke test after deploy

- `/` loads signed out, and `/dashboard` redirects to sign-in.
- Sign up. Your row appears in Supabase `User` (webhook), with a `UserSettings` row.
- Open **Practice**, allow the camera, and confirm there are no CSP errors in the console. The "waking up" banner clears within about a minute.
- Sign a letter. The attempt is saved, XP increases, and you appear on the leaderboard next to the Demo learners.

## Local development

```bash
cp .env.example .env.local
```

```bash
npm install && npm run dev
```

In a second terminal, run the recognition API on port 7860:

```bash
cd backend && python -m venv venv && venv/Scripts/pip install -r requirements.txt && venv/Scripts/python app.py
```

To run the tests:

```bash
npm run typecheck && npm run lint && npm run test:backend
```
