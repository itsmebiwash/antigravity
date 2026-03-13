'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useGestureStore } from '@/store/useGestureStore';
import * as THREE from 'three';
import { useRef, useEffect } from 'react';

export default function CameraController() {
    const { camera } = useThree();
    const { gestureMode, pointer } = useGestureStore();

    const targetOrbitRef = useRef<{ theta: number, phi: number, radius: number }>({
        theta: Math.PI / 4,
        phi: Math.PI / 4,
        radius: 150
    });

    const currentOrbitRef = useRef({ ...targetOrbitRef.current });
    const previousPointerRef = useRef({ x: 0, y: 0 });

    useFrame((_, delta) => {
        // Handling Gestures for Camera
        if (gestureMode === 'TWO_FINGER_SWIPE') {
            const dx = pointer.x - previousPointerRef.current.x;
            const dy = pointer.y - previousPointerRef.current.y;

            targetOrbitRef.current.theta -= dx * 2.0;
            targetOrbitRef.current.phi -= dy * 2.0;

            // Clamp phi to prevent flipping
            targetOrbitRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, targetOrbitRef.current.phi));
        }

        if (gestureMode === 'TRI_FINGER_PINCH') {
            // Zooming mechanism 
            // A simple approach is using vertical pointer motion while pinching to zoom
            const dy = pointer.y - previousPointerRef.current.y;
            targetOrbitRef.current.radius += dy * 200;
            targetOrbitRef.current.radius = Math.max(10, Math.min(targetOrbitRef.current.radius, 1000));
        }

        // Smooth interpolation (Damping)
        const dt = Math.min(delta, 0.1);
        const damping = 5.0;

        currentOrbitRef.current.theta += (targetOrbitRef.current.theta - currentOrbitRef.current.theta) * damping * dt;
        currentOrbitRef.current.phi += (targetOrbitRef.current.phi - currentOrbitRef.current.phi) * damping * dt;
        currentOrbitRef.current.radius += (targetOrbitRef.current.radius - currentOrbitRef.current.radius) * damping * dt;

        // Convert Spherical to Cartesian Coordinates for Camera
        const r = currentOrbitRef.current.radius;
        const t = currentOrbitRef.current.theta;
        const p = currentOrbitRef.current.phi;

        camera.position.x = r * Math.sin(p) * Math.sin(t);
        camera.position.y = r * Math.cos(p);
        camera.position.z = r * Math.sin(p) * Math.cos(t);

        camera.lookAt(0, 0, 0);

        previousPointerRef.current = { x: pointer.x, y: pointer.y };
    });

    return null;
}
