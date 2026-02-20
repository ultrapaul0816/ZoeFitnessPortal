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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StrategicWelcome } from "@/components/onboarding/StrategicWelcome";
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
  Wand2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Crown,
  Star,
  LogOut,
  BookOpen,
} from "lucide-react";
import { MyWellnessBlueprint } from "@/components/coaching/MyWellnessBlueprint";
import type { User as UserType } from "@shared/schema";

type ActiveView = "today" | "workouts" | "nutrition" | "messages" | "checkin" | "blueprint";

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
  formData?: any;
  responses?: any;
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

function getFormData(fr: FormResponse) {
  return fr.formData || fr.responses || null;
}

function extractQuestionnaireData(formResponses?: FormResponse[], coachingType?: string) {
  if (!formResponses || formResponses.length === 0) return null;
  
  const privateQ = formResponses.find(f => f.formType === "private_coaching_questionnaire");
  if (privateQ) return getFormData(privateQ);
  
  const lifestyleQ = formResponses.find(f => f.formType === "lifestyle_questionnaire");
  if (lifestyleQ) return getFormData(lifestyleQ);
  
  if (formResponses.length > 0) return getFormData(formResponses[0]);
  
  return null;
}

// ============================================================================
// INTAKE FORM WIZARD - Shown to newly enrolled clients
// ============================================================================

const MEDICAL_CONDITIONS = [
  "Shortness of breath",
  "Chest pain",
  "Vaginal bleeding",
  "Dizziness or faintness",
  "Headaches",
  "Muscle weakness",
  "Calf pain or swelling",
  "Preterm labor signs",
  "Decreased fetal movement",
  "Leaking amniotic fluid",
  "Heart palpitations",
  "Severe nausea/vomiting",
  "Abdominal pain",
  "Blurred vision",
  "Swelling (face/hands)",
  "High blood pressure",
  "Gestational diabetes",
  "Placenta previa",
  "Pre-eclampsia",
  "Cervical insufficiency",
  "Multiple pregnancy (twins+)",
  "Epilepsy",
  "Anemia",
];

const MEDICAL_FLAGS = [
  "Pelvic girdle pain",
  "Sciatica",
  "High blood pressure",
  "Gestational diabetes",
  "Cervical concerns",
];

const DISCOMFORT_AREAS = [
  "Lower back",
  "Hips",
  "Neck/shoulders",
  "Knees",
  "Feet/ankles",
  "Wrists/hands",
  "Ribs",
  "Round ligament",
  "General fatigue",
  "Pelvic pain",
];

const DISCOMFORT_TIMING = [
  "In the morning",
  "After sitting for long",
  "After standing for long",
  "During sleep",
  "At end of day",
  "During workouts",
  "Random/unpredictable",
];

const EXERCISE_HISTORY = [
  "Sedentary (little or no exercise)",
  "Light (walking, yoga, 1-2x/week)",
  "Moderate (regular exercise 3-4x/week)",
  "Active (daily exercise, varied)",
  "Athletic (competitive/high intensity)",
];

const CORE_SYMPTOMS = [
  "Heaviness or pressure in pelvic area",
  "Leaking when coughing, sneezing, or laughing",
  "Difficulty holding in urine",
  "Doming or coning of the belly during movement",
  "None of the above",
];

const HELP_AREAS = [
  "Pain relief & comfort",
  "Strength & muscle tone",
  "Posture improvement",
  "Birth preparation",
  "Staying active safely",
  "General comfort & wellbeing",
];

const LIFESTYLE_STEP_META = [
  { icon: "Heart", subtitle: "Let's start with the basics", desc: "We'll use this to personalise your experience." },
  { icon: "Shield", subtitle: "Just in case", desc: "Someone we can reach if needed during sessions." },
  { icon: "Calendar", subtitle: "Your pregnancy journey", desc: "This helps Zoe tailor everything to your stage." },
  { icon: "Activity", subtitle: "Your health background", desc: "Select anything you've experienced — no judgement, just safety." },
  { icon: "Activity", subtitle: "Doctor's notes", desc: "Anything your healthcare provider has flagged for us to know." },
  { icon: "Dumbbell", subtitle: "Body & movement", desc: "Understanding where you're at helps us meet you there." },
  { icon: "Target", subtitle: "Core health & goals", desc: "Let's understand what matters most to you right now." },
  { icon: "ClipboardCheck", subtitle: "Medications & history", desc: "This ensures your plan is safe and personalised." },
  { icon: "Sparkles", subtitle: "Your goals & lifestyle", desc: "Tell us what you'd love to achieve with coaching." },
  { icon: "Star", subtitle: "Almost done!", desc: "A few final details to complete your profile." },
];

const HEALTH_STEP_META = [
  { icon: "Heart", subtitle: "Your details", desc: "We'll pre-fill what we can from your earlier answers." },
  { icon: "Shield", subtitle: "Participant declaration", desc: "A standard acknowledgement for your safety." },
  { icon: "ClipboardCheck", subtitle: "Medical clearance", desc: "Your doctor's confirmation that exercise is safe for you." },
];

