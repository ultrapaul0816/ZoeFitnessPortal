import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Clock, Mail, Check, MessageSquare, Dumbbell, RefreshCw, AlertTriangle, Copy, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminExpiring() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [extensionDialogOpen, setExtensionDialogOpen] = useState(false);
  const [extensionMember, setExtensionMember] = useState<{
    id: string;
    name: string;
    email: string;
    programExpiryDate?: string | null;
    whatsAppExpiryDate?: string | null;
  } | null>(null);
  const [extensionMonths, setExtensionMonths] = useState<number>(3);

  const [reminderEmailData, setReminderEmailData] = useState<{
    userName: string;
    userEmail: string;
    programExpiryDate?: string | null;
    whatsAppExpiryDate?: string | null;
  } | null>(null);

  const { data: adminStats, isLoading } = useQuery<{
    totalMembers: number;
    activeMembers: number;
    expiringSoon: number;
    expiringUsers: Array<{
      userId: string;
      userName: string;
      userEmail: string;
      programExpiring: boolean;
      whatsAppExpiring: boolean;
      programExpiryDate?: string;
      whatsAppExpiryDate?: string;
    }>;
  }>({
    queryKey: ["/api/admin/stats"],
  });

  const expiringMembers = adminStats?.expiringUsers || [];

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

  const extendMembershipMutation = useMutation({
    mutationFn: async (data: { userId: string; months: number; notes?: string }) => {
      const response = await apiRequest("POST", `/api/admin/whatsapp/extend/${data.userId}`, {
        months: data.months,
        notes: data.notes,
      });
      return response.json();
    },
    onSuccess: async () => {
      toast({ title: "Success", description: `Membership extended by ${extensionMonths} months!` });
      setExtensionDialogOpen(false);
      setExtensionMember(null);
      setExtensionMonths(3);
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to extend membership", variant: "destructive" });
    },
  });

  const generateReminderEmail = (data: { userName: string; programExpiryDate?: string | null; whatsAppExpiryDate?: string | null }) => {
    const formatDate = (dateStr: string | null | undefined) => {
      if (!dateStr) return null;
      return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    };
    
    const programDate = formatDate(data.programExpiryDate);
    const whatsAppDate = formatDate(data.whatsAppExpiryDate);
    
    let expiryInfo = '';
    if (programDate) expiryInfo += `- Heal Your Core Program: ${programDate}\n`;
    if (whatsAppDate) expiryInfo += `- WhatsApp Support: ${whatsAppDate}\n`;

    const subject = `Your Membership is Expiring Soon - Renew to Continue Your Journey!`;
    const body = `Hi ${data.userName},

We wanted to reach out because your membership access is expiring soon.

${expiryInfo}
To continue your recovery journey with full access to your program and our supportive community, please renew your membership.

Renewal: https://rzp.io/rzp/sFzniAWK (Rs. 1,000 for 3 months WhatsApp support)

If you have any questions, please reply to this email.

With love,
Coach Zoe`;

    return { subject, body };
  };

  const getDaysUntilExpiry = (dateStr?: string) => {
    if (!dateStr) return 999;
    const expiryDate = new Date(dateStr);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

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
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Program</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Days Left</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry Date</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Emails Sent</th>
                      <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {expiringMembers.map((member) => {
                      const emailLogs = getUserEmailLogs(member.userId);
                      const logCount = emailLogs.length;
                      const daysLeft = Math.min(
                        member.programExpiring ? getDaysUntilExpiry(member.programExpiryDate) : 999,
                        member.whatsAppExpiring ? getDaysUntilExpiry(member.whatsAppExpiryDate) : 999
                      );
                      
                      return (
                        <tr key={member.userId} className="hover:bg-gradient-to-r hover:from-amber-50/30 hover:to-transparent transition-all duration-200">
                          <td className="px-6 py-5">
                            <div>
                              <p className="font-semibold text-gray-900">{member.userName || 'Unknown'}</p>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-1.5">
                              {member.programExpiring && (
                                <Badge variant="outline" className="w-fit px-3 py-1 rounded-lg font-medium bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200">
                                  <Dumbbell className="w-3.5 h-3.5 mr-1.5" /> Heal Your Core
                                </Badge>
                              )}
                              {member.whatsAppExpiring && (
                                <Badge variant="outline" className="w-fit px-3 py-1 rounded-lg font-medium bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200">
                                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> WhatsApp
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className={cn(
                              "inline-flex items-center px-3 py-1.5 rounded-lg font-bold text-sm",
                              daysLeft <= 2 
                                ? "bg-gradient-to-r from-red-100 to-rose-100 text-red-700" 
                                : daysLeft <= 5 
                                ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700" 
                                : "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700"
                            )}>
                              {daysLeft} days
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="space-y-1 text-sm">
                              {member.programExpiring && member.programExpiryDate && (
                                <div className="flex items-center gap-2">
                                  <Dumbbell className="w-3.5 h-3.5 text-amber-500" />
                                  <span className="font-medium text-gray-700">{new Date(member.programExpiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                              )}
                              {member.whatsAppExpiring && member.whatsAppExpiryDate && (
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="w-3.5 h-3.5 text-green-500" />
                                  <span className="font-medium text-gray-700">{new Date(member.whatsAppExpiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-1.5">
                              {emailLogs.slice(0, 2).map((log, idx) => (
                                <div key={idx} className={cn(
                                  "text-xs px-2.5 py-1 rounded-lg w-fit font-medium",
                                  idx === 0 && logCount > 1 
                                    ? "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700" 
                                    : "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700"
                                )}>
                                  {idx === 0 && logCount > 1 ? "Follow-up" : "Initial"}: {new Date(log.sent_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })} {new Date(log.sent_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}
                                </div>
                              ))}
                              {logCount === 0 && <span className="text-xs text-gray-400 italic">No emails sent</span>}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-9 px-4 text-xs font-medium rounded-lg border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                onClick={() => {
                                  setExtensionMember({
                                    id: member.userId,
                                    name: member.userName,
                                    email: '',
                                    programExpiryDate: member.programExpiryDate,
                                    whatsAppExpiryDate: member.whatsAppExpiryDate,
                                  });
                                  setExtensionDialogOpen(true);
                                }}
                              >
                                Extend
                              </Button>
                              <Button 
                                size="sm" 
                                className="h-9 px-4 text-xs font-medium rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-sm"
                                onClick={() => {
                                  setReminderEmailData({
                                    userName: member.userName,
                                    userEmail: member.userEmail,
                                    programExpiryDate: member.programExpiryDate,
                                    whatsAppExpiryDate: member.whatsAppExpiryDate,
                                  });
                                }}
                              >
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
                                onClick={() => logEmailMutation.mutate({ userId: member.userId, emailType: 'expiring' })}
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

      <Dialog open={extensionDialogOpen} onOpenChange={setExtensionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              Extend Membership
            </DialogTitle>
          </DialogHeader>
          {extensionMember && (
            <div className="space-y-4 pt-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{extensionMember.name}</p>
                <p className="text-sm text-gray-500">{extensionMember.email}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Extension Period</label>
                <Select value={String(extensionMonths)} onValueChange={(v) => setExtensionMonths(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 months (Rs. 1,000)</SelectItem>
                    <SelectItem value="6">6 months (Rs. 2,000)</SelectItem>
                    <SelectItem value="12">12 months (Rs. 4,000)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => { setExtensionDialogOpen(false); setExtensionMember(null); }}>
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                  disabled={extendMembershipMutation.isPending}
                  onClick={() => {
                    if (extensionMember) {
                      extendMembershipMutation.mutate({
                        userId: extensionMember.id,
                        months: extensionMonths,
                        notes: `Extended ${extensionMonths} months`,
                      });
                    }
                  }}
                >
                  {extendMembershipMutation.isPending ? "Extending..." : "Extend"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!reminderEmailData} onOpenChange={(open) => !open && setReminderEmailData(null)}>
        <DialogContent className="sm:max-w-lg bg-gradient-to-br from-white via-pink-50/30 to-rose-50/20">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center shadow-md">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent font-semibold">
                Expiring Soon Reminder
              </span>
            </DialogTitle>
          </DialogHeader>
          {reminderEmailData && (() => {
            const { subject, body } = generateReminderEmail(reminderEmailData);
            return (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">To</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={reminderEmailData.userEmail || 'No email available'} 
                      readOnly 
                      className="bg-white flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(reminderEmailData.userEmail || '');
                        toast({ title: "Email copied!" });
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Subject</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={subject} 
                      readOnly 
                      className="bg-white flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(subject);
                        toast({ title: "Subject copied!" });
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Email Body</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(body);
                        toast({ title: "Email body copied!" });
                      }}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Body
                    </Button>
                  </div>
                  <textarea
                    className="w-full h-48 p-3 text-sm border rounded-lg resize-none bg-white"
                    readOnly
                    value={body}
                  />
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                    onClick={() => {
                      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(reminderEmailData.userEmail || '')}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                      window.open(gmailUrl, '_blank');
                    }}
                  >
                    Open in Gmail
                  </Button>
                  <Button variant="outline" onClick={() => setReminderEmailData(null)}>
                    Close
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
