import { World } from "./entities/World";

const main = async () => {
    const world = new World();
    await world.init();
    world.update();
};

try {
    main();
} catch (error) {
    console.error(error);
}
