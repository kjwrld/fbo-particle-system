import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

interface LorenzSystemProps {
  rotation: [number, number, number]
  position: [number, number, number]
}

export default function LorenzSystem({ rotation, position }: LorenzSystemProps) {
  const pointsRef = useRef<THREE.Points>(null!)
  const SKIP_POINTS = 100  // Number of points to skip
  const TOTAL_POINTS = 5000
  const USED_POINTS = TOTAL_POINTS - SKIP_POINTS
  
  // Generate all points including skipped ones
  const allPositions = new Float32Array(USED_POINTS * 3)
  
  // Initial conditions
  let x = 2, y = 4, z = 4
  const a = 11.14
  const b = 40
  const c = 5
  const dt = 0.005

  // Generate initial points that we'll skip
  for (let i = 0; i < SKIP_POINTS; i++) {
    const dx = a * (y - x)
    const dy = x * (b - z) - y
    const dz = x * y - c * z
    
    x += dt * dx
    y += dt * dy * 1.18
    z += dt * dz * 0.8
  }

  // Generate points we'll actually use
  for (let i = 0; i < USED_POINTS; i++) {
    const dx = a * (y - x)
    const dy = x * (b - z) - y
    const dz = x * y - c * z
    
    x += dt * dx
    y += dt * dy * 1.18
    z += dt * dz * 0.8
    
    allPositions[i * 3] = x * 1.2
    allPositions[i * 3 + 1] = y * 0.1
    allPositions[i * 3 + 2] = z * 0.8
  }

  const bufferGeometry = new THREE.BufferGeometry()
  bufferGeometry.setAttribute('position', new THREE.BufferAttribute(allPositions, 3))

  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      baseColor: { value: new THREE.Color(0xff3366) },
      glowColor: { value: new THREE.Color(0xff99cc) }
    },
    vertexShader: `
      uniform float time;
      
      void main() {
        vec3 pos = position;
        
        // Add gentle wave motion
        float wave = sin(pos.x * 0.1 + time) * 0.1;
        pos.y += wave;
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        // Size oscillation based on wave
        float size = 2.0 * (1.0 + sin(time * 0.5 + pos.x * 0.1) * 0.2);
        gl_PointSize = size * (1500.0 / -mvPosition.z);
      }
    `,
    fragmentShader: `
      uniform vec3 baseColor;
      uniform vec3 glowColor;
      uniform float time;

      void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        if (dist > 0.5) discard;
        
        // Pulse effect
        float pulse = sin(time) * 0.5 + 0.5;
        
        // Color gradient
        vec3 color = mix(baseColor, glowColor, pulse);
        
        // Fade out towards edges
        float strength = 1.0 - smoothstep(0.0, 0.5, dist);
        strength = pow(strength, 1.5);
        
        gl_FragColor = vec4(color, strength);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  // Animate
  useFrame((state) => {
    if (!pointsRef.current) return
    pointsRef.current.material.uniforms.time.value = state.clock.elapsedTime
  })

  return (
    <group scale={1.6} rotation={rotation} position={position}>
      <points ref={pointsRef} geometry={bufferGeometry} material={material} />
    </group>
  )
}