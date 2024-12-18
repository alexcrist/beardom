import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { initBearAnimations } from "../initBearAnimations";
import { ACTIONS } from "./ActionListener";
import { Creature } from "./Creature";

const ANIMATION_TRANSITION_SECONDS = 0.2;
const BEAR_OPTIONS = {
    speed: 10,
    turnSpeed: 2,
    jumpPower: 30,
    height: 1.8,
};

export class Bear extends Creature {
    animationMoveForward = null;
    animationMoveLeft = null;
    animationMoveRight = null;
    animationMoveBack = null;
    animationJump = null;
    animationAttack1 = null;
    animationAttack2 = null;
    attackIndex = 0;

    constructor(options) {
        super(options, BEAR_OPTIONS);
    }

    async initMesh() {
        await new Promise((resolve) => {
            const textureLoader = new THREE.TextureLoader();
            const texture = textureLoader.load(
                new URL(
                    "../assets/LowPoly_Bears_pack_v01/texture/PolyArt_Forest_color.png",
                    import.meta.url,
                ).href,
            );
            const material = new THREE.MeshStandardMaterial({ map: texture });
            const loader = new GLTFLoader();
            loader.load(
                new URL(
                    "../assets/LowPoly_Bears_pack_v01/LowPoly_Bear_IP.glb",
                    import.meta.url,
                ).href,
                (gltf) => {
                    // if (this.isPlayer) {
                    //     console.info(
                    //         "Bear animations",
                    //         gltf.animations
                    //             .map((animation) => animation.name)
                    //             .sort(),
                    //     );
                    // }
                    gltf.scene.traverse((child) => {
                        if (child.isMesh) {
                            child.material = material;
                        }
                    });
                    this.mesh = gltf.scene;
                    const { animationMixer, animationActions } =
                        initBearAnimations(gltf);
                    Object.values(animationActions).forEach(
                        (action) => (action.isStopped = true),
                    );
                    this.animationMixer = animationMixer;
                    this.animationMoveForward = animationActions.moveForward;
                    this.animationMoveForwardSlow =
                        animationActions.moveForwardSlow;
                    this.animationMoveLeft = animationActions.moveLeft;
                    this.animationMoveRight = animationActions.moveRight;
                    this.animationMoveBack = animationActions.moveBack;
                    this.animationJump = animationActions.jump;
                    this.animationAttack1 = animationActions.attack1;
                    this.animationAttack2 = animationActions.attack2;
                    this.animationAttack3 = animationActions.attack3;
                    this.animationAttack4 = animationActions.attack4;
                    this.animationFallLow = animationActions.fallLow;
                    this.animationFallHigh = animationActions.fallHigh;
                    this.animationIdle1 = animationActions.idle1;
                    this.animationIdle2 = animationActions.idle2;
                    this.animationIdle3 = animationActions.idle3;
                    this.animationIdle4 = animationActions.idle4;
                    resolve();
                },
            );
        });
    }

    handleActions(actions, camera) {
        super.handleActions(actions, camera);
        if (!actions) {
            return;
        }
        if (actions[ACTIONS.LeftClick]) {
            this.attack();
        }
    }

    jump() {
        super.jump();
        if (this.isJumping) {
            this.animateJump();
        }
    }

    attack() {
        if (!this.isAttacking) {
            this.isAttacking = true;
            this.attackIndex++;
            this.animateAttack();
        }
    }

    updateAnimations() {
        // Move forward
        if (this.isMovingForward && !this.isInWater) {
            this.animateMoveForward();
        } else {
            this.stopAnimateMoveForward();
        }

        // Move backward
        if (this.isMovingBack && !this.isInWater) {
            this.animateMoveBack();
        } else {
            this.stopAnimateMoveBack();
        }

        // Swim
        if (this.isInWater) {
            this.animateSwim();
        } else {
            this.stopAnimateSwim();
        }

        // Turn left
        if (this.isTurningLeft) {
            this.animateTurnLeft();
        } else {
            this.stopAnimateTurnLeft();
        }

        // Turn right
        if (this.isTurningRight) {
            this.animateTurnRight();
        } else {
            this.stopAnimateTurnRight();
        }
    }

