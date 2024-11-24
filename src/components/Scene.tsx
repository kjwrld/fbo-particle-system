import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import LorenzSystem from './LorenzSystem'
import { useControls, folder } from 'leva'
import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'

function CameraController() {
  const { camera } = useThree()
  
  const [cameraControls, setCameraControls] = useControls('Camera', () => ({
    cameraX: { value: 172, min: -100, max: 300, step: 1 },
    cameraY: { value: -23, min: -100, max: 300, step: 1 },
    cameraZ: { value: 15, min: -100, max: 300, step: 1 },
    fov: { value: 50, min: 20, max: 120, step: 1 },
    near: { value: 0.1, min: 0.1, max: 50, step: 0.1 },
    far: { value: 1000, min: 100, max: 5000, step: 100 },
    panX: { value: 0, min: -50, max: 50, step: 1 },
    panY: { value: 58, min: -50, max: 100, step: 1 },
    panZ: { value: 0, min: -50, max: 50, step: 1 }
  }))

  const orbitControls = useControls('Orbit Controls', {
    minDistance: { value: 10, min: 1, max: 100, step: 1 },
    maxDistance: { value: 200, min: 50, max: 500, step: 10 },
    rotateSpeed: { value: 0.5, min: 0.1, max: 2, step: 0.1 },
    dampingFactor: { value: 0.05, min: 0.01, max: 0.5, step: 0.01 },
    enableDamping: true,
    autoRotate: false,
    autoRotateSpeed: { value: 1.0, min: 0.1, max: 5, step: 0.1 }
  })

  useEffect(() => {
    camera.position.set(cameraControls.cameraX, cameraControls.cameraY, cameraControls.cameraZ)
    camera.fov = cameraControls.fov
    camera.near = cameraControls.near
    camera.far = cameraControls.far
    camera.updateProjectionMatrix()
  }, [camera, cameraControls])

  const controlsRef = useRef<any>(null)

  // Update Leva controls when orbit controls change
  useEffect(() => {
    if (!controlsRef.current) return

    const updateLevaControls = () => {
      const position = controlsRef.current.object.position
      setCameraControls({
        cameraX: Math.round(position.x),
        cameraY: Math.round(position.y),
        cameraZ: Math.round(position.z)
      })
    }

    controlsRef.current.addEventListener('change', updateLevaControls)
    return () => {
      if (controlsRef.current) {
        controlsRef.current.removeEventListener('change', updateLevaControls)
      }
    }
  }, [controlsRef, setCameraControls])

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(
        cameraControls.panX,
        cameraControls.panY,
        cameraControls.panZ
      )
    }
  }, [cameraControls.panX, cameraControls.panY, cameraControls.panZ])

  return (
    <OrbitControls 
      ref={controlsRef}
      {...orbitControls}
    />
  )
}

export default function Scene() {
  const sceneControls = useControls({
    'Scene Settings': folder({
      backgroundColor: '#000000',
      showHelpers: false
    }),
    'Lorenz Rotation': folder({
      rotateX: { value: -1.57, min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 },
      rotateY: { value: 0.31, min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 },
      rotateZ: { value: 1.44, min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 },
      positionX: { value: 0, min: -20, max: 20, step: 0.1 },
      positionY: { value: -3.9, min: -20, max: 20, step: 0.1 },
      positionZ: { value: 0, min: -20, max: 20, step: 0.1 }
    })
  })

  return (
    <Canvas camera={{ position: [0, 0, 50], fov: 50 }}>
      <color attach="background" args={[sceneControls.backgroundColor]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      {sceneControls.showHelpers && (
        <>
          <gridHelper args={[100, 100]} />
          <axesHelper args={[50]} />
        </>
      )}
      
      <LorenzSystem 
        rotation={[
          sceneControls.rotateX,
          sceneControls.rotateY,
          sceneControls.rotateZ
        ]}
        position={[
          sceneControls.positionX,
          sceneControls.positionY,
          sceneControls.positionZ
        ]}
      />
      <CameraController />
    </Canvas>
  )
}