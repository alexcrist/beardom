import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(
    new URL("../assets/bears/beartexture.png", import.meta.url).href,
);
const material = new THREE.MeshStandardMaterial({ map: texture });
const loader = new GLTFLoader();

export const loadBearModel = async (modelName) => {
    return new Promise((resolve) => {
        loader.load(
            new URL(
                `../assets/bears/LowPoly_Bear_${modelName}.glb`,
                import.meta.url,
            ).href,
            (gltf) => {
                gltf.scene.traverse((child) => {
                    if (child.isMesh) {
                        child.material = material;
                    }
                });
                resolve(gltf);
            },
        );
    });
};
