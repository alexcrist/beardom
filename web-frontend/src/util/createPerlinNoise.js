import alea from "alea";
import { createNoise2D } from "simplex-noise";

// Returns a matrix of elevations
export const createPerlinNoise = ({
    xSize,
    zSize,
    seed = Math.random(),
    perlinBreadth = 50,
    perlinDepth = 5,
}) => {
    const noise2D = createNoise2D(alea(seed));
    const elevations = [];
    for (let x = 0; x <= xSize; x++) {
        elevations[x] = [];
        for (let z = 0; z <= zSize; z++) {
            const elevation = noise2D(x / perlinBreadth, z / perlinBreadth);
            elevations[x][z] = elevation * perlinDepth;
        }
    }
    return elevations;
};
