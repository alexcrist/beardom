import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Creature } from "./Creature";

const TREE_OPTIONS = {
    speed: 0,
    jumpPower: 0,
};

export class Tree extends Creature {
    constructor(options) {
        super(options, TREE_OPTIONS);
        this.isTree = true;
    }

    async initMesh() {
        await new Promise((resolve) => {
            const loader = new GLTFLoader();
            loader.load(
                new URL("../assets/tree.glb", import.meta.url).href,
                (gltf) => {
                    gltf.scene.traverse((child) => {
                        if (child.isMesh) {
                            child.geometry.translate(0, 1.1, 0);
                            child.geometry.scale(4, 4, 4);
                        }
                    });
                    this.mesh = gltf.scene;
                    this.scene.add(this.mesh);
                    resolve();
                },
            );
        });
    }

    update(clockDeltaSeconds, actions, ground, waters, camera) {
        super.update(clockDeltaSeconds, actions, ground, waters, camera);
        if (this.isInWater) {
            this.destroy();
        }
    }
}
