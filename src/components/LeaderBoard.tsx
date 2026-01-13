"use client";

import type { Game, Team, Player, BattingStat, PitchingStat, Standing } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";

interface LeaderBoardProps {
    games: Game[];
    teams: Team[];
}

export default function LeaderBoard({ games, teams }: LeaderBoardProps) {
    // 1. Aggregate stats per player
    const playerStats: Record<number, {
        batting: Partial<BattingStat> & { gamesPlayed: number },
        pitching: Partial<PitchingStat> & { gamesPlayed: number },
        player: Player & { teamName: string }
    }> = {};

    // Initialize player stats
    teams.forEach(team => {
        team.players.forEach(player => {
            playerStats[player.id] = {
                player: { ...player, teamName: team.name },
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

    // Calculate team games played to determine qualifiers
    const teamGamesPlayed: Record<number, number> = {};
    teams.forEach(t => teamGamesPlayed[t.id] = 0);

    games.forEach(game => {
        if (game.score1 !== "" && game.score2 !== "") {
            const team1Id = parseInt(game.team1Id);
            const team2Id = parseInt(game.team2Id);
            if (!isNaN(team1Id)) teamGamesPlayed[team1Id] = (teamGamesPlayed[team1Id] || 0) + 1;
            if (!isNaN(team2Id)) teamGamesPlayed[team2Id] = (teamGamesPlayed[team2Id] || 0) + 1;

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

    // Qualifiers
    const getBattingLeaders = (limit = 10) => {
        return Object.values(playerStats)
            .filter(ps => {
                const teamGames = teamGamesPlayed[ps.player.teamId as keyof typeof teamGamesPlayed] || 0;
                // Only qualify if team has played at least one game and player meets PA requirement
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
    };

    const getPitchingLeaders = (limit = 10) => {
        return Object.values(playerStats)
            .filter(ps => {
                const teamGames = teamGamesPlayed[ps.player.teamId as keyof typeof teamGamesPlayed] || 0;
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
    };

    const battingLeaders = getBattingLeaders();
    const pitchingLeaders = getPitchingLeaders();

    return (
        <Tabs defaultValue="ataque" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-primary/5 p-1 border border-primary/10 rounded-xl mb-8">
                <TabsTrigger
                    value="ataque"
                    className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[11px] py-3 transition-all"
                >
                    Ataque (Bateo)
                </TabsTrigger>
                <TabsTrigger
                    value="pitcheo"
                    className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[11px] py-3 transition-all"
                >
                    Defensa (Pitcheo)
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

                <div className="rounded-xl border border-primary/10 bg-background/50 overflow-hidden shadow-inner">
                    <Table>
                        <TableHeader className="bg-primary/[0.03]">
                            <TableRow className="border-b border-primary/10 hover:bg-transparent">
                                <TableHead className="w-12 text-center text-[10px] font-black uppercase tracking-widest text-primary/60">#</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary/60">Jugador / Equipo</TableHead>
                                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-primary/60">AVG</TableHead>
                                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-primary/60">HR</TableHead>
                                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-primary/60">RBI</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {battingLeaders.length > 0 ? battingLeaders.map((leader, i) => (
                                <TableRow key={leader.id} className="group hover:bg-primary/[0.02] border-b border-primary/5 transition-colors">
                                    <TableCell className="text-center">
                                        {i < 3 ? (
                                            <div className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center mx-auto text-[10px] font-black",
                                                i === 0 ? "bg-primary text-primary-foreground shadow-[0_0_10px_HSL(var(--primary)/0.5)]" :
                                                    i === 1 ? "bg-zinc-400 text-zinc-950" :
                                                        "bg-amber-700 text-amber-50"
                                            )}>
                                                {i + 1}
                                            </div>
                                        ) : (
                                            <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="font-bold text-sm uppercase tracking-tight group-hover:text-primary transition-colors">{leader.name}</div>
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{leader.teamName}</div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-black text-primary text-base">
                                        {leader.avg.toFixed(3).replace(/^0/, '')}
                                    </TableCell>
                                    <TableCell className="text-right font-bold">{leader.hr}</TableCell>
                                    <TableCell className="text-right font-bold">{leader.rbi}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-16">
                                        <div className="flex flex-col items-center gap-2 opacity-30">
                                            <Trophy className="w-12 h-12 mb-2" />
                                            <p className="text-xs font-black uppercase tracking-[0.2em]">Esperando datos de partidos...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
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

                <div className="rounded-xl border border-primary/10 bg-background/50 overflow-hidden shadow-inner">
                    <Table>
                        <TableHeader className="bg-primary/[0.03]">
                            <TableRow className="border-b border-primary/10 hover:bg-transparent">
                                <TableHead className="w-12 text-center text-[10px] font-black uppercase tracking-widest text-primary/60">#</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary/60">Jugador / Equipo</TableHead>
                                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-primary/60">ERA</TableHead>
                                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-primary/60">SO</TableHead>
                                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-primary/60">IP</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pitchingLeaders.length > 0 ? pitchingLeaders.map((leader, i) => (
                                <TableRow key={leader.id} className="group hover:bg-primary/[0.02] border-b border-primary/5 transition-colors">
                                    <TableCell className="text-center">
                                        {i < 3 ? (
                                            <div className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center mx-auto text-[10px] font-black",
                                                i === 0 ? "bg-primary text-primary-foreground shadow-[0_0_10px_HSL(var(--primary)/0.5)]" :
                                                    i === 1 ? "bg-zinc-400 text-zinc-950" :
                                                        "bg-amber-700 text-amber-50"
                                            )}>
                                                {i + 1}
                                            </div>
                                        ) : (
                                            <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <div className="font-bold text-sm uppercase tracking-tight group-hover:text-primary transition-colors">{leader.name}</div>
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{leader.teamName}</div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-black text-primary text-base">
                                        {leader.era.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right font-bold">{leader.so}</TableCell>
                                    <TableCell className="text-right font-bold">{leader.ip.toFixed(1)}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-16">
                                        <div className="flex flex-col items-center gap-2 opacity-30">
                                            <Trophy className="w-12 h-12 mb-2" />
                                            <p className="text-xs font-black uppercase tracking-[0.2em]">Esperando datos de partidos...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </TabsContent>
        </Tabs>
    );
}
