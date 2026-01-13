---
description: Resets all game scores and deletes all player statistics to start a fresh tournament.
---

1. Create a temporary script `src/reset-db-task.ts` with the following content:
   ```typescript
   import { supabase } from './lib/supabase';

   async function reset() {
     console.log('Resetting tournament...');
     // 1. Reset Batting Stats
     const { error: batError } = await supabase.from('batting_stats').delete().neq('player_id', 0);
     if (batError) console.error('Error clearing batting stats:', batError);

     // 2. Reset Pitching Stats
     const { error: pitchError } = await supabase.from('pitching_stats').delete().neq('player_id', 0);
     if (pitchError) console.error('Error clearing pitching stats:', pitchError);

     // 3. Reset Games
     const { error: gameError } = await supabase
       .from('games')
       .update({
         score1: null,
         score2: null,
         hits1: null,
         hits2: null,
         errors1: null,
         errors2: null,
         innings: []
       })
       .neq('id', 0);

     if (gameError) console.error('Error resetting games:', gameError);
    
     if (!batError && !pitchError && !gameError) {
         console.log('Reset complete.');
     }
   }

   reset().catch(console.error);
   ```

2. Execute the script to perform the database reset:
   // turbo
   `npx -y tsx src/reset-db-task.ts`

3. Remove the temporary script:
   // turbo
   `Remove-Item src/reset-db-task.ts -ErrorAction SilentlyContinue`
