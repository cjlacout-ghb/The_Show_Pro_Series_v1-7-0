# Deployment & Infrastructure Guide

The Show Pro Series is optimized for deployment on **Vercel** or **Netlify** with a **Supabase** backend.

## 1. Supabase Setup
You need a Supabase project with the following tables:

### schema.sql (Recommended)
```sql
-- Teams Table
CREATE TABLE teams (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL
);

-- Players Table
CREATE TABLE players (
  id BIGINT PRIMARY KEY,
  team_id BIGINT REFERENCES teams(id),
  number INTEGER,
  name TEXT,
  role TEXT,
  place_of_birth TEXT
);

-- Games Table
CREATE TABLE games (
  id BIGINT PRIMARY KEY,
  team1_id BIGINT REFERENCES teams(id),
  team2_id BIGINT REFERENCES teams(id),
  score1 INTEGER,
  score2 INTEGER,
  hits1 INTEGER,
  hits2 INTEGER,
  errors1 INTEGER,
  errors2 INTEGER,
  innings JSONB DEFAULT '[]',
  day TEXT,
  time TEXT
);

-- Stats Tables
CREATE TABLE batting_stats (
  player_id BIGINT REFERENCES players(id),
  game_id BIGINT REFERENCES games(id),
  stats JSONB,
  updated_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (player_id, game_id)
);

CREATE TABLE pitching_stats (
  player_id BIGINT REFERENCES players(id),
  game_id BIGINT REFERENCES games(id),
  stats JSONB,
  updated_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (player_id, game_id)
);
```

## 2. Environment Variables
Ensure the following are set in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase API URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.

## 3. Vercel / Netlify Configuration
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Framework Preset**: Next.js

### Handling Revalidation
The app uses `revalidatePath('/')` which requires a server environment. Both Vercel and Netlify (using Next.js adapter) support this.

## 4. Local Deployment
1. Clone the repository.
2. Install: `npm install`.
3. Set environment variables.
4. Build: `npm run build`.
5. Start: `npm run start`.
