import { Matrix3, Vector3 } from "three";
import {
    GRAVITY_METERS_PER_SECOND_SQUARED,
    TERMINAL_VELOCITY_METERS_PER_SECOND,
} from "../constants";
import { ACTIONS } from "./ActionListener";

const BACKWARDS_SPEED = 0.75;
const CREATURE_OPTIONS = {
    speed: 1,
    turnSpeed: 2,
    jumpPower: 10,
    isPlayer: false,
    position: new Vector3(0, 0, 0),
};

export class Creature {
    position = new Vector3(0, 0, 0); // World frame
    velocity = new Vector3(0, 0, 0); // Local frame

    // Creature rotation
    rotationAngleRad = 0;
    rotationMatrix = new Matrix3();

    speed = 1; // How fast the creature can move
    turnSpeed = 1; // How fast the creature can turn
    jumpPower = 1; // How high the creature can jump

    mesh = null;
    isPlayer = false;

    isMovingForward = false;
    isTurningLeft = false;
    isTurningRight = false;
    isMovingBack = false;
    isTouchingGround = true;

    animationMixer = null;

    constructor(options, defaultOptions) {
        if (new.target === Creature) {
            throw Error("Cannot instantiate abstract class.");
        }
        const getOption = (key) =>
            options?.[key] ?? defaultOptions?.[key] ?? CREATURE_OPTIONS[key];
        for (const key in CREATURE_OPTIONS) {
            this[key] = getOption(key);
        }
    }

    update(clockDeltaSeconds, actions, ground, camera) {
        // Update animation mixer time
        this.animationMixer.update(clockDeltaSeconds);

        // Handle player inputted actions
        if (this.isPlayer) {
            const cameraAngle = camera.getCameraAngle();
            for (const actionKey in actions) {
                const isActionActive = actions[actionKey];
                if (actionKey === ACTIONS.KeyW) {
                    if (isActionActive) {
                        this.setRotation(cameraAngle);
                        if (!this.isMovingForward) {
                            this.startMoveForward();
                        }
                    } else {
                        if (this.isMovingForward) {
                            this.stopMoveForward();
                        }
                    }
                } else if (actionKey === ACTIONS.KeyA) {
                    if (isActionActive) {
                        if (!this.isTurningLeft) {
                            this.startTurnLeft();
                        }
                    } else {
                        if (this.isTurningLeft) {
                            this.stopTurnLeft();
                        }
                    }
                } else if (actionKey === ACTIONS.KeyS) {
                    if (isActionActive) {
                        this.setRotation(cameraAngle);
                        if (!this.isMovingBack) {
                            this.startMoveBack();
                        }
                    } else {
                        if (this.isMovingBack) {
                            this.stopMoveBack();
                        }
                    }
                } else if (actionKey === ACTIONS.KeyD) {
                    if (isActionActive) {
                        if (!this.isTurningRight) {
                            this.startTurnRight();
                        }
                    } else {
                        if (this.isTurningRight) {
                            this.stopTurnRight();
                        }
                    }
                } else if (actionKey === ACTIONS.Space) {
                    if (isActionActive && this.isTouchingGround) {
                        this.jump();
                    }
                }
            }
        }

        // Turn bear (and camera)
        let rotationRad = 0;
        if (this.isTurningLeft) {
            rotationRad = -this.turnSpeed * clockDeltaSeconds;
        }
        if (this.isTurningRight) {
            rotationRad = this.turnSpeed * clockDeltaSeconds;
        }
        if (rotationRad !== 0) {
            this.addRotation(rotationRad);
            camera.rotateAboutPoint(this.position, rotationRad);
        }

        // Update position (with velocity)
        const velocityXZ = new Vector3(this.velocity.x, this.velocity.z, 1);
        velocityXZ.applyMatrix3(this.rotationMatrix);
        const velocityX = velocityXZ.x;
        const velocityZ = velocityXZ.y;
        const oldPosX = this.position.x;
        const oldPosY = this.position.y;
        const oldPosZ = this.position.z;
        this.position.x += velocityX * clockDeltaSeconds;
        this.position.y += this.velocity.y * clockDeltaSeconds;
        this.position.z += velocityZ * clockDeltaSeconds;

        // If not falling or jumping and creature is very close to ground but above
        // ground (i.e.: walking down hill), snap creature to ground
        const groundY = ground.getGroundY(this.position.x, this.position.z);
        if (
            this.position.y > groundY &&
            this.position.y - groundY < 0.2 &&
            this.velocity.y === 0
        ) {
            this.position.y = groundY;
        }

        // If not touching ground, fall
        if (this.position.y > groundY) {
            this.velocity.y -= GRAVITY_METERS_PER_SECOND_SQUARED;
            if (this.velocity.y < -TERMINAL_VELOCITY_METERS_PER_SECOND) {
                this.velocity.y = -TERMINAL_VELOCITY_METERS_PER_SECOND;
            }
        }

        // If below ground, set position.y to groundY
        if (this.position.y < groundY) {
            if (this.velocity.y < 0) {
                this.velocity.y = 0;
            }
            this.position.y = groundY;
        }

        // Update isTouchingGround
        this.isTouchingGround = this.position.y === groundY;

        // Transform mesh to match position
        this.mesh.position.set(
            this.position.x,
            this.position.y,
            this.position.z,
        );

        // Update camera if player
        if (this.isPlayer) {
            camera.moveCamera(
                this.position.x - oldPosX,
                this.position.y - oldPosY,
                this.position.z - oldPosZ,
            );
        }
    }

    setRotation(angleRad) {
        this.rotationAngleRad = angleRad;
        this.rotationMatrix.makeRotation(angleRad);
        this.mesh.setRotationFromAxisAngle(new Vector3(0, 1, 0), -angleRad);
    }

    addRotation(angleRad) {
        this.setRotation(this.rotationAngleRad + angleRad);
    }

    startMoveForward() {
        this.stopMoveBack();
        this.isMovingForward = true;
        this.velocity.z = this.speed;
    }

    stopMoveForward() {
        this.isMovingForward = false;
        this.velocity.z = 0;
    }

    startTurnLeft() {
        this.stopTurnRight();
        this.isTurningLeft = true;
    }

    stopTurnLeft() {
        this.isTurningLeft = false;
    }

    startTurnRight() {
        this.stopTurnLeft();
        this.isTurningRight = true;
    }

    stopTurnRight() {
        this.isTurningRight = false;
    }

    startMoveBack() {
        this.stopMoveForward();
        this.isMovingBack = true;
        this.velocity.z = -this.speed * BACKWARDS_SPEED;
    }

    stopMoveBack() {
        this.isMovingBack = false;
        this.velocity.z = 0;
    }

    jump() {
        this.velocity.y = this.jumpPower;
    }
}
