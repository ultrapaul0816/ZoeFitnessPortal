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
  RefreshCw,
  Pencil,
  Flame,
  Filter,
  Activity,
  TrendingUp,
  BarChart3,
  FileText,
  Wand2,
  Zap,
  CircleDot,
  Circle,
  ArrowRight,
  UserPlus,
  LayoutGrid,
  Table2,
} from "lucide-react";
import { CoachingFormResponsesSection } from "@/components/admin/coaching-form-responses";
import { CoachingClientInfoCard } from "@/components/admin/CoachingClientInfoCard";
import { CoachingClientsTable } from "@/components/admin/CoachingClientsTable";
import { CoachingWorkoutTable } from "@/components/admin/CoachingWorkoutTable";
import type { CoachingClient, DirectMessage } from "@shared/schema";

type CoachingClientWithUser = CoachingClient & {
  user: { id: string; firstName: string; lastName: string; email: string; phone: string | null; profilePictureUrl: string | null };
  unreadMessages: number;
  lastCheckinDate: string | null;
  lastMessagePreview: string | null;
  lastMessageDate: string | null;
  missedCheckinDays: number;
};

type CoachingView = "clients" | "client-detail";

const statusColors: Record<string, string> = {
  enrolled: "bg-yellow-100 text-yellow-700 border-yellow-200",
  intake_complete: "bg-indigo-100 text-indigo-700 border-indigo-200",
  plan_generating: "bg-blue-100 text-blue-700 border-blue-200",
  plan_ready: "bg-cyan-100 text-cyan-700 border-cyan-200",
  active: "bg-green-100 text-green-700 border-green-200",
  paused: "bg-orange-100 text-orange-700 border-orange-200",
  completed: "bg-gray-100 text-gray-700 border-gray-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  // Legacy fallbacks
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  pending_plan: "bg-blue-100 text-blue-700 border-blue-200",
};

