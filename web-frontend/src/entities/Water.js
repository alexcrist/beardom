import * as THREE from "three";
import { EPSILON_DISTANCE } from "../constants";

export class Water {
    ground = null;
    yLevel = null;
    mesh = null;
    isWaterMatrix = null;

    constructor({ xOrigin, yOrigin, zOrigin, ground }) {
        this.ground = ground;
        this.yLevel = yOrigin;
        this.isWaterMatrix = this.generateWaterMatrix(xOrigin, zOrigin);
        this.mesh = this.generateWaterMesh();
        // this.mesh = this.createDebugMesh(xOrigin, yOrigin, zOrigin);
    }

    getIsPointInWater(x, y, z) {
        if (y > this.yLevel + EPSILON_DISTANCE) {
            return false;
        }
        const xIndex = Math.round(x);
        const zIndex = Math.round(z);
        if (xIndex < 0 || xIndex > this.ground.xSize - 1) {
            return false;
        }
        if (zIndex < 0 || zIndex > this.ground.zSize - 1) {
            return false;
        }
        return this.isWaterMatrix[xIndex][zIndex];
    }

    createDebugMesh(x, y, z) {
        const geometry = new THREE.SphereGeometry(1, 32, 32); // Radius 1, 32 segments
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(x, y, z); // x: 10, y: 5, z: -3
        return sphere;
    }

    generateWaterMatrix(xOrigin, zOrigin) {
        // Initialize matrix
        const waterMatrix = Array.from({ length: this.ground.xSize }, () => {
            return Array(this.ground.zSize).fill(false);
        });

        // Flood fill starting at origin
        const stack = [[xOrigin, zOrigin]];
        while (stack.length > 0) {
            const [x, z] = stack.pop();

            // Bounds check
            if (
                x < 0 ||
                x >= this.ground.xSize ||
                z < 0 ||
                z >= this.ground.zSize
            ) {
                continue;
            }

            // Check ground elevation
            if (
                waterMatrix[x][z] ||
                this.ground.elevationMatrix[x][z] > this.yLevel + 0.5
            ) {
                continue;
            }

            // Mark as water
            waterMatrix[x][z] = true;

            // Add neighboring positions
            stack.push([x + 1, z], [x - 1, z], [x, z + 1], [x, z - 1]);
        }

        return waterMatrix;
    }

    generateWaterMesh() {
        const vertices = [];
        const indices = [];
        const uvs = [];

        let indexCount = 0;

        for (let x = 0; x < this.ground.xSize; x++) {
            for (let z = 0; z < this.ground.zSize; z++) {
                if (!this.isWaterMatrix[x][z]) {
                    continue;
                }

                // Push vertices (centered around X, Z)
                vertices.push(
                    x,
                    this.yLevel,
                    z,
                    x + 1,
                    this.yLevel,
                    z,
                    x,
                    this.yLevel,
                    z + 1,
                    x + 1,
                    this.yLevel,
                    z + 1,
                );

                // Push UVs (mapped to [0, 1] range for tiling texture)
                uvs.push(0, 0, 1, 0, 0, 1, 1, 1);

                // Push indices for two triangles forming a square
                indices.push(
                    indexCount,
                    indexCount + 1,
                    indexCount + 2,
                    indexCount + 1,
                    indexCount + 3,
                    indexCount + 2,
                );

                indexCount += 4;
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(vertices, 3),
        );
        geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2)); // Add UVs
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        const waterTexture = new THREE.TextureLoader().load(
            new URL("../assets/water.png", import.meta.url).href,
        );
        waterTexture.wrapS = THREE.RepeatWrapping;
        waterTexture.wrapT = THREE.RepeatWrapping;
        waterTexture.repeat.set(0.3, 0.3);

        const material = new THREE.MeshStandardMaterial({
            map: waterTexture,
            transparent: true,
            opacity: 1,
            side: THREE.BackSide,
        });

        return new THREE.Mesh(geometry, material);
    }
}
