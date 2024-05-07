import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

const FBX_PATH = "./assets/LowPoly_Bears_pack_v01/LowPoly_Bear_04.fbx";
const TEXTURE_PATH =
    "./assets/LowPoly_Bears_pack_v01/texture/PolyArt_Forest_color.png";

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

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = 5;
controls.update();

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(TEXTURE_PATH);

const material = new THREE.MeshStandardMaterial({
    map: texture,
});

const loader = new FBXLoader();
loader.load(FBX_PATH, function (object) {
    object.traverse((child) => {
        console.log("child", child);
        if (child.isMesh) {
            child.material = material;
        }
    });
    scene.add(object);
});

const animate = () => {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

animate();
