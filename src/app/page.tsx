'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useGestureStore } from '@/store/useGestureStore';
import { useAudio } from '@/components/useAudio';

// Dynamically import the Scene/Tracking to avoid SSR issues
const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: false }); // IDE Refresh
const HandTracking = dynamic(() => import('@/components/HandTracking'), { ssr: false });

export default function Home() {
  const pointer = useGestureStore((state) => state.pointer);
  const isMissionStarted = useGestureStore((state) => state.isMissionStarted);
  const { playChirp, startHum } = useAudio();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 2);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [mouseX, mouseY]);

  const parallaxX = pointer.x !== 0 ? pointer.x * 20 : 0;
  const parallaxY = pointer.y !== 0 ? pointer.y * 20 : 0;

  const xTransform = useTransform(mouseX, [-1, 1], [-15, 15]);
  const yTransform = useTransform(mouseY, [-1, 1], [-15, 15]);

  return (
    <main onClick={startHum} className="relative w-full h-screen overflow-hidden bg-black">
      <div id="canvas-container" className="absolute inset-0 z-0">
        <Suspense fallback={<div className="flex items-center justify-center w-full h-full text-indigo-400 hud-font uppercase tracking-widest">Initializing Cosmos...</div>}>
          <Scene />
        </Suspense>
      </div>

      <HandTracking />

      {/* Floating Spatial HUD - Only visible when mission started */}
      <AnimatePresence>
        {isMissionStarted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-10 pointer-events-none p-8 flex flex-col justify-between perspective-1000"
          >
            <header className="flex justify-between items-start">
              <motion.div
                initial={{ opacity: 0, y: -20, rotateX: -10 }}
                animate={{ opacity: 1, x: pointer.x !== 0 ? parallaxX : xTransform.get(), y: (pointer.y !== 0 ? parallaxY : yTransform.get()) + 20, rotateX: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 30 }}
                className="stark-panel p-4 pointer-events-auto border-indigo-500/30 bg-black/40 backdrop-blur-md"
              >
                <div className="flex items-baseline gap-3">
                  <h1 className="hud-font text-indigo-400 text-xl font-bold tracking-tighter">NEBULA_OS // ALPHA</h1>
                  <span className="text-[10px] text-indigo-500/60 font-mono animate-pulse">LIVE_FEED</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Open World Simulation v2.0</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, x: pointer.x !== 0 ? parallaxX * 0.5 : xTransform.get() * -0.5, y: pointer.y !== 0 ? parallaxY * 0.5 : yTransform.get() * -0.5 }}
                transition={{ type: 'spring', stiffness: 100, damping: 30 }}
                className="stark-panel p-3 px-5 pointer-events-auto flex gap-3 border-indigo-500/20 bg-black/20"
              >
                <button
                  onMouseEnter={playChirp}
                  onClick={() => { playChirp(); window.dispatchEvent(new CustomEvent('undoAction')); }}
                  className="text-[10px] font-bold text-indigo-400 hover:text-white transition-colors tracking-widest uppercase"
                >
                  [ Time_Reversal_Link ]
                </button>
              </motion.div>
            </header>

            <footer className="flex justify-between items-end pb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, x: pointer.x !== 0 ? parallaxX : xTransform.get(), y: pointer.y !== 0 ? parallaxY : yTransform.get() }}
                transition={{ type: 'spring', stiffness: 100, damping: 30 }}
                className="stark-panel p-3 px-5 pointer-events-auto border-indigo-500/30 bg-black/40"
              >
                <div className="text-[10px] text-indigo-400 tabular-nums uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-green-500 animate-ping" />
                  GPGPU_GRAVITY: <span className="text-white">OPTIMIZED</span>
                </div>
              </motion.div>

              <div className="flex gap-4 mr-64">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-1 h-8 bg-indigo-500/20 rounded-full overflow-hidden">
                        <motion.div 
                            animate={{ y: [0, 32, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                            className="w-full h-1/2 bg-indigo-500"
                        />
                    </div>
                ))}
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
