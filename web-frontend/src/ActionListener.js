export const ACTIONS = {
    KeyW: "KeyW",
    KeyA: "KeyA",
    KeyS: "KeyS",
    KeyD: "KeyD",
    Space: "Space",
};

export class ActionListener {
    actions = Object.keys(ACTIONS).reduce((actions, actionKey) => {
        actions[actionKey] = false;
        return actions;
    }, {});

    constructor() {
        document.addEventListener("keydown", (event) => {
            const actionKey = event.code;
            if (actionKey in ACTIONS) {
                this.actions[actionKey] = true;
            }
        });
        document.addEventListener("keyup", (event) => {
            const actionKey = event.code;
            if (actionKey in ACTIONS) {
                this.actions[actionKey] = false;
            }
        });
    }

    getActions() {
        return this.actions;
    }
}

// export const initControls = (animationActions) => {
//     const { walkForward, jumpForward } = animationActions;

//     document.addEventListener("keydown", (event) => {
//         if (event.code === "KeyW") {
//             if (!walkForward.isRunning()) {
//                 walkForward.reset().fadeIn(0.1).play();
//             }
//         }

//         if (event.code === "Space") {
//             // TODO: only allow jump if on the ground
//             walkForward.fadeOut(0.1);
//             jumpForward.reset().fadeIn(0.1).play();
//             jumpForward.time = 0.5;
//         }
//     });

//     document.addEventListener("keyup", (event) => {
//         if (event.code === "KeyW") {
//             walkForward.fadeOut(0.1);
//         }
//     });
// };
