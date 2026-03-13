'use client';

import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGestureStore } from '@/store/useGestureStore';
import { 
    Hand, 
    MousePointer2, 
    Rotate3d, 
    Target, 
    Zap,
    ChevronRight
} from 'lucide-react';

export default function LoadingScreen() {
    const { progress } = useProgress();
    const [showTutorial, setShowTutorial] = useState(false);
    const { isMissionStarted, setIsMissionStarted } = useGestureStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (progress === 100) {
            const timer = setTimeout(() => {
                setIsLoading(false);
                setShowTutorial(true);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [progress]);

    return (
        <AnimatePresence>
            {(isLoading || (showTutorial && !isMissionStarted)) && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black"
                >
                    {isLoading ? (
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative flex flex-col items-center gap-8"
                        >
                            <div className="relative w-32 h-32">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                    <circle
                                        className="text-white/5 stroke-current"
                                        strokeWidth="2"
                                        cx="50"
                                        cy="50"
                                        r="48"
                                        fill="transparent"
                                    />
                                    <motion.circle
                                        className="text-indigo-500 stroke-current"
                                        strokeWidth="2"
                                        strokeDasharray={301.59}
                                        initial={{ strokeDashoffset: 301.59 }}
                                        animate={{ strokeDashoffset: 301.59 - (301.59 * progress) / 100 }}
                                        strokeLinecap="round"
                                        cx="50"
                                        cy="50"
                                        r="48"
                                        fill="transparent"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-3xl font-light text-white hud-font">
                                        {Math.round(progress)}
                                    </span>
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-bold tracking-[0.3em] text-white uppercase hud-font">
                                    Syncing Neural Link
                                </h2>
                                <p className="text-[10px] text-indigo-400/60 animate-pulse tracking-widest uppercase">
                                    Establishing Sub-Space Connection...
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="max-w-2xl w-full mx-4 stark-panel p-8 md:p-12 relative overflow-hidden bg-black/40 backdrop-blur-2xl border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.2)]"
                        >
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Target size={120} className="text-indigo-500" />
                            </div>

                            <header className="mb-10 text-center md:text-left">
                                <h2 className="text-3xl font-bold text-white hud-font mb-2 tracking-tight">MISSION BRIEFING</h2>
                                <p className="text-indigo-400/80 text-sm font-mono uppercase tracking-widest">Operation: Nebula Vision v2.0</p>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                <TutorialStep 
                                    icon={<Hand className="text-indigo-500" />}
                                    title="FIST"
                                    desc="Target & Destroy Planet"
                                />
                                <TutorialStep 
                                    icon={<Zap className="text-indigo-500" />}
                                    title="PINCH"
                                    desc="Select & Travel To"
                                />
                                <TutorialStep 
                                    icon={<Rotate3d className="text-indigo-500" />}
                                    title="DRAG"
                                    desc="Rotate Local Galaxy"
                                />
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-white/10">
                                <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                                    <div className="flex gap-1">
                                        {[1,2,3].map(i => <div key={i} className="w-1 h-3 bg-indigo-500/50" />)}
                                    </div>
                                    SYSTEMS STABLE / GESTURE OVERRIDE READY
                                </div>
                                
                                <button
                                    onClick={() => setIsMissionStarted(true)}
                                    className="group relative flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all duration-300 shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:shadow-[0_0_50px_rgba(79,70,229,0.6)]"
                                >
                                    <span className="font-bold tracking-[0.2em] uppercase text-sm">Start Mission</span>
                                    <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function TutorialStep({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-colors group">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                {icon}
            </div>
            <div>
                <h4 className="text-white font-bold tracking-widest text-xs mb-1 uppercase hud-font">{title}</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed uppercase">{desc}</p>
            </div>
        </div>
    );
}
