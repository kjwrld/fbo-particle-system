// import Scene from './components/Scene.tsx'
// import './App.css'

// function App() {
//   return (
//     <div className="App">
//       <Scene />
//     </div>
//   )
// }

// export default App

import { Canvas } from '@react-three/fiber'
import LorenzSparks from './LorenzSparks'
import { OrbitControls } from '@react-three/drei'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 50], fov: 45 }}>
        <color attach="background" args={['#ffffff']} />
        <LorenzSparks />
        <OrbitControls />
      </Canvas>
    </div>
  )
}

export default App