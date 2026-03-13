'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import CelestialBody from './CelestialBody';
import Sun from './Sun';

export default function SolarSystem() {
    return (
        <group>
            {/* The Sun */}
            <Sun />

            {/* Mercury */}
            <CelestialBody
                name="Mercury"
                texturePath="/textures/8k_mercury.jpg"
                radius={2.4}
                position={[40, 0, 0]}
                orbitRadius={40}
                orbitSpeed={0.4}
                rotationSpeed={0.01}
            />

            {/* Venus */}
            <CelestialBody
                name="Venus"
                texturePath="/textures/8k_venus_surface.jpg"
                cloudTexturePath="/textures/4k_venus_atmosphere.jpg"
                radius={6}
                position={[60, 0, 0]}
                orbitRadius={60}
                orbitSpeed={0.3}
                rotationSpeed={0.002}
            />

            {/* Earth */}
            <CelestialBody
                name="Earth"
                texturePath="/textures/8k_earth_daymap.jpg"
                normalPath="/textures/8k_earth_normal_map.tif"
                specularPath="/textures/8k_earth_specular_map.tif"
                cloudTexturePath="/textures/8k_earth_clouds.jpg"
                nightTexturePath="/textures/8k_earth_nightmap.jpg"
                radius={6.3}
                position={[90, 0, 0]}
                orbitRadius={90}
                orbitSpeed={0.2}
                rotationSpeed={0.01}
            />

            {/* Moon (Relative to Earth) - Simplified as separate orbit for now or nested */}
            {/* For simplicity in this engine, we'll keep it as a separate orbit further out, 
                but nested would be better. Let's try to nest it. */}
            <group>
               {/* Earth Group would be better but let's just place Moon nearby */}
                <CelestialBody
                    name="Moon"
                    texturePath="/textures/8k_moon.jpg"
                    radius={1.7}
                    position={[105, 0, 0]}
                    orbitRadius={105}
                    orbitSpeed={0.19}
                    rotationSpeed={0.01}
                />
            </group>

            {/* Mars */}
            <CelestialBody
                name="Mars"
                texturePath="/textures/8k_mars.jpg"
                radius={3.4}
                position={[120, 0, 0]}
                orbitRadius={120}
                orbitSpeed={0.15}
                rotationSpeed={0.01}
            />

            {/* Jupiter */}
            <CelestialBody
                name="Jupiter"
                texturePath="/textures/8k_jupiter.jpg"
                radius={14}
                position={[180, 0, 0]}
                orbitRadius={180}
                orbitSpeed={0.08}
                rotationSpeed={0.02}
            />

            {/* Saturn */}
            <CelestialBody
                name="Saturn"
                texturePath="/textures/8k_saturn.jpg"
                ringTexturePath="/textures/8k_saturn_ring_alpha.png"
                radius={12}
                position={[250, 0, 0]}
                orbitRadius={250}
                orbitSpeed={0.05}
                rotationSpeed={0.015}
            />

            {/* Uranus */}
            <CelestialBody
                name="Uranus"
                texturePath="/textures/2k_uranus.jpg"
                radius={5}
                position={[320, 0, 0]}
                orbitRadius={320}
                orbitSpeed={0.03}
                rotationSpeed={0.01}
            />

            {/* Neptune */}
            <CelestialBody
                name="Neptune"
                texturePath="/textures/2k_neptune.jpg"
                radius={4.9}
                position={[380, 0, 0]}
                orbitRadius={380}
                orbitSpeed={0.02}
                rotationSpeed={0.01}
            />

            {/* Dwarf Planets */}
            <CelestialBody
                name="Ceres"
                texturePath="/textures/4k_ceres_fictional.jpg"
                radius={1.2}
                position={[150, 0, 0]}
                orbitRadius={150}
                orbitSpeed={0.1}
            />
            <CelestialBody
                name="Eris"
                texturePath="/textures/4k_eris_fictional.jpg"
                radius={1.5}
                position={[450, 0, 0]}
                orbitRadius={450}
                orbitSpeed={0.01}
            />
            <CelestialBody
                name="Haumea"
                texturePath="/textures/4k_haumea_fictional.jpg"
                radius={1.4}
                position={[420, 0, 0]}
                orbitRadius={420}
                orbitSpeed={0.012}
            />
            <CelestialBody
                name="Makemake"
                texturePath="/textures/4k_makemake_fictional.jpg"
                radius={1.4}
                position={[480, 0, 0]}
                orbitRadius={480}
                orbitSpeed={0.008}
            />
        </group>
    );
}

function SaturnRings() {
    // We'll use a separate function for rings
    // For now skip the complex shader, just use a ring geometry with texture
    return null; // I'll implement this properly in CelestialBody or here
}
