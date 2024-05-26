import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

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
        const loader = new GLTFLoader();
        loader.load(
            "./assets/LowPoly_Bears_pack_v01/LowPoly_Bear_IP.glb",
            (gltf) => {
                gltf.scene.traverse((child) => {
                    console.log("child", child);
                    if (child.isMesh) {
                        child.material = material;
                    }
                });
                scene.add(gltf.scene);
                const animationActions = {};
                const animationMixer = new THREE.AnimationMixer(gltf.scene);
                for (const animationKey in ANIMATION_DATA) {
                    const { name } = ANIMATION_DATA[animationKey];
                    animationActions[animationKey] = createAnimationAction(
                        gltf,
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
    gltf,
    animationMixer,
    animationName,
    animationOptions = {
        loop: THREE.LoopRepeat,
        clampWhenFinished: false,
    }
) => {
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
