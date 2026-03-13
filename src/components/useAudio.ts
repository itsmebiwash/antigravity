'use client';

import { useEffect, useRef } from 'react';

export function useAudio() {
    const audioCtxRef = useRef<AudioContext | null>(null);
    const humOscRef = useRef<OscillatorNode | null>(null);

    useEffect(() => {
        // Only init Audio Context on client side
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        return () => {
            if (humOscRef.current) {
                humOscRef.current.stop();
                humOscRef.current.disconnect();
            }
            if (audioCtxRef.current) {
                audioCtxRef.current.close();
            }
        };
    }, []);

    const playChirp = () => {
        if (!audioCtxRef.current) return;
        if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();

        const osc = audioCtxRef.current.createOscillator();
        const gainNode = audioCtxRef.current.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(2500, audioCtxRef.current.currentTime);
        osc.frequency.exponentialRampToValueAtTime(3500, audioCtxRef.current.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, audioCtxRef.current.currentTime + 0.02);
        gainNode.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 0.1);

        osc.connect(gainNode);
        gainNode.connect(audioCtxRef.current.destination);

        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.1);
    };

    const startHum = () => {
        if (!audioCtxRef.current || humOscRef.current) return;
        if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();

        const osc = audioCtxRef.current.createOscillator();
        const gainNode = audioCtxRef.current.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(50, audioCtxRef.current.currentTime);

        gainNode.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.02, audioCtxRef.current.currentTime + 2.0);

        osc.connect(gainNode);
        gainNode.connect(audioCtxRef.current.destination);

        osc.start();
        humOscRef.current = osc;
    };

    return { playChirp, startHum };
}
