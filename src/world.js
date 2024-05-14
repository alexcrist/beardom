import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export const initWorld = () => {
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

    const clock = new THREE.Clock();

    return {
        scene,
        camera,
        renderer,
        clock,
        controls,
    };
};
