import { useState, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import html2canvas from "html2canvas";
import { ArrowLeft, ChevronLeft, ChevronRight, Download, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MOOD_EMOJI: Record<string, string> = {
  great: "😄",
  good: "😊",
  okay: "😐",
  tired: "😴",
  struggling: "😞",
};

function getMotivationalMessage(consistencyScore: number, totalWorkouts: number) {
  if (consistencyScore >= 80) return "You're absolutely crushing it! Your consistency is inspiring! 🌟";
  if (consistencyScore >= 60) return "Amazing progress! You're building habits that will last a lifetime! 💪";
  if (consistencyScore >= 40) return "Every workout counts! You're showing up for yourself and that matters! ❤️";
  if (totalWorkouts > 0) return "You've taken the first steps — keep going, mama! You've got this! 🙌";
  return "A new month is a fresh start. Let's make it count together! 🌸";
}

interface MonthlyReportData {
  month: string;
  daysInMonth: number;
  totalWorkouts: number;
  totalBreathingSessions: number;
  totalCardioMinutes: number;
  avgWater: number;
  avgEnergy: number;
  moodBreakdown: Record<string, number>;
  streakStats: { bestStreak: number; currentStreak: number };
  activeDays: number;
  consistencyScore: number;
  measurementChanges: {
    drGap: { start: string; end: string } | null;
    coreConnection: { start: number; end: number; change: number } | null;
    backDiscomfort: { start: number; end: number; change: number } | null;
    energyLevel: { start: number; end: number; change: number } | null;
  } | null;
}

export default function MonthlyReport() {
  const [, navigate] = useLocation();
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [isSharing, setIsSharing] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
  const monthLabel = `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`;

  // Get userId from session
  const { data: session } = useQuery<{ userId: string }>({
    queryKey: ["/api/auth/session"],
  });

  const userId = session?.userId;

  const { data, isLoading, error } = useQuery<MonthlyReportData>({
    queryKey: [`/api/reports/${userId}/monthly`, monthKey],
    queryFn: async () => {
      const res = await fetch(`/api/reports/${userId}/monthly?month=${monthKey}`);
      if (!res.ok) throw new Error("Failed to load report");
      return res.json();
    },
    enabled: !!userId,
  });

  const goToPrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1;
    if (isCurrentMonth) return;
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  const handleShare = useCallback(async () => {
    if (!reportRef.current) return;
    setIsSharing(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        width: 390,
        height: 693,
        windowWidth: 390,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `monthly-report-${monthKey}.png`, { type: "image/png" });
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: `${monthLabel} — My Progress Report` });
          } catch {
            downloadBlob(blob);
          }
        } else {
          downloadBlob(blob);
        }
        setIsSharing(false);
      }, "image/png");
    } catch {
      setIsSharing(false);
    }
  }, [monthKey, monthLabel]);

  const downloadBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monthly-report-${monthKey}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Dominant mood
  const dominantMood = data?.moodBreakdown
    ? Object.entries(data.moodBreakdown).sort((a, b) => b[1] - a[1])[0]
    : null;
  const totalMoodEntries = data?.moodBreakdown
    ? Object.values(data.moodBreakdown).reduce((a, b) => a + b, 0)
    : 0;
  const dominantMoodPct = dominantMood && totalMoodEntries
    ? Math.round((dominantMood[1] / totalMoodEntries) * 100)
    : 0;

  const hasMeasurements = data?.measurementChanges && (
    data.measurementChanges.drGap ||
    data.measurementChanges.coreConnection ||
    data.measurementChanges.backDiscomfort
  );

  const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pb-24">
      {/* Navigation */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-pink-100 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate("/progress")} className="text-pink-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-semibold text-gray-800">Monthly Report</h1>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleShare}
          disabled={isSharing || isLoading || !data}
          className="text-pink-600"
        >
          {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
        </Button>
      </div>

      {/* Month selector */}
      <div className="flex items-center justify-center gap-4 py-4">
        <button onClick={goToPrevMonth} className="p-2 rounded-full hover:bg-pink-100 text-pink-600">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-lg font-semibold text-gray-800 min-w-[180px] text-center">{monthLabel}</span>
        <button
          onClick={goToNextMonth}
          disabled={isCurrentMonth}
          className={`p-2 rounded-full hover:bg-pink-100 ${isCurrentMonth ? "text-gray-300" : "text-pink-600"}`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-gray-500">
          <p>Could not load report for this month.</p>
        </div>
      )}

      {data && (
        <>
          {/* Shareable Report Card */}
          <div className="px-4">
            <div
              ref={reportRef}
              className="mx-auto rounded-3xl overflow-hidden shadow-2xl"
              style={{
                maxWidth: 390,
                background: "linear-gradient(165deg, #fdf2f8 0%, #fce7f3 30%, #fbcfe8 60%, #f9a8d4 100%)",
              }}
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-4 text-center">
                <p className="text-xs font-medium tracking-widest text-pink-400 uppercase mb-1">Stronger With Zoe</p>
                <h2 className="text-xl font-bold text-gray-800">{monthLabel}</h2>
                <p className="text-sm text-pink-600 font-medium">Your Progress Report ✨</p>
              </div>

              {/* Key Metrics Grid */}
              <div className="px-5 pb-4">
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard emoji="💪" label="Workouts" value={String(data.totalWorkouts)} />
                  <MetricCard emoji="🔥" label="Best Streak" value={`${data.streakStats.bestStreak} days`} />
                  <MetricCard emoji="📅" label="Active Days" value={`${data.activeDays} / ${data.daysInMonth}`} />
                  <MetricCard emoji="⭐" label="Consistency" value={`${data.consistencyScore}%`} />
                </div>
              </div>

              {/* Extra stats row */}
              <div className="px-5 pb-4">
                <div className="grid grid-cols-3 gap-2">
                  <MiniStat emoji="🫁" label="Breathing" value={String(data.totalBreathingSessions)} />
                  <MiniStat emoji="🚶‍♀️" label="Cardio" value={`${data.totalCardioMinutes}m`} />
                  <MiniStat emoji="💧" label="Avg Water" value={`${data.avgWater}`} />
                </div>
              </div>

              {/* Measurement Changes — HERO section */}
              {hasMeasurements && (
                <div className="px-5 pb-4">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-pink-200/50">
                    <p className="text-xs font-semibold text-pink-500 uppercase tracking-wider mb-3 text-center">
                      Your Transformation 🎉
                    </p>
                    <div className="space-y-2.5">
                      {data.measurementChanges!.drGap && data.measurementChanges!.drGap.start !== data.measurementChanges!.drGap.end && (
                        <MeasurementRow
                          label="DR Gap"
                          start={data.measurementChanges!.drGap.start}
                          end={data.measurementChanges!.drGap.end}
                          emoji="🎉"
                        />
                      )}
                      {data.measurementChanges!.coreConnection && data.measurementChanges!.coreConnection.change !== 0 && (
                        <MeasurementRow
                          label="Core Connection"
                          start={String(data.measurementChanges!.coreConnection.start)}
                          end={String(data.measurementChanges!.coreConnection.end)}
                          change={data.measurementChanges!.coreConnection.change}
                          positive
                          emoji="💪"
                        />
                      )}
                      {data.measurementChanges!.backDiscomfort && data.measurementChanges!.backDiscomfort.change !== 0 && (
                        <MeasurementRow
                          label="Back Discomfort"
                          start={String(data.measurementChanges!.backDiscomfort.start)}
                          end={String(data.measurementChanges!.backDiscomfort.end)}
                          change={data.measurementChanges!.backDiscomfort.change}
                          positive={false}
                          emoji="✨"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Mood summary */}
              {dominantMood && (
                <div className="px-5 pb-4">
                  <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-3 text-center border border-pink-200/30">
                    <span className="text-2xl">{MOOD_EMOJI[dominantMood[0]] || "😊"}</span>
                    <p className="text-xs text-gray-600 mt-1">
                      You felt <span className="font-semibold">{dominantMood[0]}</span> {dominantMoodPct}% of the time!
                    </p>
                  </div>
                </div>
              )}

              {/* Motivational message */}
              <div className="px-5 pb-6">
                <p className="text-center text-sm text-pink-700 font-medium italic leading-relaxed">
                  "{getMotivationalMessage(data.consistencyScore, data.totalWorkouts)}"
                </p>
              </div>

              {/* Footer branding */}
              <div className="bg-pink-600/10 px-5 py-3 text-center">
                <p className="text-[10px] text-pink-400 font-medium tracking-wider uppercase">
                  strongerwithzoe.com • Heal Your Core
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons below the card */}
          <div className="px-4 mt-6 flex gap-3 max-w-[390px] mx-auto">
            <Button
              onClick={handleShare}
              disabled={isSharing}
              className="flex-1 bg-pink-600 hover:bg-pink-700 text-white rounded-xl h-12"
            >
              {isSharing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Share2 className="w-4 h-4 mr-2" />
              )}
              Share to Stories
            </Button>
            <Button
              onClick={() => {
                if (!reportRef.current) return;
                setIsSharing(true);
                html2canvas(reportRef.current, { backgroundColor: null, scale: 2, width: 390, height: 693, windowWidth: 390 }).then(c => {
                  c.toBlob(b => {
                    if (b) downloadBlob(b);
                    setIsSharing(false);
                  }, "image/png");
                }).catch(() => setIsSharing(false));
              }}
              variant="outline"
              className="rounded-xl h-12 border-pink-200 text-pink-600"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3.5 text-center border border-pink-200/30 shadow-sm">
      <span className="text-xl">{emoji}</span>
      <p className="text-lg font-bold text-gray-800 mt-1">{value}</p>
      <p className="text-[11px] text-gray-500 font-medium">{label}</p>
    </div>
  );
}

function MiniStat({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-xl p-2.5 text-center border border-pink-200/20">
      <span className="text-sm">{emoji}</span>
      <p className="text-sm font-bold text-gray-700">{value}</p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  );
}

function MeasurementRow({
  label,
  start,
  end,
  change,
  positive,
  emoji,
}: {
  label: string;
  start: string;
  end: string;
  change?: number;
  positive?: boolean;
  emoji: string;
}) {
  const changeText = change != null
    ? `(${change > 0 ? "+" : ""}${change})`
    : "";
  const isImprovement = change != null
    ? (positive ? change > 0 : change < 0)
    : start !== end;

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-gray-600">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400">{start}</span>
        <span className="text-xs text-gray-400">→</span>
        <span className={`text-xs font-bold ${isImprovement ? "text-green-600" : "text-gray-700"}`}>
          {end} {changeText}
        </span>
        {isImprovement && <span className="text-xs">{emoji}</span>}
      </div>
    </div>
  );
}
