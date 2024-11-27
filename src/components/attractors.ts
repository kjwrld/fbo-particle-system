import * as THREE from "three";
import Random from "canvas-sketch-util/random";

export type AttractorFunction = (
    position: [number, number, number],
    timeStep: number
) => [number, number, number];

export function createAttractor(
    length: number,
    start?: [number, number, number]
) {
    const positions: THREE.Vector3[] = [];
    const initialPosition =
        start || (Random.onSphere(1) as [number, number, number]);

    for (let i = 0; i < length; i++) {
        positions.push(new THREE.Vector3().fromArray(initialPosition));
    }

    const currentPosition = new THREE.Vector3().fromArray(initialPosition);
    return [positions, currentPosition] as const;
}

export function updateAttractor(
    currentPosition: THREE.Vector3,
    scale: number,
    simulation: AttractorFunction,
    timeStep: number
): THREE.Vector3 {
    const [dx, dy, dz] = simulation(
        currentPosition.toArray() as [number, number, number],
        timeStep
    );

    currentPosition.add(new THREE.Vector3(dx, dy, dz));
    return currentPosition.clone().normalize().multiplyScalar(scale);
}

// Attractor definitions
export const dadrasAttractor: AttractorFunction = ([x, y, z], timestep) => {
    const a = 3,
        b = 2.7,
        c = 1.7,
        d = 2,
        e = 9;
    const dx = (y - a * x + b * y * z) * timestep;
    const dy = (c * y - x * z + z) * timestep;
    const dz = (d * x * y - e * z) * timestep;
    return [dx, dy, dz];
};

export const aizawaAttractor: AttractorFunction = ([x, y, z], timestep) => {
    const a = 0.95,
        b = 0.7,
        c = 0.6,
        d = 3.5,
        e = 0.25,
        f = 0.1;
    const dx = ((z - b) * x - d * y) * timestep;
    const dy = (d * x + (z - b) * y) * timestep;
    const dz = (c + a * z - z ** 3 / 3 - x ** 2 + f * z * x ** 3) * timestep;
    return [dx, dy, dz];
};

export const arneodoAttractor: AttractorFunction = ([x, y, z], timestep) => {
    const a = -5.5,
        b = 3.5,
        d = -1;
    const dx = y * timestep;
    const dy = z * timestep;
    const dz = (-a * x - b * y - z + d * x ** 3) * timestep;
    return [dx, dy, dz];
};

export const dequanAttractor: AttractorFunction = ([x, y, z], timestep) => {
    const a = 40.0,
        b = 1.833,
        c = 0.16,
        d = 0.65,
        e = 55.0,
        f = 20.0;
    const dx = (a * (y - x) + c * x * z) * timestep;
    const dy = (e * x + f * y - x * z) * timestep;
    const dz = (b * z + x * y - d * x ** 2) * timestep;
    return [dx, dy, dz];
};

export const lorenzAttractor: AttractorFunction = ([x, y, z], timestep) => {
    const beta = 8 / 3,
        rho = 28,
        sigma = 10;
    const dx = sigma * (y - x) * timestep;
    const dy = (x * (rho - z) - y) * timestep;
    const dz = (x * y - beta * z) * timestep;
    return [dx, dy, dz];
};

export const lorenzMod2Attractor: AttractorFunction = ([x, y, z], timestep) => {
    const a = 0.9,
        b = 5.0,
        c = 9.9,
        d = 1.0;
    const dx = (-a * x + y ** 2 - z ** 2 + a * c) * timestep;
    const dy = (x * (y - b * z) + d) * timestep;
    const dz = (-z + x * (b * y + z)) * timestep;
    return [dx, dy, dz];
};
