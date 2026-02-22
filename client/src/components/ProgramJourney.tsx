import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { workoutPrograms } from "@/data/workoutPrograms";
import { ChevronDown, ChevronUp, CheckCircle2, Clock, SkipForward, MapPin, Lock, Dumbbell, Heart, Activity, Zap, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeekJourneyData {
  week: number;
  title: string;
  subtitle: string;
  workoutsCompleted: number;
  workoutsTotal: number;
  cardioCompleted: number;
  cardioTotal: number;
  measurements: {
    drGap: string | null;
    coreScore: number | null;
    backDiscomfort: number | null;
    energy: number | null;
  };
  checkinDays: number;
  status: "complete" | "in-progress" | "upcoming" | "skipped";
  isCurrentWeek: boolean;
}

interface ProgramRound {
  roundNumber: number;
  startDate: string;
  endDate: string | null;
  label: string;
}

interface JourneyResponse {
  weeks: WeekJourneyData[];
  currentRound: number;
  rounds: ProgramRound[];
  overallProgress: number;
  currentWeek: number;
}

function StatusBadge({ status }: { status: WeekJourneyData["status"] }) {
  const config = {
    complete: { label: "Complete", icon: CheckCircle2, className: "bg-green-100 text-green-700 border-green-200" },
    "in-progress": { label: "In Progress", icon: Clock, className: "bg-blue-100 text-blue-700 border-blue-200" },
    upcoming: { label: "Upcoming", icon: Lock, className: "bg-gray-100 text-gray-500 border-gray-200" },
    skipped: { label: "Skipped", icon: SkipForward, className: "bg-amber-100 text-amber-700 border-amber-200" },
  };
  const c = config[status];
  const Icon = c.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", c.className)}>
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

function WeekCard({ data, colorScheme, isExpanded, onToggle }: {
  data: WeekJourneyData;
  colorScheme: typeof workoutPrograms[0]["colorScheme"];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const isFuture = data.status === "upcoming";
  const isCurrent = data.isCurrentWeek;

  return (
    <div
      className={cn(
        "rounded-2xl border-2 transition-all duration-300 cursor-pointer",
        isCurrent ? "ring-2 ring-pink-400 ring-offset-2 scale-[1.02]" : "",
        isFuture ? "opacity-60" : "",
        data.status === "complete" ? "opacity-90" : "",
        colorScheme.borderColor,
        colorScheme.bgColor,
      )}
      onClick={onToggle}
    >
      {/* Current week indicator */}
      {isCurrent && (
        <div className="flex items-center justify-center gap-1 bg-pink-500 text-white text-xs font-bold py-1 rounded-t-xl -mt-px -mx-px">
          <MapPin className="w-3 h-3" />
          YOU ARE HERE
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className={cn("text-sm font-bold uppercase tracking-wide", colorScheme.textColor)}>
              Week {data.week}
            </div>
            <div className="text-xs text-gray-600 mt-0.5 truncate">{data.subtitle}</div>
          </div>
          <div className="flex items-center gap-2 ml-2 shrink-0">
            <StatusBadge status={data.status} />
            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex gap-3 mt-3">
          <div className="flex items-center gap-1 text-xs">
            <Dumbbell className="w-3.5 h-3.5 text-gray-500" />
            <span className="font-semibold">{data.workoutsCompleted}/{data.workoutsTotal}</span>
            <span className="text-gray-500">workouts</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Heart className="w-3.5 h-3.5 text-gray-500" />
            <span className="font-semibold">{data.cardioCompleted}/{data.cardioTotal}</span>
            <span className="text-gray-500">cardio</span>
          </div>
        </div>

        {/* Progress bar for this week */}
        {!isFuture && (
          <div className="mt-3">
            <div className="h-2 bg-white/60 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  data.status === "complete" ? "bg-green-500" : "bg-pink-500"
                )}
                style={{ width: `${Math.round((data.workoutsCompleted / data.workoutsTotal) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Expanded details */}
        {isExpanded && !isFuture && (
          <div className="mt-4 pt-3 border-t border-black/10 space-y-3 animate-in slide-in-from-top-2 duration-200">
            {/* Measurements */}
            {(data.measurements.drGap || data.measurements.coreScore || data.measurements.backDiscomfort || data.measurements.energy) && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1.5">📊 Measurements</div>
                <div className="grid grid-cols-2 gap-2">
                  {data.measurements.drGap && (
                    <div className="bg-white/70 rounded-lg px-2.5 py-1.5">
                      <div className="text-[10px] text-gray-500 uppercase">DR Gap</div>
                      <div className="text-sm font-semibold">{data.measurements.drGap}</div>
                    </div>
                  )}
                  {data.measurements.coreScore && (
                    <div className="bg-white/70 rounded-lg px-2.5 py-1.5">
                      <div className="text-[10px] text-gray-500 uppercase flex items-center gap-1"><Activity className="w-3 h-3" />Core</div>
                      <div className="text-sm font-semibold">{data.measurements.coreScore}/10</div>
                    </div>
                  )}
                  {data.measurements.backDiscomfort && (
                    <div className="bg-white/70 rounded-lg px-2.5 py-1.5">
                      <div className="text-[10px] text-gray-500 uppercase">Back</div>
                      <div className="text-sm font-semibold">{data.measurements.backDiscomfort}/10</div>
                    </div>
                  )}
                  {data.measurements.energy && (
                    <div className="bg-white/70 rounded-lg px-2.5 py-1.5">
                      <div className="text-[10px] text-gray-500 uppercase flex items-center gap-1"><Zap className="w-3 h-3" />Energy</div>
                      <div className="text-sm font-semibold">{data.measurements.energy}/10</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Check-in days */}
            {data.checkinDays > 0 && (
              <div className="text-xs text-gray-600">
                ✅ Checked in <span className="font-semibold">{data.checkinDays}</span> day{data.checkinDays !== 1 ? "s" : ""} this week
              </div>
            )}
          </div>
        )}

        {isExpanded && isFuture && (
          <div className="mt-4 pt-3 border-t border-black/10 text-center">
            <Lock className="w-5 h-5 mx-auto text-gray-400 mb-1" />
            <p className="text-xs text-gray-500">Complete previous weeks to unlock</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProgramJourney() {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);

  const { data: journey, isLoading, error } = useQuery<JourneyResponse>({
    queryKey: ["/api/program-journey", selectedRound],
    queryFn: async () => {
      const params = selectedRound ? `?round=${selectedRound}` : "";
      const res = await fetch(`/api/program-journey${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load journey");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500 mb-3" />
        <p className="text-gray-500 text-sm">Loading your journey...</p>
      </div>
    );
  }

  if (error || !journey) {
    return (
      <div className="text-center py-16 px-4">
        <p className="text-gray-500">Unable to load your program journey.</p>
        <p className="text-xs text-gray-400 mt-1">Please try again later.</p>
      </div>
    );
  }

  const completedWeeks = journey.weeks.filter(w => w.status === "complete").length;
  const progressPercent = Math.round((completedWeeks / 6) * 100);

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <a href="/dashboard" className="text-gray-400 hover:text-pink-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <h1 className="text-xl font-bold text-gray-900">My Journey</h1>
        </div>
        <p className="text-sm text-gray-500 ml-7">Heal Your Core — 6 Week Program</p>
      </div>

      {/* Round selector */}
      {journey.rounds.length > 1 && (
        <div className="px-4 mt-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {journey.rounds.map((round) => (
              <button
                key={round.roundNumber}
                onClick={() => setSelectedRound(round.roundNumber)}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  (selectedRound ?? journey.currentRound) === round.roundNumber
                    ? "bg-pink-500 text-white border-pink-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-pink-300"
                )}
              >
                {round.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overall progress */}
      <div className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-800">
            Week {journey.currentWeek} of 6
          </span>
          <span className="text-sm font-bold text-pink-600">{progressPercent}% complete</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          {[1, 2, 3, 4, 5, 6].map(w => {
            const week = journey.weeks.find(wk => wk.week === w);
            return (
              <div key={w} className="flex flex-col items-center">
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold",
                  week?.status === "complete" ? "bg-green-500 text-white" :
                  week?.isCurrentWeek ? "bg-pink-500 text-white" :
                  "bg-gray-200 text-gray-500"
                )}>
                  {week?.status === "complete" ? "✓" : w}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Week cards - vertical timeline */}
      <div className="px-4 mt-5 space-y-3">
        {journey.weeks.map((weekData) => {
          const program = workoutPrograms.find(p => p.week === weekData.week);
          const colorScheme = program?.colorScheme ?? workoutPrograms[0].colorScheme;

          return (
            <WeekCard
              key={weekData.week}
              data={weekData}
              colorScheme={colorScheme}
              isExpanded={expandedWeek === weekData.week}
              onToggle={() => setExpandedWeek(expandedWeek === weekData.week ? null : weekData.week)}
            />
          );
        })}
      </div>

      {/* Motivational footer */}
      {completedWeeks > 0 && (
        <div className="mx-4 mt-6 text-center">
          <p className="text-sm text-gray-600">
            {completedWeeks === 6
              ? "🎉 You've completed the full program! Amazing work!"
              : `💪 ${completedWeeks} week${completedWeeks !== 1 ? "s" : ""} done — keep going, mama!`}
          </p>
        </div>
      )}
    </div>
  );
}
