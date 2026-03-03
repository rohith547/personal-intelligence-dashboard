# Personal Intelligence Dashboard

Dashboard with SJ philosophy

## Multi-User Setup

This app uses [Supabase](https://supabase.com) for authentication and cloud data storage.

### 1. Supabase Project Setup

1. Create a project at [supabase.com](https://supabase.com) (or use the existing project).
2. Copy your **Project URL** and **Anon/Public Key** from *Project Settings → API*.

### 2. Run the Database Schema

1. Go to **Supabase Dashboard → SQL Editor → New Query**.
2. Copy the SQL schema from the comment block in `src/lib/supabase.ts` and run it.

This creates tables for `tasks`, `mood_entries`, `fitness_entries`, `spending_entries`, `notes`, `learning_entries`, `reading_entries`, and `goals`, each with Row Level Security enabled so each user only sees their own data.

### 3. Environment Variables

The Supabase URL and anon key are set directly in `src/lib/supabase.ts`. If you want to use environment variables instead, create a `.env` file:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Then update `src/lib/supabase.ts` to use `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`.

### 4. Enable Google OAuth

1. Go to **Supabase Dashboard → Authentication → Providers → Google**.
2. Enable the Google provider and add your Google OAuth credentials.
3. Add your app URL to the **Redirect URLs** list (e.g. `http://localhost:5173`).
