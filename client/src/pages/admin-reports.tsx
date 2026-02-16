import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Users,
  GraduationCap,
  Dumbbell,
  MessageSquare,
  MessageCircle,
  Download,
  RefreshCw,
  Calendar,
  Loader2,
  TrendingUp,
  UserPlus,
  AlertTriangle,
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/use-admin-auth";

interface SystemReport {
  userSummary: {
    total: number;
    active: number;
    expired: number;
    expiringIn30Days: number;
    newThisMonth: number;
    withWhatsApp: number;
    byCountry: { country: string; count: number }[];
  };
  enrollmentSummary: {
    total: number;
    active: number;
    expired: number;
  };
  workoutSummary: {
    totalCompletions: number;
    avgPerUser: number;
    thisWeek: number;
    thisMonth: number;
  };
  communitySummary: {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    postsThisMonth: number;
  };
  whatsappSummary: {
    totalRequests: number;
    pending: number;
    completed: number;
    rejected: number;
  };
  generatedAt: string;
}

const CHART_COLORS = ["#EC4899", "#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#14B8A6"];

function StatCard({ icon: Icon, label, value, subtitle, color }: { icon: any; label: string; value: string | number; subtitle?: string; color: string }) {
  const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
    pink: { bg: "bg-pink-50", icon: "text-pink-600", border: "border-pink-200" },
    green: { bg: "bg-green-50", icon: "text-green-600", border: "border-green-200" },
    blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-200" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-200" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600", border: "border-amber-200" },
    red: { bg: "bg-red-50", icon: "text-red-600", border: "border-red-200" },
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-200" },
    gray: { bg: "bg-gray-50", icon: "text-gray-600", border: "border-gray-200" },
  };
  const c = colorMap[color] || colorMap.gray;
  return (
    <div className={`rounded-xl p-4 border ${c.bg} ${c.border}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${c.icon}`} />
        <p className="text-xs font-medium text-gray-500">{label}</p>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function generateCSV(report: SystemReport): string {
  const date = new Date(report.generatedAt).toLocaleString();
  let csv = `System Usage Report\nGenerated: ${date}\n\n`;
  csv += `USER SUMMARY\nMetric,Value\n`;
  csv += `Total Users,${report.userSummary.total}\nActive Users,${report.userSummary.active}\nExpired Users,${report.userSummary.expired}\nExpiring in 30 Days,${report.userSummary.expiringIn30Days}\nNew This Month,${report.userSummary.newThisMonth}\nWith WhatsApp Support,${report.userSummary.withWhatsApp}\n\n`;
  csv += `USERS BY COUNTRY\nCountry,Count\n`;
  report.userSummary.byCountry.forEach(c => { csv += `${c.country},${c.count}\n`; });
  csv += `\nENROLLMENT SUMMARY\nMetric,Value\nTotal,${report.enrollmentSummary.total}\nActive,${report.enrollmentSummary.active}\nExpired,${report.enrollmentSummary.expired}\n\n`;
  csv += `WORKOUT SUMMARY\nMetric,Value\nTotal Completions,${report.workoutSummary.totalCompletions}\nAverage Per User,${report.workoutSummary.avgPerUser}\nThis Week,${report.workoutSummary.thisWeek}\nThis Month,${report.workoutSummary.thisMonth}\n\n`;
  csv += `COMMUNITY SUMMARY\nMetric,Value\nTotal Posts,${report.communitySummary.totalPosts}\nTotal Likes,${report.communitySummary.totalLikes}\nTotal Comments,${report.communitySummary.totalComments}\nPosts This Month,${report.communitySummary.postsThisMonth}\n\n`;
  csv += `WHATSAPP SUMMARY\nMetric,Value\nTotal Requests,${report.whatsappSummary.totalRequests}\nPending,${report.whatsappSummary.pending}\nCompleted,${report.whatsappSummary.completed}\nRejected,${report.whatsappSummary.rejected}\n`;
  return csv;
}

function downloadCSV(report: SystemReport) {
  const csv = generateCSV(report);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dateStr = new Date().toISOString().split("T")[0];
  link.href = url;
  link.download = `system-report-${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdminReports() {
  const { isLoading: authLoading, isAdmin } = useAdminAuth();

  const { data: report, isLoading, refetch, isFetching } = useQuery<SystemReport>({
    queryKey: ["/api/admin/reports/system"],
    enabled: isAdmin,
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!isAdmin) return null;

  // Prepare chart data
  const countryData = report?.userSummary.byCountry.slice(0, 8).map((c, i) => ({
    name: c.country || "Unknown",
    value: c.count,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  })) || [];

  const activityData = report ? [
    { name: "Workouts/Week", value: report.workoutSummary.thisWeek },
    { name: "Workouts/Month", value: report.workoutSummary.thisMonth },
    { name: "Posts/Month", value: report.communitySummary.postsThisMonth },
    { name: "WhatsApp Req", value: report.whatsappSummary.totalRequests },
  ] : [];

  const userStatusData = report ? [
    { name: "Active", value: report.userSummary.active, fill: "#10B981" },
    { name: "Expired", value: report.userSummary.expired, fill: "#EF4444" },
    { name: "Expiring", value: report.userSummary.expiringIn30Days, fill: "#F59E0B" },
  ].filter(d => d.value > 0) : [];

  return (
    <AdminLayout activeTab="reports" onTabChange={() => {}}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-pink-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              {report && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Last updated: {new Date(report.generatedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => report && downloadCSV(report)} disabled={!report} className="bg-pink-500 hover:bg-pink-600 text-white">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : report ? (
          <>
            {/* Key metrics row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Total Users" value={report.userSummary.total} color="pink" />
              <StatCard icon={TrendingUp} label="Active Users" value={report.userSummary.active} subtitle={`${report.userSummary.total > 0 ? Math.round(report.userSummary.active / report.userSummary.total * 100) : 0}% of total`} color="green" />
              <StatCard icon={UserPlus} label="New This Month" value={report.userSummary.newThisMonth} color="blue" />
              <StatCard icon={AlertTriangle} label="Expiring Soon" value={report.userSummary.expiringIn30Days} subtitle="Next 30 days" color="amber" />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Status Distribution */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-pink-500" />
                    User Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userStatusData.length > 0 ? (
                    <div className="flex items-center gap-4">
                      <ResponsiveContainer width={140} height={140}>
                        <PieChart>
                          <Pie data={userStatusData} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3}>
                            {userStatusData.map((entry, i) => (
                              <Cell key={i} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2">
                        {userStatusData.map((d, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.fill }} />
                            <span className="text-gray-600">{d.name}</span>
                            <span className="font-bold text-gray-900">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm py-8 text-center">No data</p>
                  )}
                </CardContent>
              </Card>

              {/* Country Distribution */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                    Users by Country
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {countryData.length > 0 ? (
                    <div className="flex items-center gap-4">
                      <ResponsiveContainer width={140} height={140}>
                        <PieChart>
                          <Pie data={countryData} dataKey="value" cx="50%" cy="50%" outerRadius={60} paddingAngle={2}>
                            {countryData.map((entry, i) => (
                              <Cell key={i} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-1 max-h-[140px] overflow-y-auto">
                        {countryData.map((d, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                            <span className="text-gray-600 truncate">{d.name}</span>
                            <span className="font-bold text-gray-900 ml-auto">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm py-8 text-center">No country data</p>
                  )}
                </CardContent>
              </Card>

              {/* Activity Overview Bar Chart */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    Activity Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activityData.some(d => d.value > 0) ? (
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart data={activityData}>
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} width={30} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#EC4899" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-400 text-sm py-8 text-center">No activity yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Detail cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Enrollments */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <GraduationCap className="h-4 w-4 text-blue-500" />
                    Enrollments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total</span>
                    <span className="text-lg font-bold">{report.enrollmentSummary.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Active</span>
                    <span className="text-lg font-bold text-green-600">{report.enrollmentSummary.active}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Expired</span>
                    <span className="text-lg font-bold text-red-500">{report.enrollmentSummary.expired}</span>
                  </div>
                  {report.enrollmentSummary.total > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.round(report.enrollmentSummary.active / report.enrollmentSummary.total * 100)}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-500">{Math.round(report.enrollmentSummary.active / report.enrollmentSummary.total * 100)}% active</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Workouts */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Dumbbell className="h-4 w-4 text-green-500" />
                    Workout Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total Completions</span>
                    <span className="text-lg font-bold">{report.workoutSummary.totalCompletions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Avg Per User</span>
                    <span className="text-lg font-bold">{report.workoutSummary.avgPerUser}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                    <div className="bg-green-50 rounded-lg p-2.5 text-center">
                      <p className="text-xs text-green-600">This Week</p>
                      <p className="text-lg font-bold text-green-700">{report.workoutSummary.thisWeek}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                      <p className="text-xs text-blue-600">This Month</p>
                      <p className="text-lg font-bold text-blue-700">{report.workoutSummary.thisMonth}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Community */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="h-4 w-4 text-purple-500" />
                    Community
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total Posts</span>
                    <span className="text-lg font-bold">{report.communitySummary.totalPosts}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                    <div className="text-center">
                      <p className="text-lg font-bold text-purple-600">{report.communitySummary.totalLikes}</p>
                      <p className="text-[10px] text-gray-500">Likes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">{report.communitySummary.totalComments}</p>
                      <p className="text-[10px] text-gray-500">Comments</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-pink-600">{report.communitySummary.postsThisMonth}</p>
                      <p className="text-[10px] text-gray-500">This Month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* WhatsApp row */}
            {report.whatsappSummary.totalRequests > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageCircle className="h-4 w-4 text-emerald-500" />
                    WhatsApp Support Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                      <p className="text-2xl font-bold text-gray-900">{report.whatsappSummary.totalRequests}</p>
                      <p className="text-xs text-gray-500 mt-1">Total Requests</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                      <p className="text-2xl font-bold text-amber-700">{report.whatsappSummary.pending}</p>
                      <p className="text-xs text-amber-600 mt-1">Pending</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                      <p className="text-2xl font-bold text-green-700">{report.whatsappSummary.completed}</p>
                      <p className="text-xs text-green-600 mt-1">Completed</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                      <p className="text-2xl font-bold text-red-700">{report.whatsappSummary.rejected}</p>
                      <p className="text-xs text-red-600 mt-1">Rejected</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
