import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart, Zap, TrendingUp, TrendingDown, Minus, Users, Sparkles } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface CheckinAnalytics {
  totalUsers: number;
  moodDistribution: { mood: string; count: number; emoji: string }[];
  avgEnergyLevel: number;
  energyTrend: { date: string; avgEnergy: number; checkins: number }[];
  days: number;
}

export default function CheckinAnalyticsCard() {
  const { data: analytics, isLoading } = useQuery<CheckinAnalytics>({
    queryKey: ["/api/admin/checkin-analytics"],
  });

  if (isLoading) {
    return (
      <Card className="border-violet-200 bg-violet-50/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) return null;

  const hasMoodData = analytics.moodDistribution && analytics.moodDistribution.length > 0;

  return (
    <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-100">
              <Heart className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-violet-900">Community Mood & Energy</CardTitle>
              <CardDescription className="text-xs text-violet-700">
                Last {analytics.days} days across {analytics.totalUsers} members
              </CardDescription>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>
      </CardHeader>
      <CardContent className="pt-2 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {hasMoodData && analytics.moodDistribution[0] && (
            <div className="bg-white/60 rounded-lg p-3 border border-violet-100">
              <p className="text-xs text-gray-500 mb-1 font-medium">Most Common Mood</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{analytics.moodDistribution[0].emoji}</span>
                <div>
                  <span className="font-bold text-gray-800 capitalize text-lg">
                    {analytics.moodDistribution[0].mood}
                  </span>
                  <span className="text-xs text-gray-500 block">
                    {analytics.moodDistribution[0].count} check-ins
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white/60 rounded-lg p-3 border border-amber-100">
            <p className="text-xs text-gray-500 mb-1 font-medium">Avg Energy Level</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-gray-800 text-lg">
                  {analytics.avgEnergyLevel > 0 ? analytics.avgEnergyLevel.toFixed(1) : 'N/A'}/5
                </span>
              </div>
            </div>
          </div>
        </div>

        {hasMoodData && (
          <div className="bg-white/60 rounded-lg p-3 border border-violet-100">
            <p className="text-xs text-gray-500 mb-2 font-medium">Mood Distribution</p>
            <div className="flex items-center justify-between gap-1">
              {analytics.moodDistribution.slice(0, 5).map((m) => (
                <div key={m.mood} className="flex flex-col items-center flex-1">
                  <span className="text-xl mb-1">{m.emoji}</span>
                  <span className="text-xs font-medium text-gray-700 capitalize">{m.mood}</span>
                  <span className="text-xs text-gray-400">{m.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {analytics.energyTrend && analytics.energyTrend.length > 2 && (
          <div className="bg-white/60 rounded-lg p-3 border border-violet-100">
            <p className="text-xs text-gray-500 mb-2 font-medium">Energy Trend (7 days)</p>
            <div className="h-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.energyTrend.slice(-7)}>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }} 
                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short' })}
                  />
                  <YAxis domain={[1, 5]} tick={{ fontSize: 10 }} width={20} />
                  <Tooltip 
                    formatter={(value: number) => [value.toFixed(1), 'Avg Energy']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgEnergy" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
