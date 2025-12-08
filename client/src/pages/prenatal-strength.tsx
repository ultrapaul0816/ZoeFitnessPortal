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
                        <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-pink-500" /> Feeling energetic and strong? → Go for <strong>Program 1</strong></li>
                        <li className="flex items-center gap-2"><Target className="w-4 h-4 text-purple-500" /> Steady, moderate days? → Pick <strong>Program 2</strong></li>
                        <li className="flex items-center gap-2"><Heart className="w-4 h-4 text-blue-500" /> Low to mid-energy? → Choose <strong>Program 3</strong></li>
                        <li className="flex items-center gap-2"><Star className="w-4 h-4 text-teal-500" /> Exhausted or sore? → Try <strong>Program 4</strong></li>
                        <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" /> Want to create your own? → Use <strong>Program 5</strong></li>
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

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {programOptions.map((prog, idx) => (
                    <div key={idx} className={`bg-gradient-to-br ${prog.color} p-5 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer`}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl font-bold opacity-50">{idx + 1}</span>
                        <div>
                          <p className="font-bold text-lg">{prog.program}</p>
                          <p className="text-sm opacity-90">{prog.days} / week</p>
                        </div>
                      </div>
                      <div className="bg-white/20 rounded-lg p-3 mb-3">
                        <p className="font-semibold">{prog.theme}</p>
                        <p className="text-xs opacity-90">{prog.themeDesc}</p>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{prog.workout}</p>
                        <p className="text-xs opacity-80">{prog.workoutDesc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 bg-purple-100 border border-purple-300 rounded-xl p-6 text-center">
                  <Clock className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <h4 className="font-bold text-purple-800 mb-2">Workouts Coming Soon</h4>
                  <p className="text-sm text-purple-700">The detailed workout exercises and videos for each program will be added here. Check back soon!</p>
                </div>
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
