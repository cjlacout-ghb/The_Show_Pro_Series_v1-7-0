# Project Architecture: The Show Pro Series

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Radix UI (Shadcn/UI components)
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Animations**: Framer Motion (via Tailwind animate) & React Confetti
- **State Management**: React Hooks (useState/useCallback) with Supabase Server Actions for persistence.

## Component Hierarchy
- **`TournamentManager.tsx`**: The main controller. Owns the tournament state (teams, games, standings) and handles routing between views.
  - **`TeamSetup.tsx`**: Manages team rosters. Includes CSV/TSV import logic.
  - **`ScheduleCard.tsx`**: Displays and edits game results. Calculates scores from innings.
    - **`BoxScoreDialog.tsx`**: Detailed modal for inputting individual player batting and pitching statistics.
  - **`StandingsTable.tsx`**: Reads processed game data to display W-L record, Runs Scored/Against, and PCT.
  - **`LeaderBoard.tsx`**: Aggregates all player statistics across all games to show tournament leaders.

## Data Flow
1. **Server-Side**: `src/app/page.tsx` fetches initial data from Supabase using `getTeams()`, `getGames()`, and `getAllStats()`.
2. **Client-Side**: `TournamentManager` initializes state with this data.
3. **Updates**: When a user changes a score or stat:
   - Local state is updated immediately (optimistic update).
   - A debounced call is made to a Server Action (e.g., `updateGame` in `actions.ts`).
   - `revalidatePath('/')` is called on the server to ensure data consistency.
4. **Calculations**: Standings are calculated client-side in real-time as scores change.

## Database Schema (Supabase)
- **`teams`**: `id`, `name`.
- **`players`**: `id`, `team_id`, `number`, `name`, `role`, `place_of_birth`.
- **`games`**: `id`, `team1_id`, `team2_id`, `score1`, `score2`, `hits1`, `hits2`, `errors1`, `errors2`, `innings` (jsonb), `day`, `time`.
- **`batting_stats`**: `player_id`, `game_id`, `stats` (jsonb).
- **`pitching_stats`**: `player_id`, `game_id`, `stats` (jsonb).
