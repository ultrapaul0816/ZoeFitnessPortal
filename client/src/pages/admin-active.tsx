import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Activity, Search, Download, ChevronDown, FileText, FileSpreadsheet, Calendar as CalendarIcon, Phone } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useMemo } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from "date-fns";
import jsPDF from "jspdf";
import type { User } from "@shared/schema";
import type { DateRange } from "react-day-picker";

export default function AdminActive() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"daily" | "weekly" | "monthly">("daily");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  const { data: allUsers = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const members = allUsers.filter(u => !u.isAdmin && u.termsAccepted);

  const activeMembers = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;
    
    if (filterType === "daily" && dateRange?.from) {
      startDate = dateRange.from;
      endDate = dateRange.to || now;
    } else if (filterType === "weekly") {
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
    } else if (filterType === "monthly") {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    } else {
      startDate = subDays(now, 7);
    }
    
    return members.filter(member => {
      if (!member.createdAt) return false;
      const createdAt = new Date(member.createdAt);
      return createdAt >= startDate && createdAt <= endDate;
    }).sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [members, filterType, dateRange]);

  const filteredMembers = activeMembers.filter(member => {
    const name = `${member.firstName || ''} ${member.lastName || ''}`.toLowerCase();
    const email = (member.email || '').toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
  });

  const getDateRangeLabel = () => {
    if (filterType === "daily" && dateRange?.from) {
      const fromStr = format(dateRange.from, "d MMM");
      const toStr = dateRange.to ? format(dateRange.to, "d MMM") : format(new Date(), "d MMM");
      return `${fromStr} to ${toStr}`;
    }
    if (filterType === "weekly") {
      const start = startOfWeek(new Date(), { weekStartsOn: 1 });
      const end = endOfWeek(new Date(), { weekStartsOn: 1 });
      return `${format(start, "d MMM")} to ${format(end, "d MMM")}`;
    }
    if (filterType === "monthly") {
      return format(new Date(), "MMMM yyyy");
    }
    return "";
  };

  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    
    doc.setFontSize(18);
    doc.setTextColor(22, 163, 74);
    doc.text('Active Members', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${now} IST | Period: ${getDateRangeLabel()} | Total: ${filteredMembers.length} members`, 14, 28);
    
    doc.setFontSize(8);
    doc.setTextColor(0);
    let y = 40;
    
    doc.setFillColor(245, 245, 245);
    doc.rect(14, y - 5, 268, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Name', 16, y);
    doc.text('Email', 55, y);
    doc.text('Phone', 115, y);
    doc.text('Joined', 165, y);
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
      const joined = member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
      
      doc.text(name.substring(0, 20), 16, y);
      doc.text((member.email || '').substring(0, 30), 55, y);
      doc.text((member.phone || '-').substring(0, 15), 115, y);
      doc.text(joined, 165, y);
      doc.text((member.country || '-').substring(0, 15), 210, y);
      doc.text(member.hasWhatsAppSupport ? 'Yes' : 'No', 250, y);
      y += 8;
    });
    
    doc.save(`active-members-${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: "Exported", description: "PDF downloaded successfully" });
  };

  const exportToExcel = () => {
    const headers = ['Name', 'Email', 'Phone', 'Joined', 'Country', 'Has WhatsApp Support'];
    const rows = filteredMembers.map((member) => {
      const name = `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;
      const joined = member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
      return [
        name,
        member.email || '',
        member.phone || '',
        joined,
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
              <h1 className="text-2xl font-bold text-gray-900">New Signups</h1>
              <p className="text-sm text-gray-500">Members who joined during the selected period</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50 min-w-[180px]">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {getDateRangeLabel()}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="end">
                <div className="space-y-4">
                  <RadioGroup value={filterType} onValueChange={(v) => setFilterType(v as "daily" | "weekly" | "monthly")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="daily" id="daily" />
                      <Label htmlFor="daily" className="font-medium">Daily</Label>
                    </div>
                    {filterType === "daily" && (
                      <div className="ml-6 space-y-2">
                        <Calendar
                          mode="range"
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={1}
                          className="rounded-md border"
                        />
                        {dateRange?.from && (
                          <p className="text-sm text-blue-600">
                            Selected: {format(dateRange.from, "d MMM")} to {dateRange.to ? format(dateRange.to, "d MMM") : "..."}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="weekly" id="weekly" />
                      <Label htmlFor="weekly" className="font-medium">Weekly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly" className="font-medium">Monthly</Label>
                    </div>
                  </RadioGroup>
                </div>
              </PopoverContent>
            </Popover>
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
                    <th className="text-left py-4 px-4 text-sm font-semibold text-green-900">Joined</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-green-900">Country</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-green-900">WhatsApp</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">Loading members...</td>
                    </tr>
                  ) : filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">
                        No members joined during this period
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => {
                      const name = `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'No name';
                      const joined = member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
                      
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
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Phone className="w-3 h-3" />
                              {member.phone || '-'}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <CalendarIcon className="w-3 h-3" />
                              {joined}
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
                Showing <span className="font-semibold text-green-600">{filteredMembers.length}</span> members who joined during <span className="font-semibold">{getDateRangeLabel()}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
