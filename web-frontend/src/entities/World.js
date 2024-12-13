import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { ActionListener } from "../ActionListener";
import { Bear } from "./Bear";
import { Ground } from "./Ground";

export class World {
    scene = null;
    renderer = null;
    clock = null;
    camera = null;
    ground = null;
    player = null;
    creatures = [];
    actionListener = null;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000,
        );
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById("canvas"),
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        const light = new THREE.PointLight(0xffffff, 10, 0, 1);
        light.position.set(0, 0, 5);
        this.scene.add(light);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambientLight);

        this.orbitControls = new OrbitControls(
            this.camera,
            this.renderer.domElement,
        );
        this.camera.position.z = 5;
        this.orbitControls.update();

        this.clock = new THREE.Clock();

        this.actionListener = new ActionListener();

        this.ground = new Ground();
        this.scene.add(this.ground.mesh);

        this.player = new Bear({ isPlayer: true });
        this.creatures = [this.player];
    }

    async init() {
        for (let i = 0; i < this.creatures.length; i++) {
            await this.creatures[i].init(this.scene);
        }
    }

    update() {
        this.orbitControls.target.copy(this.player.mesh.position);
        this.orbitControls.update();
        const actions = this.actionListener.getActions();
        const clockDeltaSeconds = this.clock.getDelta();
        for (let i = 0; i < this.creatures.length; i++) {
            this.creatures[i].update(
                clockDeltaSeconds,
                this.ground,
                actions,
                this.camera,
            );
        }
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.update());
    }
}
