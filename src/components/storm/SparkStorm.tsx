import React, { useMemo } from "react";
import { useControls, folder } from "leva";
import { StormLine } from "./StormLine";
import { lorenzMod2Attractor } from "./attractors";
import Random from "canvas-sketch-util/random";

interface SparkStormProps {
    count?: number;
    colors?: string[];
    baseRadius?: number;
    rotation?: [number, number, number];
}

export const SparkStorm: React.FC<SparkStormProps> = ({
    count = 15,
    colors = ["#dd607e", "#dc5277", "#a05aad", "#9983bd", "#4d4b88"],
    baseRadius = 10,
    rotation = [-Math.PI / 2, 0, -Math.PI / 32],
}) => {
    const params = useControls("Spark Storm", {
        "Global Settings": folder({
            lineWidth: { value: 0.2, min: 0.1, max: 1, step: 0.1 },
            speed: { value: 0.005, min: 0.001, max: 0.01, step: 0.001 },
            radiusVariation: { value: 0.2, min: 0, max: 0.5, step: 0.01 },
            attractorType: {
                options: {
                    LorenzMod2: lorenzMod2Attractor,
                },
                value: lorenzMod2Attractor,
            },
        }),
        "Line Appearance": folder({
            opacity: { value: 0.8, min: 0.1, max: 1, step: 0.05 },
            dashArray: { value: 0.1, min: 0, max: 1, step: 0.01 },
            dashRatio: { value: 0.5, min: 0, max: 1, step: 0.01 },
        }),
        "Animation Settings": folder({
            animationSpeedMultiplier: {
                value: 1.0,
                min: 0.1,
                max: 5,
                step: 0.1,
            },
            enableWobble: { value: false },
            wobbleIntensity: {
                value: 0.2,
                min: 0,
                max: 1,
                step: 0.01,
                render: (get) => get("enableWobble"),
            },
        }),
        "Line Colors": folder({
            colorMode: {
                value: "random",
                options: ["random", "fixed"],
            },
            fixedColor: {
                value: "#dd607e",
                render: (get) => get("colorMode") === "fixed",
            },
        }),
        "Scaling Settings": folder({
            minScale: { value: 0.5, min: 0.1, max: 1, step: 0.01 },
            maxScale: { value: 1.2, min: 0.5, max: 2, step: 0.01 },
        }),
    });

    const lines = useMemo(() => {
        return new Array(count).fill(null).map(() => {
            const color =
                params.colorMode === "random"
                    ? Random.pick(colors)
                    : params.fixedColor;

            const wobbleOffset = params.enableWobble
                ? Random.range(-params.wobbleIntensity, params.wobbleIntensity)
                : 0;

            return {
                color,
                width: params.lineWidth * (0.5 + Math.random() * 0.5),
                speed:
                    params.speed *
                    params.animationSpeedMultiplier *
                    (0.8 + Math.random() * 0.4),
                simulation: params.attractorType,
                radius:
                    baseRadius *
                    (1 +
                        Random.range(
                            -params.radiusVariation + wobbleOffset,
                            params.radiusVariation + wobbleOffset
                        )),
                dashArray: params.dashArray,
                dashRatio: params.dashRatio,
                opacity: params.opacity,
            };
        });
    }, [count, colors, baseRadius, params]);

    return (
        <group rotation={rotation}>
            {lines.map((props, index) => (
                <StormLine key={index} {...props} />
            ))}
        </group>
    );
};
