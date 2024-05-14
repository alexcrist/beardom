import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

const ANIMATION_DATA = {
    walkForward: {
        name: "Arm_Bear|Walk_F_IP",
    },
};

export const initBear = async (scene) => {
    return new Promise((resolve) => {
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(
            "./assets/LowPoly_Bears_pack_v01/texture/PolyArt_Forest_color.png"
        );
        const material = new THREE.MeshStandardMaterial({ map: texture });
        const fbxLoader = new FBXLoader();
        fbxLoader.load(
            "./assets/LowPoly_Bears_pack_v01/LowPoly_Bear_IP.fbx",
            (bear) => {
                bear.traverse((child) => {
                    if (child.isMesh) {
                        child.material = material;
                    }
                });
                scene.add(bear);
                const animationActions = {};
                const animationMixer = new THREE.AnimationMixer(bear);
                for (const animationKey in ANIMATION_DATA) {
                    const { name } = ANIMATION_DATA[animationKey];
                    animationActions[animationKey] = createAnimationAction(
                        bear,
                        animationMixer,
                        name
                    );
                }
                resolve({ animationActions, animationMixer });
            }
        );
    });
};

const createAnimationAction = (
    bear,
    animationMixer,
    animationName,
    animationOptions = {
        loop: THREE.LoopRepeat,
        clampWhenFinished: false,
    }
) => {
    console.info(
        "Bear animations",
        bear.animations.map((animation) => animation.name).sort()
    );
    const animation = bear.animations.find((animation) => {
        return animation.name === animationName;
    });
    if (!animation) {
        throw Error(`Could not find animation: ${animationName}`);
    }
    const action = animationMixer.clipAction(animation, bear);
    action.setLoop(animationOptions.loop);
    action.clampWhenFinished = animationOptions.clampWhenFinished;
    return action;
};
