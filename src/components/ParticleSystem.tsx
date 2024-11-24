import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

const PARTICLES = 10000

export default function ParticleSystem() {
  const pointsRef = useRef<THREE.Points>(null!)
  const mousePos = useRef(new THREE.Vector3())

  // Create initial positions for the particles
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(PARTICLES * 3)
    let x = 2, y = 4, z = 4
    
    for (let i = 0; i < PARTICLES * 3; i += 3) {
      const params = { a: 11.14, b: 40, c: 5, dt: 0.005 }
      
      const dx = params.a * (y - x)
      const dy = x * (params.b - z) - y
      const dz = x * y - params.c * z
      
      x += params.dt * dx * 1.2
      y += params.dt * dy * 0.1 * 1.18
      z += params.dt * dz * 0.8
      
      positions[i] = x 
      positions[i + 1] = y
      positions[i + 2] = z
    }
    return positions
  }, [])

  // Custom shader material
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        mousePos: { value: new THREE.Vector3() }
      },
      vertexShader: `
        uniform float time;
        uniform vec3 mousePos;
        
        varying vec3 vColor;
        
        vec3 lorenzAttractor(vec3 pos) {
          float a = 11.14;
          float b = 40.0;
          float c = 5.0;
          float dt = 0.005;
          
          float dx = a * (pos.y - pos.x);
          float dy = pos.x * (b - pos.z) - pos.y;
          float dz = pos.x * pos.y - c * pos.z;
          
          return vec3(
            dt * dx * 1.2,
            dt * dy * 0.1 * 1.18,
            dt * dz * 0.8
          );
        }
        
        void main() {
          vec3 pos = position;
          
          // Calculate next position on Lorenz attractor
          vec3 targetPos = pos + lorenzAttractor(pos);
          
          // Mouse repulsion
          vec3 toMouse = pos - mousePos;
          float dist = length(toMouse);
          float repelStrength = smoothstep(50.0, 0.0, dist);
          vec3 repelForce = normalize(toMouse) * repelStrength * 2.0;
          
          // Final position
          vec3 finalPos = mix(targetPos, pos + repelForce, repelStrength);
          
          // Project position
          vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // Point size based on distance
          gl_PointSize = 2.0;
          
          // Color based on position and mouse proximity
          vColor = normalize(finalPos) * 0.5 + 0.5;
          vColor = mix(vColor, vec3(1.0, 0.5, 0.8), repelStrength * 0.8);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          gl_FragColor = vec4(vColor, 1.0);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return

    // Update uniforms
    shaderMaterial.uniforms.time.value = state.clock.getElapsedTime()
    
    // Update mouse position
    const { mouse } = state
    mousePos.current.set(mouse.x * 100, mouse.y * 100, 0)
    shaderMaterial.uniforms.mousePos.value = mousePos.current
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLES}
          array={particlePositions}
          itemSize={3}
        />
      </bufferGeometry>
      <primitive object={shaderMaterial} />
    </points>
  )
}