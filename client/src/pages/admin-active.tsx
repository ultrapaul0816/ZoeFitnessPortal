import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Activity, Search, Download, ChevronDown, FileText, FileSpreadsheet, Calendar, Clock } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useMemo } from "react";
import jsPDF from "jspdf";
import type { User } from "@shared/schema";

export default function AdminActive() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("7");

  const { data: allUsers = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const members = allUsers.filter(u => !u.isAdmin);

  const activeMembers = useMemo(() => {
    const now = new Date();
    const daysAgo = new Date(now.getTime() - parseInt(dateFilter) * 24 * 60 * 60 * 1000);
    
    return members.filter(member => {
      if (!member.lastActiveAt) return false;
      const lastActive = new Date(member.lastActiveAt);
      return lastActive >= daysAgo;
    }).sort((a, b) => {
      const dateA = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
      const dateB = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [members, dateFilter]);

  const filteredMembers = activeMembers.filter(member => {
    const name = `${member.firstName || ''} ${member.lastName || ''}`.toLowerCase();
    const email = (member.email || '').toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
  });

  const formatLastActive = (date: Date | string | null) => {
    if (!date) return '-';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    
    doc.setFontSize(18);
    doc.setTextColor(22, 163, 74);
    doc.text('Active Members', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${now} IST | Filter: Last ${dateFilter} days | Total: ${filteredMembers.length} members`, 14, 28);
    
    doc.setFontSize(8);
    doc.setTextColor(0);
    let y = 40;
    
    doc.setFillColor(245, 245, 245);
    doc.rect(14, y - 5, 268, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Name', 16, y);
    doc.text('Email', 55, y);
    doc.text('Phone', 115, y);
    doc.text('Last Active', 165, y);
    doc.text('Country', 210, y);
    doc.text('WhatsApp', 250, y);
    y += 10;
    
    doc.setFont('helvetica', 'normal');
    filteredMembers.forEach((member) => {
      if (y > 190) {
        doc.addPage();
        y = 20;
      }
      const name = `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;
      const lastActive = member.lastActiveAt ? new Date(member.lastActiveAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-';
      
      doc.text(name.substring(0, 20), 16, y);
      doc.text((member.email || '').substring(0, 30), 55, y);
      doc.text((member.phone || '-').substring(0, 15), 115, y);
      doc.text(lastActive, 165, y);
      doc.text((member.country || '-').substring(0, 15), 210, y);
      doc.text(member.hasWhatsAppSupport ? 'Yes' : 'No', 250, y);
      y += 8;
    });
    
    doc.save(`active-members-${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: "Exported", description: "PDF downloaded successfully" });
  };

  const exportToExcel = () => {
    const headers = ['Name', 'Email', 'Phone', 'Last Active', 'Country', 'Has WhatsApp Support'];
    const rows = filteredMembers.map((member) => {
      const name = `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;
      const lastActive = member.lastActiveAt ? new Date(member.lastActiveAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
      return [
        name,
        member.email || '',
        member.phone || '',
        lastActive,
        member.country || '',
        member.hasWhatsAppSupport ? 'Yes' : 'No'
      ];
    });
    
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `active-members-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: "Exported", description: "Excel file downloaded successfully" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')} className="hover:bg-green-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Active Members</h1>
              <p className="text-sm text-gray-500">Members who have used the app recently</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40 border-green-200">
                <Calendar className="w-4 h-4 mr-2 text-green-600" />
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="60">Last 60 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-48"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
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

        <Card className="border-green-100 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-green-900">Member</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-green-900">Phone</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-green-900">Last Active</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-green-900">Country</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-green-900">WhatsApp</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">Loading active members...</td>
                    </tr>
                  ) : filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">
                        No members active in the last {dateFilter} days
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => {
                      const name = `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'No name';
                      
                      return (
                        <tr key={member.id} className="border-b border-gray-100 hover:bg-green-50/30 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold text-sm">
                                {name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{name}</p>
                                <p className="text-xs text-gray-500">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600">{member.phone || '-'}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Clock className="w-3 h-3" />
                                {formatLastActive(member.lastActiveAt)}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600">{member.country || '-'}</span>
                          </td>
                          <td className="py-4 px-4">
                            {member.hasWhatsAppSupport ? (
                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Yes</Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-500">No</Badge>
                            )}
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
                Showing <span className="font-semibold">{filteredMembers.length}</span> active members in the last <span className="font-semibold">{dateFilter}</span> days
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
