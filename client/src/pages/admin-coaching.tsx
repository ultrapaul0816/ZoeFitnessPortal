import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Users,
  Plus,
  Send,
  MessageSquare,
  ClipboardList,
  Dumbbell,
  UtensilsCrossed,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  ChevronRight,
  Calendar,
  Brain,
  Eye,
  Trash2,
  Edit3,
  Save,
  X,
  ArrowUpDown,
  Play,
  Video,
} from "lucide-react";
import { CoachingFormResponsesSection } from "@/components/admin/coaching-form-responses";
import type { CoachingClient, DirectMessage } from "@shared/schema";

type CoachingClientWithUser = CoachingClient & {
  user: { id: string; firstName: string; lastName: string; email: string; phone: string | null; profilePictureUrl: string | null };
  unreadMessages: number;
  lastCheckinDate: string | null;
};

type CoachingView = "clients" | "client-detail";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  pending_plan: "bg-blue-100 text-blue-700 border-blue-200",
  active: "bg-green-100 text-green-700 border-green-200",
  paused: "bg-orange-100 text-orange-700 border-orange-200",
  completed: "bg-gray-100 text-gray-700 border-gray-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  pending_plan: "Plan In Progress",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function AdminCoaching() {
  const [, setLocation] = useLocation();
  const [activeView, setActiveView] = useState<CoachingView>("clients");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientFirstName, setNewClientFirstName] = useState("");
  const [newClientLastName, setNewClientLastName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientNotes, setNewClientNotes] = useState("");
  const [newClientPaymentAmount, setNewClientPaymentAmount] = useState("5000");
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedAdminDay, setExpandedAdminDay] = useState<string | null>(null);
  const [editingDayData, setEditingDayData] = useState<any>(null);
  const [editingCoachNotes, setEditingCoachNotes] = useState<string>("");
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");
  const [swapTarget, setSwapTarget] = useState<{ sectionIdx: number; exerciseIdx: number } | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [addingExerciseSection, setAddingExerciseSection] = useState<number | null>(null);
  const [videoPopupUrl, setVideoPopupUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: clients = [], isLoading: isLoadingClients } = useQuery<CoachingClientWithUser[]>({
    queryKey: ["/api/admin/coaching/clients"],
  });

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const { data: clientMessages = [] } = useQuery<DirectMessage[]>({
    queryKey: ["/api/admin/coaching/clients", selectedClientId, "messages"],
    enabled: !!selectedClientId,
  });

  const { data: clientWorkoutPlan = [] } = useQuery({
    queryKey: ["/api/admin/coaching/clients", selectedClientId, "workout-plan"],
    enabled: !!selectedClientId,
  });

  const { data: clientNutritionPlan = [] } = useQuery({
    queryKey: ["/api/admin/coaching/clients", selectedClientId, "nutrition-plan"],
    enabled: !!selectedClientId,
  });

  const { data: clientCheckins = [] } = useQuery({
    queryKey: ["/api/admin/coaching/clients", selectedClientId, "checkins"],
    enabled: !!selectedClientId,
  });

  const { data: clientCompletions = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/coaching", selectedClientId, "workout-completions"],
    queryFn: async () => {
      if (!selectedClientId) return [];
      const res = await fetch(`/api/admin/coaching/${selectedClientId}/workout-completions`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedClientId,
  });

  const { data: exerciseLibrary = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/exercises"],
    enabled: !!selectedClientId,
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: { email: string; firstName?: string; lastName?: string; phone?: string; notes: string; paymentAmount: number }) => {
      const res = await apiRequest("POST", "/api/admin/coaching/clients", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coaching/clients"] });
      setShowNewClientDialog(false);
      setNewClientEmail("");
      setNewClientFirstName("");
      setNewClientLastName("");
      setNewClientPhone("");
      setNewClientNotes("");
      toast({ title: "Client enrolled", description: "Thank you email will be sent to the client." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { clientId: string; content: string }) => {
      const res = await apiRequest("POST", "/api/admin/coaching/messages", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coaching/clients", selectedClientId, "messages"] });
      setMessageInput("");
    },
    onError: (err: Error) => {
      toast({ title: "Error sending message", description: err.message, variant: "destructive" });
    },
  });

  const [generatingWeek, setGeneratingWeek] = useState<number | null>(null);

  const generateWorkoutMutation = useMutation({
    mutationFn: async ({ clientId, weekNumber }: { clientId: string; weekNumber: number }) => {
      setGeneratingWeek(weekNumber);
      const res = await apiRequest("POST", `/api/admin/coaching/clients/${clientId}/generate-workout`, { weekNumber });
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratingWeek(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coaching/clients", selectedClientId, "workout-plan"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coaching/clients"] });
      toast({ title: `Week ${data.weekNumber || ""} workout generated`, description: `${data.savedDays} days created. Review the plan below.` });
    },
    onError: (err: Error) => {
      setGeneratingWeek(null);
      toast({ title: "Error generating workout", description: err.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    if (generateWorkoutMutation.isPending) {
      setGenerationProgress(0);
      const interval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 95) { clearInterval(interval); return 95; }
          return prev + (95 - prev) * 0.05;
        });
      }, 500);
      return () => clearInterval(interval);
    } else {
      setGenerationProgress(0);
    }
  }, [generateWorkoutMutation.isPending]);

  const generateNutritionMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const res = await apiRequest("POST", `/api/admin/coaching/clients/${clientId}/generate-nutrition`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coaching/clients", selectedClientId, "nutrition-plan"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coaching/clients"] });
      toast({ title: "Nutrition plan generated", description: "Review the meal options below." });
    },
    onError: (err: Error) => {
      toast({ title: "Error generating nutrition plan", description: err.message, variant: "destructive" });
    },
  });

  const approvePlanMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const res = await apiRequest("POST", `/api/admin/coaching/clients/${clientId}/approve-plan`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coaching/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coaching/clients", selectedClientId, "workout-plan"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coaching/clients", selectedClientId, "nutrition-plan"] });
      toast({ title: "Plan approved", description: "The client's plan is now active and visible to them." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ clientId, updates }: { clientId: string; updates: Record<string, any> }) => {
      const res = await apiRequest("PATCH", `/api/admin/coaching/clients/${clientId}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coaching/clients"] });
      toast({ title: "Client updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Error updating client", description: err.message, variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (data: { clientId: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/coaching/clients/${data.clientId}`, { status: data.status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coaching/clients"] });
      toast({ title: "Status updated" });
    },
  });

  const saveWorkoutPlanMutation = useMutation({
    mutationFn: async ({ planId, exercises, coachNotes, title }: { planId: string; exercises: any; coachNotes?: string; title?: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/coaching/workout-plans/${planId}`, { exercises, coachNotes, title });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coaching/clients", selectedClientId, "workout-plan"] });
      setExpandedAdminDay(null);
      setEditingDayData(null);
      toast({ title: "Workout updated", description: "Changes saved successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error saving workout", description: err.message, variant: "destructive" });
    },
  });

  const filteredClients = clients.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.user.firstName.toLowerCase().includes(q) ||
      c.user.lastName.toLowerCase().includes(q) ||
      c.user.email.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === "active").length,
    pendingPlan: clients.filter(c => c.status === "pending_plan" || c.status === "pending").length,
    completed: clients.filter(c => c.status === "completed").length,
  };

  const openClientDetail = (clientId: string) => {
    setSelectedClientId(clientId);
    setActiveView("client-detail");
    setActiveTab("overview");
  };

  return (
    <AdminLayout activeTab="private-coaching" onTabChange={() => {}} onNavigate={setLocation}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              {activeView === "client-detail" && selectedClient ? (
                <>
                  <button onClick={() => setActiveView("clients")} className="text-gray-400 hover:text-gray-600 transition-colors">
                    Private Coaching
                  </button>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                  <span>{selectedClient.user.firstName} {selectedClient.user.lastName}</span>
                </>
              ) : (
                "Private Coaching"
              )}
            </h1>
            {activeView === "clients" && (
              <p className="text-gray-500 mt-1">Manage 1:1 coaching clients, plans, and messaging</p>
            )}
          </div>
          {activeView === "clients" && (
            <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 hover:shadow-pink-500/40">
                  <Plus className="w-4 h-4 mr-2" />
                  New Client
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Enroll New Coaching Client</DialogTitle>
                  <p className="text-sm text-gray-500 mt-1">If the email doesn't have an account yet, a new one will be created automatically.</p>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Client Email <span className="text-red-400">*</span></Label>
                    <Input 
                      placeholder="client@example.com" 
                      value={newClientEmail} 
                      onChange={e => setNewClientEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>First Name</Label>
                      <Input 
                        placeholder="First name" 
                        value={newClientFirstName} 
                        onChange={e => setNewClientFirstName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input 
                        placeholder="Last name" 
                        value={newClientLastName} 
                        onChange={e => setNewClientLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input 
                      placeholder="+91 98765 43210" 
                      value={newClientPhone} 
                      onChange={e => setNewClientPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Payment Amount (₹)</Label>
                    <Input 
                      type="number"
                      placeholder="5000" 
                      value={newClientPaymentAmount} 
                      onChange={e => setNewClientPaymentAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea 
                      placeholder="Any notes about this client (health info, goals, etc.)" 
                      value={newClientNotes} 
                      onChange={e => setNewClientNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewClientDialog(false)}>Cancel</Button>
                  <Button 
                    onClick={() => createClientMutation.mutate({ 
                      email: newClientEmail, 
                      firstName: newClientFirstName || undefined,
                      lastName: newClientLastName || undefined,
                      phone: newClientPhone || undefined,
                      notes: newClientNotes, 
                      paymentAmount: parseInt(newClientPaymentAmount) * 100 
                    })}
                    disabled={!newClientEmail || createClientMutation.isPending}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                  >
                    {createClientMutation.isPending ? "Enrolling..." : "Enroll Client"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {activeView === "clients" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50">
                <CardContent className="pt-5 pb-4 px-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Clients</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-pink-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-green-50/30">
                <CardContent className="pt-5 pb-4 px-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-blue-50/30">
                <CardContent className="pt-5 pb-4 px-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending Plan</p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">{stats.pendingPlan}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/30">
                <CardContent className="pt-5 pb-4 px-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Completed</p>
                      <p className="text-2xl font-bold text-gray-600 mt-1">{stats.completed}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-gray-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Coaching Clients</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      placeholder="Search clients..." 
                      className="pl-9 w-64"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingClients ? (
                  <div className="text-center py-12 text-gray-500">Loading clients...</div>
                ) : filteredClients.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No coaching clients yet</p>
                    <p className="text-gray-400 text-sm mt-1">Click "New Client" to enroll your first private coaching client</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredClients.map(client => (
                      <button
                        key={client.id}
                        onClick={() => openClientDetail(client.id)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all text-left group border border-transparent hover:border-gray-200"
                      >
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {client.user.firstName[0]}{client.user.lastName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 truncate">
                              {client.user.firstName} {client.user.lastName}
                            </p>
                            <Badge variant="outline" className={cn("text-[10px] shrink-0", statusColors[client.status || "pending"])}>
                              {statusLabels[client.status || "pending"]}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{client.user.email}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {client.unreadMessages > 0 && (
                            <Badge className="bg-pink-500 text-white text-[10px]">
                              {client.unreadMessages} new
                            </Badge>
                          )}
                          {client.startDate && (
                            <span className="text-xs text-gray-400">
                              Started {new Date(client.startDate).toLocaleDateString()}
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-pink-500 transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {activeView === "client-detail" && selectedClient && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-lg">
                {selectedClient.user.firstName[0]}{selectedClient.user.lastName[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-xs", statusColors[selectedClient.status || "pending"])}>
                    {statusLabels[selectedClient.status || "pending"]}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">{selectedClient.user.email}</p>
              </div>
              <div className="flex gap-2">
                {(selectedClient.status === "pending" || selectedClient.status === "pending_plan") && (
                  <Select
                    onValueChange={(week) => generateWorkoutMutation.mutate({ clientId: selectedClient.id, weekNumber: parseInt(week) })}
                    disabled={generateWorkoutMutation.isPending}
                  >
                    <SelectTrigger className="w-[200px] bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 shadow-lg [&>span]:text-white">
                      <Brain className="w-4 h-4 mr-2" />
                      {generateWorkoutMutation.isPending ? `Generating Week ${generatingWeek}...` : "Generate Workout"}
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map(week => {
                        const hasWeek = (clientWorkoutPlan as any[]).some(p => p.weekNumber === week);
                        return (
                          <SelectItem key={week} value={String(week)}>
                            Week {week} {hasWeek ? "(regenerate)" : ""}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
                {selectedClient.status === "pending_plan" && (
                  <Button 
                    onClick={() => approvePlanMutation.mutate(selectedClient.id)}
                    disabled={approvePlanMutation.isPending}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {approvePlanMutation.isPending ? "Approving..." : "Approve Plan"}
                  </Button>
                )}
                <Select
                  value={selectedClient.status || "pending"}
                  onValueChange={(status) => updateStatusMutation.mutate({ clientId: selectedClient.id, status })}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="pending_plan">Plan In Progress</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-gray-100 p-1 rounded-xl">
                <TabsTrigger value="overview" className="rounded-lg gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Eye className="w-4 h-4" /> Overview
                </TabsTrigger>
                <TabsTrigger value="workout" className="rounded-lg gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Dumbbell className="w-4 h-4" /> Workout Plan
                </TabsTrigger>
                <TabsTrigger value="nutrition" className="rounded-lg gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <UtensilsCrossed className="w-4 h-4" /> Nutrition
                </TabsTrigger>
                <TabsTrigger value="messages" className="rounded-lg gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <MessageSquare className="w-4 h-4" /> Messages
                  {selectedClient.unreadMessages > 0 && (
                    <Badge className="bg-pink-500 text-white text-[10px] ml-1">{selectedClient.unreadMessages}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="checkins" className="rounded-lg gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <ClipboardList className="w-4 h-4" /> Check-ins
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">Client Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Name</span>
                        <span className="text-sm font-medium">{selectedClient.user.firstName} {selectedClient.user.lastName}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Email</span>
                        <span className="text-sm font-medium">{selectedClient.user.email}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Phone</span>
                        <span className="text-sm font-medium">{selectedClient.user.phone || "Not provided"}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Program Duration</span>
                        <span className="text-sm font-medium">{selectedClient.planDurationWeeks || 4} weeks</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Purchase Date</span>
                        <Input
                          type="date"
                          className="w-40 h-8 text-sm"
                          value={selectedClient.purchaseDate ? new Date(selectedClient.purchaseDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => updateClientMutation.mutate({
                            clientId: selectedClient.id,
                            updates: { purchaseDate: e.target.value ? new Date(e.target.value).toISOString() : null }
                          })}
                        />
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Form Submission Date</span>
                        <Input
                          type="date"
                          className="w-40 h-8 text-sm"
                          value={selectedClient.formSubmissionDate ? new Date(selectedClient.formSubmissionDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => updateClientMutation.mutate({
                            clientId: selectedClient.id,
                            updates: { formSubmissionDate: e.target.value ? new Date(e.target.value).toISOString() : null }
                          })}
                        />
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Start Date</span>
                        <Input
                          type="date"
                          className="w-40 h-8 text-sm"
                          value={selectedClient.startDate ? new Date(selectedClient.startDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => updateClientMutation.mutate({
                            clientId: selectedClient.id,
                            updates: { startDate: e.target.value ? new Date(e.target.value).toISOString() : null }
                          })}
                        />
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">End Date</span>
                        <Input
                          type="date"
                          className="w-40 h-8 text-sm"
                          value={selectedClient.endDate ? new Date(selectedClient.endDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => updateClientMutation.mutate({
                            clientId: selectedClient.id,
                            updates: { endDate: e.target.value ? new Date(e.target.value).toISOString() : null }
                          })}
                        />
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Payment</span>
                        <span className="text-sm font-medium">
                          ₹{((selectedClient.paymentAmount || 0) / 100).toLocaleString()} 
                          <Badge variant="outline" className={cn("ml-2 text-[10px]", 
                            selectedClient.paymentStatus === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          )}>
                            {selectedClient.paymentStatus || "pending"}
                          </Badge>
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <CoachingFormResponsesSection clientId={selectedClient.id} />

                  <Card className="border-0 shadow-sm lg:col-span-2">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          Pregnancy Information
                          {selectedClient.isPregnant && (
                            <Badge className="bg-pink-100 text-pink-700 border-pink-200 text-[10px]">
                              {selectedClient.dueDate ? (() => {
                                const daysLeft = Math.max(0, Math.ceil((new Date(selectedClient.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
                                const weeksPregnant = Math.max(0, Math.floor((280 - daysLeft) / 7));
                                return `Trimester ${weeksPregnant <= 12 ? 1 : weeksPregnant <= 26 ? 2 : 3}`;
                              })() : "Pregnant"}
                            </Badge>
                          )}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500">Pregnancy Status</Label>
                          <Select
                            value={selectedClient.isPregnant ? "yes" : "no"}
                            onValueChange={(val) => updateClientMutation.mutate({
                              clientId: selectedClient.id,
                              updates: { isPregnant: val === "yes" }
                            })}
                          >
                            <SelectTrigger className="mt-1 h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="no">Not Pregnant</SelectItem>
                              <SelectItem value="yes">Pregnant</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Due Date</Label>
                          <Input
                            type="date"
                            className="mt-1 h-9"
                            value={selectedClient.dueDate ? new Date(selectedClient.dueDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => updateClientMutation.mutate({
                              clientId: selectedClient.id,
                              updates: { dueDate: e.target.value ? new Date(e.target.value).toISOString() : null }
                            })}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Auto-Calculated Trimester</Label>
                          <div className="mt-1 h-9 flex items-center">
                            {selectedClient.isPregnant && selectedClient.dueDate ? (() => {
                              const now = new Date();
                              const due = new Date(selectedClient.dueDate);
                              const totalDays = 280;
                              const daysLeft = Math.max(0, Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
                              const weeksPregnant = Math.max(0, Math.floor((totalDays - daysLeft) / 7));
                              const trimester = weeksPregnant <= 12 ? 1 : weeksPregnant <= 26 ? 2 : 3;
                              const trimesterColors = { 1: "bg-blue-100 text-blue-700", 2: "bg-amber-100 text-amber-700", 3: "bg-pink-100 text-pink-700" };
                              return (
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${trimesterColors[trimester as 1|2|3]}`}>
                                    Trimester {trimester}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Week {weeksPregnant} · {Math.ceil(daysLeft / 7)}w remaining
                                  </span>
                                </div>
                              );
                            })() : (
                              <span className="text-xs text-gray-400">
                                {selectedClient.isPregnant ? "Set due date to calculate" : "Not pregnant"}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="lg:col-span-3">
                          <Label className="text-xs text-gray-500">Pregnancy Notes</Label>
                          <Textarea
                            className="mt-1 text-sm min-h-[36px]"
                            rows={1}
                            placeholder="Any pregnancy-related notes..."
                            defaultValue={selectedClient.pregnancyNotes || ''}
                            onBlur={(e) => {
                              if (e.target.value !== (selectedClient.pregnancyNotes || '')) {
                                updateClientMutation.mutate({
                                  clientId: selectedClient.id,
                                  updates: { pregnancyNotes: e.target.value || null }
                                });
                              }
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

              </TabsContent>

              <TabsContent value="workout" className="mt-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">4-Week Workout Plan</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Generate one week at a time. Click a day card to view and edit exercises.</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {[1, 2, 3, 4].map(week => {
                        const weekPlan = (clientWorkoutPlan as any[]).filter(p => p.weekNumber === week);
                        const hasWeek = weekPlan.length > 0;
                        const isGenerating = generateWorkoutMutation.isPending && generatingWeek === week;
                        const previousWeekExists = week === 1 || (clientWorkoutPlan as any[]).some(p => p.weekNumber === week - 1);
                        return (
                          <div key={week} className={cn("rounded-xl border p-4", hasWeek ? "border-gray-200" : "border-dashed border-gray-300")}>
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                Week {week}
                                {hasWeek && <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">{weekPlan.length} days</Badge>}
                                {!hasWeek && <Badge variant="outline" className="text-[10px] bg-gray-50 text-gray-400">Not generated</Badge>}
                              </h3>
                              <Button
                                size="sm"
                                variant={hasWeek ? "outline" : "default"}
                                onClick={() => generateWorkoutMutation.mutate({ clientId: selectedClient.id, weekNumber: week })}
                                disabled={generateWorkoutMutation.isPending || !previousWeekExists}
                                className={cn(
                                  hasWeek ? "" : "bg-gradient-to-r from-violet-500 to-purple-500 text-white"
                                )}
                              >
                                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                {isGenerating ? "Generating..." : hasWeek ? "Regenerate" : "Generate"}
                              </Button>
                            </div>
                            {isGenerating && (
                              <div className="space-y-2 py-4">
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span className="flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-pulse" />
                                    AI is creating Week {week} workout plan...
                                  </span>
                                  <span>{Math.round(generationProgress)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500 ease-out"
                                    style={{ width: `${generationProgress}%` }}
                                  />
                                </div>
                                <p className="text-[10px] text-gray-400">This usually takes about 15-20 seconds</p>
                              </div>
                            )}
                            {!previousWeekExists && !hasWeek && (
                              <p className="text-xs text-gray-400 italic">Generate Week {week - 1} first</p>
                            )}
                            {hasWeek && (
                              <>
                                <div className="grid grid-cols-7 gap-2">
                                  {weekPlan.sort((a: any, b: any) => a.dayNumber - b.dayNumber).map((day: any) => {
                                    const dayKey = `${week}-${day.dayNumber}`;
                                    const isExpanded = expandedAdminDay === dayKey;
                                    const dayCompletions = (clientCompletions as any[]).filter(
                                      (c: any) => c.weekNumber === week && c.dayNumber === day.dayNumber && c.completed
                                    );
                                    const exercisesData = day.exercises as any;
                                    let totalExercises = 0;
                                    if (exercisesData?.sections) {
                                      exercisesData.sections.forEach((s: any) => { totalExercises += (s.exercises?.length || 0); });
                                    } else if (Array.isArray(exercisesData)) {
                                      totalExercises = exercisesData.length;
                                    }
                                    const completedCount = dayCompletions.length;
                                    const allDone = totalExercises > 0 && completedCount >= totalExercises;

                                    return (
                                    <div
                                      key={day.id}
                                      className={cn(
                                        "p-3 rounded-xl border text-center relative cursor-pointer transition-all hover:shadow-md",
                                        isExpanded ? "ring-2 ring-rose-400" : "",
                                        allDone ? "bg-green-50 border-green-300 ring-1 ring-green-200" :
                                        day.dayType === "rest" ? "bg-gray-50 border-gray-200" :
                                        day.dayType === "cardio" ? "bg-blue-50 border-blue-200" :
                                        day.dayType === "active_recovery" ? "bg-amber-50 border-amber-200" :
                                        "bg-pink-50 border-pink-200"
                                      )}
                                      onClick={() => {
                                        if (isExpanded) {
                                          setExpandedAdminDay(null);
                                          setEditingDayData(null);
                                          setSwapTarget(null);
                                        } else {
                                          const sections = exercisesData?.sections || [];
                                          setExpandedAdminDay(dayKey);
                                          setEditingDayData({
                                            planId: day.id,
                                            dayNumber: day.dayNumber,
                                            weekNumber: week,
                                            title: day.title,
                                            dayType: day.dayType,
                                            exercises: JSON.parse(JSON.stringify(exercisesData || { sections: [] })),
                                          });
                                          setEditingCoachNotes(day.coachNotes || "");
                                          setSwapTarget(null);
                                          setExerciseSearchQuery("");
                                        }
                                      }}
                                    >
                                      <p className="text-[10px] font-bold text-gray-400 uppercase">
                                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][day.dayNumber - 1]}
                                      </p>
                                      <p className="text-xs font-medium mt-1 text-gray-700 truncate">{day.title}</p>
                                      <Badge variant="outline" className="text-[9px] mt-1.5">
                                        {day.dayType}
                                      </Badge>
                                      {totalExercises > 0 && (
                                        <div className="mt-1.5">
                                          <div className="w-full bg-gray-200 rounded-full h-1">
                                            <div
                                              className={cn("h-1 rounded-full transition-all", allDone ? "bg-green-500" : "bg-pink-400")}
                                              style={{ width: `${Math.min((completedCount / totalExercises) * 100, 100)}%` }}
                                            />
                                          </div>
                                          <p className={cn("text-[9px] mt-0.5", allDone ? "text-green-600 font-semibold" : "text-gray-400")}>
                                            {completedCount}/{totalExercises}
                                          </p>
                                        </div>
                                      )}
                                      {day.isApproved && <CheckCircle2 className="w-3 h-3 text-green-500 mx-auto mt-1" />}
                                      <Edit3 className="w-3 h-3 text-gray-400 absolute top-1.5 right-1.5" />
                                    </div>
                                    );
                                  })}
                                </div>

                                {expandedAdminDay?.startsWith(`${week}-`) && editingDayData && editingDayData.weekNumber === week && (
                                  <div className="mt-4 rounded-xl border border-rose-200 bg-white p-5 space-y-5">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-gray-900">
                                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][editingDayData.dayNumber - 1]} —
                                          </span>
                                          <Input
                                            className="text-sm font-semibold h-8 w-60"
                                            value={editingDayData.title || ""}
                                            onChange={(e) => {
                                              setEditingDayData({ ...editingDayData, title: e.target.value });
                                            }}
                                            placeholder="Workout title..."
                                          />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">Edit title, exercises, and notes below</p>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => { setExpandedAdminDay(null); setEditingDayData(null); setSwapTarget(null); }}
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>

                                    <Separator />

                                    {(editingDayData.exercises?.sections || []).map((section: any, sIdx: number) => (
                                      <div key={sIdx} className="space-y-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <Input
                                            className="text-xs h-7 w-40 font-semibold text-rose-700 bg-rose-50 border-rose-200"
                                            value={section.name || section.type || ""}
                                            onChange={(e) => {
                                              const updated = { ...editingDayData };
                                              updated.exercises.sections[sIdx].name = e.target.value;
                                              setEditingDayData({ ...updated });
                                            }}
                                            placeholder="Section name..."
                                          />
                                          {(section.durationSeconds || section.duration) && <span className="text-xs text-gray-400">{section.durationSeconds ? `${Math.floor(section.durationSeconds / 60)}min` : section.duration}</span>}
                                          <div className="flex items-center gap-1">
                                            <span className="text-xs text-gray-400">×</span>
                                            <Input
                                              className="text-xs h-6 w-12 text-center"
                                              type="number"
                                              min={1}
                                              value={section.rounds ?? 1}
                                              onChange={(e) => {
                                                const updated = { ...editingDayData };
                                                updated.exercises.sections[sIdx].rounds = e.target.value ? parseInt(e.target.value) : 1;
                                                setEditingDayData({ ...updated });
                                              }}
                                            />
                                            <span className="text-xs text-gray-400">rounds</span>
                                          </div>
                                          {(section.restBetweenRoundsSeconds || section.restBetweenRounds) && (
                                            <span className="text-xs text-gray-400">· Rest: {section.restBetweenRoundsSeconds ? `${section.restBetweenRoundsSeconds}s` : section.restBetweenRounds}</span>
                                          )}
                                        </div>
                                        <div className="mt-1">
                                          <Input
                                            className="text-xs h-7 text-gray-600"
                                            placeholder="Section description (optional)..."
                                            value={section.description || ""}
                                            onChange={(e) => {
                                              const updated = { ...editingDayData };
                                              updated.exercises.sections[sIdx].description = e.target.value || null;
                                              setEditingDayData({ ...updated });
                                            }}
                                          />
                                        </div>

                                        <div className="space-y-2">
                                          {(section.exercises || []).map((ex: any, eIdx: number) => (
                                            <div key={eIdx} className="grid grid-cols-12 gap-2 items-start p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                                              <div className="col-span-3">
                                                <Label className="text-[10px] text-gray-400 mb-1 block">Exercise</Label>
                                                <div className="flex items-center gap-1">
                                                  <Input
                                                    className="text-xs h-8 flex-1"
                                                    value={ex.name || ""}
                                                    onChange={(e) => {
                                                      const updated = { ...editingDayData };
                                                      updated.exercises.sections[sIdx].exercises[eIdx].name = e.target.value;
                                                      setEditingDayData({ ...updated });
                                                    }}
                                                  />
                                                  {ex.videoUrl && (
                                                    <Button
                                                      size="sm"
                                                      variant="ghost"
                                                      className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 shrink-0"
                                                      title="Play exercise video"
                                                      onClick={() => setVideoPopupUrl(ex.videoUrl)}
                                                    >
                                                      <Play className="w-3.5 h-3.5 fill-current" />
                                                    </Button>
                                                  )}
                                                </div>
                                              </div>
                                              <div className="col-span-1">
                                                <Label className="text-[10px] text-gray-400 mb-1 block">Sets</Label>
                                                <Input
                                                  className="text-xs h-8"
                                                  type="number"
                                                  value={ex.sets ?? 1}
                                                  onChange={(e) => {
                                                    const updated = { ...editingDayData };
                                                    updated.exercises.sections[sIdx].exercises[eIdx].sets = e.target.value ? parseInt(e.target.value) : null;
                                                    setEditingDayData({ ...updated });
                                                  }}
                                                />
                                              </div>
                                              <div className="col-span-1">
                                                <Label className="text-[10px] text-gray-400 mb-1 block">Reps</Label>
                                                <Input
                                                  className="text-xs h-8"
                                                  value={ex.reps || ""}
                                                  onChange={(e) => {
                                                    const updated = { ...editingDayData };
                                                    updated.exercises.sections[sIdx].exercises[eIdx].reps = e.target.value || null;
                                                    setEditingDayData({ ...updated });
                                                  }}
                                                />
                                              </div>
                                              <div className="col-span-2">
                                                <Label className="text-[10px] text-gray-400 mb-1 block">Duration (sec)</Label>
                                                <Input
                                                  className="text-xs h-8"
                                                  type="number"
                                                  min={0}
                                                  value={ex.durationSeconds ?? ex.duration ?? ""}
                                                  onChange={(e) => {
                                                    const updated = { ...editingDayData };
                                                    const val = e.target.value ? parseInt(e.target.value) : null;
                                                    updated.exercises.sections[sIdx].exercises[eIdx].durationSeconds = val;
                                                    delete updated.exercises.sections[sIdx].exercises[eIdx].duration;
                                                    setEditingDayData({ ...updated });
                                                  }}
                                                />
                                              </div>
                                              <div className="col-span-2">
                                                <Label className="text-[10px] text-gray-400 mb-1 block">Rest (sec)</Label>
                                                <Input
                                                  className="text-xs h-8"
                                                  type="number"
                                                  min={0}
                                                  value={ex.restAfterSeconds ?? ex.restAfter ?? ""}
                                                  onChange={(e) => {
                                                    const updated = { ...editingDayData };
                                                    const val = e.target.value ? parseInt(e.target.value) : null;
                                                    updated.exercises.sections[sIdx].exercises[eIdx].restAfterSeconds = val;
                                                    delete updated.exercises.sections[sIdx].exercises[eIdx].restAfter;
                                                    setEditingDayData({ ...updated });
                                                  }}
                                                />
                                              </div>
                                              <div className="col-span-2">
                                                <Label className="text-[10px] text-gray-400 mb-1 block">Notes</Label>
                                                <Input
                                                  className="text-xs h-8"
                                                  value={ex.notes || ""}
                                                  onChange={(e) => {
                                                    const updated = { ...editingDayData };
                                                    updated.exercises.sections[sIdx].exercises[eIdx].notes = e.target.value || null;
                                                    setEditingDayData({ ...updated });
                                                  }}
                                                />
                                              </div>
                                              <div className="col-span-1 flex items-end gap-1 pb-0.5">
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  className="h-8 w-8 p-0 text-gray-400 hover:text-rose-500"
                                                  title="Swap with library exercise"
                                                  onClick={() => {
                                                    setSwapTarget(swapTarget?.sectionIdx === sIdx && swapTarget?.exerciseIdx === eIdx ? null : { sectionIdx: sIdx, exerciseIdx: eIdx });
                                                    setExerciseSearchQuery("");
                                                  }}
                                                >
                                                  <ArrowUpDown className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                                                  title="Remove exercise"
                                                  onClick={() => {
                                                    const updated = { ...editingDayData };
                                                    updated.exercises.sections[sIdx].exercises.splice(eIdx, 1);
                                                    setEditingDayData({ ...updated });
                                                  }}
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                              </div>

                                              {swapTarget?.sectionIdx === sIdx && swapTarget?.exerciseIdx === eIdx && (
                                                <div className="col-span-12 mt-1 p-3 rounded-lg border border-rose-100 bg-rose-50/50">
                                                  <div className="flex items-center gap-2 mb-2">
                                                    <Search className="w-3.5 h-3.5 text-gray-400" />
                                                    <Input
                                                      className="text-xs h-8 flex-1"
                                                      placeholder="Search exercise library..."
                                                      value={exerciseSearchQuery}
                                                      onChange={(e) => setExerciseSearchQuery(e.target.value)}
                                                    />
                                                    <Button size="sm" variant="ghost" className="h-8" onClick={() => setSwapTarget(null)}>
                                                      <X className="w-3.5 h-3.5" />
                                                    </Button>
                                                  </div>
                                                  <ScrollArea className="max-h-40">
                                                    <div className="space-y-1">
                                                      {exerciseLibrary
                                                        .filter((libEx: any) => {
                                                          if (!exerciseSearchQuery) return true;
                                                          return libEx.name?.toLowerCase().includes(exerciseSearchQuery.toLowerCase());
                                                        })
                                                        .slice(0, 20)
                                                        .map((libEx: any) => (
                                                          <button
                                                            key={libEx.id}
                                                            className="w-full text-left px-3 py-1.5 rounded text-xs hover:bg-rose-100 transition-colors flex items-center justify-between"
                                                            onClick={() => {
                                                              const updated = { ...editingDayData };
                                                              const target = updated.exercises.sections[sIdx].exercises[eIdx];
                                                              target.name = libEx.name;
                                                              target.exerciseId = libEx.id;
                                                              target.videoUrl = libEx.videoUrl || null;
                                                              setEditingDayData({ ...updated });
                                                              setSwapTarget(null);
                                                            }}
                                                          >
                                                            <span className="font-medium flex items-center gap-1.5">
                                                              {libEx.videoUrl && <Video className="w-3 h-3 text-rose-400 shrink-0" />}
                                                              {libEx.name}
                                                            </span>
                                                            <span className="text-gray-400">{libEx.category} · {libEx.difficulty}</span>
                                                          </button>
                                                        ))}
                                                      {exerciseLibrary.filter((libEx: any) => !exerciseSearchQuery || libEx.name?.toLowerCase().includes(exerciseSearchQuery.toLowerCase())).length === 0 && (
                                                        <p className="text-xs text-gray-400 px-3 py-2">No exercises found</p>
                                                      )}
                                                    </div>
                                                  </ScrollArea>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>

                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="text-xs h-7 text-rose-600 border-rose-200 hover:bg-rose-50"
                                          onClick={() => setAddingExerciseSection(addingExerciseSection === sIdx ? null : sIdx)}
                                        >
                                          <Plus className="w-3 h-3 mr-1" /> Add Exercise
                                        </Button>

                                        {addingExerciseSection === sIdx && (
                                          <div className="mt-2 p-3 rounded-lg border border-rose-100 bg-rose-50/50">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Search className="w-3.5 h-3.5 text-gray-400" />
                                              <Input
                                                className="text-xs h-8 flex-1"
                                                placeholder="Search exercise library to add..."
                                                value={exerciseSearchQuery}
                                                onChange={(e) => setExerciseSearchQuery(e.target.value)}
                                                autoFocus
                                              />
                                              <Button size="sm" variant="ghost" className="h-8" onClick={() => setAddingExerciseSection(null)}>
                                                <X className="w-3.5 h-3.5" />
                                              </Button>
                                            </div>
                                            <ScrollArea className="max-h-40">
                                              <div className="space-y-1">
                                                {(exerciseLibrary || [])
                                                  .filter((libEx: any) => !exerciseSearchQuery || libEx.name?.toLowerCase().includes(exerciseSearchQuery.toLowerCase()))
                                                  .slice(0, 20)
                                                  .map((libEx: any) => (
                                                    <button
                                                      key={libEx.id}
                                                      className="w-full text-left px-3 py-1.5 rounded text-xs hover:bg-rose-100 transition-colors flex items-center justify-between"
                                                      onClick={() => {
                                                        const updated = { ...editingDayData };
                                                        if (!updated.exercises.sections[sIdx].exercises) {
                                                          updated.exercises.sections[sIdx].exercises = [];
                                                        }
                                                        updated.exercises.sections[sIdx].exercises.push({
                                                          name: libEx.name,
                                                          exerciseId: libEx.id,
                                                          videoUrl: libEx.videoUrl || null,
                                                          sets: 1,
                                                          reps: null,
                                                          duration: null,
                                                          restAfter: null,
                                                          notes: null,
                                                        });
                                                        setEditingDayData({ ...updated });
                                                        setAddingExerciseSection(null);
                                                        setExerciseSearchQuery("");
                                                      }}
                                                    >
                                                      <span className="font-medium flex items-center gap-1.5">
                                                        {libEx.videoUrl && <Video className="w-3 h-3 text-rose-400 shrink-0" />}
                                                        {libEx.name}
                                                      </span>
                                                      <span className="text-gray-400">{libEx.category} · {libEx.difficulty}</span>
                                                    </button>
                                                  ))}
                                                {(exerciseLibrary || []).filter((libEx: any) => !exerciseSearchQuery || libEx.name?.toLowerCase().includes(exerciseSearchQuery.toLowerCase())).length === 0 && (
                                                  <p className="text-xs text-gray-400 px-3 py-2">No exercises found</p>
                                                )}
                                              </div>
                                            </ScrollArea>
                                          </div>
                                        )}

                                        {sIdx < (editingDayData.exercises?.sections || []).length - 1 && <Separator />}
                                      </div>
                                    ))}

                                    {(editingDayData.exercises?.sections || []).length === 0 && (
                                      <p className="text-xs text-gray-400 italic py-4 text-center">No sections found. This day may not have structured exercises.</p>
                                    )}

                                    <Separator />

                                    <div>
                                      <Label className="text-xs text-gray-500 mb-1 block">Coach Notes</Label>
                                      <Textarea
                                        className="text-sm min-h-[60px]"
                                        placeholder="Add notes for this day..."
                                        value={editingCoachNotes}
                                        onChange={(e) => setEditingCoachNotes(e.target.value)}
                                      />
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => { setExpandedAdminDay(null); setEditingDayData(null); setSwapTarget(null); }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="bg-rose-500 hover:bg-rose-600 text-white"
                                        disabled={saveWorkoutPlanMutation.isPending}
                                        onClick={() => {
                                          saveWorkoutPlanMutation.mutate({
                                            planId: editingDayData.planId,
                                            exercises: editingDayData.exercises,
                                            coachNotes: editingCoachNotes || undefined,
                                            title: editingDayData.title,
                                          });
                                        }}
                                      >
                                        <Save className="w-3.5 h-3.5 mr-1.5" />
                                        {saveWorkoutPlanMutation.isPending ? "Saving..." : "Save Changes"}
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="nutrition" className="mt-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Nutrition Plan</CardTitle>
                      <Button
                        size="sm"
                        variant={(clientNutritionPlan as any[]).length > 0 ? "outline" : "default"}
                        onClick={() => generateNutritionMutation.mutate(selectedClient.id)}
                        disabled={generateNutritionMutation.isPending}
                        className={cn(
                          (clientNutritionPlan as any[]).length > 0 ? "" : "bg-gradient-to-r from-violet-500 to-purple-500 text-white"
                        )}
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        {generateNutritionMutation.isPending ? "Generating..." : (clientNutritionPlan as any[]).length > 0 ? "Regenerate" : "Generate"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {(clientNutritionPlan as any[]).length === 0 ? (
                      <div className="text-center py-12">
                        <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No nutrition plan generated yet</p>
                        <p className="text-gray-400 text-sm mt-1">Click Generate above to create a personalized nutrition plan</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {(() => {
                          const overviewRow = (clientNutritionPlan as any[]).find(p => p.mealType === "overview");
                          let overview: any = null;
                          if (overviewRow?.tips) {
                            try { overview = JSON.parse(overviewRow.tips); } catch {}
                          }
                          return overview ? (
                            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-white border border-violet-200">
                              {overview.dailyStructure?.overview && (
                                <p className="text-sm text-gray-700 mb-3">{overview.dailyStructure.overview}</p>
                              )}
                              <div className="flex gap-4 flex-wrap">
                                {overview.dailyStructure?.dailyCalorieTarget && (
                                  <div className="text-sm"><span className="font-semibold text-violet-700">{overview.dailyStructure.dailyCalorieTarget} cal</span> daily target</div>
                                )}
                                {overview.dailyStructure?.macroSplit && (
                                  <div className="text-sm">
                                    P: {overview.dailyStructure.macroSplit.protein} | C: {overview.dailyStructure.macroSplit.carbs} | F: {overview.dailyStructure.macroSplit.fat}
                                  </div>
                                )}
                              </div>
                              {overview.coachNotes && (
                                <p className="text-xs text-gray-500 mt-2 italic">{overview.coachNotes}</p>
                              )}
                            </div>
                          ) : null;
                        })()}
                        {["breakfast", "lunch", "snack", "dinner"].map(mealType => {
                          const mealPlan = (clientNutritionPlan as any[]).find(p => p.mealType === mealType);
                          if (!mealPlan) return null;
                          const options = mealPlan.options || [];
                          let parsedTips: any = null;
                          if (mealPlan.tips) {
                            try { parsedTips = JSON.parse(mealPlan.tips); } catch { parsedTips = { tips: mealPlan.tips }; }
                          }
                          return (
                            <div key={mealType}>
                              <div className="flex items-center gap-2 mb-3">
                                <h3 className="font-semibold text-gray-900 capitalize">{mealType}</h3>
                                {parsedTips?.timing && (
                                  <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{parsedTips.timing}</span>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {(options as any[]).map((opt: any, i: number) => (
                                  <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                                    <div className="flex items-center justify-between">
                                      <p className="font-medium text-sm text-gray-900">{opt.name}</p>
                                      {opt.prepTime && <span className="text-[10px] text-gray-400">{opt.prepTime}</span>}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{opt.description}</p>
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                      {opt.calories && (
                                        <span className="text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">{opt.calories} cal</span>
                                      )}
                                      {opt.protein && (
                                        <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{opt.protein}g P</span>
                                      )}
                                      {opt.carbs && (
                                        <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">{opt.carbs}g C</span>
                                      )}
                                      {opt.fat && (
                                        <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">{opt.fat}g F</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {parsedTips?.tips && (
                                <p className="text-xs text-gray-500 mt-2 italic">Tip: {parsedTips.tips}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="messages" className="mt-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Messages with {selectedClient.user.firstName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] mb-4 p-4 bg-gray-50 rounded-xl">
                      {clientMessages.length === 0 ? (
                        <div className="text-center py-12">
                          <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {clientMessages.map((msg: DirectMessage) => {
                            const isAdmin = msg.senderId !== selectedClient.userId;
                            return (
                              <div key={msg.id} className={cn("flex", isAdmin ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                  "max-w-[70%] p-3 rounded-2xl text-sm",
                                  isAdmin
                                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-md"
                                    : "bg-white border border-gray-200 text-gray-900 rounded-bl-md"
                                )}>
                                  <p>{msg.content}</p>
                                  <p className={cn("text-[10px] mt-1", isAdmin ? "text-white/60" : "text-gray-400")}>
                                    {new Date(msg.createdAt!).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={e => setMessageInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter" && !e.shiftKey && messageInput.trim()) {
                            e.preventDefault();
                            sendMessageMutation.mutate({ clientId: selectedClient.id, content: messageInput.trim() });
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => {
                          if (messageInput.trim()) {
                            sendMessageMutation.mutate({ clientId: selectedClient.id, content: messageInput.trim() });
                          }
                        }}
                        disabled={!messageInput.trim() || sendMessageMutation.isPending}
                        className="bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="checkins" className="mt-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Daily Check-ins</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(clientCheckins as any[]).length === 0 ? (
                      <div className="text-center py-12">
                        <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No check-ins yet</p>
                        <p className="text-gray-400 text-sm mt-1">Client check-ins will appear here once they start logging</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(clientCheckins as any[]).map((checkin: any) => (
                          <div key={checkin.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-sm">{new Date(checkin.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                              <div className="flex items-center gap-2">
                                {checkin.mood && (
                                  <Badge variant="outline" className="text-[10px]">{checkin.mood}</Badge>
                                )}
                                {checkin.workoutCompleted && (
                                  <Badge className="bg-green-100 text-green-700 text-[10px]">Workout Done</Badge>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-xs">
                              <div>
                                <span className="text-gray-500">Energy</span>
                                <p className="font-medium">{checkin.energyLevel ? `${checkin.energyLevel}/5` : "-"}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Sleep</span>
                                <p className="font-medium">{checkin.sleepHours ? `${checkin.sleepHours}h` : "-"}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Water</span>
                                <p className="font-medium">{checkin.waterGlasses || 0} glasses</p>
                              </div>
                            </div>
                            {checkin.notes && (
                              <p className="text-xs text-gray-600 mt-2">{checkin.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
      <Dialog open={!!videoPopupUrl} onOpenChange={(open) => { if (!open) setVideoPopupUrl(null); }}>
        <DialogContent className="sm:max-w-[720px] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="text-sm">Exercise Video</DialogTitle>
          </DialogHeader>
          {videoPopupUrl && (
            <div className="aspect-video w-full">
              <iframe
                src={videoPopupUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/").split("&")[0] + "?autoplay=1"}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="Exercise Video"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
