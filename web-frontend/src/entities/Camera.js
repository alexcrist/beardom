import { PerspectiveCamera, Vector3 } from "three/src/Three.js";

const CAMERA_VERTICAL_OFFSET = 2;

export class Camera {
    camera = null;
    cameraDirection = new Vector3();

    constructor({ player, position }) {
        this.player = player;
        this.camera = new PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000,
        );
        this.camera.position.copy(position);
    }

    update() {
        this.lookAtPlayer();
    }

    lookAtPlayer() {
        this.camera.lookAt(
            this.player.mesh.position.x,
            this.player.mesh.position.y + CAMERA_VERTICAL_OFFSET,
            this.player.mesh.position.z,
        );
    }

    rotateAboutPoint(vector3, angleRad) {
        const dX = this.camera.position.x - vector3.x;
        const dZ = this.camera.position.z - vector3.z;
        const radius = Math.sqrt(dX ** 2 + dZ ** 2);
        const oldAngleRad = Math.atan2(dZ, dX);
        const newAngleRad = oldAngleRad + angleRad;
        const newX = vector3.x + radius * Math.cos(newAngleRad);
        const newZ = vector3.z + radius * Math.sin(newAngleRad);
        this.camera.position.set(newX, this.camera.position.y, newZ);
    }

    getCameraDirection() {
        this.camera.getWorldDirection(this.cameraDirection);
        return this.cameraDirection;
    }

    getCameraAngle() {
        const cameraDirection = this.getCameraDirection();
        const cameraAngle =
            Math.atan2(cameraDirection.z, cameraDirection.x) - Math.PI / 2;
        return cameraAngle;
    }

    moveCamera(dX, dY, dZ) {
        this.camera.position.set(
            this.camera.position.x + dX,
            this.camera.position.y + dY,
            this.camera.position.z + dZ,
        );
    }
}
