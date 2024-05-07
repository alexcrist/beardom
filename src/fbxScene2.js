import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

const FBX_PATH = "./assets/LowPoly_Bears_pack_v01/LowPoly_Bear_RM.fbx";
const TEXTURE_PATH =
    "./assets/LowPoly_Bears_pack_v01/texture/PolyArt_Forest_color.png";

const animationNames = [
    "Arm_Bear|Idle_3",
    "Arm_Bear|Crouch_B_RM",
    "Arm_Bear|Hit_F",
    "Arm_Bear|Attack_F",
    "Arm_Bear|Attack_run_RM",
    "Arm_Bear|Run_F_RM",
    "Arm_Bear|Walk_B_RM",
    "Arm_Bear|Crouch_R_RM",
    "Arm_Bear|Walk_F_RM",
    "Arm_Bear|Turn_180_L_RM",
    "Arm_Bear|Crouch_F_RM",
    "Arm_Bear|Idle_4",
    "Arm_Bear|Walk_BR_RM",
    "Arm_Bear|Death_L",
    "Arm_Bear|Run_L_RM",
    "Arm_Bear|Walk_BL_RM",
    "Arm_Bear|Crouch_Idle",
    "Arm_Bear|Trot_L_RM",
    "Arm_Bear|Crouch_L_RM",
    "Arm_Bear|Crouch_Turn_R_RM",
    "Arm_Bear|Idle_Stand",
    "Arm_Bear|Lie_Sleep",
    "Arm_Bear|Death_F",
    "Arm_Bear|Crouch_Turn_L_RM",
    "Arm_Bear|Lie",
    "Arm_Bear|Hit_Stand",
    "Arm_Bear|Crouch_BL_RM",
    "Arm_Bear|Jump_F_RM",
    "Arm_Bear|Attack_R",
    "Arm_Bear|Attack_Stand_L",
    "Arm_Bear|Eat_loop_2",
    "Arm_Bear|Run_R_RM",
    "Arm_Bear|Turn_L_RM",
    "Arm_Bear|Walk_L_RM",
    "Arm_Bear|Attack_L",
    "Arm_Bear|Death_R",
    "Arm_Bear|Drink",
    "Arm_Bear|Idle_2",
    "Arm_Bear|Walk_R_RM",
    "Arm_Bear|Hit_B",
    "Arm_Bear|Idle_1",
    "Arm_Bear|Trot_F_RM",
    "Arm_Bear|Death_Stand",
    "Arm_Bear|Eat",
    "Arm_Bear|Crouch_BR_RM",
    "Arm_Bear|Jump_place",
    "Arm_Bear|Turn_R_RM",
    "Arm_Bear|Fall_start_RM",
    "Arm_Bear|Hit_M",
    "Arm_Bear|Attack_trot_RM",
    "Arm_Bear|Fall_Low",
    "Arm_Bear|Fall_land",
    "Arm_Bear|Fall_high",
    "Arm_Bear|Turn_180_R_RM",
    "Arm_Bear|Trot_R_RM",
    "Arm_Bear|Attack_Stand_R",
    "Arm_Bear|Jump_run_RM",
];

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

let bear;
let action;
let mixer;
const loader = new FBXLoader();
loader.load(FBX_PATH, function (object) {
    object.traverse((child) => {
        if (child.isMesh) {
            child.material = material;
        }
    });
    scene.add(object);
    bear = object;
    mixer = new THREE.AnimationMixer(bear);
    action = mixer.clipAction(
        bear.animations.find(
            (animation) => animation.name === "Arm_Bear|Death_F"
        )
    );
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;

    console.log(
        "animations",
        bear.animations.map((animation) => animation.name)
    );
});

const clock = new THREE.Clock();

document.addEventListener("keydown", (event) => {
    console.log("event", event);
    if (event.code === "Space") {
        action.reset();
        action.play();
    }
});

const animate = () => {
    controls.update();
    const delta = clock.getDelta();
    mixer?.update(delta);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

animate();
