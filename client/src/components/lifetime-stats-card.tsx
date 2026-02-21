import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Flame, Calendar, Wind, Timer, Droplets, Star, Award } from "lucide-react";

interface LifetimeStats {
  totalCheckins: number;
  workoutDays: number;
  breathingDays: number;
  totalCardioMinutes: number;
  avgWaterIntake: number;
  longestStreak: number;
  totalWorkoutSessions: number;
  totalWorkoutsCompleted: number;
  avgChallengeRating: number;
  weeksCompleted: number;
  programCompletion: number;
  consistencyScore: number;
}

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current || target === 0) {
      setValue(target);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
}

function StatItem({
  icon,
  emoji,
  value,
  label,
  suffix,
  color,
}: {
  icon?: React.ReactNode;
  emoji: string;
  value: number;
  label: string;
  suffix?: string;
  color: string;
}) {
  const { value: animatedValue, ref } = useCountUp(value);

  const colorMap: Record<string, string> = {
    pink: "from-pink-500/10 to-rose-500/10 border-pink-200/60",
    orange: "from-orange-500/10 to-amber-500/10 border-orange-200/60",
    blue: "from-blue-500/10 to-indigo-500/10 border-blue-200/60",
    teal: "from-teal-500/10 to-emerald-500/10 border-teal-200/60",
    green: "from-green-500/10 to-emerald-500/10 border-green-200/60",
    cyan: "from-cyan-500/10 to-sky-500/10 border-cyan-200/60",
    yellow: "from-yellow-500/10 to-amber-500/10 border-yellow-200/60",
    purple: "from-purple-500/10 to-violet-500/10 border-purple-200/60",
  };

  return (
    <div
      ref={ref}
      className={`bg-gradient-to-br ${colorMap[color] || colorMap.pink} border rounded-xl p-3 flex flex-col items-center text-center gap-1 transition-transform hover:scale-105`}
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-2xl font-bold text-gray-900">
        {animatedValue}
        {suffix && <span className="text-sm font-medium text-gray-500">{suffix}</span>}
      </span>
      <span className="text-xs font-medium text-gray-600 leading-tight">{label}</span>
    </div>
  );
}

export default function LifetimeStatsCard({ userId }: { userId?: string }) {
  const resolvedUserId = userId || (() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) return JSON.parse(userData).id;
    } catch {}
    return null;
  })();

  const { data: stats, isLoading } = useQuery<LifetimeStats>({
    queryKey: ["/api/stats", resolvedUserId, "lifetime"],
    queryFn: async () => {
      const res = await fetch(`/api/stats/${resolvedUserId}/lifetime`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!resolvedUserId,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-pink-200/80">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-pink-100 rounded w-1/3" />
            <div className="grid grid-cols-2 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-24 bg-pink-100/50 rounded-xl" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <Card className="bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 border-pink-200/80 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-pink-500" />
          Your Lifetime Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatItem emoji="💪" value={stats.totalWorkoutsCompleted || stats.workoutDays} label="Total Workouts" color="pink" />
          <StatItem emoji="🔥" value={stats.longestStreak} label="Longest Streak" suffix=" d" color="orange" />
          <StatItem emoji="📅" value={stats.totalCheckins} label="Active Days" color="blue" />
          <StatItem emoji="🌬️" value={stats.breathingDays} label="Breathing Sessions" color="teal" />
          <StatItem emoji="🏃" value={stats.totalCardioMinutes} label="Cardio Minutes" suffix=" min" color="green" />
          <StatItem emoji="💧" value={stats.avgWaterIntake} label="Avg Daily Water" suffix=" gl" color="cyan" />
          <StatItem emoji="⭐" value={stats.consistencyScore} label="Consistency" suffix="%" color="yellow" />
          <StatItem emoji="🏆" value={stats.weeksCompleted} label={`of 6 Weeks Done`} color="purple" />
        </div>
      </CardContent>
    </Card>
  );
}
