"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";

interface LeaderRowData {
    id: number;
    name: string;
    teamName: string;
}

interface LeaderBoardTableProps<T extends LeaderRowData> {
    leaders: T[];
    columns: {
        key: keyof T | 'rank';
        label: string;
        align?: 'left' | 'right' | 'center';
        format?: (value: any) => string;
        isPrimary?: boolean;
    }[];
    emptyMessage?: string;
}

export default function LeaderBoardTable<T extends LeaderRowData>({
    leaders,
    columns,
    emptyMessage = "Esperando datos de partidos..."
}: LeaderBoardTableProps<T>) {
    const renderRankBadge = (index: number) => {
        if (index < 3) {
            return (
                <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center mx-auto text-[10px] font-black",
                    index === 0 ? "bg-primary text-primary-foreground shadow-[0_0_10px_HSL(var(--primary)/0.5)]" :
                        index === 1 ? "bg-zinc-400 text-zinc-950" :
                            "bg-amber-700 text-amber-50"
                )}>
                    {index + 1}
                </div>
            );
        }
        return <span className="text-xs font-bold text-muted-foreground">{index + 1}</span>;
    };

    return (
        <div className="rounded-xl border border-primary/10 bg-background/50 overflow-hidden shadow-inner">
            <Table>
                <TableHeader className="bg-primary/[0.03]">
                    <TableRow className="border-b border-primary/10 hover:bg-transparent">
                        {columns.map((col) => (
                            <TableHead
                                key={String(col.key)}
                                className={cn(
                                    "text-[10px] font-black uppercase tracking-widest text-primary/60",
                                    col.key === 'rank' && "w-12 text-center",
                                    col.align === 'right' && "text-right",
                                    col.align === 'center' && "text-center"
                                )}
                            >
                                {col.label}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {leaders.length > 0 ? leaders.map((leader, i) => (
                        <TableRow key={leader.id} className="group hover:bg-primary/[0.02] border-b border-primary/5 transition-colors">
                            {columns.map((col) => {
                                if (col.key === 'rank') {
                                    return (
                                        <TableCell key="rank" className="text-center">
                                            {renderRankBadge(i)}
                                        </TableCell>
                                    );
                                }

                                if (col.key === 'name') {
                                    return (
                                        <TableCell key="name" className="py-4">
                                            <div className="font-bold text-sm uppercase tracking-tight group-hover:text-primary transition-colors">
                                                {leader.name}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                                {leader.teamName}
                                            </div>
                                        </TableCell>
                                    );
                                }

                                const value = leader[col.key as keyof T];
                                const formattedValue = col.format ? col.format(value) : String(value);

                                return (
                                    <TableCell
                                        key={String(col.key)}
                                        className={cn(
                                            col.align === 'right' && "text-right",
                                            col.align === 'center' && "text-center",
                                            col.isPrimary && "font-mono font-black text-primary text-base",
                                            !col.isPrimary && "font-bold"
                                        )}
                                    >
                                        {formattedValue}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="text-center py-16">
                                <div className="flex flex-col items-center gap-2 opacity-30">
                                    <Trophy className="w-12 h-12 mb-2" />
                                    <p className="text-xs font-black uppercase tracking-[0.2em]">{emptyMessage}</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
