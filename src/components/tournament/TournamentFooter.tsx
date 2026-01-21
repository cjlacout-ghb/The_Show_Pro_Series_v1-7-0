"use client";

import Image from "next/image";

interface TournamentFooterProps {
    onReset: () => void;
}

export default function TournamentFooter({ onReset }: TournamentFooterProps) {
    return (
        <footer className="mt-auto py-6 flex flex-col items-center justify-center gap-4 text-center bg-gradient-to-t from-primary/5 to-transparent border-t border-primary/10">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <Image
                        src="/images/sponsor-logo.png"
                        alt="Developer Branding"
                        width={280}
                        height={70}
                        className="relative transition-all duration-500 hover:scale-105"
                    />
                </div>

                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-px bg-primary/20" />
                        <p className="text-primary/40 uppercase tracking-[0.4em] text-[10px] font-black">
                            DEV BY C|J|L
                        </p>
                        <div className="w-12 h-px bg-primary/20" />
                    </div>

                    <button
                        onClick={onReset}
                        className="group flex items-center gap-2 text-[10px] text-muted-foreground/30 hover:text-destructive transition-all duration-300 font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-transparent hover:border-destructive/20 hover:bg-destructive/5"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-destructive/20 group-hover:bg-destructive transition-colors" />
                        Reiniciar Sistema
                    </button>
                </div>
            </div>
        </footer>
    );
}
