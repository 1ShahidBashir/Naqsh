import express from 'express';
import http, { METHODS } from 'http';
import cors from 'cors';
import {Server} from "socket.io";

const app = express();

const server= http.createServer(app);

const io= new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log("User Connected:", socket.id);

    // NEW CODE HERE
    // Listen for "draw-line" events from the client
    socket.on("draw-line", ({ prevPoint, currentPoint, color }) => {
        // "broadcast" sends it to everyone EXCEPT the sender
        socket.broadcast.emit("draw-line", { prevPoint, currentPoint, color });
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected:', socket.id);
    });
});

server.listen(3001, ()=> console.log("server listening on port 3001"));