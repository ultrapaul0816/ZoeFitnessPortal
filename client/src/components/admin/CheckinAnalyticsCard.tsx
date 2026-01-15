import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart, Zap } from "lucide-react";
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
      <Card className="border border-violet-100 bg-gradient-to-br from-violet-50/50 to-purple-50/30 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) return null;

  const hasMoodData = analytics.moodDistribution && analytics.moodDistribution.length > 0;

  return (
    <Card className="border border-violet-100 bg-gradient-to-br from-violet-50/50 to-purple-50/30 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-md">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">Community Mood & Energy</CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Last {analytics.days} days across {analytics.totalUsers} members
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {hasMoodData && analytics.moodDistribution[0] && (
            <div className="bg-white rounded-xl p-3 border border-gray-100">
              <p className="text-xs text-gray-500 mb-2 font-medium">Most Common Mood</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{analytics.moodDistribution[0].emoji}</span>
                <div>
                  <span className="font-bold text-gray-800 capitalize text-base">
                    {analytics.moodDistribution[0].mood}
                  </span>
                  <span className="text-xs text-gray-500 block">
                    {analytics.moodDistribution[0].count} check-ins
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl p-3 border border-gray-100">
            <p className="text-xs text-gray-500 mb-2 font-medium">Avg Energy Level</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-sm">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-800 text-lg">
                {analytics.avgEnergyLevel > 0 ? analytics.avgEnergyLevel.toFixed(1) : 'N/A'}/5
              </span>
            </div>
          </div>
        </div>

        {hasMoodData && (
          <div className="bg-white rounded-xl p-3 border border-gray-100">
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
          <div className="bg-white rounded-xl p-3 border border-gray-100">
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
