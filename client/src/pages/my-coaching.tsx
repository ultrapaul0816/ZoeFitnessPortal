import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import BottomNav from "@/components/bottom-nav";
import {
  Dumbbell,
  Apple,
  MessageCircle,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  Sparkles,
  Clock,
  Flame,
  Droplets,
  Moon,
  Zap,
  Scale,
  Plus,
  Minus,
  Heart,
  RefreshCw,
  Timer,
  Wind,
  ExternalLink,
  Play,
} from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface Exercise {
  name: string;
  sets?: number;
  reps?: string;
  duration?: string;
  restSeconds?: number;
  notes?: string;
}

interface MealOption {
  name: string;
  description?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  ingredients?: string[];
  instructions?: string;
}

interface WorkoutPlan {
  id: string;
  clientId: string;
  weekNumber: number;
  dayNumber: number;
  dayType: string;
  title: string;
  description?: string;
  exercises: Exercise[];
  coachNotes?: string;
  isApproved?: boolean;
  orderIndex?: number;
}

interface NutritionPlan {
  id: string;
  clientId: string;
  mealType: string;
  options: MealOption[];
  tips?: string;
  isApproved?: boolean;
  orderIndex?: number;
}

interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  clientId: string;
  content: string;
  messageType?: string;
  isRead?: boolean;
  readAt?: string;
  createdAt: string;
}

interface CoachingCheckin {
  id: string;
  clientId: string;
  userId: string;
  date: string;
  mood?: string;
  energyLevel?: number;
  sleepHours?: number;
  waterGlasses?: number;
  workoutCompleted?: boolean;
  workoutNotes?: string;
  mealsLogged?: { breakfast?: string; lunch?: string; snack?: string; dinner?: string };
  weight?: string;
  notes?: string;
  createdAt: string;
}

interface CoachingClient {
  id: string;
  userId: string;
  status: string;
  startDate?: string;
  endDate?: string;
  planDurationWeeks?: number;
}

interface MyPlanResponse {
  client: CoachingClient;
  workoutPlan: WorkoutPlan[];
  nutritionPlan: NutritionPlan[];
  tips: Array<{ id: string; category: string; title: string; content: string }>;
  unreadMessages: number;
}

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DAY_TYPE_COLORS: Record<string, string> = {
  workout: "bg-pink-100 text-pink-700 border-pink-200",
  cardio: "bg-blue-100 text-blue-700 border-blue-200",
  rest: "bg-green-100 text-green-700 border-green-200",
  active_recovery: "bg-yellow-100 text-yellow-700 border-yellow-200",
  upper_body_strength: "bg-pink-100 text-pink-700 border-pink-200",
  lower_body_core: "bg-purple-100 text-purple-700 border-purple-200",
  full_body_strength: "bg-rose-100 text-rose-700 border-rose-200",
  conditioning: "bg-orange-100 text-orange-700 border-orange-200",
  sport_active_play: "bg-teal-100 text-teal-700 border-teal-200",
};

const SECTION_TYPE_CONFIG: Record<string, { bg: string; border: string; text: string; icon: typeof Flame }> = {
  warmup: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: Flame },
  activation: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", icon: Zap },
  main: { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", icon: Dumbbell },
  circuit: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", icon: RefreshCw },
  finisher: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", icon: Timer },
  stretch: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", icon: Wind },
  cooldown: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", icon: Wind },
};

const MOOD_OPTIONS = [
  { value: "amazing", emoji: "🤩", label: "Amazing" },
  { value: "good", emoji: "😊", label: "Good" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "tired", emoji: "😴", label: "Tired" },
  { value: "struggling", emoji: "😣", label: "Struggling" },
];

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "🌅 Breakfast",
  lunch: "☀️ Lunch",
  snack: "🍎 Snack",
  dinner: "🌙 Dinner",
};

const MEAL_TYPE_ORDER = ["breakfast", "lunch", "snack", "dinner"];

