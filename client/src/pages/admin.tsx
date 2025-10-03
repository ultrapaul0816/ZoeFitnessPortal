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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { Eye, Edit, Users, CalendarIcon, TrendingUp, AlertTriangle, Image, Settings, Save, FolderOpen, Plus, UserPlus } from "lucide-react";
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
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [memberViewMode, setMemberViewMode] = useState<'view' | 'edit'>('view');
  const { toast } = useToast();

  const addUserForm = useForm<AdminCreateUser>({
    resolver: zodResolver(adminCreateUserSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      isAdmin: false,
      validFrom: undefined,
      validUntil: undefined,
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

  const handleCreateUser = (userData: AdminCreateUser) => {
    createUserMutation.mutate(userData);
  };

  const closeAddUserModal = () => {
    setIsAddUserModalOpen(false);
    setNewUserData(null);
    addUserForm.reset();
  };

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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <TrendingUp className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="members" data-testid="tab-members">
              <Users className="w-4 h-4 mr-2" />
              Members
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
                {allUsers.map((member) => (
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
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {memberViewMode === 'view' ? 'Member Details' : 'Edit Member'}
                </DialogTitle>
              </DialogHeader>
              
              {selectedMember && (
                <div className="space-y-6">
                  {/* Profile Section */}
                  <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {selectedMember.firstName?.[0]}{selectedMember.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {selectedMember.firstName} {selectedMember.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">{selectedMember.email}</p>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase">Account Information</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Status</Label>
                        <Badge variant={selectedMember.termsAccepted ? "default" : "secondary"} className="mt-1">
                          {selectedMember.termsAccepted ? "Active" : "Pending"}
                        </Badge>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-muted-foreground">Role</Label>
                        <Badge variant={selectedMember.isAdmin ? "destructive" : "outline"} className="mt-1">
                          {selectedMember.isAdmin ? "Admin" : "Member"}
                        </Badge>
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
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase">Acceptance Status</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border rounded-lg">
                        <Label className="text-xs text-muted-foreground">Terms & Conditions</Label>
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

                      <div className="p-3 border rounded-lg">
                        <Label className="text-xs text-muted-foreground">Health Disclaimer</Label>
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
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase">Access Period</h4>
                      
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

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    {memberViewMode === 'view' && (
                      <Button 
                        onClick={() => setMemberViewMode('edit')}
                        data-testid="button-switch-to-edit"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Member
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedMember(null)}
                      data-testid="button-close-member-dialog"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
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
}

function AddUserModal({ form, onSubmit, isLoading, onClose, newUserData }: AddUserModalProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (newUserData) {
    // Show success modal with user credentials
    return (
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-green-600" />
            User Created Successfully
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
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Add New User
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
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="validFrom"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Valid From</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          data-testid="button-valid-from"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="validUntil"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Valid Until</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          data-testid="button-valid-until"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
