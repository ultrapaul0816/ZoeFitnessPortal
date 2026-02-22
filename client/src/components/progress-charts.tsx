import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { BarChart3, Zap, Smile, Droplets, Heart, Wind, TrendingUp } from "lucide-react";

interface WeekData {
  weekStart: string;
  weekNumber: number;
  workoutDays: number;
  breathingDays: number;
  avgWater: number;
  avgCardio: number;
  avgEnergy: number;
  moodCounts: { great: number; good: number; okay: number; tired: number; struggling: number };
  totalCheckins: number;
}

interface HistoryResponse {
  weeks: WeekData[];
  totalWeeks: number;
  programSessions: Record<string, { workouts: number; cardio: number }>;
}

type TimeRange = "4" | "8" | "all";

const PINK = "#ec4899";
const ROSE = "#f43f5e";
const PURPLE = "#a855f7";
const BLUE = "#3b82f6";
const GREEN = "#22c55e";
const AMBER = "#f59e0b";
const ORANGE = "#f97316";

const moodColors = {
  great: "#22c55e",
  good: "#3b82f6",
  okay: "#f59e0b",
  tired: "#f97316",
  struggling: "#ef4444",
};

const moodEmojis: Record<string, string> = {
  great: "🤩",
  good: "😊",
  okay: "😐",
  tired: "😴",
  struggling: "😔",
};