export default function MyCoaching() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<UserType | null>(null);
  const { toast } = useToast();

  const [selectedWeek, setSelectedWeek] = useState(1);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [checkinForm, setCheckinForm] = useState({
    mood: "",
    energyLevel: 5,
    sleepHours: 7,
    waterGlasses: 0,
    workoutCompleted: false,
    workoutNotes: "",
    mealsLogged: { breakfast: "", lunch: "", snack: "", dinner: "" },
    weight: "",
    notes: "",
  });

  useEffect(() => {
    async function checkAuth() {
      const userData = localStorage.getItem("user");
      if (!userData) {
        setLocation("/");
        return;
      }
      try {
        const response = await fetch("/api/auth/session", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    }
    checkAuth();
  }, [setLocation]);

  const { data: planData, isLoading: planLoading } = useQuery<MyPlanResponse>({
    queryKey: ["/api/coaching/my-plan"],
    enabled: !!user,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<DirectMessage[]>({
    queryKey: ["/api/coaching/messages"],
    enabled: !!user && !!planData?.client,
    refetchInterval: 10000,
  });

  const { data: checkins = [] } = useQuery<CoachingCheckin[]>({
    queryKey: ["/api/coaching/checkins"],
    enabled: !!user && !!planData?.client,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/coaching/messages", { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coaching/messages"] });
      setMessageInput("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    },
  });

  const submitCheckinMutation = useMutation({
    mutationFn: async (data: typeof checkinForm) => {
      await apiRequest("POST", "/api/coaching/checkins", {
        ...data,
        date: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coaching/checkins"] });
      toast({ title: "Check-in submitted! ✨", description: "Your coach Zoe will review it soon." });
      setCheckinForm({
        mood: "",
        energyLevel: 5,
        sleepHours: 7,
        waterGlasses: 0,
        workoutCompleted: false,
        workoutNotes: "",
        mealsLogged: { breakfast: "", lunch: "", snack: "", dinner: "" },
        weight: "",
        notes: "",
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit check-in", variant: "destructive" });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleDay = (key: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleMeal = (key: string) => {
    setExpandedMeals((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSendMessage = () => {
    const trimmed = messageInput.trim();
    if (!trimmed) return;
    sendMessageMutation.mutate(trimmed);
  };

  const handleSubmitCheckin = () => {
    if (!checkinForm.mood) {
      toast({ title: "Please select your mood", variant: "destructive" });
      return;
    }
    submitCheckinMutation.mutate(checkinForm);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mb-4" />
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    );
  }

  if (planLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mb-4" />
        <p className="text-gray-600 font-medium">Loading your coaching plan...</p>
      </div>
    );
  }

  if (!planData?.client) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pb-24">
        <div className="max-w-lg mx-auto px-4 pt-12 text-center">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-pink-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Private Coaching</h1>
          <p className="text-gray-600 mb-6">
            You're not currently enrolled in a 1:1 coaching program. Contact Zoe to learn more about personalized coaching plans tailored just for you.
          </p>
          <Button
            className="bg-pink-500 hover:bg-pink-600 text-white"
            onClick={() => setLocation("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const client = planData.client;

  if (client.status !== "active") {
    const statusMessages: Record<string, { title: string; description: string }> = {
      pending: {
        title: "Your Plan is Being Prepared 🎯",
        description: "Zoe is crafting your personalized coaching plan. You'll be notified as soon as it's ready!",
      },
      paused: {
        title: "Coaching Paused ⏸️",
        description: "Your coaching program is currently paused. Reach out to Zoe to resume.",
      },
      completed: {
        title: "Program Completed 🎉",
        description: "Congratulations on completing your coaching program! What an incredible journey.",
      },
    };

    const msg = statusMessages[client.status] || {
      title: "Coaching Status",
      description: "Please contact Zoe for more information about your coaching program.",
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pb-24">
        <div className="max-w-lg mx-auto px-4 pt-12 text-center">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-pink-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{msg.title}</h1>
          <p className="text-gray-600 mb-6">{msg.description}</p>
          <Button
            className="bg-pink-500 hover:bg-pink-600 text-white"
            onClick={() => setLocation("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const weekWorkouts = (planData.workoutPlan || [])
    .filter((w) => w.weekNumber === selectedWeek)
    .sort((a, b) => a.dayNumber - b.dayNumber);

  const nutritionByMeal = MEAL_TYPE_ORDER.map((mealType) => ({
    mealType,
    plan: (planData.nutritionPlan || []).find((n) => n.mealType === mealType),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Coaching</h1>
          <p className="text-sm text-pink-600 font-medium mt-1">Your personalized plan with Zoe</p>
        </div>

        <Tabs defaultValue="workouts" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-pink-50 border border-pink-100">
            <TabsTrigger
              value="workouts"
              className="data-[state=active]:bg-pink-500 data-[state=active]:text-white text-xs sm:text-sm"
            >
              <Dumbbell className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Workouts</span>
              <span className="sm:hidden">Train</span>
            </TabsTrigger>
            <TabsTrigger
              value="nutrition"
              className="data-[state=active]:bg-pink-500 data-[state=active]:text-white text-xs sm:text-sm"
            >
              <Apple className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Nutrition</span>
              <span className="sm:hidden">Eat</span>
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="data-[state=active]:bg-pink-500 data-[state=active]:text-white text-xs sm:text-sm relative"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Messages</span>
              <span className="sm:hidden">Chat</span>
              {(planData.unreadMessages || 0) > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {planData.unreadMessages}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="checkin"
              className="data-[state=active]:bg-pink-500 data-[state=active]:text-white text-xs sm:text-sm"
            >
              <ClipboardCheck className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Check-in</span>
              <span className="sm:hidden">Log</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workouts" className="mt-4">
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
              {Array.from({ length: client.planDurationWeeks || 4 }, (_, i) => i + 1).map((week) => (
                <Button
                  key={week}
                  variant={selectedWeek === week ? "default" : "outline"}
                  size="sm"
                  className={
                    selectedWeek === week
                      ? "bg-pink-500 hover:bg-pink-600 text-white shrink-0"
                      : "border-pink-200 text-pink-700 hover:bg-pink-50 shrink-0"
                  }
                  onClick={() => setSelectedWeek(week)}
                >
                  Week {week}
                </Button>
              ))}
            </div>

            {weekWorkouts.length === 0 ? (
              <Card className="border-pink-100">
                <CardContent className="pt-8 pb-8 text-center">
                  <Sparkles className="w-12 h-12 text-pink-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Plan Being Prepared</h3>
                  <p className="text-gray-500 text-sm">
                    Zoe is working on your Week {selectedWeek} workout plan. Check back soon!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {weekWorkouts.map((workout) => {
                  const dayKey = `${workout.weekNumber}-${workout.dayNumber}`;
                  const isExpanded = expandedDays.has(dayKey);
                  const exercisesData = workout.exercises as any;
                  const isStructured = exercisesData && !Array.isArray(exercisesData) && exercisesData.sections;
                  const legacyExercises: Exercise[] = Array.isArray(exercisesData) ? exercisesData : [];

                  return (
                    <Card key={workout.id} className="border-pink-100 overflow-hidden">
                      <button
                        className="w-full text-left p-4 flex items-center justify-between"
                        onClick={() => toggleDay(dayKey)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 text-sm">
                              {DAY_NAMES[workout.dayNumber - 1] || `Day ${workout.dayNumber}`}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-xs ${DAY_TYPE_COLORS[workout.dayType] || "bg-gray-100 text-gray-700"}`}
                            >
                              {workout.dayType.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{workout.title}</p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-pink-50">
                          {workout.description && (
                            <p className="text-sm text-gray-600 mt-3 mb-3">{workout.description}</p>
                          )}

                          {isStructured ? (
                            <>
                              <div className="flex flex-wrap items-center gap-2 mt-3 mb-3">
                                {exercisesData.estimatedDuration && (
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {exercisesData.estimatedDuration}
                                  </Badge>
                                )}
                                {exercisesData.difficultyLevel && (
                                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                    <Zap className="w-3 h-3 mr-1" />
                                    {exercisesData.difficultyLevel}
                                  </Badge>
                                )}
                              </div>

                              {exercisesData.equipmentNeeded && exercisesData.equipmentNeeded.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs font-semibold text-gray-500 mb-1.5">Equipment needed</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {exercisesData.equipmentNeeded.map((item: string, idx: number) => (
                                      <Badge key={idx} variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                                        {item}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="space-y-3">
                                {exercisesData.sections.map((section: any, sIdx: number) => {
                                  const config = SECTION_TYPE_CONFIG[section.type] || SECTION_TYPE_CONFIG.main;
                                  const SectionIcon = config.icon;
                                  const sectionKey = `${dayKey}-section-${sIdx}`;
                                  const isSectionExpanded = expandedDays.has(sectionKey);

                                  return (
                                    <div key={sIdx} className={`rounded-lg border ${config.border} overflow-hidden`}>
                                      <button
                                        className={`w-full text-left px-3 py-2.5 flex items-center justify-between ${config.bg}`}
                                        onClick={(e) => { e.stopPropagation(); toggleDay(sectionKey); }}
                                      >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          <SectionIcon className={`w-4 h-4 ${config.text} shrink-0`} />
                                          <span className={`font-semibold text-sm ${config.text}`}>
                                            {section.name}
                                          </span>
                                          {section.rounds > 1 && (
                                            <Badge variant="outline" className={`text-xs ${config.text} ${config.border}`}>
                                              x{section.rounds} rounds
                                            </Badge>
                                          )}
                                          {section.duration && (
                                            <span className="text-xs text-gray-500 ml-auto mr-2 shrink-0">
                                              {section.duration}
                                            </span>
                                          )}
                                        </div>
                                        {isSectionExpanded ? (
                                          <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                                        ) : (
                                          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                                        )}
                                      </button>

                                      {isSectionExpanded && (
                                        <div className="px-3 py-2 space-y-2 bg-white">
                                          {section.type === "finisher" && section.format && (
                                            <div className="text-xs text-rose-600 font-medium bg-rose-50 px-2 py-1 rounded">
                                              {section.format}
                                            </div>
                                          )}
                                          {section.restBetweenRounds && (
                                            <p className="text-xs text-gray-500">
                                              Rest between rounds: {section.restBetweenRounds}
                                            </p>
                                          )}

                                          {section.exercises && section.exercises.map((ex: any, eIdx: number) => (
                                            <div
                                              key={eIdx}
                                              className="bg-gray-50/80 rounded-lg p-3 border border-gray-100"
                                            >
                                              <div className="flex items-start justify-between gap-2">
                                                <p className="font-medium text-gray-900 text-sm">{ex.name}</p>
                                                {ex.videoUrl && (
                                                  <a
                                                    href={ex.videoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="shrink-0 flex items-center gap-1 text-xs text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-2 py-1 rounded-full transition-colors"
                                                    onClick={(e) => e.stopPropagation()}
                                                  >
                                                    <Play className="w-3 h-3" />
                                                    Video
                                                  </a>
                                                )}
                                              </div>
                                              <div className="flex flex-wrap gap-2 mt-1.5">
                                                {ex.sets && (
                                                  <span className="text-xs text-pink-700 bg-pink-100 px-2 py-0.5 rounded">
                                                    {ex.sets} {ex.sets === 1 ? "set" : "sets"}
                                                  </span>
                                                )}
                                                {ex.reps && (
                                                  <span className="text-xs text-pink-700 bg-pink-100 px-2 py-0.5 rounded">
                                                    {ex.reps} reps
                                                  </span>
                                                )}
                                                {ex.duration && (
                                                  <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                                                    <Clock className="w-3 h-3 inline mr-0.5" />
                                                    {ex.duration}
                                                  </span>
                                                )}
                                                {ex.restAfter && (
                                                  <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                                    Rest: {ex.restAfter}
                                                  </span>
                                                )}
                                              </div>
                                              {ex.notes && (
                                                <p className="text-xs text-gray-500 mt-1.5 italic">{ex.notes}</p>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          ) : legacyExercises.length > 0 ? (
                            <div className="space-y-2 mt-3">
                              {legacyExercises.map((ex, idx) => (
                                <div
                                  key={idx}
                                  className="bg-pink-50/50 rounded-lg p-3 border border-pink-100/50"
                                >
                                  <p className="font-medium text-gray-900 text-sm">{ex.name}</p>
                                  <div className="flex flex-wrap gap-2 mt-1.5">
                                    {ex.sets && (
                                      <span className="text-xs text-pink-700 bg-pink-100 px-2 py-0.5 rounded">
                                        {ex.sets} sets
                                      </span>
                                    )}
                                    {ex.reps && (
                                      <span className="text-xs text-pink-700 bg-pink-100 px-2 py-0.5 rounded">
                                        {ex.reps} reps
                                      </span>
                                    )}
                                    {ex.duration && (
                                      <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                                        <Clock className="w-3 h-3 inline mr-0.5" />
                                        {ex.duration}
                                      </span>
                                    )}
                                    {ex.restSeconds && (
                                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                        Rest: {ex.restSeconds}s
                                      </span>
                                    )}
                                  </div>
                                  {ex.notes && (
                                    <p className="text-xs text-gray-500 mt-1.5 italic">{ex.notes}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : null}

                          {workout.coachNotes && (
                            <div className="mt-3 bg-pink-50 rounded-lg p-3 border border-pink-200">
                              <p className="text-xs font-semibold text-pink-700 mb-1">Coach Notes</p>
                              <p className="text-sm text-gray-700">{workout.coachNotes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="nutrition" className="mt-4">
            {(planData.nutritionPlan || []).length === 0 ? (
              <Card className="border-pink-100">
                <CardContent className="pt-8 pb-8 text-center">
                  <Apple className="w-12 h-12 text-pink-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Nutrition Plan Coming Soon</h3>
                  <p className="text-gray-500 text-sm">
                    Zoe is preparing your personalized nutrition plan. Stay tuned!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {nutritionByMeal.map(({ mealType, plan }) => {
                  if (!plan) return null;
                  const options = Array.isArray(plan.options) ? plan.options : [];

                  return (
                    <div key={mealType}>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        {MEAL_TYPE_LABELS[mealType] || mealType}
                      </h3>

                      {plan.tips && (
                        <div className="bg-pink-50 rounded-lg p-3 mb-3 border border-pink-100">
                          <p className="text-sm text-pink-800">{plan.tips}</p>
                        </div>
                      )}

                      <div className="space-y-2">
                        {options.map((option, idx) => {
                          const mealKey = `${mealType}-${idx}`;
                          const isExpanded = expandedMeals.has(mealKey);

                          return (
                            <Card key={idx} className="border-pink-100/50">
                              <button
                                className="w-full text-left p-3"
                                onClick={() => toggleMeal(mealKey)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm">{option.name}</p>
                                    {option.description && (
                                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                        {option.description}
                                      </p>
                                    )}
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                      {option.calories !== undefined && (
                                        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                                          <Flame className="w-3 h-3 mr-0.5" />
                                          {option.calories} cal
                                        </Badge>
                                      )}
                                      {option.protein !== undefined && (
                                        <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                          {option.protein}g protein
                                        </Badge>
                                      )}
                                      {option.carbs !== undefined && (
                                        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                                          {option.carbs}g carbs
                                        </Badge>
                                      )}
                                      {option.fat !== undefined && (
                                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                          {option.fat}g fat
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                                  )}
                                </div>
                              </button>

                              {isExpanded && (
                                <div className="px-3 pb-3 border-t border-pink-50">
                                  {option.ingredients && option.ingredients.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-xs font-semibold text-gray-700 mb-1">Ingredients</p>
                                      <ul className="text-xs text-gray-600 space-y-0.5">
                                        {option.ingredients.map((ing, i) => (
                                          <li key={i} className="flex items-start gap-1">
                                            <span className="text-pink-400 mt-0.5">•</span>
                                            {ing}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {option.instructions && (
                                    <div className="mt-2">
                                      <p className="text-xs font-semibold text-gray-700 mb-1">Instructions</p>
                                      <p className="text-xs text-gray-600 whitespace-pre-line">
                                        {option.instructions}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages" className="mt-4">
            <Card className="border-pink-100 overflow-hidden">
              <CardHeader className="py-3 px-4 bg-pink-50 border-b border-pink-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">Z</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Coach Zoe</p>
                    <p className="text-xs text-pink-600">Your personal coach</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[400px] overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageCircle className="w-10 h-10 text-pink-200 mb-2" />
                      <p className="text-gray-500 text-sm">No messages yet</p>
                      <p className="text-gray-400 text-xs mt-1">Send a message to your coach Zoe!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isFromCoach = msg.senderId !== user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isFromCoach ? "justify-start" : "justify-end"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                              isFromCoach
                                ? "bg-pink-500 text-white rounded-bl-md"
                                : "bg-gray-200 text-gray-900 rounded-br-md"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isFromCoach ? "text-pink-100" : "text-gray-500"
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 border-t border-pink-100 bg-white flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 border-pink-200 focus-visible:ring-pink-300"
                  />
                  <Button
                    size="icon"
                    className="bg-pink-500 hover:bg-pink-600 text-white shrink-0"
                    onClick={handleSendMessage}
                    disabled={sendMessageMutation.isPending || !messageInput.trim()}
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkin" className="mt-4 space-y-6">
            <Card className="border-pink-100">
              <CardHeader className="pb-2">
                <h3 className="font-bold text-gray-900">Daily Check-in</h3>
                <p className="text-sm text-gray-500">How are you doing today?</p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">How's your mood?</label>
                  <div className="flex gap-2 flex-wrap">
                    {MOOD_OPTIONS.map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() => setCheckinForm((f) => ({ ...f, mood: mood.value }))}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                          checkinForm.mood === mood.value
                            ? "border-pink-500 bg-pink-50 scale-105"
                            : "border-gray-200 hover:border-pink-200"
                        }`}
                      >
                        <span className="text-2xl">{mood.emoji}</span>
                        <span className="text-xs text-gray-600">{mood.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Energy Level: {checkinForm.energyLevel}/10
                  </label>
                  <Slider
                    value={[checkinForm.energyLevel]}
                    onValueChange={([val]) => setCheckinForm((f) => ({ ...f, energyLevel: val }))}
                    max={10}
                    min={1}
                    step={1}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                      <Moon className="w-4 h-4 text-indigo-500" />
                      Sleep (hours)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={24}
                      value={checkinForm.sleepHours}
                      onChange={(e) =>
                        setCheckinForm((f) => ({ ...f, sleepHours: parseInt(e.target.value) || 0 }))
                      }
                      className="border-pink-200 focus-visible:ring-pink-300"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      Water (glasses)
                    </label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 border-pink-200"
                        onClick={() =>
                          setCheckinForm((f) => ({
                            ...f,
                            waterGlasses: Math.max(0, f.waterGlasses - 1),
                          }))
                        }
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-lg font-semibold text-gray-900 w-8 text-center">
                        {checkinForm.waterGlasses}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 border-pink-200"
                        onClick={() =>
                          setCheckinForm((f) => ({
                            ...f,
                            waterGlasses: f.waterGlasses + 1,
                          }))
                        }
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Dumbbell className="w-4 h-4 text-pink-500" />
                    Workout Completed
                  </label>
                  <Switch
                    checked={checkinForm.workoutCompleted}
                    onCheckedChange={(checked) =>
                      setCheckinForm((f) => ({ ...f, workoutCompleted: checked }))
                    }
                  />
                </div>

                {checkinForm.workoutCompleted && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Workout Notes
                    </label>
                    <Textarea
                      placeholder="How was your workout?"
                      value={checkinForm.workoutNotes}
                      onChange={(e) =>
                        setCheckinForm((f) => ({ ...f, workoutNotes: e.target.value }))
                      }
                      className="border-pink-200 focus-visible:ring-pink-300"
                      rows={2}
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Meals Logged</label>
                  <div className="space-y-2">
                    {(["breakfast", "lunch", "snack", "dinner"] as const).map((meal) => (
                      <Input
                        key={meal}
                        placeholder={meal.charAt(0).toUpperCase() + meal.slice(1)}
                        value={checkinForm.mealsLogged[meal]}
                        onChange={(e) =>
                          setCheckinForm((f) => ({
                            ...f,
                            mealsLogged: { ...f.mealsLogged, [meal]: e.target.value },
                          }))
                        }
                        className="border-pink-200 focus-visible:ring-pink-300"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                    <Scale className="w-4 h-4 text-gray-500" />
                    Weight (optional)
                  </label>
                  <Input
                    placeholder="e.g. 65kg"
                    value={checkinForm.weight}
                    onChange={(e) => setCheckinForm((f) => ({ ...f, weight: e.target.value }))}
                    className="border-pink-200 focus-visible:ring-pink-300"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Notes</label>
                  <Textarea
                    placeholder="Anything else you'd like to share with Zoe?"
                    value={checkinForm.notes}
                    onChange={(e) => setCheckinForm((f) => ({ ...f, notes: e.target.value }))}
                    className="border-pink-200 focus-visible:ring-pink-300"
                    rows={3}
                  />
                </div>

                <Button
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-6"
                  onClick={handleSubmitCheckin}
                  disabled={submitCheckinMutation.isPending}
                >
                  {submitCheckinMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Check-in ✨"
                  )}
                </Button>
              </CardContent>
            </Card>

            {checkins.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Recent Check-ins</h3>
                <div className="space-y-2">
                  {checkins.slice(0, 7).map((checkin) => (
                    <Card key={checkin.id} className="border-pink-100/50">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(checkin.date).toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span className="text-lg">
                            {MOOD_OPTIONS.find((m) => m.value === checkin.mood)?.emoji || "📝"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                          {checkin.energyLevel && (
                            <span className="flex items-center gap-0.5">
                              <Zap className="w-3 h-3 text-yellow-500" />
                              Energy: {checkin.energyLevel}/10
                            </span>
                          )}
                          {checkin.sleepHours && (
                            <span className="flex items-center gap-0.5">
                              <Moon className="w-3 h-3 text-indigo-500" />
                              {checkin.sleepHours}h sleep
                            </span>
                          )}
                          {checkin.waterGlasses !== undefined && checkin.waterGlasses > 0 && (
                            <span className="flex items-center gap-0.5">
                              <Droplets className="w-3 h-3 text-blue-500" />
                              {checkin.waterGlasses} glasses
                            </span>
                          )}
                          {checkin.workoutCompleted && (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              ✓ Workout done
                            </Badge>
                          )}
                        </div>
                        {checkin.notes && (
                          <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{checkin.notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}
