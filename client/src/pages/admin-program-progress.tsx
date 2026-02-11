import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  FileSpreadsheet,
  FileText,
  Camera,
  CameraOff,
  RefreshCw,
  Loader2,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { apiRequest } from "@/lib/queryClient";
import jsPDF from "jspdf";

interface UserProgress {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  enrolledAt: string;
  hasStartPhoto: boolean;
  hasFinishPhoto: boolean;
  weeks: Record<number, number>;
  totalCompletions: number;
  lastActivity: string | null;
}

interface ProgramProgress {
  summary: {
    totalEnrolled: number;
    fullyCompleted: number;
    inProgress: number;
    notStarted: number;
    withStartPhoto: number;
    withFinishPhoto: number;
  };
  users: UserProgress[];
  generatedAt: string;
}

function WeekBadge({ count }: { count: number }) {
  if (count >= 4) {
    return (
      <span className="inline-flex items-center justify-center w-10 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-sm border border-emerald-200">
        {count}/4
      </span>
    );
  }
  if (count > 0) {
    return (
      <span className="inline-flex items-center justify-center w-10 h-8 rounded-lg bg-amber-100 text-amber-700 font-bold text-sm border border-amber-200">
        {count}/4
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-10 h-8 rounded-lg bg-gray-100 text-gray-400 font-bold text-sm border border-gray-200">
      0/4
    </span>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            pct >= 100 ? "bg-emerald-500" : pct > 0 ? "bg-pink-500" : "bg-gray-200"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-600 w-10 text-right">{pct}%</span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    pink: "bg-pink-50 text-pink-600 border-pink-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    gray: "bg-gray-50 text-gray-600 border-gray-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
  };

  return (
    <div className={`rounded-xl p-4 border ${colorMap[color] || colorMap.gray}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" />
        <p className="text-xs font-medium opacity-80">{label}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function generatePDF(data: ProgramProgress) {
  const doc = new jsPDF({ orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const date = new Date(data.generatedAt).toLocaleDateString();

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Heal Your Core - Program Progress Report", 14, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${date}`, 14, 28);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", 14, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Total Enrolled: ${data.summary.totalEnrolled}  |  Fully Completed: ${data.summary.fullyCompleted}  |  In Progress: ${data.summary.inProgress}  |  Not Started: ${data.summary.notStarted}`, 14, 47);
  doc.text(`Start Photos: ${data.summary.withStartPhoto}  |  Finish Photos: ${data.summary.withFinishPhoto}`, 14, 53);

  const headers = ["Name", "Email", "Enrolled", "W1", "W2", "W3", "W4", "W5", "W6", "Total", "%", "Start Photo", "Finish Photo", "Last Activity"];
  const colWidths = [30, 55, 22, 12, 12, 12, 12, 12, 12, 15, 12, 22, 22, 25];
  let y = 64;
  const startX = 10;

  doc.setFillColor(240, 240, 240);
  doc.rect(startX, y - 4, pageWidth - 20, 7, "F");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  let x = startX;
  headers.forEach((h, i) => {
    doc.text(h, x + 1, y);
    x += colWidths[i];
  });

  doc.setFont("helvetica", "normal");
  y += 8;

  data.users.forEach((user) => {
    if (y > 190) {
      doc.addPage();
      y = 20;
      doc.setFillColor(240, 240, 240);
      doc.rect(startX, y - 4, pageWidth - 20, 7, "F");
      doc.setFont("helvetica", "bold");
      let hx = startX;
      headers.forEach((h, i) => {
        doc.text(h, hx + 1, y);
        hx += colWidths[i];
      });
      doc.setFont("helvetica", "normal");
      y += 8;
    }

    const pct = Math.round((user.totalCompletions / 24) * 100);
    const enrolled = user.enrolledAt ? new Date(user.enrolledAt).toLocaleDateString() : "N/A";
    const lastAct = user.lastActivity ? new Date(user.lastActivity).toLocaleDateString() : "N/A";

    const row = [
      `${user.firstName} ${user.lastName}`.substring(0, 18),
      user.email.substring(0, 32),
      enrolled,
      `${user.weeks[1]}/4`,
      `${user.weeks[2]}/4`,
      `${user.weeks[3]}/4`,
      `${user.weeks[4]}/4`,
      `${user.weeks[5]}/4`,
      `${user.weeks[6]}/4`,
      `${user.totalCompletions}/24`,
      `${pct}%`,
      user.hasStartPhoto ? "Yes" : "No",
      user.hasFinishPhoto ? "Yes" : "No",
      lastAct,
    ];

    x = startX;
    doc.setFontSize(7);
    row.forEach((cell, i) => {
      doc.text(cell, x + 1, y);
      x += colWidths[i];
    });
    y += 6;
  });

  doc.save(`heal-your-core-progress-${new Date().toISOString().split("T")[0]}.pdf`);
}

export default function AdminProgramProgress() {
  const { isAdmin, isLoading: authLoading } = useAdminAuth();

  const { data, isLoading, refetch, isFetching } = useQuery<ProgramProgress>({
    queryKey: ["/api/admin/program-progress"],
    enabled: isAdmin,
  });

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem("coaching_auth_token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const response = await fetch("/api/admin/program-progress/export-csv", { headers });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `heal-your-core-progress-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("CSV export failed:", error);
    }
  };

  const handleExportPDF = () => {
    if (data) generatePDF(data);
  };

  if (authLoading || !isAdmin) return null;

  return (
    <AdminLayout activeTab="program-progress" onTabChange={() => {}}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Heal Your Core - Program Progress</h1>
            <p className="text-sm text-gray-500 mt-1">Track user completion across the 6-week program (4 workouts per week)</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />}
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={!data}>
              <FileSpreadsheet className="w-4 h-4 mr-1" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={!data}>
              <FileText className="w-4 h-4 mr-1" />
              Export PDF
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard icon={Users} label="Total Enrolled" value={data.summary.totalEnrolled} color="pink" />
              <StatCard icon={CheckCircle2} label="Fully Completed" value={data.summary.fullyCompleted} color="emerald" />
              <StatCard icon={Clock} label="In Progress" value={data.summary.inProgress} color="amber" />
              <StatCard icon={XCircle} label="Not Started" value={data.summary.notStarted} color="gray" />
              <StatCard icon={Camera} label="Start Photos" value={data.summary.withStartPhoto} color="blue" />
              <StatCard icon={Camera} label="Finish Photos" value={data.summary.withFinishPhoto} color="blue" />
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-pink-500" />
                  User Progress Detail
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.users.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No users enrolled yet</p>
                    <p className="text-sm">Users enrolled in Heal Your Core will appear here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">User</th>
                          <th className="text-center py-3 px-1 font-semibold text-gray-700">W1</th>
                          <th className="text-center py-3 px-1 font-semibold text-gray-700">W2</th>
                          <th className="text-center py-3 px-1 font-semibold text-gray-700">W3</th>
                          <th className="text-center py-3 px-1 font-semibold text-gray-700">W4</th>
                          <th className="text-center py-3 px-1 font-semibold text-gray-700">W5</th>
                          <th className="text-center py-3 px-1 font-semibold text-gray-700">W6</th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700 min-w-[140px]">Overall</th>
                          <th className="text-center py-3 px-2 font-semibold text-gray-700">Photos</th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">Last Active</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.users.map((user) => (
                          <tr key={user.userId} className="border-b border-gray-100 hover:bg-gray-50/50">
                            <td className="py-3 px-2">
                              <div>
                                <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                                <p className="text-xs text-gray-400">
                                  Enrolled: {user.enrolledAt ? new Date(user.enrolledAt).toLocaleDateString() : "N/A"}
                                </p>
                              </div>
                            </td>
                            {[1, 2, 3, 4, 5, 6].map((w) => (
                              <td key={w} className="text-center py-3 px-1">
                                <WeekBadge count={user.weeks[w] || 0} />
                              </td>
                            ))}
                            <td className="py-3 px-2">
                              <div className="space-y-1">
                                <ProgressBar value={user.totalCompletions} max={24} />
                                <p className="text-xs text-gray-500 text-center">{user.totalCompletions}/24 workouts</p>
                              </div>
                            </td>
                            <td className="text-center py-3 px-2">
                              <div className="flex items-center justify-center gap-1">
                                {user.hasStartPhoto ? (
                                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5">
                                    <Camera className="w-3 h-3 mr-0.5" /> Start
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-gray-100 text-gray-400 text-[10px] px-1.5">
                                    <CameraOff className="w-3 h-3 mr-0.5" /> Start
                                  </Badge>
                                )}
                                {user.hasFinishPhoto ? (
                                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5">
                                    <Camera className="w-3 h-3 mr-0.5" /> Finish
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-gray-100 text-gray-400 text-[10px] px-1.5">
                                    <CameraOff className="w-3 h-3 mr-0.5" /> Finish
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-2 text-xs text-gray-500">
                              {user.lastActivity ? new Date(user.lastActivity).toLocaleDateString() : "No activity"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}