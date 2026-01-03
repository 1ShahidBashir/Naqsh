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

// 1. Create storage outside the connection block
let drawHistory = [];

io.on('connection', (socket) => {
    console.log("User Connected:", socket.id);

    // 2. IMMEDIATE ACTION: Send existing history to the NEW user only
    // We use socket.emit (unicast), NOT io.emit (broadcast)
    socket.emit('get-canvas-state', drawHistory);

    socket.on("draw-line", ({ prevPoint, currentPoint, color }) => {
        // 3. Add to history
        drawHistory.push({ prevPoint, currentPoint, color });

        // 4. Send to everyone else
        socket.broadcast.emit("draw-line", { prevPoint, currentPoint, color });
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected:', socket.id);
    });
});

server.listen(3001, ()=> console.log("server listening on port 3001"));