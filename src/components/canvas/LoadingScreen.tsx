'use client';

import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';

export default function LoadingScreen() {
    const { progress } = useProgress();
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (progress === 100) {
            const timer = setTimeout(() => setVisible(false), 500);
            return () => clearTimeout(timer);
        }
    }, [progress]);

    if (!visible) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-1000 ${progress === 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="relative flex flex-col items-center">
                {/* Glassmorphism Container */}
                <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col items-center gap-6 min-w-[300px]">
                    <div className="relative w-24 h-24">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                                className="text-white/10 stroke-current"
                                strokeWidth="4"
                                cx="50"
                                cy="50"
                                r="45"
                                fill="transparent"
                            />
                            <circle
                                className="text-[var(--neon-blue)] stroke-current transition-all duration-300 ease-out"
                                strokeWidth="4"
                                strokeDasharray={283}
                                strokeDashoffset={283 - (283 * progress) / 100}
                                strokeLinecap="round"
                                cx="50"
                                cy="50"
                                r="45"
                                fill="transparent"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white tabular-nums">
                                {Math.round(progress)}%
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                        <h2 className="text-xl font-bold tracking-widest text-white uppercase hud-font">
                            Initializing Universe
                        </h2>
                        <p className="text-xs text-slate-400 animate-pulse uppercase tracking-tighter">
                            Mapping 8K NASA Textures...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
