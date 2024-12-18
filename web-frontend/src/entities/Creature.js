import { Matrix3, Vector3 } from "three";
import {
    GRAVITY_ACCEL,
    TERMINAL_VELOCITY,
    WATER_FLOAT_ACCEL,
} from "../constants";
import { createTextMesh } from "../util/createTextMesh";
import { getName } from "../util/name";
import { ACTIONS } from "./ActionListener";

const BACKWARDS_SPEED = 0.75;
const SWIMMING_SPEED = 0.5;
const ATTACKING_SPEED = 0.5;
const JUMP_POWER_WHILE_ATTACKING = 0.8;
const JUMP_POWER_WHILE_SWIMMING = 0.5;
const TEXT_Y_OFFSET = 2;

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
    mesh = null;
    name = null;

    position = new Vector3(0, 0, 0); // World frame
    velocity = new Vector3(0, 0, 0); // Local frame

    // Creature rotation
    rotationAngleRad = 0;
    rotationMatrix = new Matrix3();

    speed = null;
    turnSpeed = null;
    jumpPower = null;
    height = null;

    isPlayer = false;
    isPeer = false;

    isMovingForward = false;
    isTurningLeft = false;
    isTurningRight = false;
    isMovingBack = false;
    isAttacking = false;
    isJumping = false;

    isTouchingGround = true;
    isInWater = false;
    isAtWaterSurface = false;

    // 'wasInWater' is true if the player was in water more recently than they were
    // on ground
    wasInWater = false;

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
        if (this.isPlayer) {
            this.name = getName();
        }
    }

    async initMesh() {
        throw Error(
            "Implement initMesh in child class (cannot instantiate Creature (abstract class)).",
        );
    }

    setName(name) {
        if (name && (name !== this.name || !this.textMesh)) {
            this.name = name;
            if (this.isPeer) {
                const oldTextMesh = this.textMesh;
                const newTextMesh = createTextMesh(this.name);
                this.scene.add(newTextMesh);
                this.textMesh = newTextMesh;
                this.scene.remove(oldTextMesh);
            }
        }
    }

    async init(scene) {
        this.scene = scene;
        await this.initMesh();
        this.setName(this.name);
        scene.add(this.mesh);
        this.setRotation(this.rotationAngleRad);
        this.isInitialized = true;
    }

    handleActions(actions, camera) {
        if (!actions) {
            return;
        }
        this.isJumping = false;
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
                if (isActionActive) {
                    this.jump();
                }
            }
        }
    }

    update(clockDeltaSeconds, actions, ground, waters, camera) {
        const oldPosX = this.position.x;
        const oldPosY = this.position.y;
        const oldPosZ = this.position.z;

        // Handle player inputted actions
        this.handleActions(actions, camera);

        // Update creature animations
        if (this.animationMixer) {
            this.animationMixer.update(clockDeltaSeconds);
        }
        if (this.updateAnimations) {
            this.updateAnimations();
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
            if (this.isPlayer) {
                camera.rotateAboutPoint(this.position, rotationRad);
            }
        }

        // Update player velocity based on current actions
        if (!this.isPeer) {
            let movementSpeed = this.speed;
            movementSpeed *= this.wasInWater ? SWIMMING_SPEED : 1;
            movementSpeed *= this.isAttacking ? ATTACKING_SPEED : 1;
            if (this.isMovingForward) {
                this.velocity.z = movementSpeed;
            } else if (this.isMovingBack) {
                this.velocity.z = -movementSpeed * BACKWARDS_SPEED;
            } else {
                this.velocity.z = 0;
            }
        }

        // Check if creature is in water, if so, float creature
        this.isInWater = false;
        this.isAtWaterSurface = false;
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
                this.wasInWater = true;
                if (this.position.y + this.height / 2 < water.yLevel) {
                    this.velocity.y += WATER_FLOAT_ACCEL * clockDeltaSeconds;
                }
                if (
                    this.position.y +
                        this.height / 2 +
                        this.velocity.y * clockDeltaSeconds >=
                        water.yLevel &&
                    !this.isJumping
                ) {
                    this.velocity.y = 0;
                    this.position.y = water.yLevel - this.height / 2;
                    this.isAtWaterSurface = true;
                }
            }
        }

        // Update position (with velocity)
        const velocityXZ = new Vector3(this.velocity.x, this.velocity.z, 1);
        velocityXZ.applyMatrix3(this.rotationMatrix);
        const velocityX = velocityXZ.x;
        const velocityZ = velocityXZ.y;
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
        if (this.position.y === groundY) {
            this.isTouchingGround = true;
            if (!this.isInWater) {
                this.wasInWater = false;
            }
        } else {
            this.isTouchingGround = false;
        }

        // Transform mesh to match position
        this.mesh.position.set(
            this.position.x,
            this.position.y,
            this.position.z,
        );

        // Draw text mesh (if applicable)
        if (this.textMesh) {
            this.textMesh.position.set(
                this.position.x,
                this.position.y + TEXT_Y_OFFSET,
                this.position.z,
            );
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
        if (this.textMesh) {
            this.textMesh.setRotationFromAxisAngle(
                new Vector3(0, 1, 0),
                -angleRad,
            );
        }
    }

    addRotation(angleRad) {
        this.setRotation(this.rotationAngleRad + angleRad);
    }

    jump() {
        if (
            (this.isTouchingGround && !this.isInWater) ||
            this.isAtWaterSurface
        ) {
            let jumpPower = this.jumpPower;
            jumpPower *= this.isAttacking ? JUMP_POWER_WHILE_ATTACKING : 1;
            jumpPower *= this.isInWater ? JUMP_POWER_WHILE_SWIMMING : 1;
            this.velocity.y = jumpPower;
            this.isJumping = true;
        }
    }

    destroy() {
        this.isDestroyed = true;
        this.scene.remove(this.mesh);
    }
}
