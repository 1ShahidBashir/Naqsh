
import React, { useRef, useState, useEffect } from 'react'

const Canvas = ({socket}) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const prevPoint = useRef(null);
    // This runs once when the component mounts
    useEffect(() => {
        const canvas = canvasRef.current;
        // Setting the canvas size to the window size so you have a big whiteboard
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }, [])

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        
        setIsDrawing(true);
        // SAVE THE START POINT
        prevPoint.current = { x: offsetX, y: offsetY };

        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        ctx.strokeStyle = color; // Make sure color is set here!
    }

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;

        const { offsetX, offsetY } = nativeEvent;
        const currentPoint = { x: offsetX, y: offsetY };
        const ctx = canvasRef.current.getContext('2d');

        // 1. Draw Locally using our new helper
        drawLine({ prevPoint: prevPoint.current, currentPoint, ctx, color });

        // 2. Send to Server
        if (socket) {
            socket.emit("draw-line", {
                prevPoint: prevPoint.current,
                currentPoint,
                color
            });
        }

        // 3. Update previous point
        prevPoint.current = currentPoint;
    }

    const stopDrawing = () => {
        // 1. Get context
        // 2. Close the path
        // 3. Set isDrawing to false
        const ctx= canvasRef.current.getContext('2d');
        ctx.closePath();
        setIsDrawing(false);
    }

    const drawLine = ({ prevPoint, currentPoint, ctx, color }) => {
        const { x: currX, y: currY } = currentPoint;
        const { x: prevX, y: prevY } = prevPoint;
        
        // 1. Set the color
        ctx.strokeStyle = color;
        ctx.lineWidth = 2; // Optional: set a standard width
        ctx.lineCap = 'round'; // Makes lines look smoother
        ctx.lineJoin= 'round';

        // 2. Draw the path
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currX, currY);
        ctx.stroke();
    }

    //---------------------------------------
    const clearScreen=()=>{
        if(socket){
            socket.emit('clear-screen');
        }
    }
    //---------------------------------------


    //Canvas Resize on Window Resize
    useEffect(()=>{
        const handleResize= ()=>{
            const canvas= canvasRef.current;
            const ctx= canvas.getContext('2d');
            const imageData= ctx.getImageData(0,0,canvas.width, canvas.height);
            canvas.width= window.innerWidth;
            canvas.height= window.innerHeight;
            ctx.putImageData(imageData, 0, 0);
        }
        window.addEventListener('resize', handleResize);
        return()=>{
            window.removeEventListener('resize', handleResize);
        }
    },[]);

    useEffect(() => {
        if (!socket) return;

        // Listen for the event from the server
        socket.on("draw-line", ({ prevPoint, currentPoint, color }) => {
            const ctx = canvasRef.current.getContext('2d');
            // Call the same helper function!
            drawLine({ prevPoint, currentPoint, ctx, color });
        });

        //listener for history replay
        socket.on('get-canvas-state', (state)=>{
            console.log("state received replaying");
            const ctx= canvasRef.current.getContext('2d');
            state.forEach(line => {
                drawLine({...line,ctx});
            });
        });
        
        //------------------------------------------
        //clear screen
        socket.on('clear-screen',()=>{
            const canvas= canvasRef.current;
            const ctx= canvas.getContext('2d');
            ctx.clearRect(0,0,canvas.width, canvas.height);
        });
        //-------------------------------------------

        // Cleanup: remove the listener if component unmounts
        return () => {
            socket.off("draw-line");
            socket.off("get-canvas-state"); // Cleanup
            socket.off('clear-screen');
        };
    }, [socket]); // Re-run if socket changes
    
    const [color, setColor]= useState("black");
    return (
        <>
            <input type="color" onChange={(e)=>setColor(e.target.value)}/>
            <button onClick={clearScreen}>Clear</button>
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