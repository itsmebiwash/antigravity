import * as THREE from 'three';

export type MorphShape = 'sphere' | 'heart' | 'sakura' | 'saturn' | 'fireworks';

function createDataTexture(data: Float32Array, size: number) {
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
    texture.needsUpdate = true;
    return texture;
}

export function generateMorphTargets(size: number): Record<MorphShape, THREE.DataTexture> {
    const total = size * size;

    const sphere = new Float32Array(total * 4);
    const heart = new Float32Array(total * 4);
    const sakura = new Float32Array(total * 4);
    const saturn = new Float32Array(total * 4);
    const fireworks = new Float32Array(total * 4);

    for (let i = 0; i < total; i++) {
        const stride = i * 4;

        // 1. SPHERE
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const r = 2.0;
        sphere[stride] = r * Math.sin(phi) * Math.cos(theta);
        sphere[stride + 1] = r * Math.sin(phi) * Math.sin(theta);
        sphere[stride + 2] = r * Math.cos(phi);
        sphere[stride + 3] = 1.0;

        // 2. HEART
        const t = Math.random() * Math.PI * 2;
        const heartX = 16 * Math.pow(Math.sin(t), 3);
        const heartY = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        const heartZ = (Math.random() - 0.5) * 2; // Flat with slight depth
        const scaleH = 0.15;
        heart[stride] = heartX * scaleH;
        heart[stride + 1] = heartY * scaleH;
        heart[stride + 2] = heartZ;
        heart[stride + 3] = 1.0;

        // 3. SAKURA (Petal-like math)
        const st = Math.random() * Math.PI * 2;
        const sr = Math.random();
        const petal = 1.5 + Math.sin(5 * st) * 0.5; // 5 petals
        sakura[stride] = sr * petal * Math.cos(st) * 1.5;
        sakura[stride + 1] = sr * petal * Math.sin(st) * 1.5;
        sakura[stride + 2] = (Math.random() - 0.5) * 1.0; // depth thickness
        sakura[stride + 3] = 1.0;

        // 4. SATURN (Inner sphere + distinct outer ring)
        const isRing = Math.random() > 0.4;
        if (isRing) {
            const rt = Math.random() * Math.PI * 2;
            const rr = 2.5 + Math.random() * 1.5; // Ring radius 2.5 to 4.0
            saturn[stride] = rr * Math.cos(rt);
            saturn[stride + 1] = (Math.random() - 0.5) * 0.1; // Flat ring
            saturn[stride + 2] = rr * Math.sin(rt);
        } else {
            const bodyT = Math.random() * Math.PI * 2;
            const bodyP = Math.acos(Math.random() * 2 - 1);
            const bRad = 1.5;
            saturn[stride] = bRad * Math.sin(bodyP) * Math.cos(bodyT);
            saturn[stride + 1] = bRad * Math.sin(bodyP) * Math.sin(bodyT);
            saturn[stride + 2] = bRad * Math.cos(bodyP);
        }
        saturn[stride + 3] = 1.0;

        // 5. FIREWORKS (Burst logic, random spheres with varying radii)
        const fwRadius = Math.random() * Math.random() * 4.0;
        const fwT = Math.random() * Math.PI * 2;
        const fwP = Math.acos(Math.random() * 2 - 1);
        fireworks[stride] = fwRadius * Math.sin(fwP) * Math.cos(fwT);
        fireworks[stride + 1] = fwRadius * Math.sin(fwP) * Math.sin(fwT);
        fireworks[stride + 2] = fwRadius * Math.cos(fwP);
        fireworks[stride + 3] = 1.0;
    }

    return {
        sphere: createDataTexture(sphere, size),
        heart: createDataTexture(heart, size),
        sakura: createDataTexture(sakura, size),
        saturn: createDataTexture(saturn, size),
        fireworks: createDataTexture(fireworks, size)
    };
}
