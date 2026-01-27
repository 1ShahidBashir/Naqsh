import express from 'express';
import http, { METHODS } from 'http';
import cors from 'cors';
import {Server} from "socket.io";
import 'dotenv/config';

const app = express();

const server= http.createServer(app);

const io= new Server(server, {
    cors: {
        origin: process.env.CLIENT || "*",
        methods: ["GET", "POST"]
    }
});

//Depr: Create storage outside the connection block
// let drawHistory = [];

//use map room to history
const roomState= new Map();

io.on('connection', (socket) => {
    console.log("User Connected:", socket.id);
    
    socket.on('join-room', (roomId)=>{
        socket.join(roomId); //Socket.io built-in room management

        //doesn't exist in map, create it
        if(!roomState.has(roomId)){
            roomState.set(roomId, []);
        }

        //sending user's room's history
        const history= roomState.get(roomId);
        socket.emit('get-canvas-state', history); //stays same as old
    });
    
    // DEPR: IMMEDIATE ACTION: Send existing history to the NEW user only
    // We use socket.emit (unicast), NOT io.emit (broadcast)
    // socket.emit('get-canvas-state', drawHistory);

    socket.on("draw-line", ({ prevPoint, currentPoint, color, roomId, tool }) => {
        // depr: Add to history
        //drawHistory.push({ prevPoint, currentPoint, color });
        if(roomState.has(roomId)){
            roomState.get(roomId).push({prevPoint, currentPoint, color, tool});
        }

        // depr: Send to everyone else
        // socket.broadcast.emit("draw-line", { prevPoint, currentPoint, color });
        socket.to(roomId).emit('draw-line',{prevPoint, currentPoint, color, tool}); //.to sends to particular place/user in this case room

    });

    //-------------------------------------------------
    // depr
    // socket.on('clear-screen',()=>{
    //     drawHistory= [];
    //     io.emit('clear-screen');
    // });

    socket.on('clear-screen', (roomId)=>{
        if(roomState.has(roomId)){
            roomState.set(roomId, []);
        }

        //broadcast
        socket.to(roomId).emit('clear-screen');
    });

    //-------------------------------------------------

    socket.on('disconnect', () => {
        console.log('User Disconnected:', socket.id);
    });
});

server.listen(process.env.PORT, ()=> console.log("server listening"));