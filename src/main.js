import { initControls } from "../controls";
import { initBear } from "./bear";
import "./style.css";
import { initWorld } from "./world";

const init = async () => {
    const { scene, renderer, clock, camera, controls } = initWorld();
    const { animationMixer, animationActions } = await initBear(scene);
    initControls(animationActions);
    update(scene, renderer, camera, clock, controls, animationMixer);
};

const update = (scene, renderer, camera, clock, controls, animationMixer) => {
    controls.update();
    const delta = clock.getDelta();
    animationMixer.update(delta);
    renderer.render(scene, camera);
    requestAnimationFrame(() => {
        update(scene, renderer, camera, clock, controls, animationMixer);
    });
};

init();
