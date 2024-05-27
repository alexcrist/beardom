export const initControls = (animationActions) => {
    const { walkForward, jumpPlace } = animationActions;

    document.addEventListener("keydown", (event) => {
        if (event.code === "KeyW") {
            if (!walkForward.isRunning()) {
                walkForward.reset().setEffectiveWeight(1).fadeIn(0.2).play();
            }
        }
        if (event.code === "Space") {
            walkForward.stop();
            jumpPlace.reset().play();
        }
    });

    document.addEventListener("keyup", (event) => {
        if (event.code === "KeyW") {
            walkForward.fadeOut(0.2);
        }
    });
};
