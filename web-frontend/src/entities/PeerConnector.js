import { Peer } from "peerjs";
import { Bear } from "./Bear";

const SERVER_IP = "server.beardom.net";
const SERVER_PORT = 443;
const SERVER_KEY = "beardom";
const SENDING_INTERVAL_MS = 50;

export class PeerConnector {
    scene = null;
    player = null;
    peer = null;

    // Actions to send to connected peers
    actions = {};

    // Connections, creatures, and actions from connected peers
    peerConnections = {};
    peerCreatures = {};
    peerActions = {};

    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.peer = new Peer(null, {
            host: SERVER_IP,
            port: SERVER_PORT,
            key: SERVER_KEY,
            secure: true,
        });
        this.peer.on("open", this.onConnect.bind(this));
        this.peer.on("connection", (connection) => {
            this.initConnection(connection);
        });
        this.peer.on("error", (error) => {
            console.error(error);
        });
        setInterval(this.sendData.bind(this), SENDING_INTERVAL_MS);
    }

    async onConnect(id) {
        this.id = id;
        console.info("Connected with ID:", id);
        const res = await fetch(`https://${SERVER_IP}/${SERVER_KEY}/peers`);
        const peerIds = await res.json();
        for (const peerId of peerIds) {
            const isSelf = peerId === this.id;
            if (!isSelf) {
                const connection = this.peer.connect(peerId);
                this.initConnection(connection);
            }
        }
    }

    initConnection(connection) {
        const peerId = connection.peer;

        connection.on("error", (error) => {
            console.error("Connection error", error);
        });

        connection.on("data", (data) => this.onReceiveData(data, peerId));

        connection.on("open", () => {
            this.peerCreatures[peerId] = new Bear({ isPeer: true });
            this.peerCreatures[peerId].init(this.scene);
            this.peerActions[peerId] = {};
            this.peerConnections[peerId] = connection;
        });

        connection.on("close", () => {
            this.peerCreatures[peerId].destroy();
            delete this.peerConnections[peerId];
            delete this.peerCreatures[peerId];
            delete this.peerActions[peerId];
        });
    }

    sendData() {
        const data = {
            name: this.player.name,
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
            modelName: this.player.modelName,
            actions: this.actions,
        };
        this.actions = {};
        const peerConnectionsFlat = Object.values(this.peerConnections);
        for (let i = 0; i < peerConnectionsFlat.length; i++) {
            const connection = peerConnectionsFlat[i];
            connection.send(data);
        }
    }

    onReceiveData(data, peerId) {
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
            this.peerCreatures[peerId].setName(data.name);
            this.peerCreatures[peerId].setModelName(data.modelName);
            this.peerActions[peerId] = data.actions;
        }
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
