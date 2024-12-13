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
}
