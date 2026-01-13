
"use client";

import BoxScoreDialog from "./BoxScoreDialog";
import type { Game, Team, BattingStat, PitchingStat } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fragment } from "react";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpDown } from "lucide-react";

type ScheduleCardProps = {
  title: string;
  games: Game[];
  teams: Team[];
  onGameChange: (gameId: number, field: keyof Game, value: string) => void;
  onInningChange: (gameId: number, inningIndex: number, teamIndex: 0 | 1, value: string) => void;
  onSaveBatting: (gameId: number, playerId: number, stats: Partial<BattingStat>) => Promise<void>;
  onSavePitching: (gameId: number, playerId: number, stats: Partial<PitchingStat>) => Promise<void>;
  onSwapTeams: (gameId: number) => void;
  onNavigate?: () => void;
  onNavigateToStandings?: () => void;
  footer?: React.ReactNode;
  isChampionship?: boolean;
};

export default function ScheduleCard({
  title,
  games,
  teams,
  onGameChange,
  onInningChange,
  onSaveBatting,
  onSavePitching,
  onSwapTeams,
  onNavigate,
  onNavigateToStandings,
  footer,
  isChampionship = false
}: ScheduleCardProps) {
  const getTeamName = (teamId: string) => {
    return teams.find((t) => String(t.id) === teamId)?.name || "";
  };

  let lastDay: string | undefined = undefined;

  const getTeamPlaceholder = (game: Game, teamNumber: 1 | 2) => {
    const teamId = teamNumber === 1 ? game.team1Id : game.team2Id;
    const teamName = teamId ? getTeamName(teamId) : "";

    if (!isChampionship) {
      return teamName;
    }

    const label = teamNumber === 1 ? "SEGUNDO RONDA INICIAL" : "PRIMERO RONDA INICIAL";

    if (teamName) {
      return `${label}: ${teamName}`;
    }
    return label;
  }

  return (
    <Card className="border-primary/10 shadow-[0_10px_50px_-12px_rgba(0,0,0,0.5)] bg-card/50 backdrop-blur-sm overflow-hidden border-none">
      <CardHeader className="border-b border-primary/5 bg-primary/5 p-6">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
            <span className="text-primary">{isChampionship ? '🏆' : '⚾'}</span> {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">Paraná 2026</span>
            <div className="h-1.5 w-1.5 rounded-full bg-primary/30" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-10">
        {games.map((game) => {
          const showDay = game.day && game.day !== lastDay;
          if (showDay) {
            lastDay = game.day;
          }
          const gameNumber = isChampionship ? 16 : game.id;
          const inningsCount = game.innings.length;

          const score1Num = game.score1 !== "" ? parseInt(game.score1) : -1;
          const score2Num = game.score2 !== "" ? parseInt(game.score2) : -1;

          const team1Wins = score1Num > score2Num;
          const team2Wins = score2Num > score1Num;

          const hasInnings = game.innings.some((inn: any) => inn[0] !== "" || inn[1] !== "");
          const renderValue = (val: string) => (val === "0" && !hasInnings) ? "" : val;

          return (
            <Fragment key={game.id}>
              {showDay && (
                <div className="flex items-center gap-4 py-2">
                  <h3 className="font-black text-sm uppercase tracking-[0.2em] text-primary whitespace-nowrap">{game.day}</h3>
                  <div className="h-px w-full bg-gradient-to-r from-primary/20 to-transparent" />
                </div>
              )}
              <div className="space-y-6 rounded-2xl border border-primary/10 bg-primary/[0.02] p-6 shadow-sm group hover:border-primary/20 transition-all">
                <div className="flex justify-between items-center pb-2 border-b border-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary px-2 py-1 rounded text-[10px] font-black text-primary-foreground uppercase tracking-widest">
                      Juego {gameNumber}
                    </div>
                    {game.time && (
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{game.time}</span>
                    )}
                  </div>
                  <span className="text-[9px] font-black text-muted-foreground/60 text-right uppercase tracking-wider">Estadio Mundialista ‘Ing Nafaldo Cargnel’</span>
                </div>

                <div className="grid grid-cols-[1fr_3.5rem_3.5rem_3.5rem] gap-x-3 gap-y-3 items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black tracking-[0.2em] text-primary/60 uppercase">Equipos</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                      onClick={() => onSwapTeams(game.id)}
                      title="Intercambiar Loc/Vis"
                    >
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-center text-[10px] font-black tracking-[0.2em] text-primary/60 uppercase">R</div>
                  <div className="text-center text-[10px] font-black tracking-[0.2em] text-primary/60 uppercase">H</div>
                  <div className="text-center text-[10px] font-black tracking-[0.2em] text-primary/60 uppercase">E</div>

                  {/* Visiting Team */}
                  <div className={cn(
                    "p-3 text-sm font-bold rounded-xl transition-all uppercase tracking-tight",
                    team1Wins ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-background/50 border border-primary/5"
                  )}>
                    {getTeamPlaceholder(game, 1)}
                  </div>

                  {/* Visiting Score (R) */}
                  <div className={cn(
                    "flex items-center justify-center h-12 w-full rounded-xl text-xl font-black text-center transition-all",
                    team1Wins ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted/80 border border-primary/10"
                  )}>
                    {renderValue(game.score1)}
                  </div>

                  {/* Hits (H) */}
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={renderValue(game.hits1)}
                    onChange={(e) => onGameChange(game.id, 'hits1', e.target.value)}
                    className="text-center h-12 rounded-xl bg-muted/50 border-primary/5 font-bold focus:border-primary focus:ring-primary/20"
                  />

                  {/* Errors (E) */}
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={renderValue(game.errors1)}
                    onChange={(e) => onGameChange(game.id, 'errors1', e.target.value)}
                    className="text-center h-12 rounded-xl bg-muted/50 border-primary/5 font-bold focus:border-primary focus:ring-primary/20"
                  />

                  {/* Local Team */}
                  <div className={cn(
                    "p-3 text-sm font-bold rounded-xl transition-all uppercase tracking-tight",
                    team2Wins ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-background/50 border border-primary/5"
                  )}>
                    {getTeamPlaceholder(game, 2)}
                  </div>

                  {/* Local Score (R) */}
                  <div className={cn(
                    "flex items-center justify-center h-12 w-full rounded-xl text-xl font-black text-center transition-all",
                    team2Wins ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted/80 border border-primary/10"
                  )}>
                    {renderValue(game.score2)}
                  </div>

                  <Input
                    type="text"
                    inputMode="numeric"
                    value={renderValue(game.hits2)}
                    onChange={(e) => onGameChange(game.id, 'hits2', e.target.value)}
                    className="text-center h-12 rounded-xl bg-muted/50 border-primary/5 font-bold focus:border-primary focus:ring-primary/20"
                  />

                  <Input
                    type="text"
                    inputMode="numeric"
                    value={renderValue(game.errors2)}
                    onChange={(e) => onGameChange(game.id, 'errors2', e.target.value)}
                    className="text-center h-12 rounded-xl bg-muted/50 border-primary/5 font-bold focus:border-primary focus:ring-primary/20"
                  />
                </div>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-primary/5"></div>
                  </div>
                </div>

                {/* Inning-by-inning */}
                <div className="overflow-x-auto rounded-xl border border-primary/5 bg-background/30 p-4">
                  <div className="grid grid-cols-[3.5rem_repeat(12,minmax(2.5rem,1fr))] gap-2 items-center text-[9px] font-black text-center text-primary/40 mb-3" style={{ minWidth: `${4 + inningsCount * 2.8}rem` }}>
                    <div>INN</div>
                    {Array.from({ length: inningsCount }, (_, i) => i + 1).map(inning => (
                      <div key={inning} className="uppercase tracking-widest">{inning}</div>
                    ))}
                  </div>

                  {/* Team 1 Innings */}
                  <div className="grid grid-cols-[3.5rem_repeat(12,minmax(2.5rem,1fr))] gap-2 items-center" style={{ minWidth: `${4 + inningsCount * 2.8}rem` }}>
                    <div className="text-[10px] font-black text-right pr-3 uppercase tracking-wider text-muted-foreground">VIS</div>
                    {game.innings.map((inningData, inningNum) => (
                      <Input
                        key={`g${game.id}-t1-inn${inningNum}`}
                        type="text"
                        className="text-center h-9 rounded-lg bg-muted/30 border-transparent font-bold focus:bg-background focus:border-primary transition-all p-0"
                        value={inningData[0]}
                        onChange={(e) => onInningChange(game.id, inningNum, 0, e.target.value)}
                      />
                    ))}
                  </div>

                  {/* Team 2 Innings */}
                  <div className="grid grid-cols-[3.5rem_repeat(12,minmax(2.5rem,1fr))] gap-2 items-center mt-3" style={{ minWidth: `${4 + inningsCount * 2.8}rem` }}>
                    <div className="text-[10px] font-black text-right pr-3 uppercase tracking-wider text-muted-foreground">LOC</div>
                    {game.innings.map((inningData, inningNum) => (
                      <Input
                        key={`g${game.id}-t2-inn${inningNum}`}
                        type="text"
                        className="text-center h-9 rounded-lg bg-muted/30 border-transparent font-bold focus:bg-background focus:border-primary transition-all p-0"
                        value={inningData[1]}
                        onChange={(e) => onInningChange(game.id, inningNum, 1, e.target.value)}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                  <BoxScoreDialog
                    game={game}
                    teams={teams}
                    onSaveBatting={(playerId, stats) => onSaveBatting(game.id, playerId, stats)}
                    onSavePitching={(playerId, stats) => onSavePitching(game.id, playerId, stats)}
                  />
                  <div className="flex gap-2">
                    {onNavigateToStandings && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onNavigateToStandings}
                        className="text-[10px] font-black uppercase tracking-widest border-primary/10 hover:bg-primary/5"
                      >
                        Tabla Posiciones
                      </Button>
                    )}
                    {onNavigate && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={onNavigate}
                        className="text-[10px] font-black uppercase tracking-widest hover:translate-y-[-1px] transition-transform"
                      >
                        Regresar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Fragment>
          );
        })}
      </CardContent>
      {footer && <CardFooter className="p-6 border-t border-primary/5">{footer}</CardFooter>}
    </Card>
  );
}

