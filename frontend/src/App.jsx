import React, { useEffect } from 'react'
import Canvas from './Canvas'
import { io } from "socket.io-client";

// 1. Connect outside the component
// We point to our server's URL

const socket = io("http://localhost:3001");
const App = () => {

  useEffect(() => {
    // 2. Test the connection on mount
    socket.on("connect", () => {
        console.log("Connected to server with ID:", socket.id);
    });
  }, []);

  return (
    // Pass the socket down to Canvas so it can use it
    <Canvas socket={socket} />
  )
}

export default App