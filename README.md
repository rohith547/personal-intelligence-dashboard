# Personal Intelligence Dashboard

Dashboard with SJ philosophy

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

Copy the example environment file and fill in your Supabase project credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### 3. Create the database schema

In your [Supabase Dashboard](https://app.supabase.com), open **SQL Editor → New Query** and paste the SQL block found at the top of `src/lib/supabase.ts` (inside the comment block). Run the query to create all tables with Row Level Security enabled.

### 4. Enable Google OAuth (optional)

1. In the Supabase Dashboard go to **Authentication → Providers → Google**.
2. Enable the Google provider and add your OAuth Client ID and Secret from [Google Cloud Console](https://console.cloud.google.com/).
3. Add `http://localhost:5173` (and your production URL) to the **Redirect URLs** list.

### 5. Run the app

```bash
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
