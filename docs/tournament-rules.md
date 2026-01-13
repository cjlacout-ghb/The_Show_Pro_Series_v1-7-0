# Tournament Rules & Scoring Logic

This application follows standard international softball protocols, influenced by WBSC (World Baseball Softball Confederation) standards.

## 1. Game Duration & Structure
- **Regulation Games**: Standard games consist of **7 innings**.
- **Tie Breaker**: If teams are tied after 7 innings, the game continues until a winner is determined. (The system supports unlimited extra innings by adding columns to the grid).
- **Home/Visitor Team**: Assigned by coin toss in the preliminary round. The user can use the "Swap" button to align the UI with the toss result.

## 2. Standings & Tie-Breakers
Standings are calculated using the following priority:
1. **Winning Percentage (PCT)**: `Wins / (Wins + Losses)`.
2. **Head-to-Head**: Record between tied teams.
3. **Run Differential (RS - RA)**: The difference between runs scored and runs against throughout the preliminary round.
4. **Total Runs Scored**: In case differential is still tied.

**Note**: Ties are not allowed in the final protocol; the system will warn if scores are equal.

## 3. Statistical Calculations
- **Batting Average (AVG)**: `Hits / At Bats`.
- **Slugging (SLG)**: `(Singles + 2*Doubles + 3*Triples + 4*HR) / At Bats`.
- **ERA (Earned Run Average)**: `(Earned Runs * 7) / Innings Pitched`. (Based on 7-inning regulation).
- **WHIP**: `(Walks + Hits) / Innings Pitched`.

## 4. Run Rule (Mercy Rule)
While the system allows any score entry, standard WBSC Run Rules (e.g., 15 runs after 3 innings, 10 after 4, 7 after 5) are typically applied by the umpire and then recorded by the administrator as the final score.

## 5. Championship Eligibility
- The top **2 teams** from the Preliminary Round standings automatically qualify for the **Championship Game**.
- Team #1 (Seed 1) is designated as the primary team for the final match context.
