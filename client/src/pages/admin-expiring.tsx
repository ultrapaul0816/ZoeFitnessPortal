import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Clock, Mail, Check, MessageSquare, Dumbbell, RefreshCw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminExpiring() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: expiringMembers = [], isLoading } = useQuery<Array<{
    id: string;
    name: string;
    email: string;
    programExpiryDate: string | null;
    whatsAppExpiryDate: string | null;
    daysUntilExpiry: number;
    expiryType: string;
  }>>({
    queryKey: ["/api/admin/whatsapp/expiring-soon"],
  });

  const { data: renewalEmailLogs = [] } = useQuery<Array<{
    id: string;
    user_id: string;
    email_type: string;
    sent_at: string;
  }>>({
    queryKey: ["/api/admin/renewal-email-logs"],
  });

  const getUserEmailLogs = (userId: string) => {
    return renewalEmailLogs.filter(log => log.user_id === userId);
  };

  const logEmailMutation = useMutation({
    mutationFn: async (data: { userId: string; emailType: string }) => {
      const response = await apiRequest("POST", "/api/admin/renewal-email-logs", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/renewal-email-logs"] });
      toast({ title: "Email Logged", description: "Email sent date and time recorded" });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/admin")}
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-md hover:bg-white transition-all duration-300 mb-8"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-amber-100 group-hover:to-orange-100 transition-all duration-300">
            <ArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-amber-600 transition-colors" />
          </div>
          <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 px-6 py-6 border-b border-amber-100/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200/50">
                  <AlertTriangle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">
                    Members Expiring Soon
                  </h1>
                  <p className="text-amber-600 mt-1">Next 7 days</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-5 py-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-200/50">
                  <span className="text-2xl font-bold text-white">{expiringMembers.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
                </div>
              </div>
            ) : expiringMembers.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-emerald-500" />
                </div>
                <p className="text-lg font-medium text-gray-600">No members expiring soon</p>
                <p className="text-sm text-gray-400 mt-1">All memberships are healthy</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-slate-50">
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Member</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Expiring</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Days Left</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry Date</th>
                      <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {expiringMembers.map((member) => {
                      const emailLogs = getUserEmailLogs(member.id);
                      const logCount = emailLogs.length;
                      
                      return (
                        <tr key={member.id} className="hover:bg-gradient-to-r hover:from-amber-50/30 hover:to-transparent transition-all duration-200">
                          <td className="px-6 py-5">
                            <div>
                              <p className="font-semibold text-gray-900">{member.name || 'Unknown'}</p>
                              <p className="text-sm text-gray-500 mt-0.5">{member.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <Badge variant="outline" className={cn(
                              "px-3 py-1 rounded-lg font-medium",
                              member.expiryType === 'whatsapp' 
                                ? "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200" 
                                : "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200"
                            )}>
                              {member.expiryType === 'whatsapp' ? (
                                <><MessageSquare className="w-3.5 h-3.5 mr-1.5" /> WhatsApp</>
                              ) : (
                                <><Dumbbell className="w-3.5 h-3.5 mr-1.5" /> Program</>
                              )}
                            </Badge>
                          </td>
                          <td className="px-6 py-5">
                            <div className={cn(
                              "inline-flex items-center px-3 py-1.5 rounded-lg font-bold text-sm",
                              member.daysUntilExpiry <= 2 
                                ? "bg-gradient-to-r from-red-100 to-rose-100 text-red-700" 
                                : member.daysUntilExpiry <= 5 
                                ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700" 
                                : "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700"
                            )}>
                              {member.daysUntilExpiry} days
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm text-gray-600 font-medium">
                            {member.whatsAppExpiryDate && new Date(member.whatsAppExpiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {member.programExpiryDate && new Date(member.programExpiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="outline" className="h-9 px-4 text-xs font-medium rounded-lg border-gray-200 hover:bg-gray-50 hover:border-gray-300">
                                Extend
                              </Button>
                              <Button size="sm" className="h-9 px-4 text-xs font-medium rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-sm">
                                <Mail className="w-3.5 h-3.5 mr-1.5" />
                                Remind
                              </Button>
                              <button
                                className={cn(
                                  "h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-200",
                                  logCount === 0 ? "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600" :
                                  logCount === 1 ? "bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-sm hover:shadow-md" :
                                  "bg-gradient-to-br from-amber-400 to-orange-500 text-white opacity-50 cursor-not-allowed"
                                )}
                                onClick={() => logEmailMutation.mutate({ userId: member.id, emailType: 'expiring' })}
                                disabled={logCount >= 2}
                                title={logCount === 0 ? "Log email sent" : logCount === 1 ? "Log follow-up" : "Max emails logged"}
                              >
                                <Check className="w-4 h-4" />
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