const statusLabels: Record<string, string> = {
  enrolled: "Enrolled",
  intake_complete: "Intake Complete",
  plan_generating: "Generating Plan",
  plan_ready: "Plan Ready",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  cancelled: "Cancelled",
  // Legacy fallbacks
  pending: "Enrolled",
  pending_plan: "Plan In Progress",
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
  const [newClientCoachingType, setNewClientCoachingType] = useState("pregnancy_coaching");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortMode, setSortMode] = useState<"urgent" | "recent" | "alpha">("urgent");
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
  const [workoutViewMode, setWorkoutViewMode] = useState<"calendar" | "table">("calendar");
  const [editingNutritionDish, setEditingNutritionDish] = useState<{ planId: string; optionIndex: number; data: any } | null>(null);
  const [regeneratingDish, setRegeneratingDish] = useState<string | null>(null);
  const [outlinePreviewWeek, setOutlinePreviewWeek] = useState<number | null>(null);
  const [editingOutlineText, setEditingOutlineText] = useState<string>("");
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
    mutationFn: async (data: { email: string; firstName?: string; lastName?: string; phone?: string; notes: string; paymentAmount: number; coachingType?: string }) => {
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
      setNewClientCoachingType("pregnancy_coaching");
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

  const updateNutritionDishMutation = useMutation({
    mutationFn: async ({ planId, optionIndex, data }: { planId: string; optionIndex: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/admin/coaching/nutrition-plans/${planId}/options/${optionIndex}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coaching/clients", selectedClientId, "nutrition-plan"] });
      setEditingNutritionDish(null);
      toast({ title: "Dish updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Error updating dish", description: err.message, variant: "destructive" });
    },
  });

  const regenerateNutritionDishMutation = useMutation({
    mutationFn: async ({ planId, optionIndex }: { planId: string; optionIndex: number }) => {
      setRegeneratingDish(`${planId}-${optionIndex}`);
      const res = await apiRequest("POST", `/api/admin/coaching/nutrition-plans/${planId}/options/${optionIndex}/regenerate`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coaching/clients", selectedClientId, "nutrition-plan"] });
      setRegeneratingDish(null);
      toast({ title: "Dish regenerated", description: "A new dish option has been generated by AI." });
    },
    onError: (err: Error) => {
      setRegeneratingDish(null);
      toast({ title: "Error regenerating dish", description: err.message, variant: "destructive" });
    },
  });

  const regenerateAiSummaryMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const res = await apiRequest("POST", `/api/admin/coaching/clients/${clientId}/regenerate-ai-summary`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coaching/clients"] });
      toast({ title: "AI summary regenerated" });
    },
    onError: (err: Error) => {
      toast({ title: "Error regenerating summary", description: err.message, variant: "destructive" });
    },
  });

  const generateCoachRemarksMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const res = await apiRequest("POST", `/api/admin/coaching/clients/${clientId}/generate-coach-remarks`);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.remarks && selectedClient) {
        const currentRemarks = ((selectedClient as any).coachRemarks as Record<string, string>) || {};
        updateClientMutation.mutate({
          clientId: selectedClient.id,
          updates: {
            coachRemarks: {
              ...currentRemarks,
              trainingFocus: data.remarks.trainingFocus || currentRemarks.trainingFocus || "",
              nutritionalGuidance: data.remarks.nutritionalGuidance || currentRemarks.nutritionalGuidance || "",
              thingsToWatch: data.remarks.thingsToWatch || currentRemarks.thingsToWatch || "",
              personalityNotes: data.remarks.personalityNotes || currentRemarks.personalityNotes || "",
            }
          }
        });
      }
      toast({ title: "AI-generated coaching notes applied", description: "Review and edit as needed before generating workouts." });
    },
    onError: (err: Error) => {
      toast({ title: "Error generating coach remarks", description: err.message, variant: "destructive" });
    },
  });

  const generatePlanOutlineMutation = useMutation({
    mutationFn: async ({ clientId, weekNumber }: { clientId: string; weekNumber: number }) => {
      const res = await apiRequest("POST", `/api/admin/coaching/clients/${clientId}/generate-plan-outline`, {
        body: JSON.stringify({ weekNumber }),
      });
      return { ...(await res.json()), weekNumber };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coaching/clients"] });
      toast({ title: "Plan outline generated", description: "Review the weekly approach before generating the full workout." });
      // Open the dialog after successful generation
      setOutlinePreviewWeek(data.weekNumber);
    },
    onError: (err: Error) => {
      toast({ title: "Error generating outline", description: err.message, variant: "destructive" });
    },
  });

  const approveOutlineAndGenerateMutation = useMutation({
    mutationFn: async ({ clientId, weekNumber, editedOutline }: { clientId: string; weekNumber: number; editedOutline?: string }) => {
      const res = await apiRequest("POST", `/api/admin/coaching/clients/${clientId}/approve-outline-and-generate`, {
        body: JSON.stringify({ weekNumber, editedOutline }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coaching/clients"] });
      toast({ title: "Outline approved", description: "Ready to generate full workout with this approach." });
    },
    onError: (err: Error) => {
      toast({ title: "Error approving outline", description: err.message, variant: "destructive" });
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

  const approveIntakeMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const res = await apiRequest("POST", `/api/admin/coaching/clients/${clientId}/approve-intake`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coaching/clients"] });
      toast({ title: "Intake approved", description: "Status changed to 'Generating Plan'. Use the Generate Workout button to create Week 1." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const activateClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const res = await apiRequest("POST", `/api/admin/coaching/clients/${clientId}/activate`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coaching/clients"] });
      toast({ title: "Client activated!", description: "The client can now see their plan and start working out." });
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
    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "needs_action") {
        if (!["enrolled", "intake_complete", "plan_ready"].includes(c.status || "")) return false;
      } else if (c.status !== statusFilter) return false;
    }
    // Search filter
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.user.firstName.toLowerCase().includes(q) ||
      c.user.lastName.toLowerCase().includes(q) ||
      c.user.email.toLowerCase().includes(q)
    );
  }).sort((a, b) => {
    if (sortMode === "alpha") {
      return `${a.user.firstName} ${a.user.lastName}`.localeCompare(`${b.user.firstName} ${b.user.lastName}`);
    }
    if (sortMode === "recent") {
      const dateA = a.lastMessageDate || a.lastCheckinDate || a.createdAt || 0;
      const dateB = b.lastMessageDate || b.lastCheckinDate || b.createdAt || 0;
      return new Date(dateB as string | number).getTime() - new Date(dateA as string | number).getTime();
    }
    // "urgent" — needs attention first, then by missed check-in days
    const priority: Record<string, number> = { intake_complete: 0, plan_ready: 1, enrolled: 2, plan_generating: 3, active: 4, paused: 5, completed: 6, cancelled: 7 };
    const pa = priority[a.status || "enrolled"] ?? 4;
    const pb = priority[b.status || "enrolled"] ?? 4;
    if (pa !== pb) return pa - pb;
    return (b.missedCheckinDays || 0) - (a.missedCheckinDays || 0);
  });

  const needsAction = clients.filter(c => ["enrolled", "intake_complete", "plan_ready"].includes(c.status || "")).length;
  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === "active").length,
    needsAction,
    pendingPlan: clients.filter(c => c.status === "enrolled" || c.status === "intake_complete" || c.status === "plan_generating" || c.status === "plan_ready" || c.status === "pending" || c.status === "pending_plan").length,
    completed: clients.filter(c => c.status === "completed").length,
    avgCheckinRate: clients.length > 0 ? Math.round(clients.filter(c => c.lastCheckinDate && new Date(c.lastCheckinDate) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)).length / Math.max(1, clients.filter(c => c.status === "active").length) * 100) : 0,
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
                    <Label>Coaching Type <span className="text-red-400">*</span></Label>
                    <Select value={newClientCoachingType} onValueChange={setNewClientCoachingType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pregnancy_coaching">Pregnancy with Zoe</SelectItem>
                        <SelectItem value="private_coaching">Private Coaching</SelectItem>
                      </SelectContent>
                    </Select>
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
                      paymentAmount: parseInt(newClientPaymentAmount) * 100,
                      coachingType: newClientCoachingType,
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
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
              <Card className={cn("border-0 shadow-sm bg-gradient-to-br from-white to-green-50/30", statusFilter === "active" && "ring-2 ring-green-400")} onClick={() => setStatusFilter(statusFilter === "active" ? "all" : "active")} role="button">
                <CardContent className="pt-5 pb-4 px-5 cursor-pointer">
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
              <Card className={cn("border-0 shadow-sm bg-gradient-to-br from-white to-amber-50/30", statusFilter === "needs_action" && "ring-2 ring-amber-400")} onClick={() => setStatusFilter(statusFilter === "needs_action" ? "all" : "needs_action")} role="button">
                <CardContent className="pt-5 pb-4 px-5 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Needs Action</p>
                      <p className="text-2xl font-bold text-amber-600 mt-1">{stats.needsAction}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-blue-50/30">
                <CardContent className="pt-5 pb-4 px-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Check-in Rate</p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">{stats.avgCheckinRate}%</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className={cn("border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/30", statusFilter === "completed" && "ring-2 ring-gray-400")} onClick={() => setStatusFilter(statusFilter === "completed" ? "all" : "completed")} role="button">
                <CardContent className="pt-5 pb-4 px-5 cursor-pointer">
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
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">Coaching Clients</CardTitle>
                    {statusFilter !== "all" && (
                      <Badge variant="outline" className="text-xs cursor-pointer hover:bg-gray-100" onClick={() => setStatusFilter("all")}>
                        {statusFilter === "needs_action" ? "Needs Action" : statusFilter} <X className="w-3 h-3 ml-1 inline" />
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={sortMode}
                      onChange={e => setSortMode(e.target.value as "urgent" | "recent" | "alpha")}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-2 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-300"
                    >
                      <option value="urgent">Most urgent</option>
                      <option value="recent">Recently active</option>
                      <option value="alpha">A → Z</option>
                    </select>
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
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <CoachingClientsTable
                  clients={filteredClients as any}
                  isLoading={isLoadingClients}
                  onSelectClient={openClientDetail}
                />
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
                  <Badge variant="outline" className={cn("text-xs", statusColors[selectedClient.status || "enrolled"])}>
                    {statusLabels[selectedClient.status || "enrolled"]}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">{selectedClient.user.email}</p>
              </div>
              <div className="flex gap-2">
                {(selectedClient.status === "plan_generating" || selectedClient.status === "plan_ready" || selectedClient.status === "active") && (
                  <Select
                    onValueChange={(week) => generateWorkoutMutation.mutate({ clientId: selectedClient.id, weekNumber: parseInt(week) })}
                    disabled={generateWorkoutMutation.isPending}
                  >
                    <SelectTrigger className="w-[240px] bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 shadow-lg [&>span]:text-white font-medium">
                      <Brain className="w-4 h-4 mr-2" />
                      {generateWorkoutMutation.isPending ? `Generating Week ${generatingWeek}...` : (() => {
                        const weeksGen = new Set((clientWorkoutPlan as any[]).map((p: any) => p.weekNumber)).size;
                        return `Generate Workout (${weeksGen}/4)`;
                      })()}
                      {!generateWorkoutMutation.isPending && new Set((clientWorkoutPlan as any[]).map((p: any) => p.weekNumber)).size < 4 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-ping" />
                      )}
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
                {selectedClient.status === "intake_complete" && (
                  <Button
                    onClick={() => approveIntakeMutation.mutate(selectedClient.id)}
                    disabled={approveIntakeMutation.isPending}
                    className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    {approveIntakeMutation.isPending ? "Approving..." : "Approve & Generate Plan"}
                  </Button>
                )}
                {selectedClient.status === "plan_ready" && (
                  <Button
                    onClick={() => activateClientMutation.mutate(selectedClient.id)}
                    disabled={activateClientMutation.isPending}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {activateClientMutation.isPending ? "Activating..." : "Activate Client"}
                  </Button>
                )}
                <Select
                  value={selectedClient.status || "enrolled"}
                  onValueChange={(status) => updateStatusMutation.mutate({ clientId: selectedClient.id, status })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { value: "enrolled", label: "Enrolled" },
                      { value: "intake_complete", label: "Intake Complete" },
                      { value: "plan_generating", label: "Generating Plan" },
                      { value: "plan_ready", label: "Plan Ready" },
                      { value: "active", label: "Active" },
                      { value: "paused", label: "Paused" },
                      { value: "completed", label: "Completed" },
                      { value: "cancelled", label: "Cancelled" },
                    ].map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* === ONBOARDING STEPPER === */}
            {(() => {
              const status = selectedClient.status || "enrolled";
              const hasFormData = !!(clientCheckins as any[])?.length || !!(selectedClient as any).notes;
              const hasCoachRemarks = !!(selectedClient as any).coachRemarks && Object.values((selectedClient as any).coachRemarks || {}).some((v: any) => v && String(v).trim());
              const hasPlan = (clientWorkoutPlan as any[])?.length > 0;
              const isPreActive = ["enrolled", "intake_complete", "plan_generating", "plan_ready"].includes(status);

              // Determine step states
              const steps = [
                { label: "Enrolled", key: "enrolled", done: true, icon: UserPlus },
                { label: "Forms Filled", key: "forms", done: status !== "enrolled", icon: FileText,
                  action: status === "enrolled" ? "Client needs to complete intake forms" : undefined },
                { label: "Coach Notes", key: "remarks", done: hasCoachRemarks, icon: Pencil,
                  action: !hasCoachRemarks && status !== "enrolled" ? "Add your training direction" : undefined },
                { label: "Plan Generated", key: "plan", done: hasPlan, icon: Brain,
                  action: !hasPlan && (status === "intake_complete" || status === "plan_generating") ? "Generate workout plan" : undefined },
                { label: "Active", key: "active", done: status === "active" || status === "completed", icon: Zap,
                  action: status === "plan_ready" ? "Activate the client" : undefined },
              ];

              const currentStepIdx = steps.findIndex(s => !s.done);
              const isFullyOnboarded = currentStepIdx === -1;

              if (!isPreActive && isFullyOnboarded) return null; // Hide for fully active clients

              return (
                <Card className={cn("border-0 shadow-sm", isPreActive ? "bg-gradient-to-r from-amber-50 to-orange-50 ring-1 ring-amber-200" : "bg-gradient-to-r from-green-50 to-emerald-50 ring-1 ring-green-200")}>
                  <CardContent className="py-4 px-5">
                    {isPreActive && (
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Onboarding In Progress</span>
                        {currentStepIdx >= 0 && (
                          <span className="text-xs text-amber-600 ml-auto">
                            Next: {steps[currentStepIdx]?.action || steps[currentStepIdx]?.label}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      {steps.map((step, idx) => {
                        const StepIcon = step.icon;
                        const isCurrent = idx === currentStepIdx;
                        const isDone = step.done;
                        return (
                          <div key={step.key} className="flex items-center flex-1">
                            <div className={cn(
                              "flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all flex-1 min-w-0",
                              isDone ? "bg-green-100 text-green-700" :
                              isCurrent ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300 shadow-sm" :
                              "bg-gray-100 text-gray-400"
                            )}
                              onClick={() => {
                                if (step.key === "remarks") setActiveTab("overview");
                                else if (step.key === "plan") setActiveTab("workout");
                                else if (step.key === "forms") setActiveTab("intake");
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-green-600" />
                              ) : isCurrent ? (
                                <CircleDot className="w-3.5 h-3.5 shrink-0 text-amber-600 animate-pulse" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 shrink-0" />
                              )}
                              <span className="truncate">{step.label}</span>
                            </div>
                            {idx < steps.length - 1 && (
                              <ArrowRight className={cn("w-3 h-3 shrink-0 mx-0.5", isDone ? "text-green-400" : "text-gray-300")} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            {/* === CLIENT INFO CARD (collapsible, above tabs) === */}
            <CoachingClientInfoCard
              client={selectedClient as any}
              onUpdateClient={(data) => updateClientMutation.mutate(data)}
            />

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
                <TabsTrigger value="intake" className="rounded-lg gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <FileText className="w-4 h-4" /> Intake Forms
                  {selectedClient.status === "intake_complete" && (
                    <Badge className="bg-indigo-500 text-white text-[9px] ml-1 px-1.5">New</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="space-y-6">
                  {/* === PROGRESS METRIC CARDS === */}
                  {(() => {
                    const workoutPlans = clientWorkoutPlan as any[];
                    const completions = clientCompletions as any[];
                    const checkins = clientCheckins as any[];

                    // Calculate current week from start date
                    const startDate = selectedClient.startDate ? new Date(selectedClient.startDate) : null;
                    const daysSinceStart = startDate ? Math.max(0, Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24))) : 0;
                    const currentWeek = Math.min(4, Math.max(1, Math.ceil(daysSinceStart / 7) || 1));
                    const totalDays = (selectedClient.planDurationWeeks || 4) * 7;

                    // Workout completion for current week
                    const currentWeekPlans = workoutPlans.filter((p: any) => p.weekNumber === currentWeek);
                    const totalExercises = currentWeekPlans.reduce((sum: number, p: any) => {
                      const sections = p.exercises?.sections || [];
                      return sum + sections.reduce((s: number, sec: any) => s + (sec.exercises?.length || 0), 0);
                    }, 0);
                    const completedExercises = completions.filter((c: any) => c.weekNumber === currentWeek && c.completed).length;
                    const workoutPercent = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

                    // Check-in streak
                    let streak = 0;
                    if (checkins.length > 0) {
                      const sorted = [...checkins].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
                      const today = new Date(); today.setHours(0,0,0,0);
                      let checkDate = today;
                      for (const ci of sorted) {
                        const ciDate = new Date(ci.date); ciDate.setHours(0,0,0,0);
                        const diff = Math.round((checkDate.getTime() - ciDate.getTime()) / (1000*60*60*24));
                        if (diff <= 1) { streak++; checkDate = ciDate; }
                        else break;
                      }
                    }

                    // Last check-in
                    const lastCheckin = checkins.length > 0 ? (checkins as any[])[0] : null;
                    const lastCheckinAge = lastCheckin ? Math.round((Date.now() - new Date(lastCheckin.date).getTime()) / (1000*60*60)) : null;

                    // Phase names
                    const phaseNames: Record<number, string> = { 1: "Foundation", 2: "Build & Strengthen", 3: "Optimize", 4: "Peak Performance" };

                    // Weeks generated
                    const weeksGenerated = new Set(workoutPlans.map((p: any) => p.weekNumber)).size;
                    const nextUngenWeek = [1,2,3,4].find(w => !workoutPlans.some((p: any) => p.weekNumber === w));

                    return (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                          <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-50 to-purple-50">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-1">
                                <Dumbbell className="w-4 h-4 text-violet-500" />
                                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Workout</span>
                              </div>
                              <div className="text-xl font-bold text-violet-700">{workoutPercent}%</div>
                              <div className="text-[11px] text-gray-500">Week {currentWeek} progress</div>
                              <div className="mt-2 h-1.5 bg-violet-100 rounded-full overflow-hidden">
                                <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${workoutPercent}%` }} />
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-amber-50">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-1">
                                <Flame className="w-4 h-4 text-orange-500" />
                                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Streak</span>
                              </div>
                              <div className="text-xl font-bold text-orange-700">{streak} days</div>
                              <div className="text-[11px] text-gray-500">Check-in streak</div>
                            </CardContent>
                          </Card>

                          <Card className={cn("border-0 shadow-sm", selectedClient.unreadMessages > 0 ? "bg-gradient-to-br from-pink-50 to-rose-50 ring-2 ring-pink-200" : "bg-gradient-to-br from-pink-50 to-rose-50")}>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-1">
                                <MessageSquare className="w-4 h-4 text-pink-500" />
                                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Messages</span>
                              </div>
                              <div className="text-xl font-bold text-pink-700">{selectedClient.unreadMessages}</div>
                              <div className="text-[11px] text-gray-500">{selectedClient.unreadMessages > 0 ? "unread messages" : "all caught up"}</div>
                            </CardContent>
                          </Card>

                          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-sky-50">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Active</span>
                              </div>
                              <div className="text-xl font-bold text-blue-700">Day {daysSinceStart || 0}</div>
                              <div className="text-[11px] text-gray-500">of {totalDays} days</div>
                              <div className="mt-2 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(100, (daysSinceStart / totalDays) * 100)}%` }} />
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-green-50">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Phase</span>
                              </div>
                              <div className="text-lg font-bold text-emerald-700">Week {currentWeek}</div>
                              <div className="text-[11px] text-gray-500">{phaseNames[currentWeek] || "Active"}</div>
                            </CardContent>
                          </Card>

                          <Card className="border-0 shadow-sm bg-gradient-to-br from-cyan-50 to-teal-50">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-1">
                                <ClipboardList className="w-4 h-4 text-cyan-500" />
                                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Last Check-in</span>
                              </div>
                              {lastCheckin ? (
                                <>
                                  <div className="text-lg font-bold text-cyan-700">
                                    {lastCheckin.mood === "great" ? "🤩" : lastCheckin.mood === "good" ? "😊" : lastCheckin.mood === "okay" ? "😐" : lastCheckin.mood === "tired" ? "😴" : lastCheckin.mood === "struggling" ? "😣" : "📋"}
                                    <span className="ml-1 text-sm">{lastCheckin.energyLevel}/5</span>
                                  </div>
                                  <div className="text-[11px] text-gray-500">{lastCheckinAge !== null && lastCheckinAge < 24 ? `${lastCheckinAge}h ago` : lastCheckinAge !== null ? `${Math.floor(lastCheckinAge / 24)}d ago` : ""}</div>
                                </>
                              ) : (
                                <div className="text-sm text-gray-400">No check-ins yet</div>
                              )}
                            </CardContent>
                          </Card>
                        </div>

                        {/* === QUICK ACTIONS === */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Button
                            variant="outline"
                            className="h-auto py-3 px-4 justify-start gap-3 border-gray-200 hover:border-pink-200 hover:bg-pink-50 transition-all"
                            onClick={() => setActiveTab("checkins")}
                          >
                            <div className="w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center">
                              <ClipboardList className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div className="text-left">
                              <div className="text-sm font-medium">Review Check-ins</div>
                              <div className="text-[11px] text-gray-500">{checkins.length} total check-ins</div>
                            </div>
                          </Button>

                          <Button
                            variant="outline"
                            className={cn("h-auto py-3 px-4 justify-start gap-3 border-gray-200 hover:border-pink-200 hover:bg-pink-50 transition-all", selectedClient.unreadMessages > 0 && "ring-2 ring-pink-200 border-pink-200")}
                            onClick={() => setActiveTab("messages")}
                          >
                            <div className="w-9 h-9 rounded-lg bg-pink-100 flex items-center justify-center relative">
                              <MessageSquare className="w-5 h-5 text-pink-600" />
                              {selectedClient.unreadMessages > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">{selectedClient.unreadMessages}</span>
                              )}
                            </div>
                            <div className="text-left">
                              <div className="text-sm font-medium">Messages</div>
                              <div className="text-[11px] text-gray-500">{selectedClient.unreadMessages > 0 ? `${selectedClient.unreadMessages} unread` : "All caught up"}</div>
                            </div>
                          </Button>

                          {nextUngenWeek ? (
                            <Button
                              className="h-auto py-3 px-4 justify-start gap-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg hover:from-violet-600 hover:to-purple-600 transition-all"
                              onClick={() => {
                                if (selectedClient) {
                                  generatePlanOutlineMutation.mutate({ clientId: selectedClient.id, weekNumber: nextUngenWeek });
                                }
                              }}
                              disabled={generatePlanOutlineMutation.isPending || generateWorkoutMutation.isPending}
                            >
                              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                                <Brain className="w-5 h-5 text-white" />
                              </div>
                              <div className="text-left">
                                <div className="text-sm font-medium">{generatePlanOutlineMutation.isPending ? `Generating Outline...` : `Generate Week ${nextUngenWeek}`}</div>
                                <div className="text-[11px] text-white/80">{weeksGenerated} of 4 weeks ready</div>
                              </div>
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              className="h-auto py-3 px-4 justify-start gap-3 border-gray-200"
                              onClick={() => setActiveTab("workout")}
                            >
                              <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              </div>
                              <div className="text-left">
                                <div className="text-sm font-medium">All Weeks Generated</div>
                                <div className="text-[11px] text-gray-500">View workout plan</div>
                              </div>
                            </Button>
                          )}
                        </div>

                        {/* === COACH'S NOTES & DIRECTION === */}
                        <Card className="border-0 shadow-sm border-l-4 border-l-violet-400">
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-base flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-violet-500" />
                                  Coach's Notes & Direction
                                </CardTitle>
                                <p className="text-[11px] text-violet-600 bg-violet-50 rounded-md px-2 py-1 w-fit mt-1">These notes are used by AI when generating workouts and nutrition plans</p>
                              </div>
                              <Button
                                variant="outline" size="sm"
                                className="text-violet-600 border-violet-300 hover:bg-violet-50"
                                onClick={() => generateCoachRemarksMutation.mutate(selectedClient.id)}
                                disabled={generateCoachRemarksMutation.isPending}
                              >
                                <Wand2 className={cn("w-3.5 h-3.5 mr-1.5", generateCoachRemarksMutation.isPending && "animate-spin")} />
                                {generateCoachRemarksMutation.isPending ? "Generating..." : "Generate with AI"}
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {[
                                { key: "trainingFocus", label: "Training Focus", placeholder: "e.g., Pelvic floor strengthening, glute activation, avoid overhead pressing..." },
                                { key: "nutritionalGuidance", label: "Nutritional Guidance", placeholder: "e.g., Vegetarian, needs more plant protein, avoids dairy..." },
                                { key: "thingsToWatch", label: "Things to Watch", placeholder: "e.g., Lower back pain after deadlifts — modify to sumo stance..." },
                                { key: "personalityNotes", label: "Client Personality", placeholder: "e.g., Prefers encouraging tone, motivated by progress data..." },
                              ].map(field => (
                                <div key={field.key}>
                                  <Label className="text-xs text-gray-500 font-medium">{field.label}</Label>
                                  <Textarea
                                    className="mt-1 text-sm min-h-[60px] focus:ring-violet-200 focus:border-violet-300"
                                    rows={2}
                                    placeholder={field.placeholder}
                                    defaultValue={((selectedClient as any).coachRemarks as any)?.[field.key] || ''}
                                    onBlur={(e) => {
                                      const currentRemarks = ((selectedClient as any).coachRemarks as Record<string, string>) || {};
                                      if (e.target.value !== (currentRemarks[field.key] || '')) {
                                        updateClientMutation.mutate({
                                          clientId: selectedClient.id,
                                          updates: { coachRemarks: { ...currentRemarks, [field.key]: e.target.value || "" } }
                                        });
                                      }
                                    }}
                                  />
                                </div>
                              ))}
                              <div className="md:col-span-2">
                                <Label className="text-xs text-gray-500 font-medium">Additional Notes</Label>
                                <Textarea
                                  className="mt-1 text-sm min-h-[60px] focus:ring-violet-200 focus:border-violet-300"
                                  rows={2}
                                  placeholder="Any other coaching directions, goals, special requirements..."
                                  defaultValue={((selectedClient as any).coachRemarks as any)?.customNotes || ''}
                                  onBlur={(e) => {
                                    const currentRemarks = ((selectedClient as any).coachRemarks as Record<string, string>) || {};
                                    if (e.target.value !== (currentRemarks.customNotes || '')) {
                                      updateClientMutation.mutate({
                                        clientId: selectedClient.id,
                                        updates: { coachRemarks: { ...currentRemarks, customNotes: e.target.value || "" } }
                                      });
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* === LATEST CHECK-IN SUMMARY === */}
                        {lastCheckin && (
                          <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2">
                                  <ClipboardList className="w-4 h-4 text-cyan-500" />
                                  Latest Check-in
                                </CardTitle>
                                <Button variant="ghost" size="sm" className="text-xs text-pink-600 hover:text-pink-700" onClick={() => setActiveTab("checkins")}>
                                  View all check-ins →
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <span className="text-2xl">
                                    {lastCheckin.mood === "great" ? "🤩" : lastCheckin.mood === "good" ? "😊" : lastCheckin.mood === "okay" ? "😐" : lastCheckin.mood === "tired" ? "😴" : lastCheckin.mood === "struggling" ? "😣" : "📋"}
                                  </span>
                                  <div>
                                    <div className="text-sm font-medium">{new Date(lastCheckin.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                                    <div className="text-[11px] text-gray-500">{lastCheckin.workoutCompleted ? "Workout completed ✓" : "Rest day"}</div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                  <div className="bg-white rounded-lg p-2 text-center">
                                    <div className="text-[10px] text-gray-500 uppercase">Energy</div>
                                    <div className="text-sm font-bold text-orange-600">{lastCheckin.energyLevel || '-'}/5</div>
                                  </div>
                                  <div className="bg-white rounded-lg p-2 text-center">
                                    <div className="text-[10px] text-gray-500 uppercase">Sleep</div>
                                    <div className="text-sm font-bold text-blue-600">{lastCheckin.sleepHours || '-'}h</div>
                                  </div>
                                  <div className="bg-white rounded-lg p-2 text-center">
                                    <div className="text-[10px] text-gray-500 uppercase">Water</div>
                                    <div className="text-sm font-bold text-cyan-600">{lastCheckin.waterGlasses || 0} glasses</div>
                                  </div>
                                  <div className="bg-white rounded-lg p-2 text-center">
                                    <div className="text-[10px] text-gray-500 uppercase">Weight</div>
                                    <div className="text-sm font-bold text-gray-600">{lastCheckin.weight || '-'}</div>
                                  </div>
                                </div>
                                {lastCheckin.notes && (
                                  <div className="mt-3 text-sm text-gray-600 bg-white rounded-lg p-3 italic">"{lastCheckin.notes}"</div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* === AI ASSESSMENT SUMMARY === */}
                        {(selectedClient as any).aiSummary ? (
                          <Card className="border-0 shadow-sm">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2">
                                  <Brain className="w-4 h-4 text-violet-500" />
                                  AI Assessment Summary
                                </CardTitle>
                                <Button
                                  variant="ghost" size="sm"
                                  onClick={() => regenerateAiSummaryMutation.mutate(selectedClient.id)}
                                  disabled={regenerateAiSummaryMutation.isPending}
                                  className="text-xs text-violet-600 hover:text-violet-700"
                                >
                                  <RefreshCw className={cn("w-3 h-3 mr-1", regenerateAiSummaryMutation.isPending && "animate-spin")} />
                                  {regenerateAiSummaryMutation.isPending ? "Regenerating..." : "Regenerate"}
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="bg-violet-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {(selectedClient as any).aiSummary}
                              </div>
                            </CardContent>
                          </Card>
                        ) : selectedClient.status !== "enrolled" ? (
                          <Card className="border-0 shadow-sm border-dashed border-2 border-violet-200">
                            <CardContent className="py-6 text-center">
                              <Brain className="w-8 h-8 text-violet-300 mx-auto mb-2" />
                              <p className="text-sm text-gray-500 mb-3">AI summary will be generated when intake forms are submitted</p>
                              <Button
                                variant="outline" size="sm" className="text-violet-600 border-violet-300"
                                onClick={() => regenerateAiSummaryMutation.mutate(selectedClient.id)}
                                disabled={regenerateAiSummaryMutation.isPending}
                              >
                                {regenerateAiSummaryMutation.isPending ? "Generating..." : "Generate Now"}
                              </Button>
                            </CardContent>
                          </Card>
                        ) : null}

                        {/* Client details moved to CoachingClientInfoCard above tabs */}
                        {/* Intake forms moved to dedicated "Intake Forms" tab */}
                      </>
                    );
                  })()}
                </div>
              </TabsContent>

              <TabsContent value="workout" className="mt-6">
                {/* Week Generation Status Banner */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[1, 2, 3, 4].map(week => {
                    const weekPlan = (clientWorkoutPlan as any[]).filter(p => p.weekNumber === week);
                    const hasWeek = weekPlan.length > 0;
                    const isGenerating = generateWorkoutMutation.isPending && generatingWeek === week;
                    const approved = weekPlan.some(p => p.isApproved);
                    return (
                      <Card key={week} className={cn(
                        "border shadow-sm cursor-pointer transition-all hover:shadow-md",
                        isGenerating ? "border-purple-300 bg-purple-50" :
                        hasWeek && approved ? "border-green-300 bg-green-50" :
                        hasWeek ? "border-blue-300 bg-blue-50" :
                        "border-dashed border-gray-300 bg-gray-50"
                      )}>
                        <CardContent className="p-3 text-center">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Week {week}</div>
                          {isGenerating ? (
                            <div className="mt-1">
                              <Sparkles className="w-5 h-5 text-purple-500 animate-pulse mx-auto" />
                              <div className="text-[10px] text-purple-600 mt-1">Generating...</div>
                            </div>
                          ) : hasWeek ? (
                            <div className="mt-1">
                              <CheckCircle2 className={cn("w-5 h-5 mx-auto", approved ? "text-green-500" : "text-blue-500")} />
                              <div className="text-[10px] text-gray-600 mt-1">{weekPlan.length} days{approved ? " · Approved" : ""}</div>
                            </div>
                          ) : (
                            <div className="mt-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs text-violet-600 hover:text-violet-700 hover:bg-violet-100 px-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  generateWorkoutMutation.mutate({ clientId: selectedClient.id, weekNumber: week });
                                }}
                                disabled={generateWorkoutMutation.isPending}
                              >
                                <Sparkles className="w-3 h-3 mr-1" /> Generate
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">4-Week Workout Plan</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          {workoutViewMode === "calendar"
                            ? "Generate one week at a time. Click a day card to view and edit exercises."
                            : "All workout days at a glance. Click actions to view or edit."}
                        </p>
                      </div>
                      <div className="flex items-center border rounded-lg overflow-hidden">
                        <button
                          onClick={() => setWorkoutViewMode("calendar")}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
                            workoutViewMode === "calendar"
                              ? "bg-pink-500 text-white"
                              : "bg-white text-gray-500 hover:bg-gray-50"
                          )}
                        >
                          <LayoutGrid className="w-3.5 h-3.5" /> Calendar
                        </button>
                        <button
                          onClick={() => setWorkoutViewMode("table")}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
                            workoutViewMode === "table"
                              ? "bg-pink-500 text-white"
                              : "bg-white text-gray-500 hover:bg-gray-50"
                          )}
                        >
                          <Table2 className="w-3.5 h-3.5" /> Table
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {workoutViewMode === "table" ? (
                      <CoachingWorkoutTable
                        workoutPlans={(clientWorkoutPlan as any[])}
                        completions={(clientCompletions as any[])}
                        onEditDay={(day) => {
                          const exercisesData = day.exercises?.sections ? day.exercises : (day.exercises?.exercises || { sections: [] });
                          setExpandedAdminDay(`${day.weekNumber}-${day.dayNumber}`);
                          setEditingDayData({
                            planId: day.id,
                            dayNumber: day.dayNumber,
                            weekNumber: day.weekNumber,
                            title: day.title,
                            dayType: day.dayType,
                            exercises: JSON.parse(JSON.stringify(exercisesData || { sections: [] })),
                          });
                          setEditingCoachNotes(day.coachNotes || "");
                          setSwapTarget(null);
                          setExerciseSearchQuery("");
                          setWorkoutViewMode("calendar"); // Switch to calendar to show inline editor
                        }}
                        onViewDay={(day) => {
                          const exercisesData = day.exercises?.sections ? day.exercises : (day.exercises?.exercises || { sections: [] });
                          setExpandedAdminDay(`${day.weekNumber}-${day.dayNumber}`);
                          setEditingDayData({
                            planId: day.id,
                            dayNumber: day.dayNumber,
                            weekNumber: day.weekNumber,
                            title: day.title,
                            dayType: day.dayType,
                            exercises: JSON.parse(JSON.stringify(exercisesData || { sections: [] })),
                          });
                          setEditingCoachNotes(day.coachNotes || "");
                          setWorkoutViewMode("calendar"); // Switch to calendar to show inline editor
                        }}
                      />
                    ) : (
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
                                onClick={() => {
                                  if (hasWeek) {
                                    // Regenerate: skip outline and go straight to workout
                                    generateWorkoutMutation.mutate({ clientId: selectedClient.id, weekNumber: week });
                                  } else {
                                    // First time: generate outline first
                                    generatePlanOutlineMutation.mutate({ clientId: selectedClient.id, weekNumber: week });
                                  }
                                }}
                                disabled={generateWorkoutMutation.isPending || generatePlanOutlineMutation.isPending || !previousWeekExists}
                                className={cn(
                                  hasWeek ? "" : "bg-gradient-to-r from-violet-500 to-purple-500 text-white"
                                )}
                              >
                                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                {isGenerating || generatePlanOutlineMutation.isPending ? "Generating..." : hasWeek ? "Regenerate" : "Generate"}
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
                    )}
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
                                {(options as any[]).map((opt: any, i: number) => {
                                  const isEditing = editingNutritionDish?.planId === mealPlan.id && editingNutritionDish?.optionIndex === i;
                                  const isRegenerating = regeneratingDish === `${mealPlan.id}-${i}`;
                                  return (
                                    <div key={i} className={cn("p-3 rounded-xl border", isEditing ? "bg-white border-violet-300 shadow-md" : "bg-gray-50 border-gray-200")}>
                                      {isEditing ? (
                                        <div className="space-y-2">
                                          <Input
                                            value={editingNutritionDish.data.name || ""}
                                            onChange={e => setEditingNutritionDish({ ...editingNutritionDish, data: { ...editingNutritionDish.data, name: e.target.value } })}
                                            placeholder="Dish name"
                                            className="h-8 text-sm"
                                          />
                                          <Textarea
                                            value={editingNutritionDish.data.description || ""}
                                            onChange={e => setEditingNutritionDish({ ...editingNutritionDish, data: { ...editingNutritionDish.data, description: e.target.value } })}
                                            placeholder="Description"
                                            className="text-xs min-h-[60px]"
                                          />
                                          <div className="grid grid-cols-2 gap-1.5">
                                            <div>
                                              <label className="text-[10px] text-gray-500">Calories</label>
                                              <Input
                                                value={editingNutritionDish.data.calories || ""}
                                                onChange={e => setEditingNutritionDish({ ...editingNutritionDish, data: { ...editingNutritionDish.data, calories: parseInt(e.target.value) || 0 } })}
                                                type="number"
                                                className="h-7 text-xs"
                                              />
                                            </div>
                                            <div>
                                              <label className="text-[10px] text-gray-500">Protein (g)</label>
                                              <Input
                                                value={editingNutritionDish.data.protein || ""}
                                                onChange={e => setEditingNutritionDish({ ...editingNutritionDish, data: { ...editingNutritionDish.data, protein: parseInt(e.target.value) || 0 } })}
                                                type="number"
                                                className="h-7 text-xs"
                                              />
                                            </div>
                                            <div>
                                              <label className="text-[10px] text-gray-500">Carbs (g)</label>
                                              <Input
                                                value={editingNutritionDish.data.carbs || ""}
                                                onChange={e => setEditingNutritionDish({ ...editingNutritionDish, data: { ...editingNutritionDish.data, carbs: parseInt(e.target.value) || 0 } })}
                                                type="number"
                                                className="h-7 text-xs"
                                              />
                                            </div>
                                            <div>
                                              <label className="text-[10px] text-gray-500">Fat (g)</label>
                                              <Input
                                                value={editingNutritionDish.data.fat || ""}
                                                onChange={e => setEditingNutritionDish({ ...editingNutritionDish, data: { ...editingNutritionDish.data, fat: parseInt(e.target.value) || 0 } })}
                                                type="number"
                                                className="h-7 text-xs"
                                              />
                                            </div>
                                          </div>
                                          <div className="grid grid-cols-2 gap-1.5">
                                            <div>
                                              <label className="text-[10px] text-gray-500">Prep Time</label>
                                              <Input
                                                value={editingNutritionDish.data.prepTime || ""}
                                                onChange={e => setEditingNutritionDish({ ...editingNutritionDish, data: { ...editingNutritionDish.data, prepTime: e.target.value } })}
                                                className="h-7 text-xs"
                                              />
                                            </div>
                                            <div>
                                              <label className="text-[10px] text-gray-500">Cuisine</label>
                                              <Select
                                                value={editingNutritionDish.data.cuisine || "international"}
                                                onValueChange={v => setEditingNutritionDish({ ...editingNutritionDish, data: { ...editingNutritionDish.data, cuisine: v } })}
                                              >
                                                <SelectTrigger className="h-7 text-xs">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="indian">Indian</SelectItem>
                                                  <SelectItem value="international">International</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                          </div>
                                          <div className="flex gap-1.5 pt-1">
                                            <Button
                                              size="sm"
                                              className="h-7 text-xs flex-1"
                                              onClick={() => updateNutritionDishMutation.mutate({ planId: mealPlan.id, optionIndex: i, data: editingNutritionDish.data })}
                                              disabled={updateNutritionDishMutation.isPending}
                                            >
                                              <Save className="w-3 h-3 mr-1" />
                                              Save
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="h-7 text-xs"
                                              onClick={() => setEditingNutritionDish(null)}
                                            >
                                              <X className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="flex items-start justify-between gap-1">
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-1.5">
                                                <p className="font-medium text-sm text-gray-900 truncate">{opt.name}</p>
                                                {opt.cuisine === "indian" && (
                                                  <span className="text-[9px] text-orange-700 bg-orange-50 px-1 py-0.5 rounded shrink-0">🇮🇳</span>
                                                )}
                                              </div>
                                              {opt.prepTime && <span className="text-[10px] text-gray-400">{opt.prepTime}</span>}
                                            </div>
                                            <div className="flex gap-0.5 shrink-0">
                                              <button
                                                className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                                                onClick={() => setEditingNutritionDish({ planId: mealPlan.id, optionIndex: i, data: { ...opt } })}
                                                title="Edit dish"
                                              >
                                                <Pencil className="w-3 h-3" />
                                              </button>
                                              <button
                                                className={cn("p-1 rounded hover:bg-violet-100 text-gray-400 hover:text-violet-600 transition-colors", isRegenerating && "animate-spin text-violet-500")}
                                                onClick={() => regenerateNutritionDishMutation.mutate({ planId: mealPlan.id, optionIndex: i })}
                                                disabled={isRegenerating || regenerateNutritionDishMutation.isPending}
                                                title="Regenerate with AI"
                                              >
                                                <RefreshCw className="w-3 h-3" />
                                              </button>
                                            </div>
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
                                        </>
                                      )}
                                    </div>
                                  );
                                })}
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
                    {/* Quick-reply templates */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {[
                        { label: "Great job!", text: "Great job this week! Keep up the amazing work 💪" },
                        { label: "Check-in reminder", text: "Hey! Don't forget to submit your daily check-in when you get a chance 🙂" },
                        { label: "How are you?", text: "Hi! How are you feeling today? Any updates you'd like to share?" },
                        { label: "Workout tips", text: "Remember to warm up properly before your workout and stay hydrated throughout! 💧" },
                        { label: "Rest day", text: "It's okay to take a rest day when your body needs it. Recovery is just as important as training! 🧘‍♀️" },
                        { label: "You've got this!", text: "I believe in you! Every small step counts towards your goals. You've got this! ✨" },
                      ].map((tpl) => (
                        <button
                          key={tpl.label}
                          onClick={() => setMessageInput(tpl.text)}
                          className="text-xs px-2.5 py-1 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors border border-pink-100"
                        >
                          {tpl.label}
                        </button>
                      ))}
                    </div>
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
                            <div className="grid grid-cols-4 gap-3 text-xs">
                              <div>
                                <span className="text-gray-500">Energy</span>
                                <p className="font-medium">{checkin.energyLevel ? `${checkin.energyLevel}/10` : "-"}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Sleep</span>
                                <p className="font-medium">{checkin.sleepHours ? `${checkin.sleepHours}h` : "-"}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Water</span>
                                <p className="font-medium">{checkin.waterGlasses || 0} glasses</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Weight</span>
                                <p className="font-medium">{checkin.weight || "-"}</p>
                              </div>
                            </div>
                            {checkin.mealsLogged && (
                              <div className="mt-2 text-xs">
                                <span className="text-gray-500 font-medium">Meals:</span>
                                <div className="grid grid-cols-2 gap-1 mt-1">
                                  {['breakfast', 'lunch', 'snack', 'dinner'].map((meal) => {
                                    const val = (checkin.mealsLogged as any)?.[meal];
                                    if (!val) return null;
                                    return (
                                      <div key={meal} className="flex gap-1">
                                        <span className="text-gray-400 capitalize">{meal}:</span>
                                        <span className="text-gray-700 truncate">{val}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            {checkin.workoutNotes && (
                              <p className="text-xs text-gray-600 mt-2 italic">Workout: {checkin.workoutNotes}</p>
                            )}
                            {checkin.notes && (
                              <p className="text-xs text-gray-600 mt-1">{checkin.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="intake" className="mt-6">
                <CoachingFormResponsesSection
                  clientId={selectedClient.id}
                  coachingType={(selectedClient as any).coachingType || "pregnancy_coaching"}
                />
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

      {/* Outline Preview Dialog (Unit 4) */}
      <Dialog open={outlinePreviewWeek !== null} onOpenChange={(open) => { if (!open) { setOutlinePreviewWeek(null); setEditingOutlineText(""); } }}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-500" />
              Week {outlinePreviewWeek} Plan Outline
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-1">Review the weekly approach before generating the full workout</p>
          </DialogHeader>
          {selectedClient && outlinePreviewWeek && (() => {
            const outlines = (selectedClient as any).weeklyPlanOutlines || {};
            const outline = outlines[outlinePreviewWeek.toString()];

            if (!outline) {
              return (
                <div className="py-8 text-center text-gray-400">
                  <p>Outline not yet generated. Click "Generate Outline" to create it.</p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {/* Philosophy */}
                <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
                  <h4 className="font-semibold text-sm text-violet-900 mb-2">Weekly Philosophy</h4>
                  <p className="text-sm text-gray-700">{outline.philosophy}</p>
                </div>

                {/* Focus Areas */}
                {outline.focusAreas && outline.focusAreas.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">Focus Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {outline.focusAreas.map((area: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Day Outlines */}
                {outline.dayOutlines && outline.dayOutlines.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-3">Day-by-Day Outline</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {outline.dayOutlines.map((day: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-white">
                          <div className="flex-shrink-0 w-16 text-center">
                            <div className="text-xs font-medium text-gray-500">{day.dayName || `Day ${day.dayNumber}`}</div>
                            <Badge variant="outline" className="text-[10px] mt-1">{day.dayType}</Badge>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700">{day.briefDescription}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progression */}
                {outline.progressionFromLastWeek && (
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <h4 className="font-semibold text-sm text-amber-900 mb-2">Progression</h4>
                    <p className="text-sm text-gray-700">{outline.progressionFromLastWeek}</p>
                  </div>
                )}

                {/* Safety */}
                {outline.safetyConsiderations && (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <h4 className="font-semibold text-sm text-red-900 mb-2">Safety Considerations</h4>
                    <p className="text-sm text-gray-700">{outline.safetyConsiderations}</p>
                  </div>
                )}

                {/* Editable Text Area for Coach Notes */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Coach Adjustments (Optional)</Label>
                  <Textarea
                    placeholder="Add any custom notes or adjustments to this week's approach..."
                    value={editingOutlineText}
                    onChange={(e) => setEditingOutlineText(e.target.value)}
                    className="min-h-[80px] text-sm"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOutlinePreviewWeek(null);
                      setEditingOutlineText("");
                    }}
                  >
                    Discard
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (selectedClient && outlinePreviewWeek) {
                          generateWorkoutMutation.mutate({ clientId: selectedClient.id, weekNumber: outlinePreviewWeek });
                          setOutlinePreviewWeek(null);
                          setEditingOutlineText("");
                        }
                      }}
                      disabled={generateWorkoutMutation.isPending}
                    >
                      Skip to Direct Generation
                    </Button>
                    <Button
                      onClick={() => {
                        if (selectedClient && outlinePreviewWeek) {
                          approveOutlineAndGenerateMutation.mutate({
                            clientId: selectedClient.id,
                            weekNumber: outlinePreviewWeek,
                            editedOutline: editingOutlineText || undefined,
                          });
                          // After approval, generate the full workout
                          setTimeout(() => {
                            generateWorkoutMutation.mutate({ clientId: selectedClient.id, weekNumber: outlinePreviewWeek });
                          }, 500);
                          setOutlinePreviewWeek(null);
                          setEditingOutlineText("");
                        }
                      }}
                      disabled={approveOutlineAndGenerateMutation.isPending || generateWorkoutMutation.isPending}
                      className="bg-gradient-to-r from-violet-500 to-purple-500 text-white"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve & Generate Workout
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
