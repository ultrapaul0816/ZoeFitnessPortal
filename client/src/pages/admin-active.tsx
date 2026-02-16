import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Search, Download, ChevronDown, FileText, FileSpreadsheet, Calendar as CalendarIcon, Phone, Users, Heart, BookOpen, MessageCircle, Mail } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useMemo } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from "date-fns";
// jsPDF is lazy-loaded in exportToPDF to save 408KB from initial bundle
import type { DateRange } from "react-day-picker";
import { apiRequest } from "@/lib/queryClient";

interface MasterUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  country: string | null;
  createdAt: string | null;
  hasWhatsAppSupport: boolean;
  isDeactivated: boolean;
  profilePictureUrl: string | null;
  coachingInfo: { status: string; isPregnant: boolean } | null;
  enrolledCourses: Array<{ courseId: string; courseTitle: string; status: string }>;
}

type FilterTab = "all" | "coaching" | "courses" | "whatsapp";

const coachingStatusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-yellow-100 text-yellow-700",
  pending_plan: "bg-orange-100 text-orange-700",
  paused: "bg-gray-100 text-gray-500",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

function SendEmailDialog({ user, onClose }: { user: MasterUser | null; onClose: () => void }) {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const sendEmail = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/send-email", {
        userId: user!.id,
        subject,
        message,
      });
    },
    onSuccess: () => {
      toast({ title: "Email sent!", description: `Email sent to ${user?.firstName || user?.email}` });
      setSubject("");
      setMessage("");
      onClose();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to send email", description: error.message, variant: "destructive" });
    },
  });

  const recipientName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'No name' : '';

  return (
    <Dialog open={!!user} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-pink-500" />
            Send Email
          </DialogTitle>
          <DialogDescription>
            Send a direct email to <span className="font-semibold">{recipientName}</span> ({user?.email})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="email-subject" className="text-sm font-medium">Subject</Label>
            <Input
              id="email-subject"
              placeholder="Email subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email-message" className="text-sm font-medium">Message</Label>
            <Textarea
              id="email-message"
              placeholder="Write your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={sendEmail.isPending}>
              Cancel
            </Button>
            <Button
              onClick={() => sendEmail.mutate()}
              disabled={!subject.trim() || !message.trim() || sendEmail.isPending}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              {sendEmail.isPending ? "Sending..." : "Send Email"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminActive() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [emailDialogUser, setEmailDialogUser] = useState<MasterUser | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [filterByDate, setFilterByDate] = useState(false);
  const [filterType, setFilterType] = useState<"daily" | "weekly" | "monthly">("daily");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  const { data: allUsers = [], isLoading } = useQuery<MasterUser[]>({
    queryKey: ["/api/admin/users/master-list"],
  });

  const stats = useMemo(() => {
    return {
      total: allUsers.length,
      coaching: allUsers.filter(u => u.coachingInfo).length,
      courses: allUsers.filter(u => u.enrolledCourses.length > 0).length,
      whatsapp: allUsers.filter(u => u.hasWhatsAppSupport).length,
    };
  }, [allUsers]);

  const filteredMembers = useMemo(() => {
    let result = allUsers;

    if (activeTab === "coaching") {
      result = result.filter(u => u.coachingInfo);
    } else if (activeTab === "courses") {
      result = result.filter(u => u.enrolledCourses.length > 0);
    } else if (activeTab === "whatsapp") {
      result = result.filter(u => u.hasWhatsAppSupport);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u => {
        const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
        const email = (u.email || '').toLowerCase();
        return name.includes(q) || email.includes(q);
      });
    }

    if (filterByDate) {
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

      result = result.filter(u => {
        if (!u.createdAt) return false;
        const createdAt = new Date(u.createdAt);
        return createdAt >= startDate && createdAt <= endDate;
      });
    }

    return result.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [allUsers, activeTab, searchQuery, filterByDate, filterType, dateRange]);

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

  const getMemberType = (member: MasterUser): string => {
    const types: string[] = [];
    if (member.coachingInfo) types.push(`Coaching (${member.coachingInfo.status})`);
    if (member.enrolledCourses.length > 0) types.push(`Courses: ${member.enrolledCourses.map(c => c.courseTitle).join(', ')}`);
    if (member.hasWhatsAppSupport) types.push('WhatsApp');
    return types.join(' | ') || 'Member';
  };

  const exportToPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF('landscape');
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    doc.setFontSize(18);
    doc.setTextColor(22, 163, 74);
    doc.text('All Members - Master List', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    const filterLabel = filterByDate ? ` | Period: ${getDateRangeLabel()}` : '';
    doc.text(`Generated: ${now} IST${filterLabel} | Total: ${filteredMembers.length} members`, 14, 28);

    doc.setFontSize(7);
    doc.setTextColor(0);
    let y = 40;

    doc.setFillColor(245, 245, 245);
    doc.rect(14, y - 5, 268, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Name', 16, y);
    doc.text('Email', 50, y);
    doc.text('Phone', 100, y);
    doc.text('Type', 130, y);
    doc.text('Coaching', 170, y);
    doc.text('Courses', 200, y);
    doc.text('Joined', 240, y);
    doc.text('Status', 265, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    filteredMembers.forEach((member) => {
      if (y > 190) {
        doc.addPage();
        y = 20;
      }
      const name = `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;
      const joined = member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
      const type = getMemberType(member);
      const coachingStatus = member.coachingInfo ? `${member.coachingInfo.status}${member.coachingInfo.isPregnant ? ' (Pregnant)' : ''}` : '-';
      const courses = member.enrolledCourses.map(c => c.courseTitle).join(', ') || '-';
      const status = member.isDeactivated ? 'Deactivated' : 'Active';

      doc.text(name.substring(0, 18), 16, y);
      doc.text((member.email || '').substring(0, 25), 50, y);
      doc.text((member.phone || '-').substring(0, 15), 100, y);
      doc.text(type.substring(0, 20), 130, y);
      doc.text(coachingStatus.substring(0, 15), 170, y);
      doc.text(courses.substring(0, 20), 200, y);
      doc.text(joined, 240, y);
      doc.text(status, 265, y);
      y += 8;
    });

    doc.save(`all-members-${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: "Exported", description: "PDF downloaded successfully" });
  };

  const exportToExcel = () => {
    const headers = ['Name', 'Email', 'Phone', 'Type', 'Coaching Status', 'Pregnant', 'Courses', 'Joined', 'Country', 'Status', 'WhatsApp'];
    const rows = filteredMembers.map((member) => {
      const name = `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;
      const joined = member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
      return [
        name,
        member.email || '',
        member.phone || '',
        getMemberType(member),
        member.coachingInfo?.status || '',
        member.coachingInfo?.isPregnant ? 'Yes' : '',
        member.enrolledCourses.map(c => c.courseTitle).join(', '),
        joined,
        member.country || '',
        member.isDeactivated ? 'Deactivated' : 'Active',
        member.hasWhatsAppSupport ? 'Yes' : 'No',
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

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All Members", count: stats.total },
    { key: "coaching", label: "Coaching Clients", count: stats.coaching },
    { key: "courses", label: "Course Members", count: stats.courses },
    { key: "whatsapp", label: "WhatsApp", count: stats.whatsapp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')} className="hover:bg-green-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">All Members</h1>
              <p className="text-sm text-gray-500">Master member list with status across the platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-56"
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-green-100">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">Total Members</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-pink-100">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Heart className="w-5 h-5 text-pink-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.coaching}</p>
                <p className="text-xs text-gray-500">Coaching Clients</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-100">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.courses}</p>
                <p className="text-xs text-gray-500">Course Members</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-100">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageCircle className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.whatsapp}</p>
                <p className="text-xs text-gray-500">WhatsApp Members</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-green-600 text-white shadow-sm"
                    : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-2">
              <Checkbox
                id="filterByDate"
                checked={filterByDate}
                onCheckedChange={(checked) => setFilterByDate(checked === true)}
              />
              <Label htmlFor="filterByDate" className="text-sm text-gray-600 cursor-pointer">Filter by join date</Label>
            </div>
            {filterByDate && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    {getDateRangeLabel()}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="end">
                  <div className="space-y-4">
                    <RadioGroup value={filterType} onValueChange={(v) => setFilterType(v as "daily" | "weekly" | "monthly")}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="daily" id="daily" />
                        <Label htmlFor="daily" className="font-medium">Custom Range</Label>
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
                        <Label htmlFor="weekly" className="font-medium">This Week</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="monthly" id="monthly" />
                        <Label htmlFor="monthly" className="font-medium">This Month</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        <Card className="border-green-100 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-green-900">Member</th>
                    <th className="text-left py-4 px-3 text-sm font-semibold text-green-900">Phone</th>
                    <th className="text-left py-4 px-3 text-sm font-semibold text-green-900">Type</th>
                    <th className="text-left py-4 px-3 text-sm font-semibold text-green-900">Coaching Status</th>
                    <th className="text-left py-4 px-3 text-sm font-semibold text-green-900">Courses</th>
                    <th className="text-left py-4 px-3 text-sm font-semibold text-green-900">Joined</th>
                    <th className="text-left py-4 px-3 text-sm font-semibold text-green-900">Status</th>
                    <th className="text-left py-4 px-3 text-sm font-semibold text-green-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-500">Loading members...</td>
                    </tr>
                  ) : filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-500">
                        No members found
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => {
                      const name = `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'No name';
                      const joined = member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

                      return (
                        <tr key={member.id} className="border-b border-gray-100 hover:bg-green-50/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {member.profilePictureUrl ? (
                                <img src={member.profilePictureUrl} alt={name} className="w-9 h-9 rounded-full object-cover" />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                                  {name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 truncate">{name}</p>
                                <p className="text-xs text-gray-500 truncate">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Phone className="w-3 h-3 shrink-0" />
                              <span className="truncate">{member.phone || '-'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1">
                              {member.coachingInfo && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-700">
                                  Coaching
                                </span>
                              )}
                              {member.enrolledCourses.length > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                  Course
                                </span>
                              )}
                              {member.hasWhatsAppSupport && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                  WhatsApp
                                </span>
                              )}
                              {!member.coachingInfo && member.enrolledCourses.length === 0 && !member.hasWhatsAppSupport && (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            {member.coachingInfo ? (
                              <div className="flex flex-wrap gap-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${coachingStatusColors[member.coachingInfo.status] || 'bg-gray-100 text-gray-600'}`}>
                                  {member.coachingInfo.status.replace('_', ' ')}
                                </span>
                                {member.coachingInfo.isPregnant && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                    Pregnant
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {member.enrolledCourses.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {member.enrolledCourses.map((course) => (
                                  <span key={course.courseId} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 truncate max-w-[180px]">
                                    {course.courseTitle}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1 text-sm text-gray-600 whitespace-nowrap">
                              <CalendarIcon className="w-3 h-3 shrink-0" />
                              {joined}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            {member.isDeactivated ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                Deactivated
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-green-100 hover:text-green-700"
                              title="Send Email"
                              onClick={() => setEmailDialogUser(member)}
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
                Showing <span className="font-semibold text-green-600">{filteredMembers.length}</span> of <span className="font-semibold">{stats.total}</span> members
                {filterByDate && <span> joined during <span className="font-semibold">{getDateRangeLabel()}</span></span>}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <SendEmailDialog user={emailDialogUser} onClose={() => setEmailDialogUser(null)} />
    </div>
  );
}
