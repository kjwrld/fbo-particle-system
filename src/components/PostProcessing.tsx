import * as THREE from "three";
import { useFrame, useThree, extend } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import { EffectComposer } from "three-stdlib";
import RenderPixelatedPass from "./RenderPixelatedPass.ts";
import { UnrealBloomPass } from "three-stdlib"; // Import bloom pass
import { useControls } from "leva";

extend({ EffectComposer, RenderPixelatedPass, UnrealBloomPass });

const PostProcessing = () => {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef<EffectComposer>(null!);

  // Leva controls for bloom intensity and related parameters
  const {
    bloomStrength,
    bloomRadius,
    bloomThreshold,
    pixelSize,
    normalEdgeStrength,
    depthEdgeStrength,
  } = useControls({
    bloomStrength: { value: 0.2, min: 0, max: 5, step: 0.1 },
    bloomRadius: { value: 0.08, min: 0, max: 1, step: 0.01 },
    bloomThreshold: { value: 0.4, min: 0, max: 1, step: 0.01 },
    pixelSize: { value: 2, min: 1, max: 20, step: 1 },
    normalEdgeStrength: { value: 2, min: 0, max: 2, step: 0.1 },
    depthEdgeStrength: { value: 1, min: 0, max: 1, step: 0.1 },
  });

  useEffect(() => {
    const pixelResolution = new THREE.Vector2(size.width, size.height)
      .divideScalar(pixelSize)
      .floor();

    composer.current = new EffectComposer(gl);

    // Add RenderPixelatedPass
    const pixelPass = new RenderPixelatedPass(pixelResolution, scene, camera);
    // Cast the material as ShaderMaterial to avoid TypeScript warnings
    const material = pixelPass.fsQuad.material as THREE.ShaderMaterial;

    // Set the uniform values for normalEdgeStrength and depthEdgeStrength
    material.uniforms.normalEdgeStrength.value = normalEdgeStrength;
    material.uniforms.depthEdgeStrength.value = depthEdgeStrength;
    composer.current.addPass(pixelPass);

    // Add UnrealBloomPass with dynamic Leva controls
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      bloomStrength,
      bloomRadius,
      bloomThreshold
    );
    composer.current.addPass(bloomPass);

    return () => composer.current?.dispose();
  }, [
    gl,
    scene,
    camera,
    size,
    bloomStrength,
    bloomRadius,
    bloomThreshold,
    pixelSize,
    normalEdgeStrength,
    depthEdgeStrength,
  ]);

  useFrame(() => composer.current?.render(), 1);

  return null;
};

export default PostProcessing;