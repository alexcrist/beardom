import { Peer } from "peerjs";
import { Bear } from "./Bear";

export class PeerConnector {
    scene = null;
    player = null;
    peer = null;

    // Actions to send to connected peer
    actions = {};

    // Creatures and actions from connected peer
    peerCreatures = {};
    peerActions = {};

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
            if (this.peerCreatures[peerId].isInitialized) {
                this.peerCreatures[peerId].position.set(
                    data.position[0],
                    data.position[1],
                    data.position[2],
                );
                this.peerCreatures[peerId].velocity.set(
                    data.velocity[0],
                    data.velocity[1],
                    data.velocity[2],
                );
                this.peerCreatures[peerId].setRotation(data.rotationAngleRad);
                this.peerActions[peerId] = data.actions;
            }
        });

        connection.on("open", () => {
            this.peerCreatures[peerId] = new Bear({ isPeer: true });
            this.peerCreatures[peerId].init(this.scene);
            setInterval(() => {
                console.log("this.actions", this.actions);
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
                this.actions = {};
            }, 50);
            console.info("Connection opened.");
        });

        connection.on("close", () => {
            console.info("Connection closed.");
            this.peerCreatures[peerId].destroy();
            delete this.peerCreatures[peerId];
            delete this.peerActions[peerId];
        });
    }

    update(actions) {
        // Send all actions performed since the last update
        for (const actionKey in actions) {
            this.actions[actionKey] =
                this.actions[actionKey] || actions[actionKey];
        }
    }

    getPeerCreaturesAndActions() {
        const peerCreatures = [];
        const peerActions = [];
        for (const key in this.peerCreatures) {
            peerCreatures.push(this.peerCreatures[key]);
            peerActions.push(this.peerActions[key]);
        }
        return { peerCreatures, peerActions };
    }
}
