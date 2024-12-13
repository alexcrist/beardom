import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { initBearAnimations } from "../initBearAnimations";
import { Creature } from "./Creature";

export class Bear extends Creature {
    animationMixer = null;
    animationMoveForward = null;
    animationMoveLeft = null;
    animationMoveRight = null;
    animationMoveBack = null;
    animationJump = null;

    constructor(options = {}) {
        super();
        this.isPlayer = options.isPlayer ?? false;
        this.speed = 5;
        this.jumpPower = 50;
    }

    async init(scene) {
        await new Promise((resolve) => {
            const textureLoader = new THREE.TextureLoader();
            const texture = textureLoader.load(
                "./assets/LowPoly_Bears_pack_v01/texture/PolyArt_Forest_color.png",
            );
            const material = new THREE.MeshStandardMaterial({ map: texture });
            const loader = new GLTFLoader();
            loader.load(
                "./assets/LowPoly_Bears_pack_v01/LowPoly_Bear_IP.glb",
                (gltf) => {
                    gltf.scene.traverse((child) => {
                        if (child.isMesh) {
                            child.material = material;
                        }
                    });
                    scene.add(gltf.scene);
                    this.mesh = gltf.scene;
                    const { animationMixer, animationActions } =
                        initBearAnimations(gltf);
                    this.animationMixer = animationMixer;
                    this.animationActions = animationActions;
                    // TODO: set individual animations
                    resolve();
                },
            );
        });
    }

    update(clockDeltaSeconds, ground, actions, camera) {
        super.update(clockDeltaSeconds, ground, actions, camera);
        this.animationMixer.update(clockDeltaSeconds);
    }

    startMoveForward() {
        super.startMoveForward();
        // Point bear at camera
        // Update velocity
    }

    stopMoveForward() {
        super.stopMoveForward();
    }

    startMoveLeft() {
        super.startMoveLeft();
    }

    stopMoveLeft() {
        super.stopMoveLeft();
    }

    startMoveRight() {
        super.startMoveRight();
    }

    stopMoveRight() {
        super.stopMoveRight();
    }

    startMoveBack() {
        super.startMoveBack();
    }

    stopMoveBack() {
        super.stopMoveBack();
    }

    jump() {
        super.jump();
        // Update velocity
        // Start animation
    }
}
