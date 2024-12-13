import alea from "alea";
import { createNoise2D } from "simplex-noise";
import { BufferAttribute, BufferGeometry } from "three/src/Three.js";

export class PerlinNoise {
    seed = null;
    xSize = null;
    zSize = null;
    elevations = null;

    constructor(
        xSize,
        zSize,
        seed = Math.random(),
        perlinBreadth = 50,
        perlinDepth = 5,
    ) {
        this.xSize = xSize;
        this.zSize = zSize;
        this.seed = seed;

        // Create a Perlin noise generator
        const noise2D = createNoise2D(alea(seed));
        this.elevations = [];

        // Generate elevations
        for (let x = 0; x <= this.xSize; x++) {
            this.elevations[x] = [];
            for (let z = 0; z <= this.xSize; z++) {
                const elevation = noise2D(x / perlinBreadth, z / perlinBreadth);
                this.elevations[x][z] = elevation * perlinDepth;
            }
        }
    }

    makeGeometry() {
        const positions = new Float32Array(
            (this.xSize + 1) * (this.zSize + 1) * 3,
        );
        const indices = [];

        // Generate vertices
        let index = 0;
        for (let x = 0; x <= this.xSize; x++) {
            for (let z = 0; z <= this.zSize; z++) {
                const elevation = this.elevations[x][z];
                positions[index] = x;
                index++;
                positions[index] = elevation;
                index++;
                positions[index] = z;
                index++;
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
        const geometry = new BufferGeometry();
        geometry.setAttribute("position", new BufferAttribute(positions, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        return geometry;
    }

    getYValue(x, z) {
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
            this.elevations[ix0][iz1] * (1 - tx) +
            this.elevations[ix1][iz1] * tx;
        const a =
            this.elevations[ix0][iz0] * (1 - tx) +
            this.elevations[ix1][iz0] * tx;
        return a * (1 - tz) + b * tz;
    }
}
