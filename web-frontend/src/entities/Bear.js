import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { initBearAnimations } from "../initBearAnimations";
import { Creature } from "./Creature";

const ANIMATION_TRANSITION_SECONDS = 0.1;
const BEAR_OPTIONS = {
    speed: 10,
    jumpPower: 30,
};

export class Bear extends Creature {
    animationMoveForward = null;
    animationMoveLeft = null;
    animationMoveRight = null;
    animationMoveBack = null;
    animationJump = null;

    constructor(options) {
        super(options, BEAR_OPTIONS);
    }

    async initMesh() {
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
                    this.mesh = gltf.scene;
                    const { animationMixer, animationActions } =
                        initBearAnimations(gltf);
                    this.animationMixer = animationMixer;
                    this.animationMoveForward = animationActions.moveForward;
                    this.animationMoveLeft = animationActions.moveLeft;
                    this.animationMoveRight = animationActions.moveRight;
                    this.animationMoveBack = animationActions.moveBack;
                    this.animationJump = animationActions.jump;
                    resolve();
                },
            );
        });
    }

    startMoveForward() {
        super.startMoveForward();
        this.animationMoveForward
            .reset()
            .fadeIn(ANIMATION_TRANSITION_SECONDS)
            .play();
    }

    stopMoveForward() {
        super.stopMoveForward();
        this.animationMoveForward.fadeOut(ANIMATION_TRANSITION_SECONDS);
    }

    startTurnLeft() {
        super.startTurnLeft();
        this.animationMoveLeft
            .reset()
            .fadeIn(ANIMATION_TRANSITION_SECONDS)
            .play();
    }

    stopTurnLeft() {
        super.stopTurnLeft();
        this.animationMoveLeft.fadeOut(ANIMATION_TRANSITION_SECONDS);
    }

    startTurnRight() {
        super.startTurnRight();
        this.animationMoveRight
            .reset()
            .fadeIn(ANIMATION_TRANSITION_SECONDS)
            .play();
    }

    stopTurnRight() {
        super.stopTurnRight();
        this.animationMoveRight.fadeOut(ANIMATION_TRANSITION_SECONDS);
    }

    startMoveBack() {
        super.startMoveBack();
        this.animationMoveBack
            .reset()
            .fadeIn(ANIMATION_TRANSITION_SECONDS)
            .play();
    }

    stopMoveBack() {
        super.stopMoveBack();
        this.animationMoveBack.fadeOut(ANIMATION_TRANSITION_SECONDS);
    }

    jump() {
        super.jump();
        this.animationJump.reset().fadeIn(ANIMATION_TRANSITION_SECONDS).play();
        this.animationJump.time = 0.35;
    }
}
