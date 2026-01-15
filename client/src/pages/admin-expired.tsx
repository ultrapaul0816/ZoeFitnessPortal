import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Mail, Check, X, MessageSquare, Dumbbell, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function AdminExpired() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: expiredMembers = [], isLoading } = useQuery<Array<{
    id: string;
    name: string;
    email: string;
    programExpiryDate: string | null;
    whatsAppExpiryDate: string | null;
    hasWhatsAppSupport: boolean;
    programExpired: boolean;
    whatsAppExpired: boolean;
  }>>({
    queryKey: ["/api/admin/whatsapp/expired-members"],
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

  const removeExpiredMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/whatsapp/expired-members/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whatsapp/expired-members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/archived-items"] });
      toast({ variant: "success", title: "Archived", description: "Member archived from expired list" });
    },
  });

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

        <Card className="border-red-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-50 to-red-100/50 border-b border-red-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-red-100">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-red-900">Expired Members</CardTitle>
                  <p className="text-sm text-red-600 mt-1">Members needing renewal</p>
                </div>
              </div>
              <Badge className="bg-red-100 text-red-700 text-lg px-4 py-1">
                {expiredMembers.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : expiredMembers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Check className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No expired members</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Member</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Expiry Date</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Emails Sent</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {expiredMembers.map((member) => {
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
                            <div className="flex flex-col gap-1">
                              {member.whatsAppExpired && (
                                <Badge variant="outline" className="w-fit bg-red-50 text-red-700 border-red-200">
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                  WhatsApp
                                </Badge>
                              )}
                              {member.programExpired && (
                                <Badge variant="outline" className="w-fit bg-amber-50 text-amber-700 border-amber-200">
                                  <Dumbbell className="w-3 h-3 mr-1" />
                                  Program
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {member.whatsAppExpiryDate && (
                              <div>WA: {new Date(member.whatsAppExpiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                            )}
                            {member.programExpiryDate && (
                              <div>Prog: {new Date(member.programExpiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              {emailLogs.slice(0, 2).map((log, idx) => (
                                <div key={idx} className={cn(
                                  "text-xs px-2 py-1 rounded-md w-fit",
                                  idx === 0 && logCount > 1 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                                )}>
                                  {idx === 0 && logCount > 1 ? "Follow-up" : "Initial"}: {new Date(log.sent_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })}
                                </div>
                              ))}
                              {logCount === 0 && <span className="text-xs text-gray-400">No emails sent</span>}
                            </div>
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
                                onClick={() => logEmailMutation.mutate({ userId: member.id, emailType: 'expired' })}
                                disabled={logCount >= 2}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                className="h-8 px-3 rounded-md bg-red-100 hover:bg-red-200 text-red-600"
                                onClick={() => {
                                  if (confirm(`Archive ${member.name || member.email}?`)) {
                                    removeExpiredMemberMutation.mutate(member.id);
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