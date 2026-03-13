'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import { Vector3 } from 'three';
import Universe from '@/components/canvas/Universe';
import CameraController from '@/components/canvas/CameraController';

export default function Scene() {
    return (
        <Canvas
            camera={{ position: [0, 50, 150], fov: 60, near: 0.1, far: 50000 }}
            gl={{ antialias: true, alpha: false }}
        >
            <color attach="background" args={['#000000']} />

            {/* Infinite Looping Starfield background */}
            <Stars radius={500} depth={100} count={10000} factor={8} saturation={1} fade speed={0.5} />

            {/* Lighting for Photorealism */}
            <ambientLight intensity={0.1} />
            <pointLight position={[0, 0, 0]} intensity={10} color="#ffffff" distance={2000} decay={2} />

            <Universe />

            {/* Dynamic Camera Controller logic driven by gestures */}
            <CameraController />

            {/* High-End Post-processing */}
            <EffectComposer>
                <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} />
            </EffectComposer>
        </Canvas>
    );
}
