'use client';

import { useLoader, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

export default function Sun() {
    const sunRef = useRef<THREE.Mesh>(null);
    const texture = useLoader(THREE.TextureLoader, '/nebula/textures/8k_sun.jpg');

    useFrame(() => {
        if (sunRef.current) {
            sunRef.current.rotation.y += 0.001;
        }
    });

    return (
        <group>
            {/* The Sun Mesh */}
            <mesh ref={sunRef} position={[0, 0, 0]}>
                <sphereGeometry args={[15, 64, 64]} />
                <meshStandardMaterial
                    map={texture}
                    emissive={new THREE.Color('#ffcc33')}
                    emissiveIntensity={2}
                    emissiveMap={texture}
                />
            </mesh>

            {/* Central PointLight - The primary light source of the system */}
            <pointLight
                position={[0, 0, 0]}
                intensity={1000}
                distance={5000}
                decay={1}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={5000}
            />
        </group>
    );
}
