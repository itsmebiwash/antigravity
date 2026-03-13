'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import { Vector3 } from 'three';
import { Suspense } from 'react';
import SolarSystem from '@/components/canvas/SolarSystem';
import CameraController from '@/components/canvas/CameraController';
import LoadingScreen from '@/components/canvas/LoadingScreen';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import VirtualCursor from '@/components/canvas/VirtualCursor';

function GalaxyBackground() {
    const texture = useLoader(THREE.TextureLoader, '/nebula/textures/8k_stars_milky_way.jpg');
    return (
        <mesh>
            <sphereGeometry args={[5000, 64, 64]} />
            <meshBasicMaterial map={texture} side={THREE.BackSide} />
        </mesh>
    );
}

export default function Scene() {
    return (
        <>
            <LoadingScreen />
            <Canvas
                shadows
                camera={{ position: [0, 100, 400], fov: 60, near: 0.1, far: 50000 }}
                gl={{ antialias: true, alpha: false, logarithmicDepthBuffer: true }}
            >
                <color attach="background" args={['#000000']} />

                <Suspense fallback={null}>
                    <GalaxyBackground />
                    <SolarSystem />
                </Suspense>

                {/* 3D Virtual Cursor for Hand Interaction */}
                <VirtualCursor />

                {/* Dynamic Camera Controller logic driven by gestures */}
                <CameraController />

                {/* High-End Post-processing */}
                <EffectComposer>
                    <Bloom luminanceThreshold={1.0} mipmapBlur intensity={1.5} />
                    <ToneMapping mode={THREE.ACESFilmicToneMapping} />
                </EffectComposer>
            </Canvas>
        </>
    );
}
