import * as THREE from 'three';

const simulationVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const simulationFragmentShader = `
  uniform sampler2D uPositions;
  uniform sampler2D uTargetPositions;
  uniform float uTime;
  uniform vec3 uPointer;
  uniform float uGestureMode; // 0=None, 1=Pinch, 2=Palm, 3=Point
  
  varying vec2 vUv;
  
  void main() {
    vec4 posObj = texture2D(uPositions, vUv);
    vec4 targetObj = texture2D(uTargetPositions, vUv);
    vec3 pos = posObj.xyz;
    vec3 targetPos = targetObj.xyz;
    
    // Attraction logic
    if (uGestureMode == 3.0) { // Point (Magnetic)
      vec3 dir = uPointer - pos;
      float dist = length(dir);
      if (dist < 2.0) {
        pos += normalize(dir) * (2.0 - dist) * 0.05;
      } else {
        pos = mix(pos, targetPos, 0.02);
      }
    } else if (uGestureMode == 2.0) { // Palm (Blast)
      vec3 dir = pos - uPointer;
      float dist = length(dir);
      if (dist < 3.0) {
         pos += normalize(dir) * 0.1;
      } else {
         pos = mix(pos, targetPos, 0.02);
      }
    } else if (uGestureMode == 1.0) { // Pinch (Zoom/Attract to pointer)
      pos = mix(pos, uPointer, 0.03);
    } else {
      // Idle state - organic float toward target shape
      pos = mix(pos, targetPos, 0.03);
    }
    
    gl_FragColor = vec4(pos, 1.0);
  }
`;

export class SimulationMaterial extends THREE.ShaderMaterial {
    constructor(size: number) {
        // Generate initial random positions
        const data = new Float32Array(size * size * 4);
        for (let i = 0; i < size * size * 4; i += 4) {
            data[i] = (Math.random() - 0.5) * 4;
            data[i + 1] = (Math.random() - 0.5) * 4;
            data[i + 2] = (Math.random() - 0.5) * 4;
            data[i + 3] = 1.0;
        }

        const positionsTexture = new THREE.DataTexture(
            data,
            size,
            size,
            THREE.RGBAFormat,
            THREE.FloatType
        );
        positionsTexture.needsUpdate = true;

        super({
            vertexShader: simulationVertexShader,
            fragmentShader: simulationFragmentShader,
            uniforms: {
                uPositions: { value: positionsTexture },
                uTargetPositions: { value: positionsTexture },
                uTime: { value: 0 },
                uPointer: { value: new THREE.Vector3() },
                uGestureMode: { value: 0.0 }
            }
        });
    }
}
