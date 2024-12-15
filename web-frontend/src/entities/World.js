import Stats from "stats.js";
import * as THREE from "three";
import { LEVEL_1 } from "../levels/level1";
import { ActionListener } from "./ActionListener";
import { PeerConnector } from "./PeerConnector";

export class World {
    scene = null;
    renderer = null;
    clock = null;
    camera = null;
    ground = null;
    player = null;
    creatures = [];
    actionListener = null;
    stats = null;

    constructor() {
        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById("canvas"),
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor("#90CCE6", 1);

        this.clock = new THREE.Clock();

        this.actionListener = new ActionListener();

        this.player = LEVEL_1.player;
        this.creatures = LEVEL_1.creatures;
        this.ground = LEVEL_1.ground;
        this.camera = LEVEL_1.camera;
        this.lights = LEVEL_1.lights;

        this.scene.add(this.ground.mesh);
        this.lights.forEach((light) => this.scene.add(light));

        this.peerConnector = new PeerConnector(this.scene, this.player);

        window.addEventListener("resize", this.onWindowResize.bind(this));

        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);
    }

    async init() {
        for (let i = 0; i < this.creatures.length; i++) {
            await this.creatures[i].init(this.scene);
        }
    }

    onWindowResize() {
        this.camera.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
    }

    update() {
        this.stats.begin();
        const actions = this.actionListener.actions;
        const clockDeltaSeconds = this.clock.getDelta();
        const allCreatures = this.creatures.concat(
            this.peerConnector.getCreatures(),
        );
        for (let i = 0; i < allCreatures.length; i++) {
            const actionsForCreature = allCreatures[i].isPlayer
                ? actions
                : null;
            allCreatures[i].update(
                clockDeltaSeconds,
                actionsForCreature,
                this.ground,
                this.camera,
            );
        }
        this.peerConnector.update(actions);
        this.camera.update();
        this.renderer.render(this.scene, this.camera.camera);
        this.stats.end();
        requestAnimationFrame(() => this.update());
    }
}