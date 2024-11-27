import React from "react";
import { Text } from "@react-three/drei";

interface TextOverlayProps {
    content: string;
    position?: [number, number, number];
    color?: string;
    fontSize?: number;
}

const TextOverlay: React.FC<TextOverlayProps> = ({
    content,
    position = [0, -15, 0],
    color = "#000000",
    fontSize = 5,
}) => {
    return (
        <Text
            font="/fonts/Helvetica_83_Heavy_Extended.woff" // Load the font directly from the public folder
            position={position}
            color={color}
            fontSize={fontSize}
            anchorX="center"
            anchorY="middle"
        >
            {content}
        </Text>
    );
};

export default TextOverlay;
