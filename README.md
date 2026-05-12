# Lumina

A full-stack social habit tracker. Track your daily habits, share your accountability board with friends, and monitor your progress via interactive dashboards.

## Core Features

- **Auth**: Email/Password authentication & user profiles
- **Tracker**: Daily checklist (checkbox and numeric/calorie goals)
- **Social**: Real-time live updating friend cards with 7-day sparklines
- **Dashboard**: Streak tracking, Recharts completion graphs, and GitHub-style heatmaps
- **Settings**: Drag-and-drop habit reordering and invite link generation

## Tech Stack

- React 18, TypeScript, Tailwind CSS v3
- Vite, Recharts, dnd-kit
- **Backend:** Supabase (PostgreSQL, Auth, Row Level Security, Realtime)

## Local Setup

### 1. Supabase Setup
1. Create a new project on [Supabase](https://supabase.com).
2. Open your Supabase Dashboard -> SQL Editor -> New Query.
3. Copy the contents of `supabase/migrations/001_initial_schema.sql` and run it. This will create all tables, RLS policies, and enable Realtime for habits and logs.

### 2. Environment Variables
1. Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
2. Fill in your Supabase details (found in your Supabase project settings -> API):
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 3. Run the App
```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.