    animateMoveForward() {
        if (this.animationMoveForward.isStopped) {
            this.animationMoveForward.isStopped = false;
            this.animationMoveForward
                .reset()
                .fadeIn(ANIMATION_TRANSITION_SECONDS)
                .play();
        }
    }

    stopAnimateMoveForward() {
        if (!this.animationMoveForward.isStopped) {
            this.animationMoveForward.isStopped = true;
            this.animationMoveForward.fadeOut(ANIMATION_TRANSITION_SECONDS);
        }
    }

    animateSwim() {
        if (this.animationMoveForwardSlow.isStopped) {
            this.animationMoveForwardSlow.isStopped = false;
            this.animationMoveForwardSlow
                .reset()
                .fadeIn(ANIMATION_TRANSITION_SECONDS)
                .play();
        }
    }

    stopAnimateSwim() {
        if (!this.animationMoveForwardSlow.isStopped) {
            this.animationMoveForwardSlow.isStopped = true;
            this.animationMoveForwardSlow.fadeOut(ANIMATION_TRANSITION_SECONDS);
        }
    }

    animateTurnLeft() {
        if (this.animationMoveLeft.isStopped) {
            this.animationMoveLeft.isStopped = false;
            this.animationMoveLeft
                .reset()
                .fadeIn(ANIMATION_TRANSITION_SECONDS)
                .play();
        }
    }

    stopAnimateTurnLeft() {
        if (!this.animationMoveLeft.isStopped) {
            this.animationMoveLeft.isStopped = true;
            this.animationMoveLeft.fadeOut(ANIMATION_TRANSITION_SECONDS);
        }
    }

    animateTurnRight() {
        if (this.animationMoveRight.isStopped) {
            this.animationMoveRight.isStopped = false;
            this.animationMoveRight
                .reset()
                .fadeIn(ANIMATION_TRANSITION_SECONDS)
                .play();
        }
    }

    stopAnimateTurnRight() {
        if (!this.animationMoveRight.isStopped) {
            this.animationMoveRight.isStopped = true;
            this.animationMoveRight.fadeOut(ANIMATION_TRANSITION_SECONDS);
        }
    }

    animateMoveBack() {
        if (this.animationMoveBack.isStopped) {
            this.animationMoveBack.isStopped = false;
            this.animationMoveBack
                .reset()
                .fadeIn(ANIMATION_TRANSITION_SECONDS)
                .play();
        }
    }

    stopAnimateMoveBack() {
        if (!this.animationMoveBack.isStopped) {
            this.animationMoveBack.isStopped = true;
            this.animationMoveBack.fadeOut(ANIMATION_TRANSITION_SECONDS);
        }
    }

    animateJump() {
        this.animationJump.reset().fadeIn(ANIMATION_TRANSITION_SECONDS).play();
        this.animationJump.weight = 5;
        this.animationJump.time = 0.35;
    }

    animateAttack() {
        let animations = [];
        let animationTimes = [];
        let animationWeights = [];
        if (this.wasInWater) {
            if (this.attackIndex % 2 === 0) {
                animations.push(this.animationAttack3);
                animationTimes.push(0);
                animationWeights.push(4);
                animations.push(this.animationAttack2);
                animationTimes.push(0);
                animationWeights.push(6);
            } else {
                animations.push(this.animationAttack4);
                animationTimes.push(0);
                animationWeights.push(4);
                animations.push(this.animationAttack1);
                animationTimes.push(0);
                animationWeights.push(6);
            }
        } else {
            if (this.attackIndex % 2 === 0) {
                animations.push(this.animationAttack1);
                animationTimes.push(0);
                animationWeights.push(10);
            } else {
                animations.push(this.animationAttack2);
                animationTimes.push(0);
                animationWeights.push(10);
            }
        }
        for (let i = 0; i < animations.length; i++) {
            animations[i].reset().fadeIn(ANIMATION_TRANSITION_SECONDS).play();
            animations[i].time = animationTimes[i];
            animations[i].weight = animationWeights[i];
        }
        setTimeout(() => {
            for (let i = 0; i < animations.length; i++) {
                animations[i].fadeOut(0.5);
            }
            this.isAttacking = false;
        }, 450);
    }
}
