export const ACTIONS = {
    KeyW: "KeyW",
    KeyA: "KeyA",
    KeyS: "KeyS",
    KeyD: "KeyD",
    Space: "Space",
    LeftClick: "LeftClick",
    RightClick: "RightClick",
};

export class ActionListener {
    actions = Object.keys(ACTIONS).reduce((actions, actionKey) => {
        actions[actionKey] = false;
        return actions;
    }, {});

    constructor() {
        document.addEventListener("keydown", (event) => {
            if (isTypingIntoInput()) {
                return;
            }
            const actionKey = event.code;
            if (actionKey in ACTIONS) {
                this.actions[actionKey] = true;
            }
        });
        document.addEventListener("keyup", (event) => {
            if (isTypingIntoInput()) {
                return;
            }
            const actionKey = event.code;
            if (actionKey in ACTIONS) {
                this.actions[actionKey] = false;
            }
        });
        document.addEventListener("mousedown", (event) => {
            if (event.target.id !== "canvas") {
                return;
            }
            if (event.button === 0) {
                this.actions[ACTIONS.LeftClick] = true;
            } else if (event.button === 2) {
                this.actions[ACTIONS.RightClick] = true;
            }
        });
        document.addEventListener("mouseup", (event) => {
            if (event.button === 0) {
                this.actions[ACTIONS.LeftClick] = false;
            } else if (event.button === 2) {
                this.actions[ACTIONS.RightClick] = false;
            }
        });
    }
}

const isTypingIntoInput = () => {
    const activeElement = document.activeElement;
    return (
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.isContentEditable
    );
};
