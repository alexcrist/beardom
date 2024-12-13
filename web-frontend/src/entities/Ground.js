import * as THREE from "three";

export class Ground {
    mesh = null;

    constructor() {
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load("../assets/grass.png");

        const geometry = new THREE.PlaneGeometry(100, 100);
        const material = new THREE.MeshStandardMaterial({ map: texture });
        this.mesh = new THREE.Mesh(geometry, material);

        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.receiveShadow = true;
    }

    getGroundY() {
        return 0;
    }
}
