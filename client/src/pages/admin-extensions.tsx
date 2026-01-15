import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, RefreshCw, X, Check, ArrowRight } from "lucide-react";

export default function AdminExtensions() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: extensionLogs = [], isLoading } = useQuery<Array<{
    id: string;
    user_id: string;
    user_name: string;
    user_email: string;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

        <Card className="border-green-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 border-b border-green-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-100">
                  <RefreshCw className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-green-900">Recent Extensions</CardTitle>
                  <p className="text-sm text-green-600 mt-1">Membership renewals log</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700 text-lg px-4 py-1">
                {extensionLogs.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : extensionLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No extensions recorded yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Member</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Extension</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date Change</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Extended On</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {extensionLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{log.user_name}</p>
                            <p className="text-sm text-gray-500">{log.user_email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            +{log.extension_months} month{log.extension_months !== 1 ? 's' : ''}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {log.previous_expiry_date && log.new_expiry_date && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-500">
                                {new Date(log.previous_expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              </span>
                              <ArrowRight className="w-4 h-4 text-green-500" />
                              <span className="font-medium text-green-700">
                                {new Date(log.new_expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(log.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end">
                            <button
                              className="h-8 w-8 rounded-md flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-500 hover:text-red-600"
                              onClick={() => {
                                if (confirm(`Archive this extension log for ${log.user_name}?`)) {
                                  deleteExtensionLogMutation.mutate(log.id);
                                }
                              }}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}