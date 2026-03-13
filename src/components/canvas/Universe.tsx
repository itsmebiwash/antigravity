'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useGestureStore } from '@/store/useGestureStore';

interface PlanetData {
    id: number;
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    mass: number;
    radius: number;
    color: THREE.Color;
    isDestroyed: boolean;
    name: string;
    desc: string;
}

const G = 0.5;

const PLANET_NAMES = ["Kepler-186f", "Gliese 581g", "Proxima Centauri b", "TRAPPIST-1e", "HD 209458 b"];
const PLANET_DESCS = [
    "A habitable-zone Earth-sized exoplanet.",
    "A super-Earth orbiting a red dwarf.",
    "The closest known exoplanet to the Solar System.",
    "A rocky planet in a tight orbit.",
    "A hot Jupiter exoplanet."
];

export default function Universe() {
    const numPlanets = 100;
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const { gestureMode, pointer, pushHistory } = useGestureStore();
    const { camera, raycaster, scene } = useThree();

    const [selectedPlanet, setSelectedPlanet] = useState<number | null>(null);
    const [hoveredPlanet, setHoveredPlanet] = useState<number | null>(null);

    const planets = useMemo<PlanetData[]>(() => {
        const arr: PlanetData[] = [];
        for (let i = 0; i < numPlanets; i++) {
            const dist = 50 + Math.random() * 400;
            const theta = Math.random() * Math.PI * 2;

            const centerMass = 10000;
            const vMag = Math.sqrt((G * centerMass) / dist);

            const vel = new THREE.Vector3(-Math.sin(theta) * vMag, 0, Math.cos(theta) * vMag);
            const pos = new THREE.Vector3(Math.cos(theta) * dist, (Math.random() - 0.5) * 20, Math.sin(theta) * dist);

            arr.push({
                id: i,
                position: pos,
                velocity: vel,
                mass: 1 + Math.random() * 5,
                radius: 1 + Math.random() * 4,
                color: new THREE.Color().setHSL(Math.random(), 0.8, 0.4),
                isDestroyed: false,
                name: PLANET_NAMES[i % PLANET_NAMES.length] + `-${i}`,
                desc: PLANET_DESCS[i % PLANET_DESCS.length]
            });
        }
        return arr;
    }, []);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Raycasting Logic
    useEffect(() => {
        if (gestureMode === 'ONE_TAP') {
            raycaster.setFromCamera(new THREE.Vector2(pointer.x, pointer.y), camera);
            if (meshRef.current) {
                const intersects = raycaster.intersectObject(meshRef.current);
                if (intersects.length > 0) {
                    const instanceId = intersects[0].instanceId;
                    if (instanceId !== undefined && !planets[instanceId].isDestroyed) {
                        setSelectedPlanet(instanceId);
                    }
                } else {
                    setSelectedPlanet(null);
                }
            }
        } else if (gestureMode === 'FIST' && selectedPlanet !== null) {
            // Destruction Sequence
            if (!planets[selectedPlanet].isDestroyed) {
                // Push history for undo
                pushHistory({ action: 'RESTORE', planetId: selectedPlanet });

                // In a full game, we'd spawn fragments here.
                // For now, mark as destroyed.
                planets[selectedPlanet].isDestroyed = true;
                setSelectedPlanet(null);
            }
        }
    }, [gestureMode, pointer, camera, raycaster, planets, selectedPlanet, pushHistory]);

    // Undo listener
    useEffect(() => {
        const handleUndo = () => {
            const { popHistory } = useGestureStore.getState();
            const action = popHistory();
            if (action && action.action === 'RESTORE') {
                planets[action.planetId].isDestroyed = false;
            }
        };
        window.addEventListener('undoAction', handleUndo);
        return () => window.removeEventListener('undoAction', handleUndo);
    }, [planets]);


    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Pointer hover effect
        raycaster.setFromCamera(new THREE.Vector2(pointer.x, pointer.y), camera);
        const intersects = raycaster.intersectObject(meshRef.current);
        if (intersects.length > 0 && intersects[0].instanceId !== undefined && !planets[intersects[0].instanceId].isDestroyed) {
            setHoveredPlanet(intersects[0].instanceId);
        } else {
            setHoveredPlanet(null);
        }

        const dt = Math.min(delta, 0.1);
        const centerMass = 10000;
        const centerPos = new THREE.Vector3(0, 0, 0);

        for (let i = 0; i < numPlanets; i++) {
            const p = planets[i];
            if (p.isDestroyed) {
                dummy.position.set(99999, 99999, 99999);
                dummy.scale.set(0, 0, 0);
                dummy.updateMatrix();
                meshRef.current.setMatrixAt(i, dummy.matrix);
                continue;
            }

            const forceDir = centerPos.clone().sub(p.position);
            const distSq = forceDir.lengthSq();
            const dist = Math.sqrt(distSq);
            forceDir.normalize();

            const accelMag = (G * centerMass) / Math.max(distSq, 10);

            p.velocity.add(forceDir.multiplyScalar(accelMag * dt));
            p.position.add(p.velocity.clone().multiplyScalar(dt));

            dummy.position.copy(p.position);

            let targetScale = p.radius;
            if (hoveredPlanet === i || selectedPlanet === i) {
                targetScale *= 1.5; // Emphasize selection
                meshRef.current.setColorAt(i, new THREE.Color(0x0ff0fc)); // Neon Blue Highlight
            } else {
                meshRef.current.setColorAt(i, p.color);
            }

            dummy.scale.setScalar(targetScale);
            dummy.updateMatrix();

            meshRef.current.setMatrixAt(i, dummy.matrix);
        }

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <>
            <instancedMesh ref={meshRef} args={[undefined, undefined, numPlanets]} castShadow receiveShadow>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial metalness={0.2} roughness={0.8} />
            </instancedMesh>

            {/* Spatial HUD Overlay for Selected Planet */}
            {selectedPlanet !== null && !planets[selectedPlanet].isDestroyed && (
                <Html position={planets[selectedPlanet].position} center zIndexRange={[100, 0]}>
                    <div className="stark-panel p-4 text-white w-64 translate-x-8 -translate-y-8 flex flex-col gap-2">
                        <h3 className="hud-font text-lg text-[var(--neon-blue)] border-b border-[var(--neon-blue)] pb-1">
                            {planets[selectedPlanet].name}
                        </h3>
                        <p className="text-xs text-slate-300 bg-black/50 p-2 rounded">
                            {planets[selectedPlanet].desc}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-[10px] tabular-nums mt-1">
                            <div className="bg-blue-900/30 p-1 rounded">MASS: {planets[selectedPlanet].mass.toFixed(2)}</div>
                            <div className="bg-purple-900/30 p-1 rounded">RAD: {planets[selectedPlanet].radius.toFixed(2)}</div>
                        </div>
                        <div className="mt-2 text-xs text-red-400 font-bold uppercase animate-pulse">
                            Make FIST to DESTRUCT
                        </div>
                    </div>
                </Html>
            )}
        </>
    );
}
