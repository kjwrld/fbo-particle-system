declare module 'three/examples/jsm/loaders/GLTFLoader' {
    import { Object3D, Mesh } from 'three';
  
    export interface GLTF {
      nodes: { [key: string]: Object3D | Mesh };
      materials: { [key: string]: any };
      animations: any[];
      scenes: any[];
      scene: any;
    }
  
    export class GLTFLoader {
      load(
        url: string,
        onLoad: (gltf: GLTF) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void
      ): void;
    }
  }