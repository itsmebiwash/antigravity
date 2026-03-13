'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Particles from './Particles';

export default function Scene() {
    return (
        <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            gl={{ antialias: false, alpha: false, preserveDrawingBuffer: false }}
        >
            {/* Black space background */}
            <color attach="background" args={['#03040b']} />

            <Particles />

            <OrbitControls enablePan={false} enableZoom={false} />

            {/* Holographic Glowing Effects */}
            <EffectComposer>
                <Bloom
                    luminanceThreshold={0.2}
                    mipmapBlur
                    intensity={1.5}
                />
            </EffectComposer>
        </Canvas>
    );
}
