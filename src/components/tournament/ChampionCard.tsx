"use client";

import { forwardRef } from "react";
import { TrophyIcon } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChampionCardProps {
    championName: string;
}

const ChampionCard = forwardRef<HTMLDivElement, ChampionCardProps>(
    ({ championName }, ref) => {
        return (
            <div ref={ref} className="pb-12">
                <Card className="relative overflow-hidden border-primary/20 bg-card shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.4)] animate-in fade-in zoom-in-95 duration-1000 ring-4 ring-primary/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
                    <CardHeader className="items-center text-center relative z-10 pt-10">
                        <div className="p-4 rounded-full bg-primary/10 mb-4 animate-bounce">
                            <TrophyIcon className="w-20 h-20 text-primary drop-shadow-[0_0_15px_HSL(var(--primary))]" />
                        </div>
                        <CardTitle className="text-4xl font-black uppercase tracking-tighter text-primary">
                            ¡EQUIPO CAMPEÓN!
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center relative z-10 pb-12">
                        <p className="text-5xl md:text-6xl font-black tracking-[-0.03em] text-foreground uppercase drop-shadow-sm">
                            {championName}
                        </p>
                        <div className="mt-6 flex justify-center">
                            <div className="h-1 w-32 bg-primary/30 rounded-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
);

ChampionCard.displayName = "ChampionCard";

export default ChampionCard;
