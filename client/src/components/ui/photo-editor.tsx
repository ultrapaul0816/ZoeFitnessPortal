import { useState, useCallback, useRef, useEffect } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Crop, RotateCw, Sun, Contrast, Check, X, Shield, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlurTool } from "@/components/ui/blur-tool";
import { AnnotationTool } from "@/components/ui/annotation-tool";
import { GridOverlay } from "@/components/ui/grid-overlay";

interface PhotoEditorProps {
  imageUrl: string;
  onSave: (editedImageBlob: Blob) => void;
  onCancel: () => void;
  isOpen: boolean;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function PhotoEditor({ imageUrl, onSave, onCancel, isOpen }: PhotoEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [activeTab, setActiveTab] = useState<"crop" | "adjust" | "privacy" | "annotate">("crop");
  const [isProcessing, setIsProcessing] = useState(false);
  const [intermediateImage, setIntermediateImage] = useState<string | null>(null);
  const [blurredCanvas, setBlurredCanvas] = useState<HTMLCanvasElement | null>(null);
  const [annotatedCanvas, setAnnotatedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [showGrid, setShowGrid] = useState(false);

  const onCropComplete = useCallback((_: CropArea, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: CropArea,
    rotation: number,
    brightness: number,
    contrast: number
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    // Apply brightness and contrast
    if (brightness !== 100 || contrast !== 100) {
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) {
        tempCtx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
        tempCtx.drawImage(canvas, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.filter = "none";
        ctx.drawImage(tempCanvas, 0, 0);
      }
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, "image/jpeg", 0.95);
    });
  };

  const generateIntermediateImage = async () => {
    if (!croppedAreaPixels) return;
    
    try {
      const croppedImage = await getCroppedImg(
        imageUrl,
        croppedAreaPixels,
        rotation,
        brightness,
        contrast
      );
      
      // Convert blob to data URL for blur tool
      const reader = new FileReader();
      reader.onloadend = () => {
        setIntermediateImage(reader.result as string);
      };
      reader.readAsDataURL(croppedImage);
    } catch (e) {
      console.error("Error generating intermediate image:", e);
    }
  };

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      // Priority: annotated > blurred > cropped/adjusted
      if (annotatedCanvas) {
        const blob = await new Promise<Blob>((resolve) => {
          annotatedCanvas.toBlob((blob) => {
            if (blob) resolve(blob);
          }, "image/jpeg", 0.95);
        });
        onSave(blob);
      } else if (blurredCanvas) {
        const blob = await new Promise<Blob>((resolve) => {
          blurredCanvas.toBlob((blob) => {
            if (blob) resolve(blob);
          }, "image/jpeg", 0.95);
        });
        onSave(blob);
      } else {
        // Otherwise use cropped/adjusted image
        if (!croppedAreaPixels) return;
        const croppedImage = await getCroppedImg(
          imageUrl,
          croppedAreaPixels,
          rotation,
          brightness,
          contrast
        );
        onSave(croppedImage);
      }
    } catch (e) {
      console.error("Error processing image:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
            ✨ Edit Your Photo
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Tab Navigation */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab("crop")}
              className={cn(
                "px-4 py-2 font-medium text-sm border-b-2 transition-colors",
                activeTab === "crop"
                  ? "border-pink-600 text-pink-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
              data-testid="tab-crop"
            >
              <Crop className="w-4 h-4 inline mr-2" />
              Crop & Rotate
            </button>
            <button
              onClick={() => setActiveTab("adjust")}
              className={cn(
                "px-4 py-2 font-medium text-sm border-b-2 transition-colors",
                activeTab === "adjust"
                  ? "border-pink-600 text-pink-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
              data-testid="tab-adjust"
            >
              <Sun className="w-4 h-4 inline mr-2" />
              Adjust
            </button>
            <button
              onClick={() => {
                setActiveTab("privacy");
                generateIntermediateImage();
              }}
              className={cn(
                "px-4 py-2 font-medium text-sm border-b-2 transition-colors",
                activeTab === "privacy"
                  ? "border-pink-600 text-pink-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
              data-testid="tab-privacy"
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Privacy
            </button>
            <button
              onClick={() => {
                setActiveTab("annotate");
                generateIntermediateImage();
              }}
              className={cn(
                "px-4 py-2 font-medium text-sm border-b-2 transition-colors",
                activeTab === "annotate"
                  ? "border-pink-600 text-pink-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
              data-testid="tab-annotate"
            >
              <Pencil className="w-4 h-4 inline mr-2" />
              Annotate
            </button>
          </div>

          {/* Cropper Area / Blur Tool / Annotation Tool */}
          {activeTab === "privacy" && intermediateImage ? (
            <BlurTool
              imageUrl={intermediateImage}
              onBlurComplete={setBlurredCanvas}
              width={800}
              height={1067}
            />
          ) : activeTab === "annotate" && intermediateImage ? (
            <AnnotationTool
              imageUrl={intermediateImage}
              onAnnotationComplete={setAnnotatedCanvas}
              width={800}
              height={1067}
            />
          ) : (
            <>
              <div className="relative w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden">
                <Cropper
                  image={imageUrl}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={3 / 4}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  style={{
                    containerStyle: {
                      filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                    },
                  }}
                />
                <GridOverlay isActive={showGrid} onToggle={() => setShowGrid(!showGrid)} />
              </div>

              {/* Controls */}
              <Card className="p-4 space-y-4">
                {activeTab === "crop" ? (
              <>
                {/* Zoom Control */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                    <span>Zoom</span>
                    <span className="text-xs text-gray-500">{Math.round(zoom * 100)}%</span>
                  </label>
                  <Slider
                    value={[zoom]}
                    onValueChange={(value) => setZoom(value[0])}
                    min={1}
                    max={3}
                    step={0.1}
                    className="w-full"
                    data-testid="slider-zoom"
                  />
                </div>

                {/* Rotate Button */}
                <Button
                  onClick={handleRotate}
                  variant="outline"
                  className="w-full"
                  data-testid="button-rotate"
                >
                  <RotateCw className="w-4 h-4 mr-2" />
                  Rotate 90°
                </Button>
              </>
            ) : (
              <>
                {/* Brightness Control */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Brightness
                    </span>
                    <span className="text-xs text-gray-500">{brightness}%</span>
                  </label>
                  <Slider
                    value={[brightness]}
                    onValueChange={(value) => setBrightness(value[0])}
                    min={50}
                    max={150}
                    step={1}
                    className="w-full"
                    data-testid="slider-brightness"
                  />
                </div>

                {/* Contrast Control */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Contrast className="w-4 h-4" />
                      Contrast
                    </span>
                    <span className="text-xs text-gray-500">{contrast}%</span>
                  </label>
                  <Slider
                    value={[contrast]}
                    onValueChange={(value) => setContrast(value[0])}
                    min={50}
                    max={150}
                    step={1}
                    className="w-full"
                    data-testid="slider-contrast"
                  />
                </div>
              </>
                )}
              </Card>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1"
              data-testid="button-reset"
            >
              Reset
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
              data-testid="button-cancel"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
              data-testid="button-save"
            >
              <Check className="w-4 h-4 mr-2" />
              {isProcessing ? "Processing..." : "Apply"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
