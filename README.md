# Study with me — Study Timer for Indian Students

A full-stack aesthetic study timer web app built for JEE, NEET, UPSC, CAT, and GATE aspirants.

## Tech Stack

- **Next.js 14** (App Router, Server Components)
- **Tailwind CSS** + CSS Variables (8 themes)
- **PostgreSQL** + **Prisma ORM**
- **NextAuth.js v5** (Google + Email/Password)
- **Claude API** (claude-sonnet-4-6)
- **Framer Motion** + **Recharts**
- **Razorpay** (Indian payments)
- **Pusher** (realtime chat — optional)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

Required for basic dev:
- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — `openssl rand -base64 32`
- `AUTH_URL` — your app URL (e.g. `http://localhost:3000`)

Optional:
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — Google OAuth
- `ANTHROPIC_API_KEY` — AI Helper
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — Payments
- `PUSHER_*` — Realtime group chat + shared timer
- `VAPID_*` — Web Push (`npx web-push generate-vapid-keys`)
- `CRON_SECRET` — Secures cron endpoints

### Cron jobs (Vercel)

Configured in `vercel.json`:
- `POST /api/cron/reset-ai-usage` — 1st of each month (resets AI usage)
- `POST /api/cron/streak-reminders` — Daily 6 PM (push notifications)

Set `CRON_SECRET` and pass as `Authorization: Bearer <secret>` header.

### 3. Set up database

**Option A — Docker (recommended):**

```bash
npm run db:up          # Start PostgreSQL
npm run db:migrate     # Apply migrations
```

**Option B — existing PostgreSQL:**

Update `DATABASE_URL` in `.env`, then:

```bash
npx prisma migrate deploy
```

Default Docker credentials: `postgresql://saadhak:saadhak_dev@localhost:5432/saadhak`

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Production

```bash
npm run build
npm run start
```

### Deploy to Vercel

1. Push this repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables from `.env.example`
4. Set `AUTH_URL` to your production domain
5. Use a hosted PostgreSQL (Neon, Supabase, Railway, etc.) for `DATABASE_URL`
6. Run migrations: `npx prisma migrate deploy`

## Pages

| Route | Description |
|-------|-------------|
| `/` | Main timer (public) |
| `/dashboard` | Stats, charts, streaks |
| `/study-with-me` | Body-doubling timer |
| `/flip-clock` | Flip clock screensaver |
| `/focus` | Minimal focus timer |
| `/labels` | Subject tags |
| `/habits` | Weekly habits (Premium) |
| `/goals` | Study goals |
| `/ai-helper` | Claude-powered assistant |
| `/groups` | Study groups + chat |
| `/leaderboard` | Global rankings |
| `/study-plant` | Gamification |
| `/appearance` | Theme switcher |
| `/settings` | User preferences |
| `/pricing` | Razorpay plans |
| `/jee-timer` | JEE exam timer |
| `/neet-timer` | NEET exam timer |
| `/upsc-timer` | UPSC exam timer |
| `/cat-timer` | CAT exam timer |
| `/gate-timer` | GATE exam timer |

## Project Structure

```
src/
├── app/              # Next.js routes & API handlers
├── components/
│   ├── timer/        # Timer components
│   ├── dashboard/    # Dashboard widgets & charts
│   ├── layout/       # Navbar, OnlineCounter
│   ├── providers/    # Theme, Session providers
│   └── ui/           # Toast, shared UI
├── lib/              # auth, prisma, themes, utils
└── hooks/            # Shared React hooks
prisma/
├── schema.prisma
└── migrations/
```

## License

MIT