function formatWeekLabel(weekStart: string) {
  const d = new Date(weekStart);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

interface ProgressChartsProps {
  userId: string;
}

export default function ProgressCharts({ userId }: ProgressChartsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("8");

  const { data, isLoading } = useQuery<HistoryResponse>({
    queryKey: [`/api/daily-checkins/${userId}/history`],
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500 mb-3" />
        <p className="text-gray-500 text-sm">Loading your trends...</p>
      </div>
    );
  }

  if (!data || data.totalWeeks < 2) {
    return (
      <Card className="p-6 md:p-10 text-center bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200">
        <div className="text-5xl mb-4">📊</div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Charts Coming Soon!</h3>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          Keep checking in! Your progress charts will appear after your second week of check-ins. 
          Every day you log brings you closer to seeing your amazing trends.
        </p>
        <div className="mt-4 text-xs text-gray-400">
          {data?.totalWeeks === 1 ? "1 week logged — just 1 more to go!" : "Start checking in daily to unlock charts"}
        </div>
      </Card>
    );
  }

  const weeks = timeRange === "all"
    ? data.weeks
    : data.weeks.slice(-parseInt(timeRange));

  const chartData = weeks.map(w => ({
    ...w,
    label: `Wk ${w.weekNumber}`,
    weekLabel: formatWeekLabel(w.weekStart),
  }));

  const moodData = weeks.map(w => ({
    label: `Wk ${w.weekNumber}`,
    weekLabel: formatWeekLabel(w.weekStart),
    ...w.moodCounts,
  }));

  const tooltipStyle = {
    contentStyle: {
      borderRadius: "12px",
      border: "1px solid #fce7f3",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      fontSize: "12px",
    },
  };

  return (
    <div className="space-y-4">
      {/* Time Range Selector */}
      <div className="flex gap-2 justify-center">
        {([
          ["4", "Last 4 Weeks"],
          ["8", "Last 8 Weeks"],
          ["all", "All Time"],
        ] as [TimeRange, string][]).map(([value, label]) => (
          <Button
            key={value}
            variant={timeRange === value ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(value)}
            className={timeRange === value
              ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 text-xs"
              : "border-pink-200 text-pink-600 hover:bg-pink-50 text-xs"
            }
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Workout Consistency */}
      <ChartCard
        title="Workout Consistency"
        subtitle="Days with workouts per week"
        icon={<BarChart3 className="w-4 h-4 text-white" />}
        gradient="from-pink-500 to-rose-500"
      >
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
            <XAxis dataKey="weekLabel" tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#9ca3af" domain={[0, 7]} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v} days`, "Workouts"]} />
            <Bar dataKey="workoutDays" fill={PINK} radius={[4, 4, 0, 0]} name="Workout Days" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Energy Trend */}
      <ChartCard
        title="Energy Trend"
        subtitle="Average energy level over time"
        icon={<Zap className="w-4 h-4 text-white" />}
        gradient="from-amber-500 to-orange-500"
      >
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={AMBER} stopOpacity={0.4} />
                <stop offset="95%" stopColor={AMBER} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
            <XAxis dataKey="weekLabel" tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v}/5`, "Avg Energy"]} />
            <Area type="monotone" dataKey="avgEnergy" stroke={AMBER} fill="url(#energyGradient)" strokeWidth={2.5} dot={{ fill: AMBER, r: 3 }} name="Avg Energy" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Mood Timeline */}
      <ChartCard
        title="Mood Timeline"
        subtitle="How you've been feeling each week"
        icon={<Smile className="w-4 h-4 text-white" />}
        gradient="from-green-500 to-emerald-500"
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={moodData} stackOffset="none">
            <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
            <XAxis dataKey="weekLabel" tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <Tooltip
              {...tooltipStyle}
              formatter={(v: number, name: string) => [`${v} days`, `${moodEmojis[name] || ""} ${name}`]}
            />
            <Bar dataKey="great" stackId="mood" fill={moodColors.great} radius={[0, 0, 0, 0]} />
            <Bar dataKey="good" stackId="mood" fill={moodColors.good} />
            <Bar dataKey="okay" stackId="mood" fill={moodColors.okay} />
            <Bar dataKey="tired" stackId="mood" fill={moodColors.tired} />
            <Bar dataKey="struggling" stackId="mood" fill={moodColors.struggling} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          {Object.entries(moodEmojis).map(([mood, emoji]) => (
            <span key={mood} className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: moodColors[mood as keyof typeof moodColors] }} />
              {emoji} {mood}
            </span>
          ))}
        </div>
      </ChartCard>

      {/* Water Intake Trend */}
      <ChartCard
        title="Water Intake"
        subtitle="Average glasses per day each week"
        icon={<Droplets className="w-4 h-4 text-white" />}
        gradient="from-blue-500 to-cyan-500"
      >
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
            <XAxis dataKey="weekLabel" tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v} glasses`, "Avg Water"]} />
            <Line type="monotone" dataKey="avgWater" stroke={BLUE} strokeWidth={2.5} dot={{ fill: BLUE, r: 3 }} name="Avg Water" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Cardio Trend */}
      <ChartCard
        title="Cardio Minutes"
        subtitle="Average daily cardio per week"
        icon={<Heart className="w-4 h-4 text-white" />}
        gradient="from-rose-500 to-red-500"
      >
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="cardioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ROSE} stopOpacity={0.3} />
                <stop offset="95%" stopColor={ROSE} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffe4e6" />
            <XAxis dataKey="weekLabel" tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v} min`, "Avg Cardio"]} />
            <Area type="monotone" dataKey="avgCardio" stroke={ROSE} fill="url(#cardioGradient)" strokeWidth={2.5} dot={{ fill: ROSE, r: 3 }} name="Avg Cardio" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Breathing Consistency */}
      <ChartCard
        title="Breathing Practice"
        subtitle="Days with breathing exercises per week"
        icon={<Wind className="w-4 h-4 text-white" />}
        gradient="from-purple-500 to-violet-500"
      >
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ede9fe" />
            <XAxis dataKey="weekLabel" tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#9ca3af" domain={[0, 7]} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v} days`, "Breathing"]} />
            <Bar dataKey="breathingDays" fill={PURPLE} radius={[4, 4, 0, 0]} name="Breathing Days" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, subtitle, icon, gradient, children }: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          <p className="text-[10px] text-gray-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </Card>
  );
}
