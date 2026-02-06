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
} from "lucide-react";
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

function MetricBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function generateCSV(report: SystemReport): string {
  const date = new Date(report.generatedAt).toLocaleString();
  let csv = `System Usage Report\nGenerated: ${date}\n\n`;

  csv += `USER SUMMARY\nMetric,Value\n`;
  csv += `Total Users,${report.userSummary.total}\n`;
  csv += `Active Users,${report.userSummary.active}\n`;
  csv += `Expired Users,${report.userSummary.expired}\n`;
  csv += `Expiring in 30 Days,${report.userSummary.expiringIn30Days}\n`;
  csv += `New This Month,${report.userSummary.newThisMonth}\n`;
  csv += `With WhatsApp Support,${report.userSummary.withWhatsApp}\n\n`;

  csv += `USERS BY COUNTRY\nCountry,Count\n`;
  report.userSummary.byCountry.forEach(c => {
    csv += `${c.country},${c.count}\n`;
  });
  csv += `\n`;

  csv += `ENROLLMENT SUMMARY\nMetric,Value\n`;
  csv += `Total Enrollments,${report.enrollmentSummary.total}\n`;
  csv += `Active Enrollments,${report.enrollmentSummary.active}\n`;
  csv += `Expired Enrollments,${report.enrollmentSummary.expired}\n\n`;

  csv += `WORKOUT SUMMARY\nMetric,Value\n`;
  csv += `Total Completions,${report.workoutSummary.totalCompletions}\n`;
  csv += `Average Per User,${report.workoutSummary.avgPerUser}\n`;
  csv += `This Week,${report.workoutSummary.thisWeek}\n`;
  csv += `This Month,${report.workoutSummary.thisMonth}\n\n`;

  csv += `COMMUNITY SUMMARY\nMetric,Value\n`;
  csv += `Total Posts,${report.communitySummary.totalPosts}\n`;
  csv += `Total Likes,${report.communitySummary.totalLikes}\n`;
  csv += `Total Comments,${report.communitySummary.totalComments}\n`;
  csv += `Posts This Month,${report.communitySummary.postsThisMonth}\n\n`;

  csv += `WHATSAPP SUMMARY\nMetric,Value\n`;
  csv += `Total Requests,${report.whatsappSummary.totalRequests}\n`;
  csv += `Pending,${report.whatsappSummary.pending}\n`;
  csv += `Completed,${report.whatsappSummary.completed}\n`;
  csv += `Rejected,${report.whatsappSummary.rejected}\n`;

  return csv;
}

function downloadCSV(report: SystemReport) {
  const csv = generateCSV(report);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
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

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout activeTab="reports" onTabChange={() => {}}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-pink-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Reports</h1>
              {report && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Generated: {new Date(report.generatedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => report && downloadCSV(report)}
              disabled={!report}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="bg-white">
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((j) => (
                      <Skeleton key={j} className="h-20 rounded-xl" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : report ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-pink-500" />
                  User Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <MetricBox label="Total Users" value={report.userSummary.total} />
                  <MetricBox label="Active" value={report.userSummary.active} />
                  <MetricBox label="Expired" value={report.userSummary.expired} />
                  <MetricBox label="Expiring in 30d" value={report.userSummary.expiringIn30Days} />
                  <MetricBox label="New This Month" value={report.userSummary.newThisMonth} />
                  <MetricBox label="WhatsApp Active" value={report.userSummary.withWhatsApp} />
                </div>
                {report.userSummary.byCountry.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Users by Country</p>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {report.userSummary.byCountry.map((c) => (
                        <div key={c.country} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-1.5">
                          <span className="text-gray-700">{c.country}</span>
                          <span className="font-semibold text-gray-900">{c.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="h-5 w-5 text-blue-500" />
                  Enrollment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <MetricBox label="Total Enrollments" value={report.enrollmentSummary.total} />
                  <MetricBox label="Active" value={report.enrollmentSummary.active} />
                  <MetricBox label="Expired" value={report.enrollmentSummary.expired} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Dumbbell className="h-5 w-5 text-green-500" />
                  Workout Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <MetricBox label="Total Completions" value={report.workoutSummary.totalCompletions} />
                  <MetricBox label="Avg Per User" value={report.workoutSummary.avgPerUser} />
                  <MetricBox label="This Week" value={report.workoutSummary.thisWeek} />
                  <MetricBox label="This Month" value={report.workoutSummary.thisMonth} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                  Community Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <MetricBox label="Total Posts" value={report.communitySummary.totalPosts} />
                  <MetricBox label="Total Likes" value={report.communitySummary.totalLikes} />
                  <MetricBox label="Total Comments" value={report.communitySummary.totalComments} />
                  <MetricBox label="Posts This Month" value={report.communitySummary.postsThisMonth} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="h-5 w-5 text-emerald-500" />
                  WhatsApp Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <MetricBox label="Total Requests" value={report.whatsappSummary.totalRequests} />
                  <MetricBox label="Pending" value={report.whatsappSummary.pending} />
                  <MetricBox label="Completed" value={report.whatsappSummary.completed} />
                  <MetricBox label="Rejected" value={report.whatsappSummary.rejected} />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
