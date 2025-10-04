import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { Eye, Edit, Users, CalendarIcon, TrendingUp, AlertTriangle, Image, Settings, Save, FolderOpen, Plus, UserPlus, UserX } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { User, Program, AdminCreateUser } from "@shared/schema";
import { adminCreateUserSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Admin() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [assetDisplayNames, setAssetDisplayNames] = useState<{[key: string]: string}>({});
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState<{user: any, password: string} | null>(null);
  const [resetPasswordData, setResetPasswordData] = useState<{userId: string, email: string, password: string} | null>(null);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [memberViewMode, setMemberViewMode] = useState<'view' | 'edit'>('view');
  const [selectedProgramForMember, setSelectedProgramForMember] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState("");
  const [passwordMode, setPasswordMode] = useState<'auto' | 'manual'>('auto');
  const [manualPassword, setManualPassword] = useState('');
  const [resetPasswordMode, setResetPasswordMode] = useState<'auto' | 'manual'>('auto');
  const [resetManualPassword, setResetManualPassword] = useState('');
  const [resetPasswordMember, setResetPasswordMember] = useState<User | null>(null);
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

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      setLocation("/");
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (!parsedUser.isAdmin) {
      setLocation("/dashboard");
      return;
    }
    setUser(parsedUser);
  }, [setLocation]);

  const { data: adminStats } = useQuery<{ totalMembers: number; activeMembers: number; expiringSoon: number }>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin,
  });

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
  });

  const { data: programs = [] } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
    enabled: !!user?.isAdmin,
  });

  const { data: assets = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/assets"],
    enabled: !!user?.isAdmin,
  });

  // Fetch member's enrolled programs when a member is selected
  const { data: memberEnrolledPrograms = [] } = useQuery<any[]>({
    queryKey: ["/api/member-programs", selectedMember?.id],
    enabled: !!selectedMember?.id,
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

  if (!user?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Navigation */}
      <header className="bg-secondary border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src="/assets/logo.png" 
                  alt="Stronger With Zoe" 
                  className="h-8 w-auto object-contain"
                />
              </div>
              <span className="ml-3 text-lg font-semibold text-secondary-foreground">
                Admin Dashboard
              </span>
            </div>
            
            <Button
              onClick={() => setLocation("/dashboard")}
              data-testid="button-back-member"
            >
              Back to Member View
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <TrendingUp className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="members" data-testid="tab-members">
              <Users className="w-4 h-4 mr-2" />
              Members
            </TabsTrigger>
            <TabsTrigger value="deactivated" data-testid="tab-deactivated">
              <UserX className="w-4 h-4 mr-2" />
              Deactivated
            </TabsTrigger>
            <TabsTrigger value="programs" data-testid="tab-programs">
              <Settings className="w-4 h-4 mr-2" />
              Programs
            </TabsTrigger>
            <TabsTrigger value="assets" data-testid="tab-assets">
              <Image className="w-4 h-4 mr-2" />
              Assets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Members</h3>
              <p className="text-3xl font-bold text-foreground" data-testid="stat-total-members">
                {adminStats?.totalMembers || 0}
              </p>
              <p className="text-sm text-green-600 mt-1">+12% this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Active Members</h3>
              <p className="text-3xl font-bold text-foreground" data-testid="stat-active-members">
                {adminStats?.activeMembers || 0}
              </p>
              <p className="text-sm text-green-600 mt-1">87% active rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Expiring Soon</h3>
              <p className="text-3xl font-bold text-foreground" data-testid="stat-expiring">
                {adminStats?.expiringSoon || 0}
              </p>
              <p className="text-sm text-amber-600 mt-1">Next 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Community Posts</h3>
              <p className="text-3xl font-bold text-foreground">156</p>
              <p className="text-sm text-green-600 mt-1">This week</p>
            </CardContent>
          </Card>
        </div>

          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <Card className="overflow-hidden">
          <div className="border-b border-border p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">Member Management</h3>
              <div className="flex space-x-3">
                <Input
                  type="search"
                  placeholder="Search members..."
                  className="w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-members"
                />
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
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Member</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Terms Accepted</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Disclaimer Accepted</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Joined</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.filter((member) => {
                  // Filter out deactivated users (validUntil has passed)
                  const validUntil = member.validUntil ? new Date(member.validUntil) : null;
                  const isDeactivated = validUntil && validUntil <= new Date();
                  if (isDeactivated) return false;
                  
                  // Search filter
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    member.firstName?.toLowerCase().includes(query) ||
                    member.lastName?.toLowerCase().includes(query) ||
                    member.email?.toLowerCase().includes(query)
                  );
                }).map((member) => (
                  <tr key={member.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {member.firstName?.[0]}{member.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={member.termsAccepted ? "default" : "secondary"} className="rounded-none px-4 py-2">
                        {member.termsAccepted ? "Active" : "Pending"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={member.isAdmin ? "destructive" : "outline"} className="rounded-none px-4 py-2">
                        {member.isAdmin ? "Admin" : "Member"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs">
                        {member.termsAcceptedAt ? (
                          <div className="flex flex-col">
                            <span className="text-green-600 font-medium">✓ Accepted</span>
                            <span className="text-muted-foreground">
                              {new Date(member.termsAcceptedAt).toLocaleDateString()} {new Date(member.termsAcceptedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        ) : (
                          <span className="text-red-500">Not accepted</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs">
                        {member.disclaimerAcceptedAt ? (
                          <div className="flex flex-col">
                            <span className="text-green-600 font-medium">✓ Accepted</span>
                            <span className="text-muted-foreground">
                              {new Date(member.disclaimerAcceptedAt).toLocaleDateString()} {new Date(member.disclaimerAcceptedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        ) : (
                          <span className="text-red-500">Not accepted</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-foreground">
                        {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
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
                  {/* Profile Section */}
                  <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-200/50 shadow-sm">
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

                  {/* Enrolled Programs */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-pink-700 uppercase tracking-wide flex items-center gap-2">
                      <div className="w-1 h-4 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></div>
                      Enrolled Programs
                    </h4>
                    
                    {memberEnrolledPrograms.length > 0 ? (
                      <div className="space-y-2">
                        {memberEnrolledPrograms.map((enrollment: any) => {
                          const program = programs.find(p => p.id === enrollment.programId);
                          return (
                            <div key={enrollment.id} className="p-3 bg-white border-2 border-gray-100 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {program?.imageUrl && (
                                    <img 
                                      src={program.imageUrl} 
                                      alt={program.name}
                                      className="w-10 h-10 rounded object-cover"
                                    />
                                  )}
                                  <div>
                                    <p className="text-sm font-medium">{program?.name || 'Unknown Program'}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Enrolled: {enrollment.enrolledAt && !isNaN(new Date(enrollment.enrolledAt).getTime()) 
                                        ? new Date(enrollment.enrolledAt).toLocaleDateString()
                                        : selectedMember.createdAt 
                                          ? new Date(selectedMember.createdAt).toLocaleDateString()
                                          : 'Unknown'}
                                    </p>
                                  </div>
                                </div>
                                {enrollment.expiryDate && (
                                  <div className="text-right">
                                    <p className="text-xs text-muted-foreground">Expires</p>
                                    <p className="text-xs font-medium">
                                      {new Date(enrollment.expiryDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No programs enrolled</p>
                    )}
                  </div>

                  {/* Member Actions */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-pink-700 uppercase tracking-wide flex items-center gap-2">
                      <div className="w-1 h-4 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></div>
                      Member Actions
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Extend Validity Buttons */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Extend Access Period</Label>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => extendValidityMutation.mutate({ userId: selectedMember.id, months: 1 })}
                            disabled={extendValidityMutation.isPending}
                            data-testid="button-extend-1month"
                          >
                            +1 Month
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => extendValidityMutation.mutate({ userId: selectedMember.id, months: 3 })}
                            disabled={extendValidityMutation.isPending}
                            data-testid="button-extend-3months"
                          >
                            +3 Months
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => extendValidityMutation.mutate({ userId: selectedMember.id, months: 6 })}
                            disabled={extendValidityMutation.isPending}
                            data-testid="button-extend-6months"
                          >
                            +6 Months
                          </Button>
                        </div>
                      </div>

                      {/* Password Reset */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Password Management</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setResetPasswordMember(selectedMember)}
                          data-testid="button-reset-password"
                        >
                          Reset Password
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          New password will be shown in a notification
                        </p>
                      </div>
                    </div>

                    {/* Deactivate Member */}
                    <div className="pt-3 border-t">
                      <Label className="text-xs text-red-600 font-semibold">Danger Zone</Label>
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-red-900">Deactivate Member</p>
                            <p className="text-xs text-red-700 mt-1">
                              This will immediately revoke access to all programs
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Are you sure you want to deactivate ${selectedMember.firstName} ${selectedMember.lastName}?`)) {
                                deactivateMemberMutation.mutate(selectedMember.id);
                              }
                            }}
                            disabled={deactivateMemberMutation.isPending}
                            data-testid="button-deactivate-member"
                          >
                            Deactivate
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* EDIT MODE */}
              {selectedMember && memberViewMode === 'edit' && (
                <div className="space-y-6 pt-2">
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

                  {/* Currently Enrolled Programs */}
                  {memberEnrolledPrograms.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Currently Enrolled Programs</Label>
                      <div className="space-y-2">
                        {memberEnrolledPrograms.map((enrollment: any) => {
                          const program = programs.find(p => p.id === enrollment.programId);
                          return (
                            <div key={enrollment.id} className="p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                              {program?.imageUrl && (
                                <img 
                                  src={program.imageUrl} 
                                  alt={program.name}
                                  className="w-8 h-8 rounded object-cover"
                                />
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-green-800">{program?.name || 'Unknown Program'}</p>
                                <p className="text-xs text-green-600">
                                  Enrolled: {enrollment.enrolledAt && !isNaN(new Date(enrollment.enrolledAt).getTime()) 
                                    ? new Date(enrollment.enrolledAt).toLocaleDateString()
                                    : selectedMember.createdAt 
                                      ? new Date(selectedMember.createdAt).toLocaleDateString()
                                      : 'Unknown'}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={async () => {
                                  if (!confirm(`Remove ${program?.name} enrollment for ${selectedMember.firstName} ${selectedMember.lastName}?`)) {
                                    return;
                                  }
                                  
                                  try {
                                    const response = await fetch(`/api/member-programs/${enrollment.id}`, {
                                      method: 'DELETE',
                                    });

                                    if (!response.ok) {
                                      const errorData = await response.json();
                                      throw new Error(errorData.message || 'Failed to remove enrollment');
                                    }

                                    await queryClient.refetchQueries({ queryKey: ["/api/member-programs", selectedMember.id] });
                                    toast({
                                      variant: "success",
                                      title: "Success",
                                      description: `Removed ${program?.name} enrollment successfully`,
                                    });
                                  } catch (error) {
                                    toast({
                                      variant: "destructive",
                                      title: "Error",
                                      description: error instanceof Error ? error.message : "Failed to remove enrollment",
                                    });
                                  }
                                }}
                                data-testid={`button-remove-enrollment-${enrollment.id}`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Assign Additional Program</Label>
                    <Select 
                      value={selectedProgramForMember}
                      onValueChange={setSelectedProgramForMember}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select program to enroll" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Program</SelectItem>
                        {programs.filter(p => !memberEnrolledPrograms.some((e: any) => e.programId === p.id)).map((program) => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Enroll user in an additional program (already enrolled programs are hidden)
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="edit-whatsapp"
                      defaultChecked={!!selectedMember.hasWhatsAppSupport}
                      onCheckedChange={(checked) => 
                        setSelectedMember({...selectedMember, hasWhatsAppSupport: !!checked})
                      }
                    />
                    <div>
                      <Label htmlFor="edit-whatsapp" className="font-medium">WhatsApp Community Support</Label>
                      <p className="text-xs text-muted-foreground">
                        Grant access to WhatsApp community support
                      </p>
                    </div>
                  </div>

                  {selectedMember.hasWhatsAppSupport && (
                    <div>
                      <Label>WhatsApp Support Duration</Label>
                      <Select 
                        defaultValue={selectedMember.whatsAppSupportDuration?.toString()}
                        onValueChange={(value) => 
                          setSelectedMember({...selectedMember, whatsAppSupportDuration: parseInt(value)})
                        }
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
                    </div>
                  )}

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
                                }),
                              });
                              
                              if (!response.ok) throw new Error('Failed to update user');
                              
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
                              
                              queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
                              queryClient.invalidateQueries({ queryKey: ["/api/member-programs", selectedMember.id] });
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
          </TabsContent>

          <TabsContent value="deactivated" className="space-y-6">
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
                        <tr key={member.id} className="border-b border-border hover:bg-muted/50 transition-colors">
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
                          <td className="px-6 py-4">
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
          </TabsContent>

          <TabsContent value="programs" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
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
          </TabsContent>
        </Tabs>
      </div>
      
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
    </div>
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
Login URL: https://app.strongerwithzoe.com/heal-your-core
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
Login URL: https://app.strongerwithzoe.com/heal-your-core
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  <FormLabel>WhatsApp Community Support</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Grant access to WhatsApp community support
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
                  <FormLabel>WhatsApp Support Duration</FormLabel>
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
                  <FormLabel>Administrator Privileges</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Grant admin access to manage users and content
                  </p>
                </div>
              </FormItem>
            )}
          />

          {/* Password Options */}
          <div className="space-y-3 border-t pt-4">
            <Label className="text-sm font-semibold">Password Setup</Label>
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
          
          <div className="flex justify-end space-x-2 pt-4">
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
