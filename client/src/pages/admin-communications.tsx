import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Mail, MessageSquare, Send, ArrowUpRight, ArrowDownLeft, CheckCircle, XCircle, Clock, Hash, User, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { className: string; label: string }> = {
    sent: { className: "bg-green-100 text-green-800 border-green-200", label: "Sent" },
    delivered: { className: "bg-blue-100 text-blue-800 border-blue-200", label: "Delivered" },
    failed: { className: "bg-red-100 text-red-800 border-red-200", label: "Failed" },
    bounced: { className: "bg-orange-100 text-orange-800 border-orange-200", label: "Bounced" },
    received: { className: "bg-purple-100 text-purple-800 border-purple-200", label: "Received" },
  };
  const v = variants[status] || { className: "bg-gray-100 text-gray-600 border-gray-200", label: status };
  return <Badge variant="outline" className={v.className}>{v.label}</Badge>;
}

function MessageTypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    welcome: "Welcome",
    "magic-link": "Magic Link",
    campaign: "Campaign",
    "admin-send": "Admin Send",
    "re-engagement": "Re-engagement",
    "program-reminder": "Program Reminder",
    "completion-celebration": "Completion",
    "whatsapp-expiry": "WhatsApp Expiry",
    "daily-workout-reminder": "Daily Reminder",
    test: "Test",
    coaching: "Coaching",
    custom: "Custom",
  };
  return <Badge variant="secondary" className="text-xs">{labels[type] || type}</Badge>;
}

