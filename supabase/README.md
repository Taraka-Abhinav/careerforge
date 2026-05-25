# CareerForge Supabase Setup

Apply **only** the unified migration:

```
supabase/migrations/001_careerforge_core.sql
```

Do **not** run `supabase_setup.sql` or `supabase_schema.sql` on the same project (conflicting schemas).

After applying, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.

Then apply Phase 2:

```
supabase/migrations/002_phase2_starm_profile.sql
```

Then apply daily coding tables:

```
supabase/migrations/003_daily_coding_problems.sql
```

Hackathon registrations:

```
supabase/migrations/004_hackathon.sql
```

Optional: set `VITE_OPENAI_API_KEY` for premium StarM AI explanations (see `.env.example`).

Full publish steps: see `DEPLOY.md` in the repo root.

## Troubleshooting

### `foreign key constraint "learning_modules_skill_id_fkey" cannot be implemented` (uuid vs bigint)

Your project already had `public.skills` with `id BIGINT` (from an older schema). `CREATE TABLE IF NOT EXISTS` did not replace it, so `learning_modules.skill_id UUID` could not reference `skills.id`.

The migration now includes a **RESET** block at the top that `DROP`s legacy tables and recreates them with UUID keys. Re-run the full migration file.

If you must keep existing data, do not use the reset block; instead migrate column types manually (advanced).

### After reset

Existing auth users remain, but profile/roadmap/progress rows are cleared. Sign in and complete onboarding again.
