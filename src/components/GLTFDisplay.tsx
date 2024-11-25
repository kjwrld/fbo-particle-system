import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useRef, useMemo } from 'react'

const GLTFDisplay = () => {
  const { scene } = useGLTF('/lorenz.glb')
  
  const geometry = useMemo(() => {
    const vertices: number[] = []
    
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        console.log('Found mesh:', child)
        const positions = child.geometry.attributes.position.array
        console.log('Positions length:', positions.length)
        
        // Get world matrix
        child.updateMatrix()
        const matrix = child.matrix
        
        // Transform vertices by world matrix
        for (let i = 0; i < positions.length; i += 3) {
          const vertex = new THREE.Vector3(
            positions[i],
            positions[i + 1],
            positions[i + 2]
          )
          vertex.applyMatrix4(matrix)
          vertices.push(vertex.x, vertex.y, vertex.z)
        }
      }
    })

    console.log('Total vertices:', vertices.length / 3)
    
    const bufferGeometry = new THREE.BufferGeometry()
    bufferGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    )
    
    // Center the geometry
    bufferGeometry.center()
    
    // Compute bounding sphere for proper scaling
    bufferGeometry.computeBoundingSphere()
    
    return bufferGeometry
  }, [scene])

  return (
    <group
      scale={[0.5, 0.5, 0.5]}
      position={[0, -15, 0]}
      rotation={[0, -Math.PI / 32, 0]}
    >
      <points
        rotation={[0, Math.PI, 0]} // Additional rotation on points if needed
        position={[0, 0, 0]} // Additional position offset if needed
        scale={[1, 1, 1]} // Additional scaling if needed
      >
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={geometry.attributes.position.count}
            array={geometry.attributes.position.array}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          sizeAttenuation={true}
          color="#ffaaff"
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

export default GLTFDisplay