import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, Search, Download, ChevronDown, FileText, FileSpreadsheet, Mail, Phone, Calendar, CheckCircle, XCircle, Send, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import jsPDF from "jspdf";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export default function AdminMembers() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [emailDialogUser, setEmailDialogUser] = useState<User | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");

  const { data: allUsers = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (data: { userId: string; subject: string; message: string }) => {
      const res = await apiRequest("POST", "/api/admin/send-email", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Email sent!", description: `Email sent to ${emailDialogUser?.email}` });
      setEmailDialogUser(null);
      setEmailSubject("");
      setEmailMessage("");
    },
    onError: (error: any) => {
      toast({ title: "Failed to send", description: error.message || "Something went wrong", variant: "destructive" });
    },
  });

  const members = allUsers.filter(u => !u.isAdmin);
  
  const filteredMembers = members.filter(member => {
    const name = `${member.firstName || ''} ${member.lastName || ''}`.toLowerCase();
    const email = (member.email || '').toLowerCase();
    const phone = (member.phone || '').toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || 
           email.includes(searchQuery.toLowerCase()) ||
           phone.includes(searchQuery.toLowerCase());
  });

  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    
    doc.setFontSize(18);
    doc.setTextColor(219, 39, 119);
    doc.text('All Members', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${now} IST | Total: ${filteredMembers.length} members`, 14, 28);
    
    doc.setFontSize(8);
    doc.setTextColor(0);
    let y = 40;
    
    doc.setFillColor(245, 245, 245);
    doc.rect(14, y - 5, 268, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Name', 16, y);
    doc.text('Email', 55, y);
    doc.text('Phone', 115, y);
    doc.text('Country', 160, y);
    doc.text('Joined', 195, y);
    doc.text('Status', 230, y);
    y += 10;
    
    doc.setFont('helvetica', 'normal');
    filteredMembers.forEach((member) => {
      if (y > 190) {
        doc.addPage();
        y = 20;
      }
      const name = `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;
      const status = member.termsAccepted ? 'Active' : 'Pending';
      const joined = member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
      
      doc.text(name.substring(0, 20), 16, y);
      doc.text((member.email || '').substring(0, 30), 55, y);
      doc.text((member.phone || '-').substring(0, 15), 115, y);
      doc.text((member.country || '-').substring(0, 15), 160, y);
      doc.text(joined, 195, y);
      doc.text(status, 230, y);
      y += 8;
    });
    
    doc.save(`all-members-${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: "Exported", description: "PDF downloaded successfully" });
  };

  const exportToExcel = () => {
    const headers = ['Name', 'Email', 'Phone', 'Country', 'Joined', 'Status', 'Has WhatsApp Support'];
    const rows = filteredMembers.map((member) => {
      const name = `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;
      const status = member.termsAccepted ? 'Active' : 'Pending';
      const joined = member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
      return [
        name,
        member.email || '',
        member.phone || '',
        member.country || '',
        joined,
        status,
        member.hasWhatsAppSupport ? 'Yes' : 'No'
      ];
    });
    
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `all-members-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: "Exported", description: "Excel file downloaded successfully" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')} className="hover:bg-pink-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">All Members</h1>
              <p className="text-sm text-gray-500">Complete list of registered members</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-pink-200 text-pink-700 hover:bg-pink-50">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={exportToPDF}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToExcel}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Card className="border-pink-100 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-pink-900">Member</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-pink-900">Contact</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-pink-900">Country</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-pink-900">Joined</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-pink-900">Status</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-pink-900">WhatsApp</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-pink-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500">Loading members...</td>
                    </tr>
                  ) : filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500">No members found</td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => {
                      const name = `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'No name';
                      const joined = member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
                      
                      return (
                        <tr key={member.id} className="border-b border-gray-100 hover:bg-pink-50/30 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-semibold text-sm">
                                {name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{name}</p>
                                <p className="text-xs text-gray-500">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Mail className="w-3 h-3" />
                                <span className="truncate max-w-[150px]">{member.email}</span>
                              </div>
                              {member.phone && (
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Phone className="w-3 h-3" />
                                  {member.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600">{member.country || '-'}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="w-3 h-3" />
                              {joined}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {member.termsAccepted ? (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                <XCircle className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {member.hasWhatsAppSupport ? (
                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Yes</Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-500">No</Badge>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Send Email"
                              onClick={() => setEmailDialogUser(member)}
                              className="h-8 w-8 text-pink-600 hover:text-pink-700 hover:bg-pink-50"
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredMembers.length}</span> of <span className="font-semibold">{members.length}</span> members
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!emailDialogUser} onOpenChange={(open) => { if (!open) { setEmailDialogUser(null); setEmailSubject(""); setEmailMessage(""); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-pink-600" />
              Send Email
            </DialogTitle>
            <DialogDescription>
              Send an email to {emailDialogUser?.firstName} {emailDialogUser?.lastName} ({emailDialogUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Subject</label>
              <Input
                placeholder="Email subject..."
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Message</label>
              <Textarea
                placeholder="Type your message here..."
                rows={6}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setEmailDialogUser(null); setEmailSubject(""); setEmailMessage(""); }}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!emailDialogUser || !emailSubject.trim() || !emailMessage.trim()) return;
                  sendEmailMutation.mutate({ userId: emailDialogUser.id, subject: emailSubject, message: emailMessage });
                }}
                disabled={sendEmailMutation.isPending || !emailSubject.trim() || !emailMessage.trim()}
                className="bg-pink-600 hover:bg-pink-700 text-white"
              >
                {sendEmailMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" /> Send Email</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
