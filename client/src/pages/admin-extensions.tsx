import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, RefreshCw, X, ArrowRight, Sparkles, Download, FileSpreadsheet, FileText } from "lucide-react";
import jsPDF from "jspdf";

export default function AdminExtensions() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: extensionLogs = [], isLoading } = useQuery<Array<{
    id: string;
    user_id: string;
    user_name: string;
    user_email: string;
    user_phone: string | null;
    action_type: string;
    previous_expiry_date: string | null;
    new_expiry_date: string | null;
    extension_months: number | null;
    notes: string | null;
    performed_by: string | null;
    created_at: string;
  }>>({
    queryKey: ["/api/admin/whatsapp/extension-logs"],
  });

  const deleteExtensionLogMutation = useMutation({
    mutationFn: async (logId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/whatsapp/extension-logs/${logId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whatsapp/extension-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/archived-items"] });
      toast({ variant: "success", title: "Archived", description: "Extension log archived" });
    },
  });

  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    
    doc.setFontSize(18);
    doc.setTextColor(16, 185, 129);
    doc.text('Recent Extensions', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${now} IST`, 14, 28);
    
    doc.setFontSize(9);
    doc.setTextColor(0);
    let y = 40;
    
    doc.setFillColor(245, 245, 245);
    doc.rect(14, y - 5, 268, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Name', 16, y);
    doc.text('Email', 50, y);
    doc.text('Phone', 105, y);
    doc.text('Extension', 150, y);
    doc.text('Previous', 180, y);
    doc.text('New', 210, y);
    doc.text('Extended On', 240, y);
    y += 10;
    
    doc.setFont('helvetica', 'normal');
    extensionLogs.forEach((log) => {
      if (y > 190) {
        doc.addPage();
        y = 20;
      }
      doc.text((log.user_name || '').substring(0, 16), 16, y);
      doc.text((log.user_email || '').substring(0, 28), 50, y);
      doc.text((log.user_phone || '-').substring(0, 15), 105, y);
      doc.text(`+${log.extension_months}m`, 150, y);
      doc.text(log.previous_expiry_date ? new Date(log.previous_expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '', 180, y);
      doc.text(log.new_expiry_date ? new Date(log.new_expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '', 210, y);
      doc.text(new Date(log.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), 240, y);
      y += 8;
    });
    
    doc.save(`extensions-${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: "Exported", description: "PDF downloaded successfully" });
  };

  const exportToExcel = () => {
    const headers = ['Name', 'Email', 'Phone', 'Extension (Months)', 'Previous Expiry', 'New Expiry', 'Extended On'];
    const rows = extensionLogs.map((log) => [
      log.user_name || '',
      log.user_email || '',
      log.user_phone || '',
      String(log.extension_months || 0),
      log.previous_expiry_date ? new Date(log.previous_expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
      log.new_expiry_date ? new Date(log.new_expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
      new Date(log.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `extensions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: "Exported", description: "Excel file downloaded successfully" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/admin")}
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-md hover:bg-white transition-all duration-300 mb-8"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-emerald-100 group-hover:to-green-100 transition-all duration-300">
            <ArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-emerald-600 transition-colors" />
          </div>
          <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 px-6 py-6 border-b border-emerald-100/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-200/50">
                  <RefreshCw className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-800 to-green-700 bg-clip-text text-transparent">
                    Recent Extensions
                  </h1>
                  <p className="text-emerald-600 mt-1">Membership renewals log</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl border-emerald-200 hover:bg-emerald-50">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={exportToPDF}>
                      <FileText className="w-4 h-4 mr-2 text-red-500" />
                      Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={exportToExcel}>
                      <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                      Export as Excel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="px-5 py-2 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-200/50">
                  <span className="text-2xl font-bold text-white">{extensionLogs.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                </div>
              </div>
            ) : extensionLogs.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-600">No extensions recorded yet</p>
                <p className="text-sm text-gray-400 mt-1">Extensions will appear here when members renew</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-slate-50">
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Member</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Extension</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date Change</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Extended On</th>
                      <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {extensionLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gradient-to-r hover:from-emerald-50/30 hover:to-transparent transition-all duration-200">
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-semibold text-gray-900">{log.user_name}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{log.user_email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 font-bold text-sm">
                            +{log.extension_months} month{log.extension_months !== 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {log.previous_expiry_date && log.new_expiry_date && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-500 font-medium">
                                {new Date(log.previous_expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              </span>
                              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                              </div>
                              <span className="font-bold text-emerald-700">
                                {new Date(log.new_expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-600 font-medium">
                          {new Date(log.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end">
                            <button
                              className="h-9 w-9 rounded-lg flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-500 hover:text-red-600 transition-all duration-200"
                              onClick={() => {
                                if (confirm(`Archive this extension log for ${log.user_name}?`)) {
                                  deleteExtensionLogMutation.mutate(log.id);
                                }
                              }}
                              title="Archive log"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
