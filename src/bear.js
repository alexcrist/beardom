import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const ANIMATION_DATA = {
    walkForward: {
        name: "Arm_Bear|Walk_F_IP",
    },
    jumpForward: {
        name: "Arm_Bear|Jump_F_IP",
    },
    jumpPlace: {
        name: "Arm_Bear|Jump_place",
        options: {
            loop: THREE.LoopOnce,
        },
    },
    jumpRun: {
        name: "Arm_Bear|Jump_run_IP",
    },
};

export const initBear = async (scene) => {
    return new Promise((resolve) => {
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(
            "./assets/LowPoly_Bears_pack_v01/texture/PolyArt_Forest_color.png"
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
                const animationActions = {};
                const animationMixer = new THREE.AnimationMixer(gltf.scene);
                for (const animationKey in ANIMATION_DATA) {
                    const { name, options } = ANIMATION_DATA[animationKey];
                    animationActions[animationKey] = createAnimationAction(
                        gltf,
                        animationMixer,
                        name,
                        options
                    );
                }
                resolve({ animationActions, animationMixer });
            }
        );
    });
};

const DEFAULT_ANIMATION_OPTIONS = {
    loop: THREE.LoopRepeat,
    clampWhenFinished: false,
};

const createAnimationAction = (
    gltf,
    animationMixer,
    animationName,
    animationOptions = {}
) => {
    for (const key in DEFAULT_ANIMATION_OPTIONS) {
        animationOptions[key] =
            animationOptions[key] ?? DEFAULT_ANIMATION_OPTIONS[key];
    }
    console.info(
        "Bear animations",
        gltf.animations.map((animation) => animation.name).sort()
    );
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
