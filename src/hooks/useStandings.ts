import { useCallback } from 'react';
import type { Team, Game, Standing } from '@/lib/types';

export interface UseStandingsResult {
    calculateStandings: (games: Game[]) => Standing[];
}

/**
 * Hook for calculating tournament standings from game results
 */
export function useStandings(teams: Team[]): UseStandingsResult {
    const calculateStandings = useCallback((gamesToProcess: Game[]): Standing[] => {
        // Initialize standings for each team
        const newStandings: Omit<Standing, "pos" | "gb">[] = teams.map(team => ({
            teamId: team.id,
            w: 0,
            l: 0,
            rs: 0,
            ra: 0,
            pct: 0,
        }));

        // Check for ties (don't calculate if there are ties)
        let hasTies = false;
        for (const game of gamesToProcess) {
            if (game.score1 !== "" && game.score2 !== "" && game.score1 === game.score2) {
                hasTies = true;
                break;
            }
        }

        if (hasTies) {
            return [];
        }

        // Process each game
        gamesToProcess.forEach(game => {
            if (game.team1Id && game.team2Id && game.score1 !== "" && game.score2 !== "") {
                const team1Id = parseInt(game.team1Id);
                const team2Id = parseInt(game.team2Id);
                const score1 = parseInt(game.score1);
                const score2 = parseInt(game.score2);

                const standing1 = newStandings.find(s => s.teamId === team1Id);
                const standing2 = newStandings.find(s => s.teamId === team2Id);

                if (standing1 && standing2) {
                    // Update runs scored/allowed
                    standing1.rs += score1;
                    standing1.ra += score2;
                    standing2.rs += score2;
                    standing2.ra += score1;

                    // Update wins/losses
                    if (score1 > score2) {
                        standing1.w++;
                        standing2.l++;
                    } else if (score2 > score1) {
                        standing2.w++;
                        standing1.l++;
                    }
                }
            }
        });

        // Calculate winning percentage
        newStandings.forEach(standing => {
            const gamesPlayed = standing.w + standing.l;
            standing.pct = gamesPlayed > 0 ? standing.w / gamesPlayed : 0;
        });

        // Sort standings
        newStandings.sort((a, b) => {
            // By winning percentage
            if (b.pct !== a.pct) {
                return b.pct - a.pct;
            }
            // By run differential
            const diffA = a.rs - a.ra;
            const diffB = b.rs - b.ra;
            if (diffB !== diffA) {
                return diffB - diffA;
            }
            // By games played (fewer games = higher)
            const gamesA = a.w + a.l;
            const gamesB = b.w + b.l;
            if (gamesA !== gamesB) {
                return gamesA - gamesB;
            }
            return 0;
        });

        // Assign positions and calculate games behind
        let rank = 1;
        const finalStandings: Standing[] = newStandings.map((standing, index) => {
            if (index > 0) {
                const prevStanding = newStandings[index - 1];
                if (standing.w !== prevStanding.w || standing.l !== prevStanding.l) {
                    rank = index + 1;
                }
            }

            const firstPlaceWins = newStandings.length > 0 ? newStandings[0].w : 0;
            const firstPlaceLosses = newStandings.length > 0 ? newStandings[0].l : 0;
            const gamesBehind = ((firstPlaceWins - standing.w) + (standing.l - firstPlaceLosses)) / 2;
            const gamesPlayed = standing.w + standing.l;
            const displayPct = gamesPlayed > 0 ? Math.round((standing.w / gamesPlayed) * 1000) : 0;

            return {
                ...standing,
                pos: rank,
                gb: gamesPlayed === 0 ? 0 : gamesBehind,
                pct: displayPct,
            };
        });

        return finalStandings;
    }, [teams]);

    return { calculateStandings };
}
