"use client";

import type { Game, Team } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    aggregatePlayerStats,
    calculateTeamGamesPlayed,
    getBattingLeaders,
    getPitchingLeaders,
    type BattingLeader,
    type PitchingLeader
} from "@/lib/stats-utils";
import LeaderBoardTable from "./LeaderBoardTable";

interface LeaderBoardProps {
    games: Game[];
    teams: Team[];
}

export default function LeaderBoard({ games, teams }: LeaderBoardProps) {
    const teamGamesPlayed = calculateTeamGamesPlayed(games, teams);
    const playerStats = aggregatePlayerStats(games, teams);

    const battingLeaders = getBattingLeaders(playerStats, teamGamesPlayed);
    const pitchingLeaders = getPitchingLeaders(playerStats, teamGamesPlayed);

    const battingColumns = [
        { key: 'rank' as const, label: '#' },
        { key: 'name' as const, label: 'Jugador / Equipo' },
        {
            key: 'avg' as const,
            label: 'AVG',
            align: 'right' as const,
            isPrimary: true,
            format: (v: number) => v.toFixed(3).replace(/^0/, '')
        },
        { key: 'hr' as const, label: 'HR', align: 'right' as const },
        { key: 'rbi' as const, label: 'RBI', align: 'right' as const },
    ];

    const pitchingColumns = [
        { key: 'rank' as const, label: '#' },
        { key: 'name' as const, label: 'Jugador / Equipo' },
        {
            key: 'era' as const,
            label: 'ERA',
            align: 'right' as const,
            isPrimary: true,
            format: (v: number) => v.toFixed(2)
        },
        { key: 'so' as const, label: 'SO', align: 'right' as const },
        {
            key: 'ip' as const,
            label: 'IP',
            align: 'right' as const,
            format: (v: number) => v.toFixed(1)
        },
    ];

    return (
        <Tabs defaultValue="ataque" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-primary/5 p-1 border border-primary/10 rounded-xl mb-8">
                <TabsTrigger
                    value="ataque"
                    className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[11px] py-3 transition-all"
                >
                    BATEADORES
                </TabsTrigger>
                <TabsTrigger
                    value="pitcheo"
                    className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[11px] py-3 transition-all"
                >
                    LANZADORES
                </TabsTrigger>
            </TabsList>

            <TabsContent value="ataque" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-400">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
                    <div>
                        <h3 className="font-black text-2xl uppercase tracking-tighter text-primary">TOP BATEADORES</h3>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Ronda Inicial • Paraná 2026</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">mínimo 2.1 PA / Juego</span>
                    </div>
                </div>
                <LeaderBoardTable<BattingLeader> leaders={battingLeaders} columns={battingColumns} />
            </TabsContent>

            <TabsContent value="pitcheo" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-400">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
                    <div>
                        <h3 className="font-black text-2xl uppercase tracking-tighter text-primary">TOP LANZADORES</h3>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Ronda Inicial • Paraná 2026</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">mínimo 2.1 IP / Juego</span>
                    </div>
                </div>
                <LeaderBoardTable<PitchingLeader> leaders={pitchingLeaders} columns={pitchingColumns} />
            </TabsContent>
        </Tabs>
    );
}
