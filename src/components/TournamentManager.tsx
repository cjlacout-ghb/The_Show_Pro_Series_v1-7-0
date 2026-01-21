"use client";

import { useState, useRef, useEffect } from "react";
import type { Team, Game } from "@/lib/types";
import TeamSetup from "@/components/team-setup";
import ScheduleCard from "@/components/schedule-card";
import StandingsTable from "@/components/standings-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Confetti from "react-confetti";
import LeaderBoard from "./LeaderBoard";

// New Hooks and Utilities
import { useTournamentState } from "@/hooks/useTournamentState";

// New Sub-components
import {
    TournamentHeader,
    TournamentMenu,
    ChampionCard,
    TournamentFooter,
    type ViewType
} from "./tournament";

interface TournamentManagerProps {
    initialTeams: Team[];
    initialGames: Game[];
    initialBattingStats: any[];
    initialPitchingStats: any[];
}

export default function TournamentManager({ initialTeams, initialGames }: TournamentManagerProps) {
    const {
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
    } = useTournamentState({ initialTeams, initialGames });

    const [currentView, setCurrentView] = useState<ViewType>('menu');
    const [openAccordion, setOpenAccordion] = useState<string | undefined>(undefined);

    const championCardRef = useRef<HTMLDivElement>(null);
    const [confettiSize, setConfettiSize] = useState({ width: 0, height: 0, top: 0, left: 0 });

    const handleReturnToTop = () => {
        setOpenAccordion(undefined);
        setCurrentView('menu');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Confetti effect sizing
    useEffect(() => {
        if (champion && showConfetti) {
            setTimeout(() => {
                if (championCardRef.current) {
                    championCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const { width, height, top, left } = championCardRef.current.getBoundingClientRect();
                    setConfettiSize({ width, height, top: top + window.scrollY, left: left + window.scrollX });
                }
            }, 100);
            const timer = setTimeout(() => setShowConfetti(false), 8000);
            return () => clearTimeout(timer);
        }
    }, [champion, showConfetti, setShowConfetti]);

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            {showConfetti && (
                <Confetti
                    recycle={false}
                    numberOfPieces={500}
                    width={confettiSize.width}
                    height={confettiSize.height}
                    style={{ position: 'absolute', top: confettiSize.top, left: confettiSize.left }}
                />
            )}

            <main className="flex-1 container mx-auto p-4 md:p-8">
                <TournamentHeader visible={currentView === 'menu'} />

                {currentView === 'menu' ? (
                    <TournamentMenu onNavigate={setCurrentView} />
                ) : (
                    <div className="space-y-10">
                        <div className="flex justify-start mb-8">
                            <Button
                                variant="ghost"
                                size="lg"
                                onClick={() => setCurrentView('menu')}
                                className="group gap-3 text-muted-foreground hover:text-primary transition-all duration-300 pl-0"
                            >
                                <div className="p-2 rounded-full bg-primary/5 group-hover:bg-primary/20 transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                </div>
                                <span className="font-bold uppercase tracking-widest text-sm">Regresar al Menú</span>
                            </Button>
                        </div>

                        {currentView === 'teams' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <TeamSetup teams={teams} openAccordion={openAccordion} setOpenAccordion={setOpenAccordion} onNavigate={handleReturnToTop} />
                            </div>
                        )}

                        {currentView === 'standings' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {champion && <ChampionCard ref={championCardRef} championName={champion} />}
                                <StandingsTable teams={teams} standings={standings} onNavigate={handleReturnToTop} />
                            </div>
                        )}

                        {currentView === 'leaders' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <Card className="border-primary/10 shadow-[0_10px_50px_-12px_rgba(0,0,0,0.5)] bg-card/50 backdrop-blur-sm overflow-hidden">
                                    <CardHeader className="border-b border-primary/5 bg-primary/5">
                                        <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                                            <span className="text-primary">🏆</span> Panel de Líderes
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <LeaderBoard games={[...preliminaryGames, championshipGame]} teams={teams} />
                                    </CardContent>
                                    <CardFooter className="flex justify-end p-6 border-t border-primary/5 bg-primary/[0.01]">
                                        <Button
                                            variant="secondary"
                                            onClick={handleReturnToTop}
                                            className="font-bold uppercase tracking-widest text-[11px] hover:translate-y-[-2px] transition-transform"
                                        >
                                            Regresar al Menú
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        )}

                        {currentView === 'games' && (
                            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <ScheduleCard
                                    title="Ronda Inicial"
                                    games={preliminaryGames}
                                    teams={teams}
                                    onGameChange={handleGameChange}
                                    onInningChange={handleInningChange}
                                    onSaveBatting={handleSaveBatting}
                                    onSavePitching={handleSavePitching}
                                    onSwapTeams={handleSwapTeams}
                                    onNavigate={handleReturnToTop}
                                    onNavigateToStandings={() => setCurrentView('standings')}
                                />
                                <ScheduleCard
                                    title="Partido Final"
                                    games={[championshipGame]}
                                    teams={teams}
                                    onGameChange={(gameId, field, value) => handleGameChange(gameId, field, value, true)}
                                    onInningChange={(gameId, inningIndex, teamIndex, value) => handleInningChange(gameId, inningIndex, teamIndex, value, true)}
                                    onSaveBatting={handleSaveBatting}
                                    onSavePitching={handleSavePitching}
                                    onSwapTeams={handleSwapTeams}
                                    onNavigate={handleReturnToTop}
                                    onNavigateToStandings={() => setCurrentView('standings')}
                                    isChampionship
                                />
                            </div>
                        )}
                    </div>
                )}
            </main>

            {currentView === 'menu' && <TournamentFooter onReset={handleResetTournament} />}
        </div>
    );
}
