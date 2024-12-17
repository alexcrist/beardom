import * as THREE from "three";
import { createPerlinNoise } from "../util/createPerlinNoise";

export class Ground {
    mesh = null;
    perlinNoise = null;
    xSize = null;
    zSize = null;
    elevationMatrix = null;

    constructor({ xSize, zSize, texturePath, textureScale, perlinNoiseSeed }) {
        this.xSize = xSize;
        this.zSize = zSize;
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(texturePath);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(
            (xSize / 10) * textureScale,
            (zSize / 10) * textureScale,
        );
        this.elevationMatrix = createPerlinNoise({
            xSize,
            zSize,
            seed: perlinNoiseSeed,
        });
        const geometry = this.createGeometry();
        const material = new THREE.MeshStandardMaterial({ map: texture });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.receiveShadow = true;
    }

    createGeometry() {
        const positions = new Float32Array(
            (this.xSize + 1) * (this.zSize + 1) * 3,
        );
        const uvs = new Float32Array((this.xSize + 1) * (this.zSize + 1) * 2);

        const indices = [];

        // Generate vertices (and UVs)
        let index = 0;
        let uvIndex = 0;
        for (let x = 0; x <= this.xSize; x++) {
            for (let z = 0; z <= this.zSize; z++) {
                const elevation = this.elevationMatrix[x][z];
                positions[index] = x;
                index++;
                positions[index] = elevation;
                index++;
                positions[index] = z;
                index++;
                uvs[uvIndex] = x / this.xSize;
                uvIndex++;
                uvs[uvIndex] = z / this.zSize;
                uvIndex++;
            }
        }

        // Generate indices for the terrain grid
        for (let x = 0; x < this.xSize; x++) {
            for (let z = 0; z < this.zSize; z++) {
                const a = x * (this.xSize + 1) + z;
                const b = a + 1;
                const c = a + (this.zSize + 1);
                const d = c + 1;
                indices.push(a, b, d);
                indices.push(a, d, c);
            }
        }

        // Create the buffer geometry
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(positions, 3),
        );
        geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
        geometry.setIndex(indices);

        geometry.computeVertexNormals();

        return geometry;
    }

    getGroundY(x, z) {
        // Convert world coordinates to grid indices
        const x0 = Math.floor(x);
        const x1 = Math.ceil(x);
        const z0 = Math.floor(z);
        const z1 = Math.ceil(z);

        // Clamp indices to grid bounds
        const ix0 = Math.max(0, Math.min(this.xSize, x0));
        const ix1 = Math.max(0, Math.min(this.xSize, x1));
        const iz0 = Math.max(0, Math.min(this.zSize, z0));
        const iz1 = Math.max(0, Math.min(this.zSize, z1));

        // Bilinear interpolation
        const tx = x - x0;
        const tz = z - z0;

        const b =
            this.elevationMatrix[ix0][iz1] * (1 - tx) +
            this.elevationMatrix[ix1][iz1] * tx;
        const a =
            this.elevationMatrix[ix0][iz0] * (1 - tx) +
            this.elevationMatrix[ix1][iz0] * tx;
        return a * (1 - tz) + b * tz;
    }
}
