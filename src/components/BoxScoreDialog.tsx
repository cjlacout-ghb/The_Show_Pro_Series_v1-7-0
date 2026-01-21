"use client";

import { useEffect } from "react";
import type { Game, Team, BattingStat, PitchingStat } from "@/lib/types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardList, Trash2, Plus } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// New Hooks
import { useBoxScoreStats } from "@/hooks/useBoxScoreStats";

interface BoxScoreDialogProps {
    game: Game;
    teams: Team[];
    onSaveBatting: (playerId: number, stats: Partial<BattingStat>) => Promise<void>;
    onSavePitching: (playerId: number, stats: Partial<PitchingStat>) => Promise<void>;
}

export default function BoxScoreDialog({ game, teams, onSaveBatting, onSavePitching }: BoxScoreDialogProps) {
    const {
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
    } = useBoxScoreStats(game.id, onSaveBatting, onSavePitching);

    useEffect(() => {
        initializeFromGame(game);
    }, [game, initializeFromGame]);

    const team1 = teams.find(t => String(t.id) === game.team1Id);
    const team2 = teams.find(t => String(t.id) === game.team2Id);
    const allPlayersFromTeams = [...(team1?.players || []), ...(team2?.players || [])];

    const StatInput = ({ label, value, onChange, type = "number" }: any) => (
        <div className="flex flex-col gap-1">
            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">{label}</Label>
            <Input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-8 text-xs font-bold"
            />
        </div>
    );

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-primary/10 hover:text-primary transition-all">
                    <ClipboardList className="w-4 h-4" />
                    BOX SCORE
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden border-primary/20">
                <DialogHeader className="p-6 bg-primary/5 border-b border-primary/10">
                    <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <ClipboardList className="w-6 h-6 text-primary" />
                        </div>
                        Estadísticas del Partido
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="batting" className="w-full">
                    <TabsList className="w-full justify-start rounded-none border-b border-primary/10 bg-muted/30 p-0 h-12">
                        <TabsTrigger value="batting" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 px-8 h-full font-bold text-xs uppercase tracking-widest">Bateo</TabsTrigger>
                        <TabsTrigger value="pitching" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 px-8 h-full font-bold text-xs uppercase tracking-widest">Pitcheo</TabsTrigger>
                    </TabsList>

                    <TabsContent value="batting" className="p-0 m-0">
                        <div className="p-6 bg-primary/[0.02]">
                            <div className="flex items-center gap-4 mb-6">
                                <Select onValueChange={addBatter}>
                                    <SelectTrigger className="w-[300px] h-10 font-bold text-sm bg-background border-primary/20">
                                        <SelectValue placeholder="AGREGAR BATEADOR..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allPlayersFromTeams
                                            .filter(p => !selectedBatters.includes(p.id))
                                            .map(p => (
                                                <SelectItem key={p.id} value={String(p.id)} className="font-bold text-xs">
                                                    {p.name} ({teams.find(t => t.id === p.teamId)?.name})
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <ScrollArea className="h-[400px] pr-4">
                                <div className="space-y-4">
                                    {selectedBatters.map(playerId => {
                                        const player = allPlayersFromTeams.find(p => p.id === playerId);
                                        const team = teams.find(t => t.id === player?.teamId);
                                        return (
                                            <div key={playerId} className="flex flex-col gap-3 p-4 bg-background border border-primary/10 rounded-xl shadow-sm hover:border-primary/30 transition-all">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-black text-sm uppercase tracking-tight">{player?.name}</div>
                                                        <div className="text-[10px] font-bold text-muted-foreground uppercase">{team?.name}</div>
                                                    </div>
                                                    <Button variant="ghost" size="sm" onClick={() => removeBatter(playerId)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/5">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                                                    <StatInput label="PA" value={getBattingStat(playerId, "plateAppearances")} onChange={(v: string) => handleBattingChange(playerId, "plateAppearances", v)} />
                                                    <StatInput label="AB" value={getBattingStat(playerId, "atBats")} onChange={(v: string) => handleBattingChange(playerId, "atBats", v)} />
                                                    <StatInput label="H" value={getBattingStat(playerId, "hits")} onChange={(v: string) => handleBattingChange(playerId, "hits", v)} />
                                                    <StatInput label="R" value={getBattingStat(playerId, "runs")} onChange={(v: string) => handleBattingChange(playerId, "runs", v)} />
                                                    <StatInput label="RBI" value={getBattingStat(playerId, "rbi")} onChange={(v: string) => handleBattingChange(playerId, "rbi", v)} />
                                                    <StatInput label="HR" value={getBattingStat(playerId, "homeRuns")} onChange={(v: string) => handleBattingChange(playerId, "homeRuns", v)} />
                                                    <StatInput label="BB" value={getBattingStat(playerId, "walks")} onChange={(v: string) => handleBattingChange(playerId, "walks", v)} />
                                                    <StatInput label="SO" value={getBattingStat(playerId, "strikeOuts")} onChange={(v: string) => handleBattingChange(playerId, "strikeOuts", v)} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </div>
                    </TabsContent>

                    <TabsContent value="pitching" className="p-0 m-0">
                        <div className="p-6 bg-primary/[0.02]">
                            <div className="flex items-center gap-4 mb-6">
                                <Select onValueChange={addPitcher}>
                                    <SelectTrigger className="w-[300px] h-10 font-bold text-sm bg-background border-primary/20">
                                        <SelectValue placeholder="AGREGAR LANZADOR..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allPlayersFromTeams
                                            .filter(p => !selectedPitchers.includes(p.id))
                                            .map(p => (
                                                <SelectItem key={p.id} value={String(p.id)} className="font-bold text-xs">
                                                    {p.name} ({teams.find(t => t.id === p.teamId)?.name})
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <ScrollArea className="h-[400px] pr-4">
                                <div className="space-y-4">
                                    {selectedPitchers.map(playerId => {
                                        const player = allPlayersFromTeams.find(p => p.id === playerId);
                                        const team = teams.find(t => t.id === player?.teamId);
                                        return (
                                            <div key={playerId} className="flex flex-col gap-3 p-4 bg-background border border-primary/10 rounded-xl shadow-sm hover:border-primary/30 transition-all">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-black text-sm uppercase tracking-tight">{player?.name}</div>
                                                        <div className="text-[10px] font-bold text-muted-foreground uppercase">{team?.name}</div>
                                                    </div>
                                                    <Button variant="ghost" size="sm" onClick={() => removePitcher(playerId)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/5">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-3">
                                                    <StatInput label="IP" value={getPitchingStat(playerId, "inningsPitched")} onChange={(v: string) => handlePitchingChange(playerId, "inningsPitched", v)} type="text" />
                                                    <StatInput label="H" value={getPitchingStat(playerId, "hits")} onChange={(v: string) => handlePitchingChange(playerId, "hits", v)} />
                                                    <StatInput label="R" value={getPitchingStat(playerId, "runs")} onChange={(v: string) => handlePitchingChange(playerId, "runs", v)} />
                                                    <StatInput label="ER" value={getPitchingStat(playerId, "earnedRuns")} onChange={(v: string) => handlePitchingChange(playerId, "earnedRuns", v)} />
                                                    <StatInput label="BB" value={getPitchingStat(playerId, "walks")} onChange={(v: string) => handlePitchingChange(playerId, "walks", v)} />
                                                    <StatInput label="SO" value={getPitchingStat(playerId, "strikeOuts")} onChange={(v: string) => handlePitchingChange(playerId, "strikeOuts", v)} />
                                                    <StatInput label="W" value={getPitchingStat(playerId, "wins")} onChange={(v: string) => handlePitchingChange(playerId, "wins", v)} />
                                                    <StatInput label="L" value={getPitchingStat(playerId, "losses")} onChange={(v: string) => handlePitchingChange(playerId, "losses", v)} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="p-6 bg-muted/30 border-t border-primary/10">
                    <Button variant="outline" className="w-full font-black uppercase tracking-widest text-[11px] h-12" asChild>
                        <DialogTrigger>Cerrar Panel</DialogTrigger>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
