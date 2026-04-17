# Deploy And Database Setup

## Recommended stack

- Frontend hosting: Vercel
- Database: Supabase

## Why this pairing

- This app is a static frontend with browser JavaScript, which deploys cleanly on Vercel.
- Supabase provides hosted Postgres plus a JavaScript client that works directly in browser apps.

Official references:

- Supabase JavaScript install and CDN usage: [Supabase docs](https://supabase.com/docs/reference/javascript/installing)
- Vercel deployment overview: [Vercel docs](https://vercel.com/docs/deployments)

## 1. Create a Supabase project

1. Create a project in Supabase.
2. Open the SQL editor.
3. Run the SQL in [DATABASE_SCHEMA.sql](C:/Users/3892/Documents/New%20project/DATABASE_SCHEMA.sql).
4. Copy your project URL and anon key.

## 2. Configure the app

1. Copy [supabase-config.example.js](C:/Users/3892/Documents/New%20project/supabase-config.example.js) to `supabase-config.js`.
2. Fill in:
   - `supabaseUrl`
   - `supabaseAnonKey`
   - set `useSupabase` to `true`

## 3. Deploy to Vercel

1. Put the project in a Git repo.
2. Import the repo into Vercel.
3. No build command is required.
4. Output directory is the project root.
5. Make sure `supabase-config.js` is included in deployment.

## 4. Seed behavior

- If Supabase is enabled and the database is empty, the app can seed demo data.
- If Supabase is disabled, the app falls back to browser `localStorage`.

## 5. Security note

The current app still stores app usernames/passwords in the `agents` table for demo simplicity.

For production, the next step should be:

- move login to Supabase Auth
- remove plaintext passwords from app data
- add Row Level Security policies
