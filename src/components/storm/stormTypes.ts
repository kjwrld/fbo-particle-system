export type AttractorFunction = (
    position: [number, number, number],
    timeStep: number
) => [number, number, number];

export interface StormLineProps {
    radius: number;
    simulation: AttractorFunction;
    width: number;
    color: string;
    speed: number;
}
