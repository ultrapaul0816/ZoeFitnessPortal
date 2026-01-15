import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, FolderOpen, RefreshCw, X, RotateCcw, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminArchived() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: archivedItems = [], isLoading } = useQuery<Array<{
    id: string;
    item_type: string;
    original_id: string;
    item_data: any;
    archived_at: string;
    archived_by: string | null;
  }>>({
    queryKey: ["/api/admin/archived-items"],
  });

  const restoreArchivedItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest("POST", `/api/admin/archived-items/${itemId}/restore`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/archived-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whatsapp/extension-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whatsapp/expired-members"] });
      toast({ variant: "success", title: "Restored", description: "Item restored successfully" });
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/archived-items/${itemId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/archived-items"] });
      toast({ variant: "success", title: "Deleted", description: "Item permanently deleted" });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/admin")}
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-md hover:bg-white transition-all duration-300 mb-8"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-slate-200 group-hover:to-gray-300 transition-all duration-300">
            <ArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-gray-800 transition-colors" />
          </div>
          <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 via-gray-50 to-zinc-50 px-6 py-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-400 to-gray-500 flex items-center justify-center shadow-lg shadow-slate-200/50">
                  <FolderOpen className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-gray-700 bg-clip-text text-transparent">
                    Archived Items
                  </h1>
                  <p className="text-slate-600 mt-1">Removed items that can be restored</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-5 py-2 rounded-xl bg-gradient-to-br from-slate-400 to-gray-500 shadow-lg shadow-slate-200/50">
                  <span className="text-2xl font-bold text-white">{archivedItems.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 animate-spin text-gray-600" />
                </div>
              </div>
            ) : archivedItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Archive className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-600">No archived items</p>
                <p className="text-sm text-gray-400 mt-1">Archived items will appear here</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-slate-50">
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Archived On</th>
                      <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {archivedItems.map((item) => {
                      const data = item.item_data;
                      const isExtensionLog = item.item_type === 'extension_log';
                      
                      return (
                        <tr key={item.id} className="hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent transition-all duration-200">
                          <td className="px-6 py-5">
                            <Badge variant="outline" className={cn(
                              "px-3 py-1 rounded-lg font-medium",
                              isExtensionLog 
                                ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200" 
                                : "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200"
                            )}>
                              {isExtensionLog ? 'Extension Log' : 'Expired Member'}
                            </Badge>
                          </td>
                          <td className="px-6 py-5">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {isExtensionLog 
                                  ? data.user_name 
                                  : (data.first_name || data.last_name 
                                    ? `${data.first_name || ''} ${data.last_name || ''}`.trim() 
                                    : data.email)}
                              </p>
                              {isExtensionLog && (
                                <p className="text-sm text-gray-500 mt-0.5">+{data.extension_months} months extension</p>
                              )}
                              {!isExtensionLog && (
                                <p className="text-sm text-gray-500 mt-0.5">{data.email}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm text-gray-600 font-medium">
                            {new Date(item.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-9 px-4 text-xs font-medium rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border-blue-200 hover:border-blue-300"
                                onClick={() => restoreArchivedItemMutation.mutate(item.id)}
                                disabled={restoreArchivedItemMutation.isPending}
                              >
                                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                                Restore
                              </Button>
                              <button
                                className="h-9 w-9 rounded-lg flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-500 hover:text-red-600 transition-all duration-200"
                                onClick={() => {
                                  if (confirm('Permanently delete this item? This cannot be undone.')) {
                                    permanentDeleteMutation.mutate(item.id);
                                  }
                                }}
                                title="Delete permanently"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
