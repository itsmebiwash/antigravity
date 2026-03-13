'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGestureStore } from '@/store/useGestureStore';
import * as THREE from 'three';
import { Float, Ring } from '@react-three/drei';

export default function VirtualCursor() {
    const meshRef = useRef<THREE.Group>(null);
    const pointer = useGestureStore((state) => state.pointer);
    const isMissionStarted = useGestureStore((state) => state.isMissionStarted);

    useFrame((state) => {
        if (!meshRef.current) return;

        // Map pointer (-1 to 1) to world space
        // We'll scale it to cover a reasonable interaction area
        const targetX = pointer.x * 200;
        const targetY = pointer.y * 150;
        const targetZ = pointer.z * 50; // Use z from landmarks for some depth

        // Smooth interpolation
        meshRef.current.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.15);
        
        // Face the camera
        meshRef.current.lookAt(state.camera.position);
    });

    if (!isMissionStarted) return null;

    return (
        <group ref={meshRef}>
            <Float speed={5} rotationIntensity={0.5} floatIntensity={0.5}>
                {/* Main Ring */}
                <Ring args={[2.5, 3, 32]}>
                    <meshBasicMaterial color="#6366f1" transparent opacity={0.6} side={THREE.DoubleSide} />
                </Ring>
                
                {/* Inner Glow Dot */}
                <mesh>
                    <sphereGeometry args={[0.5, 16, 16]} />
                    <meshBasicMaterial color="#818cf8" />
                </mesh>

                {/* Outer Faint Glow */}
                <Ring args={[3.2, 3.4, 32]}>
                    <meshBasicMaterial color="#6366f1" transparent opacity={0.2} side={THREE.DoubleSide} />
                </Ring>

                {/* Crosshair lines */}
                <mesh position={[0, 4, 0]}>
                    <boxGeometry args={[0.2, 2, 0.1]} />
                    <meshBasicMaterial color="#6366f1" transparent opacity={0.4} />
                </mesh>
                <mesh position={[0, -4, 0]}>
                    <boxGeometry args={[0.2, 2, 0.1]} />
                    <meshBasicMaterial color="#6366f1" transparent opacity={0.4} />
                </mesh>
                <mesh position={[4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <boxGeometry args={[0.2, 2, 0.1]} />
                    <meshBasicMaterial color="#6366f1" transparent opacity={0.4} />
                </mesh>
                <mesh position={[-4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <boxGeometry args={[0.2, 2, 0.1]} />
                    <meshBasicMaterial color="#6366f1" transparent opacity={0.4} />
                </mesh>
            </Float>
            
            {/* Point Light for interaction feel */}
            <pointLight intensity={50} distance={20} color="#6366f1" />
        </group>
    );
}
