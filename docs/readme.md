# The Show Pro Series v1.5.0

Professional Tournament Management System for Softball/Baseball.

## Overview
The Show Pro Series is a comprehensive web application designed to manage international softball tournaments. It provides a seamless experience for administrators to track team rosters, game schedules, live results, standings, and historical player statistics.

## Key Features
- **Dynamic Content Management**: Edit team names, player rosters, and game details in real-time.
- **Automated Standings**: Real-time calculation of Won/Lost records, Pct, and Games Behind based on game results.
- **Professional Box Scores**: Input detailed stats for every player per game (Batting & Pitching).
- **Leaderboard System**: Automatic ranking of tournament leaders in various categories.
- **Data Portability**: Import player rosters via CSV/TSV files.
- **Premium Aesthetics**: High-end dark mode design with gold accents and smooth transitions.

## Tech Stack
- **Frontend**: Next.js, Tailwind CSS, Shadcn/UI.
- **Backend**: Supabase.
- **Icons**: Lucide.

## Quick Start
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Environment Setup**:
   Create a `.env` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```
3. **Run Development Server**:
   ```bash
   npm run dev
   ```
4. **Build for Production**:
   ```bash
   npm run build
   ```

## Development
- `src/app`: Contains the main page and server actions.
- `src/components`: UI components and tournament logic.
- `src/lib`: Database client and type definitions.
