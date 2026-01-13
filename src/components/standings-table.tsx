
"use client";

import type { Standing, Team } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/button";

type StandingsTableProps = {
  standings: Standing[];
  teams: Team[];
  onNavigate?: () => void;
};

export default function StandingsTable({
  standings,
  teams,
  onNavigate
}: StandingsTableProps) {
  const tableColumns = ["POS", "TEAM", "W", "L", "RS", "RA", "PCT", "GB"];

  const getTeamName = (teamId: number) => {
    return teams.find((t) => t.id === teamId)?.name || "Unknown Team";
  };

  const formatPct = (pct: number) => {
    if (pct === 1000) return "1.000";
    return `.${pct.toString().padStart(3, '0')}`;
  }

  const isTied = (standing: Standing, index: number) => {
    if (index > 0 && standing.pos === standings[index - 1].pos) return true;
    if (index < standings.length - 1 && standing.pos === standings[index + 1].pos) return true;
    return false;
  }

  const hasTies = standings.some(isTied);

  return (
    <Card className="border-primary/10 shadow-[0_10px_50px_-12px_rgba(0,0,0,0.5)] bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-primary/5 bg-primary/5">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
            <span className="text-primary">📊</span> Tabla de Posiciones
          </CardTitle>
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        </div>
        <CardDescription className="text-xs uppercase tracking-wider font-medium opacity-70">
          Actualización en tiempo real • Ronda Inicial
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-primary/[0.03]">
              <TableRow className="border-b border-primary/10 hover:bg-transparent">
                {tableColumns.map((col) => (
                  <TableHead key={col} className={cn(
                    "h-12 text-[11px] font-black uppercase tracking-[0.1em] text-primary/70",
                    col === "TEAM" ? "w-[40%]" : "text-center"
                  )}>
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.map((standing, index) => {
                const teamName = getTeamName(standing.teamId);
                const isLeader = index === 0 && standing.w > 0;

                return (
                  <TableRow key={standing.teamId} className="group hover:bg-primary/[0.02] border-b border-primary/5 transition-colors">
                    <TableCell className="text-center font-mono font-bold text-sm">
                      {isTied(standing, index) ? (
                        <span className="flex items-center justify-center gap-1 text-amber-500">
                          {standing.pos}*
                        </span>
                      ) : (
                        <span className={isLeader ? "text-primary scale-110 inline-block" : ""}>
                          {standing.pos}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className={cn(
                          "text-sm font-bold uppercase tracking-tight transition-colors",
                          isLeader ? "text-primary" : "text-foreground"
                        )}>
                          {teamName}
                        </span>
                        {isLeader && (
                          <span className="text-[9px] font-black tracking-widest text-primary/60 uppercase">
                            Líder del Torneo
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-bold text-sm">{standing.w}</TableCell>
                    <TableCell className="text-center font-bold text-sm text-muted-foreground">{standing.l}</TableCell>
                    <TableCell className="text-center text-sm font-medium">{standing.rs}</TableCell>
                    <TableCell className="text-center text-sm font-medium">{standing.ra}</TableCell>
                    <TableCell className="text-center font-mono text-sm font-bold text-primary/80">
                      {formatPct(standing.pct)}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm font-bold">
                      {standing.gb === 0 ? <span className="text-primary/40">—</span> : standing.gb.toFixed(1)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 p-6 border-t border-primary/5 bg-primary/[0.01]">
        {hasTies && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
              (*) Equipos empatados por criterios de desempate
            </span>
          </div>
        )}
        {onNavigate && (
          <div className="flex justify-end w-full">
            <Button
              variant="secondary"
              onClick={onNavigate}
              className="font-bold uppercase tracking-widest text-[11px] hover:translate-y-[-2px] transition-transform"
            >
              Regresar al Menú
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

