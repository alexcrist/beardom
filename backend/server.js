import cors from "cors";
import express from "express";
import { ExpressPeerServer } from "peer";

const app = express();
app.use(cors());
app.enable("trust proxy");

const PORT = process.env.PORT || 9000;

const server = app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log("Press Ctrl+C to quit.");
});

const peerServer = ExpressPeerServer(server, {
    path: "/",
    key: "beardom",
    allow_discovery: true,
});

peerServer.on("connection", (client) => {
    // TODO: basic logging
});

peerServer.on("disconnect", (client) => {
    // TODO: basic logging
});

app.use("/", peerServer);
