'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useGestureStore } from '@/store/useGestureStore';
import { useAudio } from '@/components/useAudio';

// Dynamically import the Scene/Tracking to avoid SSR issues
const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: false });
const HandTracking = dynamic(() => import('@/components/HandTracking'), { ssr: false });

export default function Home() {
  const pointer = useGestureStore((state) => state.pointer);
  const { playChirp, startHum } = useAudio();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    // If MediaPipe is active, use its pointer. Otherwise fallback/enhance with mouse
    const handleMouse = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 2);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [mouseX, mouseY]);

  // Merge mouse and hand tracker values for parallax
  // Hand pointer x, y is expected to be in [-1, 1] range.
  const parallaxX = pointer.x !== 0 ? pointer.x * 20 : 0;
  const parallaxY = pointer.y !== 0 ? pointer.y * 20 : 0;

  // Derive transform for panels
  const xTransform = useTransform(mouseX, [-1, 1], [-15, 15]);
  const yTransform = useTransform(mouseY, [-1, 1], [-15, 15]);

  return (
    <main onClick={startHum} className="relative w-full h-screen overflow-hidden bg-black">
      <div id="canvas-container" className="absolute inset-0 z-0">
        <Suspense fallback={<div className="flex items-center justify-center w-full h-full text-[#0ff0fc] hud-font">Initializing Engine...</div>}>
          <Scene />
        </Suspense>
      </div>

      <HandTracking />

      {/* Floating Spatial UI */}
      <div className="absolute inset-0 z-10 pointer-events-none p-8 flex flex-col justify-between perspective-1000">
        <header className="flex justify-between items-start">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, x: pointer.x !== 0 ? parallaxX : xTransform.get(), y: pointer.y !== 0 ? parallaxY : yTransform.get() }}
            transition={{ type: 'spring', stiffness: 100, damping: 30 }}
            className="stark-panel p-4 pointer-events-auto"
          >
            <h1 className="hud-font text-[var(--neon-blue)] text-xl font-bold">NEBULA VISION</h1>
            <p className="text-xs text-slate-400 mt-1">GPGPU PARTICLE ENGINE_v1.0</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, x: pointer.x !== 0 ? parallaxX * 0.5 : xTransform.get() * -0.5, y: pointer.y !== 0 ? parallaxY * 0.5 : yTransform.get() * -0.5 }}
            transition={{ type: 'spring', stiffness: 100, damping: 30 }}
            className="stark-panel p-3 px-5 pointer-events-auto flex gap-3"
          >
            {['sphere', 'heart', 'sakura', 'saturn', 'fireworks'].map(shape => (
              <button
                key={shape}
                onMouseEnter={playChirp}
                onClick={() => { playChirp(); window.dispatchEvent(new CustomEvent('changeShape', { detail: { shape } })); }}
                className="text-xs font-semibold uppercase hover:text-[var(--neon-blue)] transition-colors"
              >
                {shape}
              </button>
            ))}
            <button
              onMouseEnter={playChirp}
              onClick={() => { playChirp(); window.dispatchEvent(new CustomEvent('undoShape')); }}
              className="text-xs font-bold text-[var(--neon-purple)] hover:text-white transition-colors ml-4"
            >
              UNDO
            </button>
          </motion.div>
        </header>

        <footer className="flex justify-between items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, x: pointer.x !== 0 ? parallaxX : xTransform.get(), y: pointer.y !== 0 ? parallaxY : yTransform.get() }}
            transition={{ type: 'spring', stiffness: 100, damping: 30 }}
            className="stark-panel p-3 px-5 pointer-events-auto"
          >
            <div className="text-[10px] text-[var(--neon-blue)] tabular-nums uppercase tracking-widest">
              STATUS: <span className="text-white">ONLINE</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, x: pointer.x !== 0 ? parallaxX * 0.5 : xTransform.get() * -0.5, y: pointer.y !== 0 ? parallaxY * 0.5 : yTransform.get() * -0.5 }}
            transition={{ type: 'spring', stiffness: 100, damping: 30 }}
            className="stark-panel p-4 pointer-events-auto max-w-sm"
          >
            <h2 className="hud-font text-sm text-[var(--neon-blue)] mb-2">SPATIAL CONTROLS</h2>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>Pinch: Zoom / Attract</li>
              <li>Palm: Blast effect</li>
              <li>Point: Magnetic Attract</li>
              <li>Click Top Menu to Morph</li>
            </ul>
          </motion.div>
        </footer>
      </div>
    </main>
  );
}
