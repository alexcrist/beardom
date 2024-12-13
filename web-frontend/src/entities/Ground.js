import * as THREE from "three";
import { PerlinNoise } from "./PerlinNoise";

const X_SIZE = 100;
const Z_SIZE = 100;
const NOISE_SEED = "asdf";

export class Ground {
    mesh = null;
    perlinNoise = null;

    constructor() {
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load("../assets/grass.png");
        this.perlinNoise = new PerlinNoise(X_SIZE, Z_SIZE, NOISE_SEED);
        const geometry = this.perlinNoise.makeGeometry();
        const material = new THREE.MeshStandardMaterial({ map: texture });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.receiveShadow = true;
    }

    getGroundY(x, z) {
        return this.perlinNoise.getYValue(x, z);
    }
}
