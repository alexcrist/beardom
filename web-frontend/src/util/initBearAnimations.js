import * as THREE from "three";
import { loadBearModel } from "./loadBearModel";

const ANIMATION_ACTIONS_METADATA = {
    moveForward: {
        name: "Arm_Bear|Run_F_IP",
    },
    moveLeft: {
        name: "Arm_Bear|Turn_L_IP",
    },
    moveRight: {
        name: "Arm_Bear|Turn_R_IP",
    },
    moveBack: {
        name: "Arm_Bear|Walk_B_IP",
    },
    moveForwardSlow: {
        name: "Arm_Bear|Trot_F_IP",
    },
    fallLow: {
        name: "Arm_Bear|Fall_Low",
    },
    fallHigh: {
        name: "Arm_Bear|Fall_high",
    },
    jump: {
        name: "Arm_Bear|Jump_place",
        options: {
            loop: THREE.LoopOnce,
        },
    },
    attack1: {
        name: "Arm_Bear|Attack_Stand_L",
        options: {
            loop: THREE.LoopOnce,
        },
    },
    attack2: {
        name: "Arm_Bear|Attack_Stand_R",
        options: {
            loop: THREE.LoopOnce,
        },
    },
    attack3: {
        name: "Arm_Bear|Attack_L",
        options: {
            loop: THREE.LoopOnce,
        },
    },
    attack4: {
        name: "Arm_Bear|Attack_R",
        options: {
            loop: THREE.LoopOnce,
        },
    },
    idle1: {
        name: "Arm_Bear|Idle_1",
        options: {
            loop: THREE.LoopOnce,
        },
    },
    idle2: {
        name: "Arm_Bear|Idle_2",
        options: {
            loop: THREE.LoopOnce,
        },
    },
    idle3: {
        name: "Arm_Bear|Idle_3",
        options: {
            loop: THREE.LoopOnce,
        },
    },
    idle4: {
        name: "Arm_Bear|Idle_4",
        options: {
            loop: THREE.LoopOnce,
        },
    },
};

let animations = null;

export const initBearAnimator = async () => {
    const gltf = await loadBearModel("IP");
    animations = gltf.animations;
    // console.info(
    //     "Bear animations",
    //     gltf.animations.map((animation) => animation.name).sort(),
    // );
};

export const getBearAnimations = (mesh) => {
    const animationActions = {};
    const animationMixer = new THREE.AnimationMixer(mesh);
    for (const animationKey in ANIMATION_ACTIONS_METADATA) {
        const { name, options, animationTrimStart } =
            ANIMATION_ACTIONS_METADATA[animationKey];
        animationActions[animationKey] = createAnimationAction(
            mesh,
            animationMixer,
            name,
            options,
            animationTrimStart,
        );
    }
    return { animationMixer, animationActions };
};

const DEFAULT_ANIMATION_OPTIONS = {
    loop: THREE.LoopRepeat,
    clampWhenFinished: false,
};

const createAnimationAction = (
    mesh,
    animationMixer,
    animationName,
    animationOptions = {},
) => {
    for (const key in DEFAULT_ANIMATION_OPTIONS) {
        animationOptions[key] =
            animationOptions[key] ?? DEFAULT_ANIMATION_OPTIONS[key];
    }
    const animation = animations.find((animation) => {
        return animation.name === animationName;
    });
    if (!animation) {
        throw Error(`Could not find animation: ${animationName}`);
    }
    const action = animationMixer.clipAction(animation, mesh);
    action.setLoop(animationOptions.loop);
    action.clampWhenFinished = animationOptions.clampWhenFinished;
    return action;
};