export default function AdminCommunications() {
  const { isLoading: authLoading, isAdmin } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("communications");
  const [channel, setChannel] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [messageType, setMessageType] = useState<string>("");
  const [page, setPage] = useState(0);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  const queryParams = new URLSearchParams();
  if (channel) queryParams.set("channel", channel);
  if (status) queryParams.set("status", status);
  if (messageType) queryParams.set("messageType", messageType);
  queryParams.set("limit", "50");
  queryParams.set("offset", String(page * 50));

  const { data, isLoading } = useQuery<{ entries: any[]; total: number }>({
    queryKey: ["/api/admin/communications-log", channel, status, messageType, page],
    queryFn: () => fetch(`/api/admin/communications-log?${queryParams.toString()}`).then(r => r.json()),
    enabled: isAdmin,
  });

  const { data: stats } = useQuery<any>({
    queryKey: ["/api/admin/communications-log/stats"],
    enabled: isAdmin,
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const entries = data?.entries || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 50);

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Send className="h-8 w-8 text-pink-500" />
          <h1 className="text-2xl font-bold text-gray-900">Communications Log</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-gray-500">Total Messages</p>
              <p className="text-2xl font-bold">{stats?.total || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-gray-500">Emails Sent</p>
              <p className="text-2xl font-bold text-green-600">{stats?.sent || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-gray-500">Failed</p>
              <p className="text-2xl font-bold text-red-600">{stats?.failed || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-gray-500">WhatsApp</p>
              <p className="text-2xl font-bold text-gray-400">0</p>
              <p className="text-xs text-gray-400">Coming Soon</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={channel} onValueChange={(v) => { setChannel(v === "all" ? "" : v); setPage(0); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Channels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={(v) => { setStatus(v === "all" ? "" : v); setPage(0); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="bounced">Bounced</SelectItem>
            </SelectContent>
          </Select>

          <Select value={messageType} onValueChange={(v) => { setMessageType(v === "all" ? "" : v); setPage(0); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="welcome">Welcome</SelectItem>
              <SelectItem value="magic-link">Magic Link</SelectItem>
              <SelectItem value="campaign">Campaign</SelectItem>
              <SelectItem value="admin-send">Admin Send</SelectItem>
              <SelectItem value="re-engagement">Re-engagement</SelectItem>
              <SelectItem value="program-reminder">Program Reminder</SelectItem>
              <SelectItem value="completion-celebration">Completion</SelectItem>
              <SelectItem value="whatsapp-expiry">WhatsApp Expiry</SelectItem>
              <SelectItem value="daily-workout-reminder">Daily Reminder</SelectItem>
              <SelectItem value="test">Test</SelectItem>
              <SelectItem value="coaching">Coaching</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          </div>
        ) : entries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg font-medium">No communications yet</p>
              <p className="text-gray-400 text-sm mt-1">Messages will appear here as emails are sent</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3 font-medium text-gray-600">Time</th>
                        <th className="text-left p-3 font-medium text-gray-600">Channel</th>
                        <th className="text-left p-3 font-medium text-gray-600">Recipient</th>
                        <th className="text-left p-3 font-medium text-gray-600">Subject</th>
                        <th className="text-left p-3 font-medium text-gray-600">Type</th>
                        <th className="text-left p-3 font-medium text-gray-600">Status</th>
                        <th className="text-left p-3 font-medium text-gray-600">Message ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry: any) => (
                        <tr
                          key={entry.id}
                          className="border-b hover:bg-pink-50/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <td className="p-3 text-gray-500 whitespace-nowrap text-xs">
                            {new Date(entry.createdAt).toLocaleString()}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              {entry.channel === "email" ? (
                                <Mail className="w-4 h-4 text-pink-500" />
                              ) : (
                                <MessageSquare className="w-4 h-4 text-green-500" />
                              )}
                              {entry.direction === "outgoing" ? (
                                <ArrowUpRight className="w-3 h-3 text-gray-400" />
                              ) : (
                                <ArrowDownLeft className="w-3 h-3 text-blue-400" />
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              {entry.recipientName && (
                                <p className="font-medium text-gray-900 text-xs">{entry.recipientName}</p>
                              )}
                              <p className="text-gray-500 text-xs">
                                {entry.recipientEmail || entry.recipientPhone || "—"}
                              </p>
                            </div>
                          </td>
                          <td className="p-3 text-gray-700 max-w-[200px] truncate text-xs">
                            {entry.subject || "—"}
                          </td>
                          <td className="p-3">
                            {entry.messageType && <MessageTypeBadge type={entry.messageType} />}
                          </td>
                          <td className="p-3">
                            <StatusBadge status={entry.status} />
                          </td>
                          <td className="p-3 text-gray-400 text-xs font-mono max-w-[120px] truncate">
                            {entry.messageId || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {page * 50 + 1}–{Math.min((page + 1) * 50, total)} of {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEntry?.channel === "email" ? (
                <Mail className="w-5 h-5 text-pink-500" />
              ) : (
                <MessageSquare className="w-5 h-5 text-green-500" />
              )}
              Message Details
            </DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Channel</p>
                  <p className="font-medium capitalize">{selectedEntry.channel}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Direction</p>
                  <p className="font-medium capitalize">{selectedEntry.direction}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Provider</p>
                  <p className="font-medium capitalize">{selectedEntry.provider}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Status</p>
                  <StatusBadge status={selectedEntry.status} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Type</p>
                  {selectedEntry.messageType ? <MessageTypeBadge type={selectedEntry.messageType} /> : <span className="text-gray-400">—</span>}
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Sent At</p>
                  <p className="font-medium text-xs">{new Date(selectedEntry.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">Recipient</span>
                </div>
                <p className="text-sm">
                  {selectedEntry.recipientName && <span className="font-medium">{selectedEntry.recipientName}</span>}
                  {selectedEntry.recipientEmail && <span className="text-gray-500 ml-1">({selectedEntry.recipientEmail})</span>}
                  {selectedEntry.recipientPhone && <span className="text-gray-500 ml-1">{selectedEntry.recipientPhone}</span>}
                </p>
              </div>

              {selectedEntry.subject && (
                <div className="border-t pt-3">
                  <p className="text-gray-500 text-xs mb-1">Subject</p>
                  <p className="text-sm font-medium">{selectedEntry.subject}</p>
                </div>
              )}

              {selectedEntry.contentPreview && (
                <div className="border-t pt-3">
                  <p className="text-gray-500 text-xs mb-1">Content Preview</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded p-3">{selectedEntry.contentPreview}</p>
                </div>
              )}

              {selectedEntry.messageId && (
                <div className="border-t pt-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Hash className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-500 text-xs">Message ID</span>
                  </div>
                  <p className="text-xs font-mono text-gray-600 break-all">{selectedEntry.messageId}</p>
                </div>
              )}

              {selectedEntry.errorMessage && (
                <div className="border-t pt-3">
                  <p className="text-red-500 text-xs mb-1 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Error
                  </p>
                  <p className="text-sm text-red-700 bg-red-50 rounded p-3">{selectedEntry.errorMessage}</p>
                </div>
              )}

              {selectedEntry.userId && (
                <div className="border-t pt-3">
                  <p className="text-gray-500 text-xs mb-1">User ID</p>
                  <p className="text-xs font-mono text-gray-600">{selectedEntry.userId}</p>
                </div>
              )}

              {selectedEntry.metadata && (
                <div className="border-t pt-3">
                  <p className="text-gray-500 text-xs mb-1">Metadata</p>
                  <pre className="text-xs bg-gray-50 rounded p-3 overflow-auto max-h-32">
                    {JSON.stringify(selectedEntry.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
