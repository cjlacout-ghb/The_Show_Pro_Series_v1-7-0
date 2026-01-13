"use client";

import { useState, useEffect } from "react";
import type { Game, Team, BattingStat, PitchingStat, Player } from "@/lib/types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardList, Trash2, Plus } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface BoxScoreDialogProps {
    game: Game;
    teams: Team[];
    onSaveBatting: (playerId: number, stats: Partial<BattingStat>) => Promise<void>;
    onSavePitching: (playerId: number, stats: Partial<PitchingStat>) => Promise<void>;
}

export default function BoxScoreDialog({ game, teams, onSaveBatting, onSavePitching }: BoxScoreDialogProps) {
    const [activeTab, setActiveTab] = useState("batting");
    const [selectedTeamId, setSelectedTeamId] = useState<string>(game.team1Id);
    const [activeBatters, setActiveBatters] = useState<number[]>([]);
    const [activePitchers, setActivePitchers] = useState<number[]>([]);

    const team1 = teams.find(t => String(t.id) === game.team1Id);
    const team2 = teams.find(t => String(t.id) === game.team2Id);
    const currentTeam = teams.find(t => String(t.id) === selectedTeamId);

    // Initialize active lists based on existing stats
    useEffect(() => {
        if (!currentTeam) return;

        const teamPlayerIds = new Set(currentTeam.players.map(p => p.id));

        // Find batters with existing stats
        const existingBatters = game.battingStats
            ?.filter(s => teamPlayerIds.has(s.playerId))
            .map(s => s.playerId) || [];

        // Find pitchers with existing stats
        const existingPitchers = game.pitchingStats
            ?.filter(s => teamPlayerIds.has(s.playerId))
            .map(s => s.playerId) || [];

        setActiveBatters(prev => Array.from(new Set([...prev, ...existingBatters])));
        setActivePitchers(prev => Array.from(new Set([...prev, ...existingPitchers])));
    }, [selectedTeamId, game.battingStats, game.pitchingStats, currentTeam]);

    // Reset active lists when switching teams (optional, but keeps UI clean)
    useEffect(() => {
        setActiveBatters([]);
        setActivePitchers([]);
    }, [selectedTeamId]);


    const handleBattingChange = (playerId: number, field: keyof BattingStat, value: string) => {
        const numValue = parseInt(value) || 0;
        onSaveBatting(playerId, { [field]: numValue });
    };

    const handlePitchingChange = (playerId: number, field: keyof PitchingStat, value: string) => {
        const numValue = field === "inningsPitched" ? parseFloat(value) || 0 : parseInt(value) || 0;
        onSavePitching(playerId, { [field]: numValue });
    };

    const getBattingStat = (playerId: number, field: keyof BattingStat) => {
        const stat = game.battingStats?.find(s => s.playerId === playerId);
        return stat ? (stat[field] as number).toString() : "";
    };

    const getPitchingStat = (playerId: number, field: keyof PitchingStat) => {
        const stat = game.pitchingStats?.find(s => s.playerId === playerId);
        return stat ? (stat[field] as number).toString() : "";
    };

    const addBatter = (playerIdString: string) => {
        const playerId = parseInt(playerIdString);
        if (!activeBatters.includes(playerId)) {
            setActiveBatters([...activeBatters, playerId]);
        }
    };

    const removeBatter = (playerId: number) => {
        setActiveBatters(activeBatters.filter(id => id !== playerId));
    };

    const addPitcher = (playerIdString: string) => {
        const playerId = parseInt(playerIdString);
        if (!activePitchers.includes(playerId)) {
            setActivePitchers([...activePitchers, playerId]);
        }
    };

    const removePitcher = (playerId: number) => {
        setActivePitchers(activePitchers.filter(id => id !== playerId));
    };

    const availableBatters = currentTeam?.players.filter(p => !activeBatters.includes(p.id)) || [];
    const availablePitchers = currentTeam?.players.filter(p => !activePitchers.includes(p.id)) || [];

    // Sort active players by number for display
    const sortedActiveBatters = currentTeam?.players
        .filter(p => activeBatters.includes(p.id))
        .sort((a, b) => activeBatters.indexOf(a.id) - activeBatters.indexOf(b.id)); // Keep insertion order? Or sort by roster number?
    // Let's stick to insertion order for lineup feeling, or roster number. 
    // User requested "add players one by one, according to the lineup".
    // Insertion order is best for "lineup".

    const displayBatters = activeBatters.map(id => currentTeam?.players.find(p => p.id === id)).filter(Boolean) as Player[];
    const displayPitchers = activePitchers.map(id => currentTeam?.players.find(p => p.id === id)).filter(Boolean) as Player[];


    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:border-primary hover:bg-primary/5 text-[10px] font-black uppercase tracking-widest">
                    <ClipboardList className="w-3.5 h-3.5" />
                    Box Score
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col border-primary/20 shadow-2xl bg-card/95 backdrop-blur-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black uppercase tracking-tighter">
                        Estadísticas del Juego: <span className="text-primary">{team1?.name}</span> vs <span className="text-primary">{team2?.name}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex gap-3 mb-4">
                    <Button
                        variant={selectedTeamId === String(team1?.id) ? "default" : "outline"}
                        onClick={() => setSelectedTeamId(String(team1?.id))}
                        className={`flex-1 font-bold uppercase tracking-widest text-[11px] h-12 transition-all ${selectedTeamId === String(team1?.id) ? 'shadow-lg shadow-primary/20' : 'border-primary/20 hover:bg-primary/5'}`}
                    >
                        {team1?.name}
                    </Button>
                    <Button
                        variant={selectedTeamId === String(team2?.id) ? "default" : "outline"}
                        onClick={() => setSelectedTeamId(String(team2?.id))}
                        className={`flex-1 font-bold uppercase tracking-widest text-[11px] h-12 transition-all ${selectedTeamId === String(team2?.id) ? 'shadow-lg shadow-primary/20' : 'border-primary/20 hover:bg-primary/5'}`}
                    >
                        {team2?.name}
                    </Button>
                </div>

                <Tabs defaultValue="batting" onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
                    <TabsList className="grid w-full grid-cols-2 bg-primary/5 p-1 border border-primary/10 rounded-xl mb-4">
                        <TabsTrigger
                            value="batting"
                            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[11px] py-2.5 transition-all"
                        >
                            Bateo
                        </TabsTrigger>
                        <TabsTrigger
                            value="pitching"
                            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[11px] py-2.5 transition-all"
                        >
                            Pitcheo
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="batting" className="flex-1 overflow-hidden flex flex-col gap-4 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-2 px-1">
                            <Select onValueChange={addBatter}>
                                <SelectTrigger className="w-full border-primary/10 bg-background/50 font-bold">
                                    <SelectValue placeholder="+ Agregar bateador al lineup..." />
                                </SelectTrigger>
                                <SelectContent className="bg-card/95 backdrop-blur-md border-primary/20">
                                    {availableBatters.map((player) => (
                                        <SelectItem key={player.id} value={String(player.id)} className="font-medium">
                                            <span className="font-mono text-primary/70">#{player.number}</span> {player.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <ScrollArea className="flex-1 pr-4 border border-primary/10 rounded-xl bg-background/30">
                            <Table>
                                <TableHeader className="bg-primary/[0.03]">
                                    <TableRow className="border-b border-primary/10 hover:bg-transparent">
                                        <TableHead className="w-[200px] text-[10px] font-black uppercase tracking-widest text-primary/60">Jugador</TableHead>
                                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-primary/60">PA</TableHead>
                                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-primary/60">AB</TableHead>
                                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-primary/60">H</TableHead>
                                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-primary/60">R</TableHead>
                                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-primary/60">RBI</TableHead>
                                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-primary/60">HR</TableHead>
                                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-primary/60">BB</TableHead>
                                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-primary/60">K</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {displayBatters.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={10} className="text-center py-16">
                                                <div className="flex flex-col items-center gap-2 opacity-30">
                                                    <ClipboardList className="w-10 h-10 mb-2" />
                                                    <p className="text-xs font-black uppercase tracking-[0.2em]">Agregue jugadores al lineup</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {displayBatters.map(player => (
                                        <TableRow key={player.id} className="group hover:bg-primary/[0.02] border-b border-primary/5 transition-colors">
                                            <TableCell className="font-bold text-sm">
                                                <span className="font-mono text-primary/60 mr-2">#{player.number}</span>
                                                <span className="uppercase tracking-tight">{player.name}</span>
                                            </TableCell>
                                            <TableCell><Input className="h-9 text-center rounded-lg bg-muted/30 border-transparent font-bold focus:bg-background focus:border-primary transition-all" value={getBattingStat(player.id, "plateAppearances")} onChange={(e) => handleBattingChange(player.id, "plateAppearances", e.target.value)} /></TableCell>
                                            <TableCell><Input className="h-9 text-center rounded-lg bg-muted/30 border-transparent font-bold focus:bg-background focus:border-primary transition-all" value={getBattingStat(player.id, "atBats")} onChange={(e) => handleBattingChange(player.id, "atBats", e.target.value)} /></TableCell>
                                            <TableCell><Input className="h-9 text-center rounded-lg bg-muted/30 border-transparent font-bold focus:bg-background focus:border-primary transition-all" value={getBattingStat(player.id, "hits")} onChange={(e) => handleBattingChange(player.id, "hits", e.target.value)} /></TableCell>
                                            <TableCell><Input className="h-9 text-center rounded-lg bg-muted/30 border-transparent font-bold focus:bg-background focus:border-primary transition-all" value={getBattingStat(player.id, "runs")} onChange={(e) => handleBattingChange(player.id, "runs", e.target.value)} /></TableCell>
                                            <TableCell><Input className="h-9 text-center rounded-lg bg-muted/30 border-transparent font-bold focus:bg-background focus:border-primary transition-all" value={getBattingStat(player.id, "rbi")} onChange={(e) => handleBattingChange(player.id, "rbi", e.target.value)} /></TableCell>
                                            <TableCell><Input className="h-9 text-center rounded-lg bg-muted/30 border-transparent font-bold focus:bg-background focus:border-primary transition-all" value={getBattingStat(player.id, "homeRuns")} onChange={(e) => handleBattingChange(player.id, "homeRuns", e.target.value)} /></TableCell>
                                            <TableCell><Input className="h-9 text-center rounded-lg bg-muted/30 border-transparent font-bold focus:bg-background focus:border-primary transition-all" value={getBattingStat(player.id, "walks")} onChange={(e) => handleBattingChange(player.id, "walks", e.target.value)} /></TableCell>
                                            <TableCell><Input className="h-9 text-center rounded-lg bg-muted/30 border-transparent font-bold focus:bg-background focus:border-primary transition-all" value={getBattingStat(player.id, "strikeOuts")} onChange={(e) => handleBattingChange(player.id, "strikeOuts", e.target.value)} /></TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/50 hover:text-destructive hover:bg-destructive/10 rounded-full opacity-0 group-hover:opacity-100 transition-all" onClick={() => removeBatter(player.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="pitching" className="flex-1 overflow-hidden flex flex-col gap-4 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-2 px-1">
                            <Select onValueChange={addPitcher}>
                                <SelectTrigger className="w-full border-primary/10 bg-background/50 font-bold">
                                    <SelectValue placeholder="+ Agregar lanzador..." />
                                </SelectTrigger>
                                <SelectContent className="bg-card/95 backdrop-blur-md border-primary/20">
                                    {availablePitchers.map((player) => (
                                        <SelectItem key={player.id} value={String(player.id)} className="font-medium">
                                            <span className="font-mono text-primary/70">#{player.number}</span> {player.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <ScrollArea className="flex-1 pr-4 border border-primary/10 rounded-xl bg-background/30">
                            <Table>
                                <TableHeader className="bg-primary/[0.03]">
                                    <TableRow className="border-b border-primary/10 hover:bg-transparent">
                                        <TableHead className="w-[200px] text-[10px] font-black uppercase tracking-widest text-primary/60">Lanzador</TableHead>
                                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-primary/60">IP</TableHead>
                                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-primary/60">H</TableHead>
                                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-primary/60">R</TableHead>
                                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-primary/60">ER</TableHead>
                                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-primary/60">BB</TableHead>
                                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-primary/60">K</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {displayPitchers.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-16">
                                                <div className="flex flex-col items-center gap-2 opacity-30">
                                                    <ClipboardList className="w-10 h-10 mb-2" />
                                                    <p className="text-xs font-black uppercase tracking-[0.2em]">Agregue lanzadores</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {displayPitchers.map(player => (
                                        <TableRow key={player.id} className="group hover:bg-primary/[0.02] border-b border-primary/5 transition-colors">
                                            <TableCell className="font-bold text-sm">
                                                <span className="font-mono text-primary/60 mr-2">#{player.number}</span>
                                                <span className="uppercase tracking-tight">{player.name}</span>
                                            </TableCell>
                                            <TableCell><Input className="h-9 text-center rounded-lg bg-muted/30 border-transparent font-bold focus:bg-background focus:border-primary transition-all" placeholder="0.0" value={getPitchingStat(player.id, "inningsPitched")} onChange={(e) => handlePitchingChange(player.id, "inningsPitched", e.target.value)} /></TableCell>
                                            <TableCell><Input className="h-9 text-center rounded-lg bg-muted/30 border-transparent font-bold focus:bg-background focus:border-primary transition-all" value={getPitchingStat(player.id, "hits")} onChange={(e) => handlePitchingChange(player.id, "hits", e.target.value)} /></TableCell>
                                            <TableCell><Input className="h-9 text-center rounded-lg bg-muted/30 border-transparent font-bold focus:bg-background focus:border-primary transition-all" value={getPitchingStat(player.id, "runs")} onChange={(e) => handlePitchingChange(player.id, "runs", e.target.value)} /></TableCell>
                                            <TableCell><Input className="h-9 text-center rounded-lg bg-muted/30 border-transparent font-bold focus:bg-background focus:border-primary transition-all" value={getPitchingStat(player.id, "earnedRuns")} onChange={(e) => handlePitchingChange(player.id, "earnedRuns", e.target.value)} /></TableCell>
                                            <TableCell><Input className="h-9 text-center rounded-lg bg-muted/30 border-transparent font-bold focus:bg-background focus:border-primary transition-all" value={getPitchingStat(player.id, "walks")} onChange={(e) => handlePitchingChange(player.id, "walks", e.target.value)} /></TableCell>
                                            <TableCell><Input className="h-9 text-center rounded-lg bg-muted/30 border-transparent font-bold focus:bg-background focus:border-primary transition-all" value={getPitchingStat(player.id, "strikeOuts")} onChange={(e) => handlePitchingChange(player.id, "strikeOuts", e.target.value)} /></TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/50 hover:text-destructive hover:bg-destructive/10 rounded-full opacity-0 group-hover:opacity-100 transition-all" onClick={() => removePitcher(player.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="mt-4 border-t border-primary/5 pt-4">
                    <p className="text-[10px] text-muted-foreground/60 mr-auto font-bold uppercase tracking-widest">* Los cambios se guardan automáticamente al escribir</p>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
}

