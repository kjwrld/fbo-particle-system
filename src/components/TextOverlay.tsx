import React, { useMemo } from "react";
import { Text3D, shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useControls, folder } from "leva";

const PencilEdgeMaterial = shaderMaterial(
    {
        color: new THREE.Color("#ffffff"),
        outlineColor: new THREE.Color("#000000"),
        outlineThickness: 0.05,
        time: 0,
        noiseScale: 40.0,
        strokeMultiplier: 0.8,
        hatchingAngle: 0.0,
        hatchingDensity: 150.0,
        noiseStrength: 0.3,
        animationSpeed: 0.1,
    },
    // Vertex shader remains the same as before
    `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      vUv = uv;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
    // Updated Fragment shader with new uniforms
    `
    uniform vec3 color;
    uniform vec3 outlineColor;
    uniform float outlineThickness;
    uniform float time;
    uniform float noiseScale;
    uniform float strokeMultiplier;
    uniform float hatchingAngle;
    uniform float hatchingDensity;
    uniform float noiseStrength;
    uniform float animationSpeed;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    
    // Simplex noise function remains the same
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    float hatch(vec2 p, float angle) {
      float noise = snoise(p * noiseScale + time * animationSpeed);
      float hatchLine = sin(
        p.x * cos(angle + hatchingAngle) * hatchingDensity + 
        p.y * sin(angle + hatchingAngle) * hatchingDensity
      );
      return smoothstep(0.0, 0.5, hatchLine + noise * noiseStrength);
    }
    
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = dot(normal, viewDir);
      
      float noise1 = snoise(vUv * noiseScale + time * animationSpeed);
      float noise2 = snoise((vUv + vec2(123.45, 678.90)) * noiseScale - time * animationSpeed);
      float noiseEdge = mix(noise1, noise2, 0.5) * noiseStrength;
      
      float hatch1 = hatch(vUv, 0.0);
      float hatch2 = hatch(vUv, 1.571);
      float hatchCombined = mix(hatch1, hatch2, 0.5);
      
      float outline = smoothstep(
        outlineThickness + noiseEdge,
        outlineThickness + noiseEdge + 0.05,
        fresnel
      );
      
      float sketchyEdge = mix(
        outline,
        outline * hatchCombined,
        strokeMultiplier
      );
      
      vec3 finalColor = mix(outlineColor, color, sketchyEdge);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

extend({ PencilEdgeMaterial });

interface TextOverlayProps {
    content: string;
    position?: [number, number, number];
    initialColor?: string;
    initialOutlineColor?: string;
    fontSize?: number;
    depth?: number;
}

const TextOverlay: React.FC<TextOverlayProps> = ({
    content,
    position = [0, 0, 0],
    initialColor = "#ffffff",
    initialOutlineColor = "#000000",
    fontSize = 6,
    depth = 0.5,
}) => {
    const materialRef = React.useRef<any>();
    const groupRef = React.useRef<THREE.Group>(null);

    // Leva controls
    const {
        color,
        outlineColor,
        outlineThickness,
        noiseScale,
        strokeMultiplier,
        hatchingAngle,
        hatchingDensity,
        noiseStrength,
        animationSpeed,
        rotationSpeed,
        autoRotate,
    } = useControls({
        "Text Style": folder({
            color: initialColor,
            outlineColor: initialOutlineColor,
        }),
        "Edge Effect": folder({
            outlineThickness: {
                value: 0.44,
                min: 0,
                max: 1,
                step: 0.01,
            },
            strokeMultiplier: {
                value: 0,
                min: 0,
                max: 1,
                step: 0.05,
            },
        }),
        Hatching: folder({
            hatchingAngle: {
                value: 0,
                min: 0,
                max: Math.PI * 2,
                step: 0.1,
            },
            hatchingDensity: {
                value: 150,
                min: 50,
                max: 300,
                step: 10,
            },
        }),
        Noise: folder({
            noiseScale: {
                value: 40,
                min: 1,
                max: 100,
                step: 1,
            },
            noiseStrength: {
                value: 0.3,
                min: 0,
                max: 1,
                step: 0.05,
            },
        }),
        Animation: folder({
            animationSpeed: {
                value: 0.1,
                min: 0,
                max: 1,
                step: 0.05,
            },
            autoRotate: false,
            rotationSpeed: {
                value: 0.5,
                min: 0,
                max: 2,
                step: 0.1,
            },
        }),
    });

    // Convert colors to Three.js colors
    const mainColor = useMemo(() => new THREE.Color(color), [color]);
    const strokeColor = useMemo(
        () => new THREE.Color(outlineColor),
        [outlineColor]
    );

    // Animation frame updates
    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.time = state.clock.elapsedTime;

            // Update material properties
            materialRef.current.color = mainColor;
            materialRef.current.outlineColor = strokeColor;
            materialRef.current.outlineThickness = outlineThickness;
            materialRef.current.noiseScale = noiseScale;
            materialRef.current.strokeMultiplier = strokeMultiplier;
            materialRef.current.hatchingAngle = hatchingAngle;
            materialRef.current.hatchingDensity = hatchingDensity;
            materialRef.current.noiseStrength = noiseStrength;
            materialRef.current.animationSpeed = animationSpeed;

            // Auto-rotation using the group ref
            if (autoRotate && groupRef.current) {
                groupRef.current.rotation.y += rotationSpeed * 0.01;
            }
        }
    });

    return (
        <group ref={groupRef} position={position}>
            <Text3D
                font="/fonts/Helvetica Neue_Regular.json"
                size={fontSize}
                height={depth}
                curveSegments={32}
                bevelEnabled
                bevelThickness={0.05}
                bevelSize={0.02}
                bevelSegments={5}
            >
                {content}
                {/* @ts-ignore */}
                <pencilEdgeMaterial
                    ref={materialRef}
                    color={mainColor}
                    outlineColor={strokeColor}
                    outlineThickness={outlineThickness}
                    noiseScale={noiseScale}
                    strokeMultiplier={strokeMultiplier}
                    hatchingAngle={hatchingAngle}
                    hatchingDensity={hatchingDensity}
                    noiseStrength={noiseStrength}
                    animationSpeed={animationSpeed}
                />
            </Text3D>
        </group>
    );
};

export default TextOverlay;

{
    /* <TextOverlay
    content="k.os"
    position={[-7.5, -5, 0]} // Adjust the Y position to align under the sparks
    // color="#000000" // Matches the theme color
    fontSize={4}
/>; */
}
