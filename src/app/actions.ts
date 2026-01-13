'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function getTeams() {
    const { data: teams, error } = await supabase
        .from('teams')
        .select(`
            *,
            players (*)
        `)
        .order('id')

    if (error) {
        console.error('Error fetching teams:', error)
        return []
    }

    // Map snake_case to camelCase for the UI
    return teams.map(team => ({
        ...team,
        players: team.players.map((p: any) => ({
            ...p,
            placeOfBirth: p.place_of_birth
        }))
    }))
}

export async function getGames() {
    const { data: games, error } = await supabase
        .from('games')
        .select('*')
        .order('id')

    if (error) {
        console.error('Error fetching games:', error)
        return []
    }

    return games.map(game => ({
        ...game,
        team1Id: String(game.team1_id),
        team2Id: String(game.team2_id),
        score1: game.score1?.toString() ?? "",
        score2: game.score2?.toString() ?? "",
        hits1: game.hits1?.toString() ?? "",
        hits2: game.hits2?.toString() ?? "",
        errors1: game.errors1?.toString() ?? "",
        errors2: game.errors2?.toString() ?? "",
        isChampionship: game.id === 16
    }))
}

export async function saveBattingStat(data: { playerId: number, gameId: number, stats: any }) {
    const { playerId, gameId, stats } = data;

    const { error } = await supabase
        .from('batting_stats')
        .upsert({
            player_id: playerId,
            game_id: gameId,
            stats: stats,
            updated_at: new Date().toISOString()
        })

    if (error) console.error('Error saving batting stat:', error)
    revalidatePath('/');
}

export async function savePitchingStat(data: { playerId: number, gameId: number, stats: any }) {
    const { playerId, gameId, stats } = data;

    const { error } = await supabase
        .from('pitching_stats')
        .upsert({
            player_id: playerId,
            game_id: gameId,
            stats: stats,
            updated_at: new Date().toISOString()
        })

    if (error) console.error('Error saving pitching stat:', error)
    revalidatePath('/');
}

export async function getAllStats() {
    const { data: bStats, error: bError } = await supabase
        .from('batting_stats')
        .select(`
            *,
            player:players (
                *,
                team:teams (*)
            )
        `)

    const { data: pStats, error: pError } = await supabase
        .from('pitching_stats')
        .select(`
            *,
            player:players (
                *,
                team:teams (*)
            )
        `)

    if (bError || pError) console.error('Error fetching all stats:', bError || pError)

    // Map structure to match frontend expectations
    const mapStat = (stat: any) => ({
        ...stat,
        playerId: stat.player_id,
        gameId: stat.game_id,
        player: {
            ...stat.player,
            placeOfBirth: stat.player.place_of_birth,
            team: stat.player.team
        }
    })

    return {
        battingStats: (bStats || []).map(mapStat),
        pitchingStats: (pStats || []).map(mapStat)
    };
}

export async function updateGame(gameId: number, data: any) {
    const updateData: any = {}
    if (data.score1 !== undefined) updateData.score1 = parseInt(data.score1) || 0
    if (data.score2 !== undefined) updateData.score2 = parseInt(data.score2) || 0
    if (data.hits1 !== undefined) updateData.hits1 = parseInt(data.hits1) || 0
    if (data.hits2 !== undefined) updateData.hits2 = parseInt(data.hits2) || 0
    if (data.errors1 !== undefined) updateData.errors1 = parseInt(data.errors1) || 0
    if (data.errors2 !== undefined) updateData.errors2 = parseInt(data.errors2) || 0
    if (data.innings) updateData.innings = data.innings
    if (data.team1Id) updateData.team1_id = parseInt(data.team1Id)
    if (data.team2Id) updateData.team2_id = parseInt(data.team2Id)

    const { error } = await supabase
        .from('games')
        .update(updateData)
        .eq('id', gameId)

    if (error) console.error('Error updating game:', error)
    revalidatePath('/')
}

export async function importPlayers(teamId: number, csvData: string) {
    console.log(`Starting import for team ${teamId}, string length: ${csvData.length}`);
    const lines = csvData.trim().split('\n');
    const playersToInsert: any[] = [];

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.includes('UNIFORME N') || trimmedLine.toUpperCase().startsWith('TEAM')) continue;

        let parts = trimmedLine.split(',').map(p => p.trim());
        if (parts.length < 3) parts = trimmedLine.split('\t').map(p => p.trim());

        if (parts.length >= 2) {
            const number = parseInt(parts[0]) || 0;
            let fullName = "";
            let role = "UNKNOWN";
            let placeOfBirth = "UNKNOWN";

            if (parts.length >= 3) {
                const lastName = parts[1] || "";
                const firstName = parts[2] || "";
                fullName = `${firstName} ${lastName}`.trim();
                if (parts.length > 3) role = parts[3];
                if (parts.length > 4) placeOfBirth = parts[4];
            } else {
                fullName = parts[1];
            }

            playersToInsert.push({
                id: Math.floor(Math.random() * 100000000), // Larger random ID to avoid collisions
                team_id: teamId,
                number: number,
                name: fullName,
                role: role,
                place_of_birth: placeOfBirth
            });
        }
    }

    if (playersToInsert.length > 0) {
        const { error, count } = await supabase.from('players').insert(playersToInsert)
        if (error) {
            console.error('Error importing players:', error)
            return { success: false, error: error.message }
        }
        revalidatePath('/');
        return { success: true, count: playersToInsert.length };
    }

    return { success: true, count: 0 };
}

export async function updatePlayer(playerId: number, data: { number?: number, name?: string, role?: string, placeOfBirth?: string }) {
    const updateData: any = { ...data }
    if (data.placeOfBirth) {
        updateData.place_of_birth = data.placeOfBirth
        delete updateData.placeOfBirth
    }

    const { error } = await supabase
        .from('players')
        .update(updateData)
        .eq('id', playerId)

    if (error) {
        console.error('Error updating player:', error)
        return { success: false }
    }
    revalidatePath('/');
    return { success: true };
}

export async function resetTournamentScores() {
    try {
        // 1. Delete all stats (using a filter that definitely hits all rows)
        const { error: bError } = await supabase.from('batting_stats').delete().neq('game_id', -1);
        const { error: pError } = await supabase.from('pitching_stats').delete().neq('game_id', -1);

        if (bError || pError) {
            console.error('Error deleting stats:', bError || pError);
        }

        // 2. Reset games scores and innings
        const { error: error1 } = await supabase
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
            .neq('id', -1);

        if (error1) {
            console.error('Error resetting games:', error1);
        }

        // 3. Reset team IDs for the championship game (ID 16)
        const { error: error2 } = await supabase
            .from('games')
            .update({
                team1_id: null,
                team2_id: null
            })
            .eq('id', 16);

        if (error2) {
            console.error('Error resetting championship game:', error2);
        }

        revalidatePath('/');
        return { success: true };
    } catch (err) {
        console.error('Unexpected error during reset:', err);
        return { success: false, error: 'Unexpected error' };
    }
}


