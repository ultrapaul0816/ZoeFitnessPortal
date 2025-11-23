import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Grid3X3, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface GridOverlayProps {
  isActive: boolean;
  onToggle: () => void;
  showControls?: boolean;
}

export function GridOverlay({ isActive, onToggle, showControls = true }: GridOverlayProps) {
  const [gridType, setGridType] = useState<"thirds" | "center">("thirds");

  return (
    <>
      {/* Grid Overlay */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {gridType === "thirds" ? (
            // Rule of Thirds Grid
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Vertical lines */}
              <line x1="33.33" y1="0" x2="33.33" y2="100" stroke="white" strokeWidth="0.3" opacity="0.7" />
              <line x1="66.66" y1="0" x2="66.66" y2="100" stroke="white" strokeWidth="0.3" opacity="0.7" />
              {/* Horizontal lines */}
              <line x1="0" y1="33.33" x2="100" y2="33.33" stroke="white" strokeWidth="0.3" opacity="0.7" />
              <line x1="0" y1="66.66" x2="100" y2="66.66" stroke="white" strokeWidth="0.3" opacity="0.7" />
              {/* Center point markers */}
              <circle cx="33.33" cy="33.33" r="0.8" fill="white" opacity="0.9" />
              <circle cx="66.66" cy="33.33" r="0.8" fill="white" opacity="0.9" />
              <circle cx="33.33" cy="66.66" r="0.8" fill="white" opacity="0.9" />
              <circle cx="66.66" cy="66.66" r="0.8" fill="white" opacity="0.9" />
            </svg>
          ) : (
            // Center Alignment Grid
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Center vertical line */}
              <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="0.4" opacity="0.8" />
              {/* Center horizontal line */}
              <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.4" opacity="0.8" />
              {/* Quarter lines for additional reference */}
              <line x1="25" y1="0" x2="25" y2="100" stroke="white" strokeWidth="0.2" opacity="0.5" strokeDasharray="2,2" />
              <line x1="75" y1="0" x2="75" y2="100" stroke="white" strokeWidth="0.2" opacity="0.5" strokeDasharray="2,2" />
              <line x1="0" y1="25" x2="100" y2="25" stroke="white" strokeWidth="0.2" opacity="0.5" strokeDasharray="2,2" />
              <line x1="0" y1="75" x2="100" y2="75" stroke="white" strokeWidth="0.2" opacity="0.5" strokeDasharray="2,2" />
              {/* Center crosshair */}
              <circle cx="50" cy="50" r="1.5" fill="none" stroke="white" strokeWidth="0.4" opacity="0.9" />
              <circle cx="50" cy="50" r="3" fill="none" stroke="white" strokeWidth="0.3" opacity="0.7" />
            </svg>
          )}
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          {isActive && (
            <div className="flex gap-1 bg-black/50 rounded-lg p-1 backdrop-blur-sm">
              <button
                onClick={() => setGridType("thirds")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded transition-colors",
                  gridType === "thirds"
                    ? "bg-white text-black"
                    : "text-white hover:bg-white/20"
                )}
                data-testid="button-grid-thirds"
              >
                Rule of Thirds
              </button>
              <button
                onClick={() => setGridType("center")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded transition-colors",
                  gridType === "center"
                    ? "bg-white text-black"
                    : "text-white hover:bg-white/20"
                )}
                data-testid="button-grid-center"
              >
                Center
              </button>
            </div>
          )}
          <Button
            onClick={onToggle}
            variant={isActive ? "default" : "outline"}
            size="sm"
            className={cn(
              "shadow-lg",
              isActive ? "bg-pink-600 hover:bg-pink-700" : "bg-white/90 hover:bg-white"
            )}
            data-testid="button-toggle-grid"
          >
            {isActive ? (
              <>
                <X className="w-4 h-4 mr-1" />
                Hide Grid
              </>
            ) : (
              <>
                <Grid3X3 className="w-4 h-4 mr-1" />
                Show Grid
              </>
            )}
          </Button>
        </div>
      )}

      {/* Help Text */}
      {isActive && showControls && (
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <div className="bg-black/60 backdrop-blur-sm text-white text-xs p-3 rounded-lg">
            <p className="font-medium mb-1">💡 Alignment Tips:</p>
            <ul className="space-y-0.5 text-white/90">
              <li>• Align your body with the center vertical line</li>
              <li>• Keep shoulders level with horizontal lines</li>
              <li>• Maintain consistent distance from camera</li>
              <li>• Use the same pose and position for all photos</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

interface GridOverlayWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function GridOverlayWrapper({ children, className }: GridOverlayWrapperProps) {
  const [showGrid, setShowGrid] = useState(false);

  return (
    <div className={cn("relative", className)}>
      {children}
      <GridOverlay isActive={showGrid} onToggle={() => setShowGrid(!showGrid)} />
    </div>
  );
}
