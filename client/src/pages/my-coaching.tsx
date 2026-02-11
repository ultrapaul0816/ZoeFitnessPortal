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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
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
  CheckCircle,
  Circle,
  Calendar,
  Sun,
  Coffee,
  Brain,
  Target,
  Shield,
  Utensils,
  Activity,
} from "lucide-react";
import type { User as UserType } from "@shared/schema";

type ActiveView = "today" | "workouts" | "nutrition" | "messages" | "checkin";

interface Exercise {
  name: string;
  sets?: number;
  reps?: string;
  duration?: string;
  durationSeconds?: number;
  restSeconds?: number;
  restAfterSeconds?: number;
  notes?: string;
  videoUrl?: string;
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
  quickInstructions?: string;
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
  coachingType?: string;
  isPregnant?: boolean;
  trimester?: number;
  dueDate?: string;
}

interface FormResponse {
  formType: string;
  formData: any;
}

interface MyPlanResponse {
  client: CoachingClient;
  workoutPlan: WorkoutPlan[];
  nutritionPlan: NutritionPlan[];
  tips: Array<{ id: string; category: string; title: string; content: string }>;
  unreadMessages: number;
  formResponses?: FormResponse[];
  userProfile?: { firstName: string; lastName: string; email: string };
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

const GOAL_LABELS: Record<string, string> = {
  fat_loss: "Fat Loss",
  muscle_toning: "Muscle Toning",
  overall_wellness: "Overall Wellness",
  weight_loss: "Weight Loss",
  strength: "Strength Building",
  endurance: "Endurance",
  flexibility: "Flexibility",
  postnatal_recovery: "Postnatal Recovery",
  prenatal_fitness: "Prenatal Fitness",
};

const PHASE_NAMES: Record<number, string> = {
  1: "Detox & Foundation",
  2: "Build & Strengthen",
  3: "Optimize & Perform",
  4: "Peak Performance",
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function getInitials(firstName?: string, lastName?: string): string {
  const f = firstName?.charAt(0)?.toUpperCase() || "";
  const l = lastName?.charAt(0)?.toUpperCase() || "";
  return f + l || "?";
}

function getCurrentWeekFromStart(startDate?: string): number {
  if (!startDate) return 1;
  const start = new Date(startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, diffWeeks + 1);
}

function getCurrentMonth(weekNumber: number): { month: number; phaseName: string } {
  const month = Math.ceil(weekNumber / 4);
  const phaseName = PHASE_NAMES[month] || `Phase ${month}`;
  return { month, phaseName };
}

function getTodayDayNumber(): number {
  const day = new Date().getDay();
  return day === 0 ? 7 : day;
}

function getFormattedDate(): string {
  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayName = dayNames[now.getDay()];
  const month = monthNames[now.getMonth()];
  const date = now.getDate();
  const suffix = date === 1 || date === 21 || date === 31 ? "st" : date === 2 || date === 22 ? "nd" : date === 3 || date === 23 ? "rd" : "th";
  return `${dayName}, ${month} ${date}${suffix}`;
}

function extractQuestionnaireData(formResponses?: FormResponse[]) {
  if (!formResponses || formResponses.length === 0) return null;
  const questionnaire = formResponses.find(f => f.formType === "private_coaching_questionnaire");
  if (!questionnaire) return null;
  return questionnaire.formData;
}

export default function MyCoaching() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<UserType | null>(null);
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<ActiveView>("today");

  const [selectedWeek, setSelectedWeek] = useState(1);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

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

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
  };

  const currentWeek = planData?.client?.startDate ? getCurrentWeekFromStart(planData.client.startDate) : 1;

