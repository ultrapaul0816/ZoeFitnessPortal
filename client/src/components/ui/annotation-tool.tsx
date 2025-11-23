import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Circle, ArrowRight, Type, Pencil, Eraser, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnnotationToolProps {
  imageUrl: string;
  onAnnotationComplete: (annotatedCanvas: HTMLCanvasElement) => void;
  width: number;
  height: number;
}

type ToolMode = "circle" | "arrow" | "text" | "draw" | "erase";

interface DrawingPoint {
  x: number;
  y: number;
}

export function AnnotationTool({ imageUrl, onAnnotationComplete, width, height }: AnnotationToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [toolMode, setToolMode] = useState<ToolMode>("circle");
  const [lineWidth, setLineWidth] = useState(3);
  const [color, setColor] = useState("#FF1493"); // Hot pink
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [startPoint, setStartPoint] = useState<DrawingPoint | null>(null);
  const [currentDrawing, setCurrentDrawing] = useState<DrawingPoint[]>([]);
  const [textInput, setTextInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState<DrawingPoint | null>(null);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImage(img);
      initializeCanvas(img);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const initializeCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0, width, height);
      onAnnotationComplete(canvas);
    }
  };

  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    setStartPoint(coords);

    if (toolMode === "draw") {
      setCurrentDrawing([coords]);
    } else if (toolMode === "text") {
      setTextPosition(coords);
      setShowTextInput(true);
      setIsDrawing(false);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing && !e.type.includes("start") && !e.type.includes("down")) return;
    const coords = getCanvasCoordinates(e);
    if (!coords || !image) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    if (toolMode === "draw") {
      // Freehand drawing
      setCurrentDrawing(prev => [...prev, coords]);
      
      // Draw line from last point to current point
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      if (currentDrawing.length > 0) {
        const lastPoint = currentDrawing[currentDrawing.length - 1];
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      }
    } else if (toolMode === "erase") {
      // Eraser - redraw original image in erased areas
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, lineWidth * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    } else if (startPoint) {
      // For shapes, preview while dragging
      // Redraw original image + completed annotations
      ctx.drawImage(image, 0, 0, width, height);
      
      // Draw preview shape
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.fillStyle = "transparent";

      if (toolMode === "circle") {
        const radius = Math.sqrt(
          Math.pow(coords.x - startPoint.x, 2) + Math.pow(coords.y - startPoint.y, 2)
        );
        ctx.beginPath();
        ctx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (toolMode === "arrow") {
        drawArrow(ctx, startPoint.x, startPoint.y, coords.x, coords.y);
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentDrawing([]);
    
    const canvas = canvasRef.current;
    if (canvas) {
      onAnnotationComplete(canvas);
    }
  };

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ) => {
    const headLength = 20;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    // Draw line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  const addText = () => {
    if (!textInput || !textPosition || !image) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.font = `bold ${lineWidth * 8}px Arial`;
    ctx.fillStyle = color;
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.strokeText(textInput, textPosition.x, textPosition.y);
    ctx.fillText(textInput, textPosition.x, textPosition.y);

    setShowTextInput(false);
    setTextInput("");
    setTextPosition(null);
    
    onAnnotationComplete(canvas);
  };

  const reset = () => {
    if (!image) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    onAnnotationComplete(canvas);
  };

  const colorOptions = [
    { name: "Pink", value: "#FF1493" },
    { name: "Red", value: "#FF0000" },
    { name: "Orange", value: "#FF8C00" },
    { name: "Yellow", value: "#FFD700" },
    { name: "Green", value: "#00FF00" },
    { name: "Blue", value: "#0000FF" },
    { name: "Purple", value: "#9B59B6" },
    { name: "White", value: "#FFFFFF" },
  ];

  return (
    <div className="space-y-4">
      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-auto border border-gray-300 rounded-lg cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        
        {/* Text Input Overlay */}
        {showTextInput && textPosition && (
          <div className="absolute top-4 left-4 right-4 bg-white p-3 rounded-lg shadow-lg border-2 border-pink-300">
            <div className="space-y-2">
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text..."
                className="w-full"
                autoFocus
                data-testid="input-annotation-text"
              />
              <div className="flex gap-2">
                <Button
                  onClick={addText}
                  disabled={!textInput.trim()}
                  size="sm"
                  className="flex-1"
                  data-testid="button-add-text"
                >
                  Add Text
                </Button>
                <Button
                  onClick={() => {
                    setShowTextInput(false);
                    setTextInput("");
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Tool Selection */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={toolMode === "circle" ? "default" : "outline"}
            onClick={() => setToolMode("circle")}
            className="flex-col h-auto py-3"
            data-testid="button-circle-tool"
          >
            <Circle className="w-5 h-5 mb-1" />
            <span className="text-xs">Circle</span>
          </Button>
          <Button
            variant={toolMode === "arrow" ? "default" : "outline"}
            onClick={() => setToolMode("arrow")}
            className="flex-col h-auto py-3"
            data-testid="button-arrow-tool"
          >
            <ArrowRight className="w-5 h-5 mb-1" />
            <span className="text-xs">Arrow</span>
          </Button>
          <Button
            variant={toolMode === "text" ? "default" : "outline"}
            onClick={() => setToolMode("text")}
            className="flex-col h-auto py-3"
            data-testid="button-text-tool"
          >
            <Type className="w-5 h-5 mb-1" />
            <span className="text-xs">Text</span>
          </Button>
          <Button
            variant={toolMode === "draw" ? "default" : "outline"}
            onClick={() => setToolMode("draw")}
            className="flex-col h-auto py-3"
            data-testid="button-draw-tool"
          >
            <Pencil className="w-5 h-5 mb-1" />
            <span className="text-xs">Draw</span>
          </Button>
          <Button
            variant={toolMode === "erase" ? "default" : "outline"}
            onClick={() => setToolMode("erase")}
            className="flex-col h-auto py-3"
            data-testid="button-erase-tool"
          >
            <Eraser className="w-5 h-5 mb-1" />
            <span className="text-xs">Erase</span>
          </Button>
          <Button
            variant="outline"
            onClick={reset}
            className="flex-col h-auto py-3"
            data-testid="button-reset-annotations"
          >
            <RotateCcw className="w-5 h-5 mb-1" />
            <span className="text-xs">Reset</span>
          </Button>
        </div>

        {/* Color Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Color</label>
          <div className="flex gap-2 flex-wrap">
            {colorOptions.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                className={cn(
                  "w-10 h-10 rounded-full border-2 transition-all",
                  color === c.value ? "border-gray-900 scale-110" : "border-gray-300"
                )}
                style={{ backgroundColor: c.value }}
                title={c.name}
                data-testid={`button-color-${c.name.toLowerCase()}`}
              />
            ))}
          </div>
        </div>

        {/* Line Width */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
            <span>Line Width</span>
            <span className="text-xs text-gray-500">{lineWidth}px</span>
          </label>
          <Slider
            value={[lineWidth]}
            onValueChange={(value) => setLineWidth(value[0])}
            min={1}
            max={10}
            step={1}
            className="w-full"
            data-testid="slider-line-width"
          />
        </div>

        <p className="text-xs text-gray-500 text-center">
          💡 Use circles and arrows to highlight progress areas. Add text labels to explain changes.
        </p>
      </div>
    </div>
  );
}
