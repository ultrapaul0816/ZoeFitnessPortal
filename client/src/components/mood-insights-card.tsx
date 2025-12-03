import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Zap, TrendingUp, TrendingDown, Minus, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

interface MoodInsightsCardProps {
  userId?: string;
  compact?: boolean;
  defaultCollapsed?: boolean;
}

interface CheckinStats {
  totalCheckins: number;
  workoutDays: number;
  breathingDays: number;
  avgWaterGlasses: number;
  avgCardioMinutes: number;
  currentStreak: number;
  moodDistribution?: { mood: string; count: number; emoji: string }[];
  avgEnergyLevel?: number;
  energyTrend?: 'up' | 'down' | 'stable';
  recentMoods?: { date: string; mood: string | null; energyLevel: number | null }[];
}

export default function MoodInsightsCard({ userId: propUserId, compact = false, defaultCollapsed = false }: MoodInsightsCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  
  const userId = propUserId || (() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        return JSON.parse(userData).id;
      }
    } catch {}
    return null;
  })();

  // Auto-collapse after 1 second on initial load
  useEffect(() => {
    if (!defaultCollapsed) {
      const timer = setTimeout(() => {
        setIsCollapsed(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [defaultCollapsed]);

  const { data: stats, isLoading } = useQuery<CheckinStats>({
    queryKey: ["/api/daily-checkins", userId, "stats"],
    enabled: !!userId,
  });

  if (isLoading || !stats) {
    return null;
  }

  const hasMoodData = stats.moodDistribution && stats.moodDistribution.length > 0;
  const hasEnergyData = stats.avgEnergyLevel !== undefined && stats.avgEnergyLevel > 0;
  
  if (!hasMoodData && !hasEnergyData) {
    return null;
  }

  const moodEmojis: Record<string, string> = {
    great: '😊',
    good: '🙂',
    okay: '😐',
    tired: '😴',
    struggling: '😔',
  };

  return (
    <Card className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 border-violet-100 shadow-sm overflow-hidden">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <Heart className="h-4 w-4 text-white" />
          </div>
          <span className="bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent flex-1">
            Your Mood & Energy
          </span>
          <Sparkles className="h-4 w-4 text-amber-400" />
          <button 
            className="p-1 rounded-full hover:bg-violet-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed(!isCollapsed);
            }}
            data-testid="button-toggle-mood-card"
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4 text-violet-500" />
            ) : (
              <ChevronUp className="h-4 w-4 text-violet-500" />
            )}
          </button>
        </CardTitle>
      </CardHeader>
      {!isCollapsed && (<CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {hasMoodData && stats.moodDistribution![0] && (
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-violet-100">
              <p className="text-xs text-gray-500 mb-2 font-medium">Most Common Mood</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{stats.moodDistribution![0].emoji}</span>
                <div>
                  <span className="font-bold text-gray-800 capitalize text-lg">
                    {stats.moodDistribution![0].mood}
                  </span>
                  <span className="text-xs text-gray-500 block">
                    {stats.moodDistribution![0].count} check-ins
                  </span>
                </div>
              </div>
            </div>
          )}

          {hasEnergyData && (
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-amber-100">
              <p className="text-xs text-gray-500 mb-2 font-medium">Average Energy</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-gray-800 text-lg">
                    {stats.avgEnergyLevel!.toFixed(1)}/5
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    {stats.energyTrend === 'up' && (
                      <>
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-green-600">Increasing</span>
                      </>
                    )}
                    {stats.energyTrend === 'down' && (
                      <>
                        <TrendingDown className="h-3 w-3 text-red-500" />
                        <span className="text-red-600">Decreasing</span>
                      </>
                    )}
                    {stats.energyTrend === 'stable' && (
                      <>
                        <Minus className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-500">Stable</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {stats.recentMoods && stats.recentMoods.filter(m => m.mood).length > 0 && !compact && (
          <div className="pt-2">
            <p className="text-xs text-gray-500 mb-2 font-medium">Last 7 Days</p>
            <div className="flex gap-2 justify-between">
              {Array.from({ length: 7 }).map((_, i) => {
                const recentMood = stats.recentMoods?.[i];
                const dayLabel = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' });
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div 
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-lg ${
                        recentMood?.mood 
                          ? 'bg-white border-2 border-violet-200 shadow-sm' 
                          : 'bg-gray-100 text-gray-300'
                      }`}
                      title={recentMood?.mood ? `${recentMood.mood}` : 'No check-in'}
                    >
                      {recentMood?.mood ? moodEmojis[recentMood.mood] || '🙂' : '·'}
                    </div>
                    <span className="text-[10px] text-gray-400">{dayLabel.charAt(0)}</span>
                  </div>
                );
              }).reverse()}
            </div>
          </div>
        )}

        {stats.currentStreak > 0 && (
          <div className="flex items-center justify-center gap-2 pt-2 pb-1">
            <span className="text-lg">🔥</span>
            <span className="text-sm font-medium text-gray-700">
              {stats.currentStreak} day streak! Keep it going!
            </span>
          </div>
        )}
      </CardContent>
      )}
    </Card>
  );
}
