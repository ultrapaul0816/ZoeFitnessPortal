import { useState, useRef, useCallback } from "react";
import html2canvas from "html2canvas";
import { Download, Share2, Camera, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { workoutPrograms } from "@/data/workoutPrograms";

// Map Tailwind color classes to actual CSS colors for the card
const colorMap: Record<string, { gradient: string[]; accent: string; text: string; bg: string }> = {
  "border-pink-400": {
    gradient: ["#ec4899", "#f43f5e", "#fb7185"],
    accent: "#ec4899",
    text: "#be185d",
    bg: "#fdf2f8",
  },
  "border-cyan-400": {
    gradient: ["#06b6d4", "#0891b2", "#67e8f9"],
    accent: "#06b6d4",
    text: "#0e7490",
    bg: "#ecfeff",
  },
  "border-emerald-400": {
    gradient: ["#10b981", "#059669", "#6ee7b7"],
    accent: "#10b981",
    text: "#047857",
    bg: "#ecfdf5",
  },
  "border-violet-400": {
    gradient: ["#8b5cf6", "#7c3aed", "#c4b5fd"],
    accent: "#8b5cf6",
    text: "#6d28d9",
    bg: "#f5f3ff",
  },
  "border-indigo-400": {
    gradient: ["#6366f1", "#4f46e5", "#a5b4fc"],
    accent: "#6366f1",
    text: "#4338ca",
    bg: "#eef2ff",
  },
  "border-amber-400": {
    gradient: ["#f59e0b", "#d97706", "#fcd34d"],
    accent: "#f59e0b",
    text: "#b45309",
    bg: "#fffbeb",
  },
};

const motivationalQuotes = [
  "Every rep is healing 💗",
  "Stronger than yesterday 💪",
  "You showed up. That's everything.",
  "Progress, not perfection ✨",
  "Your body is thanking you 🙏",
  "One day at a time, mama 💕",
  "Building strength from within 🌱",
  "You're doing amazing things 🌟",
];

interface WorkoutShareCardProps {
  streak: number;
  waterLiters: number;
  breathingDone: boolean;
  cardioMinutes: number;
  workoutDay: number;
  totalDaysThisWeek: number;
  programWeek: number;
  onClose: () => void;
}

export default function WorkoutShareCard({
  streak,
  waterLiters,
  breathingDone,
  cardioMinutes,
  workoutDay,
  totalDaysThisWeek,
  programWeek,
  onClose,
}: WorkoutShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quote] = useState(
    () => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
  );

  const program = workoutPrograms[Math.min(programWeek - 1, workoutPrograms.length - 1)] || workoutPrograms[0];
  const colors = colorMap[program.colorScheme.borderColor] || colorMap["border-pink-400"];
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const weekTitle = program.title.replace(/^PROGRAM \d+ - /, "");

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelfieUrl(url);
    }
  };

  const generateImage = useCallback(async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
      });
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleDownload = async () => {
    const blob = await generateImage();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stronger-with-zoe-${new Date().toISOString().split("T")[0]}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const blob = await generateImage();
    if (!blob) return;
    const file = new File([blob], "workout.png", { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Stronger With Zoe",
          text: "Check out my workout progress! 💪",
        });
      } catch {
        // User cancelled share
      }
    } else {
      // Fallback to download
      await handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm flex flex-col items-center gap-4 max-h-[90vh] overflow-y-auto">
        {/* The actual card that gets captured */}
        <div
          ref={cardRef}
          style={{
            width: 360,
            minHeight: 640,
            background: selfieUrl
              ? undefined
              : `linear-gradient(135deg, ${colors.gradient[0]}22, ${colors.gradient[1]}33, ${colors.gradient[2]}22)`,
            position: "relative",
            overflow: "hidden",
            borderRadius: 24,
            fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          }}
        >
          {/* Selfie background */}
          {selfieUrl && (
            <>
              <img
                src={selfieUrl}
                alt=""
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                crossOrigin="anonymous"
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))",
                }}
              />
            </>
          )}

          {/* Decorative circles */}
          {!selfieUrl && (
            <>
              <div
                style={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  width: 160,
                  height: 160,
                  borderRadius: "50%",
                  background: `${colors.gradient[0]}15`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: -20,
                  left: -20,
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: `${colors.gradient[1]}15`,
                }}
              />
            </>
          )}

          <div
            style={{
              position: "relative",
              zIndex: 1,
              padding: 32,
              display: "flex",
              flexDirection: "column",
              minHeight: 640,
              justifyContent: "space-between",
            }}
          >
            {/* Top: Branding */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 3,
                  textTransform: "uppercase" as const,
                  color: selfieUrl ? "rgba(255,255,255,0.7)" : colors.accent,
                  marginBottom: 4,
                }}
              >
                Stronger With Zoe
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: selfieUrl ? "rgba(255,255,255,0.5)" : "#9ca3af",
                }}
              >
                {today}
              </div>
            </div>

            {/* Middle: Week + Stats */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
              {/* Program Week */}
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: 2,
                    textTransform: "uppercase" as const,
                    color: selfieUrl ? "rgba(255,255,255,0.6)" : colors.accent,
                    marginBottom: 6,
                  }}
                >
                  WEEK {programWeek}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: selfieUrl ? "#fff" : colors.text,
                    lineHeight: 1.2,
                  }}
                >
                  {weekTitle}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    color: selfieUrl ? "rgba(255,255,255,0.8)" : "#6b7280",
                    marginTop: 8,
                    fontWeight: 500,
                  }}
                >
                  Day {workoutDay} of {totalDaysThisWeek} this week ✅
                </div>
              </div>

              {/* Stats Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                {[
                  { emoji: "🔥", label: "Streak", value: `${streak} days` },
                  { emoji: "💧", label: "Water", value: `${waterLiters.toFixed(1)}L` },
                  { emoji: "🌬️", label: "Breathing", value: breathingDone ? "Done ✓" : "—" },
                  { emoji: "🏃", label: "Cardio", value: `${cardioMinutes} min` },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      background: selfieUrl ? "rgba(255,255,255,0.15)" : `${colors.gradient[0]}10`,
                      backdropFilter: selfieUrl ? "blur(10px)" : undefined,
                      borderRadius: 16,
                      padding: "16px 12px",
                      textAlign: "center",
                      border: selfieUrl
                        ? "1px solid rgba(255,255,255,0.2)"
                        : `1px solid ${colors.gradient[0]}20`,
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 4 }}>{stat.emoji}</div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: selfieUrl ? "#fff" : colors.text,
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: selfieUrl ? "rgba(255,255,255,0.6)" : "#9ca3af",
                        fontWeight: 500,
                        textTransform: "uppercase" as const,
                        letterSpacing: 1,
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Motivational Quote */}
              <div
                style={{
                  textAlign: "center",
                  fontSize: 16,
                  fontStyle: "italic",
                  color: selfieUrl ? "rgba(255,255,255,0.8)" : "#6b7280",
                  fontWeight: 500,
                  padding: "0 8px",
                }}
              >
                "{quote}"
              </div>
            </div>

            {/* Bottom: Subtle branding */}
            <div
              style={{
                textAlign: "center",
                fontSize: 10,
                color: selfieUrl ? "rgba(255,255,255,0.4)" : "#d1d5db",
                letterSpacing: 1,
                fontWeight: 500,
              }}
            >
              strongerwithzoe.com
            </div>
          </div>
        </div>

        {/* Action Buttons (outside the captured card) */}
        <div className="flex flex-col gap-2 w-full max-w-[360px]">
          {/* Add Photo button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoSelect}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-white/90 border-white/50 text-gray-700 hover:bg-white"
          >
            <Camera className="w-4 h-4 mr-2" />
            {selfieUrl ? "Change Photo" : "Add Your Photo"}
          </Button>

          <div className="flex gap-2 w-full">
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex-1 bg-white/90 text-gray-700 hover:bg-white border border-white/50"
              variant="outline"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Download
            </Button>
            <Button
              onClick={handleShare}
              disabled={isGenerating}
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4 mr-2" />
              )}
              Share
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
