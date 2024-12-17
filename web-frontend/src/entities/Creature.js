import { Matrix3, Vector3 } from "three";
import {
    GRAVITY_ACCEL,
    TERMINAL_VELOCITY,
    WATER_FLOAT_ACCEL,
} from "../constants";
import { ACTIONS } from "./ActionListener";

const BACKWARDS_SPEED = 0.75;
const SWIMMING_SPEED = 0.5;
const ATTACKING_SPEED = 0.5;
const JUMP_POWER_WHILE_ATTACKING = 0.8;
const CREATURE_OPTIONS = () => ({
    speed: 1,
    turnSpeed: 2,
    jumpPower: 10,
    height: 1,
    isPlayer: false,
    isPeer: false,
    position: new Vector3(0, 0, 0),
    rotationAngleRad: 1,
});

export class Creature {
    isInitialized = false;
    scene = null;

    position = new Vector3(0, 0, 0); // World frame
    velocity = new Vector3(0, 0, 0); // Local frame

    // Creature rotation
    rotationAngleRad = 0;
    rotationMatrix = new Matrix3();

    height = null;
    speed = null;
    turnSpeed = null;
    jumpPower = null;

    mesh = null;
    isPlayer = false;

    isMovingForward = false;
    isTurningLeft = false;
    isTurningRight = false;
    isMovingBack = false;
    isAttacking = false;

    isTouchingGround = true;
    isInWater = false;

    isDestroyed = false;

    animationMixer = null;

    constructor(options, defaultOptions) {
        if (new.target === Creature) {
            throw Error("Cannot instantiate abstract class.");
        }
        const creatureOptions = CREATURE_OPTIONS();
        const getOption = (key) =>
            options?.[key] ?? defaultOptions?.[key] ?? creatureOptions[key];
        for (const key in creatureOptions) {
            this[key] = getOption(key);
        }
    }

    async initMesh() {
        throw Error(
            "Implement initMesh in child class (cannot instantiate Creature (abstract class)).",
        );
    }

    async init(scene) {
        this.scene = scene;
        await this.initMesh();
        scene.add(this.mesh);
        this.setRotation(this.rotationAngleRad);
        this.isInitialized = true;
    }

    handleActions(actions, camera) {
        if (!actions) {
            return;
        }
        const cameraAngle = camera?.getCameraAngle();
        for (const actionKey in actions) {
            const isActionActive = actions[actionKey];
            if (actionKey === ACTIONS.KeyW) {
                if (isActionActive) {
                    if (this.isPlayer) {
                        this.setRotation(cameraAngle);
                    }
                    this.isMovingForward = true;
                    this.isMovingBack = false;
                } else {
                    this.isMovingForward = false;
                }
            } else if (actionKey === ACTIONS.KeyA) {
                if (isActionActive) {
                    this.isTurningLeft = true;
                    this.isTurningRight = false;
                } else {
                    this.isTurningLeft = false;
                }
            } else if (actionKey === ACTIONS.KeyS) {
                if (isActionActive) {
                    if (this.isPlayer) {
                        this.setRotation(cameraAngle);
                    }
                    this.isMovingBack = true;
                    this.isMovingForward = false;
                } else {
                    this.isMovingBack = false;
                }
            } else if (actionKey === ACTIONS.KeyD) {
                if (isActionActive) {
                    this.isTurningRight = true;
                    this.isTurningLeft = false;
                } else {
                    this.isTurningRight = false;
                }
            } else if (actionKey === ACTIONS.Space) {
                if (isActionActive && this.isTouchingGround) {
                    this.jump();
                }
            }
        }
    }

    update(clockDeltaSeconds, actions, ground, waters, camera) {
        // Handle player inputted actions
        this.handleActions(actions, camera);

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
            if (this.isPlayer) {
                camera.rotateAboutPoint(this.position, rotationRad);
            }
        }

        // Update player velocity based on current actions
        let movementSpeed = this.speed;
        movementSpeed *= this.isInWater ? SWIMMING_SPEED : 1;
        movementSpeed *= this.isAttacking ? ATTACKING_SPEED : 1;
        if (this.isMovingForward) {
            this.velocity.z = movementSpeed;
        } else if (this.isMovingBack) {
            this.velocity.z = -movementSpeed * BACKWARDS_SPEED;
        } else {
            this.velocity.z = 0;
        }

        // Check if creature is in water, if so, float creature
        this.isInWater = false;
        for (let i = 0; i < waters.length; i++) {
            const water = waters[i];
            if (
                water.getIsPointInWater(
                    this.position.x,
                    this.position.y + this.height / 2,
                    this.position.z,
                )
            ) {
                this.isInWater = true;
                if (this.position.y + this.height / 2 < water.yLevel) {
                    this.velocity.y += WATER_FLOAT_ACCEL * clockDeltaSeconds;
                }
                if (
                    this.position.y +
                        this.height / 2 +
                        this.velocity.y * clockDeltaSeconds >=
                    water.yLevel
                ) {
                    this.velocity.y = 0;
                    this.position.y = water.yLevel - this.height / 2;
                }
            }
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
            this.velocity.y === 0 &&
            !this.isInWater
        ) {
            this.position.y = groundY;
        }

        // If not touching ground, fall
        if (this.position.y > groundY && !this.isInWater) {
            this.velocity.y -= GRAVITY_ACCEL * clockDeltaSeconds;
            if (this.velocity.y < -TERMINAL_VELOCITY) {
                this.velocity.y = -TERMINAL_VELOCITY;
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

        // Update creature animations
        if (this.animationMixer) {
            this.animationMixer.update(clockDeltaSeconds);
        }
        if (this.updateAnimations) {
            this.updateAnimations();
        }

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

    jump() {
        let jumpPower = this.jumpPower;
        jumpPower *= this.isAttacking ? JUMP_POWER_WHILE_ATTACKING : 1;
        this.velocity.y = jumpPower;
    }

    destroy() {
        this.isDestroyed = true;
        this.scene.remove(this.mesh);
    }
}
