import * as THREE from "three";

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
    jump: {
        name: "Arm_Bear|Jump_place",
        options: {
            loop: THREE.LoopOnce,
        },
    },
};

export const initBearAnimations = (gltf) => {
    console.info(
        "Bear animations",
        gltf.animations.map((animation) => animation.name).sort(),
    );
    const animationActions = {};
    const animationMixer = new THREE.AnimationMixer(gltf.scene);
    for (const animationKey in ANIMATION_ACTIONS_METADATA) {
        const { name, options, animationTrimStart } =
            ANIMATION_ACTIONS_METADATA[animationKey];
        animationActions[animationKey] = createAnimationAction(
            gltf,
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
    gltf,
    animationMixer,
    animationName,
    animationOptions = {},
) => {
    for (const key in DEFAULT_ANIMATION_OPTIONS) {
        animationOptions[key] =
            animationOptions[key] ?? DEFAULT_ANIMATION_OPTIONS[key];
    }
    const animation = gltf.animations.find((animation) => {
        return animation.name === animationName;
    });
    if (!animation) {
        throw Error(`Could not find animation: ${animationName}`);
    }
    const action = animationMixer.clipAction(animation, gltf.scene);
    action.setLoop(animationOptions.loop);
    action.clampWhenFinished = animationOptions.clampWhenFinished;
    return action;
};
