# Deployment Guide

Deploying **Sanjog** involves two services:
- **Frontend** (Next.js) → **Vercel**
- **Backend** (Flask) → **Railway**

---

## 1. Prerequisites

| Service | Account Needed |
|---------|----------------|
| Clerk   | [clerk.com](https://dashboard.clerk.com) — API keys |
| Supabase | [supabase.com](https://supabase.com) — Postgres connection strings |
| Vercel  | [vercel.com](https://vercel.com) — frontend hosting |
| Railway | [railway.app](https://railway.app) — backend hosting |

---

## 2. Environment Variables

### Frontend (Vercel)

Set these in **Vercel Dashboard → Your Project → Settings → Environment Variables**:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `DATABASE_URL` | Yes | Supabase pooler URL (port 6543, `pgbouncer=true`) |
| `DIRECT_URL` | Yes | Supabase session URL (port 5432, for migrations) |
| `NEXT_PUBLIC_RECOGNITION_API_URL` | No | Deployed backend URL (e.g. `https://sanjog-backend.up.railway.app`) |
| `NEXT_PUBLIC_APP_URL` | No | Deployed frontend URL (e.g. `https://sanjog.vercel.app`) |

### Backend (Railway)

Set these in **Railway Dashboard → Your Project → Variables**:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | Listen port |
| `FRONTEND_ORIGIN` | No | `http://localhost:3000` | Frontend origin for CORS (set to your Vercel URL) |
| `RATELIMIT_PER_MINUTE` | No | `60` | Max requests per minute per IP |
| `FLASK_DEBUG` | No | `false` | Enable debug mode (never in production) |
| `MODEL_PATH` | No | `models/model.p` | Path to the trained model file |

---

## 3. Deploy the Frontend (Vercel)

```bash
# Install CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect your GitHub repo in the Vercel dashboard. The framework is auto-detected as Next.js.

**Build command:** `npm run build`  
**Output directory:** `.next`

---

## 4. Deploy the Backend (Railway)

1. Push the `backend/` directory to a Git repo (or use Railway's GitHub integration).
2. In Railway, create a new project → **Deploy from GitHub repo**.
3. Railway auto-detects the `Dockerfile` in `backend/`.
4. Set the environment variables listed above.
5. The health check endpoint `GET /` is used by Railway's health check.

**Start command** (from `railway.toml`):
```
gunicorn --workers 2 --bind 0.0.0.0:$PORT --timeout 120 --log-level info app2:app
```

---

## 5. Post-Deployment Checks

- [ ] Visit `GET /` on the backend — should return `{"status":"ok","model_loaded":true/false}`
- [ ] Frontend loads without auth errors
- [ ] Sign-in / sign-up flows work
- [ ] Dashboard renders with live data from `/api/me`
- [ ] Interactive page shows camera prompt and connects to backend

---

## 6. Troubleshooting

### CORS errors in browser console
Ensure `FRONTEND_ORIGIN` on the backend matches the exact origin of your Vercel deployment (including protocol, no trailing slash).

### Model not loading on Railway
The model file (`model.p`) must be included in your Docker image. Add it to the `backend/` directory before building, or mount it as a volume.

### Build fails due to missing env vars
During build, some server-side env vars (`DATABASE_URL`, `CLERK_SECRET_KEY`) must be present in Vercel. Add them before building.

### Clerk redirect loop
Verify `NEXT_PUBLIC_APP_URL` matches the deployed Vercel domain exactly.
