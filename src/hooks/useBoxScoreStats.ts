import { useState, useCallback } from 'react';
import type { Game, BattingStat, PitchingStat, Player } from '@/lib/types';

export interface UseBoxScoreStatsResult {
    battingDraft: Record<number, Partial<BattingStat>>;
    pitchingDraft: Record<number, Partial<PitchingStat>>;
    selectedBatters: number[];
    selectedPitchers: number[];
    handleBattingChange: (playerId: number, field: keyof BattingStat, value: string) => void;
    handlePitchingChange: (playerId: number, field: keyof PitchingStat, value: string) => void;
    getBattingStat: (playerId: number, field: keyof BattingStat) => string;
    getPitchingStat: (playerId: number, field: keyof PitchingStat) => string;
    addBatter: (playerIdString: string) => void;
    removeBatter: (playerId: number) => void;
    addPitcher: (playerIdString: string) => void;
    removePitcher: (playerId: number) => void;
    initializeFromGame: (game: Game) => void;
}

/**
 * Hook for managing box score stats editing state
 */
export function useBoxScoreStats(
    gameId: number,
    onSaveBatting?: (playerId: number, stats: Partial<BattingStat>) => Promise<void>,
    onSavePitching?: (playerId: number, stats: Partial<PitchingStat>) => Promise<void>
): UseBoxScoreStatsResult {
    const [battingDraft, setBattingDraft] = useState<Record<number, Partial<BattingStat>>>({});
    const [pitchingDraft, setPitchingDraft] = useState<Record<number, Partial<PitchingStat>>>({});
    const [selectedBatters, setSelectedBatters] = useState<number[]>([]);
    const [selectedPitchers, setSelectedPitchers] = useState<number[]>([]);

    const initializeFromGame = useCallback((game: Game) => {
        // Initialize batting draft from game stats
        const initialBatting: Record<number, Partial<BattingStat>> = {};
        game.battingStats?.forEach(stat => {
            initialBatting[stat.playerId] = { ...stat };
        });
        setBattingDraft(initialBatting);
        setSelectedBatters(game.battingStats?.map(s => s.playerId) || []);

        // Initialize pitching draft from game stats
        const initialPitching: Record<number, Partial<PitchingStat>> = {};
        game.pitchingStats?.forEach(stat => {
            initialPitching[stat.playerId] = { ...stat };
        });
        setPitchingDraft(initialPitching);
        setSelectedPitchers(game.pitchingStats?.map(s => s.playerId) || []);
    }, []);

    const handleBattingChange = useCallback((playerId: number, field: keyof BattingStat, value: string) => {
        setBattingDraft(prev => ({
            ...prev,
            [playerId]: { ...prev[playerId], [field]: parseInt(value) || 0 }
        }));

        if (onSaveBatting) {
            onSaveBatting(playerId, { [field]: parseInt(value) || 0 });
        }
    }, [onSaveBatting]);

    const handlePitchingChange = useCallback((playerId: number, field: keyof PitchingStat, value: string) => {
        setPitchingDraft(prev => ({
            ...prev,
            [playerId]: { ...prev[playerId], [field]: parseFloat(value) || 0 }
        }));

        if (onSavePitching) {
            onSavePitching(playerId, { [field]: parseFloat(value) || 0 });
        }
    }, [onSavePitching]);

    const getBattingStat = useCallback((playerId: number, field: keyof BattingStat): string => {
        const value = battingDraft[playerId]?.[field];
        return value !== undefined ? String(value) : "";
    }, [battingDraft]);

    const getPitchingStat = useCallback((playerId: number, field: keyof PitchingStat): string => {
        const value = pitchingDraft[playerId]?.[field];
        return value !== undefined ? String(value) : "";
    }, [pitchingDraft]);

    const addBatter = useCallback((playerIdString: string) => {
        const playerId = parseInt(playerIdString);
        if (!selectedBatters.includes(playerId)) {
            setSelectedBatters(prev => [...prev, playerId]);
        }
    }, [selectedBatters]);

    const removeBatter = useCallback((playerId: number) => {
        setSelectedBatters(prev => prev.filter(id => id !== playerId));
    }, []);

    const addPitcher = useCallback((playerIdString: string) => {
        const playerId = parseInt(playerIdString);
        if (!selectedPitchers.includes(playerId)) {
            setSelectedPitchers(prev => [...prev, playerId]);
        }
    }, [selectedPitchers]);

    const removePitcher = useCallback((playerId: number) => {
        setSelectedPitchers(prev => prev.filter(id => id !== playerId));
    }, []);

    return {
        battingDraft,
        pitchingDraft,
        selectedBatters,
        selectedPitchers,
        handleBattingChange,
        handlePitchingChange,
        getBattingStat,
        getPitchingStat,
        addBatter,
        removeBatter,
        addPitcher,
        removePitcher,
        initializeFromGame
    };
}
