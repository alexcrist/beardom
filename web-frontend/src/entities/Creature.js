import { Matrix3, Vector3 } from "three";
import { ACTIONS } from "../ActionListener";
import {
    GRAVITY_METERS_PER_SECOND_SQUARED,
    TERMINAL_VELOCITY_METERS_PER_SECOND,
} from "../constants";

const STRAFE_SPEED = 0.85;
const BACKWARDS_SPEED = 0.75;

export class Creature {
    position = { x: 0, y: 0, z: 0 }; // Wworld frame
    velocity = { x: 0, y: 0, z: 0 }; // Local frame
    rotationMatrix = new Matrix3(); // Rotation matrix orientation of creature

    speed = 1; // How fast the creature can move
    jumpPower = 1; // How high the creature can jump

    mesh = null;
    isPlayer = false;

    isMovingForward = false;
    isMovingLeft = false;
    isMovingRight = false;
    isMovingBack = false;

    isTouchingGround = true;

    constructor() {
        if (new.target === Creature) {
            throw Error("Cannot instantiate abstract class.");
        }
    }

    update(clockDeltaSeconds, ground, actions, camera) {
        // Handle player inputted actions
        if (this.isPlayer) {
            const cameraDirection = new Vector3();
            camera.getWorldDirection(cameraDirection);
            const cameraAngle =
                Math.atan2(cameraDirection.z, cameraDirection.x) - Math.PI / 2;
            for (const actionKey in actions) {
                if (actionKey === ACTIONS.KeyW) {
                    if (this.isTouchingGround) {
                        if (actions[actionKey]) {
                            this.setRotation(cameraAngle);
                            if (!this.isMovingForward) {
                                this.startMoveForward();
                            }
                        } else if (
                            !actions[actionKey] &&
                            this.isMovingForward
                        ) {
                            this.stopMoveForward();
                        }
                    }
                } else if (actionKey === ACTIONS.KeyA) {
                    if (this.isTouchingGround) {
                        if (actions[actionKey] && !this.isMovingLeft) {
                            this.startMoveLeft();
                        } else if (!actions[actionKey] && this.isMovingLeft) {
                            this.stopMoveLeft();
                        }
                    }
                } else if (actionKey === ACTIONS.KeyS) {
                    if (this.isTouchingGround) {
                        if (actions[actionKey] && !this.isMovingBack) {
                            this.startMoveBack();
                        } else if (!actions[actionKey] && this.isMovingBack) {
                            this.stopMoveBack();
                        }
                    }
                } else if (actionKey === ACTIONS.KeyD) {
                    if (this.isTouchingGround) {
                        if (actions[actionKey] && !this.isMovingRight) {
                            this.startMoveRight();
                        } else if (!actions[actionKey] && this.isMovingRight) {
                            this.stopMoveRight();
                        }
                    }
                } else if (actionKey === ACTIONS.Space) {
                    if (actions[actionKey] && this.isTouchingGround) {
                        this.jump();
                    }
                }
            }
        }

        // If not touching ground, fall
        const groundZ = ground.getGroundZ(this.position);
        if (this.position.z > groundZ) {
            this.velocity.z -= GRAVITY_METERS_PER_SECOND_SQUARED;
            if (this.velocity.z < -TERMINAL_VELOCITY_METERS_PER_SECOND) {
                this.velocity.z = -TERMINAL_VELOCITY_METERS_PER_SECOND;
            }
        }
        // If below ground, set position.z to groundZ
        if (this.position.z < groundZ) {
            if (this.velocity.z < 0) {
                this.velocity.z = 0;
            }
            this.position.z = groundZ;
        }

        // Update isTouchingGround
        this.isTouchingGround = this.position.z === groundZ;

        // Update position (with velocity)
        const velocityXY = new Vector3(this.velocity.x, this.velocity.y, 1);
        velocityXY.applyMatrix3(this.rotationMatrix);
        const dX = velocityXY.x * clockDeltaSeconds;
        const dY = velocityXY.y * clockDeltaSeconds;
        const dZ = this.velocity.z * clockDeltaSeconds;
        this.position.x += dX;
        this.position.y += dY;
        this.position.z += dZ;

        // TODO: should check ground validity here (and adjust dX/dY/dZ) to avoid jerky
        // camera upon ground impact post-jump

        // Transform mesh to match position
        this.mesh.position.set(
            this.position.x,
            this.position.z,
            this.position.y,
        );

        // Update camera if player
        if (this.isPlayer) {
            camera.position.set(
                camera.position.x + dX,
                camera.position.y + dZ,
                camera.position.z + dY,
            );
        }
    }

    setRotation(angleRad) {
        this.rotationMatrix.makeRotation(angleRad);
        this.mesh.setRotationFromAxisAngle(new Vector3(0, 1, 0), -angleRad);
    }

    startMoveForward() {
        this.stopMoveBack();
        this.isMovingForward = true;
        this.velocity.y = this.speed;
    }

    stopMoveForward() {
        this.isMovingForward = false;
        this.velocity.y = 0;
    }

    startMoveLeft() {
        this.stopMoveRight();
        this.isMovingLeft = true;
        this.velocity.x = this.speed * STRAFE_SPEED;
    }

    stopMoveLeft() {
        this.isMovingLeft = false;
        this.velocity.x = 0;
    }

    startMoveRight() {
        this.stopMoveLeft();
        this.isMovingRight = true;
        this.velocity.x = -this.speed * STRAFE_SPEED;
    }

    stopMoveRight() {
        this.isMovingRight = false;
        this.velocity.x = 0;
    }

    startMoveBack() {
        this.stopMoveForward();
        this.isMovingBack = true;
        this.velocity.y = -this.speed * BACKWARDS_SPEED;
    }

    stopMoveBack() {
        this.isMovingBack = false;
        this.velocity.y = 0;
    }

    jump() {
        this.velocity.z = this.jumpPower;
    }
}
