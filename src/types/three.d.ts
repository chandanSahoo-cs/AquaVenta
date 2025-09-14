declare module 'three/examples/jsm/loaders/GLTFLoader' {
  import { Loader, Group } from 'three';
  export class GLTFLoader extends Loader {
    constructor();
    load(
      url: string,
      onLoad: (gltf: { scene: Group }) => void,
      onProgress?: (event: ProgressEvent<EventTarget>) => void,
      onError?: (event: ErrorEvent) => void
    ): void;
  }
}
