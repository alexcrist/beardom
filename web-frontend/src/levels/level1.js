import alea from "alea";
import { AmbientLight, DirectionalLight, Vector3 } from "three/src/Three.js";
import { Bear } from "../entities/Bear";
import { Camera } from "../entities/Camera";
import { Ground } from "../entities/Ground";
import { Tree } from "../entities/Tree";

const getRandom = alea("lucy");

const X_SIZE = 100;
const Z_SIZE = 100;

const ground = new Ground({
    xSize: X_SIZE,
    zSize: Z_SIZE,
    textureScale: 1,
    texturePath: "../assets/grassloop.png",
    perlinNoiseSeed: "lucy",
});

const player = new Bear({
    isPlayer: true,
    position: new Vector3(1, 1, 1),
    rotationAngleRad: (Math.PI * 7) / 4,
});

const camera = new Camera({
    player,
    position: new Vector3(-5, 5, -5),
});

const bears = [];
for (let i = 0; i < 20; i++) {
    const x = getRandom() * X_SIZE;
    const y = getRandom() * 100;
    const z = getRandom() * Z_SIZE;
    const position = new Vector3(x, y, z);
    const rotationAngleRad = getRandom() * Math.PI * 2;
    bears.push(new Bear({ position, rotationAngleRad }));
}

const trees = [];
for (let i = 0; i < 20; i++) {
    const x = getRandom() * X_SIZE;
    const y = getRandom() * 100;
    const z = getRandom() * Z_SIZE;
    const position = new Vector3(x, y, z);
    const rotationAngleRad = getRandom() * Math.PI * 2;
    trees.push(new Tree({ position, rotationAngleRad }));
}

const creatures = [player, ...bears, ...trees];

const light1 = new DirectionalLight(0xffffff, 1);
light1.position.set(1, 1, 1);

const light2 = new DirectionalLight(0xffffff, 0.5);
light1.position.set(0, 1, 0);

const light3 = new AmbientLight(0xffffff, 0.3);

const lights = [light1, light2, light3];

export const LEVEL_1 = { player, creatures, ground, camera, lights };
