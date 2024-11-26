import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { extend, useFrame, Object3DNode, MaterialNode } from "@react-three/fiber";
import { MeshLineGeometry, MeshLineMaterial, raycast } from "meshline";
import { useControls } from "leva";

// Extend React Three Fiber with MeshLine elements
extend({ MeshLineGeometry, MeshLineMaterial });

// Declare types for MeshLineGeometry and MeshLineMaterial
declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: Object3DNode<MeshLineGeometry, typeof MeshLineGeometry>;
    meshLineMaterial: MaterialNode<MeshLineMaterial, typeof MeshLineMaterial>;
  }
}

interface LorenzParams {
  a: number;
  b: number;
  c: number;
  dt: number;
  scale: number;
  yScale: number;
  zScale: number;
  initialPosition: { x: number; y: number; z: number };
}

interface SparkLineProps {
  points: THREE.Vector3[];
  width: number;
  color: string;
  speed: number;
  dashRatio: number;
}

function generateLorenzPoints(
  params: LorenzParams,
  numPoints: number
): THREE.Vector3[] {
  let { x, y, z } = params.initialPosition;
  const points: THREE.Vector3[] = [];

  for (let i = 0; i < numPoints; i++) {
    const dx = params.a * (y - x);
    const dy = x * (params.b - z) - y;
    const dz = x * y - params.c * z;

    x += params.dt * dx;
    y += params.dt * dy * params.yScale;
    z += params.dt * dz * params.zScale;

    points.push(new THREE.Vector3(x * params.scale, y * params.scale, z * params.scale));
  }

  return points;
}

const SparkLine: React.FC<SparkLineProps> = ({ points, width, color, speed, dashRatio }) => {
  const materialRef = useRef<MeshLineMaterial>(null);

  // Flatten the Vector3 array into a number array
  const flattenedPoints = useMemo(
    () => points.map((p) => [p.x, p.y, p.z]).flat(),
    [points]
  );

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.dashOffset.value -= speed;
    }
  });

  return (
    <mesh raycast={raycast}>
      <meshLineGeometry points={flattenedPoints} />
      <meshLineMaterial
        ref={materialRef}
        transparent
        depthTest={false}
        lineWidth={width}
        color={color}
        dashArray={0.1}
        dashRatio={dashRatio}
      />
    </mesh>
  );
};

const LorenzSparks: React.FC = () => {
  const params = useControls({
    particleCount: { value: 10, min: 1, max: 50, step: 1 },
    pointsPerLine: { value: 5000, min: 1000, max: 10000, step: 100 },
    scale: { value: 0.1, min: 0.01, max: 1, step: 0.01 },
    // Lorenz parameters
    a: { value: 11.14, min: 0, max: 20, step: 0.01 },
    b: { value: 40, min: 0, max: 50, step: 0.1 },
    c: { value: 5, min: 0, max: 10, step: 0.1 },
    dt: { value: 0.005, min: 0.001, max: 0.01, step: 0.001 },
    yScale: { value: 1.18, min: 0.5, max: 2, step: 0.01 },
    zScale: { value: 0.8, min: 0.5, max: 2, step: 0.01 },
    // Particle parameters
    lineWidth: { value: 0.2, min: 0.1, max: 1, step: 0.1 },
    dashRatio: { value: 0.95, min: 0.1, max: 0.99, step: 0.01 },
    speed: { value: 0.002, min: 0.0001, max: 0.01, step: 0.0001 },
  });

  const colors = useMemo(() => ["#ff3366", "#ff6633", "#ffcc33", "#33ff99", "#3366ff"], []);

  const lines = useMemo(() => {
    return new Array(params.particleCount).fill(null).map((_, i) => {
      const initialOffset = Math.random() * Math.PI * 2;
      const points = generateLorenzPoints(
        {
          ...params,
          initialPosition: {
            x: 2 * Math.cos(initialOffset),
            y: 4 * Math.sin(initialOffset),
            z: 4,
          },
        },
        params.pointsPerLine
      );

      return {
        points,
        color: colors[i % colors.length],
        width: params.lineWidth * (0.5 + Math.random() * 0.5),
        speed: params.speed * (0.8 + Math.random() * 0.4),
        dashRatio: params.dashRatio,
      };
    });
  }, [params, colors]);

  return (
    <group>
      {lines.map((props, i) => (
        <SparkLine key={i} {...props} />
      ))}
    </group>
  );
};

export default LorenzSparks;
