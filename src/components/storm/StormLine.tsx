import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshLineGeometry, MeshLineMaterial, raycast } from "meshline";
import { createAttractor, updateAttractor } from "./attractors";

export const StormLine: React.FC<any> = ({
    radius,
    simulation,
    width,
    color,
    speed,
    dashArray,
    dashRatio,
    opacity,
}) => {
    const lineRef = useRef<MeshLineGeometry>(null);
    const [positions, currentPosition] = useMemo(
        () => createAttractor(100),
        []
    );

    useFrame(() => {
        if (lineRef.current) {
            const nextPosition = updateAttractor(
                currentPosition,
                radius,
                simulation,
                speed
            );
            lineRef.current.advance(nextPosition);
        }
    });

    return (
        <mesh raycast={raycast}>
            <meshLineGeometry
                ref={lineRef}
                points={positions.map((p) => [p.x, p.y, p.z]).flat()}
            />
            <meshLineMaterial
                transparent
                depthTest={false}
                lineWidth={width}
                color={color}
                dashArray={dashArray}
                dashRatio={dashRatio}
                opacity={opacity}
            />
        </mesh>
    );
};
