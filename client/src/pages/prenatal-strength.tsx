import { useEffect, useState, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProfileSettings from "@/components/profile-settings";
import { 
  Play, 
  Dumbbell, 
  ArrowLeft, 
  Heart,
  Baby,
  Apple,
  Brain,
  Menu,
  Sparkles,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  AlertTriangle,
  BookOpen,
  Calendar,
  Clock,
  Timer,
  Zap,
  Shield,
  Stethoscope,
  Hand,
  Scale,
  Target,
  CheckCircle2,
  Star
} from "lucide-react";
import type { User } from "@shared/schema";
import NutritionSection from "@/components/program-sections/NutritionSection";

type ExerciseData = {
  id: string;
  name: string;
  videoUrl: string | null;
};

// Context for exercise data
const ExerciseContext = ({ children, exercises }: { children: React.ReactNode; exercises: ExerciseData[] }) => {
  return <>{children}</>;
};

function PlayAllButton({ label = "PLAY ALL", className = "", url }: { label?: string; className?: string; url?: string }) {
  if (url) {
    return (
      <a 
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium hover:underline ${className}`}
        data-testid="button-play-all"
      >
        <Play className="w-3 h-3" /> {label}
      </a>
    );
  }
  return (
    <span 
      className={`inline-flex items-center gap-1 text-gray-400 text-xs font-medium ${className}`}
      data-testid="button-play-all"
    >
      <Play className="w-3 h-3" /> {label}
    </span>
  );
}

// Component to render exercise name as clickable link if video URL exists
function ExerciseLink({ name, exercises }: { name: string; exercises: ExerciseData[] }) {
  const searchName = name.toLowerCase();
  
  // Helper to get video URL from exercise (handles both field naming formats)
  const getVideoUrl = (ex: ExerciseData) => ex?.videoUrl || (ex as any)?.video_url || '';
  
  // Helper to check if names match
  const namesMatch = (exName: string) => {
    const normalizedExName = exName.toLowerCase();
    return normalizedExName === searchName || 
           normalizedExName.includes(searchName) || 
           searchName.includes(normalizedExName);
  };
  
  // First, try to find an exercise with matching name AND a video URL
  const exerciseWithVideo = exercises.find(ex => {
    const exName = ex.name?.toLowerCase() || '';
    const videoUrl = getVideoUrl(ex);
    return namesMatch(exName) && videoUrl && videoUrl.trim() !== '';
  });
  
  if (exerciseWithVideo) {
    const videoUrl = getVideoUrl(exerciseWithVideo);
    return (
      <a 
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
        data-testid={`link-exercise-${exerciseWithVideo?.id}`}
      >
        {name}
      </a>
    );
  }
  
  return <span className="text-cyan-600 font-medium">{name}</span>;
}

export default function PrenatalStrengthPage() {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("start-here");
  const [animatingNumber, setAnimatingNumber] = useState<number | null>(null);
  const prevActiveTabRef = useRef(activeTab);
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  const tabOrder = ["start-here", "understanding", "trimester1", "nutrition", "postpartum", "faqs"];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    const currentIndex = tabOrder.indexOf(activeTab);
    const prevIndex = tabOrder.indexOf(prevActiveTabRef.current);
    
    if (currentIndex > prevIndex) {
      setAnimatingNumber(currentIndex);
      const timer = setTimeout(() => setAnimatingNumber(null), 900);
      prevActiveTabRef.current = activeTab;
      return () => clearTimeout(timer);
    }
    prevActiveTabRef.current = activeTab;
  }, [activeTab]);

  const { data: courseData } = useQuery({
    queryKey: ["/api/courses/prenatal-strength-course"],
    enabled: !!user,
  });

  // Fetch exercises from database to get video URLs
  const { data: exercises = [] } = useQuery<ExerciseData[]>({
    queryKey: ["/api/exercises"],
    queryFn: async () => {
      const res = await fetch('/api/exercises');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  // Fetch section settings for Play All URLs
  const { data: sectionSettings = {} } = useQuery<Record<string, string>>({
    queryKey: ["/api/section-settings"],
    queryFn: async () => {
      const res = await fetch('/api/section-settings');
      return res.json();
    },
  });

  // Helper to get play all URL for a section
  const getPlayAllUrl = (sectionKey: string) => sectionSettings[sectionKey] || '';

  const navigateToNextTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1]);
    }
  };

  const navigateToPreviousTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1]);
    }
  };

  const canGoNext = () => tabOrder.indexOf(activeTab) < tabOrder.length - 1;
  const canGoPrevious = () => tabOrder.indexOf(activeTab) > 0;

  const getTabName = (tabValue: string) => {
    const tabNames: Record<string, string> = {
      'start-here': 'Start Here',
      'understanding': 'Your Body',
      'trimester1': 'Trimester 1',
      'nutrition': 'Nutrition',
      'postpartum': 'Postpartum Prep',
      'faqs': 'FAQs'
    };
    return tabNames[tabValue] || tabValue;
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  const programOptions = [
    { program: "Program 1", days: "5 Days", theme: "Feeling Fierce", themeDesc: "High energy, full-body, strong", workout: "Strength & Flow", workoutDesc: "Full-body strength with breath + mobility", color: "from-pink-500 to-rose-600" },
    { program: "Program 2", days: "4 Days", theme: "Steady & Strong", themeDesc: "Moderate energy, focused effort", workout: "Balanced Strength", workoutDesc: "Strength focus with mobility support", color: "from-purple-500 to-indigo-600" },
    { program: "Program 3", days: "3 Days", theme: "Balanced & Easy", themeDesc: "Manageable pace, gentle strength", workout: "Gentle Strength", workoutDesc: "Light full body + glutes/core", color: "from-blue-500 to-cyan-600" },
    { program: "Program 4", days: "2 Days", theme: "Gentle Flow", themeDesc: "For tired, sore, or low-energy days", workout: "Soft Strength", workoutDesc: "Seated/standing light movement", color: "from-teal-500 to-emerald-600" },
    { program: "Program 5", days: "3 Days", theme: "Pick & Play", themeDesc: "For variety/freedom to mix & match", workout: "Build Your Own", workoutDesc: "Choose from workout menus", color: "from-amber-500 to-orange-600" },
  ];

  const exampleWeekPlan = [
    { day: "Monday", focus: "Workout 1" },
    { day: "Tuesday", focus: "Rest / Leisure Movement" },
    { day: "Wednesday", focus: "Workout 2" },
    { day: "Thursday", focus: "Light Cardio / Walk" },
    { day: "Friday", focus: "Workout 3" },
    { day: "Saturday", focus: "Rest / Stretch / Leisure" },
    { day: "Sunday", focus: "Workout 4" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button 
                className="p-3 relative transition-all duration-300 md:hover:scale-110 md:hover:rotate-12 active:scale-95 group touch-manipulation"
                data-testid="button-hamburger-menu"
                onClick={() => setShowProfileSettings(!showProfileSettings)}
              >
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <div className={`absolute transition-all duration-300 transform ${showProfileSettings ? 'rotate-45 translate-y-0' : 'rotate-0 -translate-y-2'}`}>
                    <div className="w-6 h-0.5 bg-gradient-to-r from-purple-400 via-pink-500 to-pink-600 rounded"></div>
                  </div>
                  <div className={`absolute transition-all duration-300 ${showProfileSettings ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="w-6 h-0.5 bg-gradient-to-r from-purple-400 via-pink-500 to-pink-600 rounded"></div>
                  </div>
                  <div className={`absolute transition-all duration-300 transform ${showProfileSettings ? '-rotate-45 translate-y-0' : 'rotate-0 translate-y-2'}`}>
                    <div className="w-6 h-0.5 bg-gradient-to-r from-purple-400 via-pink-500 to-pink-600 rounded"></div>
                  </div>
                </div>
              </button>
            </div>
            
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link to="/dashboard">
                <img src="/assets/logo.png" alt="Studio Bloom" className="h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200" />
              </Link>
            </div>
            
            <div className="flex items-center opacity-0 pointer-events-none">
              <button className="p-3 rounded-lg"><Menu className="w-6 h-6" /></button>
            </div>
          </div>
        </div>
      </header>

      {showProfileSettings && user && (
        <ProfileSettings 
          isOpen={showProfileSettings} 
          onClose={() => setShowProfileSettings(false)}
          user={user}
          onUserUpdate={handleUserUpdate}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            data-testid="link-back-to-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Dashboard</span>
          </button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="bg-gradient-to-r from-purple-50 to-pink-100 border border-purple-200 shadow-xl rounded-lg overflow-hidden">
            <div className="p-3 sm:p-4 md:p-6 border-b border-purple-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                    <Baby className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-700 bg-clip-text text-transparent">Hello {user.firstName}!</h3>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium mt-0.5">Pregnancy with Zoe - Trimester 1</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs sm:text-sm text-gray-500 font-medium">
                    {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex items-center justify-end space-x-1 mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">Active</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/50 rounded-lg p-2.5 sm:p-3 border border-purple-200/50">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center space-x-2">
                    <Baby className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                    <span className="text-gray-700 font-medium">Weeks 1-13 Prenatal Workouts</span>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span className="text-purple-600 font-semibold text-xs">Trimester 1</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto scrollbar-hide px-0">
              <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
                <TabsList className="tab-flow-container flex gap-2 sm:gap-3 md:gap-4 h-auto bg-transparent border-0 shadow-none w-max md:w-full md:grid md:grid-cols-6 mx-0">
                  <TabsTrigger value="start-here" data-testid="tab-start-here" className="text-xs sm:text-sm min-h-[60px] sm:min-h-[65px] md:min-h-[60px] min-w-[70px] sm:min-w-[75px] md:min-w-[80px] flex-col p-2 sm:p-3 md:p-4 bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-purple-300 relative z-10 flex-shrink-0">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mb-1 sm:mb-2" />
                    <span className="font-medium text-center leading-tight">Start Here</span>
                  </TabsTrigger>
                  <TabsTrigger value="understanding" data-testid="tab-understanding" className="text-xs sm:text-sm min-h-[60px] sm:min-h-[65px] md:min-h-[60px] min-w-[70px] sm:min-w-[75px] md:min-w-[80px] flex-col p-2 sm:p-3 md:p-4 bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-purple-300 relative z-10 flex-shrink-0">
                    <Brain className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mb-1 sm:mb-2" />
                    <span className="font-medium text-center leading-tight">Your Body</span>
                  </TabsTrigger>
                  <TabsTrigger value="trimester1" data-testid="tab-trimester1" className="text-xs sm:text-sm min-h-[60px] sm:min-h-[65px] md:min-h-[60px] min-w-[70px] sm:min-w-[75px] md:min-w-[80px] flex-col p-2 sm:p-3 md:p-4 bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-purple-300 relative z-10 flex-shrink-0">
                    <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mb-1 sm:mb-2" />
                    <span className="font-medium text-center leading-tight">Trimester 1</span>
                  </TabsTrigger>
                  <TabsTrigger value="nutrition" data-testid="tab-nutrition" className="text-xs sm:text-sm min-h-[60px] sm:min-h-[65px] md:min-h-[60px] min-w-[70px] sm:min-w-[75px] md:min-w-[80px] flex-col p-2 sm:p-3 md:p-4 bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-purple-300 relative z-10 flex-shrink-0">
                    <Apple className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mb-1 sm:mb-2" />
                    <span className="font-medium text-center leading-tight">Nutrition</span>
                  </TabsTrigger>
                  <TabsTrigger value="postpartum" data-testid="tab-postpartum" className="text-xs sm:text-sm min-h-[60px] sm:min-h-[65px] md:min-h-[60px] min-w-[70px] sm:min-w-[75px] md:min-w-[80px] flex-col p-2 sm:p-3 md:p-4 bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-purple-300 relative z-10 flex-shrink-0">
                    <Baby className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mb-1 sm:mb-2" />
                    <span className="font-medium text-center leading-tight">Postpartum</span>
                  </TabsTrigger>
                  <TabsTrigger value="faqs" data-testid="tab-faqs" className="text-xs sm:text-sm min-h-[60px] sm:min-h-[65px] md:min-h-[60px] min-w-[70px] sm:min-w-[75px] md:min-w-[80px] flex-col p-2 sm:p-3 md:p-4 bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-purple-300 relative z-10 flex-shrink-0">
                    <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mb-1 sm:mb-2" />
                    <span className="font-medium text-center leading-tight">FAQs</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className="relative px-3 sm:px-6 md:px-12 py-3 sm:py-4 md:py-6 bg-white border-t border-purple-200">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 sm:h-1 bg-gray-200 -translate-y-1/2 rounded-full"></div>
                
                <div 
                  className="absolute top-1/2 h-0.5 sm:h-1 rounded-full -translate-y-1/2 transition-all duration-700 ease-out"
                  style={{
                    left: '0%',
                    width: `${(tabOrder.indexOf(activeTab) / (tabOrder.length - 1)) * 100}%`,
                    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
                  }}
                />
                
                {tabOrder.map((tab, index) => {
                  const currentIndex = tabOrder.indexOf(activeTab);
                  const isUnlocked = index <= currentIndex;
                  const isAnimating = animatingNumber === index;
                  const isCurrentStep = index === currentIndex;
                  
                  const colors = ['#c084fc', '#a78bfa', '#818cf8', '#14b8a6', '#f472b6', '#ec4899'];
                  
                  return (
                    <div 
                      key={tab}
                      className={`relative w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center text-xs sm:text-sm font-bold z-10 transition-all duration-500 ${
                        isUnlocked ? 'text-white border-white shadow-lg' : 'bg-gray-300 text-gray-500 border-gray-200'
                      } ${isAnimating ? 'scale-125 shadow-2xl' : ''} ${isCurrentStep && isUnlocked ? 'ring-4 ring-white ring-opacity-50' : ''}`}
                      style={{
                        backgroundColor: isUnlocked ? colors[index] : undefined,
                        transform: isAnimating ? 'scale(1.4)' : 'scale(1)',
                        transition: 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                      }}
                    >
                      {index + 1}
                      {isCurrentStep && isUnlocked && (
                        <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-100 border-y border-gray-200 py-2">
            <div className="marquee" style={{ ['--marquee-duration' as any]: '150s' }}>
              <div className="marquee-track">
                <div className="marquee-content">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span key={i} className="text-xs text-gray-600 font-medium">
                      <strong>IMPORTANT:</strong> This guide is based on my personal experience and research as Zoe Modgill; it's not intended to replace professional medical advice, diagnosis, or treatment.
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* START HERE TAB */}
          <TabsContent value="start-here" className="mt-6 space-y-6">
            
            {/* Section 1: Disclaimer */}
            <Accordion type="single" collapsible defaultValue="disclaimer">
              <AccordionItem value="disclaimer" className="border-2 border-amber-200 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg overflow-hidden">
                <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline hover:bg-amber-100/50 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                      <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg sm:text-xl font-bold text-amber-800">Disclaimer</h3>
                      <p className="text-xs sm:text-sm text-amber-600">Important information before you begin</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 pb-6">
                  <div className="space-y-4 text-gray-700">
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200">
                      <Stethoscope className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-800">Consult Your Doctor</p>
                        <p className="text-sm">Before beginning any exercise program or making dietary changes during pregnancy, consult your obstetrician, midwife, or healthcare provider, especially if you have a medical condition, complications in your pregnancy, or are new to physical activity.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200">
                      <Hand className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-800">Listen to Your Body</p>
                        <p className="text-sm">Every pregnancy is unique. Pay close attention to how you feel during any activity. Stop exercising immediately if you experience pain, dizziness, shortness of breath, nausea, or any unusual symptoms. Always prioritize your comfort and safety.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200">
                      <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-800">Not a Medical Professional</p>
                        <p className="text-sm">The content in this guide is based on professional training and experience in prenatal fitness and nutrition. However, I am not a licensed medical professional or registered dietitian. Recommendations in this guide are general and may not suit everyone.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200">
                      <Scale className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-800">Liability</p>
                        <p className="text-sm">By using this guide, you assume full responsibility for your participation in any exercises, activities, or dietary adjustments. The author and publisher disclaim any liability for injuries, health conditions, or adverse effects resulting from the use or misuse of this guide.</p>
                      </div>
                    </div>
                    <div className="bg-amber-100 border border-amber-300 rounded-lg p-4 mt-4">
                      <p className="text-sm text-amber-800 italic font-medium">Your safety and well-being are of utmost importance. Always prioritize open communication with your healthcare provider and listen to your body's cues throughout your pregnancy journey.</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Section 2: Welcome */}
            <Accordion type="single" collapsible>
              <AccordionItem value="welcome" className="border-2 border-pink-200 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 shadow-lg overflow-hidden">
                <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline hover:bg-pink-100/50 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-md">
                      <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg sm:text-xl font-bold text-pink-800">Welcome</h3>
                      <p className="text-xs sm:text-sm text-pink-600">A message from Zoe</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 pb-6">
                  <div className="space-y-4 text-gray-700">
                    <p className="text-lg font-medium text-pink-700">Dear Mama,</p>
                    <p><span className="font-semibold">First of all — congratulations!</span> This guide isn't about pushing harder or striving for perfection. It's about moving with intention, honoring your changing body, and supporting your strength from the inside out.</p>
                    <p>Each week of pregnancy may feel different — some days you're energised, other days just brushing your hair feels like a win. This plan meets you wherever you are.</p>
                    <p>This guide was built for real life. For tired days, strong days, emotional days, and everything in between. Whether you're moving 2 days or 5, each plan will support your body, your core, and your energy — without overloading your system.</p>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
                      <h4 className="font-bold text-purple-800 mb-2">Trimester 1 Training Overview</h4>
                      <p className="text-sm">Training during the first trimester is all about setting a solid foundation for both your physical and mental well-being as you embark on this incredible journey of motherhood. It's a time to focus on gentle, consistent exercise that helps maintain your fitness level, manage stress, and prepare your body for the changes ahead. Incorporating a mix of strength training, cardio, and flexibility exercises can enhance your stamina, support your growing body, and boost your mood.</p>
                      <p className="text-sm mt-2">Always listen to your body, modify exercises as needed, and prioritize rest and hydration. Remember, the goal is to stay active and healthy, not to push limits. Celebrate every small victory, knowing that each step you take is a step toward a healthier pregnancy and a stronger you.</p>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4 text-pink-600">
                      <p className="font-medium">With love and warmth,</p>
                    </div>
                    <p className="text-xl font-bold text-pink-700">Zoe 💕</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Section 3: How to Use This Workout Guide */}
            <Accordion type="single" collapsible>
              <AccordionItem value="how-to-use" className="border-2 border-purple-200 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg overflow-hidden">
                <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline hover:bg-purple-100/50 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg sm:text-xl font-bold text-purple-800">How to Use This Workout Guide</h3>
                      <p className="text-xs sm:text-sm text-purple-600">Choose the program that fits your energy</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 pb-6">
                  <div className="space-y-4">
                    <p className="text-gray-700">This guide is designed to help you stay active, strong, and connected to your changing body in a way that's supportive, safe, and energizing. This guide is divided into 5 easy-to-follow programs, designed around how you feel each week — because energy, symptoms, and emotions can fluctuate daily in the first trimester.</p>
                    
                    <h4 className="font-bold text-purple-800 mt-4 mb-3">Here's an Overview:</h4>
                    <div className="grid gap-3">
                      {programOptions.map((prog, idx) => (
                        <div key={idx} className={`bg-gradient-to-r ${prog.color} p-4 rounded-lg text-white shadow-md`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-bold opacity-80">{idx + 1}</span>
                              <div>
                                <p className="font-bold">{prog.program} - {prog.days}</p>
                                <p className="text-sm opacity-90">{prog.theme}</p>
                                <p className="text-xs opacity-75">{prog.themeDesc}</p>
                              </div>
                            </div>
                            <div className="text-right sm:text-left bg-white/20 rounded-lg px-3 py-2">
                              <p className="font-semibold text-sm">{prog.workout}</p>
                              <p className="text-xs opacity-90">{prog.workoutDesc}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-purple-100 border border-purple-300 rounded-lg p-4 mt-4">
                      <h4 className="font-bold text-purple-800 mb-2">How to Choose the Right Program</h4>
                      <p className="text-sm text-purple-700 mb-3">Because the first trimester is unpredictable, this system is built to adapt with you. Here's how to decide:</p>
                      <ul className="space-y-2 text-sm text-purple-700">
                        <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-pink-500" /> Feeling energetic and strong? → Go for <strong>Program 1 (5 Days)</strong></li>
                        <li className="flex items-center gap-2"><Heart className="w-4 h-4 text-purple-500" /> Want structure with breathing room? → Go for <strong>Program 2 (4 Days)</strong></li>
                        <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-500" /> Need more recovery between movement days? → Choose <strong>Program 3 (3 Days)</strong></li>
                        <li className="flex items-center gap-2"><Star className="w-4 h-4 text-emerald-500" /> Fatigue, nausea, or brand new to movement? → Try <strong>Program 4 (2 Days)</strong></li>
                        <li className="flex items-center gap-2"><Target className="w-4 h-4 text-amber-500" /> Want choice, creativity, or to mix it up? → Build <strong>Program 5 (3 Days)</strong></li>
                      </ul>
                      <p className="text-sm text-purple-600 mt-3 italic">There's no pressure — it's designed for flexibility and flow.</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Section 4: How to Structure Your Week */}
            <Accordion type="single" collapsible>
              <AccordionItem value="structure-week" className="border-2 border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg overflow-hidden">
                <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline hover:bg-blue-100/50 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-md">
                      <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg sm:text-xl font-bold text-blue-800">How to Structure Your Week</h3>
                      <p className="text-xs sm:text-sm text-blue-600">Plan your strength days and cardio</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 pb-6">
                  <div className="space-y-4">
                    <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                      <h4 className="font-bold text-blue-800 flex items-center gap-2 mb-2"><span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span> Pick Your Base Program</h4>
                      <p className="text-sm text-blue-700">Choose one of the 5 programs from the guide based on current energy, mood, schedule.</p>
                      <p className="text-sm text-blue-600 mt-1">Within each workout you can opt for the beginner option where needed at any time.</p>
                    </div>

                    <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                      <h4 className="font-bold text-blue-800 flex items-center gap-2 mb-2"><span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span> Plan Your Strength Days</h4>
                      <p className="text-sm text-blue-700">These will be your main workout days from the program you selected. Spread them out in the week.</p>
                      <p className="text-sm text-blue-600 mt-1">Example: Mon | Wed | Fri | Sat (if doing a 4-day plan)</p>
                    </div>

                    <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                      <h4 className="font-bold text-blue-800 flex items-center gap-2 mb-2"><span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span> Where Cardio Fits In</h4>
                      <p className="text-sm text-blue-700">Cardio is optional and should feel good - not exhausting. Add a brisk walk, light cardio flow, or outdoor leisure activity on rest or leisure days if it feels good.</p>
                      <p className="text-sm text-blue-600 mt-1 italic">💬 Use the Talk Test: If you can hold a conversation while moving, you're in the safe zone.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h5 className="font-bold text-green-800 mb-2 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Safe Prenatal Cardio Options:</h5>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Brisk walking / running if you are used to it</li>
                          <li>• Light cycling</li>
                          <li>• Low-impact circuits</li>
                        </ul>
                      </div>
                      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                        <h5 className="font-bold text-teal-800 mb-2">On Leisure Movement Days:</h5>
                        <p className="text-sm text-teal-700 mb-2">Move gently and joyfully:</p>
                        <ul className="text-sm text-teal-700 space-y-1">
                          <li>• Take a slow walk</li>
                          <li>• Stretch lightly</li>
                          <li>• Dance in your living room</li>
                          <li>• Swim, garden, or clean with intention</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-4">
                      <h5 className="font-bold text-indigo-800 mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" /> Example Week Plan (For a 4-Day Steady & Strong Program)</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                        {exampleWeekPlan.map((day, idx) => (
                          <div key={idx} className={`p-2 rounded-lg text-center ${day.focus.includes('Workout') ? 'bg-pink-100 border border-pink-300' : 'bg-gray-100 border border-gray-200'}`}>
                            <p className="font-bold text-xs text-gray-700">{day.day}</p>
                            <p className={`text-xs mt-1 ${day.focus.includes('Workout') ? 'text-pink-700 font-medium' : 'text-gray-600'}`}>{day.focus}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h5 className="font-bold text-purple-800 mb-2">On Rest Days:</h5>
                      <p className="text-sm text-purple-700">Feet up, nap, meditate, relax — no pressure.</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Section 5: How to Follow Your Daily Workout */}
            <Accordion type="single" collapsible>
              <AccordionItem value="daily-workout" className="border-2 border-teal-200 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 shadow-lg overflow-hidden">
                <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline hover:bg-teal-100/50 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                      <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg sm:text-xl font-bold text-teal-800">How to Follow Your Daily Workout</h3>
                      <p className="text-xs sm:text-sm text-teal-600">Navigate exercises, reps, and modifications</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 pb-6">
                  <div className="space-y-4">
                    <div className="bg-teal-100 border border-teal-300 rounded-lg p-4">
                      <h4 className="font-bold text-teal-800 mb-3">How to Navigate Your Workout:</h4>
                      <ul className="space-y-2 text-sm text-teal-700">
                        <li><span className="font-semibold">Clickable Links for Exercises:</span> Each exercise is clickable. Simply click on the blue underlined exercise name to see a video demo with instructions.</li>
                        <li><span className="font-semibold">Reps & Modifications:</span> The workout specifies the reps for each exercise. If you're new or need extra support, you can always modify by choosing a beginner option listed under each exercise.</li>
                        <li><span className="font-semibold">Reps:</span> This is the number of times you'll repeat each movement. Example: 10-12 reps.</li>
                        <li><span className="font-semibold">Beginner Option:</span> If needed, choose no weights or an easier modification.</li>
                        <li><span className="font-semibold">Notes:</span> Each exercise has additional notes that guide you on form, posture, and breathwork.</li>
                      </ul>
                    </div>

                    <div className="bg-emerald-100 border border-emerald-300 rounded-lg p-4">
                      <h4 className="font-bold text-emerald-800 mb-3">How to Follow the Workout Program:</h4>
                      <ul className="space-y-2 text-sm text-emerald-700">
                        <li><span className="font-semibold">Warm-Up:</span> Start by doing the Warm-Up section first. Follow along with the video or instructions.</li>
                        <li><span className="font-semibold">Main Workout:</span> (3 Rounds) Here, you'll be repeating each exercise for the specified rounds.</li>
                        <li><span className="font-semibold">Time interval:</span> (45 seconds to 1 minute rest) between exercises. Use this time to recover but stay active by walking or stretching lightly.</li>
                        <li><span className="font-semibold">Finisher Flow:</span> This part of the workout helps to cool down your body and relax.</li>
                        <li><span className="font-semibold">Cool Down:</span> Finally, finish with the Cool Down to ensure your body recovers.</li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-bold text-yellow-800 mb-3">Adjustments & Precautions:</h4>
                      <ul className="space-y-2 text-sm text-yellow-700">
                        <li>• Listen to your body and adjust exercises if they don't feel comfortable.</li>
                        <li>• Use lighter weights or no weights if necessary.</li>
                        <li>• <span className="font-semibold">Advanced Modifications:</span> If you're feeling stronger or more experienced, you can increase your weight or reps to make the exercise more challenging.</li>
                        <li>• Stay hydrated and take longer rests if fatigued.</li>
                      </ul>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="font-bold text-blue-800 mb-2">Quick Access: Play All</h5>
                        <p className="text-sm text-blue-700">To save time, you can use the Play All feature for the entire workout. This will play a video playlist of all the exercises in that section. It's a quick reference to follow the exercises seamlessly.</p>
                      </div>
                      <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                        <h5 className="font-bold text-pink-800 mb-2">Printing the Workout</h5>
                        <p className="text-sm text-pink-700">Print the workout sheet and refer to it during your session. Write down your modifications or any personal notes for each exercise.</p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Section 6: Rest Between Exercises */}
            <Accordion type="single" collapsible>
              <AccordionItem value="rest" className="border-2 border-rose-200 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 shadow-lg overflow-hidden">
                <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline hover:bg-rose-100/50 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                      <Timer className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg sm:text-xl font-bold text-rose-800">Rest Between Exercises & Rounds</h3>
                      <p className="text-xs sm:text-sm text-rose-600">Recovery guidelines for your workouts</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 pb-6">
                  <div className="space-y-4">
                    <div className="bg-rose-100 border border-rose-300 rounded-lg p-4">
                      <h4 className="font-bold text-rose-800 flex items-center gap-2 mb-2"><Star className="w-4 h-4 text-yellow-500" /> Between Exercises:</h4>
                      <p className="text-sm text-rose-700">Take <strong>15-30 seconds</strong> of rest — just enough to catch your breath and feel ready to move again.</p>
                      <p className="text-sm text-rose-600 mt-1">If you're feeling breathless, light-headed, or need more time, pause longer. You can sip water, shake out your arms, or simply reset your breath.</p>
                    </div>

                    <div className="bg-rose-100 border border-rose-300 rounded-lg p-4">
                      <h4 className="font-bold text-rose-800 flex items-center gap-2 mb-2"><Star className="w-4 h-4 text-yellow-500" /> Between Rounds:</h4>
                      <p className="text-sm text-rose-700">Rest for <strong>1-2 minutes</strong> between each round.</p>
                      <p className="text-sm text-rose-600 mt-1">Use this time to check in: "How do I feel? Can I do one more round with quality?"</p>
                      <p className="text-sm text-rose-600 mt-1">If yes — go again. If not — stop. <strong>1-2 solid rounds are still a win.</strong></p>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-bold text-purple-800 flex items-center gap-2 mb-2"><Star className="w-4 h-4 text-yellow-500" /> What Matters Most:</h4>
                      <p className="text-sm text-purple-700">Your breath is your best guide. <strong>If you can speak a full sentence, you're likely in the safe zone.</strong></p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-bold text-red-800 flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4" /> Always Rest If:</h4>
                      <ul className="space-y-1 text-sm text-red-700">
                        <li>❖ Your heart rate spikes</li>
                        <li>❖ You feel overheated or dizzy</li>
                        <li>❖ You feel breathless or mentally tired</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

          </TabsContent>

          {/* UNDERSTANDING YOUR BODY TAB */}
          <TabsContent value="understanding" className="mt-6">
            <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200 shadow-lg">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full mb-4 shadow-lg">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-blue-800 mb-2">Understanding Your Changing Body</h2>
                  <p className="text-gray-600">Learn how your body changes during pregnancy and how to exercise safely</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                    <h4 className="font-bold text-blue-800 mb-2">Physical Changes During Pregnancy</h4>
                    <p className="text-sm text-blue-700">During pregnancy, your body goes through remarkable changes. Your center of gravity shifts forward, your ligaments become more relaxed due to the hormone relaxin, and your cardiovascular system works harder. Understanding these changes helps you exercise safely and effectively.</p>
                  </div>

                  <div className="bg-indigo-100 border border-indigo-300 rounded-lg p-4">
                    <h4 className="font-bold text-indigo-800 mb-2">Trimester by Trimester</h4>
                    <ul className="text-sm text-indigo-700 space-y-2">
                      <li><strong>First Trimester:</strong> Fatigue and nausea may affect your energy. Focus on establishing good movement habits.</li>
                      <li><strong>Second Trimester:</strong> Often called the "honeymoon phase" - energy returns and you can maintain good intensity.</li>
                      <li><strong>Third Trimester:</strong> Focus shifts to birth preparation and maintaining mobility as your belly grows.</li>
                    </ul>
                  </div>

                  <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                    <h4 className="font-bold text-green-800 mb-2">Safe Movement Guidelines</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Avoid lying flat on your back after the first trimester</li>
                      <li>• Avoid exercises that risk falling or abdominal trauma</li>
                      <li>• Skip deep twists that compress your belly</li>
                      <li>• Modify exercises as your body changes</li>
                      <li>• Stay well-hydrated and avoid overheating</li>
                    </ul>
                  </div>

                  <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
                    <h4 className="font-bold text-purple-800 mb-2">Breathing During Pregnancy</h4>
                    <p className="text-sm text-purple-700">As your baby grows, your diaphragm has less room to expand. Learning proper 360-degree breathing helps maintain core connection, reduces stress, and prepares you for labor. Practice expanding your ribs to the sides and back, not just forward.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TRIMESTER 1 TAB */}
          <TabsContent value="trimester1" className="mt-6">
            <Card className="bg-gradient-to-br from-white to-purple-50 border-purple-200 shadow-lg">
              <CardContent className="p-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mb-4 shadow-lg">
                    <Baby className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-purple-800 mb-2">Trimester 1</h2>
                  <p className="text-lg text-pink-600 font-medium">(Weeks 1-13)</p>
                  <p className="text-gray-600 mt-4 max-w-2xl mx-auto">The first trimester is all about adjustment. Your body is laying the groundwork for your baby's development, and you may feel symptoms like nausea, fatigue, or mood swings. Movement can help ease these challenges while maintaining your energy.</p>
                </div>

                {/* PROGRAM 1: FEELING FIERCE */}
                <Accordion type="single" collapsible defaultValue="program1" className="mb-8">
                  <AccordionItem value="program1" className="border-0">
                    <AccordionTrigger className="p-0 hover:no-underline [&>svg]:hidden" data-testid="accordion-program1">
                      <div className="bg-gradient-to-br from-cyan-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl w-full">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-4xl font-bold">1</span>
                          </div>
                          <div className="text-center sm:text-left flex-1">
                            <p className="text-sm opacity-90 uppercase tracking-wide">Program 1 (5-Day Week)</p>
                            <h3 className="text-3xl font-bold">FEELING FIERCE</h3>
                            <p className="text-sm opacity-90 mt-2 italic">For days you're full of energy and ready to move. Expect compound, functional strength work & active mobility.</p>
                          </div>
                          <ChevronDown className="w-6 h-6 text-white/80 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-6 pb-0">
                      <Accordion type="single" collapsible className="space-y-4">
                    {/* DAY 1 */}
                    <AccordionItem value="program1-day1" className="border border-purple-200 rounded-xl overflow-hidden bg-white shadow-md">
                      <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-purple-50 [&[data-state=open]]:bg-gradient-to-r [&[data-state=open]]:from-purple-100 [&[data-state=open]]:to-pink-100" data-testid="accordion-program1-day1">
                        <div className="flex items-center gap-4 w-full">
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                            D1
                          </div>
                          <div className="text-left flex-1">
                            <h4 className="font-bold text-purple-800">FULL BODY STRENGTH + CORE ACTIVATION</h4>
                            <p className="text-sm text-gray-600">30-35 mins • Full-body strength with core connection and energy flow</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-6">
                        <div className="space-y-6">
                          {/* Coach's Note */}
                          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-l-4 border-pink-400 p-4 rounded-r-lg">
                            <p className="text-sm text-gray-700 italic">
                              <strong className="text-pink-600">Coach's Note:</strong> Today's about starting strong. Breathe with every rep, feel grounded through your feet, and keep your core gently engaged. This is strength with softness — and you're already winning by showing up.
                            </p>
                          </div>

                          {/* Equipment & Time */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                              <h5 className="font-semibold text-cyan-700 text-sm mb-2">Equipment Needed</h5>
                              <ul className="text-xs text-cyan-600 space-y-1">
                                <li>• Dumbbells (various)</li>
                                <li>• Long resistance band</li>
                                <li>• Mat</li>
                              </ul>
                            </div>
                            <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                              <h5 className="font-semibold text-pink-700 text-sm mb-2">Time & Focus</h5>
                              <p className="text-xs text-pink-600">30-35 Mins</p>
                              <p className="text-xs text-pink-600 mt-1">Full-body strength with core connection</p>
                            </div>
                          </div>

                          {/* Part 1: Warm-up */}
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                              <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                              WARM-UP (5-7 mins)
                            </h5>
                            <div className="bg-white rounded-lg p-3">
                              <p className="font-medium text-gray-800">PRENATAL WARMUP</p>
                              <p className="text-sm text-gray-600">8 reps of each</p>
                            </div>
                          </div>

                          {/* Part 2: Main Workout */}
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h5 className="font-bold text-purple-700 mb-3 flex items-center gap-2">
                              <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                              MAIN WORKOUT (3 ROUNDS)
                            </h5>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-purple-200">
                                    <th className="text-left py-2 text-purple-700">#</th>
                                    <th className="text-left py-2 text-purple-700">Exercise <PlayAllButton url={getPlayAllUrl('program1-day1-main-workout')} /></th>
                                    <th className="text-left py-2 text-purple-700">Reps</th>
                                    <th className="text-left py-2 text-purple-700">Beginner Option <PlayAllButton url={getPlayAllUrl('program1-day1-beginner-option')} /></th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-100">
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">1</td>
                                    <td className="py-2"><ExerciseLink name="DB Squat Thruster" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">10-12</td>
                                    <td className="py-2"><ExerciseLink name="Bodyweight Squats" exercises={exercises} /></td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">2</td>
                                    <td className="py-2"><ExerciseLink name="DB Deadlifts" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">10-12</td>
                                    <td className="py-2"><ExerciseLink name="Band Deadlifts" exercises={exercises} /></td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">3</td>
                                    <td className="py-2"><ExerciseLink name="DB Same Leg Lunge Front Raise" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">8-10/side</td>
                                    <td className="py-2"><ExerciseLink name="Same Leg Lunges with Wall Support" exercises={exercises} /></td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">4</td>
                                    <td className="py-2"><ExerciseLink name="Supported Glute Bridge Marches" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">8-10/side</td>
                                    <td className="py-2"><ExerciseLink name="Pillow Glute Bridges" exercises={exercises} /></td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">5</td>
                                    <td className="py-2"><ExerciseLink name="Side Plank Hip Lifts" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">8-10/side</td>
                                    <td className="py-2"><ExerciseLink name="Side Lying Straight Leg Lifts" exercises={exercises} /></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Part 3: Finisher Flow */}
                          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                            <h5 className="font-bold text-teal-700 mb-3 flex items-center gap-2">
                              <span className="bg-teal-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                              FINISHER FLOW (5-7 mins)
                            </h5>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-teal-200">
                                    <th className="text-left py-2 text-teal-700">#</th>
                                    <th className="text-left py-2 text-teal-700">Movement <PlayAllButton url={getPlayAllUrl('program1-day1-finisher-flow')} /></th>
                                    <th className="text-left py-2 text-teal-700">Time/Reps</th>
                                    <th className="text-left py-2 text-teal-700">Notes</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-teal-100">
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">1</td>
                                    <td className="py-2"><ExerciseLink name="Supine Core Compressions" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">10 Breaths</td>
                                    <td className="py-2 text-gray-500 italic text-xs">Ribs expand, exhale slowly</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">2</td>
                                    <td className="py-2"><ExerciseLink name="Childs Pose Open Palms & Travel" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">3 each direction</td>
                                    <td className="py-2 text-gray-500 italic text-xs">Connect movement to breath</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">3</td>
                                    <td className="py-2"><ExerciseLink name="Child Pose Single Leg Inner Thigh Stretch" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">1 Min each side</td>
                                    <td className="py-2 text-gray-500 italic text-xs">Flow and decompress spine</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Part 4: Cool Down */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h5 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                              <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                              COOL DOWN (3-5 mins)
                            </h5>
                            <div className="bg-white rounded-lg p-3">
                              <p className="font-medium text-gray-800">PRENATAL COOLDOWN</p>
                              <p className="text-sm text-gray-600">8 reps of each</p>
                            </div>
                          </div>

                          {/* Things to Remember */}
                          <div className="bg-pink-50 border border-pink-300 rounded-lg p-4">
                            <h5 className="font-bold text-pink-700 mb-2">Things to Remember</h5>
                            <p className="text-sm text-pink-600">
                              Move with control — power doesn't need to be fast. | Exhale on effort — connect breath to strength. | Use props for posture, comfort, and confidence. | Modify anything that doesn't feel right. | Recovery is part of your progress.
                            </p>
                          </div>

                          {/* Precautions */}
                          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                            <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" /> Precautions
                            </h5>
                            <p className="text-xs text-amber-600">
                              Listen to Your Body: Always pay attention to how you feel and adjust accordingly. | Take Options Given: Utilize the modifications provided to suit your comfort level. | Reduce Reps or Rounds: Don't hesitate to reduce the number of repetitions or rounds if needed. | Adjust Weights: Opt for lighter weights or no weights at all if you feel any discomfort. | Stay Hydrated: Keep water close by and drink frequently to stay hydrated. | Avoid Overexertion: Stop immediately if you feel dizzy, nauseous, or overly fatigued. | Consult Your Doctor.
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* DAY 2 */}
                    <AccordionItem value="program1-day2" className="border border-purple-200 rounded-xl overflow-hidden bg-white shadow-md">
                      <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-purple-50 [&[data-state=open]]:bg-gradient-to-r [&[data-state=open]]:from-purple-100 [&[data-state=open]]:to-pink-100" data-testid="accordion-program1-day2">
                        <div className="flex items-center gap-4 w-full">
                          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                            D2
                          </div>
                          <div className="text-left flex-1">
                            <h4 className="font-bold text-purple-800">GLUTES + UPPER BODY BURN</h4>
                            <p className="text-sm text-gray-600">30-35 mins • Lower body strength and glute activation with mobility</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-6">
                        <div className="space-y-6">
                          {/* Coach's Note */}
                          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-l-4 border-pink-400 p-4 rounded-r-lg">
                            <p className="text-sm text-gray-700 italic">
                              <strong className="text-pink-600">Coach's Note:</strong> Glutes and hips support your spine, posture, and pelvis. Today we strengthen them so they can support you — now and in the months ahead. Go steady, go strong.
                            </p>
                          </div>

                          {/* Equipment & Time */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                              <h5 className="font-semibold text-cyan-700 text-sm mb-2">Equipment Needed</h5>
                              <ul className="text-xs text-cyan-600 space-y-1">
                                <li>• Dumbbells (various)</li>
                                <li>• Mini band</li>
                                <li>• Mat</li>
                              </ul>
                            </div>
                            <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                              <h5 className="font-semibold text-pink-700 text-sm mb-2">Time & Focus</h5>
                              <p className="text-xs text-pink-600">30-35 Mins</p>
                              <p className="text-xs text-pink-600 mt-1">Lower body strength and glute activation with mobility</p>
                            </div>
                          </div>

                          {/* Part 1: Warm-up */}
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                              <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                              WARM-UP (5-7 mins)
                            </h5>
                            <div className="bg-white rounded-lg p-3">
                              <p className="font-medium text-gray-800">PRENATAL WARMUP</p>
                              <p className="text-sm text-gray-600">8 reps of each</p>
                            </div>
                          </div>

                          {/* Part 2: Main Workout */}
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h5 className="font-bold text-purple-700 mb-3 flex items-center gap-2">
                              <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                              MAIN WORKOUT (3 ROUNDS) <span className="text-xs font-normal text-purple-600 ml-2">Rest 60 secs between rounds</span>
                            </h5>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-purple-200">
                                    <th className="text-left py-2 text-purple-700">#</th>
                                    <th className="text-left py-2 text-purple-700">Exercise <PlayAllButton url={getPlayAllUrl('program1-day2-main-workout')} /></th>
                                    <th className="text-left py-2 text-purple-700">Reps</th>
                                    <th className="text-left py-2 text-purple-700">Beginner Option <PlayAllButton url={getPlayAllUrl('program1-day2-beginner-option')} /></th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-100">
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">1</td>
                                    <td className="py-2"><ExerciseLink name="DB Supported Chest Press" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">10-12</td>
                                    <td className="py-2"><ExerciseLink name="Wall Supported Pushups" exercises={exercises} /></td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">2</td>
                                    <td className="py-2"><ExerciseLink name="DB Bicep Curl to Arnold Press" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">10-12 total</td>
                                    <td className="py-2"><ExerciseLink name="Band Kneeling Shoulder Press" exercises={exercises} /></td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">3</td>
                                    <td className="py-2"><ExerciseLink name="DB Sumo Squat to Upright Row" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">10-12</td>
                                    <td className="py-2"><ExerciseLink name="Sumo Squat Bodyweight" exercises={exercises} /></td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">4</td>
                                    <td className="py-2"><ExerciseLink name="Supported Glute Bridge Marches" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">20 total</td>
                                    <td className="py-2"><ExerciseLink name="Pillow Glute Bridges" exercises={exercises} /></td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">5</td>
                                    <td className="py-2"><ExerciseLink name="Mini Band Elbow Side Plank Clam Shells" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">20 total</td>
                                    <td className="py-2"><ExerciseLink name="Mini Band Lying Clamshells – Pulses" exercises={exercises} /></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Part 3: Finisher Flow */}
                          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                            <h5 className="font-bold text-teal-700 mb-3 flex items-center gap-2">
                              <span className="bg-teal-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                              FINISHER FLOW (5-7 mins) x 2 rounds
                            </h5>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-teal-200">
                                    <th className="text-left py-2 text-teal-700">#</th>
                                    <th className="text-left py-2 text-teal-700">Movement <PlayAllButton url={getPlayAllUrl('program1-day2-finisher-flow')} /></th>
                                    <th className="text-left py-2 text-teal-700">Time</th>
                                    <th className="text-left py-2 text-teal-700">Notes</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-teal-100">
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">1</td>
                                    <td className="py-2"><ExerciseLink name="Standing Arm Rotations" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">30 sec each direction</td>
                                    <td className="py-2 text-gray-500 italic text-xs">Light weights or air circles</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">2</td>
                                    <td className="py-2"><ExerciseLink name="Seated 90 90 Glute Lift Reach" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">30 sec/side</td>
                                    <td className="py-2 text-gray-500 italic text-xs">Hold gently, breathe into hips</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">3</td>
                                    <td className="py-2"><ExerciseLink name="Thread the Needle" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">5/side</td>
                                    <td className="py-2 text-gray-500 italic text-xs">Loosen up upper back and shoulders</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Part 4: Cool Down */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h5 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                              <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                              COOL DOWN (3-5 mins)
                            </h5>
                            <div className="bg-white rounded-lg p-3">
                              <p className="font-medium text-gray-800">PRENATAL COOLDOWN</p>
                              <p className="text-sm text-gray-600">8 reps of each</p>
                            </div>
                          </div>

                          {/* Things to Remember */}
                          <div className="bg-pink-50 border border-pink-300 rounded-lg p-4">
                            <h5 className="font-bold text-pink-700 mb-2">Things to Remember</h5>
                            <p className="text-sm text-pink-600">
                              Push through your heels to activate the right muscles. | Focus on form, not depth — it's not a squat contest. | Fully — slow breath = strong core. | Shake it out between rounds if needed. | Rest as often as you like.
                            </p>
                          </div>

                          {/* Precautions */}
                          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                            <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" /> Precautions
                            </h5>
                            <p className="text-xs text-amber-600">
                              Support Yourself: Use a wall or chair if balance is off. | Modify Depth: Keep ranges comfortable and pain-free. | Check Core Engagement: Watch for bulging or doming. | Avoid Rushing: Control reps for better form. | Stay Hydrated: Sip between sets. | Stop if You Feel Off.
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* DAY 3 */}
                    <AccordionItem value="program1-day3" className="border border-purple-200 rounded-xl overflow-hidden bg-white shadow-md">
                      <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-purple-50 [&[data-state=open]]:bg-gradient-to-r [&[data-state=open]]:from-purple-100 [&[data-state=open]]:to-pink-100" data-testid="accordion-program1-day3">
                        <div className="flex items-center gap-4 w-full">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                            D3
                          </div>
                          <div className="text-left flex-1">
                            <h4 className="font-bold text-purple-800">FUNCTIONAL CONDITIONING CIRCUIT</h4>
                            <p className="text-sm text-gray-600">30 mins • Upper body and postural strength</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-6">
                        <div className="space-y-6">
                          {/* Coach's Note */}
                          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-l-4 border-pink-400 p-4 rounded-r-lg">
                            <p className="text-sm text-gray-700 italic">
                              <strong className="text-pink-600">Coach's Note:</strong> Strong arms and an open chest help more than just posture — they prep you for holding, lifting, and living. Today's about building that strength from the inside out.
                            </p>
                          </div>

                          {/* Equipment & Time */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                              <h5 className="font-semibold text-cyan-700 text-sm mb-2">Equipment Needed</h5>
                              <ul className="text-xs text-cyan-600 space-y-1">
                                <li>• Dumbbells (various)</li>
                                <li>• Long Resistance Band</li>
                                <li>• Mini band</li>
                                <li>• Mat</li>
                              </ul>
                            </div>
                            <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                              <h5 className="font-semibold text-pink-700 text-sm mb-2">Time & Focus</h5>
                              <p className="text-xs text-pink-600">30 Mins</p>
                              <p className="text-xs text-pink-600 mt-1">Upper body and postural strength</p>
                            </div>
                          </div>

                          {/* Part 1: Warm-up */}
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                              <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                              WARM-UP (5-7 mins)
                            </h5>
                            <div className="bg-white rounded-lg p-3">
                              <p className="font-medium text-gray-800">PRENATAL WARMUP</p>
                              <p className="text-sm text-gray-600">8 reps of each</p>
                            </div>
                          </div>

                          {/* Part 2: Main Workout */}
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h5 className="font-bold text-purple-700 mb-3 flex items-center gap-2">
                              <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                              MAIN WORKOUT: CIRCUIT STYLE (2 ROUNDS)
                            </h5>
                            <p className="text-xs text-purple-600 mb-3 italic">Format: 40 sec work / 40 sec rest — 2 rounds of all. Rest up to a minute or as required between exercises.</p>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-purple-200">
                                    <th className="text-left py-2 text-purple-700">#</th>
                                    <th className="text-left py-2 text-purple-700">Exercise <PlayAllButton url={getPlayAllUrl('program1-day3-main-workout')} /></th>
                                    <th className="text-left py-2 text-purple-700">Time</th>
                                    <th className="text-left py-2 text-purple-700">Beginner Options <PlayAllButton url={getPlayAllUrl('program1-day3-beginner-option')} /></th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-100">
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">1</td>
                                    <td className="py-2"><ExerciseLink name="Band Squat to Front Raise" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600" rowSpan={5}>40 sec work / 40 sec rest per exercise</td>
                                    <td className="py-2"><ExerciseLink name="Bodyweight Squats" exercises={exercises} /></td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">2</td>
                                    <td className="py-2"><ExerciseLink name="Band Squat to Wide Row" exercises={exercises} /></td>
                                    <td className="py-2"><ExerciseLink name="Band Seated Narrow Rows" exercises={exercises} /></td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">3</td>
                                    <td className="py-2"><ExerciseLink name="Mini Band Modified Jumping Jacks" exercises={exercises} /></td>
                                    <td className="py-2"><ExerciseLink name="Mini Band Modified Jumping Jacks" exercises={exercises} /></td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">4</td>
                                    <td className="py-2"><ExerciseLink name="Mini Band Traveling Squat" exercises={exercises} /></td>
                                    <td className="py-2"><ExerciseLink name="Band Standing Side Leg Abductors" exercises={exercises} /></td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">5</td>
                                    <td className="py-2"><ExerciseLink name="Mini Band Glute Bridge Pull Aparts" exercises={exercises} /></td>
                                    <td className="py-2"><ExerciseLink name="Pillow Ball Squeeze Glute Bridges" exercises={exercises} /></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Part 3: Finisher Flow */}
                          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                            <h5 className="font-bold text-teal-700 mb-3 flex items-center gap-2">
                              <span className="bg-teal-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                              FINISHER FLOW (5-7 mins)
                            </h5>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-teal-200">
                                    <th className="text-left py-2 text-teal-700">#</th>
                                    <th className="text-left py-2 text-teal-700">Movement <PlayAllButton url={getPlayAllUrl('program1-day3-finisher-flow')} /></th>
                                    <th className="text-left py-2 text-teal-700">Time</th>
                                    <th className="text-left py-2 text-teal-700">Notes</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-teal-100">
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">1</td>
                                    <td className="py-2"><ExerciseLink name="Sumo Squat Hold with Upper Twists" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">1 min</td>
                                    <td className="py-2 text-gray-500 italic text-xs">Sit back, rotate gently</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">2</td>
                                    <td className="py-2"><ExerciseLink name="Bird Dog Bodyweight" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">1 min</td>
                                    <td className="py-2 text-gray-500 italic text-xs">Exhale with each rep</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">3</td>
                                    <td className="py-2"><ExerciseLink name="Core Compressions Wall Sits" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">1 min</td>
                                    <td className="py-2 text-gray-500 italic text-xs">Cool the body, connect with breath</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Part 4: Cool Down */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h5 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                              <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                              COOL DOWN (3-5 mins)
                            </h5>
                            <div className="bg-white rounded-lg p-3">
                              <p className="font-medium text-gray-800">PRENATAL COOLDOWN</p>
                              <p className="text-sm text-gray-600">8 reps of each</p>
                            </div>
                          </div>

                          {/* Things to Remember */}
                          <div className="bg-pink-50 border border-pink-300 rounded-lg p-4">
                            <h5 className="font-bold text-pink-700 mb-2">Things to Remember</h5>
                            <p className="text-sm text-pink-600">
                              Relax your shoulders — tension isn't strength. | Stay tall — ribs over hips, chin neutral. | Exhale as you lift or press. | Stretch between rounds if needed. | Strength now = support later.
                            </p>
                          </div>

                          {/* Precautions */}
                          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                            <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" /> Precautions
                            </h5>
                            <p className="text-xs text-amber-600">
                              Adjust Weights: Lighter is fine — quality matters more. | Use a Chair: If standing for long feels tough. | Avoid Overhead Strain: Keep range natural. | Take Breaks: Especially if breath or fatigue kicks in. | Hydrate Freely: Water before, during, and after. | Modify Anything: You know your limits best.
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* DAY 4 */}
                    <AccordionItem value="program1-day4" className="border border-purple-200 rounded-xl overflow-hidden bg-white shadow-md">
                      <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-purple-50 [&[data-state=open]]:bg-gradient-to-r [&[data-state=open]]:from-purple-100 [&[data-state=open]]:to-pink-100" data-testid="accordion-program1-day4">
                        <div className="flex items-center gap-4 w-full">
                          <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                            D4
                          </div>
                          <div className="text-left flex-1">
                            <h4 className="font-bold text-purple-800">CORE + SHOULDER STABILITY</h4>
                            <p className="text-sm text-gray-600">25-30 mins • Core + glutes combo for functional support</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-6">
                        <div className="space-y-6">
                          {/* Coach's Note */}
                          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-l-4 border-pink-400 p-4 rounded-r-lg">
                            <p className="text-sm text-gray-700 italic">
                              <strong className="text-pink-600">Coach's Note:</strong> This is the magic combo — your glutes and deep core work together to support your pelvis and spine. Keep the movements subtle, controlled, and full of breath. Small effort, big impact.
                            </p>
                          </div>

                          {/* Equipment & Time */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                              <h5 className="font-semibold text-cyan-700 text-sm mb-2">Equipment Needed</h5>
                              <ul className="text-xs text-cyan-600 space-y-1">
                                <li>• Dumbbells (various)</li>
                                <li>• Long Resistance Band</li>
                                <li>• Mini bands</li>
                                <li>• Mat</li>
                              </ul>
                            </div>
                            <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                              <h5 className="font-semibold text-pink-700 text-sm mb-2">Time & Focus</h5>
                              <p className="text-xs text-pink-600">25-30 Mins</p>
                              <p className="text-xs text-pink-600 mt-1">Core + glutes combo for functional support</p>
                            </div>
                          </div>

                          {/* Part 1: Warm-up */}
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                              <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                              WARM-UP (5-7 mins)
                            </h5>
                            <div className="bg-white rounded-lg p-3">
                              <p className="font-medium text-gray-800">PRENATAL WARMUP</p>
                              <p className="text-sm text-gray-600">8 reps of each</p>
                            </div>
                          </div>

                          {/* Part 2: Main Workout */}
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h5 className="font-bold text-purple-700 mb-3 flex items-center gap-2">
                              <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                              MAIN WORKOUT (3 ROUNDS)
                            </h5>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-purple-200">
                                    <th className="text-left py-2 text-purple-700">#</th>
                                    <th className="text-left py-2 text-purple-700">Exercise <PlayAllButton url={getPlayAllUrl('program1-day4-main-workout')} /></th>
                                    <th className="text-left py-2 text-purple-700">Reps</th>
                                    <th className="text-left py-2 text-purple-700">Beginner Option <PlayAllButton url={getPlayAllUrl('program1-day4-beginner-option')} /></th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-100">
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">1</td>
                                    <td className="py-2"><ExerciseLink name="DB Bird Dog Rows" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">10/side</td>
                                    <td className="py-2"><ExerciseLink name="Bird Dog Bodyweight" exercises={exercises} /></td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">2</td>
                                    <td className="py-2"><ExerciseLink name="DB Seated Shoulder Press" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">12</td>
                                    <td className="py-2"><ExerciseLink name="DB Seated Shoulder Press" exercises={exercises} /></td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">3</td>
                                    <td className="py-2"><ExerciseLink name="DB Seated Lateral Raises" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">12</td>
                                    <td className="py-2"><ExerciseLink name="DB Seated Lateral Raises" exercises={exercises} /></td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">4</td>
                                    <td className="py-2"><ExerciseLink name="Marching Band Wrist Pull Aparts" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">20 total</td>
                                    <td className="py-2"><ExerciseLink name="Marching Band Wrist Pull Aparts" exercises={exercises} /></td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">5</td>
                                    <td className="py-2"><ExerciseLink name="Side Plank with Knee Rested Leg Lifts" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">20 total / 20 secs</td>
                                    <td className="py-2"><ExerciseLink name="Knee Side Plank Leg Lift with Hold" exercises={exercises} /></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Part 3: Finisher Flow */}
                          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                            <h5 className="font-bold text-teal-700 mb-3 flex items-center gap-2">
                              <span className="bg-teal-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                              FINISHER FLOW (5-7 mins) x 2 rounds
                            </h5>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-teal-200">
                                    <th className="text-left py-2 text-teal-700">#</th>
                                    <th className="text-left py-2 text-teal-700">Movement <PlayAllButton url={getPlayAllUrl('program1-day4-finisher-flow')} /></th>
                                    <th className="text-left py-2 text-teal-700">Time</th>
                                    <th className="text-left py-2 text-teal-700">Notes</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-teal-100">
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">1</td>
                                    <td className="py-2"><ExerciseLink name="Sumo Squat Hold with Upper Twists" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">1 min</td>
                                    <td className="py-2 text-gray-500 italic text-xs">Sit back, rotate gently</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">2</td>
                                    <td className="py-2"><ExerciseLink name="All Fours Shoulder Taps" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">1 min</td>
                                    <td className="py-2 text-gray-500 italic text-xs">Hands under shoulders. Knees under hips</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">3</td>
                                    <td className="py-2"><ExerciseLink name="Seated Figure 8 Arms Lifts" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">1 min</td>
                                    <td className="py-2 text-gray-500 italic text-xs"></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Part 4: Cool Down */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h5 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                              <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                              COOL DOWN (3-5 mins)
                            </h5>
                            <div className="bg-white rounded-lg p-3">
                              <p className="font-medium text-gray-800">PRENATAL COOLDOWN</p>
                              <p className="text-sm text-gray-600">8 reps of each</p>
                            </div>
                          </div>

                          {/* Things to Remember */}
                          <div className="bg-pink-50 border border-pink-300 rounded-lg p-4">
                            <h5 className="font-bold text-pink-700 mb-2">Things to Remember</h5>
                            <p className="text-sm text-pink-600">
                              Less is more — feel, don't force. | Stay low and slow — no jerky motions. | Use breath like a brace. | Props = not weakness. | Repeat moves that feel really good.
                            </p>
                          </div>

                          {/* Precautions */}
                          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                            <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" /> Precautions
                            </h5>
                            <p className="text-xs text-amber-600">
                              No Straining: Especially around core or pelvis. | Gentle Engagement Only: No "crunch" style effort. | Use Wall or Floor Support: Reduce load where needed. | Avoid Holding Breath: Exhale always on effort. | Skip if Unsure: If it feels off, leave it out. | Consult Doctor for Any Pain.
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* DAY 5 */}
                    <AccordionItem value="program1-day5" className="border border-purple-200 rounded-xl overflow-hidden bg-white shadow-md">
                      <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-purple-50 [&[data-state=open]]:bg-gradient-to-r [&[data-state=open]]:from-purple-100 [&[data-state=open]]:to-pink-100" data-testid="accordion-program1-day5">
                        <div className="flex items-center gap-4 w-full">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                            D5
                          </div>
                          <div className="text-left flex-1">
                            <h4 className="font-bold text-purple-800">STRENGTH + MOBILITY RESET</h4>
                            <p className="text-sm text-gray-600">25-30 mins • Total body flow with mobility + breath reset</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-6">
                        <div className="space-y-6">
                          {/* Coach's Note */}
                          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-l-4 border-pink-400 p-4 rounded-r-lg">
                            <p className="text-sm text-gray-700 italic">
                              <strong className="text-pink-600">Coach's Note:</strong> You've made it through the week — this one's for your nervous system. Flow gently, stay present, and let breath lead the way. There's strength in slowing down.
                            </p>
                          </div>

                          {/* Equipment & Time */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                              <h5 className="font-semibold text-cyan-700 text-sm mb-2">Equipment Needed</h5>
                              <ul className="text-xs text-cyan-600 space-y-1">
                                <li>• Dumbbells (various)</li>
                                <li>• Resistance Band</li>
                                <li>• Mat</li>
                              </ul>
                            </div>
                            <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                              <h5 className="font-semibold text-pink-700 text-sm mb-2">Time & Focus</h5>
                              <p className="text-xs text-pink-600">25-30 Mins</p>
                              <p className="text-xs text-pink-600 mt-1">Total body flow with mobility + breath reset</p>
                            </div>
                          </div>

                          {/* Part 1: Warm-up */}
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                              <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                              WARM-UP (5-7 mins)
                            </h5>
                            <div className="bg-white rounded-lg p-3">
                              <p className="font-medium text-gray-800">PRENATAL WARMUP</p>
                              <p className="text-sm text-gray-600">8 reps of each</p>
                            </div>
                          </div>

                          {/* Part 2: Main Workout */}
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h5 className="font-bold text-purple-700 mb-3 flex items-center gap-2">
                              <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                              MAIN WORKOUT (3 ROUNDS)
                            </h5>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-purple-200">
                                    <th className="text-left py-2 text-purple-700">#</th>
                                    <th className="text-left py-2 text-purple-700">Exercise <PlayAllButton url={getPlayAllUrl('program1-day5-main-workout')} /></th>
                                    <th className="text-left py-2 text-purple-700">Reps</th>
                                    <th className="text-left py-2 text-purple-700">Beginner Option <PlayAllButton url={getPlayAllUrl('program1-day5-beginner-option')} /></th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-100">
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">1</td>
                                    <td className="py-2"><ExerciseLink name="DB Reverse Lunges" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">16 total</td>
                                    <td className="py-2"><ExerciseLink name="Bodyweight Reverse Lunges" exercises={exercises} /></td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">2</td>
                                    <td className="py-2"><ExerciseLink name="DB Stiff Deadlifts" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">10-12</td>
                                    <td className="py-2"><ExerciseLink name="Band Stiff Deadlifts" exercises={exercises} /></td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">3</td>
                                    <td className="py-2"><ExerciseLink name="DB Side Lunge to Double Arm Rows" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">20 total</td>
                                    <td className="py-2"><ExerciseLink name="Side Lunges" exercises={exercises} /></td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">4</td>
                                    <td className="py-2"><ExerciseLink name="Knee Pushups" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">10</td>
                                    <td className="py-2"><ExerciseLink name="Wall Supported Pushups" exercises={exercises} /></td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">5</td>
                                    <td className="py-2"><ExerciseLink name="Bear Crawl to Plank" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">10 reps</td>
                                    <td className="py-2"><ExerciseLink name="Bear Crawls Knee Lifts" exercises={exercises} /></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Part 3: Finisher Flow */}
                          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                            <h5 className="font-bold text-teal-700 mb-3 flex items-center gap-2">
                              <span className="bg-teal-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                              FINISHER FLOW (5-7 mins)
                            </h5>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-teal-200">
                                    <th className="text-left py-2 text-teal-700">#</th>
                                    <th className="text-left py-2 text-teal-700">Movement <PlayAllButton url={getPlayAllUrl('program1-day5-finisher-flow')} /></th>
                                    <th className="text-left py-2 text-teal-700">Time/Reps</th>
                                    <th className="text-left py-2 text-teal-700">Notes</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-teal-100">
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">1</td>
                                    <td className="py-2"><ExerciseLink name="Same Side Single Leg Stretch & Reach" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">6 reps per side</td>
                                    <td className="py-2 text-gray-500 italic text-xs">Inhale on rock, exhale on reach</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">2</td>
                                    <td className="py-2"><ExerciseLink name="Pigeon Stretch" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">6 reps per side</td>
                                    <td className="py-2 text-gray-500 italic text-xs">Inhale back, exhale forward</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">3</td>
                                    <td className="py-2"><ExerciseLink name="Seated Kneeling Blocks Core Compressions" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">5 breaths</td>
                                    <td className="py-2 text-gray-500 italic text-xs">Focus on full expansion & release</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Part 4: Cool Down */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h5 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                              <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                              COOL DOWN (3-5 mins)
                            </h5>
                            <div className="bg-white rounded-lg p-3">
                              <p className="font-medium text-gray-800">PRENATAL COOLDOWN</p>
                              <p className="text-sm text-gray-600">8 reps of each</p>
                            </div>
                          </div>

                          {/* Things to Remember */}
                          <div className="bg-pink-50 border border-pink-300 rounded-lg p-4">
                            <h5 className="font-bold text-pink-700 mb-2">Things to Remember</h5>
                            <p className="text-sm text-pink-600">
                              Flow, don't force — ease into each move. | Breathe slow, steady, and fully. | Pause between moves to reset. | Stretch where it feels needed most. | This is recovery, not just movement.
                            </p>
                          </div>

                          {/* Precautions */}
                          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                            <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" /> Precautions
                            </h5>
                            <p className="text-xs text-amber-600">
                              Avoid Fast Transitions: Move between positions with care. | No Long Holds: Stay in your comfort zone. | Use Cushions: Under knees, hips, or back for comfort. | Hydrate After: Post-flow hydration helps recovery. | Modify Everything: Nothing here needs to be "perfect."
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                      </Accordion>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* PROGRAM 2: STEADY & STRONG */}
                <Accordion type="single" collapsible className="mb-8 mt-10">
                  <AccordionItem value="program2" className="border-0">
                    <AccordionTrigger className="p-0 hover:no-underline [&>svg]:hidden" data-testid="accordion-program2">
                      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl w-full">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-4xl font-bold">2</span>
                          </div>
                          <div className="text-center sm:text-left flex-1">
                            <p className="text-sm opacity-90 uppercase tracking-wide">Program 2 (4-Day Week)</p>
                            <h3 className="text-3xl font-bold">STEADY & STRONG</h3>
                            <p className="text-sm opacity-90 mt-2 italic">Moderate energy. You want structure, but with breathing room.</p>
                          </div>
                          <ChevronDown className="w-6 h-6 text-white/80 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-6 pb-0">
                      <Accordion type="single" collapsible className="space-y-4">
                    {/* P2 DAY 1 */}
                    <AccordionItem value="program2-day1" className="border border-purple-200 rounded-xl overflow-hidden bg-white shadow-md">
                      <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-purple-50 [&[data-state=open]]:bg-gradient-to-r [&[data-state=open]]:from-purple-100 [&[data-state=open]]:to-indigo-100" data-testid="accordion-program2-day1">
                        <div className="flex items-center gap-4 w-full">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                            D1
                          </div>
                          <div className="text-left flex-1">
                            <h4 className="font-bold text-purple-800">FULL BODY BURN + CORE</h4>
                            <p className="text-sm text-gray-600">30 mins • Lower body strength with mobility and balance</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-6">
                        <div className="space-y-6">
                          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                            <p className="text-sm text-gray-700 italic">
                              <strong className="text-purple-600">Coach's Note:</strong> We're building strength from the ground up. This session focuses on stability through your hips, glutes, and legs — the foundation of support during pregnancy.
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                              <h5 className="font-semibold text-indigo-700 text-sm mb-2">Equipment Needed</h5>
                              <ul className="text-xs text-indigo-600 space-y-1">
                                <li>• Dumbbells (various)</li>
                                <li>• Long resistance band</li>
                                <li>• Mat</li>
                              </ul>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                              <h5 className="font-semibold text-purple-700 text-sm mb-2">Time & Focus</h5>
                              <p className="text-xs text-purple-600">30 Mins</p>
                              <p className="text-xs text-purple-600 mt-1">Lower body strength with mobility</p>
                            </div>
                          </div>

                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                              <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                              WARM-UP (5-7 mins)
                            </h5>
                            <div className="bg-white rounded-lg p-3">
                              <p className="font-medium text-gray-800">PRENATAL WARMUP</p>
                              <p className="text-sm text-gray-600">8 reps of each</p>
                            </div>
                          </div>

                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h5 className="font-bold text-purple-700 mb-3 flex items-center gap-2">
                              <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                              MAIN WORKOUT (3 ROUNDS) <span className="font-normal text-xs ml-2">45 secs-1 min rest between exercises</span>
                            </h5>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-purple-200">
                                    <th className="text-left py-2 text-purple-700">#</th>
                                    <th className="text-left py-2 text-purple-700">Exercise <PlayAllButton url={getPlayAllUrl('program2-day1-main-workout')} /></th>
                                    <th className="text-left py-2 text-purple-700">Reps</th>
                                    <th className="text-left py-2 text-purple-700">Beginner Option <PlayAllButton url={getPlayAllUrl('program2-day1-beginner-option')} /></th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-100">
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">1</td>
                                    <td className="py-2"><ExerciseLink name="DB Deadlift + 1 DB Bentover Row" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">10-12</td>
                                    <td className="py-2 text-indigo-600">Light DBs or Band</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">2</td>
                                    <td className="py-2"><ExerciseLink name="Single Leg Reverse Lunge to Knee Lift" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">8-10/side</td>
                                    <td className="py-2 text-indigo-600">No Weights</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">3</td>
                                    <td className="py-2"><ExerciseLink name="Squat with Overhead Arm Reach" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">10</td>
                                    <td className="py-2 text-indigo-600">Squat Seated on Chair</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">4</td>
                                    <td className="py-2"><ExerciseLink name="Glute Bridge with Cross Reach" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">16</td>
                                    <td className="py-2 text-indigo-600">No Band</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">5</td>
                                    <td className="py-2"><ExerciseLink name="Seated 90 90 Glute Stretch with Rotation" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">1 min</td>
                                    <td className="py-2 text-indigo-600">Same Exercise</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                            <h5 className="font-bold text-teal-700 mb-3 flex items-center gap-2">
                              <span className="bg-teal-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                              FINISHER FLOW (5-7 mins)
                            </h5>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-teal-200">
                                    <th className="text-left py-2 text-teal-700">#</th>
                                    <th className="text-left py-2 text-teal-700">Movement <PlayAllButton url={getPlayAllUrl('program2-day1-finisher-flow')} /></th>
                                    <th className="text-left py-2 text-teal-700">Time</th>
                                    <th className="text-left py-2 text-teal-700">Notes</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-teal-100">
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">1</td>
                                    <td className="py-2"><ExerciseLink name="Modified Knee to Elbow Opp" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">1 min</td>
                                    <td className="py-2 text-gray-500 italic text-xs">Gentle rotation</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">2</td>
                                    <td className="py-2"><ExerciseLink name="Supine Core Compressions" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">5 breaths</td>
                                    <td className="py-2 text-gray-500 italic text-xs">Ribs expand, exhale slowly</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">3</td>
                                    <td className="py-2"><ExerciseLink name="All Fours with Ball Pelvic Tilts" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">1 min</td>
                                    <td className="py-2 text-gray-500 italic text-xs">Open hips + lats</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h5 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                              <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                              COOL DOWN (3-5 mins)
                            </h5>
                            <div className="bg-white rounded-lg p-3">
                              <p className="font-medium text-gray-800">PRENATAL COOLDOWN</p>
                              <p className="text-sm text-gray-600">8 reps of each</p>
                            </div>
                          </div>

                          <div className="bg-pink-50 border border-pink-300 rounded-lg p-4">
                            <h5 className="font-bold text-pink-700 mb-2">Things to Remember</h5>
                            <p className="text-sm text-pink-600">
                              Push through your heels and feel the glutes activate. | Keep your stance steady and use a wall if needed. | Exhale as you rise or press. | Soft knees, slow reps. | Mobility matters just as much as strength.
                            </p>
                          </div>

                          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                            <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" /> Precautions
                            </h5>
                            <p className="text-xs text-amber-600">
                              Use Support: Wall or chair if balance feels off. | Avoid Deep Bends: Work in a comfortable range. | Check Core: Engage lightly — no strain or bulge. | Hydrate Throughout: Sip water regularly. | Slow Down: Quality reps over rushed sets. | Stop if Anything Feels Off.
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* P2 DAY 2 */}
                    <AccordionItem value="program2-day2" className="border border-purple-200 rounded-xl overflow-hidden bg-white shadow-md">
                      <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-purple-50 [&[data-state=open]]:bg-gradient-to-r [&[data-state=open]]:from-purple-100 [&[data-state=open]]:to-indigo-100" data-testid="accordion-program2-day2">
                        <div className="flex items-center gap-4 w-full">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                            D2
                          </div>
                          <div className="text-left flex-1">
                            <h4 className="font-bold text-purple-800">GLUTES + POSTURE</h4>
                            <p className="text-sm text-gray-600">30-35 mins • Upper body strength and postural awareness</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-6">
                        <div className="space-y-6">
                          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                            <p className="text-sm text-gray-700 italic">
                              <strong className="text-purple-600">Coach's Note:</strong> Strong arms, open shoulders, supported posture — this is your upper body support system. Take your time. Exhale through every effort and stay tall throughout.
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                              <h5 className="font-semibold text-indigo-700 text-sm mb-2">Equipment Needed</h5>
                              <ul className="text-xs text-indigo-600 space-y-1">
                                <li>• Dumbbells (various)</li>
                                <li>• Long resistance band</li>
                                <li>• Mat & Yoga block</li>
                              </ul>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                              <h5 className="font-semibold text-purple-700 text-sm mb-2">Time & Focus</h5>
                              <p className="text-xs text-purple-600">30-35 Mins</p>
                              <p className="text-xs text-purple-600 mt-1">Upper body strength & postural awareness</p>
                            </div>
                          </div>

                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                              <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                              WARM-UP (5-7 mins)
                            </h5>
                            <div className="bg-white rounded-lg p-3">
                              <p className="font-medium text-gray-800">PRENATAL WARMUP</p>
                              <p className="text-sm text-gray-600">8 reps of each</p>
                            </div>
                          </div>

                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h5 className="font-bold text-purple-700 mb-3 flex items-center gap-2">
                              <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                              MAIN WORKOUT (3 ROUNDS)
                            </h5>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-purple-200">
                                    <th className="text-left py-2 text-purple-700">#</th>
                                    <th className="text-left py-2 text-purple-700">Exercise <PlayAllButton url={getPlayAllUrl('program2-day2-main-workout')} /></th>
                                    <th className="text-left py-2 text-purple-700">Reps</th>
                                    <th className="text-left py-2 text-purple-700">Beginner Option <PlayAllButton url={getPlayAllUrl('program2-day2-beginner-option')} /></th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-100">
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">1</td>
                                    <td className="py-2"><ExerciseLink name="Glute Bridge Marches" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">8-10</td>
                                    <td className="py-2 text-indigo-600">Glute Bridge Lifts</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">2</td>
                                    <td className="py-2"><ExerciseLink name="Kneeling Band Pull Aparts on Yoga Block" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">12</td>
                                    <td className="py-2 text-indigo-600">—</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">3</td>
                                    <td className="py-2"><ExerciseLink name="DBs Alternating Lunges" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">8-10/side</td>
                                    <td className="py-2 text-indigo-600">Lunges with Wall Support</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">4</td>
                                    <td className="py-2"><ExerciseLink name="Band - Seated Wide Row" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">10-12</td>
                                    <td className="py-2 text-indigo-600">Band Seated Narrow Rows</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">5</td>
                                    <td className="py-2"><ExerciseLink name="Band Glute Kickbacks on All Fours" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">10-12/side</td>
                                    <td className="py-2 text-indigo-600">Wall Supported Single Leg Kickbacks</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                            <h5 className="font-bold text-teal-700 mb-3 flex items-center gap-2">
                              <span className="bg-teal-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                              FINISHER FLOW (5-7 mins)
                            </h5>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-teal-200">
                                    <th className="text-left py-2 text-teal-700">#</th>
                                    <th className="text-left py-2 text-teal-700">Movement <PlayAllButton url={getPlayAllUrl('program2-day2-finisher-flow')} /></th>
                                    <th className="text-left py-2 text-teal-700">Time</th>
                                    <th className="text-left py-2 text-teal-700">Notes</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-teal-100">
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">1</td>
                                    <td className="py-2"><ExerciseLink name="Wall Angels (Seated or Standing)" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">8-10</td>
                                    <td className="py-2 text-gray-500 italic text-xs">Focus on slow shoulder opening</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">2</td>
                                    <td className="py-2"><ExerciseLink name="Childs Pose with Open Palms & Travel" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">5 breaths/side</td>
                                    <td className="py-2 text-gray-500 italic text-xs">Inhale back, exhale reach</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">3</td>
                                    <td className="py-2"><ExerciseLink name="Seated Arms in Figure 8 Rotations" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">30 sec/side</td>
                                    <td className="py-2 text-gray-500 italic text-xs">Breathe into glutes + hips</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h5 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                              <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                              COOL DOWN (3-5 mins)
                            </h5>
                            <div className="bg-white rounded-lg p-3">
                              <p className="font-medium text-gray-800">PRENATAL COOLDOWN</p>
                              <p className="text-sm text-gray-600">8 reps of each</p>
                            </div>
                          </div>

                          <div className="bg-pink-50 border border-pink-300 rounded-lg p-4">
                            <h5 className="font-bold text-pink-700 mb-2">Things to Remember</h5>
                            <p className="text-sm text-pink-600">
                              Keep shoulders soft — drop them away from ears. | Stand tall — ribs stacked over hips. | Use light weights with tempo. | Pause between sets to reset. | Breath leads movement.
                            </p>
                          </div>

                          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                            <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" /> Precautions
                            </h5>
                            <p className="text-xs text-amber-600">
                              No Overhead Overload: Use light weights if reaching above head. | Modify Standing: Use seated versions if tired. | Avoid Tension: Loosen up between sets. | Take Rests Freely: Especially if breath shortens. | Skip or Change Moves as Needed.
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* P2 DAY 3 */}
                    <AccordionItem value="program2-day3" className="border border-purple-200 rounded-xl overflow-hidden bg-white shadow-md">
                      <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-purple-50 [&[data-state=open]]:bg-gradient-to-r [&[data-state=open]]:from-purple-100 [&[data-state=open]]:to-indigo-100" data-testid="accordion-program2-day3">
                        <div className="flex items-center gap-4 w-full">
                          <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                            D3
                          </div>
                          <div className="text-left flex-1">
                            <h4 className="font-bold text-purple-800">ACTIVE RECOVERY FLOW</h4>
                            <p className="text-sm text-gray-600">25-30 mins • Core and glute coordination</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-6">
                        <div className="space-y-6">
                          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                            <p className="text-sm text-gray-700 italic">
                              <strong className="text-purple-600">Coach's Note:</strong> Today's about connection — glutes and core working together with breath and control. These muscles are subtle, deep, and powerful. Feel into every rep.
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                              <h5 className="font-semibold text-indigo-700 text-sm mb-2">Equipment Needed</h5>
                              <ul className="text-xs text-indigo-600 space-y-1">
                                <li>• Resistance Band</li>
                                <li>• Mat</li>
                                <li>• Cushion or Block</li>
                              </ul>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                              <h5 className="font-semibold text-purple-700 text-sm mb-2">Time & Focus</h5>
                              <p className="text-xs text-purple-600">25-30 Mins</p>
                              <p className="text-xs text-purple-600 mt-1">Core and glute coordination</p>
                            </div>
                          </div>

                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                              <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                              WARM-UP (5-7 mins)
                            </h5>
                            <div className="bg-white rounded-lg p-3">
                              <p className="font-medium text-gray-800">PRENATAL WARMUP</p>
                              <p className="text-sm text-gray-600">8 reps of each</p>
                            </div>
                          </div>

                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h5 className="font-bold text-purple-700 mb-3 flex items-center gap-2">
                              <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                              MAIN WORKOUT (2-3 ROUNDS)
                            </h5>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-purple-200">
                                    <th className="text-left py-2 text-purple-700">#</th>
                                    <th className="text-left py-2 text-purple-700">Exercise <PlayAllButton url={getPlayAllUrl('program2-day3-main-workout')} /></th>
                                    <th className="text-left py-2 text-purple-700">Reps</th>
                                    <th className="text-left py-2 text-purple-700">Beginner Option <PlayAllButton url={getPlayAllUrl('program2-day3-beginner-option')} /></th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-100">
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">1</td>
                                    <td className="py-2"><ExerciseLink name="Bear Crawl Pelvic Tilts + Thread the Needle" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">5 each</td>
                                    <td className="py-2 text-indigo-600">Bear Crawl Pelvic Tilts</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">2</td>
                                    <td className="py-2"><ExerciseLink name="Kneeling Ball Squeeze Band Pull" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">8/side</td>
                                    <td className="py-2 text-indigo-600">Kneeling Ball Squeeze / Core Lean Back</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">3</td>
                                    <td className="py-2"><ExerciseLink name="Bird Dog Bodyweight" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">10/side</td>
                                    <td className="py-2 text-indigo-600">Bird Dog Bodyweight</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">4</td>
                                    <td className="py-2"><ExerciseLink name="Pillow Glute Bridges" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">10</td>
                                    <td className="py-2 text-indigo-600">Supine Bodyweight Bridges</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">5</td>
                                    <td className="py-2"><ExerciseLink name="Side Plank Hip Lifts" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">10/side</td>
                                    <td className="py-2 text-indigo-600">Side Lying Marches</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                            <h5 className="font-bold text-teal-700 mb-3 flex items-center gap-2">
                              <span className="bg-teal-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                              FINISHER FLOW (5-7 mins)
                            </h5>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-teal-200">
                                    <th className="text-left py-2 text-teal-700">#</th>
                                    <th className="text-left py-2 text-teal-700">Movement <PlayAllButton url={getPlayAllUrl('program2-day3-finisher-flow')} /></th>
                                    <th className="text-left py-2 text-teal-700">Time</th>
                                    <th className="text-left py-2 text-teal-700">Notes</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-teal-100">
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">1</td>
                                    <td className="py-2"><ExerciseLink name="Cross Legged Twists" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">30 sec/side</td>
                                    <td className="py-2 text-gray-500 italic text-xs">Slow + supported</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">2</td>
                                    <td className="py-2"><ExerciseLink name="Cross Legged Cross Hands Release" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">10 reps each</td>
                                    <td className="py-2 text-gray-500 italic text-xs">Relax into it</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">3</td>
                                    <td className="py-2"><ExerciseLink name="Supine Core Compressions" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">5-6 breaths</td>
                                    <td className="py-2 text-gray-500 italic text-xs">Hands on belly and ribs</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h5 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                              <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                              COOL DOWN (3-5 mins)
                            </h5>
                            <div className="bg-white rounded-lg p-3">
                              <p className="font-medium text-gray-800">PRENATAL COOLDOWN</p>
                              <p className="text-sm text-gray-600">8 reps of each</p>
                            </div>
                          </div>

                          <div className="bg-pink-50 border border-pink-300 rounded-lg p-4">
                            <h5 className="font-bold text-pink-700 mb-2">Things to Remember</h5>
                            <p className="text-sm text-pink-600">
                              Breathe intentionally — exhale on the effort. | Keep movements small and smooth. | Use props for cushion and comfort. | Go by feel, not by reps. | Reset between rounds with rest or breathwork.
                            </p>
                          </div>

                          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                            <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" /> Precautions
                            </h5>
                            <p className="text-xs text-amber-600">
                              Avoid Pressure: No bulging or straining in the core. | Reduce Load: Go bodyweight if needed. | Use Wall or Mat for Support. | Modify or Skip Anything That Feels Wrong. | Hydrate Before and After.
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* P2 DAY 4 */}
                    <AccordionItem value="program2-day4" className="border border-purple-200 rounded-xl overflow-hidden bg-white shadow-md">
                      <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-purple-50 [&[data-state=open]]:bg-gradient-to-r [&[data-state=open]]:from-purple-100 [&[data-state=open]]:to-indigo-100" data-testid="accordion-program2-day4">
                        <div className="flex items-center gap-4 w-full">
                          <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                            D4
                          </div>
                          <div className="text-left flex-1">
                            <h4 className="font-bold text-purple-800">FUNCTIONAL STRENGTH + CORE</h4>
                            <p className="text-sm text-gray-600">25-30 mins • Gentle full-body strength with mobility flow</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-6">
                        <div className="space-y-6">
                          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                            <p className="text-sm text-gray-700 italic">
                              <strong className="text-purple-600">Coach's Note:</strong> This is your grounding day — simple movement that brings strength, stability, and softness together. Move mindfully and allow yourself to flow with breath.
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                              <h5 className="font-semibold text-indigo-700 text-sm mb-2">Equipment Needed</h5>
                              <ul className="text-xs text-indigo-600 space-y-1">
                                <li>• Dumbbells (various)</li>
                                <li>• Long resistance band</li>
                                <li>• Mat</li>
                                <li>• Bed/sofa/chair</li>
                              </ul>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                              <h5 className="font-semibold text-purple-700 text-sm mb-2">Time & Focus</h5>
                              <p className="text-xs text-purple-600">25-30 Mins</p>
                              <p className="text-xs text-purple-600 mt-1">Gentle full-body strength + mobility flow</p>
                            </div>
                          </div>

                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                              <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                              WARM-UP (5-7 mins)
                            </h5>
                            <div className="bg-white rounded-lg p-3">
                              <p className="font-medium text-gray-800">PRENATAL WARMUP</p>
                              <p className="text-sm text-gray-600">8 reps of each</p>
                            </div>
                          </div>

                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h5 className="font-bold text-purple-700 mb-3 flex items-center gap-2">
                              <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                              MAIN WORKOUT (2-3 ROUNDS)
                            </h5>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-purple-200">
                                    <th className="text-left py-2 text-purple-700">#</th>
                                    <th className="text-left py-2 text-purple-700">Exercise <PlayAllButton url={getPlayAllUrl('program2-day4-main-workout')} /></th>
                                    <th className="text-left py-2 text-purple-700">Reps</th>
                                    <th className="text-left py-2 text-purple-700">Beginner Option <PlayAllButton url={getPlayAllUrl('program2-day4-beginner-option')} /></th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-100">
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">1</td>
                                    <td className="py-2"><ExerciseLink name="DB Same Leg Lunge Lateral Raise" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">8-10/side</td>
                                    <td className="py-2 text-indigo-600">Band Lunge Lateral Raise</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">2</td>
                                    <td className="py-2"><ExerciseLink name="Supported Single Leg Glute Bridge Knee to Chest" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">8-10/side</td>
                                    <td className="py-2 text-indigo-600">Glute Bridges on Bed or Chair</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">3</td>
                                    <td className="py-2"><ExerciseLink name="Band - Squat to Narrow Row" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">10</td>
                                    <td className="py-2 text-indigo-600">Band Standing Wide to Narrow Row</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">4</td>
                                    <td className="py-2"><ExerciseLink name="DB Sumo Squat to Upright Row" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">8/side</td>
                                    <td className="py-2 text-indigo-600">Keep Range Short</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-purple-600 font-medium">5</td>
                                    <td className="py-2"><ExerciseLink name="Bird Dog Bodyweight" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">10/side</td>
                                    <td className="py-2 text-indigo-600">Bird Dog Bodyweight</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                            <h5 className="font-bold text-teal-700 mb-3 flex items-center gap-2">
                              <span className="bg-teal-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                              FINISHER FLOW (5-7 mins)
                            </h5>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-teal-200">
                                    <th className="text-left py-2 text-teal-700">#</th>
                                    <th className="text-left py-2 text-teal-700">Movement <PlayAllButton url={getPlayAllUrl('program2-day4-finisher-flow')} /></th>
                                    <th className="text-left py-2 text-teal-700">Time</th>
                                    <th className="text-left py-2 text-teal-700">Notes</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-teal-100">
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">1</td>
                                    <td className="py-2"><ExerciseLink name="Sumo Squat Alternate Arm Lifts" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">1 min</td>
                                    <td className="py-2 text-gray-500 italic text-xs">Stretch + breath</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">2</td>
                                    <td className="py-2"><ExerciseLink name="Bear Crawl to Downward Dog Holds" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">30 sec/side</td>
                                    <td className="py-2 text-gray-500 italic text-xs">Exhale as you lift</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-teal-600 font-medium">3</td>
                                    <td className="py-2"><ExerciseLink name="All Fours Shoulder Taps" exercises={exercises} /></td>
                                    <td className="py-2 text-gray-600">5 breaths</td>
                                    <td className="py-2 text-gray-500 italic text-xs">Let ribs expand, full exhale out mouth</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h5 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                              <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                              COOL DOWN (3-5 mins)
                            </h5>
                            <div className="bg-white rounded-lg p-3">
                              <p className="font-medium text-gray-800">PRENATAL COOLDOWN</p>
                              <p className="text-sm text-gray-600">8 reps of each</p>
                            </div>
                          </div>

                          <div className="bg-pink-50 border border-pink-300 rounded-lg p-4">
                            <h5 className="font-bold text-pink-700 mb-2">Things to Remember</h5>
                            <p className="text-sm text-pink-600">
                              Focus on breath and range, not intensity. | Anchor through your feet and move with purpose. | Slow movement is smart movement. | Use support where needed — wall, block, or chair. | Recovery matters — go gentle.
                            </p>
                          </div>

                          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                            <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" /> Precautions
                            </h5>
                            <p className="text-xs text-amber-600">
                              Avoid Holding Breath: Always exhale through the work. | No Fast Shifts: Take your time moving between positions. | Props Are Your Friend: Use for stability and ease. | Take Breaks Often: Especially if breathless or light-headed. | Listen Closely to Your Body.
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                      </Accordion>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* PROGRAM 3: BALANCED & EASY */}
                <Accordion type="single" collapsible className="mb-8 mt-10">
                  <AccordionItem value="program3" className="border-0">
                    <AccordionTrigger className="p-0 hover:no-underline [&>svg]:hidden" data-testid="accordion-program3">
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-xl w-full">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-4xl font-bold">3</span>
                          </div>
                          <div className="text-center sm:text-left flex-1">
                            <p className="text-sm opacity-90 uppercase tracking-wide">Program 3 (3-Day Week)</p>
                            <h3 className="text-3xl font-bold">BALANCED & EASY</h3>
                            <p className="text-sm opacity-90 mt-2 italic">For weeks you need more recovery between movement days.</p>
                          </div>
                          <ChevronDown className="w-6 h-6 text-white/80 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-6 pb-0">
                      <Accordion type="single" collapsible className="space-y-4">
                        {/* P3 DAY 1 */}
                        <AccordionItem value="program3-day1" className="border border-blue-200 rounded-xl overflow-hidden bg-white shadow-md">
                          <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-blue-50 [&[data-state=open]]:bg-gradient-to-r [&[data-state=open]]:from-blue-100 [&[data-state=open]]:to-cyan-100" data-testid="accordion-program3-day1">
                            <div className="flex items-center gap-4 w-full">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                D1
                              </div>
                              <div className="text-left flex-1">
                                <h4 className="font-bold text-blue-800">LIGHT FULL BODY STRENGTH</h4>
                                <p className="text-sm text-gray-600">25-30 mins • Gentle total-body strength with emphasis on breath and stability</p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-6">
                            <div className="space-y-6">
                              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                                <p className="text-sm text-gray-700 italic">
                                  <strong className="text-blue-600">Coach's Note:</strong> This session is about staying connected to your body without pushing. You're still building strength, but we're doing it in a soft, supportive way. Your breath leads; your body follows.
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                                  <h5 className="font-semibold text-cyan-700 text-sm mb-2">Equipment Needed</h5>
                                  <ul className="text-xs text-cyan-600 space-y-1">
                                    <li>• Dumbbells (light to medium)</li>
                                    <li>• Long resistance band</li>
                                    <li>• Mat</li>
                                  </ul>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <h5 className="font-semibold text-blue-700 text-sm mb-2">Time & Focus</h5>
                                  <p className="text-xs text-blue-600">25-30 Mins</p>
                                  <p className="text-xs text-blue-600 mt-1">Gentle strength with breath emphasis</p>
                                </div>
                              </div>

                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                                  <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                  WARM-UP (5-7 mins)
                                </h5>
                                <div className="bg-white rounded-lg p-3">
                                  <p className="font-medium text-gray-800">PRENATAL WARMUP</p>
                                  <p className="text-sm text-gray-600">8 reps of each</p>
                                </div>
                              </div>

                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h5 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
                                  <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                  MAIN WORKOUT (2-3 ROUNDS)
                                </h5>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-blue-200">
                                        <th className="text-left py-2 text-blue-700">#</th>
                                        <th className="text-left py-2 text-blue-700">Exercise <PlayAllButton url={getPlayAllUrl('program3-day1-main-workout')} /></th>
                                        <th className="text-left py-2 text-blue-700">Reps</th>
                                        <th className="text-left py-2 text-blue-700">Beginner Option <PlayAllButton url={getPlayAllUrl('program3-day1-beginner-option')} /></th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-blue-100">
                                      <tr>
                                        <td className="py-2 text-blue-600 font-medium">1</td>
                                        <td className="py-2"><ExerciseLink name="Squat with Overhead Arm Reach" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">10-12</td>
                                        <td className="py-2 text-cyan-600">Squat Seated on Chair</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-blue-600 font-medium">2</td>
                                        <td className="py-2"><ExerciseLink name="DB Standing to Bent Over Narrow" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">12</td>
                                        <td className="py-2 text-cyan-600">Band Seated Narrow Rows</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-blue-600 font-medium">3</td>
                                        <td className="py-2"><ExerciseLink name="Band Standing Side Leg Abductors" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">10/side</td>
                                        <td className="py-2 text-cyan-600">Side Lying Straight Leg Lifts</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-blue-600 font-medium">4</td>
                                        <td className="py-2"><ExerciseLink name="Mini Band Supine Alternating Leg Marches" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">10/side</td>
                                        <td className="py-2 text-cyan-600">Glute Bridges</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-blue-600 font-medium">5</td>
                                        <td className="py-2"><ExerciseLink name="DB Standing Bicep Curl to Arnold Press" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">10</td>
                                        <td className="py-2 text-cyan-600">Seated Arnold Press</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                                <h5 className="font-bold text-teal-700 mb-3 flex items-center gap-2">
                                  <span className="bg-teal-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                  FINISHER FLOW (5-7 mins)
                                </h5>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-teal-200">
                                        <th className="text-left py-2 text-teal-700">#</th>
                                        <th className="text-left py-2 text-teal-700">Movement <PlayAllButton url={getPlayAllUrl('program3-day1-finisher-flow')} /></th>
                                        <th className="text-left py-2 text-teal-700">Time</th>
                                        <th className="text-left py-2 text-teal-700">Notes</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-teal-100">
                                      <tr>
                                        <td className="py-2 text-teal-600 font-medium">1</td>
                                        <td className="py-2"><ExerciseLink name="Standing Arm Rotations" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">1 min</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Keep it light and easy</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-teal-600 font-medium">2</td>
                                        <td className="py-2"><ExerciseLink name="Cross Legged Twists" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">30 sec/side</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Let breath guide each rep</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-teal-600 font-medium">3</td>
                                        <td className="py-2"><ExerciseLink name="Supine Core Compressions" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">5-6 breaths</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Long, relaxed exhales to finish</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h5 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                                  <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                                  COOL DOWN (3-5 mins)
                                </h5>
                                <div className="bg-white rounded-lg p-3">
                                  <p className="font-medium text-gray-800">PRENATAL COOLDOWN</p>
                                  <p className="text-sm text-gray-600">8 reps of each</p>
                                </div>
                              </div>

                              <div className="bg-pink-50 border border-pink-300 rounded-lg p-4">
                                <h5 className="font-bold text-pink-700 mb-2">Things to Remember</h5>
                                <p className="text-sm text-pink-600">
                                  Choose weights that feel good — even bodyweight is enough. | Stay upright and supported — posture over performance. | Focus on your breath — let it guide the rhythm. | Rest between sets — there's no rush. | Repeat your favorite moves if they feel good.
                                </p>
                              </div>

                              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                                <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4" /> Precautions
                                </h5>
                                <p className="text-xs text-amber-600">
                                  Avoid Breath-Holding: Exhale on every effort. | Use a Chair or Wall if You Feel Unsteady. | Modify Ranges: Don't go deep into squats or lunges. | Take More Breaks if Needed. | Stop Immediately if Anything Feels Off.
                                </p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* P3 DAY 2 */}
                        <AccordionItem value="program3-day2" className="border border-blue-200 rounded-xl overflow-hidden bg-white shadow-md">
                          <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-blue-50 [&[data-state=open]]:bg-gradient-to-r [&[data-state=open]]:from-blue-100 [&[data-state=open]]:to-cyan-100" data-testid="accordion-program3-day2">
                            <div className="flex items-center gap-4 w-full">
                              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                D2
                              </div>
                              <div className="text-left flex-1">
                                <h4 className="font-bold text-blue-800">CORE + GLUTES CONNECTION</h4>
                                <p className="text-sm text-gray-600">25 mins • Core reconnection and mobility support</p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-6">
                            <div className="space-y-6">
                              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                                <p className="text-sm text-gray-700 italic">
                                  <strong className="text-blue-600">Coach's Note:</strong> This is about awareness, not intensity. We're rebuilding deep strength and creating space in the body through calm, controlled movement. Your breath is the anchor.
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                                  <h5 className="font-semibold text-cyan-700 text-sm mb-2">Equipment Needed</h5>
                                  <ul className="text-xs text-cyan-600 space-y-1">
                                    <li>• Dumbbells (various)</li>
                                    <li>• Long resistance band</li>
                                    <li>• Mat</li>
                                  </ul>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <h5 className="font-semibold text-blue-700 text-sm mb-2">Time & Focus</h5>
                                  <p className="text-xs text-blue-600">25 Mins</p>
                                  <p className="text-xs text-blue-600 mt-1">Core reconnection & mobility support</p>
                                </div>
                              </div>

                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                                  <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                  WARM-UP (5-7 mins)
                                </h5>
                                <div className="bg-white rounded-lg p-3">
                                  <p className="font-medium text-gray-800">PRENATAL WARMUP</p>
                                  <p className="text-sm text-gray-600">8 reps of each</p>
                                </div>
                              </div>

                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h5 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
                                  <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                  MAIN WORKOUT (3 ROUNDS)
                                </h5>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-blue-200">
                                        <th className="text-left py-2 text-blue-700">#</th>
                                        <th className="text-left py-2 text-blue-700">Exercise <PlayAllButton url={getPlayAllUrl('program3-day2-main-workout')} /></th>
                                        <th className="text-left py-2 text-blue-700">Reps</th>
                                        <th className="text-left py-2 text-blue-700">Beginner Option <PlayAllButton url={getPlayAllUrl('program3-day2-beginner-option')} /></th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-blue-100">
                                      <tr>
                                        <td className="py-2 text-blue-600 font-medium">1</td>
                                        <td className="py-2"><ExerciseLink name="Wall Sit with Ball" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">10</td>
                                        <td className="py-2 text-cyan-600">Ball Squeeze Glute Bridges</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-blue-600 font-medium">2</td>
                                        <td className="py-2"><ExerciseLink name="Swiss Ball Seated Marches" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">10</td>
                                        <td className="py-2 text-cyan-600">Seated Bent Knee Leg Lifts</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-blue-600 font-medium">3</td>
                                        <td className="py-2"><ExerciseLink name="Banded Kneeling Fire Hydrants" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">10/side</td>
                                        <td className="py-2 text-cyan-600">Kneeling Fire Hydrants</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-blue-600 font-medium">4</td>
                                        <td className="py-2"><ExerciseLink name="Side Plank with Knee Rested Leg Lifts" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">8/side</td>
                                        <td className="py-2 text-cyan-600">Side Lying Straight Leg Lifts</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-blue-600 font-medium">5</td>
                                        <td className="py-2"><ExerciseLink name="Mini Band Elbow Side Plank Clamshells" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">12/side</td>
                                        <td className="py-2 text-cyan-600">Mini Band Side Lying Clamshells</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                                <h5 className="font-bold text-teal-700 mb-3 flex items-center gap-2">
                                  <span className="bg-teal-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                  FINISHER FLOW (5-7 mins) x 2 Rounds
                                </h5>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-teal-200">
                                        <th className="text-left py-2 text-teal-700">#</th>
                                        <th className="text-left py-2 text-teal-700">Movement <PlayAllButton url={getPlayAllUrl('program3-day2-finisher-flow')} /></th>
                                        <th className="text-left py-2 text-teal-700">Time</th>
                                        <th className="text-left py-2 text-teal-700">Notes</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-teal-100">
                                      <tr>
                                        <td className="py-2 text-teal-600 font-medium">1</td>
                                        <td className="py-2"><ExerciseLink name="Seated Single Crossed Legged Glute Stretch" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">30 sec/side</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Lean forward gently</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-teal-600 font-medium">2</td>
                                        <td className="py-2"><ExerciseLink name="Core Seated Chair Core Compressions" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">5 reps</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Inhale arms up, exhale down</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-teal-600 font-medium">3</td>
                                        <td className="py-2"><ExerciseLink name="Child Pose Single Leg Inner Thigh Stretch" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">30 sec/side</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Sway side to side slowly</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h5 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                                  <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                                  COOL DOWN (3-5 mins)
                                </h5>
                                <div className="bg-white rounded-lg p-3">
                                  <p className="font-medium text-gray-800">PRENATAL COOLDOWN</p>
                                  <p className="text-sm text-gray-600">8 reps of each</p>
                                </div>
                              </div>

                              <div className="bg-pink-50 border border-pink-300 rounded-lg p-4">
                                <h5 className="font-bold text-pink-700 mb-2">Things to Remember</h5>
                                <p className="text-sm text-pink-600">
                                  Keep reps low and focused. | Breathe fully into your ribs and exhale gently. | Use a pillow, mat, or towel for comfort. | Move slowly and pause where it feels good. | Stay aware of your body — let it guide you.
                                </p>
                              </div>

                              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                                <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4" /> Precautions
                                </h5>
                                <p className="text-xs text-amber-600">
                                  Avoid Core Strain: No bulging, doming, or crunching. | Support Lower Back with Props. | Stay in a Comfortable Range. | Stop if You Feel Pulling or Discomfort. | Always Choose Comfort Over Completion.
                                </p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* P3 DAY 3 */}
                        <AccordionItem value="program3-day3" className="border border-blue-200 rounded-xl overflow-hidden bg-white shadow-md">
                          <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-blue-50 [&[data-state=open]]:bg-gradient-to-r [&[data-state=open]]:from-blue-100 [&[data-state=open]]:to-cyan-100" data-testid="accordion-program3-day3">
                            <div className="flex items-center gap-4 w-full">
                              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                D3
                              </div>
                              <div className="text-left flex-1">
                                <h4 className="font-bold text-blue-800">MOBILITY FLOW & RECOVERY</h4>
                                <p className="text-sm text-gray-600">20-25 mins • Gentle full-body mobility + breath reset</p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-6">
                            <div className="space-y-6">
                              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                                <p className="text-sm text-gray-700 italic">
                                  <strong className="text-blue-600">Coach's Note:</strong> This session is a soft exhale for your week. It's designed to keep you moving without draining you. Think of it as a movement-based reset — calming for both body and mind.
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                                  <h5 className="font-semibold text-cyan-700 text-sm mb-2">Equipment Needed</h5>
                                  <ul className="text-xs text-cyan-600 space-y-1">
                                    <li>• Cushion / block</li>
                                    <li>• Mat</li>
                                  </ul>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <h5 className="font-semibold text-blue-700 text-sm mb-2">Time & Focus</h5>
                                  <p className="text-xs text-blue-600">20-25 Mins</p>
                                  <p className="text-xs text-blue-600 mt-1">Gentle full-body mobility + breath reset</p>
                                </div>
                              </div>

                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                                  <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                  WARM-UP (5-7 mins)
                                </h5>
                                <div className="bg-white rounded-lg p-3">
                                  <p className="font-medium text-gray-800">PRENATAL WARMUP</p>
                                  <p className="text-sm text-gray-600">8 reps of each</p>
                                </div>
                              </div>

                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h5 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
                                  <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                  MAIN WORKOUT (2-3 ROUNDS)
                                </h5>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-blue-200">
                                        <th className="text-left py-2 text-blue-700">#</th>
                                        <th className="text-left py-2 text-blue-700">Exercise <PlayAllButton url={getPlayAllUrl('program3-day3-main-workout')} /></th>
                                        <th className="text-left py-2 text-blue-700">Reps</th>
                                        <th className="text-left py-2 text-blue-700">Beginner Option <PlayAllButton url={getPlayAllUrl('program3-day3-beginner-option')} /></th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-blue-100">
                                      <tr>
                                        <td className="py-2 text-blue-600 font-medium">1</td>
                                        <td className="py-2"><ExerciseLink name="Bear Crawl Pelvic Tilts + Thread the Needle" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">5 each</td>
                                        <td className="py-2 text-cyan-600">Bear Crawl Pelvic Tilts</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-blue-600 font-medium">2</td>
                                        <td className="py-2"><ExerciseLink name="Kneeling Ball Squeeze with Core Lean Back" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">8 reps / 20 sec</td>
                                        <td className="py-2 text-cyan-600">Seated Lean Back with Core Hold</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-blue-600 font-medium">3</td>
                                        <td className="py-2"><ExerciseLink name="Child Pose with Hips Lifted" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">30 sec/side</td>
                                        <td className="py-2 text-cyan-600">Child Pose with Hips Lifted</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-blue-600 font-medium">4</td>
                                        <td className="py-2"><ExerciseLink name="Seated Single Crossed Legged Glute Stretch" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">30 sec/side</td>
                                        <td className="py-2 text-cyan-600">Same Exercise</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-blue-600 font-medium">5</td>
                                        <td className="py-2"><ExerciseLink name="Butterfly with Elbow Rotations" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">5 slow</td>
                                        <td className="py-2 text-cyan-600">Hands on Thighs for Support</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                                <h5 className="font-bold text-teal-700 mb-3 flex items-center gap-2">
                                  <span className="bg-teal-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                  FINISHER FLOW (5-7 mins)
                                </h5>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-teal-200">
                                        <th className="text-left py-2 text-teal-700">#</th>
                                        <th className="text-left py-2 text-teal-700">Movement <PlayAllButton url={getPlayAllUrl('program3-day3-finisher-flow')} /></th>
                                        <th className="text-left py-2 text-teal-700">Time</th>
                                        <th className="text-left py-2 text-teal-700">Notes</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-teal-100">
                                      <tr>
                                        <td className="py-2 text-teal-600 font-medium">1</td>
                                        <td className="py-2"><ExerciseLink name="Supine Core Compressions" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">5-6 breaths</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Hands on belly and ribs</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-teal-600 font-medium">2</td>
                                        <td className="py-2"><ExerciseLink name="Cross Legged Cross Hands Release" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">10 reps each</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Relax into it</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-teal-600 font-medium">3</td>
                                        <td className="py-2"><ExerciseLink name="Chest Stretch Opener" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">3 breaths</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Anchor back into your body</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h5 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                                  <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                                  COOL DOWN (3-5 mins)
                                </h5>
                                <div className="bg-white rounded-lg p-3">
                                  <p className="font-medium text-gray-800">PRENATAL COOLDOWN</p>
                                  <p className="text-sm text-gray-600">8 reps of each</p>
                                </div>
                              </div>

                              <div className="bg-pink-50 border border-pink-300 rounded-lg p-4">
                                <h5 className="font-bold text-pink-700 mb-2">Things to Remember</h5>
                                <p className="text-sm text-pink-600">
                                  Use this time to release tension, not build it. | Stay grounded — seated or supported is just fine. | Breathe deeply and rhythmically. | Flow through what feels good and let go of what doesn't. | Let this session bring you back to center.
                                </p>
                              </div>

                              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                                <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4" /> Precautions
                                </h5>
                                <p className="text-xs text-amber-600">
                                  Avoid Overstretching: Keep it gentle and supported. | Use Cushions Under Knees or Back. | Take Your Time Between Moves. | Stop If You Feel Light-Headed or Tense. | Drink Water Before and After.
                                </p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* PROGRAM 4: GENTLE FLOW */}
                <Accordion type="single" collapsible className="mb-8 mt-10">
                  <AccordionItem value="program4" className="border-0">
                    <AccordionTrigger className="p-0 hover:no-underline [&>svg]:hidden" data-testid="accordion-program4">
                      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl w-full">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-4xl font-bold">4</span>
                          </div>
                          <div className="text-center sm:text-left flex-1">
                            <p className="text-sm opacity-90 uppercase tracking-wide">Program 4 (2-Day Week)</p>
                            <h3 className="text-3xl font-bold">GENTLE FLOW</h3>
                            <p className="text-sm opacity-90 mt-2 italic">For fatigue, nausea, or those brand new to movement.</p>
                          </div>
                          <ChevronDown className="w-6 h-6 text-white/80 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-6 pb-0">
                      <Accordion type="single" collapsible className="space-y-4">
                        {/* P4 DAY 1 */}
                        <AccordionItem value="program4-day1" className="border border-emerald-200 rounded-xl overflow-hidden bg-white shadow-md">
                          <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-emerald-50 [&[data-state=open]]:bg-gradient-to-r [&[data-state=open]]:from-emerald-100 [&[data-state=open]]:to-teal-100" data-testid="accordion-program4-day1">
                            <div className="flex items-center gap-4 w-full">
                              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                D1
                              </div>
                              <div className="text-left flex-1">
                                <h4 className="font-bold text-emerald-800">SOFT STRENGTH + CORE SUPPORT</h4>
                                <p className="text-sm text-gray-600">20-25 mins • Seated + standing strength with breath-led mobility</p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-6">
                            <div className="space-y-6">
                              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-400 p-4 rounded-r-lg">
                                <p className="text-sm text-gray-700 italic">
                                  <strong className="text-emerald-600">Coach's Note:</strong> This session is for the days when getting started feels like the hardest part. It's gentle, grounding, and completely adjustable. Let your breath do most of the work today.
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                                  <h5 className="font-semibold text-teal-700 text-sm mb-2">Equipment Needed</h5>
                                  <ul className="text-xs text-teal-600 space-y-1">
                                    <li>• Mat</li>
                                    <li>• Resistance Band (optional)</li>
                                    <li>• Cushion or Block (for comfort)</li>
                                  </ul>
                                </div>
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                  <h5 className="font-semibold text-emerald-700 text-sm mb-2">Time & Focus</h5>
                                  <p className="text-xs text-emerald-600">20-25 Mins</p>
                                  <p className="text-xs text-emerald-600 mt-1">Seated + standing strength with breath-led mobility</p>
                                </div>
                              </div>

                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                                  <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                  WARM-UP (5-7 mins)
                                </h5>
                                <div className="bg-white rounded-lg p-3">
                                  <p className="font-medium text-gray-800">PRENATAL WARMUP</p>
                                  <p className="text-sm text-gray-600">8 reps of each</p>
                                </div>
                              </div>

                              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                <h5 className="font-bold text-emerald-700 mb-3 flex items-center gap-2">
                                  <span className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                  MAIN WORKOUT (2-3 ROUNDS)
                                </h5>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-emerald-200">
                                        <th className="text-left py-2 text-emerald-700">#</th>
                                        <th className="text-left py-2 text-emerald-700">Exercise <PlayAllButton url={getPlayAllUrl('program4-day1-main-workout')} /></th>
                                        <th className="text-left py-2 text-emerald-700">Reps</th>
                                        <th className="text-left py-2 text-emerald-700">Beginner Option <PlayAllButton url={getPlayAllUrl('program4-day1-beginner-option')} /></th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-emerald-100">
                                      <tr>
                                        <td className="py-2 text-emerald-600 font-medium">1</td>
                                        <td className="py-2"><ExerciseLink name="Band Seated Narrow Rows" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">20</td>
                                        <td className="py-2 text-teal-600">Band Standing Rows</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-emerald-600 font-medium">2</td>
                                        <td className="py-2"><ExerciseLink name="Glute Bridges with Mini Band" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">30 sec</td>
                                        <td className="py-2 text-teal-600">Pillow Glute Bridges</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-emerald-600 font-medium">3</td>
                                        <td className="py-2"><ExerciseLink name="Side Lying Leg Lifts with Top Leg Bent" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">10/side</td>
                                        <td className="py-2 text-teal-600">Side Lying Pillow Squeeze</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-emerald-600 font-medium">4</td>
                                        <td className="py-2"><ExerciseLink name="Seated Shoulder DB Press" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">20</td>
                                        <td className="py-2 text-teal-600">Band Kneeling Shoulder Press</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-emerald-600 font-medium">5</td>
                                        <td className="py-2"><ExerciseLink name="Supine Pelvic Tilts" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">10 breaths</td>
                                        <td className="py-2 text-teal-600">Supine Pelvic Tilts</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                                <h5 className="font-bold text-teal-700 mb-3 flex items-center gap-2">
                                  <span className="bg-teal-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                  FINISHER FLOW (5-7 mins)
                                </h5>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-teal-200">
                                        <th className="text-left py-2 text-teal-700">#</th>
                                        <th className="text-left py-2 text-teal-700">Movement <PlayAllButton url={getPlayAllUrl('program4-day1-finisher-flow')} /></th>
                                        <th className="text-left py-2 text-teal-700">Time</th>
                                        <th className="text-left py-2 text-teal-700">Notes</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-teal-100">
                                      <tr>
                                        <td className="py-2 text-teal-600 font-medium">1</td>
                                        <td className="py-2"><ExerciseLink name="Seated 90 90 Glute Lift Reach" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">30 sec/side</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Hold gently, breathe into hips</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-teal-600 font-medium">2</td>
                                        <td className="py-2"><ExerciseLink name="Supine Core Compressions" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">5-6 breaths</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Hands on belly and ribs</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-teal-600 font-medium">3</td>
                                        <td className="py-2"><ExerciseLink name="Child Pose with Hips Lifted" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">1-2 mins</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Use pillow under belly or chest</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                <h5 className="font-bold text-emerald-700 mb-2 flex items-center gap-2">
                                  <span className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                                  COOL DOWN (3-5 mins)
                                </h5>
                                <div className="bg-white rounded-lg p-3">
                                  <p className="font-medium text-gray-800">PRENATAL COOLDOWN</p>
                                  <p className="text-sm text-gray-600">8 reps of each</p>
                                </div>
                              </div>

                              <div className="bg-pink-50 border border-pink-300 rounded-lg p-4">
                                <h5 className="font-bold text-pink-700 mb-2">Things to Remember</h5>
                                <p className="text-sm text-pink-600">
                                  Keep the range small — a little movement goes a long way. | Exhale with intention — every breath is an anchor. | Use the chair, wall, or blocks for comfort and safety. | Move how you feel, not how you think you should. | Even a few exercises are enough.
                                </p>
                              </div>

                              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                                <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4" /> Precautions
                                </h5>
                                <p className="text-xs text-amber-600">
                                  Avoid Standing Too Long: Sit whenever you need. | Skip Anything That Feels Draining. | Use Cushions or Support for Joints. | Don't Push Through Fatigue — Rest Wins. | Stop If You Feel Dizzy, Breathless, or Off.
                                </p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* P4 DAY 2 */}
                        <AccordionItem value="program4-day2" className="border border-emerald-200 rounded-xl overflow-hidden bg-white shadow-md">
                          <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-emerald-50 [&[data-state=open]]:bg-gradient-to-r [&[data-state=open]]:from-emerald-100 [&[data-state=open]]:to-teal-100" data-testid="accordion-program4-day2">
                            <div className="flex items-center gap-4 w-full">
                              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                D2
                              </div>
                              <div className="text-left flex-1">
                                <h4 className="font-bold text-emerald-800">STRETCH + BREATH RECOVERY FLOW</h4>
                                <p className="text-sm text-gray-600">20-25 mins • Soft movement flow + breath + mobility reset</p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-6">
                            <div className="space-y-6">
                              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-400 p-4 rounded-r-lg">
                                <p className="text-sm text-gray-700 italic">
                                  <strong className="text-emerald-600">Coach's Note:</strong> This is your body's way of staying open, light, and connected — even when you're not feeling your strongest. Let this session be an act of kindness and a moment of calm.
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                                  <h5 className="font-semibold text-teal-700 text-sm mb-2">Equipment Needed</h5>
                                  <ul className="text-xs text-teal-600 space-y-1">
                                    <li>• Mat</li>
                                    <li>• Resistance Band (optional)</li>
                                    <li>• Cushion or Block (for comfort)</li>
                                  </ul>
                                </div>
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                  <h5 className="font-semibold text-emerald-700 text-sm mb-2">Time & Focus</h5>
                                  <p className="text-xs text-emerald-600">20-25 Mins</p>
                                  <p className="text-xs text-emerald-600 mt-1">Soft movement flow + breath + mobility reset</p>
                                </div>
                              </div>

                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                                  <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                  WARM-UP (5-7 mins)
                                </h5>
                                <div className="bg-white rounded-lg p-3">
                                  <p className="font-medium text-gray-800">PRENATAL WARMUP</p>
                                  <p className="text-sm text-gray-600">8 reps of each</p>
                                </div>
                              </div>

                              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                <h5 className="font-bold text-emerald-700 mb-3 flex items-center gap-2">
                                  <span className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                  MAIN WORKOUT (2-3 ROUNDS)
                                </h5>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-emerald-200">
                                        <th className="text-left py-2 text-emerald-700">#</th>
                                        <th className="text-left py-2 text-emerald-700">Exercise <PlayAllButton url={getPlayAllUrl('program4-day2-main-workout')} /></th>
                                        <th className="text-left py-2 text-emerald-700">Reps</th>
                                        <th className="text-left py-2 text-emerald-700">Notes</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-emerald-100">
                                      <tr>
                                        <td className="py-2 text-emerald-600 font-medium">1</td>
                                        <td className="py-2"><ExerciseLink name="Seated Same Side Single Leg Stretch & Reach" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">30 sec/side</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Stay tall with gentle reach</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-emerald-600 font-medium">2</td>
                                        <td className="py-2"><ExerciseLink name="Kneeling Ball Squeeze with Core Lean Back" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">6 reps</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Support under knees</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-emerald-600 font-medium">3</td>
                                        <td className="py-2"><ExerciseLink name="Kneeling Lunge Hip Flexor Reaches" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">8/side</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Feet wide, slow movement</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-emerald-600 font-medium">4</td>
                                        <td className="py-2"><ExerciseLink name="Squat with Arm Rainbows" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">30 sec/side</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Keep bottom foot down</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-emerald-600 font-medium">5</td>
                                        <td className="py-2"><ExerciseLink name="Cross Legged Lat Stretch" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">30 sec/side</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Chair support</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                                <h5 className="font-bold text-teal-700 mb-3 flex items-center gap-2">
                                  <span className="bg-teal-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                  FINISHER FLOW (5-7 mins)
                                </h5>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-teal-200">
                                        <th className="text-left py-2 text-teal-700">#</th>
                                        <th className="text-left py-2 text-teal-700">Movement <PlayAllButton url={getPlayAllUrl('program4-day2-finisher-flow')} /></th>
                                        <th className="text-left py-2 text-teal-700">Time</th>
                                        <th className="text-left py-2 text-teal-700">Notes</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-teal-100">
                                      <tr>
                                        <td className="py-2 text-teal-600 font-medium">1</td>
                                        <td className="py-2 text-emerald-600 font-medium">Supine Core Compressions</td>
                                        <td className="py-2 text-gray-600">5-6 breaths</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Hands on belly and ribs</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-teal-600 font-medium">2</td>
                                        <td className="py-2 text-emerald-600 font-medium">Chest Stretch Opener</td>
                                        <td className="py-2 text-gray-600">1 min</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Slow breaths</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-teal-600 font-medium">3</td>
                                        <td className="py-2 text-emerald-600 font-medium">Supine Head Lifts with Belly Pump Breathing</td>
                                        <td className="py-2 text-gray-600">2 mins</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Lie with pillow between knees + under belly</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                <h5 className="font-bold text-emerald-700 mb-2 flex items-center gap-2">
                                  <span className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                                  COOL DOWN (3-5 mins)
                                </h5>
                                <div className="bg-white rounded-lg p-3">
                                  <p className="font-medium text-gray-800">PRENATAL COOLDOWN</p>
                                  <p className="text-sm text-gray-600">8 reps of each</p>
                                </div>
                              </div>

                              <div className="bg-pink-50 border border-pink-300 rounded-lg p-4">
                                <h5 className="font-bold text-pink-700 mb-2">Things to Remember</h5>
                                <p className="text-sm text-pink-600">
                                  Flow gently — there's no peak pose or pressure. | Breathe slow, deep, and steady throughout. | Use props freely — this is about support. | Modify movements or hold positions that feel good. | Let the end of this workout be your recharge point.
                                </p>
                              </div>

                              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                                <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4" /> Precautions
                                </h5>
                                <p className="text-xs text-amber-600">
                                  Avoid Overstretching: Stay soft and supported. | Use a Wall or Chair for Balance and Stability. | Stay Seated or Grounded If Tired. | Skip Anything That Feels Unstable or Strained. | Hydrate After to Support Circulation and Recovery.
                                </p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* PROGRAM 5: PICK & PLAY */}
                <Accordion type="single" collapsible className="mb-8 mt-10">
                  <AccordionItem value="program5" className="border-0">
                    <AccordionTrigger className="p-0 hover:no-underline [&>svg]:hidden" data-testid="accordion-program5">
                      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl w-full">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-4xl font-bold">5</span>
                          </div>
                          <div className="text-center sm:text-left flex-1">
                            <p className="text-sm opacity-90 uppercase tracking-wide">Program 5 (3-day Flexible Builder)</p>
                            <h3 className="text-3xl font-bold">PICK & PLAY</h3>
                            <p className="text-sm opacity-90 mt-2 italic">For women who want choice, creativity, or to mix it up.</p>
                          </div>
                          <ChevronDown className="w-6 h-6 text-white/80 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-6 pb-0">
                      <Accordion type="single" collapsible className="space-y-4">
                        {/* P5 DAY 1 */}
                        <AccordionItem value="program5-day1" className="border border-amber-200 rounded-xl overflow-hidden bg-white shadow-md">
                          <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-amber-50 [&[data-state=open]]:bg-gradient-to-r [&[data-state=open]]:from-amber-100 [&[data-state=open]]:to-orange-100" data-testid="accordion-program5-day1">
                            <div className="flex items-center gap-4 w-full">
                              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                D1
                              </div>
                              <div className="text-left flex-1">
                                <h4 className="font-bold text-amber-800">BUILD YOUR OWN: STRENGTH FOCUS</h4>
                                <p className="text-sm text-gray-600">25-30 mins • Total-body mix — you choose the movements and create your own flow</p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-6">
                            <div className="space-y-6">
                              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                                <p className="text-sm text-gray-700 italic">
                                  <strong className="text-amber-600">Coach's Note:</strong> This is your movement buffet. Choose the 4–5 exercises that feel best today. There's no wrong combo — your energy and intuition lead the way.
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                  <h5 className="font-semibold text-orange-700 text-sm mb-2">Equipment Needed</h5>
                                  <ul className="text-xs text-orange-600 space-y-1">
                                    <li>• Dumbbells (various)</li>
                                    <li>• Mat</li>
                                    <li>• Resistance Band</li>
                                    <li>• Cushion or Block (for comfort)</li>
                                  </ul>
                                </div>
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                  <h5 className="font-semibold text-amber-700 text-sm mb-2">Time & Focus</h5>
                                  <p className="text-xs text-amber-600">25-30 Mins</p>
                                  <p className="text-xs text-amber-600 mt-1">Total-body mix — you choose and create your own flow</p>
                                </div>
                              </div>

                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                                  <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                  WARM-UP (5-7 mins)
                                </h5>
                                <div className="bg-white rounded-lg p-3">
                                  <p className="font-medium text-gray-800">PRENATAL WARMUP</p>
                                  <p className="text-sm text-gray-600">8 reps of each</p>
                                </div>
                              </div>

                              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <h5 className="font-bold text-orange-700 mb-3 flex items-center gap-2">
                                  <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                  MAIN WORKOUT: PICK 4-5 EXERCISES (10-12 reps each)
                                </h5>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-orange-200">
                                        <th className="text-left py-2 text-orange-700">#</th>
                                        <th className="text-left py-2 text-orange-700">Exercise <PlayAllButton url={getPlayAllUrl('program5-day1-main-workout')} /></th>
                                        <th className="text-left py-2 text-orange-700">Focus</th>
                                        <th className="text-left py-2 text-orange-700">Beginner Option <PlayAllButton url={getPlayAllUrl('program5-day1-beginner-option')} /></th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-orange-100">
                                      <tr>
                                        <td className="py-2 text-orange-600 font-medium">1</td>
                                        <td className="py-2"><ExerciseLink name="DB Squat Thruster" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">Full Body</td>
                                        <td className="py-2"><ExerciseLink name="Band Squat to Front Raise" exercises={exercises} /></td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-orange-600 font-medium">2</td>
                                        <td className="py-2"><ExerciseLink name="Single Arm Single Leg Row" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">Lower + Upper</td>
                                        <td className="py-2"><ExerciseLink name="DB Bird Dog Rows" exercises={exercises} /></td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-orange-600 font-medium">3</td>
                                        <td className="py-2"><ExerciseLink name="DB Supported Chest Press" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">Glutes + Arms</td>
                                        <td className="py-2"><ExerciseLink name="Knee Pushups" exercises={exercises} /></td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-orange-600 font-medium">4</td>
                                        <td className="py-2"><ExerciseLink name="DB - Alt Leg Lunge Rainbows" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">Full Body</td>
                                        <td className="py-2"><ExerciseLink name="Squat with Arm Rainbows" exercises={exercises} /></td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-orange-600 font-medium">5</td>
                                        <td className="py-2"><ExerciseLink name="DB Sumo Deadlifts" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">Legs</td>
                                        <td className="py-2"><ExerciseLink name="Sumo Squat Bodyweight" exercises={exercises} /></td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-orange-600 font-medium">6</td>
                                        <td className="py-2"><ExerciseLink name="Seated Lateral Raises" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">Shoulders</td>
                                        <td className="py-2"><ExerciseLink name="Seated Lateral Raises" exercises={exercises} /></td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-orange-600 font-medium">7</td>
                                        <td className="py-2"><ExerciseLink name="Marching with Band Wrist Pull Aparts" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">Upper + Core</td>
                                        <td className="py-2"><ExerciseLink name="Kneeling Band Pull Aparts" exercises={exercises} /></td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-orange-600 font-medium">8</td>
                                        <td className="py-2"><ExerciseLink name="Mini Band Elbow Side Plank Clamshells" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">Glutes</td>
                                        <td className="py-2"><ExerciseLink name="Mini Band Lying Clamshells - Pulses" exercises={exercises} /></td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <h5 className="font-bold text-amber-700 mb-3 flex items-center gap-2">
                                  <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                  FINISHER FLOW (5-7 mins) x 3 rounds
                                </h5>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-amber-200">
                                        <th className="text-left py-2 text-amber-700">#</th>
                                        <th className="text-left py-2 text-amber-700">Movement <PlayAllButton url={getPlayAllUrl('program5-day1-finisher-flow')} /></th>
                                        <th className="text-left py-2 text-amber-700">Time</th>
                                        <th className="text-left py-2 text-amber-700">Notes</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-amber-100">
                                      <tr>
                                        <td className="py-2 text-amber-600 font-medium">1</td>
                                        <td className="py-2"><ExerciseLink name="Standing Arm Rotations" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">30 sec/direction</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Inhale up, exhale down</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-amber-600 font-medium">2</td>
                                        <td className="py-2"><ExerciseLink name="Seated Same Side Single Leg Stretch & Reach" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">30 sec/side</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Feel the release through ribs</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-amber-600 font-medium">3</td>
                                        <td className="py-2"><ExerciseLink name="Supine Core Compressions" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">10 breaths</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Exhale slow, soften ribs and jaw</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                                  <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                                  COOL DOWN (3-5 mins)
                                </h5>
                                <div className="bg-white rounded-lg p-3">
                                  <p className="font-medium text-gray-800">PRENATAL COOLDOWN</p>
                                  <p className="text-sm text-gray-600">8 reps of each</p>
                                </div>
                              </div>

                              <div className="bg-pink-50 border border-pink-300 rounded-lg p-4">
                                <h5 className="font-bold text-pink-700 mb-2">Things to Remember</h5>
                                <p className="text-sm text-pink-600">
                                  Pick what feels good — ignore the rest. | Combine strength, core, and flow if you can. | Use light weights or just bodyweight. | Rest freely between exercises | You're in charge — this is your session.
                                </p>
                              </div>

                              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                                <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4" /> Precautions
                                </h5>
                                <p className="text-xs text-amber-600">
                                  Avoid High-Intensity Moves — keep it gentle. | Support Yourself with Props at Any Time. | Stop if Breath Feels Off or Body Feels Heavy. | Skip Movements That Feel Off or Cause Pressure. | Hydrate Throughout.
                                </p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* P5 DAY 2 */}
                        <AccordionItem value="program5-day2" className="border border-amber-200 rounded-xl overflow-hidden bg-white shadow-md">
                          <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-amber-50 [&[data-state=open]]:bg-gradient-to-r [&[data-state=open]]:from-amber-100 [&[data-state=open]]:to-orange-100" data-testid="accordion-program5-day2">
                            <div className="flex items-center gap-4 w-full">
                              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                D2
                              </div>
                              <div className="text-left flex-1">
                                <h4 className="font-bold text-amber-800">CORE + CONDITIONING MIX</h4>
                                <p className="text-sm text-gray-600">20-25 mins • Choose one focus area: strength, core, or stretch</p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-6">
                            <div className="space-y-6">
                              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                                <p className="text-sm text-gray-700 italic">
                                  <strong className="text-amber-600">Coach's Note:</strong> You only need to do one thing well today. Whether you feel like getting stronger, resetting your core, or stretching it out — it all counts. Pick one path and give it your full breath.
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                  <h5 className="font-semibold text-orange-700 text-sm mb-2">Equipment Needed</h5>
                                  <p className="text-xs text-orange-600">As needed</p>
                                </div>
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                  <h5 className="font-semibold text-amber-700 text-sm mb-2">Time & Focus</h5>
                                  <p className="text-xs text-amber-600">20-25 Mins</p>
                                  <p className="text-xs text-amber-600 mt-1">Choose one focus: strength, core, or stretch</p>
                                </div>
                              </div>

                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                                  <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                  WARM-UP (5-7 mins)
                                </h5>
                                <div className="bg-white rounded-lg p-3">
                                  <p className="font-medium text-gray-800">PRENATAL WARMUP</p>
                                  <p className="text-sm text-gray-600">8 reps of each</p>
                                </div>
                              </div>

                              {/* Option A */}
                              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <h5 className="font-bold text-purple-700 mb-3 flex items-center gap-2">
                                  <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs">OPTION A</span>
                                  STRENGTH & CORE FLOW (2-3 rounds)
                                </h5>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-purple-200">
                                        <th className="text-left py-2 text-purple-700">#</th>
                                        <th className="text-left py-2 text-purple-700">Exercise <PlayAllButton url={getPlayAllUrl('program5-day2-option-a-strength-core-flow')} /></th>
                                        <th className="text-left py-2 text-purple-700">Time/Reps</th>
                                        <th className="text-left py-2 text-purple-700">Notes</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-purple-100">
                                      <tr>
                                        <td className="py-2 text-purple-600 font-medium">1</td>
                                        <td className="py-2"><ExerciseLink name="Core Compressions Wall Sits" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">30 sec</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Back against wall, feet hip-width, gently draw navel in</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-purple-600 font-medium">2</td>
                                        <td className="py-2"><ExerciseLink name="Mini Band Glute Bridges" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">12 reps</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Press through heels, band above knees, control the lift</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-purple-600 font-medium">3</td>
                                        <td className="py-2"><ExerciseLink name="DB Sumo Squat Rows" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">8 reps</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Hinge from hips, soft knees, exhale as you row</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Option B */}
                              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                                <h5 className="font-bold text-pink-700 mb-3 flex items-center gap-2">
                                  <span className="bg-pink-500 text-white px-2 py-1 rounded text-xs">OPTION B</span>
                                  CORE RESET (2-3 rounds)
                                </h5>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-pink-200">
                                        <th className="text-left py-2 text-pink-700">#</th>
                                        <th className="text-left py-2 text-pink-700">Exercise <PlayAllButton url={getPlayAllUrl('program5-day2-option-b-core-reset')} /></th>
                                        <th className="text-left py-2 text-pink-700">Time/Reps</th>
                                        <th className="text-left py-2 text-pink-700">Notes</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-pink-100">
                                      <tr>
                                        <td className="py-2 text-pink-600 font-medium">1</td>
                                        <td className="py-2"><ExerciseLink name="Supine Core Compressions" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">5 breaths</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Place hands on belly or ribs, breathe into sides, exhale fully</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-pink-600 font-medium">2</td>
                                        <td className="py-2"><ExerciseLink name="Bird Dog" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">8/side</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Neutral spine, lift opposite arm & leg with control</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-pink-600 font-medium">3</td>
                                        <td className="py-2"><ExerciseLink name="All Fours with Ball Pelvic Tilts" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">10 reps</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Tuck pelvis gently, keep upper body relaxed, avoid doming</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Option C */}
                              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                                <h5 className="font-bold text-teal-700 mb-3 flex items-center gap-2">
                                  <span className="bg-teal-500 text-white px-2 py-1 rounded text-xs">OPTION C</span>
                                  STRETCH & RELEASE (2-3 rounds)
                                </h5>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-teal-200">
                                        <th className="text-left py-2 text-teal-700">#</th>
                                        <th className="text-left py-2 text-teal-700">Exercise <PlayAllButton url={getPlayAllUrl('program5-day2-option-c-stretch-release')} /></th>
                                        <th className="text-left py-2 text-teal-700">Time/Reps</th>
                                        <th className="text-left py-2 text-teal-700">Notes</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-teal-100">
                                      <tr>
                                        <td className="py-2 text-teal-600 font-medium">1</td>
                                        <td className="py-2"><ExerciseLink name="Cat Camel" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">1 minute</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Move slowly, match your breath: inhale lift, exhale round</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-teal-600 font-medium">2</td>
                                        <td className="py-2"><ExerciseLink name="Same Side Single Leg Stretch & Reach" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">30 secs each</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Sit tall, reach arm overhead, breathe deeply into open side</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-teal-600 font-medium">3</td>
                                        <td className="py-2"><ExerciseLink name="Child Pose with Hips Lifted" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">2 minutes</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Knees wide, arms forward/by sides, soften shoulders and jaw</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="bg-pink-50 border border-pink-300 rounded-lg p-4">
                                <h5 className="font-bold text-pink-700 mb-2">Things to Remember</h5>
                                <p className="text-sm text-pink-600">
                                  Choose your focus based on how you feel. | You can switch halfway through if needed. | Go for quality over reps. | Prop yourself up — it's not cheating. | Let your breath guide every move.
                                </p>
                              </div>

                              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                                <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4" /> Precautions
                                </h5>
                                <p className="text-xs text-amber-600">
                                  Keep Core Gentle — no crunching or straining. | Stretch Lightly — avoid anything deep or forced. | Modify as Needed — no watching. | Hydrate After. | Stop or Rest if Needed.
                                </p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* P5 DAY 3 */}
                        <AccordionItem value="program5-day3" className="border border-amber-200 rounded-xl overflow-hidden bg-white shadow-md">
                          <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-amber-50 [&[data-state=open]]:bg-gradient-to-r [&[data-state=open]]:from-amber-100 [&[data-state=open]]:to-orange-100" data-testid="accordion-program5-day3">
                            <div className="flex items-center gap-4 w-full">
                              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                D3
                              </div>
                              <div className="text-left flex-1">
                                <h4 className="font-bold text-amber-800">MIX & MATCH FLOW</h4>
                                <p className="text-sm text-gray-600">20-25 mins • Combine 3-4 soft movement flows based on mood and mobility</p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-6">
                            <div className="space-y-6">
                              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                                <p className="text-sm text-gray-700 italic">
                                  <strong className="text-amber-600">Coach's Note:</strong> This is your full-body unwind. These gentle flows are here to create space and release tension. Let it feel like a moving meditation.
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                  <h5 className="font-semibold text-orange-700 text-sm mb-2">Equipment Needed</h5>
                                  <p className="text-xs text-orange-600">As needed</p>
                                </div>
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                  <h5 className="font-semibold text-amber-700 text-sm mb-2">Time & Focus</h5>
                                  <p className="text-xs text-amber-600">20-25 Mins</p>
                                  <p className="text-xs text-amber-600 mt-1">Combine 3-4 soft movement flows based on mood and mobility</p>
                                </div>
                              </div>

                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                                  <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                  WARM-UP (5-7 mins)
                                </h5>
                                <div className="bg-white rounded-lg p-3">
                                  <p className="font-medium text-gray-800">PRENATAL WARMUP</p>
                                  <p className="text-sm text-gray-600">8 reps of each</p>
                                </div>
                              </div>

                              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <h5 className="font-bold text-orange-700 mb-3 flex items-center gap-2">
                                  <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                  MAIN WORKOUT: PICK 3-4 FLOWS (2-3 rounds)
                                </h5>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-orange-200">
                                        <th className="text-left py-2 text-orange-700">#</th>
                                        <th className="text-left py-2 text-orange-700">Flows <PlayAllButton url={getPlayAllUrl('program5-day3-main-workout')} /></th>
                                        <th className="text-left py-2 text-orange-700">Reps/Time</th>
                                        <th className="text-left py-2 text-orange-700">Notes</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-orange-100">
                                      <tr>
                                        <td className="py-2 text-orange-600 font-medium">1</td>
                                        <td className="py-2"><ExerciseLink name="Cat Camel + Thread-the-Needle" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">6+6 each side</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Move slowly through each pose. Pause and hold. Let breath guide rhythm.</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-orange-600 font-medium">2</td>
                                        <td className="py-2"><ExerciseLink name="Seated 90 90 Glute Lift + Cross Legged Neck Rotations" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">6/side + 6 breaths</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Keep hips grounded during lifts. Neck movements should be soft and smooth.</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-orange-600 font-medium">3</td>
                                        <td className="py-2"><ExerciseLink name="Side Lying Pillow Squeeze + All Fours Shoulder Taps" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">6/side + 20 reps</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Gently squeeze cushion with thighs. Keep hips stable during shoulder taps.</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-orange-600 font-medium">4</td>
                                        <td className="py-2"><ExerciseLink name="Supine Head Lifts + Glute Bridge with Cross Reach" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">6 breaths + 10 reps</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Lift head gently only if core feels supported. Use cushion between knees.</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-orange-600 font-medium">5</td>
                                        <td className="py-2"><ExerciseLink name="Bird Dog + Child Pose with Hips Lifted" exercises={exercises} /></td>
                                        <td className="py-2 text-gray-600">12 reps / 30 secs</td>
                                        <td className="py-2 text-gray-500 italic text-xs">Alternate sides with control. Keep hips elevated in Child Pose.</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                                <h5 className="font-bold text-rose-700 mb-3 flex items-center gap-2">
                                  <Heart className="w-4 h-4" />
                                  FINISH WITH GRATITUDE REST POSE (2 mins)
                                </h5>
                                <div className="bg-white rounded-lg p-4">
                                  <p className="font-medium text-gray-800 mb-2">Supine Core Compressions + Wall Sit with Ball</p>
                                  <p className="text-sm text-gray-600 mb-3">6 breaths + 6 squeezes • Exhale to connect core during compressions. Gently squeeze the ball with knees or thighs.</p>
                                  <div className="border-t border-rose-100 pt-3 mt-3">
                                    <p className="text-sm text-rose-600 italic">Hands on heart, eyes closed, slow breathing.</p>
                                    <p className="text-sm text-rose-700 font-medium mt-2">"I trust my body and my journey."</p>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-pink-50 border border-pink-300 rounded-lg p-4">
                                <h5 className="font-bold text-pink-700 mb-2">Things to Remember</h5>
                                <p className="text-sm text-pink-600">
                                  Choose 3–4 flows or just repeat your favorite. | Breathe into the movement and release tension. | Use props under knees, hips, or hands. | Let this feel like a pause, not a push. | You don't have to do everything.
                                </p>
                              </div>

                              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                                <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4" /> Precautions
                                </h5>
                                <p className="text-xs text-amber-600">
                                  Avoid Long Holds or Deep Twists. | Modify to Seated or Wall-Supported if Needed. | Keep Ranges Small and Comfortable. | Breaks Between Flows. | Hydrate Gently After.
                                </p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NUTRITION TAB */}
          <TabsContent value="nutrition" className="mt-6">
            <NutritionSection 
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              navigateToNextTab={navigateToNextTab}
              navigateToPreviousTab={navigateToPreviousTab}
              getNavigationText={(direction: 'prev' | 'next') => {
                const currentIndex = tabOrder.indexOf(activeTab);
                if (direction === 'prev' && currentIndex > 0) {
                  return getTabName(tabOrder[currentIndex - 1]);
                }
                if (direction === 'next' && currentIndex < tabOrder.length - 1) {
                  return getTabName(tabOrder[currentIndex + 1]);
                }
                return '';
              }}
            />
          </TabsContent>

          {/* POSTPARTUM PREP TAB */}
          <TabsContent value="postpartum" className="mt-6">
            <Card className="bg-gradient-to-br from-white to-rose-50 border-rose-200 shadow-lg">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full mb-4 shadow-lg">
                    <Baby className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-rose-800 mb-2">Preparing for Postpartum</h2>
                  <p className="text-gray-600">Get ready for your recovery after birth</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-rose-100 border border-rose-300 rounded-lg p-4">
                    <h4 className="font-bold text-rose-800 mb-2">What to Expect After Birth</h4>
                    <p className="text-sm text-rose-700">Your body has done incredible work growing and birthing a baby. Give yourself grace during recovery. The first 6 weeks are about rest, bonding, and gentle movement when you feel ready.</p>
                  </div>

                  <div className="bg-pink-100 border border-pink-300 rounded-lg p-4">
                    <h4 className="font-bold text-pink-800 mb-2">Your Recovery Journey</h4>
                    <ul className="text-sm text-pink-700 space-y-2">
                      <li><strong>Week 1-2:</strong> Focus on rest, gentle walking, and pelvic floor awareness</li>
                      <li><strong>Week 3-4:</strong> Continue gentle movement, reconnecting with your core</li>
                      <li><strong>Week 5-6:</strong> Gradual increase in activity as cleared by your provider</li>
                      <li><strong>6+ Weeks:</strong> Return to structured exercise program (like Heal Your Core!)</li>
                    </ul>
                  </div>

                  <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
                    <h4 className="font-bold text-purple-800 mb-2">What's Next: Heal Your Core</h4>
                    <p className="text-sm text-purple-700">After your 6-week check-up, you'll be ready to start the Heal Your Core postpartum recovery program. This program is specifically designed to rebuild your core strength, heal diastasis recti, and restore your confidence.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQS TAB */}
          <TabsContent value="faqs" className="mt-6">
            <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full mb-4 shadow-lg">
                    <HelpCircle className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Frequently Asked Questions</h2>
                  <p className="text-gray-600">Common questions about prenatal fitness</p>
                </div>

                <Accordion type="single" collapsible className="space-y-3">
                  <AccordionItem value="faq-1" className="border border-gray-200 rounded-lg bg-white">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <span className="text-left font-medium text-gray-800">Is exercise safe during pregnancy?</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <p className="text-sm text-gray-600">Yes, exercise is generally safe and beneficial during a healthy pregnancy. Always consult your healthcare provider before starting or continuing an exercise program. Listen to your body and modify as needed.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq-2" className="border border-gray-200 rounded-lg bg-white">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <span className="text-left font-medium text-gray-800">How often should I exercise?</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <p className="text-sm text-gray-600">Aim for 2-5 days per week depending on your energy levels and chosen program. Consistency is more important than intensity. Some movement is always better than none.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq-3" className="border border-gray-200 rounded-lg bg-white">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <span className="text-left font-medium text-gray-800">What if I wasn't exercising before pregnancy?</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <p className="text-sm text-gray-600">It's never too late to start! Begin with gentle movements and the lower-intensity programs (Program 3 or 4). Gradually build up as your body adapts. Always get clearance from your healthcare provider first.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq-4" className="border border-gray-200 rounded-lg bg-white">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <span className="text-left font-medium text-gray-800">What exercises should I avoid?</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <p className="text-sm text-gray-600">Avoid contact sports, exercises with high fall risk, lying flat on your back after the first trimester, deep twists, and exercises that cause pain or discomfort. When in doubt, modify or skip.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq-5" className="border border-gray-200 rounded-lg bg-white">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <span className="text-left font-medium text-gray-800">When should I stop exercising?</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <p className="text-sm text-gray-600">Stop immediately and contact your healthcare provider if you experience vaginal bleeding, dizziness, shortness of breath before starting exercise, chest pain, headache, muscle weakness, calf pain or swelling, uterine contractions, decreased fetal movement, or fluid leaking.</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={navigateToPreviousTab}
            disabled={!canGoPrevious()}
            className="flex items-center gap-2"
            data-testid="button-previous-section"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="text-sm text-gray-500">
            {tabOrder.indexOf(activeTab) + 1} of {tabOrder.length}
          </div>
          
          <Button
            onClick={navigateToNextTab}
            disabled={!canGoNext()}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            data-testid="button-next-section"
          >
            Continue to {canGoNext() ? getTabName(tabOrder[tabOrder.indexOf(activeTab) + 1]) : ''}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