  const { data: completionsData = [] } = useQuery<any[]>({
    queryKey: ["/api/coaching/workout-completions", selectedWeek],
    queryFn: async () => {
      const res = await fetch(`/api/coaching/workout-completions?week=${selectedWeek}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user && !!planData?.client,
  });

  const toggleCompletionMutation = useMutation({
    mutationFn: async (data: { planId: string; weekNumber: number; dayNumber: number; sectionIndex: number; exerciseIndex: number; exerciseName: string; completed: boolean }) => {
      await apiRequest("POST", "/api/coaching/workout-completions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coaching/workout-completions"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update exercise completion", variant: "destructive" });
    },
  });

  const isExerciseCompleted = (planId: string, dayNumber: number, sectionIndex: number, exerciseIndex: number) => {
    return completionsData.some(
      (c: any) => c.planId === planId && c.dayNumber === dayNumber && c.sectionIndex === sectionIndex && c.exerciseIndex === exerciseIndex && c.completed
    );
  };

  const getDayCompletionStats = (workout: WorkoutPlan) => {
    const exercisesData = workout.exercises as any;
    if (!exercisesData || !exercisesData.sections) return { total: 0, completed: 0 };
    let total = 0;
    let completed = 0;
    exercisesData.sections.forEach((section: any, sIdx: number) => {
      if (section.exercises) {
        section.exercises.forEach((_: any, eIdx: number) => {
          total++;
          if (isExerciseCompleted(workout.id, workout.dayNumber, sIdx, eIdx)) {
            completed++;
          }
        });
      }
    });
    return { total, completed };
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (planData?.client?.startDate) {
      const week = getCurrentWeekFromStart(planData.client.startDate);
      const maxWeek = planData.client.planDurationWeeks || 4;
      setSelectedWeek(Math.min(week, maxWeek));
    }
  }, [planData?.client?.startDate, planData?.client?.planDurationWeeks]);

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

  const formData = extractQuestionnaireData(planData.formResponses);
  const userProfile = planData.userProfile;
  const firstName = userProfile?.firstName || user?.firstName || "there";
  const lastName = userProfile?.lastName || user?.lastName || "";
  const initials = getInitials(firstName, lastName);

  const sectionA = formData?.sectionA || formData?.section_a || {};
  const sectionB = formData?.sectionB || formData?.section_b || {};
  const sectionC = formData?.sectionC || formData?.section_c || {};
  const sectionD = formData?.sectionD || formData?.section_d || {};
  const sectionE = formData?.sectionE || formData?.section_e || {};
  const sectionI = formData?.sectionI || formData?.section_i || {};

  const age = sectionA.age || "";
  const height = sectionA.height || "";
  const weight = sectionA.weight || sectionI.targetWeight || "";
  const doctorClearance = sectionC.doctorClearance;
  const injuries = sectionC.injuries || "";
  const dietaryPreference = sectionE.dietaryPreference || "";
  const stressLevel = sectionD.stressLevel ? parseInt(sectionD.stressLevel) : 0;
  const primaryGoal = sectionB.primaryGoal || "";

  const constraintTags: string[] = [];
  if (dietaryPreference && dietaryPreference !== "non-veg" && dietaryPreference !== "non_veg") {
    constraintTags.push(dietaryPreference.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()));
  }
  if (injuries && injuries.toLowerCase() !== "none" && injuries.toLowerCase() !== "no") {
    const injuryParts = injuries.split(",").map((s: string) => s.trim()).filter(Boolean);
    injuryParts.forEach((inj: string) => constraintTags.push(inj));
  }
  if (stressLevel >= 7) {
    constraintTags.push("High Stress");
  }
  if (client.isPregnant) {
    constraintTags.push(`Trimester ${client.trimester || "?"}`);
  }

  const { month: currentMonthNum, phaseName } = getCurrentMonth(currentWeek);
  const todayDayNum = getTodayDayNumber();

  const todaysWorkout = (planData.workoutPlan || []).find(
    (w) => w.weekNumber === Math.min(currentWeek, client.planDurationWeeks || 4) && w.dayNumber === todayDayNum
  );

  const weekWorkouts = (planData.workoutPlan || [])
    .filter((w) => w.weekNumber === selectedWeek)
    .sort((a, b) => a.dayNumber - b.dayNumber);

  const nutritionByMeal = MEAL_TYPE_ORDER.map((mealType) => ({
    mealType,
    plan: (planData.nutritionPlan || []).find((n) => n.mealType === mealType),
  }));

  const nutritionOverviewRow = (planData.nutritionPlan || []).find((n: any) => n.mealType === "overview");
  const nutritionOverview = nutritionOverviewRow?.tips ? (() => {
    try { return JSON.parse(nutritionOverviewRow.tips); } catch { return null; }
  })() : null;

  const lunchPlan = (planData.nutritionPlan || []).find((n) => n.mealType === "lunch");
  const snackPlan = (planData.nutritionPlan || []).find((n) => n.mealType === "snack");

  const mindsetTip = (planData.tips || []).find(t => t.category === "mindset" || t.category === "wellness" || t.category === "motivation");

  const renderProfileCard = () => (
    <Card className="border-2 border-pink-200 rounded-2xl shadow-sm mb-5 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center ring-4 ring-pink-200 shrink-0">
            <span className="text-white text-xl font-bold">{initials}</span>
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">{firstName} {lastName}</h2>
            <p className="text-sm text-pink-600 font-medium">High Performance Operating System</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: "Age", value: age || "—" },
            { label: "Height", value: height || "—" },
            { label: "Weight", value: weight || "—" },
            { label: "Medical", value: doctorClearance === true || doctorClearance === "yes" ? "✓ Yes" : doctorClearance === false || doctorClearance === "no" ? "✗ No" : "—" },
          ].map((stat) => (
            <div key={stat.label} className="bg-pink-50/60 rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">{stat.label}</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{stat.value}</p>
            </div>
          ))}
        </div>

        {constraintTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {constraintTags.map((tag, i) => (
              <Badge key={i} className="bg-pink-100 text-pink-700 border-pink-200 text-xs rounded-full px-3 py-0.5 font-medium">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {primaryGoal && (
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-pink-500 shrink-0" />
            <span className="text-sm font-bold text-gray-900">
              {GOAL_LABELS[primaryGoal] || primaryGoal.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
            </span>
          </div>
        )}

        <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-pink-100 text-xs">Current Cycle</p>
            <p className="text-white font-bold text-sm">Month {currentMonthNum} — {phaseName}</p>
          </div>
          <div className="text-white/80 text-xs">
            Week {Math.min(currentWeek, client.planDurationWeeks || 4)} of {client.planDurationWeeks || 4}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTimelineEntry = (
    time: string,
    title: string,
    icon: React.ReactNode,
    content: React.ReactNode,
    isLast: boolean = false,
    onClick?: () => void
  ) => (
    <div className="flex gap-4" onClick={onClick} role={onClick ? "button" : undefined}>
      <div className="flex flex-col items-center shrink-0">
        <div className="w-10 h-10 rounded-full bg-pink-100 border-2 border-pink-400 flex items-center justify-center z-10">
          {icon}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-pink-200 mt-1" />}
      </div>
      <div className={`flex-1 pb-6 ${onClick ? "cursor-pointer" : ""}`}>
        <p className="text-xs text-pink-500 font-semibold mb-0.5">{time}</p>
        <p className="text-sm font-bold text-gray-900 mb-1.5">{title}</p>
        {content}
      </div>
    </div>
  );

  const renderTodayView = () => {
    const hydrationGoal = nutritionOverview?.dailyWaterGoal || nutritionOverview?.hydrationGoal || "3L water";
    const supplements = nutritionOverview?.supplements || nutritionOverview?.supplementStack || [];

    return (
      <div>
        {renderProfileCard()}

        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            {getFormattedDate()}
          </h2>
          <p className="text-pink-600 font-medium text-sm">
            {getGreeting()}, {firstName} ✨
          </p>
        </div>

        <div className="ml-1">
          {renderTimelineEntry(
            "07:00 AM",
            "Morning Ritual",
            <Coffee className="w-5 h-5 text-pink-500" />,
            <Card className="border-pink-100 rounded-2xl shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-700">Hydration: <span className="font-semibold">{typeof hydrationGoal === 'string' ? hydrationGoal : '3L water'}</span></span>
                </div>
                {Array.isArray(supplements) && supplements.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {supplements.map((sup: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 rounded-full">
                        {sup}
                      </Badge>
                    ))}
                  </div>
                )}
                {(!Array.isArray(supplements) || supplements.length === 0) && (
                  <p className="text-xs text-gray-500">Start your day with warm water & lemon</p>
                )}
              </CardContent>
            </Card>
          )}

          {renderTimelineEntry(
            "08:00 AM",
            "The Workout",
            <Dumbbell className="w-5 h-5 text-pink-500" />,
            <Card className="border-pink-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                {todaysWorkout ? (
                  <>
                    <p className="text-sm font-semibold text-gray-900 mb-2">{todaysWorkout.title}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge className={`text-xs rounded-full ${DAY_TYPE_COLORS[todaysWorkout.dayType] || "bg-gray-100 text-gray-700"}`}>
                        {todaysWorkout.dayType.replace(/_/g, " ")}
                      </Badge>
                      {injuries && injuries.toLowerCase() !== "none" && injuries.toLowerCase() !== "no" && (
                        <Badge className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 rounded-full">
                          Modified for Safety
                        </Badge>
                      )}
                    </div>
                    {todaysWorkout.description && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{todaysWorkout.description}</p>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">Rest day — recovery is part of the plan</span>
                  </div>
                )}
              </CardContent>
            </Card>,
            false,
            () => { setActiveView("workouts"); }
          )}

          {renderTimelineEntry(
            "01:00 PM",
            "Nutrition Strategy",
            <Utensils className="w-5 h-5 text-pink-500" />,
            <Card className="border-pink-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                {lunchPlan && lunchPlan.options?.length > 0 ? (
                  <>
                    <p className="text-sm font-semibold text-gray-900 mb-1">{lunchPlan.options[0].name}</p>
                    {lunchPlan.options[0].protein && (
                      <Badge className="text-xs bg-green-50 text-green-700 border-green-200 rounded-full mb-2">
                        Protein Focus: {lunchPlan.options[0].protein}g
                      </Badge>
                    )}
                    {lunchPlan.options[0].description && (
                      <p className="text-xs text-gray-500">{lunchPlan.options[0].description}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Balanced meal with protein priority</p>
                )}
              </CardContent>
            </Card>,
            false,
            () => { setActiveView("nutrition"); }
          )}

          {renderTimelineEntry(
            "04:30 PM",
            "Snack Time",
            <Apple className="w-5 h-5 text-pink-500" />,
            <Card className="border-pink-100 rounded-2xl shadow-sm">
              <CardContent className="p-4">
                {snackPlan && snackPlan.options?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {snackPlan.options.slice(0, 3).map((opt, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-white text-gray-700 border-gray-200 rounded-full">
                        {opt.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Protein-rich snack to fuel your afternoon</p>
                )}
              </CardContent>
            </Card>
          )}

          {renderTimelineEntry(
            "09:00 PM",
            "Mindset & Recovery",
            <Brain className="w-5 h-5 text-pink-500" />,
            <Card className="border-pink-100 rounded-2xl shadow-sm">
              <CardContent className="p-4">
                {mindsetTip ? (
                  <>
                    <p className="text-sm font-semibold text-gray-900 mb-1">{mindsetTip.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-3">{mindsetTip.content}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Weekly Awareness</p>
                    <p className="text-xs text-gray-500">Take 5 minutes for deep breathing. Reflect on one thing that went well today.</p>
                  </>
                )}
              </CardContent>
            </Card>,
            true
          )}
        </div>
      </div>
    );
  };

  const renderWorkoutsView = () => (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Workout Plan</h2>
        <p className="text-sm text-gray-500">Your weekly training schedule</p>
      </div>

      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        {Array.from({ length: client.planDurationWeeks || 4 }, (_, i) => i + 1).map((week) => (
          <Button
            key={week}
            variant={selectedWeek === week ? "default" : "outline"}
            size="sm"
            className={`rounded-full shrink-0 ${
              selectedWeek === week
                ? "bg-pink-500 hover:bg-pink-600 text-white"
                : "border-pink-200 text-pink-700 hover:bg-pink-50"
            }`}
            onClick={() => setSelectedWeek(week)}
          >
            W{week}
          </Button>
        ))}
      </div>

      {weekWorkouts.length === 0 ? (
        <Card className="border-pink-100 rounded-2xl">
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
            const dayStats = getDayCompletionStats(workout);
            const dayProgressPercent = dayStats.total > 0 ? Math.round((dayStats.completed / dayStats.total) * 100) : 0;
            const isDayComplete = dayStats.total > 0 && dayStats.completed === dayStats.total;

            return (
              <Card key={workout.id} className="border-pink-100 rounded-2xl overflow-hidden shadow-sm">
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
                        className={`text-xs rounded-full ${DAY_TYPE_COLORS[workout.dayType] || "bg-gray-100 text-gray-700"}`}
                      >
                        {workout.dayType.replace(/_/g, " ")}
                      </Badge>
                      {dayStats.total > 0 && (
                        isDayComplete ? (
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        ) : (
                          <span className="text-xs text-gray-500 shrink-0">
                            {dayStats.completed}/{dayStats.total}
                          </span>
                        )
                      )}
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
                    {dayStats.total > 0 && (
                      <div className="mt-3 mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">{dayStats.completed}/{dayStats.total} exercises completed</span>
                          <span className="text-xs font-semibold text-pink-600">{dayProgressPercent}%</span>
                        </div>
                        <Progress value={dayProgressPercent} className="h-2 [&>div]:bg-pink-500" />
                      </div>
                    )}

                    {workout.description && (
                      <p className="text-sm text-gray-600 mt-3 mb-3">{workout.description}</p>
                    )}

                    {isStructured ? (
                      <>
                        <div className="flex flex-wrap items-center gap-2 mt-3 mb-3">
                          {exercisesData.estimatedDuration && (
                            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 rounded-full">
                              <Clock className="w-3 h-3 mr-1" />
                              {exercisesData.estimatedDuration}
                            </Badge>
                          )}
                          {exercisesData.difficulty && (
                            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 rounded-full">
                              {exercisesData.difficulty}
                            </Badge>
                          )}
                          {exercisesData.equipment && (
                            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 rounded-full">
                              {exercisesData.equipment}
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-3">
                          {exercisesData.sections.map((section: any, sIdx: number) => {
                            const sConfig = SECTION_TYPE_CONFIG[section.type] || SECTION_TYPE_CONFIG.main;
                            const SectionIcon = sConfig.icon;
                            return (
                              <div key={sIdx} className={`${sConfig.bg} border ${sConfig.border} rounded-xl p-3`}>
                                <div className="flex items-center gap-2 mb-2">
                                  <SectionIcon className={`w-4 h-4 ${sConfig.text}`} />
                                  <span className={`text-xs font-bold uppercase tracking-wide ${sConfig.text}`}>
                                    {section.name || section.type}
                                  </span>
                                  {section.duration && (
                                    <span className="text-xs text-gray-500 ml-auto">{section.duration}</span>
                                  )}
                                </div>
                                {section.exercises && (
                                  <div className="space-y-2">
                                    {section.exercises.map((ex: any, eIdx: number) => {
                                      const completed = isExerciseCompleted(workout.id, workout.dayNumber, sIdx, eIdx);
                                      return (
                                        <div key={eIdx} className="flex items-start gap-2.5 bg-white/70 rounded-lg p-2.5">
                                          <Checkbox
                                            checked={completed}
                                            onCheckedChange={(checked) => {
                                              toggleCompletionMutation.mutate({
                                                planId: workout.id,
                                                weekNumber: workout.weekNumber,
                                                dayNumber: workout.dayNumber,
                                                sectionIndex: sIdx,
                                                exerciseIndex: eIdx,
                                                exerciseName: ex.name,
                                                completed: !!checked,
                                              });
                                            }}
                                            className="mt-0.5 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                                          />
                                          <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium ${completed ? "line-through text-gray-400" : "text-gray-900"}`}>
                                              {ex.name}
                                            </p>
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                              {ex.sets && (
                                                <span className="text-xs text-gray-500">{ex.sets} sets</span>
                                              )}
                                              {ex.reps && (
                                                <span className="text-xs text-gray-500">× {ex.reps}</span>
                                              )}
                                              {ex.duration && (
                                                <span className="text-xs text-gray-500">{ex.duration}</span>
                                              )}
                                              {ex.restSeconds && (
                                                <span className="text-xs text-gray-400">Rest: {ex.restSeconds}s</span>
                                              )}
                                            </div>
                                            {ex.notes && (
                                              <p className="text-xs text-gray-400 mt-1 italic">{ex.notes}</p>
                                            )}
                                          </div>
                                          {ex.videoUrl && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveVideo(activeVideo === ex.videoUrl ? null : ex.videoUrl);
                                              }}
                                              className="shrink-0 w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition-colors"
                                            >
                                              <Play className="w-3.5 h-3.5 text-pink-600" />
                                            </button>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : legacyExercises.length > 0 ? (
                      <div className="space-y-2 mt-3">
                        {legacyExercises.map((ex, eIdx) => (
                          <div key={eIdx} className="bg-pink-50/50 rounded-lg p-3">
                            <p className="text-sm font-medium text-gray-900">{ex.name}</p>
                            <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                              {ex.sets && <span>{ex.sets} sets</span>}
                              {ex.reps && <span>× {ex.reps}</span>}
                              {ex.duration && <span>{ex.duration}</span>}
                            </div>
                            {ex.notes && <p className="text-xs text-gray-400 mt-1 italic">{ex.notes}</p>}
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {workout.coachNotes && (
                      <div className="mt-3 bg-pink-50 border border-pink-200 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Heart className="w-3.5 h-3.5 text-pink-500" />
                          <span className="text-xs font-bold text-pink-700">Coach Notes</span>
                        </div>
                        <p className="text-xs text-gray-700 whitespace-pre-line">{workout.coachNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {activeVideo && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setActiveVideo(null)}>
          <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video">
              {getYouTubeId(activeVideo) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(activeVideo)}?autoplay=1`}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay"
                />
              ) : (
                <video src={activeVideo} controls autoPlay className="w-full h-full" />
              )}
            </div>
            <div className="p-3 text-center">
              <Button variant="outline" size="sm" onClick={() => setActiveVideo(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderNutritionView = () => (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Nutrition Plan</h2>
        <p className="text-sm text-gray-500">Your personalized eating strategy</p>
      </div>

      {nutritionOverview && (
        <Card className="border-pink-200 rounded-2xl shadow-sm mb-4 bg-gradient-to-br from-pink-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-pink-500" />
              <h3 className="font-bold text-gray-900">The One Rule</h3>
            </div>

            {nutritionOverview.proteinGoal && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Daily Protein Target</span>
                  <span className="text-sm font-bold text-pink-600">{nutritionOverview.proteinGoal}g</span>
                </div>
                <Progress value={70} className="h-2 [&>div]:bg-pink-500" />
              </div>
            )}

            {nutritionOverview.philosophy && (
              <p className="text-xs text-gray-600 bg-white rounded-lg p-2.5 border border-pink-100 mb-3">
                💡 {nutritionOverview.philosophy}
              </p>
            )}

            {!nutritionOverview.philosophy && (
              <p className="text-xs text-gray-600 bg-white rounded-lg p-2.5 border border-pink-100 mb-3">
                💡 No calorie counting — focus on protein-first meals and listen to your body.
              </p>
            )}

            {(nutritionOverview.supplements || nutritionOverview.supplementStack) && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1.5">Supplement Stack</p>
                <div className="flex flex-wrap gap-1.5">
                  {(nutritionOverview.supplements || nutritionOverview.supplementStack || []).map((sup: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 rounded-full">
                      {sup}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(planData.nutritionPlan || []).length === 0 ? (
        <Card className="border-pink-100 rounded-2xl">
          <CardContent className="pt-8 pb-8 text-center">
            <Apple className="w-12 h-12 text-pink-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Plan Being Prepared</h3>
            <p className="text-gray-500 text-sm">
              Zoe is working on your nutrition plan. Check back soon!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {nutritionByMeal.map(({ mealType, plan }) => {
            if (!plan || !plan.options || plan.options.length === 0) return null;
            return (
              <div key={mealType}>
                <h3 className="font-bold text-gray-900 text-sm mb-2">
                  {MEAL_TYPE_LABELS[mealType] || mealType}
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                  {plan.options.map((option: any, oIdx: number) => {
                    const mealKey = `${mealType}-${oIdx}`;
                    const isExpanded = expandedMeals.has(mealKey);
                    return (
                      <Card key={oIdx} className="border-pink-100 rounded-2xl shadow-sm min-w-[260px] max-w-[280px] shrink-0">
                        <button
                          className="w-full text-left p-3"
                          onClick={() => toggleMeal(mealKey)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 mb-1">{option.name}</p>
                              {option.description && (
                                <p className="text-xs text-gray-500 line-clamp-2 mb-2">{option.description}</p>
                              )}
                              <div className="flex flex-wrap gap-1">
                                {option.calories && (
                                  <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-600 border-orange-200 rounded-full">
                                    {option.calories} cal
                                  </Badge>
                                )}
                                {option.protein && (
                                  <Badge variant="outline" className="text-[10px] bg-green-50 text-green-600 border-green-200 rounded-full">
                                    P: {option.protein}g
                                  </Badge>
                                )}
                                {option.carbs && (
                                  <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200 rounded-full">
                                    C: {option.carbs}g
                                  </Badge>
                                )}
                                {option.fat && (
                                  <Badge variant="outline" className="text-[10px] bg-yellow-50 text-yellow-600 border-yellow-200 rounded-full">
                                    F: {option.fat}g
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
                                  {option.ingredients.map((ing: string, i: number) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <span className="text-pink-400 mt-0.5">•</span>
                                      {ing}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {(option.quickInstructions || option.instructions) && (
                              <div className="mt-2">
                                <p className="text-xs font-semibold text-gray-700 mb-1">How to Make</p>
                                <p className="text-xs text-gray-600 whitespace-pre-line">
                                  {option.quickInstructions || option.instructions}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
                {plan.tips && typeof plan.tips === 'string' && !plan.tips.startsWith('{') && (
                  <p className="text-xs text-gray-500 mt-1 italic px-1">{plan.tips}</p>
                )}
              </div>
            );
          })}

          {nutritionOverview?.weeklyPrepTips?.length > 0 && (
            <Card className="border-green-100 bg-green-50/50 rounded-2xl">
              <CardContent className="pt-4 pb-4">
                <h3 className="font-bold text-gray-900 text-sm mb-2">Weekly Meal Prep Tips</h3>
                <ul className="space-y-1.5">
                  {nutritionOverview.weeklyPrepTips.map((tip: string, i: number) => (
                    <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {nutritionOverview?.snackIdeas?.length > 0 && (
            <Card className="border-amber-100 bg-amber-50/50 rounded-2xl">
              <CardContent className="pt-4 pb-4">
                <h3 className="font-bold text-gray-900 text-sm mb-2">Quick Snack Ideas</h3>
                <div className="flex flex-wrap gap-2">
                  {nutritionOverview.snackIdeas.map((snack: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs bg-white text-amber-700 border-amber-200 rounded-full">
                      {snack}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );

  const renderMessagesView = () => (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Messages</h2>
        <p className="text-sm text-gray-500">Chat with your coach</p>
      </div>

      <Card className="border-pink-100 overflow-hidden rounded-2xl shadow-sm">
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
    </div>
  );

  const renderCheckinView = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Daily Check-in</h2>
        <p className="text-sm text-gray-500">How are you doing today?</p>
      </div>

      <Card className="border-pink-100 rounded-2xl shadow-sm">
        <CardContent className="p-5 space-y-5">
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
              <Card key={checkin.id} className="border-pink-100/50 rounded-2xl">
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
                      <Badge className="bg-green-100 text-green-700 text-xs rounded-full">
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
    </div>
  );

  const navItems: { view: ActiveView; icon: typeof Calendar; label: string; badge?: number }[] = [
    { view: "today", icon: Calendar, label: "Today" },
    { view: "workouts", icon: Dumbbell, label: "Workouts" },
    { view: "nutrition", icon: Apple, label: "Nutrition" },
    { view: "messages", icon: MessageCircle, label: "Messages", badge: planData.unreadMessages || 0 },
    { view: "checkin", icon: ClipboardCheck, label: "Check-in" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pb-40">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="text-center mb-5">
          <h1 className="text-xl font-bold text-gray-900">
            {activeView === "today" ? "My Coaching" : 
             activeView === "workouts" ? "My Coaching" :
             activeView === "nutrition" ? "My Coaching" :
             activeView === "messages" ? "My Coaching" : "My Coaching"}
          </h1>
          <p className="text-xs text-pink-600 font-medium mt-0.5">High Performance Operating System</p>
        </div>

        {activeView === "today" && renderTodayView()}
        {activeView === "workouts" && renderWorkoutsView()}
        {activeView === "nutrition" && renderNutritionView()}
        {activeView === "messages" && renderMessagesView()}
        {activeView === "checkin" && renderCheckinView()}

        <div className="mt-6 mb-4">
          <div className="bg-white border border-pink-100 rounded-2xl shadow-sm p-1.5 flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setActiveView(item.view)}
                  className={`relative flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-pink-500 text-white shadow-sm"
                      : "text-gray-500 hover:text-pink-500"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                  {item.badge && item.badge > 0 && !isActive && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
