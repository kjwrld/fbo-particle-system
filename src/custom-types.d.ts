import { Object3DNode, MaterialNode } from "@react-three/fiber";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";

declare module "@react-three/fiber" {
    interface ThreeElements {
        meshLineGeometry: Object3DNode<
            MeshLineGeometry,
            typeof MeshLineGeometry
        >;
        meshLineMaterial: MaterialNode<
            MeshLineMaterial,
            typeof MeshLineMaterial
        >;
    }
}

declare module "canvas-sketch-util/random" {
    function range(min: number, max: number): number;
    function rangeFloor(min: number, max: number): number;
    function onSphere(radius?: number): [number, number, number];
    function pick<T>(array: T[]): T;
    function value(): number;
    function boolean(): boolean;
    function gaussian(mean?: number, stddev?: number): number;

    export default {
        range,
        rangeFloor,
        onSphere,
        pick,
        value,
        boolean,
        gaussian,
    };
}

declare module "three/examples/jsm/loaders/FontLoader" {
    import { Loader, Font } from "three";

    export class FontLoader extends Loader {
        constructor();
        load(
            url: string,
            onLoad?: (font: Font) => void,
            onProgress?: (event: ProgressEvent) => void,
            onError?: (event: ErrorEvent) => void
        ): void;
        parse(json: any): Font;
    }
}
