import { useEffect, useState, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import KnowledgeArticleModal from "@/components/knowledge-article-modal";
import ZoeWelcomeModal from "@/components/zoe-welcome-modal";
import { 
  Play, 
  Dumbbell, 
  ChartBar, 
  ArrowLeft, 
  Heart,
  Calendar,
  Target,
  Apple,
  Brain,
  Menu,
  Sparkles,
  Camera,
  HelpCircle,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import ProfileSettings from "@/components/profile-settings";
import ProgressPage from "@/pages/progress";
import WelcomeSection from "@/components/program-sections/WelcomeSection";
import UnderstandingYourCoreSection from "@/components/program-sections/UnderstandingYourCoreSection";
import HealSection from "@/components/program-sections/HealSection";
import ProgramsSection from "@/components/program-sections/ProgramsSection";
import NutritionSection from "@/components/program-sections/NutritionSection";
import WhatComesNextSection from "@/components/program-sections/WhatComesNextSection";
import type { User } from "@shared/schema";

export default function HealYourCorePage() {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [programId, setProgramId] = useState<string>("");
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [activeTab, setActiveTab] = useState("welcome");
  const [animatingNumber, setAnimatingNumber] = useState<number | null>(null);
  const prevActiveTabRef = useRef(activeTab);

  // Trigger animation when advancing to a new section
  useEffect(() => {
    const tabOrder = ['welcome', 'understanding', 'healing', 'progress', 'programs', 'nutrition', 'next-steps', 'faqs'];
    const currentIndex = tabOrder.indexOf(activeTab);
    const prevIndex = tabOrder.indexOf(prevActiveTabRef.current);
    
    // Only animate when moving forward to a new section
    if (currentIndex > prevIndex) {
      setAnimatingNumber(currentIndex);
      
      // Remove animation after completion
      const timer = setTimeout(() => {
        setAnimatingNumber(null);
      }, 900); // Animation duration
      
      return () => clearTimeout(timer);
    }
    
    prevActiveTabRef.current = activeTab;
  }, [activeTab]);
  
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  
  // Community promotion banner state
  const [bannerDismissed, setBannerDismissed] = useState(false);
  
  // Show promotional banner on specific tabs - WhatsApp card also available in Start Here tab
  // Hide if user has WhatsApp support
  const shouldShowCommunityBanner = 
    !bannerDismissed && 
    !user?.hasWhatsAppSupport &&
    (activeTab === 'healing' || activeTab === 'nutrition' || activeTab === 'faqs');

  // Tab navigation helpers
  const tabOrder = ["welcome", "understanding", "healing", "programs", "nutrition", "next-steps", "faqs"];
  
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
  
  const canGoNext = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    return currentIndex < tabOrder.length - 1;
  };
  
  const canGoPrevious = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    return currentIndex > 0;
  };
  
  const getTabName = (tabValue: string) => {
    const tabNames = {
      'welcome': 'Start Here',
      'understanding': 'Core Knowledge', 
      'healing': 'Healing',
      'programs': 'Programs',
      'nutrition': 'Nutrition',
      'next-steps': "What's Next",
      'faqs': 'FAQs'
    };
    return tabNames[tabValue as keyof typeof tabNames] || tabValue;
  };
  
  const getNavigationText = (direction: 'prev' | 'next') => {
    const currentIndex = tabOrder.indexOf(activeTab);
    if (direction === 'prev' && currentIndex > 0) {
      const prevTab = tabOrder[currentIndex - 1];
      return `Back to ${getTabName(prevTab)}`;
    }
    if (direction === 'next' && currentIndex < tabOrder.length - 1) {
      const nextTab = tabOrder[currentIndex + 1];
      return `Continue to ${getTabName(nextTab)}`;
    }
    return direction === 'prev' ? 'Go Back' : 'Continue';
  };

  // Hardcode program details for instant loading (no slow database query needed)
  const HEAL_YOUR_CORE_PROGRAM = {
    id: "b03be40d-290e-4c96-bbb4-0267371c8024",
    name: "Your Postpartum Strength Recovery Program",
    description: "A gentle, expert-led program to rebuild your core and pelvic floor, designed for mamas, whether you are 6 weeks or 6 years postpartum.",
    level: "Postnatal",
    duration: "6 Weeks",
    equipment: "Minimal Equipment",
    imageUrl: "/assets/Screenshot 2025-09-24 at 10.19.38_1758689399488.png",
    price: 250000,
    workoutCount: 22,
    isActive: true,
    isVisible: true,
  };

  const healYourCoreProgram = HEAL_YOUR_CORE_PROGRAM;

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setProgramId(HEAL_YOUR_CORE_PROGRAM.id); // Set immediately
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Check program access (cached for 5 minutes to avoid redundant checks)
  const { data: accessData, isLoading: isLoadingAccess } = useQuery({
    queryKey: ["/api/program-access", user?.id, programId],
    enabled: !!user && !!programId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Get knowledge articles (cached for 10 minutes - rarely changes)
  const { data: knowledgeArticles } = useQuery({
    queryKey: ["/api/knowledge-articles", programId],
    enabled: !!programId && (accessData as any)?.hasAccess,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // Get progress entries (cached for 1 minute - updates frequently)
  const { data: progressEntries } = useQuery({
    queryKey: ["/api/progress-tracking", user?.id, programId],
    enabled: !!user && !!programId && (accessData as any)?.hasAccess,
    staleTime: 1 * 60 * 1000, // Cache for 1 minute
  });

  // Check if user should see disclaimer modal on this session
  useEffect(() => {
    if (user && (accessData as any)?.hasAccess) {
      const shouldShowDisclaimer = sessionStorage.getItem("showDisclaimerOnSession");
      if (shouldShowDisclaimer === "true") {
        setShowWelcomeModal(true);
      }
    }
  }, [user, accessData]);

  const handleWelcomeClose = (hasConsented: boolean) => {
    if (hasConsented) {
      // Clear the session flag so disclaimer won't show again this session
      sessionStorage.removeItem("showDisclaimerOnSession");
    }
    setShowWelcomeModal(false);
  };

  if (!user || !healYourCoreProgram) {
    return (
      <div className="min-h-screen bg-background p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Show loading state while checking access
  if (isLoadingAccess) {
    return (
      <div className="min-h-screen bg-background p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!(accessData as any)?.hasAccess) {
    return (
      <div className="min-h-screen bg-background p-3 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")}
            className="mb-6 h-auto py-3"
            data-testid="button-back-to-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Heal Your Core</CardTitle>
              <CardDescription className="text-lg">
                6-week postnatal fitness course designed to help you recover and strengthen your core after childbirth
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img 
                    src={healYourCoreProgram.imageUrl} 
                    alt="Heal Your Core Program"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span>{healYourCoreProgram.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span>{healYourCoreProgram.level}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-primary" />
                    <span>{healYourCoreProgram.equipment}</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    ₹{(healYourCoreProgram.price / 100).toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Button 
                  size="lg" 
                  className="w-full max-w-md h-auto py-3"
                  data-testid="button-purchase-program"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Get Access to Heal Your Core
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Join hundreds of mothers on their core recovery journey
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const completedWeeks = Array.isArray(progressEntries) ? progressEntries.length : 0;
  const progressPercentage = (completedWeeks / 6) * 100;

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side navigation */}
            <div className="flex items-center">
              {/* Hamburger Menu Button */}
              <button 
                className="p-3 relative transition-all duration-300 md:hover:scale-110 md:hover:rotate-12 active:scale-95 group touch-manipulation"
                data-testid="button-hamburger-menu"
                aria-label={showProfileSettings ? "Close menu" : "Open menu"}
                onClick={() => setShowProfileSettings(!showProfileSettings)}
              >
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <div className={`absolute transition-all duration-300 transform md:group-hover:scale-110 ${
                    showProfileSettings ? 'rotate-45 translate-y-0' : 'rotate-0 -translate-y-2'
                  }`}>
                    <div className="w-6 h-0.5 bg-gradient-to-r from-rose-400 via-pink-500 to-pink-600 rounded shadow-sm md:group-hover:shadow-md md:group-hover:shadow-pink-200"></div>
                  </div>
                  <div className={`absolute transition-all duration-300 md:group-hover:scale-110 ${
                    showProfileSettings ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
                  }`}>
                    <div className="w-6 h-0.5 bg-gradient-to-r from-rose-400 via-pink-500 to-pink-600 rounded shadow-sm md:group-hover:shadow-md md:group-hover:shadow-pink-200"></div>
                  </div>
                  <div className={`absolute transition-all duration-300 transform md:group-hover:scale-110 ${
                    showProfileSettings ? '-rotate-45 translate-y-0' : 'rotate-0 translate-y-2'
                  }`}>
                    <div className="w-6 h-0.5 bg-gradient-to-r from-rose-400 via-pink-500 to-pink-600 rounded shadow-sm md:group-hover:shadow-md md:group-hover:shadow-pink-200"></div>
                  </div>
                </div>
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-rose-400/20 via-pink-500/20 to-pink-600/20 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 blur-md"></div>
              </button>
            </div>
            
            {/* Centered Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link to="/dashboard">
                <img 
                  src="/assets/logo.png" 
                  alt="Studio Bloom" 
                  className="h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200"
                />
              </Link>
            </div>
            
            {/* Right side spacer to maintain balance */}
            <div className="flex items-center opacity-0 pointer-events-none">
              <button className="p-3 rounded-lg">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Settings Overlay */}
      {showProfileSettings && user && (
        <ProfileSettings 
          isOpen={showProfileSettings} 
          onClose={() => setShowProfileSettings(false)}
          user={user}
          onUserUpdate={handleUserUpdate}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Program Header */}
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
          <div className="bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200 shadow-xl rounded-lg overflow-hidden">
            {/* Greeting Section */}
            <div className="p-3 sm:p-4 md:p-6 border-b border-pink-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-pink-500 to-pink-700 bg-clip-text text-transparent">Hello {user.firstName}!</h3>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium mt-0.5">Ready to strengthen your core today?</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs sm:text-sm text-gray-500 font-medium">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="flex items-center justify-end space-x-1 mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">Active</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/50 rounded-lg p-2.5 sm:p-3 border border-pink-200/50">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-pink-500" />
                    <span className="text-gray-700 font-medium">Your recovery journey starts here</span>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-pink-400" />
                    <span className="text-pink-600 font-semibold text-xs">6-Week Program</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <div className="overflow-x-auto scrollbar-hide px-0">
              <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
                <TabsList className="tab-flow-container flex gap-2 sm:gap-3 md:gap-4 h-auto bg-transparent border-0 shadow-none w-max md:w-full md:grid md:grid-cols-8 mx-0">
                  <TabsTrigger value="welcome" data-testid="tab-welcome" className="text-xs sm:text-sm min-h-[60px] sm:min-h-[65px] md:min-h-[60px] min-w-[70px] sm:min-w-[75px] md:min-w-[80px] flex-col p-2 sm:p-3 md:p-4 bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-pink-300 relative z-10 flex-shrink-0">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mb-1 sm:mb-2" />
                    <span className="font-medium text-center leading-tight">Start Here</span>
                  </TabsTrigger>
                  <TabsTrigger value="understanding" data-testid="tab-understanding" className="text-xs sm:text-sm min-h-[60px] sm:min-h-[65px] md:min-h-[60px] min-w-[70px] sm:min-w-[75px] md:min-w-[80px] flex-col p-2 sm:p-3 md:p-4 bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-pink-300 relative z-10 flex-shrink-0">
                    <Brain className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mb-1 sm:mb-2" />
                    <span className="font-medium text-center leading-tight">Core</span>
                  </TabsTrigger>
                  <TabsTrigger value="healing" data-testid="tab-healing" className="text-xs sm:text-sm min-h-[60px] sm:min-h-[65px] md:min-h-[60px] min-w-[70px] sm:min-w-[75px] md:min-w-[80px] flex-col p-2 sm:p-3 md:p-4 bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-pink-300 relative z-10 flex-shrink-0">
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mb-1 sm:mb-2" />
                    <span className="font-medium text-center leading-tight">Heal</span>
                  </TabsTrigger>
                  <TabsTrigger value="progress" data-testid="tab-progress" className="text-xs sm:text-sm min-h-[60px] sm:min-h-[65px] md:min-h-[60px] min-w-[70px] sm:min-w-[75px] md:min-w-[80px] flex-col p-2 sm:p-3 md:p-4 bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-pink-300 relative z-10 flex-shrink-0">
                    <Camera className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mb-1 sm:mb-2" />
                    <span className="font-medium text-center leading-tight">Progress</span>
                  </TabsTrigger>
                  <TabsTrigger value="programs" data-testid="tab-programs" className="text-xs sm:text-sm min-h-[60px] sm:min-h-[65px] md:min-h-[60px] min-w-[70px] sm:min-w-[75px] md:min-w-[80px] flex-col p-2 sm:p-3 md:p-4 bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-pink-300 relative z-10 flex-shrink-0">
                    <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mb-1 sm:mb-2" />
                    <span className="font-medium text-center leading-tight">Programs</span>
                  </TabsTrigger>
                  <TabsTrigger value="nutrition" data-testid="tab-nutrition" className="text-xs sm:text-sm min-h-[60px] sm:min-h-[65px] md:min-h-[60px] min-w-[70px] sm:min-w-[75px] md:min-w-[80px] flex-col p-2 sm:p-3 md:p-4 bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-pink-300 relative z-10 flex-shrink-0">
                    <Apple className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mb-1 sm:mb-2" />
                    <span className="font-medium text-center leading-tight">Nutrition</span>
                  </TabsTrigger>
                  <TabsTrigger value="next-steps" data-testid="tab-next-steps" className="text-xs sm:text-sm min-h-[60px] sm:min-h-[65px] md:min-h-[60px] min-w-[70px] sm:min-w-[75px] md:min-w-[80px] flex-col p-2 sm:p-3 md:p-4 bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-pink-300 relative z-10 flex-shrink-0">
                    <ChartBar className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mb-1 sm:mb-2" />
                    <span className="font-medium text-center leading-tight">What's Next</span>
                  </TabsTrigger>
                  <TabsTrigger value="faqs" data-testid="tab-faqs" className="text-xs sm:text-sm min-h-[60px] sm:min-h-[65px] md:min-h-[60px] min-w-[70px] sm:min-w-[75px] md:min-w-[80px] flex-col p-2 sm:p-3 md:p-4 bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-pink-300 relative z-10 flex-shrink-0">
                    <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mb-1 sm:mb-2" />
                    <span className="font-medium text-center leading-tight">FAQs</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Game-like Journey Progress Bar - Connected */}
            <div className="relative px-3 sm:px-6 md:px-12 py-3 sm:py-4 md:py-6 bg-white border-t border-pink-200">
              <div className="flex items-center justify-between relative">
                {/* Background connecting line */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 sm:h-1 bg-gray-200 -translate-y-1/2 rounded-full"></div>
                
                {/* Active progress line */}
                <div 
                  className="absolute top-1/2 h-0.5 sm:h-1 rounded-full -translate-y-1/2 transition-all duration-700 ease-out"
                  style={{
                    left: '0%',
                    width: `${(() => {
                      const tabOrder = ['welcome', 'understanding', 'healing', 'progress', 'programs', 'nutrition', 'next-steps', 'faqs'];
                      const currentIndex = tabOrder.indexOf(activeTab);
                      return (currentIndex / (tabOrder.length - 1)) * 100;
                    })()}%`,
                    background: (() => {
                      const colors = [
                        'linear-gradient(135deg, #f3a8cb 0%, #ec4899 100%)', // Welcome - Light pink
                        'linear-gradient(135deg, #b3c0e4 0%, #3b82f6 100%)', // Understanding - Light blue  
                        'linear-gradient(135deg, #cbde9a 0%, #10b981 100%)', // Healing - Light green
                        'linear-gradient(135deg, #fb7185 0%, #f472b6 100%)', // Progress - Pink
                        'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Programs - Orange
                        'linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)', // Nutrition - Teal
                        'linear-gradient(135deg, #c2b9a1 0%, #6366f1 100%)', // Next Steps - Light brown to indigo
                        'linear-gradient(135deg, #8b5cf6 0%, #ef4444 100%)'  // FAQs - Purple to red
                      ];
                      const tabOrder = ['welcome', 'understanding', 'healing', 'progress', 'programs', 'nutrition', 'next-steps', 'faqs'];
                      const currentIndex = tabOrder.indexOf(activeTab);
                      return colors[currentIndex] || colors[0];
                    })()
                  }}
                />
                
                {/* Progress Numbers */}
                {(() => {
                  const tabOrder = ['welcome', 'understanding', 'healing', 'progress', 'programs', 'nutrition', 'next-steps', 'faqs'];
                  const currentIndex = tabOrder.indexOf(activeTab);
                  const colors = [
                    '#f3a8cb', // Welcome - Light pink
                    '#b3c0e4', // Understanding - Light blue
                    '#cbde9a', // Healing - Light green
                    '#fb7185', // Progress - Pink
                    '#f59e0b', // Programs - Orange
                    '#14b8a6', // Nutrition - Teal
                    '#c2b9a1', // Next Steps - Light brown
                    '#8b5cf6'  // FAQs - Purple
                  ];
                  
                  return tabOrder.map((tab, index) => {
                    const isUnlocked = index <= currentIndex;
                    const isAnimating = animatingNumber === index;
                    const isCurrentStep = index === currentIndex;
                    
                    return (
                      <div 
                        key={tab}
                        className={`relative w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border-2 md:border-3 flex items-center justify-center text-xs sm:text-sm font-bold z-10 transition-all duration-500 ${
                          isUnlocked 
                            ? 'text-white border-white shadow-lg' 
                            : 'bg-gray-300 text-gray-500 border-gray-200'
                        } ${
                          isAnimating 
                            ? 'animate-bounce-pop scale-125 shadow-2xl' 
                            : ''
                        } ${
                          isCurrentStep && isUnlocked
                            ? 'ring-4 ring-white ring-opacity-50 animate-pulse-glow'
                            : ''
                        }`}
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
                        {isAnimating && (
                          <>
                            <div className="absolute inset-0 rounded-full bg-white opacity-30 animate-ping"></div>
                            <div className="absolute inset-0 rounded-full border-2 border-white animate-ping" style={{ animationDelay: '0.2s' }}></div>
                          </>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
          
          {/* Medical Disclaimer Moving Bar */}
          <div className="bg-gray-100 border-y border-gray-200 py-2">
            <div className="marquee" style={{ ['--marquee-duration' as any]: '150s' }}>
              <div className="marquee-track">
                <div className="marquee-content">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span key={i} className="text-xs text-gray-600 font-medium">
                      <strong>IMPORTANT:</strong> This guide is based on my personal experience and research as Zoe Modgill. It's not intended to replace professional medical advice, diagnosis, or treatment.
                    </span>
                  ))}
                </div>
                <div className="marquee-content" aria-hidden="true">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span key={`duplicate-${i}`} className="text-xs text-gray-600 font-medium">
                      <strong>IMPORTANT:</strong> This guide is based on my personal experience and research as Zoe Modgill. It's not intended to replace professional medical advice, diagnosis, or treatment.
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Community Promotion Banner */}
          {shouldShowCommunityBanner && (
            <div className="sticky top-16 z-30 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-l-4 border-green-500 shadow-lg transform transition-all duration-500 ease-in-out">
              <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-green-800 truncate">
                        💙 Join WhatsApp Community!
                      </p>
                      <p className="text-[10px] sm:text-xs text-green-600 truncate">
                        Get guidance & support • ₹1000/3mo
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                    <Button
                      onClick={() => {
                        window.open('https://www.strongerwithzoe.in/products/whatsapp-community', '_blank');
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-1"
                      data-testid="banner-join-community"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                      </svg>
                      <span>Join</span>
                    </Button>
                    <Button
                      onClick={() => setBannerDismissed(true)}
                      variant="ghost"
                      className="p-1.5 sm:p-2 h-6 w-6 sm:h-8 sm:w-8 text-green-600 hover:text-green-800 hover:bg-green-100"
                      data-testid="banner-dismiss"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Contents - All sections are now imported */}
          <TabsContent value="welcome">
            <WelcomeSection 
              user={user}
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              navigateToNextTab={navigateToNextTab}
              navigateToPreviousTab={navigateToPreviousTab}
              getNavigationText={getNavigationText}
            />
          </TabsContent>

          <TabsContent value="understanding">
            <UnderstandingYourCoreSection 
              articles={Array.isArray(knowledgeArticles) ? knowledgeArticles : []} 
              onArticleClick={setSelectedArticle}
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              navigateToNextTab={navigateToNextTab}
              navigateToPreviousTab={navigateToPreviousTab}
              getNavigationText={getNavigationText}
            />
          </TabsContent>

          <TabsContent value="healing">
            <HealSection 
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              navigateToNextTab={navigateToNextTab}
              navigateToPreviousTab={navigateToPreviousTab}
              getNavigationText={getNavigationText}
            />
          </TabsContent>

          <TabsContent value="progress">
            <ProgressPage />
          </TabsContent>

          <TabsContent value="programs">
            <ProgramsSection 
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              navigateToNextTab={navigateToNextTab}
              navigateToPreviousTab={navigateToPreviousTab}
              getNavigationText={getNavigationText}
            />
          </TabsContent>

          <TabsContent value="nutrition">
            <NutritionSection 
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              navigateToNextTab={navigateToNextTab}
              navigateToPreviousTab={navigateToPreviousTab}
              getNavigationText={getNavigationText}
            />
          </TabsContent>

          <TabsContent value="next-steps">
            <WhatComesNextSection 
              userId={user.id} 
              programId={programId} 
              progressEntries={Array.isArray(progressEntries) ? progressEntries : []} 
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              navigateToNextTab={navigateToNextTab}
              navigateToPreviousTab={navigateToPreviousTab}
              getNavigationText={getNavigationText}
            />
          </TabsContent>

          <TabsContent value="faqs" className="mt-6 space-y-6" data-testid="content-faqs">
            <div className="text-left mb-8">
              <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-600 bg-clip-text text-transparent drop-shadow-sm">
                Frequently Asked Questions
              </h1>
              <p className="text-sm font-medium text-gray-600 border-l-4 border-purple-400 pl-4 bg-gradient-to-r from-purple-50 to-transparent py-2">
                Real questions, honest answers because you deserve clarity, not confusion
              </p>
            </div>

            <div className="space-y-4">
              <Accordion type="multiple" className="w-full space-y-4">
                
                <AccordionItem value="faq-1" className="border border-pink-200 rounded-lg bg-white shadow-sm">
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                    <span className="font-semibold text-gray-800">1. What if I still see doming or coning in Week 3 or 4?</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    That's okay. Healing isn't linear. If you notice doming during movements, pause, scale back to earlier exercises, and revisit the breakdown and core connection cues. It's not about pushing harder—it's about moving smarter.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-2" className="border border-pink-200 rounded-lg bg-white shadow-sm">
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                    <span className="font-semibold text-gray-800">2. Can I do this program if I'm more than a year postpartum?</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    Absolutely. Whether you're 6 weeks or 6 years postpartum, core rehab is always relevant. This program supports healing, building strength, and reconnection at any stage.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-3" className="border border-pink-200 rounded-lg bg-white shadow-sm">
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                    <span className="font-semibold text-gray-800">3. What if I had a C-section? Will this still help me?</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    Yes! The program includes specific modifications and cautions for C-section recovery. Always listen to your body around the scar site and reduce or pause movements that feel too intense.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-4" className="border border-pink-200 rounded-lg bg-white shadow-sm">
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                    <span className="font-semibold text-gray-800">4. I don't have diastasis recti—should I still do this program?</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    Yes. Even without diastasis recti, postpartum core restoration is essential. Pregnancy, birth, and early motherhood stress the pelvic floor, deep core muscles, and diaphragm. This program helps you rebuild strength, improve posture, reduce back pain, and prevent long-term pelvic floor issues.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-5" className="border border-pink-200 rounded-lg bg-white shadow-sm">
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                    <span className="font-semibold text-gray-800">5. Can I do this if I'm breastfeeding?</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    Absolutely. The exercises are safe and gentle during breastfeeding. Remember to eat enough, stay hydrated, and adjust intensity as needed. Breastfeeding can affect energy and recovery—honour that.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-6" className="border border-pink-200 rounded-lg bg-white shadow-sm">
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                    <span className="font-semibold text-gray-800">6. What if I don't have all the equipment listed?</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    Many exercises can be done with household items. For example, use a water bottle instead of a weight, a rolled towel instead of a Pilates ball, or a sturdy chair instead of a yoga block. Adapt where needed—it's better to move with what you have than not move at all.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-7" className="border border-pink-200 rounded-lg bg-white shadow-sm">
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                    <span className="font-semibold text-gray-800">7. Can I skip the breathing exercises and go straight to the workout?</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    Please don't. Breathing exercises activate your deep core, diaphragm, and pelvic floor—which makes the workouts safer, more effective, and helps prevent injury. Skipping them is like skipping the foundation of a house.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-8" className="border border-pink-200 rounded-lg bg-white shadow-sm">
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                    <span className="font-semibold text-gray-800">8. How long should I rest between exercises?</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    Rest as much as you need. A minimum of 30 seconds to 1 minute is recommended, but if you need more, take it. This is not a race.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-9" className="border border-pink-200 rounded-lg bg-white shadow-sm">
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                    <span className="font-semibold text-gray-800">9. Is it normal to feel sore after workouts?</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    Yes, some muscle soreness is normal—especially in the first 1-2 weeks as your body adapts. But pain, sharp discomfort, pressure in your pelvic floor, or leaking during movement is not normal. Stop, reduce, and reassess.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-10" className="border border-pink-200 rounded-lg bg-white shadow-sm">
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                    <span className="font-semibold text-gray-800">10. What if I feel leaking or pressure during an exercise?</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    Stop immediately. This is your body's way of saying the exercise is too challenging right now. Scale back, revisit breath work, reduce reps or intensity, and check in with a pelvic floor specialist if symptoms persist.
                  </AccordionContent>
                </AccordionItem>

              </Accordion>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Journey Complete!</h3>
                <p className="text-sm text-gray-600">You've explored all sections of your program</p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                {canGoPrevious() && (
                  <Button
                    variant="outline"
                    className="border-2 border-pink-300 text-pink-600 hover:bg-pink-50 px-6 sm:px-8 py-4 sm:py-3 text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 inline-flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
                    data-testid="button-prev-section-faqs"
                    onClick={navigateToPreviousTab}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {getNavigationText('prev')}
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {selectedArticle && (
        <KnowledgeArticleModal
          article={selectedArticle}
          isOpen={!!selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
      
      {showWelcomeModal && (
        <ZoeWelcomeModal
          isOpen={showWelcomeModal}
          onClose={handleWelcomeClose}
        />
      )}
    </div>
  );
}
