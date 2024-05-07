import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

const FBX_PATH = "./assets/low-poly-bear/source/Anim_LowPoly_Bear_Demo.fbx";
const TEXTURE_PATH = "./assets/low-poly-bear/textures/PolyArt_Forest_color.png"

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("canvas"),
});
renderer.setSize(window.innerWidth, window.innerHeight);

const light = new THREE.PointLight(0xffffff, 10, 0, 1);
light.position.set(0, 0, 5);
scene.add(light);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = 5;
controls.update();

const loader = new FBXLoader();
loader.load(
    FBX_PATH,
    (fbx) => {
        fbx.traverse((child) => {
            if (child.isMesh) {
                const texture = new THREE.TextureLoader().load(
                    TEXTURE_PATH
                );
                child.material.map = texture;
            }
        });
        scene.add(fbx);
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
        console.log("An error happened");
    }
);

const animate = () => {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

animate();
