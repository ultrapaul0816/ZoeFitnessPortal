import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Paintbrush, Eraser, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlurToolProps {
  imageUrl: string;
  onBlurComplete: (blurredCanvas: HTMLCanvasElement) => void;
  width: number;
  height: number;
}

export function BlurTool({ imageUrl, onBlurComplete, width, height }: BlurToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(40);
  const [blurIntensity, setBlurIntensity] = useState(15);
  const [mode, setMode] = useState<"blur" | "erase">("blur");
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImage(img);
      initializeCanvases(img);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const initializeCanvases = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    
    if (!canvas || !maskCanvas) return;

    // Set canvas sizes
    canvas.width = width;
    canvas.height = height;
    maskCanvas.width = width;
    maskCanvas.height = height;

    // Draw original image
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0, width, height);
    }

    // Initialize mask canvas (transparent)
    const maskCtx = maskCanvas.getContext("2d");
    if (maskCtx) {
      maskCtx.clearRect(0, 0, width, height);
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
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    applyBlur();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing && !e.type.includes("start") && !e.type.includes("down")) return;

    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    const maskCanvas = maskCanvasRef.current;
    const maskCtx = maskCanvas?.getContext("2d");
    if (!maskCtx) return;

    maskCtx.globalCompositeOperation = mode === "blur" ? "source-over" : "destination-out";
    maskCtx.fillStyle = "rgba(255, 255, 255, 1)";
    maskCtx.beginPath();
    maskCtx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);
    maskCtx.fill();

    // Apply blur in real-time for visual feedback
    if (mode === "blur") {
      applyBlurToArea(coords.x, coords.y);
    }
  };

  const applyBlurToArea = (x: number, y: number) => {
    if (!image) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Save the current state
    ctx.save();

    // Create a circular clipping path
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.clip();

    // Apply blur filter and redraw the image
    ctx.filter = `blur(${blurIntensity}px)`;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Restore the state
    ctx.restore();
  };

  const applyBlur = () => {
    if (!image) return;

    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;

    const ctx = canvas.getContext("2d");
    const maskCtx = maskCanvas.getContext("2d");

    if (!ctx || !maskCtx) return;

    // Create temporary canvas for blurred image
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    // Draw blurred image
    tempCtx.filter = `blur(${blurIntensity}px)`;
    tempCtx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Clear main canvas and draw original image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Use mask to composite blurred image
    ctx.save();
    const maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Create an image data from the temporary canvas
    const blurredData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
    const originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Blend based on mask
    for (let i = 0; i < maskData.data.length; i += 4) {
      const alpha = maskData.data[i + 3] / 255;
      originalData.data[i] = originalData.data[i] * (1 - alpha) + blurredData.data[i] * alpha;
      originalData.data[i + 1] = originalData.data[i + 1] * (1 - alpha) + blurredData.data[i + 1] * alpha;
      originalData.data[i + 2] = originalData.data[i + 2] * (1 - alpha) + blurredData.data[i + 2] * alpha;
    }

    ctx.putImageData(originalData, 0, 0);
    ctx.restore();

    // Notify parent
    onBlurComplete(canvas);
  };

  const reset = () => {
    if (!image) return;

    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;

    const ctx = canvas.getContext("2d");
    const maskCtx = maskCanvas.getContext("2d");

    if (!ctx || !maskCtx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

    onBlurComplete(canvas);
  };

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
        <canvas
          ref={maskCanvasRef}
          className="hidden"
        />
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Mode Selection */}
        <div className="flex gap-2">
          <Button
            variant={mode === "blur" ? "default" : "outline"}
            onClick={() => setMode("blur")}
            className="flex-1"
            data-testid="button-blur-mode"
          >
            <Paintbrush className="w-4 h-4 mr-2" />
            Blur
          </Button>
          <Button
            variant={mode === "erase" ? "default" : "outline"}
            onClick={() => setMode("erase")}
            className="flex-1"
            data-testid="button-erase-mode"
          >
            <Eraser className="w-4 h-4 mr-2" />
            Erase
          </Button>
          <Button
            variant="outline"
            onClick={reset}
            data-testid="button-reset-blur"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Brush Size */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
            <span>Brush Size</span>
            <span className="text-xs text-gray-500">{brushSize}px</span>
          </label>
          <Slider
            value={[brushSize]}
            onValueChange={(value) => setBrushSize(value[0])}
            min={10}
            max={100}
            step={5}
            className="w-full"
            data-testid="slider-brush-size"
          />
        </div>

        {/* Blur Intensity */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
            <span>Blur Intensity</span>
            <span className="text-xs text-gray-500">{blurIntensity}px</span>
          </label>
          <Slider
            value={[blurIntensity]}
            onValueChange={(value) => setBlurIntensity(value[0])}
            min={5}
            max={30}
            step={1}
            className="w-full"
            data-testid="slider-blur-intensity"
          />
        </div>

        <p className="text-xs text-gray-500 text-center">
          💡 Paint over areas you want to blur (like faces or backgrounds). Use the eraser to remove blur.
        </p>
      </div>
    </div>
  );
}
