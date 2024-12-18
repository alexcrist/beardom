import { useEffect, useRef } from "react";
import { World } from "../../entities/World";

let hasInitialized = false;
let world = null;

export const getWorld = () => world;

const Game = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
        if (!hasInitialized && canvasRef.current) {
            hasInitialized = true;
            (async () => {
                world = new World(canvasRef.current);
                await world.init();
                world.update();
            })();
        }
    }, []);
    return <canvas id="canvas" className="canvas" ref={canvasRef} />;
};

export default Game;