function IntakeFormWizard({ clientId, onComplete, onLogout, userName }: {
  clientId: string;
  onComplete: () => void;
  onLogout: () => void;
  userName: string;
}) {
  const { toast } = useToast();
  const [currentForm, setCurrentForm] = useState<"lifestyle" | "health">("lifestyle");
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Lifestyle form state
  const [lifestyle, setLifestyle] = useState({
    fullName: "",
    age: "",
    whatsappNumber: "",
    email: "",
    emergencyContactName: "",
    emergencyRelationship: "",
    emergencyContactNumber: "",
    pregnancyNumber: "",
    dueDate: "",
    trimester: "",
    medicalConditions: [] as string[],
    medicalConditionsOther: "",
    medicalFlags: [] as string[],
    medicalFlagsOther: "",
    discomfortAreas: [] as string[],
    discomfortTiming: "",
    exerciseHistory: "",
    movementFeels: "",
    coreSymptoms: [] as string[],
    helpAreas: [] as string[],
    takingMedications: "",
    medicationDetails: "",
    previousPregnancies: "",
    mainConcerns: "",
    mainGoals: "",
    currentLifestyle: "",
    hearAbout: "",
    referredBy: "",
    usingPrograms: "",
    programDetails: "",
    consent: false,
  });

  // Health evaluation form state
  const [health, setHealth] = useState({
    fullName: "",
    age: "",
    phone: "",
    email: "",
    dueDate: "",
    trimester: "",
    participantDeclaration: "",
    doctorName: "",
    doctorQualification: "",
    clinicName: "",
    doctorContact: "",
    clearanceDecision: "",
    restrictionDetails: "",
  });

  const updateLifestyle = (field: string, value: any) => setLifestyle(prev => ({ ...prev, [field]: value }));
  const updateHealth = (field: string, value: any) => setHealth(prev => ({ ...prev, [field]: value }));

  const toggleArrayField = (setter: any, field: string, value: string) => {
    setter((prev: any) => {
      const arr = prev[field] as string[];
      return { ...prev, [field]: arr.includes(value) ? arr.filter((v: string) => v !== value) : [...arr, value] };
    });
  };

  const submitForm = async (formType: string, responses: any) => {
    setSubmitting(true);
    try {
      const res = await apiRequest("POST", "/api/coaching/form-responses", { formType, responses });
      const data = await res.json();
      if (formType === "lifestyle_questionnaire") {
        setCurrentForm("health");
        setCurrentStep(0);
        toast({ title: "Form saved!", description: "Now please complete the Health Evaluation form." });
      } else {
        toast({ title: "All forms submitted!", description: "Zoe will review your information and create your plan." });
        onComplete();
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to submit form", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const lifestyleSteps = [
    { title: "Personal Info", fields: ["fullName", "age", "whatsappNumber", "email"] },
    { title: "Emergency Contact", fields: ["emergencyContactName", "emergencyRelationship", "emergencyContactNumber"] },
    { title: "Pregnancy Info", fields: ["pregnancyNumber", "dueDate", "trimester"] },
    { title: "Medical Conditions", fields: ["medicalConditions"] },
    { title: "Medical Flags", fields: ["medicalFlags"] },
    { title: "Discomfort & Movement", fields: ["discomfortAreas", "discomfortTiming", "exerciseHistory", "movementFeels"] },
    { title: "Core & Goals", fields: ["coreSymptoms", "helpAreas"] },
    { title: "Medications & History", fields: ["takingMedications", "previousPregnancies"] },
    { title: "Goals & Lifestyle", fields: ["mainConcerns", "mainGoals", "currentLifestyle"] },
    { title: "Final Details", fields: ["hearAbout", "usingPrograms", "consent"] },
  ];

  const healthSteps = [
    { title: "Your Details", fields: ["fullName", "age", "phone", "email", "dueDate", "trimester"] },
    { title: "Declaration", fields: ["participantDeclaration"] },
    { title: "Medical Clearance", fields: ["doctorName", "doctorQualification", "clinicName", "doctorContact", "clearanceDecision"] },
  ];

  const steps = currentForm === "lifestyle" ? lifestyleSteps : healthSteps;
  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const renderLifestyleStep = () => {
    switch (currentStep) {
      case 0: return (
        <div className="space-y-4">
          <div><label className="text-sm font-medium text-gray-700">Full Name *</label><Input value={lifestyle.fullName} onChange={e => updateLifestyle("fullName", e.target.value)} placeholder="Your full name" /></div>
          <div><label className="text-sm font-medium text-gray-700">Age *</label><Input value={lifestyle.age} onChange={e => updateLifestyle("age", e.target.value)} placeholder="Your age" /></div>
          <div><label className="text-sm font-medium text-gray-700">WhatsApp Number *</label><Input value={lifestyle.whatsappNumber} onChange={e => updateLifestyle("whatsappNumber", e.target.value)} placeholder="+91 ..." /></div>
          <div><label className="text-sm font-medium text-gray-700">Email Address *</label><Input value={lifestyle.email} onChange={e => updateLifestyle("email", e.target.value)} placeholder="your@email.com" type="email" /></div>
        </div>
      );
      case 1: return (
        <div className="space-y-4">
          <div><label className="text-sm font-medium text-gray-700">Emergency Contact Name *</label><Input value={lifestyle.emergencyContactName} onChange={e => updateLifestyle("emergencyContactName", e.target.value)} /></div>
          <div><label className="text-sm font-medium text-gray-700">Relationship to You *</label><Input value={lifestyle.emergencyRelationship} onChange={e => updateLifestyle("emergencyRelationship", e.target.value)} placeholder="e.g., Husband, Mother" /></div>
          <div><label className="text-sm font-medium text-gray-700">Emergency Contact Number *</label><Input value={lifestyle.emergencyContactNumber} onChange={e => updateLifestyle("emergencyContactNumber", e.target.value)} /></div>
        </div>
      );
      case 2: return (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Is this your: *</label>
            <div className="space-y-2 mt-2">
              {["First pregnancy", "Second pregnancy", "Third or more"].map(opt => (
                <label key={opt} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${lifestyle.pregnancyNumber === opt ? "border-pink-400 bg-pink-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <input type="radio" name="pregnancyNumber" value={opt} checked={lifestyle.pregnancyNumber === opt} onChange={() => updateLifestyle("pregnancyNumber", opt)} className="accent-pink-500" />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div><label className="text-sm font-medium text-gray-700">Expected Due Date *</label><Input type="date" value={lifestyle.dueDate} onChange={e => updateLifestyle("dueDate", e.target.value)} /></div>
          <div>
            <label className="text-sm font-medium text-gray-700">Current Trimester *</label>
            <div className="space-y-2 mt-2">
              {["First trimester (0–12 weeks)", "Second trimester (13–26 weeks)", "Third trimester (27–40 weeks)"].map(opt => (
                <label key={opt} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${lifestyle.trimester === opt ? "border-pink-400 bg-pink-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <input type="radio" name="trimester" value={opt} checked={lifestyle.trimester === opt} onChange={() => updateLifestyle("trimester", opt)} className="accent-pink-500" />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      );
      case 3: return (
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Have you experienced any of the following? *</label>
          <p className="text-xs text-gray-500">Select all that apply</p>
          <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2">
            {MEDICAL_CONDITIONS.map(cond => (
              <label key={cond} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer text-sm transition-all ${lifestyle.medicalConditions.includes(cond) ? "border-pink-400 bg-pink-50" : "border-gray-200"}`}>
                <Checkbox checked={lifestyle.medicalConditions.includes(cond)} onCheckedChange={() => toggleArrayField(setLifestyle, "medicalConditions", cond)} />
                {cond}
              </label>
            ))}
            <label className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer text-sm ${lifestyle.medicalConditions.includes("None of the above") ? "border-pink-400 bg-pink-50" : "border-gray-200"}`}>
              <Checkbox checked={lifestyle.medicalConditions.includes("None of the above")} onCheckedChange={() => toggleArrayField(setLifestyle, "medicalConditions", "None of the above")} />
              None of the above
            </label>
          </div>
          <Input value={lifestyle.medicalConditionsOther} onChange={e => updateLifestyle("medicalConditionsOther", e.target.value)} placeholder="Other (please specify)" />
        </div>
      );
      case 4: return (
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Any medical flags your doctor has mentioned? *</label>
          <div className="grid grid-cols-1 gap-2 mt-2">
            {MEDICAL_FLAGS.map(flag => (
              <label key={flag} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer text-sm transition-all ${lifestyle.medicalFlags.includes(flag) ? "border-pink-400 bg-pink-50" : "border-gray-200"}`}>
                <Checkbox checked={lifestyle.medicalFlags.includes(flag)} onCheckedChange={() => toggleArrayField(setLifestyle, "medicalFlags", flag)} />
                {flag}
              </label>
            ))}
            <label className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer text-sm ${lifestyle.medicalFlags.includes("None") ? "border-pink-400 bg-pink-50" : "border-gray-200"}`}>
              <Checkbox checked={lifestyle.medicalFlags.includes("None")} onCheckedChange={() => toggleArrayField(setLifestyle, "medicalFlags", "None")} />
              None
            </label>
          </div>
          <Input className="mt-2" value={lifestyle.medicalFlagsOther} onChange={e => updateLifestyle("medicalFlagsOther", e.target.value)} placeholder="Other (please specify)" />
        </div>
      );
      case 5: return (
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700">Where do you feel discomfort most days? *</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {DISCOMFORT_AREAS.map(area => (
                <label key={area} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-sm transition-all ${lifestyle.discomfortAreas.includes(area) ? "border-pink-400 bg-pink-50" : "border-gray-200"}`}>
                  <Checkbox checked={lifestyle.discomfortAreas.includes(area)} onCheckedChange={() => toggleArrayField(setLifestyle, "discomfortAreas", area)} />
                  {area}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">When is it usually worse? *</label>
            <div className="space-y-2 mt-2">
              {DISCOMFORT_TIMING.map(opt => (
                <label key={opt} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer text-sm transition-all ${lifestyle.discomfortTiming === opt ? "border-pink-400 bg-pink-50" : "border-gray-200"}`}>
                  <input type="radio" name="discomfortTiming" checked={lifestyle.discomfortTiming === opt} onChange={() => updateLifestyle("discomfortTiming", opt)} className="accent-pink-500" />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Movement & exercise history *</label>
            <div className="space-y-2 mt-2">
              {EXERCISE_HISTORY.map(opt => (
                <label key={opt} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer text-sm transition-all ${lifestyle.exerciseHistory === opt ? "border-pink-400 bg-pink-50" : "border-gray-200"}`}>
                  <input type="radio" name="exerciseHistory" checked={lifestyle.exerciseHistory === opt} onChange={() => updateLifestyle("exerciseHistory", opt)} className="accent-pink-500" />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Right now, movement feels: *</label>
            <div className="space-y-2 mt-2">
              {["Comforting", "Neutral", "Intimidating", "Pain-provoking"].map(opt => (
                <label key={opt} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer text-sm transition-all ${lifestyle.movementFeels === opt ? "border-pink-400 bg-pink-50" : "border-gray-200"}`}>
                  <input type="radio" name="movementFeels" checked={lifestyle.movementFeels === opt} onChange={() => updateLifestyle("movementFeels", opt)} className="accent-pink-500" />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        </div>
      );
      case 6: return (
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700">Pressure & core awareness check *</label>
            <div className="space-y-2 mt-2">
              {CORE_SYMPTOMS.map(opt => (
                <label key={opt} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer text-sm transition-all ${lifestyle.coreSymptoms.includes(opt) ? "border-pink-400 bg-pink-50" : "border-gray-200"}`}>
                  <Checkbox checked={lifestyle.coreSymptoms.includes(opt)} onCheckedChange={() => toggleArrayField(setLifestyle, "coreSymptoms", opt)} />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">What do you want help with right now? *</label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {HELP_AREAS.map(opt => (
                <label key={opt} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer text-sm transition-all ${lifestyle.helpAreas.includes(opt) ? "border-pink-400 bg-pink-50" : "border-gray-200"}`}>
                  <Checkbox checked={lifestyle.helpAreas.includes(opt)} onCheckedChange={() => toggleArrayField(setLifestyle, "helpAreas", opt)} />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        </div>
      );
      case 7: return (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Are you currently taking any medications or supplements? *</label>
            <div className="flex gap-3 mt-2">
              {["Yes", "No"].map(opt => (
                <label key={opt} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer text-sm transition-all ${lifestyle.takingMedications === opt ? "border-pink-400 bg-pink-50" : "border-gray-200"}`}>
                  <input type="radio" name="medications" checked={lifestyle.takingMedications === opt} onChange={() => updateLifestyle("takingMedications", opt)} className="accent-pink-500" />
                  {opt}
                </label>
              ))}
            </div>
            {lifestyle.takingMedications === "Yes" && (
              <Textarea className="mt-2" value={lifestyle.medicationDetails} onChange={e => updateLifestyle("medicationDetails", e.target.value)} placeholder="Please state the name and dosage" rows={3} />
            )}
          </div>
          <div><label className="text-sm font-medium text-gray-700">Previous pregnancies, births, or postnatal experiences? *</label><Textarea value={lifestyle.previousPregnancies} onChange={e => updateLifestyle("previousPregnancies", e.target.value)} placeholder="Share any relevant history..." rows={3} /></div>
        </div>
      );
      case 8: return (
        <div className="space-y-4">
          <div><label className="text-sm font-medium text-gray-700">What concerns you most? *</label><Textarea value={lifestyle.mainConcerns} onChange={e => updateLifestyle("mainConcerns", e.target.value)} placeholder="About pregnancy, delivery, or postnatal phase..." rows={3} /></div>
          <div><label className="text-sm font-medium text-gray-700">Main goals with coaching? *</label><Textarea value={lifestyle.mainGoals} onChange={e => updateLifestyle("mainGoals", e.target.value)} placeholder="What do you want to achieve?" rows={3} /></div>
          <div><label className="text-sm font-medium text-gray-700">Describe your current lifestyle *</label><Textarea value={lifestyle.currentLifestyle} onChange={e => updateLifestyle("currentLifestyle", e.target.value)} placeholder="Daily routine, activity level, work..." rows={3} /></div>
        </div>
      );
      case 9: return (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">How did you hear about Zoe?</label>
            <div className="space-y-2 mt-2">
              {["Instagram", "YouTube", "Website", "Friend/word of mouth"].map(opt => (
                <label key={opt} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer text-sm transition-all ${lifestyle.hearAbout === opt ? "border-pink-400 bg-pink-50" : "border-gray-200"}`}>
                  <input type="radio" name="hearAbout" checked={lifestyle.hearAbout === opt} onChange={() => updateLifestyle("hearAbout", opt)} className="accent-pink-500" />
                  {opt}
                </label>
              ))}
            </div>
            {lifestyle.hearAbout === "Friend/word of mouth" && (
              <Input className="mt-2" value={lifestyle.referredBy} onChange={e => updateLifestyle("referredBy", e.target.value)} placeholder="Who referred you?" />
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Are you using any of Zoe's online programs?</label>
            <div className="flex gap-3 mt-2">
              {["Yes", "No"].map(opt => (
                <label key={opt} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer text-sm transition-all ${lifestyle.usingPrograms === opt ? "border-pink-400 bg-pink-50" : "border-gray-200"}`}>
                  <input type="radio" name="usingPrograms" checked={lifestyle.usingPrograms === opt} onChange={() => updateLifestyle("usingPrograms", opt)} className="accent-pink-500" />
                  {opt}
                </label>
              ))}
            </div>
            {lifestyle.usingPrograms === "Yes" && (
              <Input className="mt-2" value={lifestyle.programDetails} onChange={e => updateLifestyle("programDetails", e.target.value)} placeholder="Which program?" />
            )}
          </div>
          <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${lifestyle.consent ? "border-pink-400 bg-pink-50" : "border-gray-200"}`}>
            <Checkbox checked={lifestyle.consent} onCheckedChange={(checked) => updateLifestyle("consent", !!checked)} className="mt-0.5" />
            <span className="text-sm">I consent to being contacted by Zoe via WhatsApp and email for coaching purposes. *</span>
          </label>
        </div>
      );
      default: return null;
    }
  };

  const renderHealthStep = () => {
    switch (currentStep) {
      case 0: return (
        <div className="space-y-4">
          <div><label className="text-sm font-medium text-gray-700">Full Name *</label><Input value={health.fullName} onChange={e => updateHealth("fullName", e.target.value)} /></div>
          <div><label className="text-sm font-medium text-gray-700">Age *</label><Input value={health.age} onChange={e => updateHealth("age", e.target.value)} /></div>
          <div><label className="text-sm font-medium text-gray-700">Phone Number *</label><Input value={health.phone} onChange={e => updateHealth("phone", e.target.value)} /></div>
          <div><label className="text-sm font-medium text-gray-700">Email Address *</label><Input value={health.email} onChange={e => updateHealth("email", e.target.value)} type="email" /></div>
          <div><label className="text-sm font-medium text-gray-700">Expected Due Date *</label><Input type="date" value={health.dueDate} onChange={e => updateHealth("dueDate", e.target.value)} /></div>
          <div>
            <label className="text-sm font-medium text-gray-700">Current Trimester *</label>
            <div className="space-y-2 mt-2">
              {["First (0–12 weeks)", "Second (13–26 weeks)", "Third (27–40 weeks)"].map(opt => (
                <label key={opt} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer text-sm transition-all ${health.trimester === opt ? "border-pink-400 bg-pink-50" : "border-gray-200"}`}>
                  <input type="radio" name="healthTrimester" checked={health.trimester === opt} onChange={() => updateHealth("trimester", opt)} className="accent-pink-500" />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        </div>
      );
      case 1: return (
        <div className="space-y-4">
          <div className="bg-pink-50 p-4 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-2">Participant Declaration</h3>
            <p className="text-sm text-gray-600 mb-4">I understand that I am voluntarily participating in a prenatal/postnatal fitness program. I confirm that I have consulted with my healthcare provider and have been cleared for exercise. I take full responsibility for my participation and will inform my coach of any changes in my health status.</p>
          </div>
          <div className="space-y-2">
            {["I agree", "I do not agree"].map(opt => (
              <label key={opt} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${health.participantDeclaration === opt ? "border-pink-400 bg-pink-50" : "border-gray-200"}`}>
                <input type="radio" name="declaration" checked={health.participantDeclaration === opt} onChange={() => updateHealth("participantDeclaration", opt)} className="accent-pink-500" />
                <span className="text-sm font-medium">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-xl mb-2">
            <h3 className="font-semibold text-gray-900 mb-1">Medical Clearance</h3>
            <p className="text-sm text-gray-600">Please have your doctor/medical professional complete this section, or enter their details and clearance decision.</p>
          </div>
          <div><label className="text-sm font-medium text-gray-700">Doctor's Name *</label><Input value={health.doctorName} onChange={e => updateHealth("doctorName", e.target.value)} /></div>
          <div><label className="text-sm font-medium text-gray-700">Qualification / Speciality *</label><Input value={health.doctorQualification} onChange={e => updateHealth("doctorQualification", e.target.value)} placeholder="e.g., OB-GYN" /></div>
          <div><label className="text-sm font-medium text-gray-700">Clinic / Hospital Name *</label><Input value={health.clinicName} onChange={e => updateHealth("clinicName", e.target.value)} /></div>
          <div><label className="text-sm font-medium text-gray-700">Doctor's Contact (phone or email) *</label><Input value={health.doctorContact} onChange={e => updateHealth("doctorContact", e.target.value)} /></div>
          <div>
            <label className="text-sm font-medium text-gray-700">Medical Clearance Decision *</label>
            <div className="space-y-2 mt-2">
              {["Cleared with no restrictions", "Cleared with restrictions/considerations", "Not cleared"].map(opt => (
                <label key={opt} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${health.clearanceDecision === opt ? "border-pink-400 bg-pink-50" : "border-gray-200"}`}>
                  <input type="radio" name="clearance" checked={health.clearanceDecision === opt} onChange={() => updateHealth("clearanceDecision", opt)} className="accent-pink-500" />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
            {health.clearanceDecision === "Cleared with restrictions/considerations" && (
              <Textarea className="mt-2" value={health.restrictionDetails} onChange={e => updateHealth("restrictionDetails", e.target.value)} placeholder="Please describe the restrictions or considerations..." rows={3} />
            )}
          </div>
        </div>
      );
      default: return null;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      // Submit the current form
      if (currentForm === "lifestyle") {
        submitForm("lifestyle_questionnaire", lifestyle);
      } else {
        submitForm("health_evaluation", health);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {currentForm === "lifestyle" ? "About You" : "Medical Clearance"}
            </h1>
            <p className="text-sm text-gray-500">
              Part {currentForm === "lifestyle" ? "1" : "2"} of 2
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-gray-400">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress dots */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 mb-2">
            {steps.map((_: any, i: number) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i < currentStep ? "bg-pink-400" : i === currentStep ? "bg-pink-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-400">Step {currentStep + 1} of {totalSteps}</p>
        </div>

        {/* Welcome banner on first step */}
        {currentForm === "lifestyle" && currentStep === 0 && (
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-5 rounded-2xl mb-6">
            <h2 className="font-bold text-lg mb-1">Welcome, {userName}!</h2>
            <p className="text-sm text-pink-100">Let's get to know you better so Zoe can create your personalized coaching plan. This takes about 5-10 minutes.</p>
          </div>
        )}

        {/* Form Content */}
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            {/* Section intro */}
            {(() => {
              const meta = currentForm === "lifestyle" ? LIFESTYLE_STEP_META[currentStep] : HEALTH_STEP_META[currentStep];
              if (!meta) return null;
              const IconMap: Record<string, any> = { Heart, Shield, Calendar, Activity, Dumbbell, Target, ClipboardCheck, Sparkles, Star };
              const IconComp = IconMap[meta.icon];
              return (
                <div className="flex items-start gap-3 mb-5 pb-4 border-b border-gray-100">
                  {IconComp && <div className="p-2 bg-pink-50 rounded-xl"><IconComp className="w-5 h-5 text-pink-500" /></div>}
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{meta.subtitle}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{meta.desc}</p>
                  </div>
                </div>
              );
            })()}
            {currentForm === "lifestyle" ? renderLifestyleStep() : renderHealthStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {currentStep > 0 && (
            <Button variant="outline" onClick={handleBack} className="flex-1 rounded-xl">
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={submitting}
            className="flex-1 bg-pink-500 hover:bg-pink-600 text-white rounded-xl"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
            ) : currentStep === totalSteps - 1 ? (
              currentForm === "lifestyle" ? "Save & Continue to Health Form" : "Submit All Forms"
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MyCoaching() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<UserType | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<ActiveView>("today");

  const [selectedWeek, setSelectedWeek] = useState(1);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [magicLinkMode, setMagicLinkMode] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const [showCheckinSuccess, setShowCheckinSuccess] = useState(false);
  const [showWorkoutCelebration, setShowWorkoutCelebration] = useState(false);

  // Strategic Welcome onboarding tracking for private coaching
  const [welcomeCompleted, setWelcomeCompleted] = useState(() => {
    if (!user?.id) return false;
    return localStorage.getItem(`welcome_completed_${user.id}`) === 'true';
  });

  // Terms and Disclaimer acceptance tracking
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

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
        setAuthChecked(true);
        return;
      }
      try {
        const response = await fetch("/api/auth/session", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          // Session expired on server - clear stale local data
          localStorage.removeItem("user");
          setUser(null);
        }
      } catch {
        // Network error - try localStorage as temporary fallback
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch {
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setAuthChecked(true);
    }
    checkAuth();
  }, []);

  // Update welcomeCompleted when user changes
  useEffect(() => {
    if (user?.id) {
      setWelcomeCompleted(localStorage.getItem(`welcome_completed_${user.id}`) === 'true');
    }
  }, [user?.id]);

  // Check if user needs to accept terms/disclaimer
  useEffect(() => {
    if (user && (!user.termsAccepted || !user.disclaimerAccepted)) {
      setShowTermsModal(true);
    }
  }, [user]);

  const handleCoachingLogin = async () => {
    if (!loginEmail || !loginPassword) {
      toast({ title: "Please enter your email and password", variant: "destructive" });
      return;
    }
    setLoginLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        email: loginEmail,
        password: loginPassword,
        termsAccepted: true,
        disclaimerAccepted: true,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      const data = await response.json();
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.authToken) {
        localStorage.setItem("coaching_auth_token", data.authToken);
        localStorage.setItem("coaching_auth_token_expiry", String(Date.now() + 90 * 24 * 60 * 60 * 1000));
      }
      window.location.href = "/my-coaching";
    } catch (error: any) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      setLoginLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!loginEmail) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    setLoginLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/magic-link", { email: loginEmail });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send magic link");
      }
      setMagicLinkSent(true);
      toast({ title: "Magic Link Sent! ✨", description: "Check your email for the login link" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
    } catch (e) {
    }
    localStorage.removeItem("user");
    localStorage.removeItem("coaching_auth_token");
    localStorage.removeItem("coaching_auth_token_expiry");
    setUser(null);
    queryClient.clear();
    toast({ title: "Signed out successfully" });
  };

  const coachingFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("coaching_auth_token");
    const headers: Record<string, string> = { ...(options.headers as Record<string, string> || {}) };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers, credentials: "include" });
  };

  const coachingQueryFn = async ({ queryKey }: { queryKey: string[] }) => {
    const res = await coachingFetch(queryKey[0]);
    if (!res.ok) {
      if (res.status === 401) return null;
      throw new Error(`${res.status}: ${res.statusText}`);
    }
    return res.json();
  };

  const coachingApiRequest = async (method: string, url: string, data?: unknown) => {
    const token = localStorage.getItem("coaching_auth_token");
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (data) headers["Content-Type"] = "application/json";
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status}: ${text}`);
    }
    return res;
  };

  const { data: planData, isLoading: planLoading } = useQuery({
    queryKey: ["/api/coaching/my-plan"],
    queryFn: coachingQueryFn as unknown as () => Promise<MyPlanResponse | null>,
    enabled: !!user,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/coaching/messages"],
    queryFn: coachingQueryFn as unknown as () => Promise<DirectMessage[]>,
    enabled: !!user && !!planData?.client,
    refetchInterval: 10000,
  });

  const { data: checkins = [] } = useQuery({
    queryKey: ["/api/coaching/checkins"],
    queryFn: coachingQueryFn as unknown as () => Promise<CoachingCheckin[]>,
    enabled: !!user && !!planData?.client,
  });

  const { data: todayCheckinData } = useQuery({
    queryKey: ["/api/coaching/checkins/today"],
    queryFn: coachingQueryFn as unknown as () => Promise<{ checkin: CoachingCheckin | null; streak: number }>,
    enabled: !!user && !!planData?.client,
  });

  // Pre-fill check-in form if today's check-in exists
  useEffect(() => {
    if (todayCheckinData?.checkin) {
      const c = todayCheckinData.checkin;
      setCheckinForm({
        mood: c.mood || "",
        energyLevel: c.energyLevel || 5,
        sleepHours: c.sleepHours || 7,
        waterGlasses: c.waterGlasses || 0,
        workoutCompleted: c.workoutCompleted || false,
        workoutNotes: c.workoutNotes || "",
        mealsLogged: (c.mealsLogged as any) || { breakfast: "", lunch: "", snack: "", dinner: "" },
        weight: c.weight || "",
        notes: c.notes || "",
      });
    }
  }, [todayCheckinData?.checkin]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      await coachingApiRequest("POST", "/api/coaching/messages", { content });
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
      await coachingApiRequest("POST", "/api/coaching/checkins", {
        ...data,
        date: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coaching/checkins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/coaching/checkins/today"] });
      const isUpdate = !!todayCheckinData?.checkin;
      // Show celebration overlay
      setShowCheckinSuccess(true);
      setTimeout(() => setShowCheckinSuccess(false), 3500);
      toast({
        title: isUpdate ? "Check-in updated! ✨" : "Check-in submitted! 🎉",
        description: "Zoe will review it soon. You're doing amazing!",
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
      const res = await coachingFetch(`/api/coaching/workout-completions?week=${selectedWeek}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user && !!planData?.client,
  });

  const pendingCompletionRef = useRef<{ planId: string; dayNumber: number; wasCompleting: boolean } | null>(null);

  const toggleCompletionMutation = useMutation({
    mutationFn: async (data: { planId: string; weekNumber: number; dayNumber: number; sectionIndex: number; exerciseIndex: number; exerciseName: string; completed: boolean }) => {
      pendingCompletionRef.current = { planId: data.planId, dayNumber: data.dayNumber, wasCompleting: data.completed };
      await coachingApiRequest("POST", "/api/coaching/workout-completions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coaching/workout-completions"] }).then(() => {
        // Check if the day is now fully complete after data refresh
        const pending = pendingCompletionRef.current;
        if (pending?.wasCompleting) {
          const workout = (planData?.workoutPlan || []).find((w: any) => w.id === pending.planId && w.dayNumber === pending.dayNumber);
          if (workout) {
            const stats = getDayCompletionStats(workout);
            if (stats.total > 0 && stats.completed === stats.total) {
              setShowWorkoutCelebration(true);
              setTimeout(() => setShowWorkoutCelebration(false), 3500);
            }
          }
        }
      });
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

  if (!authChecked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mb-4" />
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-400/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-pink-500/20 border border-pink-500/30 rounded-full px-4 py-1.5 mb-6">
              <Crown className="w-3.5 h-3.5 text-pink-400" />
              <span className="text-xs font-semibold text-pink-300 tracking-wide uppercase">Private Coaching</span>
            </div>
            <div className="w-28 h-20 mx-auto mb-4 flex items-center justify-center bg-white/90 rounded-2xl p-2 shadow-lg">
              <img
                src="/assets/logo.png"
                alt="Stronger With Zoe"
                className="w-full h-full object-contain"
                loading="eager"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-400 text-sm">
              Your personalized coaching experience awaits
            </p>
          </div>

          <Card className="rounded-2xl shadow-2xl border-0 bg-white/10 backdrop-blur-xl border border-white/10">
            <CardContent className="p-6 sm:p-8">
              {magicLinkSent ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-pink-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Check Your Email</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    We've sent a secure login link to <span className="text-pink-400 font-medium">{loginEmail}</span>
                  </p>
                  <Button
                    variant="ghost"
                    onClick={() => { setMagicLinkSent(false); setMagicLinkMode(false); }}
                    className="text-pink-400 hover:text-pink-300 hover:bg-white/5"
                  >
                    Try another method
                  </Button>
                </div>
              ) : magicLinkMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-300 mb-1.5 block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus:border-pink-500 focus:ring-pink-500/20"
                        onKeyDown={(e) => e.key === "Enter" && handleMagicLink()}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleMagicLink}
                    disabled={loginLoading}
                    className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/25 transition-all"
                  >
                    {loginLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
                    Send Magic Link
                  </Button>
                  <button
                    onClick={() => setMagicLinkMode(false)}
                    className="w-full text-sm text-gray-400 hover:text-pink-400 transition-colors pt-1"
                  >
                    Sign in with password instead
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-300 mb-1.5 block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus:border-pink-500 focus:ring-pink-500/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-300 mb-1.5 block">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus:border-pink-500 focus:ring-pink-500/20"
                        onKeyDown={(e) => e.key === "Enter" && handleCoachingLogin()}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    onClick={handleCoachingLogin}
                    disabled={loginLoading}
                    className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/25 transition-all"
                  >
                    {loginLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Sign In
                  </Button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-3 bg-transparent text-gray-500">or</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setMagicLinkMode(true)}
                    className="w-full flex items-center justify-center gap-2 h-11 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/5 hover:border-pink-500/30 transition-all"
                  >
                    <Wand2 className="w-4 h-4 text-pink-400" />
                    Sign in with Magic Link
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-4 text-gray-500">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span className="text-xs">Secure</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-600" />
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" />
                <span className="text-xs">Premium</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-600" />
              <div className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" />
                <span className="text-xs">By Zoe</span>
              </div>
            </div>
          </div>
        </div>
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
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
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
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  const client = planData.client;
  const coachingType = client.coachingType;

  // Terms/Disclaimer Modal
  if (showTermsModal && user) {
    const canProceed = termsAccepted && disclaimerAccepted;

    const handleAcceptTerms = async () => {
      if (!canProceed) {
        toast({
          title: "Please accept both agreements",
          description: "You must accept the Terms & Conditions and acknowledge the Disclaimer to continue.",
          variant: "destructive",
        });
        return;
      }

      try {
        // Call existing accept-terms endpoint
        const termsResponse = await fetch("/api/auth/accept-terms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId: user!.id }),
        });
        if (!termsResponse.ok) throw new Error("Failed to accept terms");

        // Call existing accept-disclaimer endpoint
        const disclaimerResponse = await fetch("/api/auth/accept-disclaimer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId: user!.id }),
        });
        if (!disclaimerResponse.ok) throw new Error("Failed to accept disclaimer");

        // Update local user state
        const updatedUser = { ...user, termsAccepted: true, disclaimerAccepted: true };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setShowTermsModal(false);

        toast({
          title: "Thank you!",
          description: "Your preferences have been saved.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save your preferences. Please try again.",
          variant: "destructive",
        });
      }
    };

    return (
      <Dialog open={showTermsModal} onOpenChange={() => {}}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Welcome to Private Coaching!</DialogTitle>
            <DialogDescription className="text-gray-600">
              Before we begin, please review and accept our terms and conditions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Terms & Conditions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-pink-500" />
                Terms & Conditions
              </h3>
              <div className="text-sm text-gray-700 space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                <p>By using this coaching program, you agree to:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Follow the personalized workout and nutrition plans provided</li>
                  <li>Communicate openly and honestly about your progress and challenges</li>
                  <li>Respect the coach's time and expertise</li>
                  <li>Not share or redistribute the program content without permission</li>
                  <li>Pay all fees as agreed upon for the coaching services</li>
                </ul>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  className="mt-1"
                />
                <span className="text-sm text-gray-700">
                  I have read and agree to the Terms & Conditions
                </span>
              </label>
            </div>

            {/* Disclaimer */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Health & Safety Disclaimer
              </h3>
              <div className="text-sm text-gray-700 space-y-2 bg-pink-50 p-4 rounded-lg border border-pink-200 max-h-48 overflow-y-auto">
                <p className="font-semibold">Important Health Information:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Always consult with your healthcare provider before starting any exercise program</li>
                  <li>Stop exercising immediately if you experience pain, dizziness, or discomfort</li>
                  <li>This program is not a substitute for medical advice or treatment</li>
                  <li>You are responsible for your own health and safety during workouts</li>
                  <li>Modifications may be necessary based on your individual health conditions</li>
                </ul>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={disclaimerAccepted}
                  onCheckedChange={(checked) => setDisclaimerAccepted(checked as boolean)}
                  className="mt-1"
                />
                <span className="text-sm text-gray-700">
                  I acknowledge and understand the health and safety information
                </span>
              </label>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleAcceptTerms}
              disabled={!canProceed}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white py-6 text-lg"
            >
              Continue to My Coaching Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show Strategic Welcome for new private coaching clients (before intake)
  if ((client.status === "enrolled" || client.status === "pending") && coachingType === "private_coaching" && !welcomeCompleted) {
    return (
      <StrategicWelcome
        onComplete={() => {
          if (user?.id) {
            localStorage.setItem(`welcome_completed_${user.id}`, 'true');
            setWelcomeCompleted(true);
          }
        }}
      />
    );
  }

  // Show intake form for enrolled clients (after Strategic Welcome for private coaching)
  if (client.status === "enrolled" || client.status === "pending") {
    return <IntakeFormWizard clientId={client.id} onComplete={() => queryClient.invalidateQueries({ queryKey: ["/api/coaching/my-plan"] })} onLogout={handleLogout} userName={planData.userProfile?.firstName || "there"} />;
  }

  // Show waiting screens for non-active statuses
  if (client.status !== "active") {
    const statusMessages: Record<string, { title: string; description: string; icon: React.ReactNode }> = {
      intake_complete: {
        title: "Zoe is Reviewing Your Information",
        description: "Thanks for completing your intake forms! Zoe will review your information and create your personalized plan. You'll be notified when it's ready.",
        icon: <Eye className="w-10 h-10 text-indigo-500" />,
      },
      plan_generating: {
        title: "Your Plan is Being Created",
        description: "Zoe has reviewed your information and is now creating your personalized workout and nutrition plan. Almost there!",
        icon: <Brain className="w-10 h-10 text-violet-500" />,
      },
      plan_ready: {
        title: "Your Plan is Almost Ready!",
        description: "Your personalized plan has been created and Zoe is doing a final review. You'll be notified very soon!",
        icon: <Sparkles className="w-10 h-10 text-pink-500" />,
      },
      pending_plan: {
        title: "Your Plan is Being Prepared",
        description: "Zoe is crafting your personalized coaching plan. You'll be notified as soon as it's ready!",
        icon: <Sparkles className="w-10 h-10 text-pink-500" />,
      },
      paused: {
        title: "Coaching Paused",
        description: "Your coaching program is currently paused. Reach out to Zoe to resume.",
        icon: <Clock className="w-10 h-10 text-orange-500" />,
      },
      completed: {
        title: "Program Completed!",
        description: "Congratulations on completing your coaching program! What an incredible journey.",
        icon: <Star className="w-10 h-10 text-yellow-500" />,
      },
    };

    const msg = statusMessages[client.status] || {
      title: "Coaching Status",
      description: "Please contact Zoe for more information about your coaching program.",
      icon: <Sparkles className="w-10 h-10 text-pink-500" />,
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
        <div className="max-w-lg mx-auto px-4 pt-12 text-center">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            {msg.icon}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{msg.title}</h1>
          <p className="text-gray-600 mb-6">{msg.description}</p>
          <Button
            className="bg-pink-500 hover:bg-pink-600 text-white"
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  const formData = extractQuestionnaireData(planData.formResponses, planData.client?.coachingType);
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

  const age = sectionA.age || formData?.age || formData?.sectionA_age || formData?.sectionA_dateOfBirth || "";
  const height = sectionA.height || formData?.height || formData?.sectionA_height || "";
  const weight = sectionA.weight || sectionI.targetWeight || formData?.weight || formData?.sectionA_weight || "";
  const doctorClearance = sectionC.doctorClearance || formData?.doctorClearance || formData?.sectionC_medicalClearance;
  const injuries = sectionC.injuries || formData?.injuries || formData?.sectionC_injuries || formData?.medicalConditions || formData?.sectionC_medicalConditions || "";
  const dietaryPreference = sectionE.dietaryPreference || formData?.dietaryPreferences || formData?.sectionE_dietaryPreferences || "";
  const stressRaw = sectionD.stressLevel || formData?.stressLevel || formData?.sectionD_stressLevel || "";
  const stressLevel = parseInt(stressRaw) || 0;
  const stressText = typeof stressRaw === "string" ? stressRaw.toLowerCase() : "";
  const primaryGoal = sectionB.primaryGoal || formData?.primaryGoal || formData?.fitnessGoals || formData?.sectionB_primaryGoal || "";

  const constraintTags: string[] = [];
  if (dietaryPreference && dietaryPreference !== "non-veg" && dietaryPreference !== "non_veg") {
    constraintTags.push(dietaryPreference.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()));
  }
  if (injuries && injuries.toLowerCase() !== "none" && injuries.toLowerCase() !== "no") {
    const injuryParts = injuries.split(",").map((s: string) => s.trim()).filter(Boolean);
    injuryParts.forEach((inj: string) => constraintTags.push(inj));
  }
  if (stressLevel >= 7 || stressText === "high" || stressText === "very high" || stressText === "severe") {
    constraintTags.push("High Stress");
  }
  if (client.isPregnant) {
    constraintTags.push(`Trimester ${client.trimester || "?"}`);
  }
  if (formData?.deliveryType && formData.deliveryType.toLowerCase().includes("c-section")) {
    constraintTags.push("C-Section Recovery");
  }
  if (formData?.diastasisRecti && formData.diastasisRecti.toLowerCase() !== "none" && formData.diastasisRecti.toLowerCase() !== "no") {
    constraintTags.push("Diastasis Recti");
  }
  if (formData?.pelvicFloorIssues && formData.pelvicFloorIssues.toLowerCase() !== "none" && formData.pelvicFloorIssues.toLowerCase() !== "no") {
    constraintTags.push("Pelvic Floor");
  }
  if (formData?.breastfeeding && formData.breastfeeding.toLowerCase() === "yes") {
    constraintTags.push("Breastfeeding");
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

        {/* Strategic Framework Card - Only for private coaching */}
        {coachingType === "private_coaching" && (
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 mb-6 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Crown className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-semibold">Your High Performance Framework</h3>
              </div>

              {/* 5 Pillars Progress */}
              <div className="grid grid-cols-5 gap-3">
                {[
                  { icon: Dumbbell, label: "Training" },
                  { icon: Apple, label: "Nutrition" },
                  { icon: Brain, label: "Mindset" },
                  { icon: Heart, label: "Relationships" },
                  { icon: Target, label: "Purpose" }
                ].map((pillar, i) => (
                  <div key={i} className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-slate-700 flex items-center justify-center">
                      <pillar.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-xs text-slate-400">{pillar.label}</div>
                  </div>
                ))}
              </div>

              <p className="text-sm text-slate-300 mt-4 text-center">
                Your complete operating system for high performance across all dimensions of life
              </p>
            </CardContent>
          </Card>
        )}

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
                    {/* Personalization Note - from AI coach remarks */}
                    {exercisesData.personalizationNote && (
                      <div className="mt-3 mb-3 bg-violet-50 border border-violet-200 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Wand2 className="w-3.5 h-3.5 text-violet-500" />
                          <span className="text-xs font-bold text-violet-700">Personalized For You</span>
                        </div>
                        <p className="text-xs text-gray-700">{exercisesData.personalizationNote}</p>
                      </div>
                    )}

                    {/* Personalization Tags */}
                    {exercisesData.personalizationTags && Array.isArray(exercisesData.personalizationTags) && exercisesData.personalizationTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
                        {exercisesData.personalizationTags.map((tag: string, tagIdx: number) => (
                          <Badge key={tagIdx} variant="outline" className="text-[9px] bg-violet-50 text-violet-600 border-violet-200 rounded-full px-2">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

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
                                            {ex.reason && (
                                              <div className="flex items-start gap-1.5 mt-1.5 bg-violet-50/80 rounded-md px-2 py-1">
                                                <Wand2 className="w-3 h-3 text-violet-400 mt-0.5 shrink-0" />
                                                <p className="text-[11px] text-violet-700 leading-snug">{ex.reason}</p>
                                              </div>
                                            )}
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
                <div className="h-2 bg-pink-100 rounded-full" />
                <p className="text-[10px] text-gray-400 mt-1">Track via your daily check-in</p>
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
                const msgDate = new Date(msg.createdAt);
                const now = new Date();
                const isToday = msgDate.toDateString() === now.toDateString();
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                const isYesterday = msgDate.toDateString() === yesterday.toDateString();
                const timeStr = msgDate.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
                const dateLabel = isToday ? `Today ${timeStr}` : isYesterday ? `Yesterday ${timeStr}` : msgDate.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
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
                      <div className={`flex items-center gap-1 mt-1 ${isFromCoach ? "text-pink-100" : "text-gray-500"}`}>
                        <span className="text-xs">{dateLabel}</span>
                        {!isFromCoach && msg.isRead && (
                          <span className="text-xs font-medium text-blue-500 ml-1">Seen ✓</span>
                        )}
                      </div>
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

  const renderCheckinView = () => {
    const streak = todayCheckinData?.streak || 0;
    const hasCheckedInToday = !!todayCheckinData?.checkin;
    const meals = checkinForm.mealsLogged;
    const filledMeals = Object.values(meals).filter(v => v.trim()).length;

    return (
      <div className="space-y-4">
        {/* Header with streak */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Daily Check-in</h2>
            <p className="text-sm text-gray-500">
              {hasCheckedInToday ? "You've checked in today! Tap to update." : "How are you doing today?"}
            </p>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-100 to-amber-100 px-3 py-1.5 rounded-full">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold text-orange-700">{streak}</span>
              <span className="text-xs text-orange-600">day{streak !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>

        {/* Workout status — quick tap */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-2">
              <button
                onClick={() => setCheckinForm(f => ({ ...f, workoutCompleted: true }))}
                className={`p-4 flex flex-col items-center gap-2 transition-all ${
                  checkinForm.workoutCompleted
                    ? "bg-green-50 border-b-3 border-green-500"
                    : "bg-white hover:bg-green-50/50"
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  checkinForm.workoutCompleted ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"
                }`}>
                  <Dumbbell className="w-6 h-6" />
                </div>
                <span className={`text-sm font-semibold ${
                  checkinForm.workoutCompleted ? "text-green-700" : "text-gray-500"
                }`}>
                  Workout Done
                </span>
              </button>
              <button
                onClick={() => setCheckinForm(f => ({ ...f, workoutCompleted: false, workoutNotes: "" }))}
                className={`p-4 flex flex-col items-center gap-2 transition-all border-l border-gray-100 ${
                  !checkinForm.workoutCompleted
                    ? "bg-blue-50 border-b-3 border-blue-500"
                    : "bg-white hover:bg-blue-50/50"
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  !checkinForm.workoutCompleted ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-400"
                }`}>
                  <Heart className="w-6 h-6" />
                </div>
                <span className={`text-sm font-semibold ${
                  !checkinForm.workoutCompleted ? "text-blue-700" : "text-gray-500"
                }`}>
                  Rest Day
                </span>
              </button>
            </div>
            {checkinForm.workoutCompleted && (
              <div className="p-3 border-t border-gray-100">
                <Input
                  placeholder="Quick note about your workout (optional)"
                  value={checkinForm.workoutNotes}
                  onChange={(e) => setCheckinForm(f => ({ ...f, workoutNotes: e.target.value }))}
                  className="border-green-200 focus-visible:ring-green-300 text-sm"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Food log */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-pink-500" />
                What did you eat today?
              </label>
              <span className="text-xs text-gray-400">{filledMeals}/4 meals</span>
            </div>
            <div className="space-y-2.5">
              {(["breakfast", "lunch", "snack", "dinner"] as const).map((meal) => (
                <div key={meal} className="flex items-center gap-2">
                  <span className="text-lg w-7 text-center shrink-0">
                    {meal === "breakfast" ? "🌅" : meal === "lunch" ? "☀️" : meal === "snack" ? "🍎" : "🌙"}
                  </span>
                  <Input
                    placeholder={`${meal.charAt(0).toUpperCase() + meal.slice(1)} — what did you have?`}
                    value={checkinForm.mealsLogged[meal]}
                    onChange={(e) =>
                      setCheckinForm(f => ({
                        ...f,
                        mealsLogged: { ...f.mealsLogged, [meal]: e.target.value },
                      }))
                    }
                    className="border-pink-100 focus-visible:ring-pink-300 text-sm"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Water tracker */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-blue-500" />
                Water Intake
              </label>
              <span className="text-sm font-bold text-blue-600">{checkinForm.waterGlasses} glasses</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((glass) => (
                <button
                  key={glass}
                  onClick={() => setCheckinForm(f => ({ ...f, waterGlasses: glass === f.waterGlasses ? glass - 1 : glass }))}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    glass <= checkinForm.waterGlasses
                      ? "bg-blue-500 text-white shadow-sm"
                      : "bg-blue-50 text-blue-300 hover:bg-blue-100"
                  }`}
                >
                  {glass}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mood & Energy — compact row */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-4">
              <label className="text-sm font-semibold text-gray-900 mb-2 block">Mood</label>
              <div className="flex gap-1">
                {MOOD_OPTIONS.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setCheckinForm(f => ({ ...f, mood: mood.value }))}
                    className={`flex-1 flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
                      checkinForm.mood === mood.value
                        ? "bg-pink-100 ring-2 ring-pink-400 scale-110"
                        : "hover:bg-gray-50"
                    }`}
                    title={mood.label}
                  >
                    <span className="text-xl">{mood.emoji}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-4">
              <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-yellow-500" />
                Energy
              </label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[checkinForm.energyLevel]}
                  onValueChange={([val]) => setCheckinForm(f => ({ ...f, energyLevel: val }))}
                  max={10}
                  min={1}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm font-bold text-gray-700 w-6 text-center">{checkinForm.energyLevel}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sleep & Weight — compact row */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-4">
              <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                Sleep
              </label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-gray-200 shrink-0"
                  onClick={() => setCheckinForm(f => ({ ...f, sleepHours: Math.max(0, f.sleepHours - 1) }))}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="text-lg font-bold text-gray-900 w-12 text-center">{checkinForm.sleepHours}h</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-gray-200 shrink-0"
                  onClick={() => setCheckinForm(f => ({ ...f, sleepHours: Math.min(24, f.sleepHours + 1) }))}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-4">
              <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-gray-500" />
                Weight
              </label>
              <Input
                placeholder="e.g. 65kg"
                value={checkinForm.weight}
                onChange={(e) => setCheckinForm(f => ({ ...f, weight: e.target.value }))}
                className="border-gray-200 focus-visible:ring-pink-300 text-sm h-9"
              />
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <label className="text-sm font-semibold text-gray-900 mb-2 block">Notes for Zoe</label>
            <Textarea
              placeholder="Anything else you'd like to share? How are you feeling overall?"
              value={checkinForm.notes}
              onChange={(e) => setCheckinForm(f => ({ ...f, notes: e.target.value }))}
              className="border-gray-200 focus-visible:ring-pink-300 text-sm"
              rows={2}
            />
          </CardContent>
        </Card>

        {/* Submit button */}
        <Button
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-6 rounded-2xl shadow-md"
          onClick={handleSubmitCheckin}
          disabled={submitCheckinMutation.isPending}
        >
          {submitCheckinMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : hasCheckedInToday ? (
            "Update Check-in"
          ) : (
            "Submit Check-in"
          )}
        </Button>

        {/* Check-in success celebration */}
        {showCheckinSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-8 mx-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-500">
              <div className="text-6xl animate-bounce">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900">Great job!</h3>
              <p className="text-gray-600">Your check-in is in. Zoe will review it and keep you on track!</p>
              <div className="flex items-center justify-center gap-2 text-pink-600 font-semibold">
                <Sparkles className="w-5 h-5" />
                Keep the momentum going!
              </div>
            </div>
          </div>
        )}

        {/* Recent check-ins */}
        {checkins.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Recent Check-ins</h3>
            <div className="space-y-2">
              {checkins.slice(0, 5).map((checkin) => {
                const mealData = checkin.mealsLogged as any;
                const mealCount = mealData ? Object.values(mealData).filter((v: any) => v && String(v).trim()).length : 0;
                return (
                  <Card key={checkin.id} className="border-0 shadow-sm rounded-2xl">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {MOOD_OPTIONS.find((m) => m.value === checkin.mood)?.emoji || "📝"}
                          </span>
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {new Date(checkin.date).toLocaleDateString(undefined, {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                              {checkin.workoutCompleted && <span className="text-green-600">Workout done</span>}
                              {checkin.waterGlasses !== undefined && checkin.waterGlasses > 0 && (
                                <span>{checkin.waterGlasses} glasses</span>
                              )}
                              {mealCount > 0 && <span>{mealCount} meals</span>}
                            </div>
                          </div>
                        </div>
                        {checkin.energyLevel && (
                          <div className="flex items-center gap-1 text-xs text-yellow-600">
                            <Zap className="w-3 h-3" />
                            {checkin.energyLevel}/10
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const navItems: { view: ActiveView; icon: typeof Calendar; label: string; badge?: number }[] = [
    { view: "today", icon: Calendar, label: "Today" },
    { view: "workouts", icon: Dumbbell, label: "Workouts" },
    { view: "nutrition", icon: Apple, label: "Nutrition" },
    { view: "blueprint", icon: BookOpen, label: "Blueprint" },
    { view: "messages", icon: MessageCircle, label: "Messages", badge: planData.unreadMessages || 0 },
    { view: "checkin", icon: ClipboardCheck, label: "Check-in" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pb-40">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-5">
          <div className="w-8" />
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">My Coaching</h1>
            <p className="text-xs text-pink-600 font-medium mt-0.5">High Performance Operating System</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-pink-100 text-gray-400 hover:text-pink-600 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {activeView === "today" && renderTodayView()}
        {activeView === "workouts" && renderWorkoutsView()}
        {activeView === "nutrition" && renderNutritionView()}
        {activeView === "blueprint" && (
          <MyWellnessBlueprint clientName={`${planData?.userProfile?.firstName || ''} ${planData?.userProfile?.lastName || ''}`.trim()} />
        )}
        {activeView === "messages" && renderMessagesView()}
        {activeView === "checkin" && renderCheckinView()}

        <div className="fixed bottom-4 left-4 right-4 z-40">
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

      {/* Workout day completion celebration */}
      {showWorkoutCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 mx-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-500">
            <div className="text-6xl animate-bounce">💪</div>
            <h3 className="text-2xl font-bold text-gray-900">Day Complete!</h3>
            <p className="text-gray-600">You crushed every exercise today. Zoe would be proud!</p>
            <div className="flex items-center justify-center gap-2 text-pink-600 font-semibold">
              <Flame className="w-5 h-5" />
              You're on fire — keep it up!
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
