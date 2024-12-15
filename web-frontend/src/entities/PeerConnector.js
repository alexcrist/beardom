import { Peer } from "peerjs";
import { Bear } from "./Bear";

export class PeerConnector {
    scene = null;
    player = null;
    peer = null;
    bears = {};
    actions = {};

    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        const id = `beardom_${Math.floor(Math.random() * 100000)}`;
        this.peer = new Peer(id);
        this.peer.on("open", (id) => {
            console.info("Peer opened with ID:", id);
        });
        this.peer.on("connection", (connection) => {
            this.initConnection(connection);
        });
        document.querySelector("#peer-id").innerText = id;
        document
            .querySelector("#connection-form")
            .addEventListener("submit", this.onSubmit.bind(this));
    }

    onSubmit(event) {
        event.preventDefault();
        const peerId = document.querySelector("#peer-id-input").value;
        if (!peerId) {
            return;
        }

        console.log(`Connecting to ${peerId}...`);
        const connection = this.peer.connect(peerId);
        this.initConnection(connection);
    }

    initConnection(connection) {
        const peerId = connection.peer;

        connection.on("error", (error) => {
            console.error("Connection error", error);
        });

        connection.on("data", (data) => {
            if (this.bears[peerId].isInitialized) {
                this.bears[peerId].handleActions(data.actions);
                this.bears[peerId].position.set(
                    data.position[0],
                    data.position[1],
                    data.position[2],
                );
                this.bears[peerId].velocity.set(
                    data.velocity[0],
                    data.velocity[1],
                    data.velocity[2],
                );
                this.bears[peerId].setRotation(data.rotationAngleRad);
            }
        });

        connection.on("open", () => {
            this.bears[peerId] = new Bear();
            this.bears[peerId].init(this.scene);
            setInterval(() => {
                connection.send({
                    position: [
                        this.player.position.x,
                        this.player.position.y,
                        this.player.position.z,
                    ],
                    velocity: [
                        this.player.velocity.x,
                        this.player.velocity.y,
                        this.player.velocity.z,
                    ],
                    rotationAngleRad: this.player.rotationAngleRad,
                    actions: this.actions,
                });
            }, 50);
            this.actions = {};
            console.info("Connection opened.");
        });

        connection.on("close", () => {
            console.info("Connection closed.");
            delete this.bears[peerId];
        });
    }

    update(actions) {
        // TODO: coalesce all updates of actions
        this.actions = actions;
    }

    getCreatures() {
        return Object.values(this.bears).filter(
            (creature) => creature.isInitialized,
        );
    }
}
