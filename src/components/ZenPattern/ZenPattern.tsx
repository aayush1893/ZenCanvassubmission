import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import colorPalette from "components/ZenPattern/output.png"; 
import { s3 } from "aws-config";

interface Point {
  x: number;
  y: number;
}

interface ZenPatternProps {
  playerId: string;
  onBack: () => void;
  onSaveToGallery: (mandalaData: string | Blob) => void; 
}

const interpolatePoints = (start: Point, end: Point, steps: number): Point[] => {
  const points: Point[] = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    points.push({
      x: start.x + (end.x - start.x) * t,
      y: start.y + (end.y - start.y) * t,
    });
  }
  return points;
};

const calculateSpeed = (start: Point, end: Point, deltaTime: number): number => {
  const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
  return distance / deltaTime; // Speed = distance / time
};

const smoothMouse = (target: Point, current: Point, smoothing: number): Point => {
  return {
    x: current.x + (target.x - current.x) * smoothing,
    y: current.y + (target.y - current.y) * smoothing,
  };
};


const ZenPattern: React.FC<ZenPatternProps> = ({ playerId, onBack, onSaveToGallery }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [undoStack, setUndoStack] = useState<Point[][]>([]);
  const [redoStack, setRedoStack] = useState<Point[][]>([]);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(2);
  const [symmetryLines, setSymmetryLines] = useState(8);
  const [stencilVisible, setStencilVisible] = useState(true);
  const [enableMirroring, setEnableMirroring] = useState(false);
  const [concentricCircles, setConcentricCircles] = useState(5); // Default value of 5
  const [strokesPerSymmetry, setStrokesPerSymmetry] = useState(1); // Default to 1 stroke per symmetry line
  const [lastDrawTime, setLastDrawTime] = useState(performance.now());
  const [laggedCursor, setLaggedCursor] = useState<Point>({ x: 0, y: 0 });

  
  const uploadMandalaToS3 = async (imageBlob: Blob, userId: string) => {
    const params = {
      Bucket: "myzenspace", // Your bucket name
      Key: `${userId}/mandala_${Date.now()}.png`, // File path in the bucket
      Body: imageBlob,
      ContentType: "image/png",
    };
  
    try {
      const uploadResponse = await s3.upload(params).promise();
      console.log("Uploaded successfully:", uploadResponse.Location);
      return uploadResponse.Location; // URL for the uploaded file
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to save your mandala.");
    }
  };
  
  
  const saveMandala = async () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.toBlob(async (blob) => {
        if (blob) {
          console.log("Blob created successfully:", blob); // Debugging output
          const s3Url = await uploadMandalaToS3(blob, playerId);
          if (s3Url) {
            console.log("S3 URL:", s3Url); // Debugging output
            onSaveToGallery(s3Url); // Save to gallery
            alert("Mandala saved! You can view it here: " + s3Url);
          }
        } else {
          alert("Failed to create a blob from the canvas.");
          console.error("Blob creation failed."); // Debugging output
        }
      }, "image/png");
    } else {
      alert("Canvas not found!");
      console.error("Canvas reference is null."); // Debugging output
    }
  };
  

  const drawWithSymmetry = (ctx: CanvasRenderingContext2D, x: number, y: number, lastPoint: Point) => {
    const centerX = ctx.canvas.width / (2 * (window.devicePixelRatio || 1));
    const centerY = ctx.canvas.height / (2 * (window.devicePixelRatio || 1));
  
    // Set high-quality drawing settings
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  
    // Use the smoothed position for drawing
    const smoothedX = x;
    const smoothedY = y;
  
    for (let i = 0; i < symmetryLines; i++) {
      const angle = (Math.PI * 2 * i) / symmetryLines;
  
      const rotatedX = (smoothedX - centerX) * Math.cos(angle) - (smoothedY - centerY) * Math.sin(angle);
      const rotatedY = (smoothedX - centerX) * Math.sin(angle) + (smoothedY - centerY) * Math.cos(angle);
  
      const rotatedLastX = (lastPoint.x - centerX) * Math.cos(angle) - (lastPoint.y - centerY) * Math.sin(angle);
      const rotatedLastY = (lastPoint.x - centerX) * Math.sin(angle) + (lastPoint.y - centerY) * Math.cos(angle);
  
      // Use Path2D for better line quality
      const path = new Path2D();
      path.moveTo(rotatedLastX + centerX, rotatedLastY + centerY);
      path.lineTo(rotatedX + centerX, rotatedY + centerY);
      ctx.stroke(path);
    }
  };
  
   
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !canvasRef.current) return;
  
    const dpr = window.devicePixelRatio || 1;
    const x = (e.clientX - rect.left) * (canvasRef.current.width / (rect.width * dpr));
    const y = (e.clientY - rect.top) * (canvasRef.current.height / (rect.height * dpr));
  
    setCurrentStroke([{ x, y }]);
  };
    
 const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
  if (!isDrawing || !canvasRef.current) return;

  const ctx = canvasRef.current.getContext("2d");
  const rect = canvasRef.current.getBoundingClientRect();
  if (!ctx || !rect) return;

  // Enhanced drawing settings for crisp lines
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = color;
  ctx.lineWidth = brushSize;

  // Calculate position with DPI scaling
  const dpr = window.devicePixelRatio || 1;
  const x = (e.clientX - rect.left) * (canvasRef.current.width / (rect.width * dpr));
  const y = (e.clientY - rect.top) * (canvasRef.current.height / (rect.height * dpr));

  const currentPoint = { x, y };
  const lastPoint = currentStroke[currentStroke.length - 1];

  // Calculate speed and adjust interpolation steps
  const currentTime = performance.now();
  const deltaTime = currentTime - lastDrawTime;
  const speed = calculateSpeed(lastPoint, currentPoint, deltaTime);
  
  // More interpolation points when moving slowly, fewer when moving fast
  const interpolationSteps = Math.max(1, Math.min(10, Math.floor(20 / speed)));
  
  // Get interpolated points
  const points = interpolatePoints(lastPoint, currentPoint, interpolationSteps);

  // Smooth out the cursor movement
  const smoothedPoint = smoothMouse(currentPoint, laggedCursor, 0.5);
  setLaggedCursor(smoothedPoint);

  // Draw all interpolated points
  points.forEach((point) => {
    drawWithSymmetry(ctx, point.x, point.y, lastPoint);
  });

  setLastDrawTime(currentTime);
  setCurrentStroke((prev) => [...prev, currentPoint]);
};
  
  const handleMouseUp = () => {
    setIsDrawing(false);
    setUndoStack((prev) => [...prev, currentStroke]);
    setRedoStack([]);
    setCurrentStroke([]);
  };

 const clearCanvas = () => {
  const canvas = canvasRef.current;
  if (canvas) {
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setUndoStack([]);
    setRedoStack([]);
  }
};

  const handleUndo = () => {
    if (!undoStack.length) return;

    const newUndoStack = [...undoStack];
    const lastStroke = newUndoStack.pop();
    setUndoStack(newUndoStack);

    if (lastStroke) setRedoStack((prev) => [...prev, lastStroke]);

    redrawCanvas(newUndoStack);
  };

  const handleRedo = () => {
    if (!redoStack.length) return;

    const newRedoStack = [...redoStack];
    const lastRedo = newRedoStack.pop();
    setRedoStack(newRedoStack);

    if (lastRedo) setUndoStack((prev) => [...prev, lastRedo]);

    if (lastRedo) {
      redrawCanvas([...undoStack, lastRedo]);
    }
  };

 // Add these functions in your component after the existing drawing functions

  const redrawCanvas = (strokes: Point[][]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((stroke) => {
      stroke.forEach((point, index) => {
        if (index > 0) {
          drawWithSymmetry(ctx, point.x, point.y, stroke[index - 1]);
        }
      });
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!canvas || !overlayCanvas) return;
  
    // Fix for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set dimensions for both canvases
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    overlayCanvas.width = rect.width * dpr;
    overlayCanvas.height = rect.height * dpr;
  
    // Get contexts
    const ctx = canvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');
    
    if (ctx && overlayCtx) {
      // Scale both contexts
      ctx.scale(dpr, dpr);
      overlayCtx.scale(dpr, dpr);
      
      // Clear and redraw stencil
      if (stencilVisible) {
        overlayCtx.clearRect(0, 0, rect.width, rect.height);
  
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const maxRadius = Math.min(centerX, centerY) * 0.8; // Slightly reduced to ensure visibility
  
        // Style for stencil lines
        overlayCtx.strokeStyle = "rgba(0, 0, 0, 0.2)";
        overlayCtx.lineWidth = 1;
  
        // Draw symmetry lines
        for (let i = 0; i < symmetryLines; i++) {
          const angle = (Math.PI * 2 * i) / symmetryLines;
          overlayCtx.beginPath();
          overlayCtx.moveTo(centerX, centerY);
          overlayCtx.lineTo(
            centerX + maxRadius * Math.cos(angle),
            centerY + maxRadius * Math.sin(angle)
          );
          overlayCtx.stroke();
        }
  
        // Draw concentric circles
        for (let i = 1; i <= concentricCircles; i++) {
          overlayCtx.beginPath();
          overlayCtx.arc(
            centerX,
            centerY,
            (maxRadius / concentricCircles) * i,
            0,
            Math.PI * 2
          );
          overlayCtx.stroke();
        }
      }
    }
  }, [stencilVisible, symmetryLines, concentricCircles]);
  

  return (
    <motion.div className="flex flex-col items-center">
      {/* Header Section */}
      <header
        className="flex justify-between w-full p-4"
        style={{
          background: "linear-gradient(135deg,#ae9ead,#ae9ead,rgba(64,72,106,255))",
          color: "#ffffff",
        }}
      >
        <button onClick={onBack} className="px-4 py-2 bg-blue-600 rounded">
          Back
        </button>
        <button onClick={clearCanvas} className="px-4 py-2 bg-red-600 rounded">
          Clear Canvas
        </button>
      </header>
  
      {/* Main Content Section */}
      <div className="flex w-full p-4 gap-4 h-[calc(100vh-5rem)]">
        {/* Left Side - Color Palette */}
        <div className="w-1/4 flex flex-col">
          <h3 className="text-lg font-bold mb-4">Emotion-Color Palette</h3>
          <img
            src={colorPalette}
            alt="Enhanced Emotion-Color Palette"
            className="rounded-lg shadow-lg w-full"
          />
          <p className="text-sm text-center mt-2">
            Choose a color that reflects your mood and use it to express yourself on the canvas!
          </p>
        </div>
  
        {/* Right Side - Controls and Canvas */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Controls Panel - Single Row */}
          <div
            className="flex items-center justify-between p-4 gap-4"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
            }}
          >
            {/* Sliders Group */}
            <div className="flex gap-4">
              <div className="flex flex-col w-32">
                <label className="text-sm font-medium mb-1">Brush Size</label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                />
              </div>
  
              <div className="flex flex-col w-32">
                <label className="text-sm font-medium mb-1">Symmetry</label>
                <input
                  type="range"
                  min={2}
                  max={16}
                  value={symmetryLines}
                  onChange={(e) => setSymmetryLines(Number(e.target.value))}
                />
              </div>
  
              <div className="flex flex-col w-32">
                <label className="text-sm font-medium mb-1">Circles</label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={concentricCircles}
                  onChange={(e) => setConcentricCircles(Number(e.target.value))}
                />
              </div>
            </div>
  
            {/* Color and Mirror */}
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-8 w-16"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="mirror"
                  checked={enableMirroring}
                  onChange={(e) => setEnableMirroring(e.target.checked)}
                />
                <label htmlFor="mirror" className="text-sm whitespace-nowrap">Mirror</label>
              </div>
            </div>
  
            {/* Action Buttons - Always in one line */}
            <div className="flex justify-center mt-4">
            <button
             onClick={saveMandala}
             className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save Mandala
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleUndo}
                disabled={!undoStack.length}
                className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Undo
              </button>
              <button
                onClick={handleRedo}
                disabled={!redoStack.length}
                className="px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                Redo
              </button>
              <button
                onClick={() => setStencilVisible(!stencilVisible)}
                className="px-3 py-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                {stencilVisible ? "Hide" : "Show"} Stencil
              </button>
            </div>
          </div>
  
          {/* Canvas Container - Larger height */}
          <div className="relative flex-1">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => setIsDrawing(false)}
              className="border border-black w-full h-full"
            />
            {stencilVisible && (
              <canvas
                ref={overlayCanvasRef}
                className="absolute inset-0 pointer-events-none w-full h-full"
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
  
};

export default ZenPattern;
