import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Clock, Mail, Check, MessageSquare, Dumbbell, RefreshCw } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

        <Card className="border-amber-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100/50 border-b border-amber-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-100">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-amber-900">Members Expiring Soon</CardTitle>
                  <p className="text-sm text-amber-600 mt-1">Next 7 days</p>
                </div>
              </div>
              <Badge className="bg-amber-100 text-amber-700 text-lg px-4 py-1">
                {expiringMembers.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : expiringMembers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Check className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No members expiring soon</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Member</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Expiring</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Days Left</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Expiry Date</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {expiringMembers.map((member) => {
                      const emailLogs = getUserEmailLogs(member.id);
                      const logCount = emailLogs.length;
                      
                      return (
                        <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{member.name || 'Unknown'}</p>
                              <p className="text-sm text-gray-500">{member.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={cn(
                              "w-fit",
                              member.expiryType === 'whatsapp' 
                                ? "bg-red-50 text-red-700 border-red-200" 
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            )}>
                              {member.expiryType === 'whatsapp' ? (
                                <><MessageSquare className="w-3 h-3 mr-1" /> WhatsApp</>
                              ) : (
                                <><Dumbbell className="w-3 h-3 mr-1" /> Program</>
                              )}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={cn(
                              "font-bold",
                              member.daysUntilExpiry <= 2 
                                ? "bg-red-100 text-red-700" 
                                : member.daysUntilExpiry <= 5 
                                ? "bg-amber-100 text-amber-700" 
                                : "bg-yellow-100 text-yellow-700"
                            )}>
                              {member.daysUntilExpiry} days
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {member.whatsAppExpiryDate && new Date(member.whatsAppExpiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {member.programExpiryDate && new Date(member.programExpiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="outline" className="h-8 text-xs">
                                Extend
                              </Button>
                              <Button size="sm" variant="secondary" className="h-8 text-xs bg-pink-100 hover:bg-pink-200 text-pink-700">
                                <Mail className="w-3 h-3 mr-1" />
                                Remind
                              </Button>
                              <button
                                className={cn(
                                  "h-8 px-3 rounded-md flex items-center justify-center text-xs font-medium",
                                  logCount === 0 ? "bg-gray-100 text-gray-500 hover:bg-gray-200" :
                                  logCount === 1 ? "bg-emerald-500 text-white hover:bg-emerald-600" :
                                  "bg-amber-500 text-white opacity-50 cursor-not-allowed"
                                )}
                                onClick={() => logEmailMutation.mutate({ userId: member.id, emailType: 'expiring' })}
                                disabled={logCount >= 2}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}