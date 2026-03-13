'use client';

import { useLoader, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

interface CelestialBodyProps {
    name: string;
    texturePath: string;
    normalPath?: string;
    roughnessPath?: string;
    specularPath?: string;
    radius: number;
    position: [number, number, number];
    rotationSpeed?: number;
    orbitRadius?: number;
    orbitSpeed?: number;
    receiveShadow?: boolean;
    castShadow?: boolean;
    ringTexturePath?: string;
    cloudTexturePath?: string;
    nightTexturePath?: string;
}

const normalizePath = (p?: string) => {
    if (!p) return undefined;
    if (p.endsWith('.tif')) return undefined; // Browsers don't support .tif
    if (p.startsWith('/textures')) return `/nebula${p}`;
    return p;
};

export default function CelestialBody({
    name,
    texturePath,
    normalPath,
    roughnessPath,
    specularPath,
    radius,
    position,
    rotationSpeed = 0.005,
    orbitRadius = 0,
    orbitSpeed = 0,
    receiveShadow = true,
    castShadow = true,
    ringTexturePath,
    cloudTexturePath,
    nightTexturePath,
}: CelestialBodyProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const ringRef = useRef<THREE.Mesh>(null);
    const cloudRef = useRef<THREE.Mesh>(null);
    
    // Normalize paths
    const nTexture = normalizePath(texturePath)!;
    const nNormal = normalizePath(normalPath);
    const nRoughness = normalizePath(roughnessPath);
    const nSpecular = normalizePath(specularPath);
    const nRing = normalizePath(ringTexturePath);
    const nCloud = normalizePath(cloudTexturePath);
    const nNight = normalizePath(nightTexturePath);

    // Load textures
    const paths = [nTexture, nNormal, nRoughness, nSpecular, nRing, nCloud, nNight].filter(Boolean) as string[];
    const textures = useLoader(THREE.TextureLoader, paths);

    const [map, normalMap, roughnessMap, specularMap, ringMap, cloudMap, nightMap] = useMemo(() => {
        let m, n, r, s, rm, cm, nm;
        let idx = 0;
        m = textures[idx++];
        if (nNormal) n = textures[idx++];
        if (nRoughness) r = textures[idx++];
        if (nSpecular) s = textures[idx++];
        if (nRing) rm = textures[idx++];
        if (nCloud) cm = textures[idx++];
        if (nNight) nm = textures[idx++];
        return [m, n, r, s, rm, cm, nm];
    }, [textures, nNormal, nRoughness, nSpecular, nRing, nCloud, nNight]);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        if (meshRef.current) {
            meshRef.current.rotation.y += rotationSpeed;
        }
        if (ringRef.current) {
            ringRef.current.rotation.z += rotationSpeed * 0.5;
        }
        if (cloudRef.current) {
            cloudRef.current.rotation.y += rotationSpeed * 1.1; // Clouds move slightly faster
        }

        // Orbit logic
        if (orbitRadius > 0) {
            const angle = time * orbitSpeed;
            const x = Math.cos(angle) * orbitRadius;
            const z = Math.sin(angle) * orbitRadius;
            
            const pos = new THREE.Vector3(x, 0, z);
            if (meshRef.current) meshRef.current.position.copy(pos);
            if (ringRef.current) ringRef.current.position.copy(pos);
            if (cloudRef.current) cloudRef.current.position.copy(pos);
        }
    });

    return (
        <group>
            <mesh
                ref={meshRef}
                position={position}
                castShadow={castShadow}
                receiveShadow={receiveShadow}
                frustumCulled={true}
            >
                <sphereGeometry args={[radius, 64, 64]} />
                <meshStandardMaterial
                    map={map}
                    normalMap={normalMap}
                    roughnessMap={roughnessMap}
                    roughness={roughnessMap ? 1 : 0.8}
                    metalness={specularMap ? 0.2 : 0}
                    // Emissive for night lights
                    emissiveMap={nightMap}
                    emissive={nightMap ? new THREE.Color(0xffffff) : new THREE.Color(0x000000)}
                    emissiveIntensity={nightMap ? 2 : 0}
                />
            </mesh>

            {/* Cloud Layer */}
            {cloudMap && (
                <mesh ref={cloudRef} position={position} frustumCulled={true}>
                    <sphereGeometry args={[radius * 1.01, 64, 64]} />
                    <meshStandardMaterial
                        alphaMap={cloudMap}
                        transparent={true}
                        depthWrite={false}
                    />
                </mesh>
            )}

            {/* Ring Layer */}
            {ringMap && (
                <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
                    <ringGeometry args={[radius * 1.4, radius * 2.2, 64]} />
                    <meshStandardMaterial
                        map={ringMap}
                        transparent={true}
                        side={THREE.DoubleSide}
                        opacity={0.8}
                    />
                </mesh>
            )}
        </group>
    );
}
