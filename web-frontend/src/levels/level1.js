import alea from "alea";
import { AmbientLight, DirectionalLight, Vector3 } from "three/src/Three.js";
import { Bear, BEAR_MODELS } from "../entities/Bear";
import { Camera } from "../entities/Camera";
import { Ground } from "../entities/Ground";
import { Tree } from "../entities/Tree";
import { Water } from "../entities/Water";

const getRandom1 = alea("lucy");
const getRandom2 = alea("arrrrrrwa");

const X_SIZE = 100;
const Z_SIZE = 100;

const ground = new Ground({
    xSize: X_SIZE,
    zSize: Z_SIZE,
    textureScale: 1,
    texturePath: new URL("../assets/grassloop.png", import.meta.url).href,
    perlinNoiseSeed: "lucy",
});

const water1 = new Water({
    xOrigin: 26,
    yOrigin: -0.2,
    zOrigin: 18,
    ground,
});

const water2 = new Water({
    xOrigin: 47,
    yOrigin: 0,
    zOrigin: 61,
    ground,
});

const water3 = new Water({
    xOrigin: 5,
    yOrigin: 0,
    zOrigin: 67,
    ground,
});

const waters = [water1, water2, water3];

const player = new Bear({
    isPlayer: true,
    position: new Vector3(1, 1, 1),
    rotationAngleRad: (Math.PI * 7) / 4,
    modelName: BEAR_MODELS[Math.floor(Math.random() * BEAR_MODELS.length)],
});

const camera = new Camera({
    player,
    position: new Vector3(-5, 6.5, -5),
});

const bears = [];
for (let i = 0; i < 20; i++) {
    const x = getRandom1() * X_SIZE;
    const y = getRandom1() * 100;
    const z = getRandom1() * Z_SIZE;
    const modelName =
        BEAR_MODELS[Math.floor(getRandom2() * BEAR_MODELS.length)];
    const position = new Vector3(x, y, z);
    const rotationAngleRad = getRandom1() * Math.PI * 2;
    bears.push(new Bear({ position, rotationAngleRad, modelName }));
}

const trees = [];
for (let i = 0; i < 20; i++) {
    const x = getRandom1() * X_SIZE;
    const y = getRandom1() * 100;
    const z = getRandom1() * Z_SIZE;
    const position = new Vector3(x, y, z);
    const rotationAngleRad = getRandom1() * Math.PI * 2;
    trees.push(new Tree({ position, rotationAngleRad }));
}

const creatures = [player, ...bears, ...trees];

const light1 = new DirectionalLight(0xffffff, 1);
light1.position.set(1, 1, 1);

const light2 = new DirectionalLight(0xffffff, 0.5);
light1.position.set(0, 1, 0);

const light3 = new AmbientLight(0xffffff, 0.3);

const lights = [light1, light2, light3];

export const LEVEL_1 = { player, creatures, ground, waters, camera, lights };
