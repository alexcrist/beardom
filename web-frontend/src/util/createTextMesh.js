import { Mesh, MeshStandardMaterial } from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";

let fontSilkscreen = null;

export const initFonts = async () => {
    fontSilkscreen = await initFont("../assets/Silkscreen_Regular.json");
};

const initFont = async (pathString) => {
    return new Promise((resolve) => {
        const path = new URL(pathString, import.meta.url).href;
        const fontLoader = new FontLoader();
        fontLoader.load(path, (font) => {
            resolve(font);
        });
    });
};

export const createTextMesh = (text) => {
    const geometry = new TextGeometry(text, {
        font: fontSilkscreen,
        size: 0.3,
        depth: 0.1,
        curveSegments: 1,
        bevelEnabled: false,
        bevelThickness: 10,
        bevelSize: 8,
        bevelOffset: 0,
        bevelSegments: 5,
    });
    geometry.center();
    const material = new MeshStandardMaterial({ color: 0x00ffff });
    const mesh = new Mesh(geometry, material);
    return mesh;
};
