"use client";

import { Button } from "@/components/ui/button";

type ViewType = 'menu' | 'teams' | 'games' | 'standings' | 'leaders';

interface MenuItem {
    id: ViewType;
    label: string;
    icon: string;
}

const menuItems: MenuItem[] = [
    { id: 'teams', label: 'Equipos y Jugadores', icon: '👥' },
    { id: 'games', label: 'Partidos y Resultados', icon: '⚾' },
    { id: 'standings', label: 'Tabla de Posiciones', icon: '📊' },
    { id: 'leaders', label: 'Panel de Líderes', icon: '🏆' }
];

interface TournamentMenuProps {
    onNavigate: (view: ViewType) => void;
}

export default function TournamentMenu({ onNavigate }: TournamentMenuProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
            {menuItems.map((item) => (
                <Button
                    key={item.id}
                    size="lg"
                    className="group relative h-28 flex flex-col items-center justify-center gap-2 text-lg font-black bg-card hover:bg-primary transition-all duration-500 border-2 border-primary/20 hover:border-primary shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_60px_-10px_hsl(var(--primary)/0.3)] hover:-translate-y-2 overflow-hidden"
                    onClick={() => onNavigate(item.id)}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-500">{item.icon}</span>
                    <span className="relative z-10 text-muted-foreground group-hover:text-primary-foreground transition-colors duration-500 uppercase tracking-tighter">
                        {item.label}
                    </span>
                </Button>
            ))}
        </div>
    );
}

export type { ViewType };
