import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useControls, folder } from "leva";
import LorenzSparks from "./LorenzSparks";

export default function Scene() {
    const sceneControls = useControls({
        "Scene Settings": folder({
            backgroundColor: "#ffffff",
            showHelpers: false,
        }),
    });

    return (
        <Canvas camera={{ position: [0, 0, 50], fov: 75 }}>
            <color attach="background" args={[sceneControls.backgroundColor]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />

            {sceneControls.showHelpers && (
                <>
                    <gridHelper args={[100, 100]} />
                    <axesHelper args={[50]} />
                </>
            )}

            <LorenzSparks />

            <OrbitControls
                makeDefault
                target={[0, 0, 0]}
                enableDamping
                dampingFactor={0.05}
                minDistance={5}
                maxDistance={500}
            />
        </Canvas>
    );
}
