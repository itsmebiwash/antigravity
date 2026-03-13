'use client';

import { useFrame, createPortal } from '@react-three/fiber';
import { useFBO } from '@react-three/drei';
import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { SimulationMaterial } from './shaders/SimulationMaterial';
import { generateMorphTargets, MorphShape } from './shaders/morphTargets';
import { useGestureStore } from '@/store/useGestureStore';

// Performance Check: Low Power Mode for Mobile
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
const size = isMobile ? 512 : 1024; // 262,144 vs 1,048,576 particles
const totalParticles = size * size;

const vertexShader = `
  uniform sampler2D uPositions;
  varying vec2 vUv;
  void main() {
    vUv = position.xy;
    vec4 pos = texture2D(uPositions, vUv);
    vec4 mvPosition = modelViewMatrix * vec4(pos.xyz, 1.0);
    gl_PointSize = (15.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  void main() {
    float alpha = 1.0 - smoothstep(0.0, 0.5, length(gl_PointCoord - vec2(0.5)));
    if (alpha < 0.01) discard;
    vec3 color = vec3(0.05, 0.94, 0.98); // Stark Neon Blue
    gl_FragColor = vec4(color, alpha * 0.5);
  }
`;

export default function Particles() {
    const { pointer, gestureMode, history, pushHistory } = useGestureStore();

    // Custom store/event listener for UI to update shapes could be implemented, 
    // but let's use a local state and an event listener on window.
    const [currentShape, setCurrentShape] = useState<MorphShape>('sphere');

    useEffect(() => {
        const handleShapeChange = (e: any) => {
            if (e.detail?.shape) {
                pushHistory(currentShape);
                setCurrentShape(e.detail.shape);
            }
        };
        const handleUndo = () => {
            const { popHistory } = useGestureStore.getState();
            const prev = popHistory();
            if (prev) setCurrentShape(prev as MorphShape);
        };

        window.addEventListener('changeShape', handleShapeChange);
        window.addEventListener('undoShape', handleUndo);
        return () => {
            window.removeEventListener('changeShape', handleShapeChange);
            window.removeEventListener('undoShape', handleUndo);
        };
    }, [currentShape, pushHistory]);

    const morphTargets = useMemo(() => generateMorphTargets(size), []);

    const target1 = useFBO(size, size, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
    });
    const target2 = useFBO(size, size, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
    });

    const renderTargetRef = useRef(target1);
    const renderTargetRef2 = useRef(target2);

    const simulationMaterialRef = useRef<SimulationMaterial>(null);
    const particleMaterialRef = useRef<THREE.ShaderMaterial>(null);

    const scene = useMemo(() => new THREE.Scene(), []);
    const camera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1), []);

    const particlesGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(totalParticles * 3);
        const uvs = new Float32Array(totalParticles * 2);

        for (let i = 0; i < totalParticles; i++) {
            const x = (i % size) / size;
            const y = Math.floor(i / size) / size;
            uvs[i * 2] = x;
            uvs[i * 2 + 1] = y;

            positions[i * 3] = (Math.random() - 0.5) * 4;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        return geometry;
    }, []);

    const renderMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uPositions: { value: null }
            },
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
    }, []);

    useFrame((state) => {
        const { gl, clock } = state;

        if (simulationMaterialRef.current) {
            simulationMaterialRef.current.uniforms.uTime.value = clock.elapsedTime;
            simulationMaterialRef.current.uniforms.uPointer.value.set(pointer.x, pointer.y, pointer.z);

            let gMode = 0.0;
            if (gestureMode === 'PINCH') gMode = 1.0;
            else if (gestureMode === 'PALM') gMode = 2.0;
            else if (gestureMode === 'POINT') gMode = 3.0;

            simulationMaterialRef.current.uniforms.uGestureMode.value = gMode;

            // Update Morph Target uniform
            simulationMaterialRef.current.uniforms.uTargetPositions.value = morphTargets[currentShape];

            gl.setRenderTarget(renderTargetRef2.current);
            gl.clear();
            gl.render(scene, camera);

            if (particleMaterialRef.current) {
                particleMaterialRef.current.uniforms.uPositions.value = renderTargetRef2.current.texture;
            }

            simulationMaterialRef.current.uniforms.uPositions.value = renderTargetRef2.current.texture;

            const temp = renderTargetRef.current;
            renderTargetRef.current = renderTargetRef2.current;
            renderTargetRef2.current = temp;
        }
        gl.setRenderTarget(null);
    });

    return (
        <>
            {createPortal(
                <mesh>
                    <planeGeometry args={[2, 2]} />
                    <primitive object={new SimulationMaterial(size)} ref={simulationMaterialRef} attach="material" />
                </mesh>,
                scene
            )}
            <points geometry={particlesGeometry} material={renderMaterial} ref={particleMaterialRef} />
        </>
    );
}
