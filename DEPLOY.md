# Publish CareerForge (student learning site)

## 1. Supabase

In the [Supabase SQL Editor](https://supabase.com/dashboard), run migrations **in order**:

1. `supabase/migrations/001_careerforge_core.sql`
2. `supabase/migrations/002_phase2_starm_profile.sql`
3. `supabase/migrations/003_daily_coding_problems.sql`

Enable **Email** auth under Authentication → Providers.

Copy **Project URL** and **anon public** key from Settings → API.

## 2. Environment variables

Create `.env` locally (see `.env.example`):

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Optional: `VITE_OPENAI_API_KEY` for richer StarM coach replies.

## 3. Build

```bash
npm install
npm run build
```

Output is in `dist/`.

## 4. Deploy (Vercel recommended)

1. Push the repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Framework preset: **Vite**.
4. Add the same `VITE_*` env vars in Project Settings → Environment Variables.
5. Deploy.

`vercel.json` and `public/_redirects` are already set for SPA routing (`/roadmap`, `/learn/...`, etc.).

### Netlify

Build command: `npm run build`  
Publish directory: `dist`  
Uses `public/_redirects` for SPA fallback.

## 5. After deploy

1. Sign up / log in — session persists in the browser until **Sign out** in Settings.
2. Complete onboarding to generate your **4-phase roadmap**.
3. If training pages look empty, open **Live Roadmap** → **Refresh roadmap**.
4. Use **Daily Code** for 3 real-world coding problems per day.
5. Open any skill → **Training** for lessons/practice/quizzes, or **StarM Notes** for study material.

## Scope (current release)

Included: profile, roadmap, training modules, daily coding, challenges, XP, analytics, StarM notes/coach.

Not included yet: certificates, jobs board, marketplace, recruiter tools.
