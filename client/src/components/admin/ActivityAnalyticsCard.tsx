import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Users, Eye, MousePointer, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface ActivityAnalytics {
  pageViews: { page: string; count: number }[];
  featureUsage: { feature: string; count: number }[];
  dailyActiveUsers: { date: string; count: number }[];
  topActiveUsers: { userId: string; firstName: string; lastName: string; activityCount: number }[];
  activityByType: { type: string; count: number }[];
  activityByHour: { hour: number; count: number }[];
}

const COLORS = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'];

const formatActivityType = (type: string) => {
  const typeMap: Record<string, string> = {
    'page_view': 'Page Views',
    'feature_usage': 'Feature Usage',
    'login': 'Logins',
    'login_otp': 'OTP Logins',
    'workout_complete': 'Workouts Completed',
    'daily_checkin': 'Daily Check-ins',
  };
  return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatHour = (hour: number) => {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
};

export default function ActivityAnalyticsCard() {
  const [days, setDays] = useState('30');
  
  const { data: analytics, isLoading } = useQuery<ActivityAnalytics>({
    queryKey: ["/api/admin/activity-analytics", days],
    queryFn: async () => {
      const res = await fetch(`/api/admin/activity-analytics?days=${days}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <Card className="border border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) return null;

  const totalActivities = analytics.activityByType.reduce((sum, a) => sum + a.count, 0);
  const avgDailyActive = analytics.dailyActiveUsers.length > 0 
    ? Math.round(analytics.dailyActiveUsers.reduce((sum, d) => sum + d.count, 0) / analytics.dailyActiveUsers.length)
    : 0;

  return (
    <Card className="border border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">Activity & Engagement</CardTitle>
              <CardDescription className="text-xs text-gray-500">
                {totalActivities.toLocaleString()} total activities
              </CardDescription>
            </div>
          </div>
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/60 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-500">Avg. Daily Active</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{avgDailyActive}</p>
          </div>
          <div className="bg-white/60 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-pink-500" />
              <span className="text-xs text-gray-500">Page Views</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {analytics.pageViews.reduce((sum, p) => sum + p.count, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white/60 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <MousePointer className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-gray-500">Feature Usage</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {analytics.featureUsage.reduce((sum, f) => sum + f.count, 0).toLocaleString()}
            </p>
          </div>
        </div>

        {analytics.dailyActiveUsers.length > 0 && (
          <div className="bg-white/60 rounded-lg p-3 border border-blue-100">
            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              Daily Active Users
            </h4>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.dailyActiveUsers.slice(-14)}>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }} 
                    tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 10 }} width={30} />
                  <Tooltip 
                    labelFormatter={(d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    formatter={(value) => [value, 'Users']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {analytics.pageViews.length > 0 && (
            <div className="bg-white/60 rounded-lg p-3 border border-blue-100">
              <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Eye className="w-3.5 h-3.5" />
                Top Pages
              </h4>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.pageViews.slice(0, 5)} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 9 }} />
                    <YAxis dataKey="page" type="category" tick={{ fontSize: 9 }} width={70} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ec4899" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {analytics.activityByType.length > 0 && (
            <div className="bg-white/60 rounded-lg p-3 border border-blue-100">
              <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" />
                Activity Types
              </h4>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.activityByType.slice(0, 6)}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={45}
                      paddingAngle={2}
                    >
                      {analytics.activityByType.slice(0, 6).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, formatActivityType(name as string)]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {analytics.activityByHour.length > 0 && (
          <div className="bg-white/60 rounded-lg p-3 border border-blue-100">
            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Activity by Hour
            </h4>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.activityByHour}>
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fontSize: 8 }} 
                    tickFormatter={formatHour}
                    interval={2}
                  />
                  <YAxis tick={{ fontSize: 9 }} width={25} />
                  <Tooltip 
                    labelFormatter={(h) => formatHour(h as number)}
                    formatter={(value) => [value, 'Activities']}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {analytics.topActiveUsers.length > 0 && (
          <div className="bg-white/60 rounded-lg p-3 border border-blue-100">
            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              Most Active Users
            </h4>
            <div className="space-y-1.5">
              {analytics.topActiveUsers.slice(0, 5).map((user, index) => (
                <div key={user.userId} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 text-white flex items-center justify-center text-[10px] font-bold">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{user.firstName} {user.lastName.charAt(0)}.</span>
                  </div>
                  <span className="text-gray-500">{user.activityCount} activities</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
