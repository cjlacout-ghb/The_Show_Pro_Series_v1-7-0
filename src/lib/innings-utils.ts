import type { Game } from './types';

/**
 * Initialize empty innings array for a game
 */
export function initializeInnings(count = 7): (string | number)[][] {
    return Array(count).fill(0).map(() => ["", ""]);
}

/**
 * Calculate total score from innings array
 */
export function calculateScoreFromInnings(innings: (string | number)[][]): { score1: number; score2: number } {
    const score1 = innings.reduce((sum, inning) => {
        const val = inning[0];
        return sum + (val !== 'X' ? (parseInt(String(val)) || 0) : 0);
    }, 0);

    const score2 = innings.reduce((sum, inning) => {
        const val = inning[1];
        return sum + (val !== 'X' ? (parseInt(String(val)) || 0) : 0);
    }, 0);

    return { score1, score2 };
}

/**
 * Update a single inning value and return the updated game
 * Handles:
 * - Normalizing 'x' to 'X'
 * - Extending innings array if needed
 * - Adding extra innings for ties
 * - Recalculating game scores
 */
export function updateGameInning(
    game: Game,
    inningIndex: number,
    teamIndex: 0 | 1,
    value: string
): Game {
    const newInnings = game.innings.map((inning: any) => [...inning]);
    const normalizedValue = value.toUpperCase() === 'X' ? 'X' : value;

    // Extend innings if needed
    if (inningIndex >= newInnings.length) {
        newInnings.push(["", ""]);
    }

    newInnings[inningIndex][teamIndex] = normalizedValue;

    // Check if we need to add extra inning for ties
    if (inningIndex === newInnings.length - 1 && value !== "") {
        const { score1, score2 } = calculateScoreFromInnings(newInnings);
        if (inningIndex >= 6 && score1 === score2) {
            newInnings.push(["", ""]);
        }
    }

    // Recalculate scores
    const { score1, score2 } = calculateScoreFromInnings(newInnings);

    return {
        ...game,
        innings: newInnings,
        score1: String(score1),
        score2: String(score2)
    };
}

/**
 * Swap teams in a game (home/away switch)
 */
export function swapGameTeams(game: Game): Game {
    return {
        ...game,
        team1Id: game.team2Id,
        team2Id: game.team1Id,
        score1: game.score2,
        score2: game.score1,
        hits1: game.hits2,
        hits2: game.hits1,
        errors1: game.errors2,
        errors2: game.errors1,
        innings: game.innings.map(inn => [inn[1], inn[0]])
    };
}

/**
 * Ensure a game has properly initialized innings
 */
export function ensureGameInnings(game: Game): Game {
    if (game.innings && game.innings.length > 0) {
        return game;
    }
    return {
        ...game,
        innings: initializeInnings(7)
    };
}
