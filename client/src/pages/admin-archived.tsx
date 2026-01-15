import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, FolderOpen, RefreshCw, X, RotateCcw } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

        <Card className="border-gray-300 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-200/50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gray-200">
                  <FolderOpen className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">Archived Items</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Removed items that can be restored</p>
                </div>
              </div>
              <Badge className="bg-gray-200 text-gray-700 text-lg px-4 py-1">
                {archivedItems.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : archivedItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No archived items</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Details</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Archived On</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {archivedItems.map((item) => {
                      const data = item.item_data;
                      const isExtensionLog = item.item_type === 'extension_log';
                      
                      return (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={cn(
                              isExtensionLog 
                                ? "bg-green-50 text-green-700 border-green-200" 
                                : "bg-red-50 text-red-700 border-red-200"
                            )}>
                              {isExtensionLog ? 'Extension Log' : 'Expired Member'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {isExtensionLog 
                                  ? data.user_name 
                                  : (data.first_name || data.last_name 
                                    ? `${data.first_name || ''} ${data.last_name || ''}`.trim() 
                                    : data.email)}
                              </p>
                              {isExtensionLog && (
                                <p className="text-sm text-gray-500">+{data.extension_months} months</p>
                              )}
                              {!isExtensionLog && (
                                <p className="text-sm text-gray-500">{data.email}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(item.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                onClick={() => restoreArchivedItemMutation.mutate(item.id)}
                                disabled={restoreArchivedItemMutation.isPending}
                              >
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Restore
                              </Button>
                              <button
                                className="h-8 w-8 rounded-md flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-500 hover:text-red-600"
                                onClick={() => {
                                  if (confirm('Permanently delete this item? This cannot be undone.')) {
                                    permanentDeleteMutation.mutate(item.id);
                                  }
                                }}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}