import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Eye, Edit, Users, CalendarIcon, TrendingUp, AlertTriangle, Image, Settings, Save, FolderOpen, Plus, UserPlus, UserX, UserCheck, Clock, MessageSquare, Mail, Dumbbell, Search, Filter, MoreHorizontal, RefreshCw, ArrowUpRight, ArrowDownRight, ArrowLeft, Activity, LogIn, CheckCircle, Check, Camera, Send, UserMinus, Trophy, Sparkles, ChevronDown, Heart, Smile, Zap, Target, ClipboardCheck, Loader2, Info, ImageIcon, MailOpen, FileText, Copy, X } from "lucide-react";
import WorkoutContentManager from "@/components/admin/WorkoutContentManager";
import AdminLayout from "@/components/admin/AdminLayout";
import CheckinAnalyticsCard from "@/components/admin/CheckinAnalyticsCard";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { User, Program, AdminCreateUser } from "@shared/schema";
import { adminCreateUserSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export default function Admin() {
  const { isLoading: authLoading, isAdmin, user: authUser } = useAdminAuth();
  const [, setLocation] = useLocation();
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [assetDisplayNames, setAssetDisplayNames] = useState<{[key: string]: string}>({});
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState<{user: any, password: string} | null>(null);
  const [resetPasswordData, setResetPasswordData] = useState<{userId: string, email: string, password: string} | null>(null);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [memberViewMode, setMemberViewMode] = useState<'view' | 'edit'>('view');
  const [fullProfileMember, setFullProfileMember] = useState<User | null>(null);
  const [selectedProgramForMember, setSelectedProgramForMember] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'name-asc' | 'name-desc'>('newest');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [postpartumFilter, setPostpartumFilter] = useState<string>('all');
  const [lastActiveFilter, setLastActiveFilter] = useState<string>('all');
  const [passwordMode, setPasswordMode] = useState<'auto' | 'manual'>('auto');
  const [manualPassword, setManualPassword] = useState('');
  const [resetPasswordMode, setResetPasswordMode] = useState<'auto' | 'manual'>('auto');
  const [resetManualPassword, setResetManualPassword] = useState('');
  const [resetPasswordMember, setResetPasswordMember] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const { toast } = useToast();

  const addUserForm = useForm<AdminCreateUser>({
    resolver: zodResolver(adminCreateUserSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      isAdmin: false,
      validFrom: undefined,
      validUntil: undefined,
      hasWhatsAppSupport: false,
      whatsAppSupportDuration: undefined,
    },
  });

  const { data: adminStats } = useQuery<{ 
    totalMembers: number; 
    activeMembers: number; 
    expiringSoon: number;
    expiringUsers: Array<{
      userId: string;
      userName: string;
      programExpiring: boolean;
      whatsAppExpiring: boolean;
      programExpiryDate?: Date;
      whatsAppExpiryDate?: Date;
    }>;
  }>({
    queryKey: ["/api/admin/stats"],
    enabled: isAdmin,
  });

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAdmin,
  });

  const { data: programs = [] } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
    enabled: isAdmin,
  });

  const { data: assets = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/assets"],
    enabled: isAdmin,
  });

  // WhatsApp membership tracking queries
  const { data: expiredMembers = [], refetch: refetchExpiredMembers } = useQuery<Array<{
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
    enabled: isAdmin,
  });

  const { data: extensionLogs = [], refetch: refetchExtensionLogs } = useQuery<Array<{
    id: string;
    user_id: string;
    user_name: string;
    user_email: string;
    action_type: string;
    previous_expiry_date: string | null;
    new_expiry_date: string | null;
    extension_months: number | null;
    notes: string | null;
    performed_by: string | null;
    created_at: string;
  }>>({
    queryKey: ["/api/admin/whatsapp/extension-logs"],
    enabled: isAdmin,
  });

  // Renewal email logs query
  const { data: renewalEmailLogs = [], refetch: refetchRenewalEmailLogs } = useQuery<Array<{
    id: string;
    user_id: string;
    email_type: string;
    sent_at: string;
    sent_by: string | null;
    notes: string | null;
  }>>({
    queryKey: ["/api/admin/renewal-email-logs"],
    enabled: isAdmin,
  });

  // Archived items query
  const { data: archivedItems = [], refetch: refetchArchivedItems } = useQuery<Array<{
    id: string;
    item_type: string;
    original_id: string;
    item_data: any;
    archived_at: string;
    archived_by: string | null;
  }>>({
    queryKey: ["/api/admin/archived-items"],
    enabled: isAdmin,
  });

  // Get all email logs for a user (sorted by date DESC)
  const getUserEmailLogs = (userId: string): Array<{ sent_at: string; isFollowUp: boolean }> => {
    const userLogs = renewalEmailLogs.filter(log => log.user_id === userId);
    return userLogs.map((log, index) => ({
      sent_at: log.sent_at,
      isFollowUp: index < userLogs.length - 1, // All except the oldest are follow-ups
    }));
  };

  // Get email log count for a user
  const getEmailLogCount = (userId: string): number => {
    return renewalEmailLogs.filter(log => log.user_id === userId).length;
  };

  // Log email sent mutation
  const logEmailMutation = useMutation({
    mutationFn: async (data: { userId: string; emailType: 'expiring' | 'expired' }) => {
      const response = await apiRequest("POST", "/api/admin/renewal-email-logs", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email Logged",
        description: "Email sent date and time recorded",
      });
      refetchRenewalEmailLogs();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to log email",
        variant: "destructive",
      });
    },
  });

  // State for reminder email template modal
  const [reminderEmailData, setReminderEmailData] = useState<{
    userName: string;
    userEmail: string;
    type: 'expiring' | 'expired';
    programExpiryDate?: string | null;
    whatsAppExpiryDate?: string | null;
  } | null>(null);
  
  // State for extension dialog
  const [extensionDialogOpen, setExtensionDialogOpen] = useState(false);
  const [extensionMember, setExtensionMember] = useState<{
    id: string;
    name: string;
    email: string;
    programExpiryDate?: string | null;
    whatsAppExpiryDate?: string | null;
    isExpiringSoon?: boolean;
  } | null>(null);
  const [extensionMonths, setExtensionMonths] = useState<number>(3);

  // Helper function to generate reminder email content
  const generateReminderEmail = (data: {
    userName: string;
    type: 'expiring' | 'expired';
    programExpiryDate?: string | null;
    whatsAppExpiryDate?: string | null;
  }) => {
    const formatDate = (dateStr: string | null | undefined) => {
      if (!dateStr) return null;
      return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const isExpiring = data.type === 'expiring';
    const whatsAppDateFormatted = formatDate(data.whatsAppExpiryDate);
    const firstName = data.userName?.split(' ')[0] || 'there';

    // Payment link
    const paymentLink = 'https://rzp.io/rzp/sFzniAWK';

    if (isExpiring) {
      // EXPIRING SOON EMAIL - WhatsApp Community Support
      const subject = `Heal Your Core - WhatsApp Community Support Expires ${whatsAppDateFormatted}`;

      const body = `Hi ${firstName},

Just a heads up - your Heal Your Core WhatsApp Community Support is ending on ${whatsAppDateFormatted}.

After this date, you won't be able to message Coach Zoe directly or be part of the group anymore. Your Heal Your Core program access stays active separately, so you can still do the workouts.

To continue with WhatsApp support, renew here for Rs. 1,000 (3 months):
${paymentLink}

Let us know if you have any questions!

Take care,
Stronger With Zoe Support`;

      return { subject, body };
    } else {
      // ALREADY EXPIRED EMAIL - WhatsApp Community Support (Reminder before removal)
      const subject = `Heal Your Core - WhatsApp Community Support Expired - Action Required`;

      const body = `Hi ${firstName},

Your Heal Your Core WhatsApp Community Support expired on ${whatsAppDateFormatted}.

Your program access is still active, so you can continue with the workouts on the app.

To rejoin the WhatsApp group and get Coach Zoe's support, renew here for Rs. 1,000 (3 months):
${paymentLink}

Once renewed, your access will be reactivated immediately.

If we don't hear back, your WhatsApp access will be revoked within 24 hours.

Take care,
Stronger With Zoe Support`;

      return { subject, body };
    }
  };

  
  // Mutation for extending membership
  const extendMembershipMutation = useMutation({
    mutationFn: async (data: { userId: string; months: number; notes?: string }) => {
      const response = await apiRequest("POST", `/api/admin/users/${data.userId}/extend-validity`, {
        months: data.months,
        notes: data.notes,
      });
      return response.json();
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: `Membership extended by ${extensionMonths} months!`,
      });
      setExtensionDialogOpen(false);
      setExtensionMember(null);
      setExtensionMonths(3);
      setSelectedMember(null);
      
      // Force immediate refetch of all related data
      await Promise.all([
        refetchExpiredMembers(),
        refetchExtensionLogs(),
        queryClient.refetchQueries({ queryKey: ["/api/admin/stats"] }),
        queryClient.refetchQueries({ queryKey: ["/api/admin/users"] }),
      ]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to extend membership",
        variant: "destructive",
      });
    },
  });

  // Fetch recent activity logs for activity feed
  const { data: activityLogs = [], isLoading: activityLoading } = useQuery<Array<{
    id: number;
    userId: string;
    activityType: string;
    metadata: Record<string, any>;
    createdAt: string;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  }>>({
    queryKey: ["/api/admin/activity-logs"],
    enabled: isAdmin,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch member's enrolled programs when a member is selected
  const { data: memberEnrolledPrograms = [] } = useQuery<any[]>({
    queryKey: ["/api/member-programs", selectedMember?.id],
    enabled: !!selectedMember?.id,
  });

  // Fetch all courses for course enrollment dropdown
  const { data: allCourses = [] } = useQuery<Array<{
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    status: string;
  }>>({
    queryKey: ["/api/admin/courses"],
    enabled: isAdmin,
  });

  // Fetch member's course enrollments when a member is selected
  const { data: memberCourseEnrollments = [] } = useQuery<Array<{
    id: string;
    user_id: string;
    course_id: string;
    enrolled_at: string;
    expires_at: string | null;
    status: string;
    progress_percentage: number;
    course_name: string;
    course_description: string | null;
    course_image_url: string | null;
  }>>({
    queryKey: ["/api/admin/users", selectedMember?.id, "course-enrollments"],
    enabled: !!selectedMember?.id,
  });

  // State for selected course to add and its duration
  const [selectedCourseForMember, setSelectedCourseForMember] = useState<string>('');
  const [courseEnrollmentDuration, setCourseEnrollmentDuration] = useState<string>('3');

  // Actionable dashboard data queries
  const { data: membersWithoutPhotos = [] } = useQuery<Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    completionPercentage: number | null;
    lastLoginAt: string | null;
  }>>({
    queryKey: ["/api/admin/actionable/no-photos"],
    enabled: isAdmin,
  });

  const { data: recentCompleters = [] } = useQuery<Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    completedAt: string;
    workoutName: string;
  }>>({
    queryKey: ["/api/admin/actionable/recent-completers"],
    enabled: isAdmin,
  });

  // Check-in data queries
  const { data: recentCheckins = [] } = useQuery<Array<{
    id: string;
    userId: string;
    mood: string | null;
    energyLevel: number | null;
    goals: string[] | null;
    notes: string | null;
    createdAt: string | null;
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>>({
    queryKey: ["/api/admin/actionable/recent-checkins"],
    enabled: isAdmin,
  });

  const { data: checkinAnalytics } = useQuery<{
    overall: {
      totalCheckins: number;
      checkinsByMood: { mood: string; count: number }[];
      checkinsByEnergy: { energyLevel: number; count: number }[];
      popularGoals: { goal: string; count: number }[];
      checkinFrequency: { period: string; count: number }[];
    };
    today: {
      total: number;
      moodDistribution: { mood: string; count: number }[];
      energyDistribution: { energyLevel: number; count: number }[];
      popularGoals: { goal: string; count: number }[];
    };
    thisWeek: {
      total: number;
      moodDistribution: { mood: string; count: number }[];
      energyDistribution: { energyLevel: number; count: number }[];
      popularGoals: { goal: string; count: number }[];
    };
  }>({
    queryKey: ["/api/admin/actionable/checkin-analytics"],
    enabled: isAdmin,
  });

  // Full member profile data query
  const { data: fullProfileData, isLoading: fullProfileLoading } = useQuery<{
    user: User;
    activityLogs: Array<{
      id: string;
      activityType: string;
      metadata: Record<string, any> | null;
      createdAt: string | null;
    }>;
    checkins: Array<{
      id: string;
      mood: string | null;
      energyLevel: number | null;
      goals: string[] | null;
      notes: string | null;
      createdAt: string | null;
    }>;
    progressPhotos: Array<{
      id: string;
      photoUrl: string;
      photoType: string;
      week: number | null;
      createdAt: string | null;
    }>;
    emailHistory: Array<{
      id: string;
      campaignName: string;
      templateType: string;
      sentAt: string | null;
      openedAt: string | null;
      status: string;
    }>;
    workoutCompletions: Array<{
      id: string;
      workoutId: string;
      completedAt: string | null;
    }>;
    memberPrograms: Array<any>;
    communityPosts: Array<any>;
  }>({
    queryKey: ["/api/admin/member-profile", fullProfileMember?.id],
    enabled: !!fullProfileMember?.id,
  });

  // Check-in analytics view toggle (today vs this week)
  const [checkinView, setCheckinView] = useState<'today' | 'week'>('today');

  // Email preview state
  const [emailPreview, setEmailPreview] = useState<{
    recipient: { id: string; name: string; email: string };
    emailType: string;
    subject: string;
    html: string;
  } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Email preview mutation
  const previewEmailMutation = useMutation({
    mutationFn: async ({ userId, emailType }: { userId: string; emailType: string }) => {
      const response = await apiRequest("POST", "/api/admin/actionable/preview-email", { userId, emailType });
      return response.json();
    },
    onSuccess: (data) => {
      setEmailPreview(data);
      setIsPreviewOpen(true);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load email preview",
      });
    },
  });

  // Quick-send email mutation
  const quickSendEmailMutation = useMutation({
    mutationFn: async ({ userId, emailType }: { userId: string; emailType: string }) => {
      const response = await apiRequest("POST", "/api/admin/actionable/send-email", { userId, emailType });
      return response.json();
    },
    onSuccess: (data) => {
      setIsPreviewOpen(false);
      setEmailPreview(null);
      toast({
        variant: "success",
        title: "Email Sent",
        description: data.message || "Email sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send email",
      });
    },
  });

  const updateProgramMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Program>) => {
      const response = await fetch(`/api/admin/programs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update program');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      setEditingProgram(null);
      toast({
        variant: "success",
        title: "Success",
        description: "Program updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update program",
        variant: "destructive",
      });
    },
  });

  const updateAssetMutation = useMutation({
    mutationFn: async ({ filename, displayName }: { filename: string; displayName: string }) => {
      const response = await fetch(`/api/admin/assets/${encodeURIComponent(filename)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });
      if (!response.ok) throw new Error('Failed to update asset');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/assets"] });
      setEditingAsset(null);
      setAssetDisplayNames({});
      toast({
        variant: "success",
        title: "Success",
        description: "Asset name updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update asset name",
        variant: "destructive",
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: AdminCreateUser) => {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setNewUserData(data);
      addUserForm.reset();
      toast({
        variant: "success",
        title: "Success",
        description: `User ${data.user.firstName} ${data.user.lastName} created successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const handleUpdateProgram = (updatedProgram: Program) => {
    updateProgramMutation.mutate(updatedProgram);
  };

  const handleUpdateAsset = (filename: string, displayName: string) => {
    updateAssetMutation.mutate({ filename, displayName });
  };

  const handleEditAsset = (filename: string, currentDisplayName: string) => {
    setEditingAsset(filename);
    setAssetDisplayNames({ [filename]: currentDisplayName });
  };

  const handleCreateUser = async (userData: AdminCreateUser) => {
    try {
      // Validate manual password if selected
      if (passwordMode === 'manual' && !manualPassword) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter a password or switch to auto-generate mode",
        });
        return;
      }

      // Create user with optional manual password
      const requestBody = passwordMode === 'manual' 
        ? { ...userData, password: manualPassword }
        : userData;

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user');
      }
      
      // If a program was selected, enroll the user
      if (userData.programId && userData.programId !== 'none') {
        const enrollResponse = await fetch('/api/member-programs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: data.user.id,
            programId: userData.programId,
            expiryDate: userData.validUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Use validUntil or default 1 year
          }),
        });
        
        if (!enrollResponse.ok) {
          const errorData = await enrollResponse.json();
          throw new Error(errorData.message || 'Failed to enroll in program');
        }
      }
      
      setNewUserData(data);
      toast({
        variant: "success",
        title: "Success",
        description: `User ${data.user.firstName} ${data.user.lastName} created successfully${userData.programId && userData.programId !== 'none' ? ' and enrolled in program' : ''}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      addUserForm.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create user",
      });
    }
  };

  const closeAddUserModal = () => {
    setIsAddUserModalOpen(false);
    setNewUserData(null);
    setPasswordMode('auto');
    setManualPassword('');
    addUserForm.reset();
  };

  const extendValidityMutation = useMutation({
    mutationFn: async ({ userId, months }: { userId: string; months: number }) => {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/extend-validity`, { months });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        variant: "success",
        title: "Success",
        description: "Member validity extended successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to extend validity",
        variant: "destructive",
      });
    },
  });

  const deactivateMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/deactivate`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setSelectedMember(null);
      toast({
        variant: "success",
        title: "Success",
        description: "Member deactivated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to deactivate member",
        variant: "destructive",
      });
    },
  });

  const removeExpiredMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/whatsapp/expired-members/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whatsapp/expired-members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/archived-items"] });
      toast({
        variant: "success",
        title: "Archived",
        description: "Member archived from expired list",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to archive member",
        variant: "destructive",
      });
    },
  });

  const deleteExtensionLogMutation = useMutation({
    mutationFn: async (logId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/whatsapp/extension-logs/${logId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whatsapp/extension-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/archived-items"] });
      toast({
        variant: "success",
        title: "Archived",
        description: "Extension log archived",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to archive log",
        variant: "destructive",
      });
    },
  });

  const restoreArchivedItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest("POST", `/api/admin/archived-items/${itemId}/restore`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/archived-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whatsapp/extension-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whatsapp/expired-members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        variant: "success",
        title: "Restored",
        description: "Item restored successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to restore item",
        variant: "destructive",
      });
    },
  });

  const permanentDeleteArchivedMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/archived-items/${itemId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/archived-items"] });
      toast({
        variant: "success",
        title: "Deleted",
        description: "Item permanently deleted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    },
  });

  const handleResetPassword = async () => {
    if (!resetPasswordMember) return;

    try {
      // Validate manual password if selected
      if (resetPasswordMode === 'manual' && !resetManualPassword) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter a password or switch to auto-generate mode",
        });
        return;
      }

      const requestBody = resetPasswordMode === 'manual'
        ? { password: resetManualPassword }
        : {};

      const response = await fetch(`/api/admin/users/${resetPasswordMember.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset password');
      }

      const data = await response.json();
      
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setResetPasswordData({
        userId: resetPasswordMember.id,
        email: resetPasswordMember.email,
        password: data.password,
      });
      setResetPasswordMember(null);
      setResetPasswordMode('auto');
      setResetManualPassword('');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to reset password",
      });
    }
  };

  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/reset-password`);
      return response.json();
    },
    onSuccess: (data: { password: string }, userId: string) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      const member = allUsers?.find((u: User) => u.id === userId);
      if (member) {
        setResetPasswordData({
          userId: member.id,
          email: member.email,
          password: data.password,
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reset password",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <AdminLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
    >
      {activeTab === 'overview' && (
        <div className="space-y-6">
        {/* Section Header - Member Overview */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-0.5">Member Overview</h2>
          <p className="text-xs text-gray-500">View and manage all members</p>
        </div>

        {/* Row 1 - Member Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Total Members Card - Pink */}
          <div 
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 border border-pink-100/50 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            onClick={() => setLocation('/admin/members')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400/5 to-rose-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-200/50 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <ArrowUpRight className="w-4 h-4 text-pink-600" />
                </div>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-pink-700 to-rose-600 bg-clip-text text-transparent mb-1">
                {adminStats?.totalMembers || 0}
              </p>
              <p className="text-sm font-semibold text-pink-800">Total Members</p>
              <p className="text-xs text-pink-600/80 mt-0.5">All registered users</p>
            </div>
          </div>

          {/* New Signups Card - Purple */}
          <div 
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 border border-purple-100/50 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            onClick={() => setLocation('/admin/active')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-violet-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-lg shadow-purple-200/50 group-hover:scale-110 transition-transform duration-300">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <ArrowUpRight className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-violet-600 bg-clip-text text-transparent mb-1">
                {adminStats?.activeMembers || 0}
              </p>
              <p className="text-sm font-semibold text-purple-800">New Signups</p>
              <p className="text-xs text-purple-600/80 mt-0.5">Filter by date</p>
            </div>
          </div>

          {/* WhatsApp Support Card - Cyan/Teal */}
          <div 
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 border border-cyan-100/50 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            onClick={() => setLocation('/admin/whatsapp')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-teal-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-200/50 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <ArrowUpRight className="w-4 h-4 text-cyan-600" />
                </div>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-cyan-700 to-teal-600 bg-clip-text text-transparent mb-1">
                {allUsers.filter(u => !u.isAdmin && u.hasWhatsAppSupport).length}
              </p>
              <p className="text-sm font-semibold text-cyan-800">WhatsApp Support</p>
              <p className="text-xs text-cyan-600/80 mt-0.5">HYC + Community</p>
            </div>
          </div>
        </div>

        {/* Section Header - Membership Status */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-0.5">Membership Status</h2>
          <p className="text-xs text-gray-500">Track expirations, renewals, and archives</p>
        </div>

        {/* Row 2 - Membership Status Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Expiring Soon Card - Amber */}
          <div 
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-100/50 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            onClick={() => setLocation('/admin/expiring')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200/50 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <ArrowUpRight className="w-4 h-4 text-amber-600" />
                </div>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent mb-1">
                {adminStats?.expiringUsers?.length || 0}
              </p>
              <p className="text-sm font-semibold text-amber-800">Expiring Soon</p>
              <p className="text-xs text-amber-600/80 mt-0.5">Next 7 days</p>
            </div>
          </div>

          {/* Expired Members Card - Red */}
          <div 
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 via-rose-50 to-red-50 border border-red-100/50 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            onClick={() => setLocation('/admin/expired')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-400/5 to-rose-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg shadow-red-200/50 group-hover:scale-110 transition-transform duration-300">
                  <UserMinus className="w-6 h-6 text-white" />
                </div>
                <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <ArrowUpRight className="w-4 h-4 text-red-600" />
                </div>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-red-700 to-rose-600 bg-clip-text text-transparent mb-1">
                {expiredMembers.length}
              </p>
              <p className="text-sm font-semibold text-red-800">Expired</p>
              <p className="text-xs text-red-600/80 mt-0.5">Need renewal</p>
            </div>
          </div>

          {/* Recent Extensions Card - Green */}
          <div 
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 border border-green-100/50 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            onClick={() => setLocation('/admin/extensions')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-200/50 group-hover:scale-110 transition-transform duration-300">
                  <RefreshCw className="w-6 h-6 text-white" />
                </div>
                <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent mb-1">
                {extensionLogs?.length || 0}
              </p>
              <p className="text-sm font-semibold text-green-800">Extensions</p>
              <p className="text-xs text-green-600/80 mt-0.5">Recent renewals</p>
            </div>
          </div>

          {/* Archived Items Card - Slate */}
          <div 
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 border border-slate-100/50 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            onClick={() => setLocation('/admin/archived')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-400/5 to-gray-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-400 to-gray-500 flex items-center justify-center shadow-lg shadow-slate-200/50 group-hover:scale-110 transition-transform duration-300">
                  <FolderOpen className="w-6 h-6 text-white" />
                </div>
                <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <ArrowUpRight className="w-4 h-4 text-slate-600" />
                </div>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-gray-600 bg-clip-text text-transparent mb-1">
                {archivedItems?.length || 0}
              </p>
              <p className="text-sm font-semibold text-slate-800">Archived</p>
              <p className="text-xs text-slate-600/80 mt-0.5">Removed items</p>
            </div>
          </div>
        </div>

        {/* Section Header - Activity & Engagement */}
        <div className="mb-4 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-0.5">Activity & Engagement</h2>
          <p className="text-xs text-gray-500">Monitor member activity and workout progress</p>
        </div>

        {/* Activity Row - Two Cards Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Live Activity Feed */}
          <Card className="border border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-gray-900">Live Activity</CardTitle>
                    <CardDescription className="text-xs text-gray-500">Real-time member actions</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs font-medium text-green-600">Live</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {activityLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : activityLogs.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <Activity className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {activityLogs.slice(0, 6).map((activity) => {
                    const timeAgo = (dateString: string) => {
                      const date = new Date(dateString);
                      const now = new Date();
                      const diff = now.getTime() - date.getTime();
                      const minutes = Math.floor(diff / 60000);
                      const hours = Math.floor(diff / 3600000);
                      if (minutes < 1) return 'Now';
                      if (minutes < 60) return `${minutes}m`;
                      if (hours < 24) return `${hours}h`;
                      return `${Math.floor(diff / 86400000)}d`;
                    };
                    const getActivityStyle = (type: string) => {
                      switch (type) {
                        case 'login': case 'login_otp': return { icon: <LogIn className="w-3.5 h-3.5" />, bg: 'bg-blue-100', text: 'text-blue-600' };
                        case 'workout_complete': return { icon: <CheckCircle className="w-3.5 h-3.5" />, bg: 'bg-green-100', text: 'text-green-600' };
                        case 'workout_start': return { icon: <Dumbbell className="w-3.5 h-3.5" />, bg: 'bg-pink-100', text: 'text-pink-600' };
                        default: return { icon: <Activity className="w-3.5 h-3.5" />, bg: 'bg-gray-100', text: 'text-gray-600' };
                      }
                    };
                    const style = getActivityStyle(activity.activityType);
                    const userName = activity.user ? `${activity.user.firstName} ${activity.user.lastName?.charAt(0) || ''}.` : 'Unknown';
                    const desc = { 'login': 'logged in', 'login_otp': 'logged in', 'workout_complete': 'completed workout', 'workout_start': 'started workout' }[activity.activityType] || activity.activityType.replace(/_/g, ' ');
                    return (
                      <div key={activity.id} className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                        <div className={`w-8 h-8 rounded-lg ${style.bg} ${style.text} flex items-center justify-center`}>{style.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700"><span className="font-medium">{userName}</span> {desc}</p>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">{timeAgo(activity.createdAt)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workout Progress */}
          <Card className="border border-green-100 bg-gradient-to-br from-green-50/50 to-emerald-50/30 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900">Workout Progress</CardTitle>
                  <CardDescription className="text-xs text-gray-500">Completions in last 48 hours</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {recentCompleters.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No recent completions</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {recentCompleters.slice(0, 5).map((completer) => (
                    <div key={`${completer.id}-${completer.completedAt}`} className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-gray-100 hover:border-green-200 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-xs font-semibold">
                        {completer.firstName?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{completer.firstName} {completer.lastName}</p>
                        <p className="text-xs text-green-600 truncate">{completer.workoutName}</p>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600 hover:bg-green-100" onClick={() => previewEmailMutation.mutate({ userId: completer.id, emailType: 'congratulations' })} disabled={previewEmailMutation.isPending}>
                        <Sparkles className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {recentCompleters.length > 5 && <p className="text-xs text-green-600 mt-2 text-center font-medium">+{recentCompleters.length - 5} more</p>}
            </CardContent>
          </Card>
        </div>

        {/* Section Header - Wellness Insights */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-0.5">Wellness Insights</h2>
          <p className="text-xs text-gray-500">Community mood, energy levels, and check-in data</p>
        </div>

        {/* Wellness Row - Mood & Energy Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Community Mood Summary */}
          <Card className="border border-yellow-100 bg-gradient-to-br from-yellow-50/50 to-amber-50/30 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-md">
                  <Smile className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900">Mood Overview</CardTitle>
                  <CardDescription className="text-xs text-gray-500">This week's mood distribution</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {checkinAnalytics?.thisWeek?.moodDistribution?.length > 0 ? (
                <div className="space-y-2">
                  {checkinAnalytics.thisWeek.moodDistribution.slice(0, 4).map((item) => {
                    const moodEmoji = { 'great': '😊', 'good': '🙂', 'okay': '😐', 'tired': '😴', 'struggling': '😔' }[item.mood.toLowerCase()] || '😐';
                    const total = checkinAnalytics.thisWeek.moodDistribution.reduce((sum, m) => sum + m.count, 0);
                    const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                    return (
                      <div key={item.mood} className="flex items-center gap-3">
                        <span className="text-xl">{moodEmoji}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium capitalize text-gray-700">{item.mood}</span>
                            <span className="text-gray-500">{pct}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  <Smile className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No mood data yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Energy Levels */}
          <Card className="border border-orange-100 bg-gradient-to-br from-orange-50/50 to-red-50/30 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900">Energy Levels</CardTitle>
                  <CardDescription className="text-xs text-gray-500">Average energy this week</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {checkinAnalytics?.thisWeek?.energyDistribution?.length > 0 ? (
                <div className="flex items-end justify-between gap-2 h-24">
                  {[1, 2, 3, 4, 5].map((level) => {
                    const data = checkinAnalytics.thisWeek.energyDistribution.find(e => e.energyLevel === level);
                    const count = data?.count || 0;
                    const maxCount = Math.max(...checkinAnalytics.thisWeek.energyDistribution.map(e => e.count), 1);
                    const height = count > 0 ? Math.max((count / maxCount) * 100, 15) : 15;
                    return (
                      <div key={level} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full rounded-t-lg bg-gradient-to-t from-orange-500 to-amber-400 transition-all duration-300" style={{ height: `${height}%` }} />
                        <span className="text-xs font-bold text-gray-700">{level}</span>
                        <span className="text-xs text-gray-500">{count}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No energy data yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Check-in Stats */}
          <Card className="border border-pink-100 bg-gradient-to-br from-pink-50/50 to-rose-50/30 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-md">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-gray-900">Check-in Stats</CardTitle>
                    <CardDescription className="text-xs text-gray-500">Today vs this week</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-white rounded-xl border border-pink-100">
                  <p className="text-3xl font-bold text-pink-600">{checkinAnalytics?.today?.total || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Today</p>
                </div>
                <div className="text-center p-3 bg-white rounded-xl border border-pink-100">
                  <p className="text-3xl font-bold text-pink-600">{checkinAnalytics?.thisWeek?.total || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">This Week</p>
                </div>
              </div>
              {checkinAnalytics?.thisWeek?.popularGoals?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1"><Target className="w-3 h-3" /> Top Goals</p>
                  <div className="flex flex-wrap gap-1">
                    {checkinAnalytics.thisWeek.popularGoals.slice(0, 3).map((g) => (
                      <Badge key={g.goal} variant="secondary" className="text-xs bg-pink-100 text-pink-700">{g.goal}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Cards Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Community Mood & Energy Card */}
          <CheckinAnalyticsCard />

          {/* Recent Check-ins Card */}
          <Card className="border border-purple-100 bg-gradient-to-br from-purple-50/50 to-violet-50/30 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-md">
                    <ClipboardCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-gray-900">Recent Check-ins</CardTitle>
                    <CardDescription className="text-xs text-gray-500">Latest wellness submissions</CardDescription>
                  </div>
                </div>
                <Badge className="bg-purple-100 text-purple-700 text-xs">{recentCheckins.length} latest</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {recentCheckins.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <ClipboardCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No check-ins yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {recentCheckins.slice(0, 6).map((checkin) => {
                    const moodEmoji = { 'great': '😊', 'good': '🙂', 'okay': '😐', 'tired': '😴', 'struggling': '😔' }[checkin.mood?.toLowerCase() || ''] || '😐';
                    const timeAgo = checkin.createdAt ? (() => {
                      const date = new Date(checkin.createdAt);
                      const diff = Date.now() - date.getTime();
                      const mins = Math.floor(diff / 60000);
                      if (mins < 1) return 'Now';
                      if (mins < 60) return `${mins}m`;
                      const hrs = Math.floor(diff / 3600000);
                      if (hrs < 24) return `${hrs}h`;
                      return `${Math.floor(diff / 86400000)}d`;
                    })() : '';
                    return (
                      <div key={checkin.id} className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-gray-100 hover:border-purple-200 transition-colors">
                        <span className="text-xl">{moodEmoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{checkin.user.firstName} {checkin.user.lastName}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="capitalize">{checkin.mood}</span>
                            {checkin.energyLevel && <span className="flex items-center gap-0.5"><Zap className="w-3 h-3 text-orange-400" />{checkin.energyLevel}/5</span>}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">{timeAgo}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-6">
            <Card className="overflow-hidden">
          <div className="border-b border-border p-6">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-foreground">Member Management</h3>
                <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-member">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <AddUserModal 
                    form={addUserForm}
                    onSubmit={handleCreateUser}
                    isLoading={createUserMutation.isPending}
                    onClose={closeAddUserModal}
                    newUserData={newUserData}
                    programs={programs}
                    passwordMode={passwordMode}
                    setPasswordMode={setPasswordMode}
                    manualPassword={manualPassword}
                    setManualPassword={setManualPassword}
                  />
                </Dialog>
              </div>
              
              {/* Filters Row */}
              <div className="flex flex-wrap gap-3 items-center">
                <Input
                  type="search"
                  placeholder="Search by name or email..."
                  className="w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-members"
                />
                <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                  <SelectTrigger className="w-40" data-testid="select-sort-order">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger className="w-36" data-testid="select-country-filter">
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {Array.from(new Set(allUsers.map(u => u.country).filter(Boolean))).sort().map(country => (
                      <SelectItem key={country} value={country!}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={postpartumFilter} onValueChange={setPostpartumFilter}>
                  <SelectTrigger className="w-44" data-testid="select-postpartum-filter">
                    <SelectValue placeholder="Postpartum Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    <SelectItem value="0-12">0-12 weeks</SelectItem>
                    <SelectItem value="13-26">13-26 weeks</SelectItem>
                    <SelectItem value="27-52">27-52 weeks</SelectItem>
                    <SelectItem value="52+">52+ weeks</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={lastActiveFilter} onValueChange={setLastActiveFilter}>
                  <SelectTrigger className="w-36" data-testid="select-activity-filter">
                    <SelectValue placeholder="Last Active" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activity</SelectItem>
                    <SelectItem value="7">Active (7 days)</SelectItem>
                    <SelectItem value="30">Active (30 days)</SelectItem>
                    <SelectItem value="dormant-7">Dormant 7+ days</SelectItem>
                    <SelectItem value="dormant-30">Dormant 30+ days</SelectItem>
                  </SelectContent>
                </Select>
                {(countryFilter !== 'all' || postpartumFilter !== 'all' || lastActiveFilter !== 'all' || searchQuery) && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setCountryFilter('all');
                      setPostpartumFilter('all');
                      setLastActiveFilter('all');
                      setSearchQuery('');
                    }}
                    data-testid="button-clear-filters"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
                <tr>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">Member</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">Role</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">Terms</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">Disclaimer</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">WhatsApp</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">Expiry Date</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">Joined</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.filter((member) => {
                  // Filter out deactivated users (validUntil has passed)
                  const validUntil = member.validUntil ? new Date(member.validUntil) : null;
                  const isDeactivated = validUntil && validUntil <= new Date();
                  if (isDeactivated) return false;
                  
                  // Search filter
                  if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    const matchesSearch = (
                      member.firstName?.toLowerCase().includes(query) ||
                      member.lastName?.toLowerCase().includes(query) ||
                      member.email?.toLowerCase().includes(query)
                    );
                    if (!matchesSearch) return false;
                  }
                  
                  // Country filter
                  if (countryFilter !== 'all' && member.country !== countryFilter) {
                    return false;
                  }
                  
                  // Postpartum stage filter
                  if (postpartumFilter !== 'all') {
                    const weeks = member.postpartumWeeks || 0;
                    switch (postpartumFilter) {
                      case '0-12':
                        if (weeks < 0 || weeks > 12) return false;
                        break;
                      case '13-26':
                        if (weeks < 13 || weeks > 26) return false;
                        break;
                      case '27-52':
                        if (weeks < 27 || weeks > 52) return false;
                        break;
                      case '52+':
                        if (weeks <= 52) return false;
                        break;
                    }
                  }
                  
                  // Last active filter
                  if (lastActiveFilter !== 'all') {
                    const lastLogin = member.lastLoginAt ? new Date(member.lastLoginAt) : null;
                    const now = new Date();
                    const daysSinceLogin = lastLogin 
                      ? Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))
                      : Infinity;
                    
                    switch (lastActiveFilter) {
                      case '7':
                        if (daysSinceLogin > 7) return false;
                        break;
                      case '30':
                        if (daysSinceLogin > 30) return false;
                        break;
                      case 'dormant-7':
                        if (daysSinceLogin < 7) return false;
                        break;
                      case 'dormant-30':
                        if (daysSinceLogin < 30) return false;
                        break;
                    }
                  }
                  
                  return true;
                })
                .sort((a, b) => {
                  // Sorting logic
                  switch (sortOrder) {
                    case 'newest':
                      // Sort by created date (newest first)
                      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                      return dateB - dateA;
                    case 'oldest':
                      // Sort by created date (oldest first)
                      const dateA2 = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                      const dateB2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                      return dateA2 - dateB2;
                    case 'name-asc':
                      // Sort by name A-Z
                      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
                      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
                      return nameA.localeCompare(nameB);
                    case 'name-desc':
                      // Sort by name Z-A
                      const nameA2 = `${a.firstName} ${a.lastName}`.toLowerCase();
                      const nameB2 = `${b.firstName} ${b.lastName}`.toLowerCase();
                      return nameB2.localeCompare(nameA2);
                    default:
                      return 0;
                  }
                })
                .map((member) => (
                  <tr 
                    key={member.id} 
                    className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedMember(member);
                      setMemberViewMode('view');
                    }}
                    data-testid={`row-member-${member.id}`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-sm font-semibold text-white">
                            {member.firstName?.[0]}{member.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${member.termsAccepted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-sm font-medium">{member.termsAccepted ? "Active" : "Pending"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        member.isAdmin 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {member.isAdmin ? "ADMIN" : "MEMBER"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-xs">
                        {member.termsAcceptedAt ? (
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div className="flex flex-col">
                              <span className="text-gray-700 font-medium">Accepted</span>
                              <span className="text-muted-foreground text-[10px]">
                                {new Date(member.termsAcceptedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-red-600 font-medium">Pending</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-xs">
                        {member.disclaimerAcceptedAt ? (
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div className="flex flex-col">
                              <span className="text-gray-700 font-medium">Accepted</span>
                              <span className="text-muted-foreground text-[10px]">
                                {new Date(member.disclaimerAcceptedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-red-600 font-medium">Pending</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {(() => {
                        const hasSupport = member.hasWhatsAppSupport;
                        const expiryDate = member.whatsAppSupportExpiryDate ? new Date(member.whatsAppSupportExpiryDate) : null;
                        const isActive = hasSupport && expiryDate && expiryDate > new Date();
                        
                        return (
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                            <span className={`text-sm font-medium ${isActive ? 'text-green-700' : 'text-gray-500'}`}>
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">
                        {member.whatsAppSupportExpiryDate 
                          ? new Date(member.whatsAppSupportExpiryDate).toLocaleDateString()
                          : '—'
                        }
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">
                        {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-pink-50 hover:text-pink-600"
                          onClick={() => {
                            setSelectedMember(member);
                            setMemberViewMode('edit');
                          }}
                          data-testid={`button-edit-${member.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => {
                            setSelectedMember(member);
                            setMemberViewMode('view');
                          }}
                          data-testid={`button-view-${member.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Member Details Dialog */}
          <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-pink-50/30 to-rose-50/20">
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center shadow-md">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent font-semibold">
                    {memberViewMode === 'view' ? 'Member Details' : 'Edit Member'}
                  </span>
                </DialogTitle>
              </DialogHeader>
              
              {selectedMember && memberViewMode === 'view' && (
                <div className="space-y-6 pt-2">
                  {/* Profile Section with View Full Profile Button */}
                  <div className="flex items-center justify-between gap-4 p-5 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-200/50 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg ring-4 ring-pink-100">
                        <span className="text-2xl font-bold text-white">
                          {selectedMember.firstName?.[0]}{selectedMember.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {selectedMember.firstName} {selectedMember.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{selectedMember.email}</p>
                      </div>
                    </div>
                    <Button 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md"
                      onClick={() => {
                        setFullProfileMember(selectedMember);
                        setSelectedMember(null);
                      }}
                      data-testid="button-view-full-profile"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Full Profile
                    </Button>
                  </div>

                  {/* Account Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-pink-700 uppercase tracking-wide flex items-center gap-2">
                      <div className="w-1 h-4 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></div>
                      Account Information
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <Label className="text-xs text-gray-500 font-medium block mb-2">Status</Label>
                        <div>
                          <Badge variant={selectedMember.termsAccepted ? "default" : "secondary"} className={cn(selectedMember.termsAccepted && "bg-green-500 hover:bg-green-600")}>
                            {selectedMember.termsAccepted ? "Active" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <Label className="text-xs text-gray-500 font-medium block mb-2">Role</Label>
                        <div>
                          <Badge variant={selectedMember.isAdmin ? "destructive" : "outline"}>
                            {selectedMember.isAdmin ? "Admin" : "Member"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Member Since</Label>
                      <p className="text-sm font-medium mt-1">
                        {selectedMember.createdAt ? new Date(selectedMember.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : 'N/A'}
                      </p>
                    </div>

                    {selectedMember.phone && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Phone</Label>
                        <p className="text-sm font-medium mt-1">{selectedMember.phone}</p>
                      </div>
                    )}

                    {selectedMember.country && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Country</Label>
                        <p className="text-sm font-medium mt-1">{selectedMember.country}</p>
                      </div>
                    )}

                    {selectedMember.instagramHandle && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Instagram</Label>
                        <p className="text-sm font-medium mt-1">{selectedMember.instagramHandle}</p>
                      </div>
                    )}

                    {selectedMember.postpartumWeeks && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Postpartum Stage</Label>
                        <p className="text-sm font-medium mt-1">
                          {selectedMember.postpartumWeeks < 8 
                            ? `${selectedMember.postpartumWeeks} weeks`
                            : selectedMember.postpartumWeeks < 52
                            ? `${Math.round(selectedMember.postpartumWeeks / 4)} months`
                            : `${Math.round(selectedMember.postpartumWeeks / 52)} years`}
                        </p>
                      </div>
                    )}

                    {selectedMember.bio && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Bio</Label>
                        <p className="text-sm font-medium mt-1 text-gray-700">{selectedMember.bio}</p>
                      </div>
                    )}

                    {selectedMember.lastLoginAt && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Last Login</Label>
                        <p className="text-sm font-medium mt-1">
                          {new Date(selectedMember.lastLoginAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })} at {new Date(selectedMember.lastLoginAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Acceptance Status */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-pink-700 uppercase tracking-wide flex items-center gap-2">
                      <div className="w-1 h-4 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></div>
                      Acceptance Status
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white border-2 border-gray-100 rounded-lg">
                        <Label className="text-xs text-gray-500 font-medium">Terms & Conditions</Label>
                        {selectedMember.termsAcceptedAt ? (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-green-600">✓ Accepted</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(selectedMember.termsAcceptedAt).toLocaleDateString()} at{' '}
                              {new Date(selectedMember.termsAcceptedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm font-medium text-red-500 mt-2">Not accepted</p>
                        )}
                      </div>

                      <div className="p-4 bg-white border-2 border-gray-100 rounded-lg">
                        <Label className="text-xs text-gray-500 font-medium">Health Disclaimer</Label>
                        {selectedMember.disclaimerAcceptedAt ? (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-green-600">✓ Accepted</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(selectedMember.disclaimerAcceptedAt).toLocaleDateString()} at{' '}
                              {new Date(selectedMember.disclaimerAcceptedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm font-medium text-red-500 mt-2">Not accepted</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Validity Period */}
                  {(selectedMember.validFrom || selectedMember.validUntil) && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm text-pink-700 uppercase tracking-wide flex items-center gap-2">
                        <div className="w-1 h-4 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></div>
                        Access Period
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {selectedMember.validFrom && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Valid From</Label>
                            <p className="text-sm font-medium mt-1">
                              {new Date(selectedMember.validFrom).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                        )}
                        
                        {selectedMember.validUntil && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Valid Until</Label>
                            <p className="text-sm font-medium mt-1">
                              {new Date(selectedMember.validUntil).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Enrolled Courses */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-pink-700 uppercase tracking-wide flex items-center gap-2">
                      <div className="w-1 h-4 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></div>
                      Enrolled Courses
                    </h4>
                    
                    {memberCourseEnrollments.length > 0 ? (
                      <div className="space-y-2">
                        {memberCourseEnrollments.map((enrollment: any) => (
                          <div key={enrollment.id} className="p-3 bg-white border-2 border-purple-100 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {enrollment.course_image_url && (
                                  <img 
                                    src={enrollment.course_image_url} 
                                    alt={enrollment.course_name}
                                    className="w-10 h-10 rounded object-cover"
                                  />
                                )}
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-purple-800">{enrollment.course_name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Enrolled: {enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString() : 'Unknown'}
                                  </p>
                                  {enrollment.progress_percentage > 0 && (
                                    <div className="mt-1">
                                      <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                          <div 
                                            className="bg-purple-500 h-1.5 rounded-full transition-all" 
                                            style={{ width: `${enrollment.progress_percentage}%` }}
                                          />
                                        </div>
                                        <span className="text-xs font-medium text-purple-600">{enrollment.progress_percentage}%</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {enrollment.expires_at && (
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">Expires</p>
                                  <p className="text-xs font-medium">
                                    {new Date(enrollment.expires_at).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No courses enrolled</p>
                    )}
                  </div>

                  {/* WhatsApp Community */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-pink-700 uppercase tracking-wide flex items-center gap-2">
                      <div className="w-1 h-4 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></div>
                      WhatsApp Community
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* WhatsApp Support Status */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Support Status</Label>
                        <div className="p-3 bg-white border-2 border-gray-100 rounded-lg">
                          {selectedMember.hasWhatsAppSupport && selectedMember.whatsAppSupportExpiryDate ? (
                            <>
                              {new Date(selectedMember.whatsAppSupportExpiryDate) > new Date() ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <p className="text-sm font-medium text-green-700">Active</p>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                  <p className="text-sm font-medium text-gray-600">Expired</p>
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                Duration: {selectedMember.whatsAppSupportDuration} months
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Expires: {new Date(selectedMember.whatsAppSupportExpiryDate).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              <p className="text-sm font-medium text-gray-600">No Support</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Password Info */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Password</Label>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-sm font-mono text-gray-700 break-all">{selectedMember.password}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Use Edit mode to reset password
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* EDIT MODE */}
              {selectedMember && memberViewMode === 'edit' && (
                <div className="space-y-6 pt-2">
                  {/* 1. BASIC INFO */}
                  <div>
                    <h4 className="font-semibold text-sm text-pink-700 uppercase tracking-wide flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></div>
                      Basic Information
                    </h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>First Name</Label>
                          <Input 
                            defaultValue={selectedMember.firstName}
                            onChange={(e) => setSelectedMember({...selectedMember, firstName: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Last Name</Label>
                          <Input 
                            defaultValue={selectedMember.lastName}
                            onChange={(e) => setSelectedMember({...selectedMember, lastName: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input 
                          type="email"
                          defaultValue={selectedMember.email}
                          onChange={(e) => setSelectedMember({...selectedMember, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Phone Number</Label>
                        <Input 
                          type="tel"
                          defaultValue={selectedMember.phone || ''}
                          onChange={(e) => setSelectedMember({...selectedMember, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Country</Label>
                        <Input 
                          defaultValue={selectedMember.country || ''}
                          onChange={(e) => setSelectedMember({...selectedMember, country: e.target.value})}
                          placeholder="e.g., India, United States"
                        />
                      </div>
                      <div>
                        <Label>Instagram Handle</Label>
                        <Input 
                          defaultValue={selectedMember.instagramHandle || ''}
                          onChange={(e) => setSelectedMember({...selectedMember, instagramHandle: e.target.value})}
                          placeholder="@username"
                        />
                      </div>
                      <div>
                        <Label>Postpartum Weeks</Label>
                        <Input 
                          type="number"
                          defaultValue={selectedMember.postpartumWeeks || ''}
                          onChange={(e) => setSelectedMember({...selectedMember, postpartumWeeks: parseInt(e.target.value) || 0})}
                          placeholder="Number of weeks postpartum"
                        />
                      </div>
                      <div>
                        <Label>Bio</Label>
                        <Input 
                          defaultValue={selectedMember.bio || ''}
                          onChange={(e) => setSelectedMember({...selectedMember, bio: e.target.value})}
                          placeholder="Brief bio about the member"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. COURSE ENROLLMENT */}
                  <div className="pt-3 border-t">
                    <h4 className="font-semibold text-sm text-pink-700 uppercase tracking-wide flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></div>
                      Course Enrollment
                    </h4>
                    <div className="space-y-3">
                      {memberCourseEnrollments.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Currently Enrolled Courses</Label>
                          <div className="space-y-3">
                            {memberCourseEnrollments.map((enrollment: any) => {
                              const isExpired = enrollment.expires_at && new Date(enrollment.expires_at) < new Date();
                              return (
                                <div key={enrollment.id} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    {enrollment.course_image_url && (
                                      <img 
                                        src={enrollment.course_image_url} 
                                        alt={enrollment.course_name}
                                        className="w-10 h-10 rounded object-cover"
                                      />
                                    )}
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-purple-800">{enrollment.course_name}</p>
                                      <div className="flex flex-wrap items-center gap-2 text-xs text-purple-600">
                                        <span>Enrolled: {enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString() : 'Unknown'}</span>
                                        {enrollment.progress_percentage > 0 && (
                                          <span className="text-green-600">• {enrollment.progress_percentage}% complete</span>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={async () => {
                                        if (!confirm(`Remove ${enrollment.course_name} enrollment for ${selectedMember.firstName} ${selectedMember.lastName}?`)) {
                                          return;
                                        }
                                        
                                        try {
                                          const response = await fetch(`/api/admin/course-enrollments/${enrollment.id}`, {
                                            method: 'DELETE',
                                          });

                                          if (!response.ok) {
                                            const errorData = await response.json();
                                            throw new Error(errorData.message || 'Failed to remove enrollment');
                                          }

                                          await queryClient.refetchQueries({ queryKey: ["/api/admin/users", selectedMember.id, "course-enrollments"] });
                                          toast({
                                            variant: "success",
                                            title: "Success",
                                            description: `Removed ${enrollment.course_name} enrollment successfully`,
                                          });
                                        } catch (error) {
                                          toast({
                                            variant: "destructive",
                                            title: "Error",
                                            description: error instanceof Error ? error.message : "Failed to remove enrollment",
                                          });
                                        }
                                      }}
                                      data-testid={`button-remove-course-enrollment-${enrollment.id}`}
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </Button>
                                  </div>
                                  
                                  {/* Validity Period */}
                                  <div className={`p-2 rounded-lg mb-2 ${isExpired ? 'bg-red-50 border border-red-200' : enrollment.expires_at ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className={`w-2 h-2 rounded-full ${isExpired ? 'bg-red-500' : enrollment.expires_at ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                      <p className={`text-xs font-medium ${isExpired ? 'text-red-700' : enrollment.expires_at ? 'text-green-700' : 'text-gray-600'}`}>
                                        {isExpired ? 'Expired' : enrollment.expires_at ? 'Active' : 'No Expiry Set'}
                                      </p>
                                    </div>
                                    {enrollment.expires_at && (
                                      <p className={`text-xs ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                                        {isExpired ? 'Expired' : 'Expires'}: {new Date(enrollment.expires_at).toLocaleDateString('en-US', { 
                                          year: 'numeric', 
                                          month: 'long', 
                                          day: 'numeric' 
                                        })}
                                      </p>
                                    )}
                                  </div>

                                  {/* Extend Validity Buttons */}
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex-1 text-xs"
                                      onClick={async () => {
                                        try {
                                          const response = await fetch(`/api/admin/course-enrollments/${enrollment.id}`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ extendMonths: 3 }),
                                          });

                                          if (!response.ok) {
                                            const errorData = await response.json();
                                            throw new Error(errorData.message || 'Failed to extend validity');
                                          }

                                          await queryClient.refetchQueries({ queryKey: ["/api/admin/users", selectedMember.id, "course-enrollments"] });
                                          toast({
                                            variant: "success",
                                            title: "Success",
                                            description: `Extended ${enrollment.course_name} validity by 3 months`,
                                          });
                                        } catch (error) {
                                          toast({
                                            variant: "destructive",
                                            title: "Error",
                                            description: error instanceof Error ? error.message : "Failed to extend validity",
                                          });
                                        }
                                      }}
                                      data-testid={`button-extend-course-3months-${enrollment.id}`}
                                    >
                                      +3 Months
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex-1 text-xs"
                                      onClick={async () => {
                                        try {
                                          const response = await fetch(`/api/admin/course-enrollments/${enrollment.id}`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ extendMonths: 12 }),
                                          });

                                          if (!response.ok) {
                                            const errorData = await response.json();
                                            throw new Error(errorData.message || 'Failed to extend validity');
                                          }

                                          await queryClient.refetchQueries({ queryKey: ["/api/admin/users", selectedMember.id, "course-enrollments"] });
                                          toast({
                                            variant: "success",
                                            title: "Success",
                                            description: `Extended ${enrollment.course_name} validity by 12 months`,
                                          });
                                        } catch (error) {
                                          toast({
                                            variant: "destructive",
                                            title: "Error",
                                            description: error instanceof Error ? error.message : "Failed to extend validity",
                                          });
                                        }
                                      }}
                                      data-testid={`button-extend-course-12months-${enrollment.id}`}
                                    >
                                      +12 Months
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        <div>
                          <Label>Add Course</Label>
                          <Select 
                            value={selectedCourseForMember}
                            onValueChange={setSelectedCourseForMember}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select course to enroll" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Course</SelectItem>
                              {allCourses
                                .filter(c => c.status === 'published' && !memberCourseEnrollments.some((e: any) => e.course_id === c.id))
                                .map((course) => (
                                  <SelectItem key={course.id} value={course.id}>
                                    {course.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {selectedCourseForMember && selectedCourseForMember !== 'none' && (
                          <>
                            <div>
                              <Label>Access Duration</Label>
                              <Select 
                                value={courseEnrollmentDuration}
                                onValueChange={setCourseEnrollmentDuration}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="3">3 Months</SelectItem>
                                  <SelectItem value="6">6 Months</SelectItem>
                                  <SelectItem value="12">12 Months</SelectItem>
                                  <SelectItem value="lifetime">Lifetime Access</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-gray-500 mt-1">
                                How long the user will have access to this course
                              </p>
                            </div>
                            
                            <Button
                              variant="default"
                              size="sm"
                              className="w-full"
                              onClick={async () => {
                                if (!selectedCourseForMember || selectedCourseForMember === 'none') return;
                                
                                try {
                                  let expiresAt = null;
                                  if (courseEnrollmentDuration !== 'lifetime') {
                                    const months = parseInt(courseEnrollmentDuration);
                                    const expiry = new Date();
                                    expiry.setMonth(expiry.getMonth() + months);
                                    expiresAt = expiry.toISOString();
                                  }
                                  
                                  const response = await apiRequest("POST", `/api/admin/users/${selectedMember.id}/course-enrollments`, {
                                    courseId: selectedCourseForMember,
                                    expiresAt,
                                  });

                                  if (!response.ok) {
                                    const errorData = await response.json();
                                    throw new Error(errorData.message || 'Failed to enroll in course');
                                  }

                                  await queryClient.refetchQueries({ queryKey: ["/api/admin/users", selectedMember.id, "course-enrollments"] });
                                  setSelectedCourseForMember('');
                                  setCourseEnrollmentDuration('3');
                                  
                                  const courseName = allCourses.find(c => c.id === selectedCourseForMember)?.name || 'course';
                                  const durationText = courseEnrollmentDuration === 'lifetime' ? 'with lifetime access' : `for ${courseEnrollmentDuration} months`;
                                  toast({
                                    variant: "success",
                                    title: "Success",
                                    description: `Enrolled ${selectedMember.firstName} in ${courseName} ${durationText}`,
                                  });
                                } catch (error) {
                                  toast({
                                    variant: "destructive",
                                    title: "Error",
                                    description: error instanceof Error ? error.message : "Failed to enroll in course",
                                  });
                                }
                              }}
                              data-testid="button-add-course-enrollment"
                            >
                              <Plus className="w-4 h-4 mr-1" /> Add Course Enrollment
                            </Button>
                          </>
                        )}
                        
                        <p className="text-xs text-gray-500">
                          Enroll user in a course (only published courses shown, already enrolled courses hidden)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3. WHATSAPP COMMUNITY SUPPORT */}
                  <div className="pt-3 border-t">
                    <h4 className="font-semibold text-sm text-pink-700 uppercase tracking-wide flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></div>
                      WhatsApp Community Support
                    </h4>
                    
                    {selectedMember.hasWhatsAppSupport && selectedMember.whatsAppSupportExpiryDate ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <p className="text-sm font-medium text-green-700">
                              {new Date(selectedMember.whatsAppSupportExpiryDate) > new Date() ? 'Active' : 'Expired'}
                            </p>
                          </div>
                          <p className="text-xs text-green-600">
                            Duration: {selectedMember.whatsAppSupportDuration} months
                          </p>
                          <p className="text-xs text-green-600">
                            Expires: {new Date(selectedMember.whatsAppSupportExpiryDate).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              const currentExpiry = new Date(selectedMember.whatsAppSupportExpiryDate!);
                              const newExpiry = new Date(currentExpiry);
                              newExpiry.setMonth(newExpiry.getMonth() + 3);
                              setSelectedMember({
                                ...selectedMember, 
                                whatsAppSupportDuration: (selectedMember.whatsAppSupportDuration || 0) + 3,
                                whatsAppSupportExpiryDate: newExpiry
                              });
                            }}
                          >
                            Extend by 3 Months
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              if (confirm(`Remove WhatsApp support access for ${selectedMember.firstName} ${selectedMember.lastName}?`)) {
                                setSelectedMember({
                                  ...selectedMember, 
                                  hasWhatsAppSupport: false,
                                  whatsAppSupportDuration: null,
                                  whatsAppSupportExpiryDate: null
                                });
                              }
                            }}
                          >
                            Remove Access
                          </Button>
                        </div>

                        {/* Custom Duration Adjustment (for testing) */}
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs font-medium text-blue-700 mb-2">Custom Duration Adjustment (Testing)</p>
                          <div className="flex gap-2 items-end">
                            <div className="flex-1">
                              <Label className="text-xs text-blue-600">Amount</Label>
                              <Input
                                type="number"
                                placeholder="e.g. 7 or -3"
                                className="h-8 text-sm"
                                id="whatsapp-custom-amount"
                              />
                            </div>
                            <div className="w-24">
                              <Label className="text-xs text-blue-600">Unit</Label>
                              <Select defaultValue="days">
                                <SelectTrigger className="h-8 text-sm" id="whatsapp-custom-unit">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="days">Days</SelectItem>
                                  <SelectItem value="months">Months</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300"
                              onClick={() => {
                                const amountInput = document.getElementById('whatsapp-custom-amount') as HTMLInputElement;
                                const unitSelect = document.querySelector('[id="whatsapp-custom-unit"]')?.closest('button');
                                const amount = parseInt(amountInput?.value || '0');
                                const unit = unitSelect?.textContent?.toLowerCase().includes('month') ? 'months' : 'days';
                                
                                if (!amount || isNaN(amount)) {
                                  toast({ title: "Error", description: "Please enter a valid number", variant: "destructive" });
                                  return;
                                }

                                const currentExpiry = new Date(selectedMember.whatsAppSupportExpiryDate!);
                                const newExpiry = new Date(currentExpiry);
                                
                                if (unit === 'months') {
                                  newExpiry.setMonth(newExpiry.getMonth() + amount);
                                } else {
                                  newExpiry.setDate(newExpiry.getDate() + amount);
                                }

                                setSelectedMember({
                                  ...selectedMember,
                                  whatsAppSupportExpiryDate: newExpiry
                                });

                                amountInput.value = '';
                                toast({ 
                                  title: "Updated", 
                                  description: `${amount > 0 ? 'Added' : 'Reduced'} ${Math.abs(amount)} ${unit} ${amount > 0 ? 'to' : 'from'} expiry` 
                                });
                              }}
                            >
                              Apply
                            </Button>
                          </div>
                          <p className="text-xs text-blue-500 mt-1">Use negative numbers to reduce (e.g. -5 days)</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-600">No WhatsApp support currently assigned</p>
                        </div>
                        
                        <div>
                          <Label>Grant WhatsApp Support</Label>
                          <Select 
                            value={selectedMember.hasWhatsAppSupport ? selectedMember.whatsAppSupportDuration?.toString() : ""}
                            onValueChange={(value) => {
                              const duration = parseInt(value);
                              const now = new Date();
                              const expiryDate = new Date(now);
                              expiryDate.setMonth(expiryDate.getMonth() + duration);
                              
                              setSelectedMember({
                                ...selectedMember, 
                                hasWhatsAppSupport: true,
                                whatsAppSupportDuration: duration,
                                whatsAppSupportExpiryDate: expiryDate
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">3 months</SelectItem>
                              <SelectItem value="6">6 months</SelectItem>
                              <SelectItem value="12">12 months</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500 mt-1">
                            Select duration to grant WhatsApp community access
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. ACCOUNT ACCESS PERIOD */}
                  <div className="pt-3 border-t">
                    <h4 className="font-semibold text-sm text-pink-700 uppercase tracking-wide flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></div>
                      Account Access Period
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Valid From</Label>
                        <Input
                          type="date"
                          defaultValue={selectedMember.validFrom ? format(new Date(selectedMember.validFrom), "yyyy-MM-dd") : ""}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : null;
                            setSelectedMember({...selectedMember, validFrom: date});
                          }}
                        />
                      </div>
                      <div>
                        <Label>Valid Until</Label>
                        <Input
                          type="date"
                          defaultValue={selectedMember.validUntil ? format(new Date(selectedMember.validUntil), "yyyy-MM-dd") : ""}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : null;
                            setSelectedMember({...selectedMember, validUntil: date});
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Overall account access period (separate from program access)
                    </p>
                  </div>

                  {/* 5. ADMIN PRIVILEGES */}
                  <div className="pt-3 border-t">
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id="edit-admin"
                        defaultChecked={!!selectedMember.isAdmin}
                        onCheckedChange={(checked) => 
                          setSelectedMember({...selectedMember, isAdmin: !!checked})
                        }
                      />
                      <div>
                        <Label htmlFor="edit-admin" className="font-medium">Administrator Privileges</Label>
                        <p className="text-xs text-muted-foreground">
                          Grant admin access to manage users and content
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 6. PASSWORD MANAGEMENT & DANGER ZONE */}
                  <div className="pt-3 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Password Management */}
                      <div>
                        <h4 className="font-semibold text-sm text-pink-700 uppercase tracking-wide flex items-center gap-2 mb-3">
                          <div className="w-1 h-4 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></div>
                          Password
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setResetPasswordMember(selectedMember)}
                          data-testid="button-reset-password"
                        >
                          Reset Password
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1">
                          New password shown in notification
                        </p>
                      </div>

                      {/* Danger Zone */}
                      <div>
                        <h4 className="font-semibold text-sm text-red-600 uppercase tracking-wide flex items-center gap-2 mb-3">
                          <div className="w-1 h-4 bg-gradient-to-b from-red-500 to-rose-500 rounded-full"></div>
                          Danger Zone
                        </h4>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            if (confirm(`Are you sure you want to deactivate ${selectedMember.firstName} ${selectedMember.lastName}? This action will immediately revoke all access.`)) {
                              deactivateMemberMutation.mutate(selectedMember.id);
                            }
                          }}
                          disabled={deactivateMemberMutation.isPending}
                          data-testid="button-deactivate-member"
                        >
                          Deactivate Account
                        </Button>
                        <p className="text-xs text-red-600 mt-1">
                          Permanently revoke all access
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

                  {/* Dialog Action Buttons */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    {memberViewMode === 'view' ? (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={() => setMemberViewMode('edit')}
                          data-testid="button-edit-member"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedMember(null)}
                          data-testid="button-close-member-dialog"
                        >
                          Close
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedMember(null)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={async () => {
                            if (!selectedMember) return;
                            
                            try {
                              // Update user details
                              const response = await fetch(`/api/admin/users/${selectedMember.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  firstName: selectedMember.firstName,
                                  lastName: selectedMember.lastName,
                                  email: selectedMember.email,
                                  phone: selectedMember.phone,
                                  isAdmin: selectedMember.isAdmin,
                                  validFrom: selectedMember.validFrom,
                                  validUntil: selectedMember.validUntil,
                                  hasWhatsAppSupport: selectedMember.hasWhatsAppSupport,
                                  whatsAppSupportDuration: selectedMember.whatsAppSupportDuration,
                                  whatsAppSupportExpiryDate: selectedMember.whatsAppSupportExpiryDate,
                                }),
                              });
                              
                              if (!response.ok) {
                                const errorData = await response.json();
                                throw new Error(errorData.message || 'Failed to update user');
                              }
                              
                              const responseData = await response.json();
                              
                              // If program selected, enroll user
                              if (selectedProgramForMember && selectedProgramForMember !== 'none') {
                                const enrollResponse = await fetch('/api/member-programs', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    userId: selectedMember.id,
                                    programId: selectedProgramForMember,
                                    expiryDate: selectedMember.validUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                                  }),
                                });
                                
                                if (!enrollResponse.ok) {
                                  const errorData = await enrollResponse.json();
                                  throw new Error(errorData.message || 'Failed to enroll in program');
                                }
                              }
                              
                              // Refetch queries and wait for them to complete
                              await queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
                              await queryClient.invalidateQueries({ queryKey: ["/api/member-programs", selectedMember.id] });
                              
                              toast({ 
                                variant: "success",
                                title: "Success", 
                                description: `${selectedMember.firstName} ${selectedMember.lastName} updated successfully${selectedProgramForMember && selectedProgramForMember !== 'none' ? ' and enrolled in program' : ''}` 
                              });
                              setSelectedMember(null);
                              setSelectedProgramForMember('');
                            } catch (error) {
                              toast({ 
                                variant: "destructive",
                                title: "Error", 
                                description: error instanceof Error ? error.message : "Failed to update member" 
                              });
                            }
                          }}
                        >
                          Save Changes
                        </Button>
                      </>
                    )}
                  </div>
            </DialogContent>
          </Dialog>
            </Card>
        </div>
      )}

      {activeTab === 'deactivated' && (
        <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="border-b border-border p-6">
                <h3 className="text-lg font-semibold text-foreground">Deactivated Members</h3>
              </div>

              {/* Deactivated Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Name</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Email</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Deactivated On</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers
                      ?.filter(u => {
                        const validUntil = u.validUntil ? new Date(u.validUntil) : null;
                        return validUntil && validUntil <= new Date();
                      })
                      .map((member) => (
                        <tr 
                          key={member.id} 
                          className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedMember(member);
                            setMemberViewMode('view');
                          }}
                          data-testid={`row-deactivated-member-${member.id}`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-semibold">
                                {member.firstName?.[0]}{member.lastName?.[0]}
                              </div>
                              <div>
                                <p className="font-medium text-foreground" data-testid={`text-name-${member.id}`}>
                                  {member.firstName} {member.lastName}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground" data-testid={`text-email-${member.id}`}>
                            {member.email}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground" data-testid={`text-deactivated-${member.id}`}>
                            {member.validUntil ? format(new Date(member.validUntil), "MMM dd, yyyy") : "Unknown"}
                          </td>
                          <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/admin/users/${member.id}/extend-validity`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ months: 12 }),
                                  });

                                  if (!response.ok) {
                                    const errorData = await response.json();
                                    throw new Error(errorData.message || 'Failed to reactivate user');
                                  }

                                  queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
                                  queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
                                  toast({
                                    variant: "success",
                                    title: "Success",
                                    description: `${member.firstName} ${member.lastName} has been reactivated for 1 year`,
                                  });
                                } catch (error) {
                                  toast({
                                    variant: "destructive",
                                    title: "Error",
                                    description: error instanceof Error ? error.message : "Failed to reactivate user",
                                  });
                                }
                              }}
                              data-testid={`button-reactivate-${member.id}`}
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              Reactivate
                            </Button>
                          </td>
                        </tr>
                      ))}
                    {allUsers?.filter(u => {
                      const validUntil = u.validUntil ? new Date(u.validUntil) : null;
                      return validUntil && validUntil <= new Date();
                    }).length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                          No deactivated members found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
        </div>
      )}

      {activeTab === 'programs' && (
        <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Program Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {programs.map((program) => (
                  <div key={program.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={program.imageUrl} 
                          alt={program.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="font-semibold text-foreground">{program.name}</h3>
                          <p className="text-sm text-muted-foreground">{program.level} • {program.duration}</p>
                          <p className="text-sm text-primary font-medium">₹{(program.price / 100).toFixed(2)}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setEditingProgram(program)}
                        data-testid={`button-edit-program-${program.id}`}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                    
                    {editingProgram?.id === program.id && (
                      <div className="mt-4 p-4 bg-muted/20 rounded-lg space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`name-${program.id}`}>Program Name</Label>
                            <Input
                              id={`name-${program.id}`}
                              value={editingProgram.name}
                              onChange={(e) => setEditingProgram({...editingProgram, name: e.target.value})}
                              data-testid={`input-program-name-${program.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`price-${program.id}`}>Price (₹)</Label>
                            <Input
                              id={`price-${program.id}`}
                              type="number"
                              value={editingProgram.price}
                              onChange={(e) => setEditingProgram({...editingProgram, price: parseInt(e.target.value) || 0})}
                              data-testid={`input-program-price-${program.id}`}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor={`description-${program.id}`}>Description</Label>
                          <Textarea
                            id={`description-${program.id}`}
                            value={editingProgram.description}
                            onChange={(e) => setEditingProgram({...editingProgram, description: e.target.value})}
                            rows={3}
                            data-testid={`textarea-program-description-${program.id}`}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleUpdateProgram(editingProgram)}
                            disabled={updateProgramMutation.isPending}
                            data-testid={`button-save-program-${program.id}`}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {updateProgramMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setEditingProgram(null)}
                            data-testid={`button-cancel-program-${program.id}`}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
        </div>
      )}

      {activeTab === 'assets' && (
        <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  Asset Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assets.map((asset) => (
                    <div key={asset.filename} className="border rounded-lg p-4 space-y-3">
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <img 
                          src={asset.url} 
                          alt={asset.displayName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div>
                        {editingAsset === asset.filename ? (
                          <div className="space-y-2">
                            <Label htmlFor={`asset-name-${asset.filename}`}>Display Name</Label>
                            <Input
                              id={`asset-name-${asset.filename}`}
                              value={assetDisplayNames[asset.filename] || asset.displayName}
                              onChange={(e) => setAssetDisplayNames({ 
                                ...assetDisplayNames, 
                                [asset.filename]: e.target.value 
                              })}
                              data-testid={`input-asset-name-${asset.filename}`}
                            />
                            <div className="flex gap-2">
                              <Button 
                                size="sm"
                                onClick={() => handleUpdateAsset(asset.filename, assetDisplayNames[asset.filename] || asset.displayName)}
                                disabled={updateAssetMutation.isPending}
                                data-testid={`button-save-asset-${asset.filename}`}
                              >
                                <Save className="w-3 h-3 mr-1" />
                                {updateAssetMutation.isPending ? "Saving..." : "Save"}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setEditingAsset(null)}
                                data-testid={`button-cancel-asset-${asset.filename}`}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-foreground" data-testid={`asset-name-${asset.displayName}`}>
                                {asset.displayName}
                              </h3>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAsset(asset.filename, asset.displayName)}
                              data-testid={`button-edit-asset-${asset.filename}`}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(asset.lastModified).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {asset.url}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
        </div>
      )}

      {activeTab === 'workouts' && (
        <WorkoutContentManager />
      )}
      
      {/* Reset Password Options Dialog */}
      <Dialog open={!!resetPasswordMember} onOpenChange={() => {
        setResetPasswordMember(null);
        setResetPasswordMode('auto');
        setResetManualPassword('');
      }}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-semibold">
                Reset Password
              </span>
            </DialogTitle>
          </DialogHeader>
          {resetPasswordMember && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Resetting password for <strong>{resetPasswordMember.firstName} {resetPasswordMember.lastName}</strong>
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Password Setup</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="resetPasswordMode"
                      value="auto"
                      checked={resetPasswordMode === 'auto'}
                      onChange={(e) => setResetPasswordMode(e.target.value as 'auto' | 'manual')}
                      className="w-4 h-4"
                      data-testid="radio-reset-password-auto"
                    />
                    <span className="text-sm">Auto-generate password</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="resetPasswordMode"
                      value="manual"
                      checked={resetPasswordMode === 'manual'}
                      onChange={(e) => setResetPasswordMode(e.target.value as 'auto' | 'manual')}
                      className="w-4 h-4"
                      data-testid="radio-reset-password-manual"
                    />
                    <span className="text-sm">Enter password manually</span>
                  </label>
                </div>
                
                {resetPasswordMode === 'manual' && (
                  <div className="space-y-2">
                    <Label htmlFor="reset-manual-password">New Password *</Label>
                    <Input
                      id="reset-manual-password"
                      type="text"
                      value={resetManualPassword}
                      onChange={(e) => setResetManualPassword(e.target.value)}
                      placeholder="Enter new password"
                      data-testid="input-reset-manual-password"
                    />
                    <p className="text-xs text-muted-foreground">
                      Password will be displayed after reset
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setResetPasswordMember(null);
                    setResetPasswordMode('auto');
                    setResetManualPassword('');
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleResetPassword} data-testid="button-confirm-reset-password">
                  Reset Password
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reset Password Success Dialog */}
      <Dialog open={!!resetPasswordData} onOpenChange={() => setResetPasswordData(null)}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-semibold">
                Password Reset Successfully
              </span>
            </DialogTitle>
          </DialogHeader>
          {resetPasswordData && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  New Password Generated
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 dark:text-blue-300">Email:</span>
                    <code className="bg-white dark:bg-blue-900 px-2 py-1 rounded border text-blue-800 dark:text-blue-200">
                      {resetPasswordData.email}
                    </code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 dark:text-blue-300">New Password:</span>
                    <div className="flex items-center gap-2">
                      <code className="bg-white dark:bg-blue-900 px-2 py-1 rounded border text-blue-800 dark:text-blue-200 font-mono">
                        {resetPasswordData.password}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(resetPasswordData.password);
                          toast({ variant: "success", title: "Copied!", description: "Password copied to clipboard" });
                        }}
                        className="h-7 w-7 p-0"
                      >
                        📋
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  ⚠️ Share this password securely with the user. They should change it after first login.
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => setResetPasswordData(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Email Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={(open) => {
        setIsPreviewOpen(open);
        if (!open) setEmailPreview(null);
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-pink-500" />
              Email Preview
            </DialogTitle>
            <DialogDescription>
              Review the email before sending
            </DialogDescription>
          </DialogHeader>
          
          {emailPreview && (
            <div className="flex flex-col gap-4 py-4 overflow-hidden flex-1">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground text-xs">Recipient</Label>
                  <p className="font-medium">{emailPreview.recipient.name}</p>
                  <p className="text-muted-foreground text-xs">{emailPreview.recipient.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Email Type</Label>
                  <p className="font-medium capitalize">{emailPreview.emailType.replace('-', ' ')}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground text-xs">Subject</Label>
                <p className="font-medium text-lg">{emailPreview.subject}</p>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <Label className="text-muted-foreground text-xs mb-2 block">Preview</Label>
                <div className="border rounded-lg overflow-hidden h-[400px]">
                  <iframe 
                    srcDoc={emailPreview.html} 
                    className="w-full h-full"
                    title="Email Preview"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="border-t pt-4 gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsPreviewOpen(false);
                setEmailPreview(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (emailPreview) {
                  quickSendEmailMutation.mutate({
                    userId: emailPreview.recipient.id,
                    emailType: emailPreview.emailType
                  });
                }
              }}
              disabled={quickSendEmailMutation.isPending}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              {quickSendEmailMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Member Profile Dialog */}
      <Dialog open={!!fullProfileMember} onOpenChange={() => setFullProfileMember(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md text-white text-lg font-bold">
                {fullProfileMember?.firstName?.[0]}{fullProfileMember?.lastName?.[0]}
              </div>
              <div>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold">
                  {fullProfileMember?.firstName} {fullProfileMember?.lastName}
                </span>
                <p className="text-sm text-muted-foreground font-normal">{fullProfileMember?.email}</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {fullProfileLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
            </div>
          ) : fullProfileData ? (
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-4">
                <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
                <TabsTrigger value="checkins" className="text-xs">Check-ins</TabsTrigger>
                <TabsTrigger value="photos" className="text-xs">Photos</TabsTrigger>
                <TabsTrigger value="emails" className="text-xs">Emails</TabsTrigger>
                <TabsTrigger value="community" className="text-xs">Community</TabsTrigger>
              </TabsList>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-purple-700">Activity Logs ({fullProfileData.activityLogs.length})</h3>
                </div>
                {fullProfileData.activityLogs.length > 0 ? (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {fullProfileData.activityLogs.map((log) => (
                      <div key={log.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                        <div className={`w-2 h-2 rounded-full ${
                          log.activityType === 'login' ? 'bg-blue-500' :
                          log.activityType === 'workout_completion' ? 'bg-green-500' :
                          log.activityType === 'workout_start' ? 'bg-pink-500' :
                          'bg-gray-400'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium capitalize">{log.activityType.replace(/_/g, ' ')}</p>
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {log.metadata.workoutName || log.metadata.programName || ''}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {log.createdAt ? format(new Date(log.createdAt), "MMM dd, HH:mm") : 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No activity logs found</p>
                )}
              </TabsContent>

              {/* Check-ins Tab */}
              <TabsContent value="checkins" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-purple-700">Wellness Check-ins ({fullProfileData.checkins.length})</h3>
                </div>
                {fullProfileData.checkins.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {fullProfileData.checkins.map((checkin) => (
                      <div key={checkin.id} className="p-4 bg-white rounded-lg border border-gray-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {checkin.mood && (
                              <span className="text-2xl">
                                {checkin.mood === 'great' ? '😊' :
                                 checkin.mood === 'good' ? '🙂' :
                                 checkin.mood === 'okay' ? '😐' :
                                 checkin.mood === 'tired' ? '😴' :
                                 checkin.mood === 'struggling' ? '😔' : ''}
                              </span>
                            )}
                            <span className="text-sm font-medium capitalize">{checkin.mood || 'No mood'}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {checkin.createdAt ? format(new Date(checkin.createdAt), "MMM dd, yyyy") : 'N/A'}
                          </p>
                        </div>
                        {checkin.energyLevel && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Energy:</span>
                            <div className="flex gap-1">
                              {[1,2,3,4,5].map((level) => (
                                <div 
                                  key={level} 
                                  className={`w-4 h-2 rounded ${level <= checkin.energyLevel! ? 'bg-pink-400' : 'bg-gray-200'}`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {checkin.goals && checkin.goals.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {checkin.goals.map((goal, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{goal}</Badge>
                            ))}
                          </div>
                        )}
                        {checkin.notes && (
                          <p className="text-sm text-gray-600 italic">"{checkin.notes}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No check-ins recorded</p>
                )}
              </TabsContent>

              {/* Photos Tab */}
              <TabsContent value="photos" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-purple-700">Progress Photos ({fullProfileData.progressPhotos.length})</h3>
                </div>
                {fullProfileData.progressPhotos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
                    {fullProfileData.progressPhotos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img 
                          src={photo.photoUrl} 
                          alt={`Progress photo - ${photo.photoType}`}
                          className="w-full h-40 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b-lg">
                          <p className="text-white text-xs font-medium capitalize">{photo.photoType}</p>
                          {photo.week && <p className="text-white/80 text-xs">Week {photo.week}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No progress photos uploaded</p>
                )}
              </TabsContent>

              {/* Emails Tab */}
              <TabsContent value="emails" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-purple-700">Email History ({fullProfileData.emailHistory.length})</h3>
                </div>
                {fullProfileData.emailHistory.length > 0 ? (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {fullProfileData.emailHistory.map((email) => (
                      <div key={email.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          email.openedAt ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {email.openedAt ? <Eye className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{email.campaignName}</p>
                          <p className="text-xs text-muted-foreground capitalize">{email.templateType.replace(/-/g, ' ')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {email.sentAt ? format(new Date(email.sentAt), "MMM dd, HH:mm") : 'N/A'}
                          </p>
                          {email.openedAt && (
                            <p className="text-xs text-green-600">Opened</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No emails sent to this member</p>
                )}
              </TabsContent>

              {/* Community Tab */}
              <TabsContent value="community" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-purple-700">Community Posts ({fullProfileData.communityPosts.length})</h3>
                </div>
                {fullProfileData.communityPosts.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {fullProfileData.communityPosts.map((post: any) => (
                      <div key={post.id} className="p-4 bg-white rounded-lg border border-gray-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">{post.category || 'General'}</Badge>
                          <p className="text-xs text-muted-foreground">
                            {post.createdAt ? format(new Date(post.createdAt), "MMM dd, yyyy") : 'N/A'}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700">{post.content}</p>
                        {post.imageUrl && (
                          <img 
                            src={post.imageUrl} 
                            alt="Post image" 
                            className="w-full max-h-40 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{post.likeCount || 0} likes</span>
                          <span>{post.commentCount || 0} comments</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No community posts</p>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Unable to load profile data</p>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedMember(fullProfileMember);
                setMemberViewMode('view');
                setFullProfileMember(null);
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quick View
            </Button>
            <Button 
              variant="outline"
              onClick={() => setFullProfileMember(null)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Extension Dialog */}
      <Dialog open={extensionDialogOpen} onOpenChange={setExtensionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-white" />
              </div>
              Extend Membership
            </DialogTitle>
            <DialogDescription>
              Extend membership for {extensionMember?.name}
            </DialogDescription>
          </DialogHeader>
          
          {extensionMember && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">{extensionMember.name}</p>
                <p className="text-xs text-muted-foreground">{extensionMember.email}</p>
                {extensionMember.programExpiryDate && (
                  <p className="text-xs text-amber-600 mt-1">
                    Program {extensionMember.isExpiringSoon ? 'expires' : 'expired'}: {new Date(extensionMember.programExpiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
                {extensionMember.whatsAppExpiryDate && (
                  <p className="text-xs text-red-600 mt-1">
                    WhatsApp {extensionMember.isExpiringSoon ? 'expires' : 'expired'}: {new Date(extensionMember.whatsAppExpiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Extension Period (Based on Payment)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { months: 3, amount: 1000 },
                    { months: 6, amount: 2000 },
                    { months: 9, amount: 3000 },
                    { months: 12, amount: 4000 },
                  ].map((option) => (
                    <Button
                      key={option.months}
                      type="button"
                      variant={extensionMonths === option.months ? "default" : "outline"}
                      className={cn(
                        "h-auto py-3 flex flex-col items-center gap-1",
                        extensionMonths === option.months && "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                      )}
                      onClick={() => setExtensionMonths(option.months)}
                    >
                      <span className="font-semibold">{option.months} months</span>
                      <span className="text-xs opacity-80">₹{option.amount.toLocaleString()}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setExtensionDialogOpen(false);
                    setExtensionMember(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  disabled={extendMembershipMutation.isPending}
                  onClick={() => {
                    if (extensionMember) {
                      extendMembershipMutation.mutate({
                        userId: extensionMember.id,
                        months: extensionMonths,
                        notes: `Extended ${extensionMonths} months (₹${(extensionMonths / 3) * 1000} payment)`,
                      });
                    }
                  }}
                >
                  {extendMembershipMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Extend by {extensionMonths} Months
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reminder Email Template Modal */}
      <Dialog open={!!reminderEmailData} onOpenChange={(open) => !open && setReminderEmailData(null)}>
        <DialogContent className="sm:max-w-lg bg-gradient-to-br from-white via-pink-50/30 to-rose-50/20">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center shadow-md">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent font-semibold">
                {reminderEmailData?.type === 'expiring' ? 'Expiring Soon Reminder' : 'Expired Membership Reminder'}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          {reminderEmailData && (() => {
            const { subject, body } = generateReminderEmail(reminderEmailData);
            const fullEmail = `To: ${reminderEmailData.userEmail}\nSubject: ${subject}\n\n${body}`;
            
            return (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">To</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={reminderEmailData.userEmail} 
                      readOnly 
                      className="bg-white flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(reminderEmailData.userEmail);
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
                      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(reminderEmailData.userEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
    </AdminLayout>
  );
}

// Add User Modal Component
interface AddUserModalProps {
  form: any;
  onSubmit: (data: AdminCreateUser) => void;
  isLoading: boolean;
  onClose: () => void;
  newUserData: { user: any; password: string } | null;
  programs: Program[];
  passwordMode: 'auto' | 'manual';
  setPasswordMode: (mode: 'auto' | 'manual') => void;
  manualPassword: string;
  setManualPassword: (password: string) => void;
}

function AddUserModal({ form, onSubmit, isLoading, onClose, newUserData, programs, passwordMode, setPasswordMode, manualPassword, setManualPassword }: AddUserModalProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (newUserData) {
    // Show success modal with user credentials
    return (
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-semibold">
              User Created Successfully
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
              Account Created for {newUserData.user.firstName} {newUserData.user.lastName}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-green-700 dark:text-green-300">Email:</span>
                <code className="bg-white dark:bg-green-900 px-2 py-1 rounded border text-green-800 dark:text-green-200">
                  {newUserData.user.email}
                </code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-700 dark:text-green-300">Password:</span>
                <div className="flex items-center gap-2">
                  <code className="bg-white dark:bg-green-900 px-2 py-1 rounded border text-green-800 dark:text-green-200 font-mono">
                    {newUserData.password}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(newUserData.password)}
                    className="h-7 w-7 p-0"
                  >
                    📋
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Email Template</h4>
            <textarea
              className="w-full h-32 p-3 text-sm border rounded resize-none bg-white dark:bg-blue-900 text-blue-800 dark:text-blue-200"
              readOnly
              value={`Subject: Welcome to Your Postpartum Strength Recovery Program

Dear ${newUserData.user.firstName},

Welcome to Your Postpartum Strength Recovery Program! Your account has been created successfully.

Login Details:
Login URL: https://app.strongerwithzoe.in/
Email: ${newUserData.user.email}
Password: ${newUserData.password}

Please login at your earliest convenience and change your password for security.

Best regards,
The Stronger With Zoe Team`}
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => copyToClipboard(`Subject: Welcome to Your Postpartum Strength Recovery Program

Dear ${newUserData.user.firstName},

Welcome to Your Postpartum Strength Recovery Program! Your account has been created successfully.

Login Details:
Login URL: https://app.strongerwithzoe.in/
Email: ${newUserData.user.email}
Password: ${newUserData.password}

Please login at your earliest convenience and change your password for security.

Best regards,
The Stronger With Zoe Team`)}
            >
              📋 Copy Email Template
            </Button>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    );
  }

  // Show form modal
  return (
    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-pink-50/30 to-rose-50/20">
      <DialogHeader className="border-b pb-4">
        <DialogTitle className="flex items-center gap-3 text-xl">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center shadow-md">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent font-semibold">
            Add New User
          </span>
        </DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">1. Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter first name" data-testid="input-first-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter last name" data-testid="input-last-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="Enter email address" data-testid="input-email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="Enter phone number" data-testid="input-phone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Section 2: Program Management */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">2. Program Management</h3>
            <FormField
              control={form.control}
              name="programId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Program *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-program">
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Required - User needs a program to access the app
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Section 3: WhatsApp Community Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">3. WhatsApp Community Support</h3>
            <FormField
              control={form.control}
              name="hasWhatsAppSupport"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-whatsapp-support"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Grant WhatsApp Community Access</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Provide access to WhatsApp community support
                    </p>
                  </div>
                </FormItem>
              )}
            />
            
            {form.watch("hasWhatsAppSupport") && (
              <FormField
                control={form.control}
                name="whatsAppSupportDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Support Duration</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-whatsapp-duration">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="3">3 months</SelectItem>
                        <SelectItem value="6">6 months</SelectItem>
                        <SelectItem value="12">12 months</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Section 4: Account Access Period */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">4. Account Access Period</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="validFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Valid From</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="date"
                          value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : undefined;
                            field.onChange(date);
                          }}
                          className="pr-10"
                          data-testid="input-valid-from"
                        />
                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Valid Until</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="date"
                          value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : undefined;
                            field.onChange(date);
                          }}
                          className="pr-10"
                          data-testid="input-valid-until"
                        />
                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Section 5: Admin Privileges */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">5. Admin Privileges</h3>
            <FormField
              control={form.control}
              name="isAdmin"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-is-admin"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Grant Administrator Access</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Allow this user to manage other users and content
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Section 6: Password Setup */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">6. Password Setup</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="passwordMode"
                  value="auto"
                  checked={passwordMode === 'auto'}
                  onChange={(e) => setPasswordMode(e.target.value as 'auto' | 'manual')}
                  className="w-4 h-4"
                  data-testid="radio-password-auto"
                />
                <span className="text-sm">Auto-generate password</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="passwordMode"
                  value="manual"
                  checked={passwordMode === 'manual'}
                  onChange={(e) => setPasswordMode(e.target.value as 'auto' | 'manual')}
                  className="w-4 h-4"
                  data-testid="radio-password-manual"
                />
                <span className="text-sm">Enter password manually</span>
              </label>
            </div>
            
            {passwordMode === 'manual' && (
              <div className="space-y-2">
                <Label htmlFor="manual-password">Password *</Label>
                <Input
                  id="manual-password"
                  type="text"
                  value={manualPassword}
                  onChange={(e) => setManualPassword(e.target.value)}
                  placeholder="Enter password"
                  data-testid="input-manual-password"
                />
                <p className="text-xs text-muted-foreground">
                  Password will be displayed after user creation
                </p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} data-testid="button-create-user">
              {isLoading ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}
