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
import { useToast } from "@/hooks/use-toast";
import { Eye, Edit, Users, Calendar, TrendingUp, AlertTriangle, Image, Settings, Save, FolderOpen } from "lucide-react";
import type { User, Program } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Admin() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const { toast } = useToast();

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

  const handleUpdateProgram = (updatedProgram: Program) => {
    updateProgramMutation.mutate(updatedProgram);
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
                <Button data-testid="button-add-member">Add Member</Button>
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
                      <Badge variant={member.termsAccepted ? "default" : "secondary"}>
                        {member.termsAccepted ? "Active" : "Pending"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={member.isAdmin ? "destructive" : "outline"}>
                        {member.isAdmin ? "Admin" : "Member"}
                      </Badge>
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
                          data-testid={`button-edit-${member.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
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
                          <p className="text-sm text-primary font-medium">₹{program.price}</p>
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
                        <h3 className="font-medium text-foreground" data-testid={`asset-name-${asset.displayName}`}>
                          {asset.displayName}
                        </h3>
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
