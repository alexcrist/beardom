import * as THREE from "three";
import { PerlinNoise } from "./PerlinNoise";

export class Ground {
    mesh = null;
    perlinNoise = null;

    constructor({ xSize, zSize, texturePath, textureScale, perlinNoiseSeed }) {
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(texturePath);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(
            (xSize / 10) * textureScale,
            (zSize / 10) * textureScale,
        );
        this.perlinNoise = new PerlinNoise(xSize, zSize, perlinNoiseSeed);
        const geometry = this.perlinNoise.makeGeometry();
        const material = new THREE.MeshStandardMaterial({ map: texture });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.receiveShadow = true;
    }

    getGroundY(x, z) {
        return this.perlinNoise.getYValue(x, z);
    }
}
