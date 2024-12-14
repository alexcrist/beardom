import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Creature } from "./Creature";

const TREE_OPTIONS = {
    speed: 0,
    jumpPower: 0,
};

export class Tree extends Creature {
    constructor(options) {
        super(options, TREE_OPTIONS);
    }

    async initMesh() {
        await new Promise((resolve) => {
            const loader = new GLTFLoader();
            loader.load("../assets/tree.glb", (gltf) => {
                gltf.scene.traverse((child) => {
                    if (child.isMesh) {
                        child.geometry.translate(0, 1.1, 0);
                        child.geometry.scale(4, 4, 4);
                    }
                });
                this.mesh = gltf.scene;
                resolve();
            });
        });
    }
}
