import type { Game, Team, Player, BattingStat, PitchingStat } from './types';

/**
 * Aggregated player statistics across all games
 */
export interface PlayerStats {
    batting: Partial<BattingStat> & { gamesPlayed: number };
    pitching: Partial<PitchingStat> & { gamesPlayed: number };
    player: Player & { teamName: string; teamId: number };
}

/**
 * Batting leader with calculated stats
 */
export interface BattingLeader extends Player {
    teamName: string;
    avg: number;
    hr: number;
    rbi: number;
    h: number;
    r: number;
}

/**
 * Pitching leader with calculated stats
 */
export interface PitchingLeader extends Player {
    teamName: string;
    era: number;
    so: number;
    ip: number;
    w: number;
}

/**
 * Initialize empty player stats for all players across teams
 */
export function initializePlayerStats(teams: Team[]): Record<number, PlayerStats> {
    const playerStats: Record<number, PlayerStats> = {};

    teams.forEach(team => {
        team.players.forEach(player => {
            playerStats[player.id] = {
                player: { ...player, teamName: team.name, teamId: team.id },
                batting: {
                    plateAppearances: 0,
                    atBats: 0,
                    hits: 0,
                    runs: 0,
                    rbi: 0,
                    homeRuns: 0,
                    walks: 0,
                    strikeOuts: 0,
                    gamesPlayed: 0
                },
                pitching: {
                    inningsPitched: 0,
                    hits: 0,
                    runs: 0,
                    earnedRuns: 0,
                    walks: 0,
                    strikeOuts: 0,
                    wins: 0,
                    losses: 0,
                    gamesPlayed: 0
                }
            };
        });
    });

    return playerStats;
}

/**
 * Calculate how many games each team has played
 */
export function calculateTeamGamesPlayed(games: Game[], teams: Team[]): Record<number, number> {
    const teamGamesPlayed: Record<number, number> = {};
    teams.forEach(t => teamGamesPlayed[t.id] = 0);

    games.forEach(game => {
        if (game.score1 !== "" && game.score2 !== "") {
            const team1Id = parseInt(game.team1Id);
            const team2Id = parseInt(game.team2Id);
            if (!isNaN(team1Id)) teamGamesPlayed[team1Id] = (teamGamesPlayed[team1Id] || 0) + 1;
            if (!isNaN(team2Id)) teamGamesPlayed[team2Id] = (teamGamesPlayed[team2Id] || 0) + 1;
        }
    });

    return teamGamesPlayed;
}

/**
 * Aggregate batting and pitching stats from all games
 */
export function aggregatePlayerStats(
    games: Game[],
    teams: Team[]
): Record<number, PlayerStats> {
    const playerStats = initializePlayerStats(teams);

    games.forEach(game => {
        if (game.score1 !== "" && game.score2 !== "") {
            // Aggregate Batting
            game.battingStats?.forEach(stat => {
                const ps = playerStats[stat.playerId];
                if (ps) {
                    ps.batting.plateAppearances = (ps.batting.plateAppearances || 0) + (stat.plateAppearances || 0);
                    ps.batting.atBats = (ps.batting.atBats || 0) + (stat.atBats || 0);
                    ps.batting.hits = (ps.batting.hits || 0) + (stat.hits || 0);
                    ps.batting.runs = (ps.batting.runs || 0) + (stat.runs || 0);
                    ps.batting.rbi = (ps.batting.rbi || 0) + (stat.rbi || 0);
                    ps.batting.homeRuns = (ps.batting.homeRuns || 0) + (stat.homeRuns || 0);
                    ps.batting.walks = (ps.batting.walks || 0) + (stat.walks || 0);
                    ps.batting.strikeOuts = (ps.batting.strikeOuts || 0) + (stat.strikeOuts || 0);
                    ps.batting.gamesPlayed!++;
                }
            });

            // Aggregate Pitching
            game.pitchingStats?.forEach(stat => {
                const ps = playerStats[stat.playerId];
                if (ps) {
                    const currentIP = ps.pitching.inningsPitched || 0;
                    const newIP = stat.inningsPitched || 0;

                    // Convert to outs for accurate addition
                    let totalOuts = Math.floor(currentIP) * 3 + Math.round((currentIP % 1) * 10);
                    totalOuts += Math.floor(newIP) * 3 + Math.round((newIP % 1) * 10);

                    ps.pitching.inningsPitched = Math.floor(totalOuts / 3) + (totalOuts % 3) / 10;
                    ps.pitching.hits = (ps.pitching.hits || 0) + (stat.hits || 0);
                    ps.pitching.runs = (ps.pitching.runs || 0) + (stat.runs || 0);
                    ps.pitching.earnedRuns = (ps.pitching.earnedRuns || 0) + (stat.earnedRuns || 0);
                    ps.pitching.walks = (ps.pitching.walks || 0) + (stat.walks || 0);
                    ps.pitching.strikeOuts = (ps.pitching.strikeOuts || 0) + (stat.strikeOuts || 0);
                    ps.pitching.wins = (ps.pitching.wins || 0) + (stat.wins || 0);
                    ps.pitching.losses = (ps.pitching.losses || 0) + (stat.losses || 0);
                    ps.pitching.gamesPlayed!++;
                }
            });
        }
    });

    return playerStats;
}

/**
 * Get batting leaders sorted by average
 */
export function getBattingLeaders(
    playerStats: Record<number, PlayerStats>,
    teamGamesPlayed: Record<number, number>,
    limit = 10
): BattingLeader[] {
    return Object.values(playerStats)
        .filter(ps => {
            const teamGames = teamGamesPlayed[ps.player.teamId] || 0;
            // Qualify if team has played at least one game and player meets PA requirement
            return teamGames > 0 && (ps.batting.plateAppearances || 0) >= teamGames * 2.1;
        })
        .map(ps => {
            const ab = ps.batting.atBats || 0;
            const h = ps.batting.hits || 0;
            return {
                ...ps.player,
                avg: ab > 0 ? h / ab : 0,
                hr: ps.batting.homeRuns || 0,
                rbi: ps.batting.rbi || 0,
                h: h,
                r: ps.batting.runs || 0
            };
        })
        .sort((a, b) => b.avg - a.avg || b.hr - a.hr)
        .slice(0, limit);
}

/**
 * Get pitching leaders sorted by ERA
 */
export function getPitchingLeaders(
    playerStats: Record<number, PlayerStats>,
    teamGamesPlayed: Record<number, number>,
    limit = 10
): PitchingLeader[] {
    return Object.values(playerStats)
        .filter(ps => {
            const teamGames = teamGamesPlayed[ps.player.teamId] || 0;
            const ip = ps.pitching.inningsPitched || 0;
            const totalOuts = Math.floor(ip) * 3 + Math.round((ip % 1) * 10);
            return teamGames > 0 && (totalOuts / 3) >= teamGames * 2.3;
        })
        .map(ps => {
            const ip = ps.pitching.inningsPitched || 0;
            const totalOuts = Math.floor(ip) * 3 + Math.round((ip % 1) * 10);
            const er = ps.pitching.earnedRuns || 0;
            const era = totalOuts > 0 ? (er * 21) / totalOuts : 0; // 7 innings = 21 outs
            return {
                ...ps.player,
                era: era,
                so: ps.pitching.strikeOuts || 0,
                ip: ip,
                w: ps.pitching.wins || 0
            };
        })
        .sort((a, b) => a.era - b.era || b.so - a.so)
        .slice(0, limit);
}
