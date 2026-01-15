import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MessageSquare, Search, Download, ChevronDown, FileText, FileSpreadsheet, Calendar, Phone, Mail } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import jsPDF from "jspdf";
import type { User } from "@shared/schema";

export default function AdminWhatsApp() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allUsers = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const whatsappMembers = allUsers.filter(u => !u.isAdmin && u.hasWhatsAppSupport);
  
  const filteredMembers = whatsappMembers.filter(member => {
    const name = `${member.firstName || ''} ${member.lastName || ''}`.toLowerCase();
    const email = (member.email || '').toLowerCase();
    const phone = (member.phone || '').toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || 
           email.includes(searchQuery.toLowerCase()) ||
           phone.includes(searchQuery.toLowerCase());
  }).sort((a, b) => {
    const dateA = a.whatsAppSupportExpiryDate ? new Date(a.whatsAppSupportExpiryDate).getTime() : 0;
    const dateB = b.whatsAppSupportExpiryDate ? new Date(b.whatsAppSupportExpiryDate).getTime() : 0;
    return dateA - dateB;
  });

  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getExpiryStatus = (date: Date | string | null) => {
    if (!date) return { label: 'No Expiry', color: 'gray' };
    const now = new Date();
    const expiry = new Date(date);
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Expired', color: 'red' };
    if (diffDays <= 7) return { label: `${diffDays}d left`, color: 'amber' };
    if (diffDays <= 30) return { label: `${diffDays}d left`, color: 'yellow' };
    return { label: 'Active', color: 'green' };
  };

  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    
    doc.setFontSize(18);
    doc.setTextColor(59, 130, 246);
    doc.text('WhatsApp Community Support Members', 14, 20);
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
    doc.text('Phone', 120, y);
    doc.text('WA Start Date', 170, y);
    doc.text('WA Expiry Date', 210, y);
    doc.text('Status', 255, y);
    y += 10;
    
    doc.setFont('helvetica', 'normal');
    filteredMembers.forEach((member) => {
      if (y > 190) {
        doc.addPage();
        y = 20;
      }
      const name = `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;
      const startDate = formatDate(member.whatsAppSupportStartDate);
      const expiryDate = formatDate(member.whatsAppSupportExpiryDate);
      const status = getExpiryStatus(member.whatsAppSupportExpiryDate);
      
      doc.text(name.substring(0, 20), 16, y);
      doc.text((member.email || '').substring(0, 32), 55, y);
      doc.text((member.phone || '-').substring(0, 15), 120, y);
      doc.text(startDate, 170, y);
      doc.text(expiryDate, 210, y);
      doc.text(status.label, 255, y);
      y += 8;
    });
    
    doc.save(`whatsapp-members-${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: "Exported", description: "PDF downloaded successfully" });
  };

  const exportToExcel = () => {
    const headers = ['Name', 'Email', 'Phone', 'WA Start Date', 'WA Expiry Date', 'Status', 'Country'];
    const rows = filteredMembers.map((member) => {
      const name = `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;
      const status = getExpiryStatus(member.whatsAppSupportExpiryDate);
      return [
        name,
        member.email || '',
        member.phone || '',
        formatDate(member.whatsAppSupportStartDate),
        formatDate(member.whatsAppSupportExpiryDate),
        status.label,
        member.country || ''
      ];
    });
    
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `whatsapp-members-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: "Exported", description: "Excel file downloaded successfully" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')} className="hover:bg-blue-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">WhatsApp Community Support</h1>
              <p className="text-sm text-gray-500">Members with Heal Your Core + WhatsApp Support</p>
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
                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
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

        <Card className="border-blue-100 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-blue-900">Member</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-blue-900">Phone</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-blue-900">WA Start</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-blue-900">WA Expiry</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-blue-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">Loading members...</td>
                    </tr>
                  ) : filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">No members with WhatsApp support found</td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => {
                      const name = `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'No name';
                      const status = getExpiryStatus(member.whatsAppSupportExpiryDate);
                      
                      return (
                        <tr key={member.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                                {name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{name}</p>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Mail className="w-3 h-3" />
                                  {member.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Phone className="w-3 h-3" />
                              {member.phone || '-'}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="w-3 h-3" />
                              {formatDate(member.whatsAppSupportStartDate)}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="w-3 h-3" />
                              {formatDate(member.whatsAppSupportExpiryDate)}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={
                              status.color === 'red' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                              status.color === 'amber' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' :
                              status.color === 'yellow' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' :
                              status.color === 'green' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                              'bg-gray-100 text-gray-600 hover:bg-gray-100'
                            }>
                              {status.label}
                            </Badge>
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
                Showing <span className="font-semibold">{filteredMembers.length}</span> members with WhatsApp support
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
