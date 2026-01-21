import { useState, useCallback, useEffect, useRef } from "react";
import type { Team, Game, Standing, BattingStat, PitchingStat } from "@/lib/types";
import { updateGame, saveBattingStat, savePitchingStat, resetTournamentScores } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useStandings } from "./useStandings";
import { updateGameInning, swapGameTeams, ensureGameInnings } from "@/lib/innings-utils";

export interface UseTournamentStateProps {
    initialTeams: Team[];
    initialGames: Game[];
}

export function useTournamentState({ initialTeams, initialGames }: UseTournamentStateProps) {
    const [teams, setTeams] = useState<Team[]>(initialTeams);
    const [preliminaryGames, setPreliminaryGames] = useState<Game[]>(
        initialGames
            .filter(g => !g.isChampionship)
            .map(ensureGameInnings)
    );
    const [championshipGame, setChampionshipGame] = useState<Game>(() => {
        const found = initialGames.find(g => g.isChampionship);
        if (found) {
            return ensureGameInnings(found);
        }
        return {
            id: 16,
            team1Id: "",
            score1: "",
            hits1: "",
            errors1: "",
            team2Id: "",
            score2: "",
            hits2: "",
            errors2: "",
            day: "DÍA 4: Sábado, 21 de marzo",
            time: "21:00",
            innings: Array(7).fill(0).map(() => ["", ""]),
            isChampionship: true
        };
    });

    const [champion, setChampion] = useState<string | null>(null);
    const [standings, setStandings] = useState<Standing[]>([]);
    const [showConfetti, setShowConfetti] = useState(false);

    const gamesToPersist = useRef<Set<number>>(new Set());
    const persistTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { toast } = useToast();
    const { calculateStandings } = useStandings(teams);

    const markGameForPersistence = useCallback((gameId: number) => {
        gamesToPersist.current.add(gameId);
    }, []);

    // Standings calculation effect
    useEffect(() => {
        const newStandings = calculateStandings(preliminaryGames);
        setStandings(newStandings);

        if (newStandings.length > 1) {
            setChampionshipGame(prev => {
                const newChampGame = {
                    ...prev,
                    team1Id: String(newStandings[1].teamId),
                    team2Id: String(newStandings[0].teamId)
                };
                if (prev.team1Id !== newChampGame.team1Id || prev.team2Id !== newChampGame.team2Id) {
                    markGameForPersistence(newChampGame.id);
                }
                return newChampGame;
            });
        }
    }, [preliminaryGames, calculateStandings, markGameForPersistence]);

    // Persistence effect
    useEffect(() => {
        if (gamesToPersist.current.size === 0) return;

        if (persistTimeoutRef.current) {
            clearTimeout(persistTimeoutRef.current);
        }

        persistTimeoutRef.current = setTimeout(async () => {
            const gameIds = Array.from(gamesToPersist.current);
            gamesToPersist.current.clear();

            for (const gameId of gameIds) {
                try {
                    let gameToSave: Game | undefined;
                    if (championshipGame.id === gameId) {
                        gameToSave = championshipGame;
                    } else {
                        gameToSave = preliminaryGames.find(g => g.id === gameId);
                    }

                    if (gameToSave) {
                        await updateGame(gameToSave.id, gameToSave);
                    }
                } catch (error) {
                    console.error(`Failed to save game ${gameId}`, error);
                    toast({
                        variant: "destructive",
                        title: "Error de Guardado",
                        description: "No se pudieron guardar los cambios en la base de datos.",
                    });
                }
            }
        }, 500);

        return () => {
            if (persistTimeoutRef.current) {
                clearTimeout(persistTimeoutRef.current);
            }
        };
    }, [preliminaryGames, championshipGame, toast]);

    const handleGameChange = useCallback((
        gameId: number,
        field: keyof Game,
        value: string,
        isChampionship = false
    ) => {
        if (isChampionship) {
            setChampionshipGame(prev => {
                const updatedGame = { ...prev, [field]: value };
                if (field === 'score1' || field === 'score2') {
                    checkChampionshipWinner(updatedGame);
                }
                markGameForPersistence(gameId);
                return updatedGame;
            });
        } else {
            setPreliminaryGames(prevGames => {
                const newGames = prevGames.map(game =>
                    game.id === gameId ? { ...game, [field]: value } : game
                );
                markGameForPersistence(gameId);
                return newGames;
            });
        }
    }, [markGameForPersistence]);

    const handleInningChange = useCallback((
        gameId: number,
        inningIndex: number,
        teamIndex: 0 | 1,
        value: string,
        isChampionship = false
    ) => {
        if (isChampionship) {
            setChampionshipGame(prev => {
                const updatedGame = updateGameInning(prev, inningIndex, teamIndex, value);
                checkChampionshipWinner(updatedGame);
                markGameForPersistence(gameId);
                return updatedGame;
            });
        } else {
            setPreliminaryGames(prevGames => {
                const newGames = prevGames.map(game =>
                    game.id === gameId ? updateGameInning(game, inningIndex, teamIndex, value) : game
                );
                markGameForPersistence(gameId);
                return newGames;
            });
        }
    }, [markGameForPersistence]);

    const handleSaveBatting = useCallback(async (gameId: number, playerId: number, stats: Partial<BattingStat>) => {
        try {
            await saveBattingStat({ gameId, playerId, stats });

            const updateGameStats = (game: Game): Game => {
                const existingStats = game.battingStats || [];
                const index = existingStats.findIndex(s => s.playerId === playerId);
                const newBattingStats = [...existingStats];
                if (index > -1) {
                    newBattingStats[index] = { ...newBattingStats[index], ...stats };
                } else {
                    newBattingStats.push({ gameId, playerId, ...stats } as BattingStat);
                }
                return { ...game, battingStats: newBattingStats };
            };

            if (championshipGame.id === gameId) {
                setChampionshipGame(prev => updateGameStats(prev));
            } else {
                setPreliminaryGames(prev => prev.map(g => g.id === gameId ? updateGameStats(g) : g));
            }
        } catch (error) {
            console.error("Failed to save batting stats", error);
        }
    }, [championshipGame.id]);

    const handleSavePitching = useCallback(async (gameId: number, playerId: number, stats: Partial<PitchingStat>) => {
        try {
            await savePitchingStat({ gameId, playerId, stats });

            const updateGameStats = (game: Game): Game => {
                const existingStats = game.pitchingStats || [];
                const index = existingStats.findIndex(s => s.playerId === playerId);
                const newPitchingStats = [...existingStats];
                if (index > -1) {
                    newPitchingStats[index] = { ...newPitchingStats[index], ...stats };
                } else {
                    newPitchingStats.push({ gameId, playerId, ...stats } as PitchingStat);
                }
                return { ...game, pitchingStats: newPitchingStats };
            };

            if (championshipGame.id === gameId) {
                setChampionshipGame(prev => updateGameStats(prev));
            } else {
                setPreliminaryGames(prev => prev.map(g => g.id === gameId ? updateGameStats(g) : g));
            }
        } catch (error) {
            console.error("Failed to save pitching stats", error);
        }
    }, [championshipGame.id]);

    const handleSwapTeams = useCallback((gameId: number) => {
        if (championshipGame.id === gameId) {
            setChampionshipGame(prev => {
                const updated = swapGameTeams(prev);
                markGameForPersistence(gameId);
                return updated;
            });
        } else {
            setPreliminaryGames(prev => {
                const updated = prev.map(g => g.id === gameId ? swapGameTeams(g) : g);
                markGameForPersistence(gameId);
                return updated;
            });
        }
    }, [championshipGame.id, markGameForPersistence]);

    const checkChampionshipWinner = useCallback((finalGame: Game) => {
        const { team1Id, team2Id, score1, score2 } = finalGame;
        if (score1 !== "" && score2 !== "" && score1 !== score2) {
            const s1 = parseInt(score1);
            const s2 = parseInt(score2);
            const winnerId = s1 > s2 ? team1Id : team2Id;

            const winner = teams.find(t => String(t.id) === winnerId);
            if (winner) {
                setChampion(winner.name);
                setShowConfetti(true);
                toast({
                    title: "¡Campeón Definido!",
                    description: `El equipo campeón es ${winner.name}.`
                });
            }
        }
    }, [teams, toast]);

    const handleResetTournament = useCallback(async () => {
        if (window.confirm("¿Estás seguro de que quieres reiniciar el torneo?")) {
            try {
                if (persistTimeoutRef.current) clearTimeout(persistTimeoutRef.current);
                gamesToPersist.current.clear();

                setPreliminaryGames(prev => prev.map(g => ({
                    ...g,
                    score1: "", score2: "", hits1: "", hits2: "", errors1: "", errors2: "",
                    innings: Array(7).fill(0).map(() => ["", ""])
                })));
                setChampionshipGame(prev => ({
                    ...prev,
                    team1Id: "", team2Id: "",
                    score1: "", score2: "", hits1: "", hits2: "", errors1: "", errors2: "",
                    innings: Array(7).fill(0).map(() => ["", ""])
                }));
                setChampion(null);
                setShowConfetti(false);

                const result = await resetTournamentScores();
                if (result.success) {
                    toast({ title: "Torneo Reiniciado", description: "La base de datos se ha limpiado correctamente." });
                    window.location.href = '/?t=' + Date.now();
                } else {
                    toast({ variant: "destructive", title: "Error", description: "Hubo un problema al limpiar la base de datos." });
                }
            } catch (error) {
                console.error("Reset error:", error);
                toast({ variant: "destructive", title: "Error", description: "Error inesperado al reiniciar." });
            }
        }
    }, [toast]);

    return {
        teams,
        preliminaryGames,
        championshipGame,
        champion,
        standings,
        showConfetti,
        setShowConfetti,
        handleGameChange,
        handleInningChange,
        handleSaveBatting,
        handleSavePitching,
        handleSwapTeams,
        handleResetTournament
    };
}
