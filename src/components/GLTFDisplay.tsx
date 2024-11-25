import { useGLTF, Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useRef, useMemo } from 'react'
import { Points as ThreePoints } from 'three'

const GLTFDisplay = () => {
  const gltf = useGLTF('/lorenz.glb')
  const pointsRef = useRef<ThreePoints>(null)
  
  // Extract all vertices from the GLTF model using useMemo
  const positions = useMemo(() => {
    const vertices: number[] = []
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const positionArray = child.geometry.attributes.position.array
        for (let i = 0; i < positionArray.length; i++) {
          vertices.push(positionArray[i])
        }
      }
    })
    return new Float32Array(vertices)
  }, [gltf])

  return (
    <group scale={[0.5, 0.5, 0.5]} position={[0, -15, 0]} rotation={[0, -Math.PI / 32, -Math.PI / 128]}>
      <Points ref={pointsRef} positions={positions}>
        <PointMaterial
          transparent
          vertexColors={false}
          size={0.05}
          sizeAttenuation={true}
          color="#ffaaff"
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  )
}

useGLTF.preload('/lorenz.gltf')

export default GLTFDisplay