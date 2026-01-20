import React, { useEffect } from 'react'
import Canvas from './Canvas'
import { io } from "socket.io-client";
import {BrowserRouter, Routes, Route, useNavigate, useParams} from "react-router-dom";
import {v4 as uuidv4} from "uuid";


const SERVER_URL = import.meta.env.SERVER || "http://localhost:3001";
const socket = io(SERVER_URL);

const Home= ()=>{
  const navigate= useNavigate();
  const createRoom= ()=>{
    const roomId= uuidv4();
    navigate(`/room/${roomId}`);
  }
  return(
    <>
      <button onClick={createRoom}>Create Room</button>
    </>
  )
}


const CanvasPage= ()=>{
  const {roomId}= useParams();
  return(
    <Canvas roomId={roomId} socket={socket}/>
  )
}

const App = () => {

  //Test the connection on mount
  useEffect(() => {
    socket.on("connect", () => {
        console.log("Connected to server with ID:", socket.id);
    });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/room/:roomId" element={<CanvasPage/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App