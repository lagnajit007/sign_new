# Sanjog — Sign Language Learning Platform

Learn sign language with AI-powered real-time hand gesture recognition.

**Stack:** Next.js 15 / Clerk Auth / Supabase (Postgres) / Prisma / Flask + TensorFlow / Railway

---

## Quick Start

```bash
# 1. Frontend
npm install
cp .env.example .env.local   # fill in Clerk + Supabase keys
npm run dev                   # → http://localhost:3000

# 2. Backend (separate terminal)
cd backend
python -m venv venv && venv\Scripts\activate  # Windows
pip install -r requirements.txt
python app2.py                # → http://localhost:5000
```

---

## Project Structure

```
├── src/                      # Next.js frontend
│   ├── app/
│   │   ├── api/              # API routes (me, progress, attempts, etc.)
│   │   ├── dashboard/        # Protected dashboard pages
│   │   └── sign-in, sign-up, etc.
│   ├── components/           # Shared React components
│   ├── lib/                  # Prisma client, config, utils
│   └── middleware.ts         # Clerk auth middleware
├── backend/
│   ├── app2.py               # Flask recognition server
│   ├── Dockerfile            # Container for Railway deployment
│   ├── railway.toml          # Railway configuration
│   └── models/               # Trained model files
├── prisma/                   # Schema + migrations
├── requirements.txt          # Python dependencies
└── DEPLOYMENT.md             # Full deployment guide
```

---

## Environment Variables

See `.env.example` for the full list. Required:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` — from Clerk dashboard
- `DATABASE_URL` + `DIRECT_URL` — from Supabase project settings
- `NEXT_PUBLIC_RECOGNITION_API_URL` — Flask backend URL (default: `http://127.0.0.1:5000`)

---

## API Routes

| Route | Auth | Description |
|-------|------|-------------|
| `GET /api/me` | Required | Current user profile + stats |
| `GET /api/progress` | Required | Weekly activity, completion data |
| `POST /api/attempts` | Required | Log recognition attempt, award XP |
| `GET /api/challenges` | Required | Challenge catalog with progress |
| `GET /api/achievements` | Required | Achievement catalog with unlock state |
| `GET /api/leaderboard?scope=global|weekly` | Required | Ranked users |
| `GET /api/clear-session` | Required | Clear Clerk cookies |

All API responses follow the envelope `{ error: null | string, ...data }`.

---

## Backend Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/` | GET | Health check |
| `/predict` | POST | Landmarks → sign prediction |
| `/gestures` | GET | List supported gestures |
| `/stats` | GET | Server metrics |

---

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for Vercel + Railway setup.

---

## Scripts

```bash
npm run dev       # Start Next.js dev server
npm run build     # Production build
npm run lint      # ESLint
npm run clean     # Remove .next + node_modules
npm run db:migrate # Run Prisma migrations
npm run db:seed    # Seed database
```

---

## License

MIT
