import * as THREE from "three";
import { ActionListener } from "./ActionListener";
import { Bear } from "./Bear";
import { Camera } from "./Camera";
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

        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById("canvas"),
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        const light1 = new THREE.DirectionalLight(0xffffff, 1);
        light1.position.set(1, 1, 1);
        this.scene.add(light1);

        const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
        light2.position.set(-1, 1, 0);
        this.scene.add(light2);

        this.scene.add(new THREE.AmbientLight(0xffffff, 1));

        this.clock = new THREE.Clock();

        this.actionListener = new ActionListener();

        this.ground = new Ground();
        this.scene.add(this.ground.mesh);

        this.player = new Bear({ isPlayer: true });
        this.camera = new Camera(this.player);

        this.creatures = [this.player];
    }

    async init() {
        for (let i = 0; i < this.creatures.length; i++) {
            await this.creatures[i].init(this.scene);
        }
        this.camera.init();
    }

    update() {
        const actions = this.actionListener.actions;
        const clockDeltaSeconds = this.clock.getDelta();
        for (let i = 0; i < this.creatures.length; i++) {
            this.creatures[i].update(
                clockDeltaSeconds,
                actions,
                this.ground,
                this.camera,
            );
        }
        this.renderer.render(this.scene, this.camera.camera);
        requestAnimationFrame(() => this.update());
    }
}
