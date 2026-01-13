# Admin Guide: Operating the Tournament

This guide provides step-by-step instructions for tournament administrators.

## 1. Setting Up Teams
1. Navigate to **"Equipos y Jugadores"**.
2. Click on a team to expand its roster.
3. **Manual Entry**: Edit player names, numbers, and roles directly in the fields.
4. **CSV Import**:
   - Scroll to the bottom and click **"Importar CSV"**.
   - Select your file. Format: `Number, Last Name, First Name, Role, Place of Birth`.
   - Results are saved automatically.

## 2. Managing the Schedule
1. Go to **"Partidos y Resultados"**.
2. Locate the specific game.
3. **Teams**: Use the **Swap Button** (⇅) to switch Home and Visitor teams (assigned by coin toss).
4. **Scoring**:
   - Enter Runs (R) for each team in the top row for a quick update.
   - **Recommended**: Enter scores inning-by-inning in the grid below. The total score will calculate automatically.
   - Input **Hits (H)** and **Errors (E)** for a complete official record.

## 3. Entering Player Statistics (Box Score)
1. In the **Schedule** card, click **"Ver/Editar Box Score"** for a specific game.
2. Select **"BATEO"** for offensive stats or **"PITCHEO"** for defensive stats.
3. Edit the numbers for each player.
4. Changes are saved as you type (debounced).

## 4. Monitoring Standings & Leaders
- **Standings**: View the **"Tabla de Posiciones"**. Rankings update automatically based on wins and run differential tie-breakers.
- **Leaders**: View the **"Panel de Líderes"**. This aggregates data from all games to show top hitters and pitchers.

## 5. Ending the Tournament
- Once the **Preliminary Round** is finished, the top two teams are automatically placed in the **"Partido Final"**.
- After entering the results for the Final, the **Confetti** animation will trigger for the winning team.

## 6. Starting a New Tournament
1. Scroll to the very bottom of the **Main Menu**.
2. Click **"Reiniciar Resultados del Torneo"**.
3. Confirm the prompt. This will:
   - Clear all game scores.
   - Delete all player statistics.
   - **Keep** all team names and player rosters for reusable setup.
