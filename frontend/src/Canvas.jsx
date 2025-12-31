
import React, { useRef, useState, useEffect } from 'react'

const Canvas = () => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    // This runs once when the component mounts
    useEffect(() => {
        const canvas = canvasRef.current;
        // Setting the canvas size to the window size so you have a big whiteboard
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }, [])

    const startDrawing = ({ nativeEvent }) => {
        // 1. Set isDrawing to true
        // 2. Get the context (ctx) from canvasRef
        // 3. Start a path (beginPath)
        // 4. Move to the mouse position (nativeEvent.offsetX, nativeEvent.offsetY)
        setIsDrawing(true);
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(nativeEvent.offsetX, nativeEvent.offsetY);
    }

    const draw = ({ nativeEvent }) => {
        // 1. Check if we are NOT drawing. If so, return.
        // 2. Get context
        // 3. Draw line to new mouse position (lineTo)
        // 4. Make the line visible (stroke)
        if(!isDrawing)return;
        const ctx= canvasRef.current.getContext('2d');
        ctx.lineTo(nativeEvent.offsetX, nativeEvent.offsetY);
        ctx.strokeStyle= color;
        ctx.stroke();
    }

    const stopDrawing = () => {
        // 1. Get context
        // 2. Close the path
        // 3. Set isDrawing to false
        const ctx= canvasRef.current.getContext('2d');
        ctx.closePath();
        setIsDrawing(false);
    }

    const [color, setColor]= useState("black");
    return (
        <>
            <input type="color" onChange={(e)=>setColor(e.target.value)}/>
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                // This ensures the cursor looks like a crosshair
                style={{ cursor: 'crosshair', display: 'block' }} 
            />
        </>
    )
}

export default Canvas