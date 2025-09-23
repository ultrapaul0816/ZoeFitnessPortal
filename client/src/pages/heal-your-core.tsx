import { useEffect, useState, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import anatomyImage from "@assets/Screenshot 2025-09-21 at 14.30.34_1758445266265.png";
import videoThumbnailImage from "@assets/Screenshot 2025-09-22 at 12.15.21_1758537245258.png";
import breathingDiagram from "@assets/Screenshot 2025-09-21 at 14.32.23_1758445423086.png";
import tvaContentImage from "@assets/Screenshot 2025-09-21 at 14.38.24_1758445791011.png";
import tvaSkeletonImage from "@assets/Screenshot 2025-09-21 at 14.39.32_1758445791002.png";
import coreActivationImage from "@assets/Screenshot 2025-09-21 at 14.47.02_1758446239897.png";
import breathCoreImage from "@assets/Screenshot 2025-09-21 at 14.44.45_1758446182185.png";
import coreCompressionsImage from "@assets/Screenshot 2025-09-21 at 14.49.22_1758446389051.png";
import pelvicFloorImage from "@assets/Screenshot 2025-09-21 at 14.54.10_1758446664540.png";
import breathingActivationImage from "@assets/Screenshot 2025-09-21 at 14.55.17_1758446754817.png";
import domingImage from "@assets/Screenshot 2025-09-21 at 14.56.03_1758446776736.png";
import diastasisAnatomyImage from "@assets/Screenshot 2025-09-21 at 15.38.53_1758449353065.png";
import diastasisVariationsImage from "@assets/Screenshot 2025-09-21 at 15.39.02_1758449353058.png";
import diastasisCheckImage from "@assets/Screenshot 2025-09-21 at 15.56.11_1758450385583.png";
import coreRehabMattersImage from "@assets/Screenshot 2025-09-21 at 15.57.47_1758450544662.png";
import coreRehabExerciseImage from "@assets/Screenshot 2025-09-21 at 15.57.47_1758450479618.png";
import whyCrunchesImage from "@assets/Screenshot 2025-09-21 at 16.34.42_1758452773516.png";
import coreBreathImage from "@assets/Screenshot 2025-09-21 at 16.35.35_1758452773516.png";
import coreBreathDiagramImage from "@assets/Screenshot 2025-09-21 at 16.35.43_1758452773516.png";
import pressureManagementImage from "@assets/Screenshot 2025-09-21 at 16.35.50_1758452773516.png";
import breathCoordinationImage from "@assets/Screenshot 2025-09-21 at 16.36.02_1758452773500.png";
import zoeLogoImage from "@assets/Screenshot_2025-09-22_at_13.03.07-removebg-preview_1758527068639.png";
import yogaMatImage from "@assets/Screenshot 2025-09-22 at 13.29.38_1758528078678.png";
import yogaBlocksImage from "@assets/Screenshot 2025-09-22 at 13.29.49_1758528078677.png";
import miniResistanceBandsImage from "@assets/Screenshot 2025-09-22 at 13.29.57_1758528078677.png";
import miniPilatesBallImage from "@assets/Screenshot 2025-09-22 at 13.30.04_1758528078677.png";
import longResistanceBandImage from "@assets/Screenshot 2025-09-22 at 13.30.13_1758528078677.png";
import swissBallImage from "@assets/Screenshot 2025-09-22 at 13.30.19_1758528078676.png";
import foamRollerImage from "@assets/Screenshot 2025-09-22 at 13.30.27_1758528078676.png";
import nutritionBowlImage from "@assets/Screenshot 2025-09-22 at 21.26.02_1758556777492.png";
import handPortionsImage from "@assets/Screenshot_2025-09-22_at_21.52.32-removebg-preview_1758558857702.png";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import KnowledgeArticleModal from "@/components/knowledge-article-modal";
import ZoeWelcomeModal from "@/components/zoe-welcome-modal";
import { 
  Play, 
  BookOpen, 
  Dumbbell, 
  ChartBar, 
  ArrowLeft, 
  Heart,
  Calendar,
  Target,
  Video,
  Apple,
  Brain,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Activity,
  Menu,
  Star,
  Sprout,
  HelpCircle,
  Sparkles
} from "lucide-react";
import ProfileSettings from "@/components/profile-settings";
import type { User } from "@shared/schema";

export default function HealYourCorePage() {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [programId, setProgramId] = useState<string>("");
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isProgressExpanded, setIsProgressExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("welcome");
  const [animatingNumber, setAnimatingNumber] = useState<number | null>(null);
  const prevActiveTabRef = useRef(activeTab);

  // Trigger animation when advancing to a new section
  useEffect(() => {
    const tabOrder = ['welcome', 'understanding', 'healing', 'programs', 'nutrition', 'next-steps', 'faqs'];
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
  
  // Simple banner logic without complex state tracking - show on specific tabs
  const shouldShowCommunityBanner = 
    !bannerDismissed && 
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

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Get Heal Your Core program
  const { data: programs } = useQuery({
    queryKey: ["/api/programs"],
    enabled: !!user,
  });

  const healYourCoreProgram = Array.isArray(programs) ? programs.find((p: any) => p.name === "Your Postpartum Strength Recovery Program") : null;

  useEffect(() => {
    if (healYourCoreProgram) {
      setProgramId(healYourCoreProgram.id);
    }
  }, [healYourCoreProgram]);

  // Check program access
  const { data: accessData } = useQuery({
    queryKey: ["/api/program-access", user?.id, programId],
    enabled: !!user && !!programId,
  });

  // Get knowledge articles
  const { data: knowledgeArticles } = useQuery({
    queryKey: ["/api/knowledge-articles", programId],
    enabled: !!programId && (accessData as any)?.hasAccess,
  });

  // Get progress entries
  const { data: progressEntries } = useQuery({
    queryKey: ["/api/progress-tracking", user?.id, programId],
    enabled: !!user && !!programId && (accessData as any)?.hasAccess,
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
    return <div>Loading...</div>;
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
            data-testid="button-back"
            className="group relative flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:border-pink-300 hover:bg-pink-50 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-50"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-pink-600 transition-all duration-300 transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-pink-700 transition-colors duration-300">
              Back
            </span>
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400/0 to-pink-600/0 group-hover:from-pink-400/10 group-hover:to-pink-600/10 transition-all duration-300 pointer-events-none"></div>
          </button>
          <div className="zoe-logo-container relative">
            <img 
              src={zoeLogoImage} 
              alt="Pregnancy with Zoe" 
              className="zoe-logo-watermark w-24 h-14 object-contain cursor-pointer"
            />
          </div>
        </div>

        {/* Connected Progress and Navigation Container */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200 shadow-xl rounded-lg overflow-hidden">
            {/* Greeting Section */}
            <div className="p-3 sm:p-4 md:p-6 border-b border-pink-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
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
                <TabsList className="tab-flow-container flex gap-2 sm:gap-3 md:gap-4 h-auto bg-transparent border-0 shadow-none w-max md:w-full md:grid md:grid-cols-7 mx-0">
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
                      const tabOrder = ['welcome', 'understanding', 'healing', 'programs', 'nutrition', 'next-steps', 'faqs'];
                      const currentIndex = tabOrder.indexOf(activeTab);
                      return (currentIndex / (tabOrder.length - 1)) * 100;
                    })()}%`,
                    background: (() => {
                      const colors = [
                        'linear-gradient(135deg, #f3a8cb 0%, #ec4899 100%)', // Welcome - Light pink
                        'linear-gradient(135deg, #b3c0e4 0%, #3b82f6 100%)', // Understanding - Light blue  
                        'linear-gradient(135deg, #cbde9a 0%, #10b981 100%)', // Healing - Light green
                        'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Programs - Orange
                        'linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)', // Nutrition - Teal
                        'linear-gradient(135deg, #c2b9a1 0%, #6366f1 100%)', // Next Steps - Light brown to indigo
                        'linear-gradient(135deg, #8b5cf6 0%, #ef4444 100%)'  // FAQs - Purple to red
                      ];
                      const tabOrder = ['welcome', 'understanding', 'healing', 'programs', 'nutrition', 'next-steps', 'faqs'];
                      const currentIndex = tabOrder.indexOf(activeTab);
                      return colors[currentIndex] || colors[0];
                    })()
                  }}
                />
                
                {/* Progress Numbers */}
                {(() => {
                  const tabOrder = ['welcome', 'understanding', 'healing', 'programs', 'nutrition', 'next-steps', 'faqs'];
                  const currentIndex = tabOrder.indexOf(activeTab);
                  const colors = [
                    '#f3a8cb', // Welcome - Light pink
                    '#b3c0e4', // Understanding - Light blue
                    '#cbde9a', // Healing - Light green
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
            <div className="marquee" style={{ ['--marquee-duration' as any]: '90s' }}>
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
            <div className="sticky top-16 z-40 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-l-4 border-green-500 shadow-lg transform transition-all duration-500 ease-in-out">
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
                        window.open('https://www.strongerwithzoe.in/products/pwz-postnatal-heal-your-core', '_blank');
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

          <TabsContent value="welcome">
            <WelcomeSection 
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
            <TheRoleOfNutritionSection 
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
                    Yes! This program helps you rebuild deep core strength, improve posture, and reconnect with your body—even if you don't have a visible gap. It's for any mom who feels weak, unsupported, or unsure how to engage her core safely.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-5" className="border border-pink-200 rounded-lg bg-white shadow-sm">
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                    <span className="font-semibold text-gray-800">5. Can I combine this program with other workouts?</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    If you're cleared for movement and feel strong during this program, you may add light walks or low-impact movement on alternate days. Avoid high-intensity workouts until you've progressed through the rehab without symptoms.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-6" className="border border-pink-200 rounded-lg bg-white shadow-sm">
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                    <span className="font-semibold text-gray-800">6. How do I know if I'm ready to move to the next week?</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600 space-y-2">
                    <p>Use your body as a guide. Signs you're ready:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>No doming, leaking, or heaviness during the exercises</li>
                      <li>Core engagement feels reflexive, not forced</li>
                      <li>Posture and breath feel more natural</li>
                      <li>If unsure, stay another week in the same phase—there's no rush.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-7" className="border border-pink-200 rounded-lg bg-white shadow-sm">
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                    <span className="font-semibold text-gray-800">7. Can I repeat the program again?</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    Yes, and it's encouraged. The second round often brings even deeper awareness and strength. It's also a great reset if life got in the way the first time.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-8" className="border border-pink-200 rounded-lg bg-white shadow-sm">
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                    <span className="font-semibold text-gray-800">8. What if I missed a full week or more?</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    Just start again where you left off. There's no failure here. This program is designed to work with your real life.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-9" className="border border-pink-200 rounded-lg bg-white shadow-sm">
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                    <span className="font-semibold text-gray-800">9. Can I do this if I had vaginal birth with tearing or stitches?</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    Yes, once cleared by your healthcare provider. Go slow, listen to your pelvic floor, and avoid any movement that increases discomfort, heaviness, or pressure.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-10" className="border border-pink-200 rounded-lg bg-white shadow-sm">
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                    <span className="font-semibold text-gray-800">10. Should I wear a postpartum belt while doing these exercises?</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    You can if it offers support or makes you feel more stable, especially in early weeks. But it's not mandatory. Use your breath and TVA engagement as your primary "belt" over time.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-11" className="border border-pink-200 rounded-lg bg-white shadow-sm">
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                    <span className="font-semibold text-gray-800">11. I feel emotional or frustrated doing core work—is that normal?</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    Totally normal. Your core is deeply tied to your sense of safety, confidence, and identity. Be gentle with yourself. This is physical work and emotional work.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-12" className="border border-pink-200 rounded-lg bg-white shadow-sm">
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                    <span className="font-semibold text-gray-800">12. How long will it take to heal my core completely?</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    There's no fixed timeline. Everybody heals differently. Some women feel great in 6 weeks, others in 6 months. Your consistency and patience matter more than speed.
                  </AccordionContent>
                </AccordionItem>

              </Accordion>
            </div>
            
            {/* Navigation Buttons */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Continue Your Journey</h3>
                <p className="text-sm text-gray-600">Navigate through your recovery program</p>
              </div>
              <div className="flex justify-center">
                <Button
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 sm:px-8 py-4 sm:py-3 text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto max-w-xs"
                  data-testid="button-previous-section-faqs"
                  onClick={() => setActiveTab('next-steps')}
                >
                  <ChevronLeft className="w-4 h-4" />
                  {getNavigationText('prev')}
                </Button>
              </div>
              <div className="text-center mt-4">
                <p className="text-xs text-gray-500">Continue building your knowledge and confidence</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Knowledge Article Modal */}
        {selectedArticle && (
          <KnowledgeArticleModal
            article={selectedArticle}
            isOpen={!!selectedArticle}
            onClose={() => setSelectedArticle(null)}
          />
        )}
        
        {/* Zoe Welcome Modal */}
        {user && (
          <ZoeWelcomeModal 
            isOpen={showWelcomeModal}
            onClose={handleWelcomeClose}
            userId={user.id}
          />
        )}
      </div>
    </div>
  );
}

interface NavigationProps {
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  navigateToNextTab: () => void;
  navigateToPreviousTab: () => void;
  getNavigationText: (direction: 'prev' | 'next') => string;
}

function HealSection({ canGoNext, canGoPrevious, navigateToNextTab, navigateToPreviousTab, getNavigationText }: NavigationProps) {
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  const toggleTopic = (topic: string) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topic]: !prev[topic]
    }));
  };

  const topics = [
    { id: 'what-is-diastasis', n: 1, title: 'What Is Diastasis' },
    { id: 'do-i-have-diastasis', n: 2, title: 'Do I Have Diastasis Recti' },
    { id: 'why-core-rehab-matters', n: 3, title: 'Why Core Rehab Matters' },
    { id: 'why-crunches-wont-work', n: 4, title: "Why Crunches Won't Work" },
    { id: 'core-rehab-daily-practice', n: 5, title: 'Core Rehab & Daily Practice' },
    { id: 'week-by-week-reconnection', n: 6, title: 'Rehab Routine – Week-by-Week Reconnection' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-left">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent drop-shadow-sm">
            Heal
          </CardTitle>
          <CardDescription className="text-sm font-medium text-gray-600 border-l-4 border-emerald-400 pl-4 bg-gradient-to-r from-emerald-50 to-transparent py-2">
            Understanding diastasis recti and beginning your core rehabilitation journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {topics.map((topic, index) => (
              <div key={topic.id}>
                {index > 0 && (
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30 my-2"></div>
                )}
                <div className="flex items-center justify-between py-5">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">{topic.n}</span>
                    <h3 className="text-[15px] font-semibold text-left">{topic.title}</h3>
                  </div>
                  <div
                    onClick={() => toggleTopic(topic.id)}
                    className="w-8 h-8 min-w-[32px] min-h-[32px] bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-pink-500 hover:to-pink-700 cursor-pointer transition-all duration-200 flex-shrink-0"
                    style={{ border: 'none', outline: 'none', boxShadow: '0 4px 8px rgba(236, 72, 153, 0.3)' }}
                    data-testid={`toggle-${topic.id}`}
                  >
                    <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics[topic.id] ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                {expandedTopics[topic.id] && (
                  <div className="pb-5 space-y-4" data-testid={`content-${topic.id}`}>
                    {topic.id === 'what-is-diastasis' ? (
                      <div className="space-y-4 text-sm">
                        <div className="text-center">
                          <h3 className="text-lg font-bold mb-2">WHAT IS <span className="text-pink-500">DIASTASIS RECTI</span></h3>
                        </div>
                        
                        <div className="flex justify-center my-4">
                          <img 
                            src={diastasisAnatomyImage} 
                            alt="Normal abdomen vs diastasis recti anatomy diagram" 
                            className="max-w-full h-auto rounded-lg shadow-sm"
                          />
                        </div>
                        
                        <p>
                          <strong className="text-pink-500">Diastasis recti (DR)</strong> is a natural separation of the abdominal muscles along the midline (Linea alba) during pregnancy to make room for your growing baby.
                        </p>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="font-semibold mb-2 text-gray-800">After birth, for many women:</p>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>✤ The separation may not fully close</li>
                            <li>✤ The connective tissue may remain weak or overstretched</li>
                            <li>✤ A feeling of "coning" or doming down the midline during effort</li>
                          </ul>
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">Variations of Diastasis Recti</h4>
                          
                          <div className="flex justify-center my-3">
                            <img 
                              src={diastasisVariationsImage} 
                              alt="Variations of diastasis recti diagram showing different types" 
                              className="max-w-full h-auto rounded-lg shadow-sm"
                            />
                          </div>
                          
                          <p className="text-xs mb-2">Diastasis can occur in different areas of the abdomen:</p>
                          <ul className="text-xs space-y-1">
                            <li>• <strong>Abdomen without diastasis</strong> - Normal separation</li>
                            <li>• <strong>Diastasis around umbilicus</strong> - Around belly button area</li>
                            <li>• <strong>Below umbilicus diastasis</strong> - Lower abdominal area</li>
                            <li>• <strong>Above umbilicus diastasis</strong> - Upper abdominal area</li>
                            <li>• <strong>Diastasis along full length of linea alba</strong> - Complete separation</li>
                          </ul>
                        </div>
                        
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <p className="font-semibold mb-2">Common symptoms include:</p>
                          <ul className="space-y-1 text-xs">
                            <li>✤ A visible gap or bulge along the belly</li>
                            <li>✤ Poor core connection or feeling "weak in the middle"</li>
                            <li>✤ Back pain, pelvic instability, or pelvic floor symptoms</li>
                          </ul>
                        </div>
                        
                        <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-400">
                          <p className="text-pink-700 font-medium mb-1">
                            DR is common, treatable, and not your fault.
                          </p>
                          <p className="text-xs text-pink-600">
                            With proper rehab, many see significant improvement in both function and appearance.
                          </p>
                        </div>
                        
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                          <p className="text-sm font-medium text-green-800">
                            Even if you don't have a visible gap, you can still benefit from this program.
                          </p>
                        </div>
                      </div>
                    ) : topic.id === 'do-i-have-diastasis' ? (
                      <div className="space-y-4 text-sm">
                        <div className="text-center">
                          <h3 className="text-lg font-bold mb-4"><span className="text-purple-400">DO I HAVE</span> DIASTASIS RECTI?</h3>
                        </div>
                        
                        {/* YouTube Link Button */}
                        <div className="flex justify-start mb-4">
                          <a 
                            href="https://youtu.be/zgU0svFSNRE" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md"
                            style={{
                              background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)',
                              boxShadow: '0 4px 8px rgba(236, 72, 153, 0.3)'
                            }}
                          >
                            <Play className="w-3 h-3" />
                            HOW TO CHECK FOR DIASTASIS RECTI
                          </a>
                        </div>
                        
                        <div className="flex justify-center my-4">
                          <img 
                            src={diastasisCheckImage} 
                            alt="How to check for diastasis recti - demonstration image" 
                            className="max-w-full h-auto rounded-lg shadow-sm"
                          />
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg border border-green-200">
                          <p className="font-semibold text-blue-800 mb-3">Lie on your back, knees bent, feet flat on the floor. Get comfortable & breathe naturally.</p>
                          <p className="text-sm text-blue-700 mb-3">Place one hand behind your head, and the other hand across your belly, with your fingers pointing down toward your navel. Make sure your fingers are together (not spread wide).</p>
                          
                          <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-blue-800 mt-0.5">1.</span>
                              <p className="text-blue-700">Press your fingertips gently into your belly, just above your belly button. This is where we'll check the depth and width of any separation.</p>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-blue-800 mt-0.5">2.</span>
                              <p className="text-blue-700">Exhale & slowly lift your head & shoulders off the floor (just a small lift - around 2-3 inches). You should feel the two sides of your abdominal wall moving toward each other.</p>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-blue-800 mt-0.5">3.</span>
                              <p className="text-blue-700">Count how many fingers fit into the gap between your abdominal walls at the navel.</p>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-blue-800 mt-0.5">4.</span>
                              <p className="text-blue-700">Move your fingers above and below the belly button (around 2 inches in each direction) and repeat the lift to feel if the gap is larger or smaller there.</p>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-blue-800 mt-0.5">5.</span>
                              <p className="text-blue-700">Now test the tissue. As you do your fingers sink into your abdomen?</p>
                            </div>
                            
                            <div className="space-y-1 mt-3">
                              <p className="text-blue-700">❖ Does the tissue feel firm and springy (good tension)?</p>
                              <p className="text-blue-700">❖ Or soft, deep, and hard to engage (poor tension)?</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-400">
                          <p className="font-bold text-pink-700 mb-2">Sample result: <em>"2 fingers at the navel, 2 above, 1 below with moderate depth"</em></p>
                          <p className="text-pink-600 text-sm">This is helpful to note so you can track changes as the program progresses.</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                          <p className="font-semibold text-gray-800 mb-2">Disclaimer:</p>
                          <p className="text-xs text-gray-700">If you notice a very large gap (more than 4 fingers), significant abdominal bulging, persistent pain, or feelings of instability in your core, back, or pelvis, this program alone may not be enough. Please consult a women's health physiotherapist or qualified healthcare provider before continuing. Your safety and long-term recovery come first.</p>
                        </div>
                      </div>
                    ) : topic.id === 'why-core-rehab-matters' ? (
                      <div className="space-y-4 text-sm">
                        <div className="text-center">
                          <h3 className="text-lg font-bold mb-4"><span className="text-pink-500">WHY CORE</span> REHAB MATTERS</h3>
                        </div>

                        <p className="text-gray-700 mb-4">
                          Even without visible DR, your core may feel disconnected, weak, or uncoordinated. That's where core rehab comes in. This isn't just about workouts—it's about making your core functional again for everything from lifting your baby to carrying groceries. The best part? You're retraining your whole body, not just your abs. <strong className="text-pink-500">IT'S NEVER TOO LATE TO HEAL ✨</strong> The core is trainable at any stage, and you are worthy of that healing. There's no expiration date on recovery. Let's start where you are.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-400">
                              <h4 className="font-bold text-pink-700 mb-3">Whether you're:</h4>
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                  <span className="text-pink-600">❖</span>
                                  <span>6 weeks postpartum</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-pink-600">❖</span>
                                  <span>6 months into motherhood</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-pink-600">❖</span>
                                  <span>Or even 6 years down the line</span>
                                </li>
                              </ul>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                              <h4 className="font-bold text-blue-700 mb-3">As you continue through the program, we'll work to:</h4>
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                  <span className="text-green-600">❖</span>
                                  <span>Reduce the gap width (if present)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-green-600">❖</span>
                                  <span>Improve tension & strength in the connective tissue</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-green-600">❖</span>
                                  <span>Enhance coordination between breath, core, and pelvic floor</span>
                                </li>
                              </ul>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex justify-center mb-4">
                              <img 
                                src={coreRehabExerciseImage} 
                                alt="Woman demonstrating core exercise technique with small ball" 
                                className="max-w-full h-auto rounded-lg shadow-sm"
                              />
                            </div>
                            
                            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                              <h4 className="font-bold text-green-700 mb-3">Rebuilding your core helps you:</h4>
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                  <span className="text-green-600">❖</span>
                                  <span>Restore strength and stability</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-green-600">❖</span>
                                  <span>Prevent pain or injury</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-green-600">❖</span>
                                  <span>Improve posture and breathing</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-green-600">❖</span>
                                  <span>Reduce pelvic floor symptoms</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-green-600">❖</span>
                                  <span>Feel more confident and connected</span>
                                </li>
                              </ul>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                              <h4 className="font-bold text-purple-700 mb-3">Many women see noticeable improvement in:</h4>
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                  <span className="text-purple-600">❖</span>
                                  <span>Core connection</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-purple-600">❖</span>
                                  <span>Diastasis recti</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-purple-600">❖</span>
                                  <span>Pelvic floor symptoms</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-purple-600">❖</span>
                                  <span>Strength and balance</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-purple-600">❖</span>
                                  <span>Confidence and energy</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : topic.id === 'why-crunches-wont-work' ? (
                      <div className="space-y-6 text-sm">
                        <div className="text-center">
                          <h3 className="text-lg font-bold mb-4">WHY CRUNCHES <span className="text-gray-400">WON'T WORK</span></h3>
                        </div>

                        <p className="text-gray-700 mb-6">
                          Crunches and sit-ups increase intra-abdominal pressure, which pushes outward against the separation—further stretching the Linea alba instead of healing it. These exercises load the abdominal wall before it's ready, worsening doming, coning, and core dysfunction.
                        </p>


                        <div className="text-center mb-6">
                          <h4 className="font-bold text-blue-800 text-lg mb-2">THE FOCUS NEEDS TO BE ON:</h4>
                          <div className="flex justify-center">
                            <div className="text-green-600 text-2xl">▼</div>
                          </div>
                        </div>

                        {/* Four Focus Areas in 2x2 Grid */}
                        <div className="grid md:grid-cols-2 gap-8 mb-6">
                          {/* 1. Pressure Management */}
                          <div className="bg-blue-50 border border-green-200 rounded-lg p-6 space-y-4">
                            <div>
                              <h5 className="font-bold text-green-600 text-lg mb-3">1. Pressure Management</h5>
                              <p className="text-sm text-gray-700 mb-4">
                                Understanding how pressure moves through the core during breath, lifting, or movement. The goal is to avoid excess intra-abdominal pressure by coordinating breath and posture.
                              </p>
                            </div>
                            
                            <div className="flex justify-center">
                              <img 
                                src={pressureManagementImage} 
                                alt="Pressure management exercise demonstration" 
                                className="max-w-full h-auto rounded-lg shadow-sm"
                              />
                            </div>
                          </div>

                          {/* 2. Breath Coordination */}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
                            <div>
                              <h5 className="font-bold text-green-600 text-lg mb-3">2. Breath Coordination</h5>
                              <p className="text-sm text-gray-700 mb-4">
                                Practice 360° breathing where your ribs, belly, and back all expand on the inhale, and gently draw in and up on the exhale. This restores natural core function and reconnects the pelvic floor and TVA.
                              </p>
                            </div>
                            
                            <div className="flex justify-center">
                              <img 
                                src={breathCoordinationImage} 
                                alt="Breath coordination exercise demonstration" 
                                className="max-w-full h-auto rounded-lg shadow-sm"
                              />
                            </div>
                          </div>

                          {/* 3. TVA Activation */}
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 space-y-4">
                            <div>
                              <h5 className="font-bold text-purple-600 text-lg mb-3">3. TVA Activation</h5>
                              <p className="text-sm text-gray-700">
                                The transverse abdominis is like a natural corset wrapping around your spine and organs. Training it through controlled movement and breath helps flatten and support the abdominal wall from the inside out.
                              </p>
                            </div>
                          </div>

                          {/* 4. Alignment & Core-Pelvic Synergy */}
                          <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 space-y-4">
                            <div>
                              <h5 className="font-bold text-teal-600 text-lg mb-3">4. Alignment & Core-Pelvic Synergy</h5>
                              <p className="text-sm text-gray-700">
                                Learn how your posture and rib cage position influence pressure. When your ribs are flared or your pelvis is tilted, your core system is out of sync. Restoring alignment helps all core muscles work together safely.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-300 text-center">
                          <p className="text-sm text-yellow-800 font-medium">
                            💡 <strong>Remember:</strong> This approach focuses on healing from the inside out, not forcing your abs to "bounce back" through traditional exercises.
                          </p>
                        </div>
                      </div>
                    ) : topic.id === 'core-rehab-daily-practice' ? (
                      <div className="space-y-6 text-sm">
                        {/* Header */}
                        <div className="text-center">
                          <h3 className="text-xl font-bold mb-2">CORE REHAB & DAILY PRACTICE</h3>
                          <h4 className="text-lg font-semibold text-pink-500 mb-4">SHORT REPEATABLE RITUALS</h4>
                        </div>

                        {/* Description */}
                        <div className="bg-blue-50 border border-green-200 rounded-lg p-6">
                          <p className="text-gray-700 mb-4">
                            These foundational core reconnection exercises are designed to be gentle, effective, and easy to fit into a busy postpartum day. They require no equipment, take only 5-10 minutes, and can be repeated daily or every other day to build a strong foundation for functional movement. Each movement focuses on breath awareness, alignment, and deep core engagement. <strong className="text-pink-600">LEARN TO DO THESE VERY WELL!</strong>
                          </p>
                          
                          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <div>
                                <p className="text-pink-700 font-semibold mb-2">How to view the videos of the exercises:</p>
                                <p className="text-gray-700 text-sm">All blue underlined text is clickable and will open a video link. <strong>PLAY ALL videos that the following workout can be played as a single playlist combining all six exercises to make it easier to flow through. However, do listen to each exercise instruction beforehand.</strong></p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Exercise Table with Horizontal Scroll */}
                        <div className="overflow-x-auto">
                          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm" style={{ minWidth: '1000px' }}>
                            <div className="bg-gray-100 grid text-sm font-semibold text-gray-700 border-b border-gray-300" style={{ gridTemplateColumns: '220px 250px 320px 210px' }}>
                              <div className="p-4 border-r border-gray-300">EXERCISE</div>
                              <div className="p-4 border-r border-gray-300">WHAT IT DOES</div>
                              <div className="p-4 border-r border-gray-300">HOW TO PERFORM</div>
                              <div className="p-4">KEY TIPS</div>
                            </div>

                            {/* Exercise 1: Supine Pelvic Tilts */}
                            <div className="grid border-b border-gray-200 text-sm" style={{ gridTemplateColumns: '220px 250px 320px 210px' }}>
                              <div className="p-4 border-r border-gray-300">
                                <button 
                                  onClick={() => window.open('https://youtu.be/OwFN9Paf26o', '_blank')}
                                  className="text-green-600 hover:text-blue-800 underline font-semibold text-left"
                                  data-testid="video-supine-pelvic-tilts"
                                >
                                  SUPINE PELVIC TILTS
                                </button>
                              </div>
                              <div className="p-4 border-r border-gray-300 text-gray-700">
                                Gently mobilizes the lower back and pelvis, builds awareness of core engagement
                              </div>
                              <div className="p-4 border-r border-gray-300 text-gray-700">
                                Lie on your back with knees bent, feet flat. Gently flatten lower back onto floor on exhale; return to neutral on inhale
                              </div>
                              <div className="p-4 text-gray-700">
                                Keep glutes and upper body relaxed; move slowly with breath, not momentum
                              </div>
                            </div>

                            {/* Exercise 2: 90 90 Box Breathing */}
                            <div className="grid border-b border-gray-200 text-sm" style={{ gridTemplateColumns: '220px 250px 320px 210px' }}>
                              <div className="p-4 border-r border-gray-300">
                                <button 
                                  onClick={() => window.open('https://www.youtube.com/watch?v=ehaUhSSY1xY', '_blank')}
                                  className="text-green-600 hover:text-blue-800 underline font-semibold text-left"
                                  data-testid="video-90-90-box-breathing"
                                >
                                  90 90 BOX BREATHING
                                </button>
                              </div>
                              <div className="p-4 border-r border-gray-300 text-gray-700">
                                Reconnects breath to deep core and pelvic floor
                              </div>
                              <div className="p-4 border-r border-gray-300 text-gray-700">
                                Inhale to expand ribs; exhale slowly while gently engaging TVA and lifting pelvic floor
                              </div>
                              <div className="p-4 text-gray-700">
                                Keep shoulders relaxed; feel ribcage expand in all directions
                              </div>
                            </div>

                            {/* Exercise 3: Supine Heel Slides */}
                            <div className="grid border-b border-gray-200 text-sm" style={{ gridTemplateColumns: '220px 250px 320px 210px' }}>
                              <div className="p-4 border-r border-gray-300">
                                <button 
                                  onClick={() => window.open('https://www.youtube.com/watch?v=AIEdkm2q-4k', '_blank')}
                                  className="text-green-600 hover:text-blue-800 underline font-semibold text-left"
                                  data-testid="video-supine-heel-slides"
                                >
                                  SUPINE HEEL SLIDES
                                </button>
                              </div>
                              <div className="p-4 border-r border-gray-300 text-gray-700">
                                Activates TVA while keeping pelvis stable
                              </div>
                              <div className="p-4 border-r border-gray-300 text-gray-700">
                                Slide one heel out along the floor on exhale; bring back in on inhale
                              </div>
                              <div className="p-4 text-gray-700">
                                Maintain a neutral spine; avoid doming or pelvis tilting
                              </div>
                            </div>

                            {/* Exercise 4: Side Lying Diaphragmatic Breathing */}
                            <div className="grid border-b border-gray-200 text-sm" style={{ gridTemplateColumns: '220px 250px 320px 210px' }}>
                              <div className="p-4 border-r border-gray-300">
                                <button 
                                  onClick={() => window.open('https://www.youtube.com/watch?v=tCzxxPxxtjw', '_blank')}
                                  className="text-green-600 hover:text-blue-800 underline font-semibold text-left"
                                  data-testid="video-side-lying-breathing"
                                >
                                  SIDE LYING DIAPHRAGMATIC BREATHING
                                </button>
                              </div>
                              <div className="p-4 border-r border-gray-300 text-gray-700">
                                Improves rib mobility and lateral expansion
                              </div>
                              <div className="p-4 border-r border-gray-300 text-gray-700">
                                Lie on side with pillow support; inhale into top ribs and side body
                              </div>
                              <div className="p-4 text-gray-700">
                                Focus on breath movement in the ribs and back belly
                              </div>
                            </div>

                            {/* Exercise 5: Supine Diaphragmatic Breathing */}
                            <div className="grid border-b border-gray-200 text-sm" style={{ gridTemplateColumns: '220px 250px 320px 210px' }}>
                              <div className="p-4 border-r border-gray-300">
                                <button 
                                  onClick={() => window.open('https://www.youtube.com/watch?v=lBhO64vd8aE', '_blank')}
                                  className="text-green-600 hover:text-blue-800 underline font-semibold text-left"
                                  data-testid="video-supine-diaphragmatic-breathing"
                                >
                                  SUPINE DIAPHRAGMATIC BREATHING
                                </button>
                              </div>
                              <div className="p-4 border-r border-gray-300 text-gray-700">
                                Strengthens deep core through subtle activation
                              </div>
                              <div className="p-4 border-r border-gray-300 text-gray-700">
                                On each exhale, gently hug belly inward like zipping up jeans
                              </div>
                              <div className="p-4 text-gray-700">
                                Keep it light—no gripping or bracing; coordinate with breath
                              </div>
                            </div>

                            {/* Exercise 6: Bird Dog Ground Level */}
                            <div className="grid text-sm" style={{ gridTemplateColumns: '220px 250px 320px 210px' }}>
                              <div className="p-4 border-r border-gray-300">
                                <button 
                                  onClick={() => window.open('https://www.youtube.com/watch?v=AaYpP7iV378', '_blank')}
                                  className="text-green-600 hover:text-blue-800 underline font-semibold text-left"
                                  data-testid="video-bird-dog-ground"
                                >
                                  BIRD DOG GROUND LEVEL
                                </button>
                              </div>
                              <div className="p-4 border-r border-gray-300 text-gray-700">
                                Builds core stability and cross-body coordination
                              </div>
                              <div className="p-4 border-r border-gray-300 text-gray-700">
                                From hands and knees, extend opposite arm and leg while exhaling
                              </div>
                              <div className="p-4 text-gray-700">
                                Keep hips level; core engaged; move slowly and stay balanced
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Quick Guidelines */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                          <h4 className="font-bold text-green-700 text-lg mb-4">Quick Guidelines:</h4>
                          <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                              <span className="text-green-600 font-bold">•</span>
                              <span><strong>Duration / Reps:</strong> 5-10 minutes per session / 5-8 Breaths per movement per side.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-green-600 font-bold">•</span>
                              <span><strong>Frequency:</strong> Daily or every other day - or use as your warmup</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-green-600 font-bold">•</span>
                              <span><strong>Focus:</strong> Controlled, mindful movement with breath coordination</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-green-600 font-bold">•</span>
                              <span><strong>Avoid:</strong> Any pain, pelvic pressure, doming, or bulging during exercises</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-green-600 font-bold">•</span>
                              <span>Holding your breath increases intra-abdominal pressure—use breath-led movement and never perform Valsalva maneuvers during these drills.</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    ) : topic.id === 'week-by-week-reconnection' ? (
                      <div className="space-y-6 text-sm">
                        {/* Header */}
                        <div className="text-center">
                          <h3 className="text-xl font-bold mb-2">REHAB ROUTINE</h3>
                          <h4 className="text-lg font-semibold text-pink-500 mb-4">WEEK-BY-WEEK CORE RECONNECTION</h4>
                        </div>

                        {/* Description */}
                        <div className="bg-blue-50 border border-green-200 rounded-lg p-6">
                          <p className="text-gray-700 text-center">
                            Core healing doesn't happen in a week. A routine builds over time, prioritizing breath, posture, and function. Use this checklist below to add to your warmup each week before your main workouts.
                          </p>
                        </div>

                        {/* Week-by-Week Table with Horizontal Scroll */}
                        <div className="overflow-x-auto">
                          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm w-full" style={{ minWidth: '1110px' }}>
                            <div className="bg-gray-100 grid text-sm font-semibold text-gray-700 border-b border-gray-300" style={{ gridTemplateColumns: '120px 340px 280px 250px' }}>
                              <div className="p-4 border-r border-gray-300 flex items-start justify-start">WEEK</div>
                              <div className="p-4 border-r border-gray-300 flex items-start justify-start">EXERCISES</div>
                              <div className="p-4 border-r border-gray-300 flex items-start justify-start">FOCUS & PURPOSE</div>
                              <div className="p-4 flex items-start justify-start">NOTES</div>
                            </div>

                            {/* Week 1-2 */}
                            <div className="grid border-b border-gray-200 text-sm" style={{ gridTemplateColumns: '120px 340px 280px 250px' }}>
                              <div className="p-4 border-r border-gray-300 font-semibold flex items-start justify-start">
                                Week 1-2
                              </div>
                              <div className="p-4 border-r border-gray-300 text-gray-700 flex items-start justify-start">
                                <div className="space-y-2 w-full">
                                  <div>
                                    <button 
                                      onClick={() => window.open('https://www.youtube.com/watch?v=B53GBfgME9E', '_blank')}
                                      className="text-green-600 hover:text-blue-800 underline font-semibold text-left"
                                      data-testid="video-360-breathing"
                                    >
                                      360° BREATHING
                                    </button>
                                    <span className="text-gray-500"> (any comfortable position)</span>
                                  </div>
                                  <div>
                                    <button 
                                      onClick={() => window.open('https://www.youtube.com/watch?v=lBhO64vd8aE', '_blank')}
                                      className="text-green-600 hover:text-blue-800 underline font-semibold text-left"
                                      data-testid="video-supine-diaphragmatic"
                                    >
                                      SUPINE DIAPHRAGMATIC BREATHING
                                    </button>
                                  </div>
                                  <div>
                                    <button 
                                      onClick={() => window.open('https://www.youtube.com/watch?v=tCzxxPxxtjw', '_blank')}
                                      className="text-green-600 hover:text-blue-800 underline font-semibold text-left"
                                      data-testid="video-side-lying-diaphragmatic"
                                    >
                                      SIDE LYING DIAPHRAGMATIC BREATHING
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <div className="p-4 border-r border-gray-300 text-gray-700 flex items-start justify-start">
                                Reconnect to breath; rebuild mind-muscle connection with deep core and pelvic floor; reduce internal pressure.
                              </div>
                              <div className="p-4 text-gray-700 flex items-start justify-start">
                                Best done lying or seated. Practice 2-3 times/day. Prioritize breath + awareness.
                              </div>
                            </div>

                            {/* Week 3-4 */}
                            <div className="grid border-b border-gray-200 text-sm" style={{ gridTemplateColumns: '120px 340px 280px 250px' }}>
                              <div className="p-4 border-r border-gray-300 font-semibold flex items-start justify-start">
                                Week 3-4
                              </div>
                              <div className="p-4 border-r border-gray-300 text-gray-700 flex items-start justify-start">
                                <div className="space-y-2 w-full">
                                  <div>
                                    <button 
                                      onClick={() => window.open('https://www.youtube.com/watch?v=AIEdkm2q-4k', '_blank')}
                                      className="text-green-600 hover:text-blue-800 underline font-semibold text-left"
                                      data-testid="video-supine-heel-slides"
                                    >
                                      SUPINE HEEL SLIDES
                                    </button>
                                  </div>
                                  <div>
                                    <button 
                                      onClick={() => window.open('https://www.youtube.com/watch?v=SRoNksDTjUc', '_blank')}
                                      className="text-green-600 hover:text-blue-800 underline font-semibold text-left"
                                      data-testid="video-supine-pelvic-tilts"
                                    >
                                      SUPINE PELVIC TILTS
                                    </button>
                                  </div>
                                  <div>
                                    <button 
                                      onClick={() => window.open('https://www.youtube.com/watch?v=fxs0SDh1s3w', '_blank')}
                                      className="text-green-600 hover:text-blue-800 underline font-semibold text-left"
                                      data-testid="video-supported-glute-bridges"
                                    >
                                      SUPPORTED GLUTE BRIDGES PILLOW UNDER HIPS
                                    </button>
                                  </div>
                                  <div>
                                    <button 
                                      onClick={() => window.open('https://www.youtube.com/watch?v=_cY-rtXNPp4', '_blank')}
                                      className="text-green-600 hover:text-blue-800 underline font-semibold text-left"
                                      data-testid="video-standing-posture-reset"
                                    >
                                      STANDING POSTURE RESET
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <div className="p-4 border-r border-gray-300 text-gray-700 flex items-start justify-start">
                                Begin adding gentle movement to deepen core engagement. Build awareness of core activation in daily life (lifting baby, standing).
                              </div>
                              <div className="p-4 text-gray-700 flex items-start justify-start">
                                Maintain slow tempo. Avoid doming/coning. Continue breath-coordinated movement.
                              </div>
                            </div>

                            {/* Week 5-6 */}
                            <div className="grid text-sm" style={{ gridTemplateColumns: '120px 340px 280px 250px' }}>
                              <div className="p-4 border-r border-gray-300 font-semibold flex items-start justify-start">
                                Week 5-6
                              </div>
                              <div className="p-4 border-r border-gray-300 text-gray-700 flex items-start justify-start">
                                <div className="space-y-2 w-full">
                                  <div>
                                    <button 
                                      onClick={() => window.open('https://www.youtube.com/watch?v=GbqFe8zNQH4', '_blank')}
                                      className="text-green-600 hover:text-blue-800 underline font-semibold text-left"
                                      data-testid="video-elevated-chair-bird-dogs"
                                    >
                                      ELEVATED CHAIR BIRD DOGS
                                    </button>
                                  </div>
                                  <div>
                                    <button 
                                      onClick={() => window.open('https://www.youtube.com/watch?v=T8HHp4KXpJI', '_blank')}
                                      className="text-green-600 hover:text-blue-800 underline font-semibold text-left"
                                      data-testid="video-supine-alt-leg-marches"
                                    >
                                      SUPINE ALT LEG MARCHES
                                    </button>
                                    <span className="text-gray-500"> (only if no doming)</span>
                                  </div>
                                  <div>
                                    <button 
                                      onClick={() => window.open('https://www.youtube.com/watch?v=_KMqnvDiLnk', '_blank')}
                                      className="text-green-600 hover:text-blue-800 underline font-semibold text-left"
                                      data-testid="video-mini-squats-chair"
                                    >
                                      MINI SQUATS ON CHAIR
                                    </button>
                                  </div>
                                  <div className="text-gray-700">
                                    Core-integrated Movement (exhale-to-stand, baby lifts)
                                  </div>
                                </div>
                              </div>
                              <div className="p-4 border-r border-gray-300 text-gray-700 flex items-start justify-start">
                                Train core stability in more dynamic tasks. Start integrating breath + core into real-life movements.
                              </div>
                              <div className="p-4 text-gray-700 flex items-start justify-start">
                                Keep reps low (5-8); focus on form. Stop if there's pain, coning, or pelvic pressure.
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Do Daily / Improve On Section */}
                        <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
                          <h4 className="font-bold text-pink-600 text-lg mb-4">Do Daily / Improve On:</h4>
                          <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                              <span className="text-pink-500 font-bold">❖</span>
                              <span>Breath leads movement</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-pink-500 font-bold">❖</span>
                              <span>Pause if you see doming</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-pink-500 font-bold">❖</span>
                              <span>Practice posture during daily tasks</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-pink-500 font-bold">❖</span>
                              <span>5-10 min counts!</span>
                            </li>
                          </ul>
                        </div>

                        {/* Tips Section */}
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                          <h4 className="font-bold text-purple-600 text-lg mb-4">Tips:</h4>
                          <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                              <span className="text-purple-500 font-bold">❖</span>
                              <span>5-8 reps | 1-2 rounds | 3-5x/week</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-500 font-bold">❖</span>
                              <span>Avoid pain, doming, leaking</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-500 font-bold">❖</span>
                              <span>Rest is progress</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-3 text-sm">
                          <p>Educational content for {topic.title} will be added here.</p>
                          <div className="bg-pink-50 p-4 rounded-lg">
                            <p className="font-semibold mb-2">Key Information:</p>
                            <ul className="space-y-1 text-xs">
                              <li>• Detailed content coming soon</li>
                              <li>• Educational materials</li>
                              <li>• Step-by-step guidance</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Navigation Buttons */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Continue Your Journey</h3>
          <p className="text-sm text-gray-600">Navigate through your recovery program</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center">
          {canGoPrevious() && (
            <Button
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 sm:px-8 py-4 sm:py-3 text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
              data-testid="button-previous-section-heal"
              onClick={navigateToPreviousTab}
            >
              <ChevronLeft className="w-4 h-4" />
              {getNavigationText('prev')}
            </Button>
          )}
          {canGoNext() && (
            <Button
              className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 sm:px-8 py-4 sm:py-3 text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
              data-testid="button-next-section-heal"
              onClick={navigateToNextTab}
            >
              {getNavigationText('next')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">Progress through your personalized recovery journey</p>
        </div>
      </div>
    </div>
  );
}

function WelcomeSection({
  canGoNext,
  canGoPrevious,
  navigateToNextTab,
  navigateToPreviousTab,
  getNavigationText
}: {
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  navigateToNextTab: () => void;
  navigateToPreviousTab: () => void;
  getNavigationText: (direction: 'prev' | 'next') => string;
}) {
  const [expandedTopics, setExpandedTopics] = useState<{[key: string]: boolean}>({});
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Single Container with Welcome Header and All Topics */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          {/* Welcome Header */}
          <div className="mb-8 text-left">
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
              Welcome - Start Here
            </h2>
            <p className="text-sm font-medium text-gray-600 border-l-4 border-pink-400 pl-4 bg-gradient-to-r from-pink-50 to-transparent py-2">
              Essential preparatory information for your core recovery journey
            </p>
          </div>

          {/* Community Promotion Card - Early Introduction */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 sm:p-4 shadow-sm">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-green-800 mb-1">
                    💙 Want Extra Support?
                  </h4>
                  <p className="text-[10px] sm:text-xs text-green-700 mb-2 sm:mb-3 leading-relaxed">
                    Join our WhatsApp community for guidance & support with Zoe + coaches!
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] sm:text-xs text-green-600">
                      <span className="font-semibold">₹1000</span>/3mo
                    </div>
                    <Button
                      onClick={() => window.open('https://www.strongerwithzoe.in/products/pwz-postnatal-heal-your-core', '_blank')}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-1"
                      data-testid="welcome-join-community"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                      </svg>
                      <span>Join</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* All Topics with Line Dividers */}
          <div className="space-y-0">
            {/* Topic 1: Welcome from Zoe */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">1</span>
                  <h3 className="text-[15px] font-semibold text-left">Welcome from Zoe</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTopic('welcome-zoe')}
                  className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-pink-500 hover:to-pink-700 p-0"
                  data-testid="button-toggle-welcome-zoe"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['welcome-zoe'] ? 'rotate-180' : ''}`} />
                </Button>
              </div>
              {expandedTopics['welcome-zoe'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-4 text-sm">
                    <p className="font-medium">Dear Mama, Welcome to Heal Your Core.</p>
                    <p>I created this program after my own struggle with diastasis recti. I spent the first two years postpartum with a painful gap in my abdominal wall and no guidance—just conflicting advice and exercises that made me feel worse.</p>
                    <p>Through research, consistency, and patience, I learned that healing isn't about "bouncing back" or doing endless crunches. It's about rebuilding your deep core connection from the ground up.</p>
                    
                    {/* YouTube Video Section */}
                    <div className="w-full mb-4">
                      {!isVideoPlaying ? (
                        <div 
                          className="relative cursor-pointer group rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsVideoPlaying(true);
                          }}
                          data-testid="video-thumbnail-welcome"
                        >
                          <img
                            src={videoThumbnailImage}
                            alt="Welcome video with Zoe Modgill - Hello & Welcome"
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                              <Play className="w-3 h-3 text-white ml-0.5" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="relative rounded-lg overflow-hidden shadow-lg">
                          <iframe
                            src="https://www.youtube.com/embed/62Qht8GVfPE?autoplay=1"
                            title="Welcome video with Zoe Modgill - Hello & Welcome"
                            className="w-full h-48 rounded-lg"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      )}
                    </div>

                    <p className="font-medium text-primary">What makes "The Zoe Difference"?</p>
                    <ul className="space-y-1 ml-4 list-disc">
                      <li>✅ I've walked this path myself</li>
                      <li>✅ Evidence-based approach to healing</li>
                      <li>✅ It worked for my own postpartum journey</li>
                      <li>✅ Focus on breath & deep core connection over perfection</li>
                      <li>✅ Gentle, progressive, and realistic for busy mothers</li>
                    </ul>
                    <p className="italic">This program isn't just about your core—it's about reclaiming your confidence and feeling strong in your body again. It's never too late to start healing. Your body is capable of amazing things. Let's begin.</p>
                    <p className="font-medium">With love & support, Zoe x</p>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Topic 2: How to Use This Guide */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">2</span>
                  <h3 className="text-[15px] font-semibold text-left">How to Use This Guide</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTopic('how-to-use')}
                  className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-pink-500 hover:to-pink-700 p-0"
                  data-testid="button-toggle-how-to-use"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['how-to-use'] ? 'rotate-180' : ''}`} />
                </Button>
              </div>
              {expandedTopics['how-to-use'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-5">
                    <p className="text-sm">
                      Welcome to your interactive postpartum strength recovery program! This guide is designed to be your comprehensive companion through rebuilding your core strength, reconnecting with your body, and feeling more confident in movement again.
                    </p>
                    
                    <div>
                      <p className="font-semibold text-primary text-sm mb-3">Navigate Your Journey with 7 Main Sections:</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><strong>Start Here</strong> - Essential preparation and safety guidelines</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><strong>Core Knowledge</strong> - Educational foundation about diastasis recti and core health</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><strong>Healing</strong> - Your complete 6-topic healing curriculum with daily practices</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><strong>Programs</strong> - Six progressive workout programs with video demonstrations</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><strong>Nutrition</strong> - Supportive nutritional guidance for recovery</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><strong>What's Next</strong> - Your roadmap for continued progress</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><strong>FAQs</strong> - Comprehensive answers to common questions</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-primary text-sm mb-3">Your Complete 6-Week Program Structure:</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><strong>6 Progressive Programs</strong> - Each with distinct color themes and increasing difficulty</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><strong>Integrated Cardio Plans</strong> - Optional weekly cardio schedules that complement your core work</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><strong>Weekly Training Schedules</strong> - Clear day-by-day guidance with mobile-friendly abbreviations</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><strong>Built-in Rest Days</strong> - Strategic recovery periods for optimal healing</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-primary text-sm mb-3">Interactive Video System:</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><strong>Clickable Exercise Names</strong> - All blue underlined exercise names link directly to video demonstrations</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><strong>Video Thumbnails</strong> - Visual previews with play buttons for easy access</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><strong>PLAY ALL Playlists</strong> - Complete workout playlists for seamless flow-through sessions</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-primary text-sm mb-3">Mobile-Optimized Experience:</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><strong>Smart Abbreviations</strong> - P1-P6 (Programs), C (Cardio), R (Rest) for compact mobile viewing</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><strong>Summary Badges</strong> - Quick weekly overviews like "3P • 2C • 1R" for easy planning</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><strong>Reference Legends</strong> - Clear explanations of all abbreviations and symbols</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-primary text-sm mb-3">Track Your Progress:</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><strong>Progress Bar</strong> - Visual tracking of your journey completion</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><strong>Tab Navigation</strong> - Move through sections at your own pace</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><strong>Flexible Scheduling</strong> - Adapt the program to fit your life and energy levels</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-primary text-sm mb-3">Remember:</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><em>This is your journey - move through the sections in the order that feels right for you</em></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><em>Each section can be revisited anytime - there's no expiration on healing</em></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><em>You're not just rebuilding your core - you're rebuilding trust in your body</em></span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Topic 3: When to Start This Program */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">3</span>
                  <h3 className="text-[15px] font-semibold text-left">When to Start This Program</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTopic('when-start')}
                  className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-pink-500 hover:to-pink-700 p-0"
                  data-testid="button-toggle-when-start"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['safety-mindset'] ? 'rotate-180' : ''}`} />
                </Button>
              </div>
              {expandedTopics['when-start'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-6">
                    <p className="text-sm text-center">
                      Healing is not linear—and that's okay. Let this be a gentle return to movement, not a rush back to pre-pregnancy anything.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-4 text-primary">Please stop and consult your provider if you experience:</h4>
                        <ul className="space-y-3 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-pink-500 font-bold">❖</span>
                            <span>Pain in your pelvis, back, or abdomen</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-pink-500 font-bold">❖</span>
                            <span>A bulging/doming of the tummy that worsens with effort</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-pink-500 font-bold">❖</span>
                            <span>Urinary or fecal incontinence</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-pink-500 font-bold">❖</span>
                            <span>Feeling of heaviness or dragging in the pelvis</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-4 text-primary">Mindset Matters:</h4>
                        <ul className="space-y-3 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-pink-500 font-bold">❖</span>
                            <span>You don't need a flat stomach to be strong.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-pink-500 font-bold">❖</span>
                            <span>Core rehab is not about aesthetics—it's about function, connection, and confidence.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-pink-500 font-bold">❖</span>
                            <span>This is a judgment-free space. Begin wherever you are and go at your pace.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300">
                      <p className="text-sm">
                        <strong>BULGING/DOMING OF THE TUMMY :</strong> This refers to a noticeable ridge or bulge that appears along the center of your abdomen—often from your breastbone down to your belly button—especially when you're doing movements like sitting up, coughing, or straining. This can be a sign of diastasis recti, which is a separation of the left and right abdominal muscles.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-lg italic text-gray-700">You've got this. And I've got you.</p>
                      <p className="text-lg italic text-gray-700">Let's begin. 💛</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Topic 4: Safety & Mindset Shifts */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3 flex-1">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">4</span>
                  <h3 className="text-[15px] font-semibold text-left leading-tight">Safety & Mindset Shifts</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTopic('safety-mindset')}
                  className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-pink-500 hover:to-pink-700 p-0"
                  data-testid="button-toggle-safety-mindset"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['delivery-type'] ? 'rotate-180' : ''}`} />
                </Button>
              </div>
              {expandedTopics['safety-mindset'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-lg text-blue-400 mb-4">VAGINAL DELIVERY:</h4>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><span className="text-primary font-semibold">Core engagement</span> may feel easier to activate, but be mindful of pelvic floor health, especially if you experienced tearing, an episiotomy, or pelvic floor weakness.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><span className="text-primary font-semibold">Gradual integration</span> of more dynamic exercises can occur if the pelvic floor feels strong and supported.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><span className="text-primary font-semibold">Pelvic-Floor Cues</span> If you experience pelvic heaviness, bulging at your vaginal opening, or any urinary leakage during exercises, pause the program and seek guidance from a pelvic-floor specialist before continuing.</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-lg text-blue-400 mb-4">C-SECTION DELIVERY:</h4>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><span className="text-primary font-semibold">Continue to approach core work</span> with care and intention, avoiding movements that cause pain or pulling around the incision site.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><span className="text-primary font-semibold">Gradual progression</span> is essential, especially when introducing core-focused movements.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><span className="text-primary font-semibold">Pelvic-Floor Cues</span> If you experience pelvic heaviness, bulging at your vaginal opening, or any urinary leakage during exercises, pause the program and seek guidance from a pelvic-floor specialist before continuing.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Topic 5: Special Considerations for Each Delivery Type */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">5</span>
                  <h3 className="text-[15px] font-semibold text-left leading-tight">Special Considerations for<br />Each Delivery Type</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTopic('delivery-type')}
                  className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-pink-500 hover:to-pink-700 p-0"
                  data-testid="button-toggle-delivery-type"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['delivery-type'] ? 'rotate-180' : ''}`} />
                </Button>
              </div>
              {expandedTopics['delivery-type'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-5">
                    <p className="text-sm">
                      This guide is your companion through rebuilding your core strength, reconnecting with your body, and feeling more confident in movement again.
                    </p>
                    
                    <div>
                      <p className="font-semibold text-primary text-sm mb-3">Tune In Weekly:</p>
                      <p className="text-sm">
                        Assess how you feel. Did you sleep well? Are you feeling sore or energized? Are you holding tension from feeding or carrying your baby? Adjust the plan based on energy levels, core connection, and overall recovery.
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-primary text-sm mb-3">Your program is divided into 6 weekly phases, each with:</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span>A <em>Core Strength Program</em> (Program 1 to 6)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span>A <em>suggested Cardio Plan</em> for that week</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><em>Built-in Rest Days</em></span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-primary text-sm mb-3">How to view the videos of the exercises:</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><em>All blue underlined text is clickable and will open a video link.</em></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><strong>PLAY ALL</strong> <em>indicates that the following workout can be played as a single playlist containing all the exercises to make it easier to flow through. However, do listen to each exercise instruction beforehand.</em></span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-primary text-sm mb-3">How to schedule your week:</p>
                      <p className="text-sm mb-2">Each week follows a 7-day rhythm, with a mix of:</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><em>Core Training Days</em> (2–4 sessions depending on the week)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><em>Optional Cardio Days</em> (1–3 light/moderate intensity sessions)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><em>At least 1 full Rest Day</em></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span>You'll see suggestions like "Day 1, Day 3, Day 5" - these refer to days of your week, so you can fit the workouts to your schedule flexibly.</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-primary text-sm mb-3">Move at your own pace:</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><em>You can stay on a week for longer if needed — don't feel rushed to move forward.</em></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><em>If you feel fatigued, emotional, or life just gets full… that's OK. Pause, rest, and return.</em></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><em>Progress isn't linear — even one session a week is a win.</em></span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-primary text-sm mb-3">Final tips:</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><em>Begin each session with your breath</em></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><em>End with a moment of stillness or gratitude</em></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><em>Don't skip rest- it's just as important as movement</em></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><em>You're not just rebuilding your core- you're rebuilding trust in your body</em></span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Topic 6: What Equipment Do You Need */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">6</span>
                  <h3 className="text-[15px] font-semibold text-left">What Equipment Do You Need</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTopic('equipment')}
                  className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-pink-500 hover:to-pink-700 p-0"
                  data-testid="button-toggle-equipment"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['equipment'] ? 'rotate-180' : ''}`} />
                </Button>
              </div>
              {expandedTopics['equipment'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-6 text-sm">
                    
                    <div>
                      <h4 className="font-semibold text-primary text-lg mb-4 text-center">✨ WHAT EQUIPMENT DO YOU NEED ✨</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {/* Row 1 */}
                      <div className="text-center group">
                        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-10 mb-4 aspect-square flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-pink-200">
                          <img 
                            src={yogaMatImage} 
                            alt="Pink yoga mat" 
                            className="w-56 h-56 object-contain filter drop-shadow-lg"
                          />
                        </div>
                        <p className="font-semibold text-lg text-gray-800">Yoga Mat</p>
                        <p className="text-sm text-gray-600 mt-1">Essential for floor exercises</p>
                      </div>
                      
                      <div className="text-center group">
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-10 mb-4 aspect-square flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-purple-200">
                          <img 
                            src={yogaBlocksImage} 
                            alt="Pink yoga blocks" 
                            className="w-56 h-56 object-contain filter drop-shadow-lg"
                          />
                        </div>
                        <p className="font-semibold text-lg text-gray-800">Yoga Blocks</p>
                        <p className="text-sm text-gray-600 mt-1">Support and alignment</p>
                      </div>
                      
                      <div className="text-center group">
                        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl p-10 mb-4 aspect-square flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-rose-200">
                          <img 
                            src={miniResistanceBandsImage} 
                            alt="Mini resistance bands" 
                            className="w-56 h-56 object-contain filter drop-shadow-lg"
                          />
                        </div>
                        <p className="font-semibold text-lg text-gray-800">Mini Resistance Bands</p>
                        <p className="text-sm text-gray-600 mt-1">Light resistance training</p>
                      </div>
                      
                      {/* Row 2 */}
                      <div className="text-center group">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-10 mb-4 aspect-square flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-green-200">
                          <img 
                            src={miniPilatesBallImage} 
                            alt="Mini Pilates ball" 
                            className="w-56 h-56 object-contain filter drop-shadow-lg"
                          />
                        </div>
                        <p className="font-semibold text-lg text-gray-800">Mini Pilates Ball</p>
                        <p className="text-sm text-gray-600 mt-1">Core stability and support</p>
                      </div>
                      
                      <div className="text-center group">
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-10 mb-4 aspect-square flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-indigo-200">
                          <img 
                            src={longResistanceBandImage} 
                            alt="Long resistance band" 
                            className="w-56 h-56 object-contain filter drop-shadow-lg"
                          />
                        </div>
                        <p className="font-semibold text-lg text-gray-800">Pilates Theraband</p>
                        <p className="text-sm text-gray-600 mt-1">Full-body resistance training</p>
                      </div>
                      
                      <div className="text-center group">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-10 mb-4 aspect-square flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200">
                          <img 
                            src={swissBallImage} 
                            alt="Medium Swiss ball" 
                            className="w-56 h-56 object-contain filter drop-shadow-lg"
                          />
                        </div>
                        <p className="font-semibold text-lg text-gray-800">Medium Swiss Ball</p>
                        <p className="text-sm text-gray-600 mt-1">Balance and stability work</p>
                      </div>
                      
                      {/* Row 3 - Foam Roller centered */}
                      <div className="text-center group md:col-span-2 lg:col-span-1 lg:col-start-2">
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-10 mb-4 aspect-square flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-slate-200">
                          <img 
                            src={foamRollerImage} 
                            alt="Foam roller" 
                            className="w-56 h-56 object-contain filter drop-shadow-lg"
                          />
                        </div>
                        <p className="font-semibold text-lg text-gray-800">Foam Roller</p>
                        <p className="text-sm text-gray-600 mt-1">Muscle recovery and release</p>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <h5 className="font-semibold text-primary mb-4">BONUS TIPS:</h5>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span>Find a quiet space, but don't stress if it's not perfect.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span>Keep water nearby, wear comfortable attire.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span>Treat these sessions like acts of care, not chores.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Topic 7: How to Include Cardio – Safely & Strategically */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">7</span>
                  <h3 className="text-[15px] font-semibold text-left">How to Include Cardio – Safely & Strategically</h3>
                </div>
                <div
                  onClick={() => toggleTopic('cardio-safety')}
                  className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center hover:from-pink-500 hover:to-pink-700 cursor-pointer transition-all duration-200"
                  style={{ 
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                    minHeight: '32px',
                    border: 'none !important', 
                    outline: 'none !important', 
                    boxShadow: '0 4px 8px rgba(236, 72, 153, 0.3) !important',
                    background: 'linear-gradient(to bottom right, rgb(244 114 182), rgb(219 39 119)) !important'
                  }}
                  data-testid="button-toggle-cardio-safety"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['cardio-safety'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expandedTopics['cardio-safety'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-5">
                    <p className="text-sm">
                      This cardio guide is designed to work for you whether you're 6 weeks postpartum, 6 months in, or 6 years down the line. The truth is—you can rebuild cardiovascular fitness at any time, and doing so can dramatically improve your stamina, mental health, and total-body strength.
                    </p>
                    
                    <p className="text-sm mt-4">
                      If you're just returning to movement after birth (even years later), start with the LISS (Low-Intensity Steady State) options and progress only when you feel core-ready, leak-free, and stable. The weekly suggestions here are optional—but powerful. You can walk, march, spin, or simply move at a pace that feels good.
                    </p>
                    
                    <div className="mt-6">
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold text-lg">❖</span>
                          <span><strong className="text-pink-600">Early Postpartum (6–12 weeks):</strong> Focus on gentle walks, stroller movement, breath-led cardio.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold text-lg">❖</span>
                          <span><strong className="text-pink-600">Mid-Rebuild (3–6 months+):</strong> Progress to brisk walks, inclines, and low-impact rhythm-based cardio.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold text-lg">❖</span>
                          <span><strong className="text-pink-600">Ready for More?</strong> See the "Return to Impact" test later in this guide before trying HIIT or plyometric.</span>
                        </li>
                      </ul>
                    </div>
                    
                    <p className="text-sm mt-6 italic">
                      There's no deadline on feeling fit. Do what feels right for your stage, energy, and healing pace.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Topic 8: Cardio Plan Overview - Redesigned */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">8</span>
                  <h3 className="text-[15px] font-semibold text-left">Cardio Plan Overview</h3>
                </div>
                <div
                  onClick={() => toggleTopic('cardio-overview')}
                  className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-pink-500 hover:to-pink-700 cursor-pointer transition-all duration-200"
                  style={{ border: 'none', outline: 'none', boxShadow: '0 4px 8px rgba(236, 72, 153, 0.3)' }}
                  data-testid="button-toggle-cardio-overview"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['cardio-overview'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expandedTopics['cardio-overview'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-6">
                    {/* Header Section */}
                    <div className="text-center mb-6">
                      <h4 className="text-2xl font-bold mb-4 bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
                        Cardio Plan Overview
                      </h4>
                      <p className="text-sm font-medium text-gray-600 border-l-4 border-pink-400 pl-4 bg-gradient-to-r from-pink-50 to-transparent py-2">
                        The cardio is optional, but oh boy, will it increase your fitness, your results and overall confidence!
                      </p>
                    </div>

                    {/* Cardio Types Legend */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                      <div className="bg-green-100 p-3 rounded-lg border-l-4 border-green-400">
                        <h5 className="font-semibold text-green-700 text-sm mb-1">LISS</h5>
                        <p className="text-xs text-green-600">Slow & steady movement (walk, swim, light bike)</p>
                      </div>
                      <div className="bg-orange-100 p-3 rounded-lg border-l-4 border-orange-400">
                        <h5 className="font-semibold text-orange-700 text-sm mb-1">MISS</h5>
                        <p className="text-xs text-orange-600">Slightly faster, steady pace (jog, incline walk, elliptical)</p>
                      </div>
                      <div className="bg-red-100 p-3 rounded-lg border-l-4 border-red-400">
                        <h5 className="font-semibold text-red-700 text-sm mb-1">HIIT</h5>
                        <p className="text-xs text-red-600">Short bursts of effort followed by rest (30s work / 90s rest)</p>
                      </div>
                    </div>

                    {/* Week by Week Cardio Plans */}
                    <div className="space-y-4">
                      {/* Week 1 */}
                      <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                        <div className="p-4 text-white" style={{background: 'linear-gradient(135deg, #f3a8cb 0%, #f2038b 100%)'}}>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">Week 1</span>
                              <h4 className="font-bold text-lg mt-1">Gentle Foundation</h4>
                            </div>
                            <div className="bg-green-500 px-3 py-1 rounded-full">
                              <span className="text-xs font-bold">LISS</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500 text-xs">Intensity</span>
                              <p className="font-semibold">40-50% MHR</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">Duration</span>
                              <p className="font-semibold">10-15 mins</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">Days</span>
                              <p className="font-semibold">Day 2, 4</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">Rest Day</span>
                              <p className="font-semibold">Day 6</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                            <strong>Focus:</strong> Gentle walks, breathing flows, stroller movement. Focus on blood flow, not effort.
                          </p>
                        </div>
                      </div>

                      {/* Week 2 */}
                      <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                        <div className="p-4 text-white" style={{background: 'linear-gradient(135deg, #b3c0e4 0%, #9aafdc 100%)'}}>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">Week 2</span>
                              <h4 className="font-bold text-lg mt-1">Building Rhythm</h4>
                            </div>
                            <div className="bg-green-500 px-3 py-1 rounded-full">
                              <span className="text-xs font-bold">LISS</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500 text-xs">Intensity</span>
                              <p className="font-semibold">50-60% MHR</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">Duration</span>
                              <p className="font-semibold">20 mins</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">Days</span>
                              <p className="font-semibold">Day 2, 6</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">Rest Day</span>
                              <p className="font-semibold">Day 7</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                            <strong>Focus:</strong> Brisk walks, swimming, light cycle. Maintain a steady rhythm. Use the Talk Test.
                          </p>
                        </div>
                      </div>

                      {/* Week 3 */}
                      <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                        <div className="p-4 text-white" style={{background: 'linear-gradient(135deg, #cbde9a 0%, #b8d082 100%)'}}>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">Week 3</span>
                              <h4 className="font-bold text-lg mt-1">Moderate Challenge</h4>
                            </div>
                            <div className="bg-orange-500 px-3 py-1 rounded-full">
                              <span className="text-xs font-bold">MISS</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500 text-xs">Intensity</span>
                              <p className="font-semibold">60-70% MHR</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">Duration</span>
                              <p className="font-semibold">25-30 mins</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">Days</span>
                              <p className="font-semibold">Day 1, 5</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">Rest Day</span>
                              <p className="font-semibold">Day 7</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 bg-orange-50 p-3 rounded-lg">
                            <strong>Focus:</strong> Incline walk, spin bike, elliptical, or light jog. Slightly breathy but sustainable.
                          </p>
                        </div>
                      </div>

                      {/* Week 4 */}
                      <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                        <div className="p-4 text-white" style={{background: 'linear-gradient(135deg, #c2b9a1 0%, #b3a892 100%)'}}>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">Week 4</span>
                              <h4 className="font-bold text-lg mt-1">Intensity Introduction</h4>
                            </div>
                            <div className="bg-red-500 px-3 py-1 rounded-full">
                              <span className="text-xs font-bold">HIIT</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500 text-xs">Intensity</span>
                              <p className="font-semibold">Up to 75% MHR</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">Duration</span>
                              <p className="font-semibold">10 mins total</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">Days</span>
                              <p className="font-semibold">Day 2, 6</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">Rest Day</span>
                              <p className="font-semibold">Day 7</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 bg-red-50 p-3 rounded-lg">
                            <strong>Focus:</strong> 20secs work : 1-2 mins recovery. Use cycling, stair tops, or fast marching.
                          </p>
                        </div>
                      </div>

                      {/* Week 5 */}
                      <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                        <div className="p-4 text-white" style={{background: 'linear-gradient(135deg, #b3c0e4 0%, #cbde9a 100%)'}}>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">Week 5</span>
                              <h4 className="font-bold text-lg mt-1">Advanced Intervals</h4>
                            </div>
                            <div className="bg-red-500 px-3 py-1 rounded-full">
                              <span className="text-xs font-bold">HIIT</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500 text-xs">Intensity</span>
                              <p className="font-semibold">75-80% MHR</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">Duration</span>
                              <p className="font-semibold">15-20 mins</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">Days</span>
                              <p className="font-semibold">Day 1, 5</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">Rest Day</span>
                              <p className="font-semibold">Day 7</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 bg-red-50 p-3 rounded-lg">
                            <strong>Focus:</strong> 30secs intense effort (cycle) : 1-2 min recovery. Build up to 6-8 rounds max.
                          </p>
                        </div>
                      </div>

                      {/* Week 6 */}
                      <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                        <div className="p-4 text-white" style={{background: 'linear-gradient(135deg, #f3a8cb 0%, #c2b9a1 100%)'}}>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">Week 6</span>
                              <h4 className="font-bold text-lg mt-1">Hybrid Power</h4>
                            </div>
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 rounded-full">
                              <span className="text-xs font-bold">HYBRID</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500 text-xs">Intensity</span>
                              <p className="font-semibold">60-80% MHR</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">Duration</span>
                              <p className="font-semibold">20-30 mins</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">Days</span>
                              <p className="font-semibold">Day 2, 4</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">Rest Day</span>
                              <p className="font-semibold">Day 6</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-lg">
                            <strong>Focus:</strong> Start with steady cardio + finish with 2-3 short intervals. Push only if energy feels good.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Important Tips Section */}
                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                      <h5 className="font-semibold text-pink-700 mb-3">Important Guidelines</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><strong>MHR Formula:</strong> Max Heart Rate = 220 - your age × target % range</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><strong>Example:</strong> 30 years old → 220-30 = 190 → 50% MHR = 95 BPM</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span>Always warm up (3-5 mins) and cool down after each session</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span><strong>Talk Test:</strong> You should be able to talk, not sing (LISS), or speak short phrases (MISS/HIIT)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span>Feel free to shuffle days based on your energy and schedule</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Topic 9: Your Training Schedule With Cardio - Redesigned */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">9</span>
                  <h3 className="text-[15px] font-semibold text-left">Your Training Schedule With Cardio</h3>
                </div>
                <div
                  onClick={() => toggleTopic('cardio-schedule')}
                  className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-pink-500 hover:to-pink-700 cursor-pointer transition-all duration-200"
                  style={{ border: 'none', outline: 'none', boxShadow: '0 4px 8px rgba(236, 72, 153, 0.3)' }}
                  data-testid="button-toggle-cardio-schedule"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['cardio-schedule'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expandedTopics['cardio-schedule'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-6">
                    {/* Header Section */}
                    <div className="text-center mb-6">
                      <h4 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-600 bg-clip-text text-transparent drop-shadow-sm">
                        Your Training Schedule With Cardio
                      </h4>
                      <p className="text-sm font-medium text-gray-600 border-l-4 border-purple-400 pl-4 bg-gradient-to-r from-purple-50 to-transparent py-2">
                        A gentle weekly rhythm to rebuild strength, core connection, and confidence. You decide the exact schedule that works best for you.
                      </p>
                    </div>

                    {/* Activity Legend */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                      <div className="bg-pink-100 p-3 rounded-lg border-l-4 border-pink-400">
                        <h5 className="font-semibold text-pink-700 text-sm mb-1">💪 PROGRAM</h5>
                        <p className="text-xs text-pink-600">Core strengthening workouts from your 6-week plan</p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-lg border-l-4 border-blue-400">
                        <h5 className="font-semibold text-blue-700 text-sm mb-1">❤️ CARDIO</h5>
                        <p className="text-xs text-green-600">Follow the cardio plan from Topic 8 above</p>
                      </div>
                      <div className="bg-emerald-100 p-3 rounded-lg border-l-4 border-emerald-400">
                        <h5 className="font-semibold text-emerald-700 text-sm mb-1">🌱 REST</h5>
                        <p className="text-xs text-emerald-600">Recovery days with gentle walks or complete rest</p>
                      </div>
                    </div>

                    {/* Mobile Legend - Only visible on mobile */}
                    <div className="block md:hidden mb-6">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-700 mb-3 text-sm">📱 Mobile Quick Reference</h5>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div className="text-center">
                            <div className="bg-pink-100 text-pink-700 py-1 px-2 rounded font-medium mb-1">P1-P6</div>
                            <p className="text-gray-600">Program 1-6</p>
                          </div>
                          <div className="text-center">
                            <div className="bg-green-100 text-blue-700 py-1 px-2 rounded font-medium mb-1">C</div>
                            <p className="text-gray-600">Cardio</p>
                          </div>
                          <div className="text-center">
                            <div className="bg-emerald-100 text-emerald-700 py-1 px-2 rounded font-medium mb-1">R</div>
                            <p className="text-gray-600">Rest</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Weekly Schedules */}
                    <div className="space-y-4">
                      {/* Week 1 */}
                      <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                        <div className="p-4 text-white" style={{background: 'linear-gradient(135deg, #f3a8cb 0%, #f2038b 100%)'}}>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">Week 1</span>
                              <h4 className="font-bold text-lg mt-1">Foundation Building</h4>
                            </div>
                            <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                              <span className="block md:hidden">3P • 2C • 1R</span>
                              <span className="hidden md:block">3 Programs • 2 Cardio • 1 Rest</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-xs">
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">MON</div>
                              <div className="bg-pink-100 text-pink-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">P1</span>
                                <span className="hidden md:block">PROGRAM 1</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">TUE</div>
                              <div className="bg-green-100 text-blue-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">C</span>
                                <span className="hidden md:block">CARDIO</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">WED</div>
                              <div className="bg-pink-100 text-pink-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">P1</span>
                                <span className="hidden md:block">PROGRAM 1</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">THU</div>
                              <div className="bg-green-100 text-blue-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">C</span>
                                <span className="hidden md:block">CARDIO</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">FRI</div>
                              <div className="bg-pink-100 text-pink-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">P1</span>
                                <span className="hidden md:block">PROGRAM 1</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">SAT</div>
                              <div className="bg-emerald-100 text-emerald-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">R</span>
                                <span className="hidden md:block">REST</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">SUN</div>
                              <div className="bg-pink-100 text-pink-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">P1</span>
                                <span className="hidden md:block">PROGRAM 1</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Week 2 */}
                      <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                        <div className="p-4 text-white" style={{background: 'linear-gradient(135deg, #b3c0e4 0%, #9aafdc 100%)'}}>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">Week 2</span>
                              <h4 className="font-bold text-lg mt-1">Stability Focus</h4>
                            </div>
                            <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                              <span className="block md:hidden">3P • 2C • 2R</span>
                              <span className="hidden md:block">3 Programs • 2 Cardio • 2 Rest</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-xs">
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">MON</div>
                              <div className="bg-green-100 text-blue-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">P2</span>
                                <span className="hidden md:block">PROGRAM 2</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">TUE</div>
                              <div className="bg-cyan-100 text-cyan-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">C</span>
                                <span className="hidden md:block">CARDIO</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">WED</div>
                              <div className="bg-green-100 text-blue-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">P2</span>
                                <span className="hidden md:block">PROGRAM 2</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">THU</div>
                              <div className="bg-emerald-100 text-emerald-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">R</span>
                                <span className="hidden md:block">REST</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">FRI</div>
                              <div className="bg-green-100 text-blue-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">P2</span>
                                <span className="hidden md:block">PROGRAM 2</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">SAT</div>
                              <div className="bg-cyan-100 text-cyan-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">C</span>
                                <span className="hidden md:block">CARDIO</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">SUN</div>
                              <div className="bg-emerald-100 text-emerald-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">R</span>
                                <span className="hidden md:block">REST</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Week 3 */}
                      <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                        <div className="p-4 text-white" style={{background: 'linear-gradient(135deg, #cbde9a 0%, #b8d082 100%)'}}>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">Week 3</span>
                              <h4 className="font-bold text-lg mt-1">Control & Awareness</h4>
                            </div>
                            <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                              <span className="block md:hidden">3P • 2C • 2R</span>
                              <span className="hidden md:block">3 Programs • 2 Cardio • 2 Rest</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-xs">
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">MON</div>
                              <div className="bg-teal-100 text-teal-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">C</span>
                                <span className="hidden md:block">CARDIO</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">TUE</div>
                              <div className="bg-emerald-100 text-emerald-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">P3</span>
                                <span className="hidden md:block">PROGRAM 3</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">WED</div>
                              <div className="bg-gray-100 text-gray-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">R</span>
                                <span className="hidden md:block">REST</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">THU</div>
                              <div className="bg-emerald-100 text-emerald-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">P3</span>
                                <span className="hidden md:block">PROGRAM 3</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">FRI</div>
                              <div className="bg-teal-100 text-teal-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">C</span>
                                <span className="hidden md:block">CARDIO</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">SAT</div>
                              <div className="bg-emerald-100 text-emerald-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">P3</span>
                                <span className="hidden md:block">PROGRAM 3</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">SUN</div>
                              <div className="bg-gray-100 text-gray-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">R</span>
                                <span className="hidden md:block">REST</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Week 4 */}
                      <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                        <div className="p-4 text-white" style={{background: 'linear-gradient(135deg, #c2b9a1 0%, #b3a892 100%)'}}>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">Week 4</span>
                              <h4 className="font-bold text-lg mt-1">Align & Activate</h4>
                            </div>
                            <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                              <span className="block md:hidden">3P • 2C • 2R</span>
                              <span className="hidden md:block">3 Programs • 2 Cardio • 2 Rest</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-xs">
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">MON</div>
                              <div className="bg-purple-100 text-purple-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">P4</span>
                                <span className="hidden md:block">PROGRAM 4</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">TUE</div>
                              <div className="bg-violet-100 text-violet-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">C</span>
                                <span className="hidden md:block">CARDIO</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">WED</div>
                              <div className="bg-purple-100 text-purple-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">P4</span>
                                <span className="hidden md:block">PROGRAM 4</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">THU</div>
                              <div className="bg-gray-100 text-gray-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">R</span>
                                <span className="hidden md:block">REST</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">FRI</div>
                              <div className="bg-purple-100 text-purple-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">P4</span>
                                <span className="hidden md:block">PROGRAM 4</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">SAT</div>
                              <div className="bg-violet-100 text-violet-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">C</span>
                                <span className="hidden md:block">CARDIO</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">SUN</div>
                              <div className="bg-gray-100 text-gray-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">R</span>
                                <span className="hidden md:block">REST</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Week 5 */}
                      <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                        <div className="p-4 text-white" style={{background: 'linear-gradient(135deg, #b3c0e4 0%, #cbde9a 100%)'}}>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">Week 5</span>
                              <h4 className="font-bold text-lg mt-1">Functional Core Flow</h4>
                            </div>
                            <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                              <span className="block md:hidden">3P • 2C • 2R</span>
                              <span className="hidden md:block">3 Programs • 2 Cardio • 2 Rest</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-xs">
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">MON</div>
                              <div className="bg-green-100 text-blue-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">C</span>
                                <span className="hidden md:block">CARDIO</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">TUE</div>
                              <div className="bg-indigo-100 text-indigo-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">P5</span>
                                <span className="hidden md:block">PROGRAM 5</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">WED</div>
                              <div className="bg-gray-100 text-gray-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">R</span>
                                <span className="hidden md:block">REST</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">THU</div>
                              <div className="bg-indigo-100 text-indigo-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">P5</span>
                                <span className="hidden md:block">PROGRAM 5</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">FRI</div>
                              <div className="bg-green-100 text-blue-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">C</span>
                                <span className="hidden md:block">CARDIO</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">SAT</div>
                              <div className="bg-indigo-100 text-indigo-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">P5</span>
                                <span className="hidden md:block">PROGRAM 5</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">SUN</div>
                              <div className="bg-gray-100 text-gray-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">R</span>
                                <span className="hidden md:block">REST</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Week 6 */}
                      <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                        <div className="p-4 text-white" style={{background: 'linear-gradient(135deg, #f3a8cb 0%, #c2b9a1 100%)'}}>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">Week 6</span>
                              <h4 className="font-bold text-lg mt-1">Foundational Strength</h4>
                            </div>
                            <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                              <span className="block md:hidden">4P • 2C • 1R</span>
                              <span className="hidden md:block">4 Programs • 2 Cardio • 1 Rest</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-xs">
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">MON</div>
                              <div className="bg-amber-100 text-amber-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">P6</span>
                                <span className="hidden md:block">PROGRAM 6</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">TUE</div>
                              <div className="bg-orange-100 text-orange-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">C</span>
                                <span className="hidden md:block">CARDIO</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">WED</div>
                              <div className="bg-amber-100 text-amber-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">P6</span>
                                <span className="hidden md:block">PROGRAM 6</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">THU</div>
                              <div className="bg-orange-100 text-orange-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">C</span>
                                <span className="hidden md:block">CARDIO</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">FRI</div>
                              <div className="bg-amber-100 text-amber-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">P6</span>
                                <span className="hidden md:block">PROGRAM 6</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">SAT</div>
                              <div className="bg-gray-100 text-gray-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">R</span>
                                <span className="hidden md:block">REST</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-500 text-[10px] md:text-xs">SUN</div>
                              <div className="bg-amber-100 text-amber-700 py-2 px-0.5 md:px-1 rounded font-medium text-[10px] md:text-xs leading-tight">
                                <span className="block md:hidden">P6</span>
                                <span className="hidden md:block">PROGRAM 6</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Important Flexibility Tips */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h5 className="font-semibold text-purple-700 mb-3">💡 Scheduling Flexibility</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-purple-500 font-bold">❖</span>
                          <span>Feel free to shuffle days based on your energy and schedule</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-500 font-bold">❖</span>
                          <span>If interrupted during a workout, continue where you left off later that day</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-500 font-bold">❖</span>
                          <span>Try not to go more than 2 days without movement</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-500 font-bold">❖</span>
                          <span>Rest days can include gentle walks if you feel like moving</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-500 font-bold">❖</span>
                          <span>Listen to your body - this is YOUR recovery journey</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Continue Your Journey</h3>
              <p className="text-sm text-gray-600">Navigate through your recovery program</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center">
              {canGoPrevious() && (
                <Button
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 sm:px-8 py-4 sm:py-3 text-sm sm:text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
                  data-testid="button-previous-section"
                  onClick={navigateToPreviousTab}
                >
                  <ChevronLeft className="w-4 h-4" />
                  {getNavigationText('prev')}
                </Button>
              )}
              {canGoNext() && (
                <Button
                  className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 sm:px-8 py-4 sm:py-3 text-sm sm:text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
                  data-testid="button-next-section"
                  onClick={navigateToNextTab}
                >
                  {getNavigationText('next')}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">Build the foundation for your recovery journey</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


function UnderstandingYourCoreSection({ 
  articles, 
  onArticleClick,
  canGoNext,
  canGoPrevious,
  navigateToNextTab,
  navigateToPreviousTab,
  getNavigationText
}: { 
  articles: any[]; 
  onArticleClick: (article: any) => void;
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  navigateToNextTab: () => void;
  navigateToPreviousTab: () => void;
  getNavigationText: (direction: 'prev' | 'next') => string;
}) {
  const [expandedTopics, setExpandedTopics] = useState<{[key: string]: boolean}>({});

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-left bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
            Understanding Your Core
          </CardTitle>
          <CardDescription className="text-sm font-medium text-left text-gray-600 border-l-4 border-blue-400 pl-4 bg-gradient-to-r from-blue-50 to-transparent py-2">
            Educational foundation to empower you with understanding the why behind your recovery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            
            {/* Topic 1: Breathing & Core Activation */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">1</span>
                  <h3 className="text-[15px] font-semibold text-left">Breathing & Core Activation</h3>
                </div>
                <div
                  onClick={() => toggleTopic('breathing-activation')}
                  className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center hover:from-pink-500 hover:to-pink-700 cursor-pointer transition-all duration-200"
                  style={{ 
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                    minHeight: '32px',
                    border: 'none !important', 
                    outline: 'none !important', 
                    boxShadow: '0 4px 8px rgba(236, 72, 153, 0.3) !important',
                    background: 'linear-gradient(to bottom right, rgb(244 114 182), rgb(219 39 119)) !important'
                  }}
                  data-testid="button-toggle-breathing-activation"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['breathing-activation'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expandedTopics['breathing-activation'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-5">
                    <p className="text-sm font-semibold text-primary">Learning how to breathe properly is essential to activating your deep core muscles safely.</p>
                    <p className="text-sm">Breathwork becomes the foundation for every movement, helping reduce pressure on the abdominal wall and pelvic floor, preventing diastasis recti and pelvic floor dysfunction.</p>
                    
                    <div className="bg-muted/50 p-4 rounded">
                      <p className="font-semibold mb-2">Understanding the "Core Canister"</p>
                      <p className="mb-2">Think of your core as a canister:</p>
                      <ul className="ml-4 list-disc space-y-1 text-sm">
                        <li>The top is your diaphragm (breathing muscle).</li>
                        <li>The bottom is your pelvic floor.</li>
                        <li>The sides and front are your deep abdominal muscles (transverse abdominis).</li>
                        <li>The back is your spine and deep back muscles.</li>
                      </ul>
                      
                      {/* Anatomy Image */}
                      <div className="mt-4 mb-4 flex justify-center">
                        <div className="bg-white p-3 rounded-lg shadow-sm border max-w-sm">
                          <img 
                            src={anatomyImage} 
                            alt="Abdominal Muscle Anatomy showing Transverse Abdominis, Rectus Abdominis, Internal Oblique, and External Oblique" 
                            className="w-full h-auto rounded"
                            data-testid="img-anatomy-diagram"
                          />
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-2">When you inhale and exhale properly, these parts work together to create pressure and stability. Mismanaged breathing (like shallow chest breathing or breath holding) can weaken this system.</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Topic 2: How To Breathe Properly: 360° Breathing */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">2</span>
                  <h3 className="text-[15px] font-semibold text-left">How To Breathe Properly: 360° Breathing</h3>
                </div>
                <div
                  onClick={() => toggleTopic('360-breathing')}
                  className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center hover:from-pink-500 hover:to-pink-700 cursor-pointer transition-all duration-200"
                  style={{ 
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                    minHeight: '32px',
                    border: 'none !important', 
                    outline: 'none !important', 
                    boxShadow: '0 4px 8px rgba(236, 72, 153, 0.3) !important',
                    background: 'linear-gradient(to bottom right, rgb(244 114 182), rgb(219 39 119)) !important'
                  }}
                  data-testid="button-toggle-360-breathing"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['360-breathing'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expandedTopics['360-breathing'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-5">
                    {/* YouTube Link Button */}
                    <div className="flex justify-start mb-4">
                      <a 
                        href="https://youtu.be/B53GBfgME9E" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md"
                        style={{
                          background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)',
                          boxShadow: '0 2px 6px rgba(236, 72, 153, 0.25)',
                          fontSize: '11px'
                        }}
                        data-testid="link-360-breathing-video"
                      >
                        <Play className="w-2.5 h-2.5" />
                        360 Degree Breathing
                      </a>
                    </div>
                    
                    <p className="text-sm">360° breathing is a deep, diaphragmatic breathing technique that encourages expansion in all directions — front, sides, and back — rather than just the chest or belly.</p>
                    
                    {/* Breathing Diagram */}
                    <div className="flex justify-center my-6">
                      <div className="bg-white p-4 rounded-lg shadow-sm border max-w-md">
                        <img 
                          src={breathingDiagram} 
                          alt="Core Breath diagram showing inhale and exhale patterns with 360 degree expansion"
                          className="w-full h-auto rounded"
                          style={{
                            filter: 'contrast(1.1) brightness(1.05)',
                            mixBlendMode: 'multiply'
                          }}
                          data-testid="img-breathing-diagram"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded">
                      <p className="font-semibold mb-2">Steps to Practice 360° Breathing:</p>
                      <ol className="ml-4 list-decimal space-y-2 text-sm">
                        <li>Sit upright or stand tall with a neutral pelvis (not tucked or overly arched).</li>
                        <li>Place one hand on your ribs and the other on your belly.</li>
                        <li><strong>Inhale slowly through your nose:</strong>
                          <ul className="ml-4 list-disc mt-1 space-y-1">
                            <li>Feel your ribs expand outward and slightly back.</li>
                            <li>The belly will naturally expand, but not only the belly — imagine your entire torso filling up with air.</li>
                          </ul>
                        </li>
                        <li><strong>Exhale slowly through your mouth:</strong>
                          <ul className="ml-4 list-disc mt-1 space-y-1">
                            <li>Feel your ribs move back inward.</li>
                            <li>Gently engage your deep core (your lower belly will naturally "hug in" slightly without forcefully sucking in).</li>
                          </ul>
                        </li>
                      </ol>
                    </div>
                    
                    <div className="text-center p-3 bg-primary/10 rounded">
                      <p className="italic font-medium text-sm">Think "expand in all directions on inhale, gently recoil on exhale."</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Topic 3: Understanding Your Core & TVA Engagement */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">3</span>
                  <h3 className="text-[15px] font-semibold text-left">Understanding Your Core & TVA Engagement</h3>
                </div>
                <div
                  onClick={() => toggleTopic('tva-engagement')}
                  className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center hover:from-pink-500 hover:to-pink-700 cursor-pointer transition-all duration-200"
                  style={{ 
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                    minHeight: '32px',
                    border: 'none !important', 
                    outline: 'none !important', 
                    boxShadow: '0 4px 8px rgba(236, 72, 153, 0.3) !important',
                    background: 'linear-gradient(to bottom right, rgb(244 114 182), rgb(219 39 119)) !important'
                  }}
                  data-testid="button-toggle-tva-engagement"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['tva-engagement'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expandedTopics['tva-engagement'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-5">
                    {/* YouTube Link Button */}
                    <div className="flex justify-start mb-4">
                      <a 
                        href="https://www.youtube.com/watch?v=h7MxrsIGCxo" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md"
                        style={{
                          background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)',
                          boxShadow: '0 2px 6px rgba(236, 72, 153, 0.25)',
                          fontSize: '11px'
                        }}
                        data-testid="link-tva-engagement-video"
                      >
                        <Play className="w-2.5 h-2.5" />
                        Core & TVA Engagement
                      </a>
                    </div>

                    <p className="text-sm">Why "pull your belly in" isn't enough — and what to do instead. Before you can rebuild strength, you need to understand what you're actually connecting to. Your Transverse Abdominis (TVA) is your body's innermost abdominal muscle — often called the "corset" muscle — and it's the foundation of true core strength. Without proper TVA engagement, even "core exercises" can make things worse.</p>
                    
                    {/* Skeleton Graphics Side by Side */}
                    <div className="flex justify-center gap-4 my-6">
                      <div className="bg-white p-3 rounded-lg shadow-sm border max-w-xs">
                        <img 
                          src={tvaSkeletonImage} 
                          alt="Skeleton showing TVA muscle anatomy and location"
                          className="w-full h-auto rounded"
                          data-testid="img-tva-skeleton"
                        />
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-primary text-lg">✨</span>
                        <p className="font-semibold text-primary">What is the TVA?</p>
                      </div>
                      <p className="text-sm mb-3">The <strong>TRANSVERSE ABDOMINAL MUSCLE (TVA)</strong> wraps horizontally around your entire torso, from your ribs to your pelvis, like a wide supportive belt. <strong>It attaches at your spine and wraps forward toward your belly button, stabilizing your:</strong></p>
                      <ul className="ml-4 list-disc space-y-1 text-sm">
                        <li>Spine</li>
                        <li>Internal organs</li>
                        <li>Lower back</li>
                        <li>Pelvic floor</li>
                        <li>Rib cage</li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-primary text-lg">✨</span>
                        <p className="font-semibold text-primary">Why It Matters:</p>
                      </div>
                      <p className="text-sm mb-3">The TVA helps hold you together from the inside. <strong>It supports posture, protects the spine, & helps reduce or prevent:</strong></p>
                      <ul className="ml-4 list-disc space-y-1 text-sm">
                        <li>Diastasis recti</li>
                        <li>Pelvic floor dysfunction</li>
                        <li>Lower back pain</li>
                        <li>Poor pressure management (bulging or doming of the abdomen)</li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-primary text-lg">✨</span>
                        <p className="font-semibold text-primary">How to engage your TVA:</p>
                      </div>
                      
                      <p className="font-semibold text-sm mb-2">Here's how to feel your TVA working:</p>
                      <ul className="ml-4 space-y-2 text-sm">
                        <li><strong>❖ Sit tall or lie down, maintaining a neutral spine.</strong></li>
                        <li><strong>❖ Inhale through your nose:</strong> feel ribs & belly gently expand in all directions (360° breath).</li>
                        <li><strong>❖ Exhale slowly through your mouth with a soft "sss" or "shhh" —</strong> and imagine your ribs knitting in, your hip bones drawing slightly toward each other, & lower belly gently drawing back.</li>
                        <li><strong>❖ You should feel tension around your entire waistline, like a corset tightening.</strong></li>
                      </ul>
                      
                      <div className="mt-4 p-3 bg-primary/10 rounded">
                        <p className="font-semibold text-sm mb-2">Try thinking of it as:</p>
                        <ul className="ml-4 space-y-1 text-sm">
                          <li><strong>❖ "Wrapping your core from the back to the front"</strong></li>
                          <li><strong>❖ "Zipping up your lower belly from pelvis to ribs"</strong></li>
                          <li><strong>❖ "Lifting from your pelvic floor to your ribs as you exhale"</strong></li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded">
                      <p className="font-semibold text-sm mb-2 text-primary">Cue Tips:</p>
                      <ul className="ml-4 space-y-1 text-sm">
                        <li><strong>❖ Avoid hard sucking or hollowing</strong> - this shuts off the core.</li>
                        <li><strong>❖ Don't tuck your pelvis</strong> - keep a soft, natural curve in your lower back.</li>
                        <li><strong>❖ The movement should feel subtle but not superficial or grippy.</strong></li>
                        <li><strong>❖ Over time, this will become your core foundation during movement, lifting, and breath.</strong></li>
                      </ul>
                    </div>

                    <div className="bg-primary/10 p-4 rounded">
                      <p className="font-semibold text-sm mb-2 text-primary">Final Reminder:</p>
                      <ul className="ml-4 space-y-1 text-sm">
                        <li><strong>❖ You don't need to brace, clench, or crunch to train your core.</strong></li>
                        <li><strong>❖ You need connection — and that begins with your breath and TVA.</strong></li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Topic 4: How To Engage Your Core With Breathing */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">4</span>
                  <h3 className="text-[15px] font-semibold text-left">How To Engage Your Core With Breathing</h3>
                </div>
                <div
                  onClick={() => toggleTopic('core-breathing')}
                  className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center hover:from-pink-500 hover:to-pink-700 cursor-pointer transition-all duration-200"
                  style={{ 
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                    minHeight: '32px',
                    border: 'none !important', 
                    outline: 'none !important', 
                    boxShadow: '0 4px 8px rgba(236, 72, 153, 0.3) !important',
                    background: 'linear-gradient(to bottom right, rgb(244 114 182), rgb(219 39 119)) !important'
                  }}
                  data-testid="button-toggle-core-breathing"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['core-breathing'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expandedTopics['core-breathing'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-5">
                    <p className="text-sm">Once you master 360° breathing, you can learn to add gentle core activation — especially important before and during any exercise or lifting movements.</p>
                    
                    {/* Your Breath & Your Core Diagram */}
                    <div className="flex justify-center my-6">
                      <div className="bg-white p-4 rounded-lg shadow-sm border max-w-lg">
                        <img 
                          src={breathCoreImage} 
                          alt="Your Breath and Your Core - anatomical diagram showing breathing and core connection"
                          className="w-full h-auto rounded"
                          data-testid="img-breath-core-diagram"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold text-primary mb-3">Steps to Activate Core:</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="font-semibold text-sm mb-1">1. <span className="text-primary">INHALE</span> (Prepare):</p>
                          <p className="text-sm ml-4">❖ Expand ribs, belly, and back — no engagement yet.</p>
                        </div>
                        
                        <div>
                          <p className="font-semibold text-sm mb-1">2. <span className="text-primary">EXHALE</span> (Activate): As you exhale:</p>
                          <ul className="ml-6 space-y-1 text-sm">
                            <li>❖ <strong>Gently lift the pelvic floor</strong> (imagine picking up a blueberry with your vagina or stopping gas).</li>
                            <li>❖ <strong>At the same time, lightly draw your lower belly</strong> (below your belly button) toward your spine.</li>
                            <li>❖ <strong>Keep ribs down</strong> (not flaring) and spine neutral.</li>
                          </ul>
                        </div>
                        
                        <div>
                          <p className="font-semibold text-sm mb-1">3. <span className="text-primary">HOLD GENTLE ENGAGEMENT</span> (During the movement):</p>
                          <p className="text-sm ml-4">❖ You should still be able to breathe and talk — this is a light, supportive activation, not a hard brace.</p>
                        </div>
                        
                        <div>
                          <p className="font-semibold text-sm mb-1">4. <span className="text-primary">RELAX</span> Completely after the movement.</p>
                          <p className="text-sm ml-4">❖ Full relaxation is just as important to prevent over-tightening.</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-primary/10 p-4 rounded">
                      <p className="font-semibold text-primary mb-2">The Purposeful Exhale</p>
                      <p className="text-sm italic">As you exhale you should feel an automatic tensioning of your abdominals, the muscles of your back and pelvic floor both tightening and lifting.</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Topic 5: Foundational Core Compressions */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">5</span>
                  <h3 className="text-[15px] font-semibold text-left">Foundational Core Compressions</h3>
                </div>
                <div
                  onClick={() => toggleTopic('core-compressions')}
                  className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center hover:from-pink-500 hover:to-pink-700 cursor-pointer transition-all duration-200"
                  style={{ 
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                    minHeight: '32px',
                    border: 'none !important', 
                    outline: 'none !important', 
                    boxShadow: '0 4px 8px rgba(236, 72, 153, 0.3) !important',
                    background: 'linear-gradient(to bottom right, rgb(244 114 182), rgb(219 39 119)) !important'
                  }}
                  data-testid="button-toggle-core-compressions"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['core-compressions'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expandedTopics['core-compressions'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-5">
                    {/* YouTube Link Button */}
                    <div className="flex justify-start mb-4">
                      <a 
                        href="https://youtube.com/watch?v=h_S_tq0-Pv0&feature=youtu.be" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md"
                        style={{
                          background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)',
                          boxShadow: '0 2px 6px rgba(236, 72, 153, 0.25)',
                          fontSize: '11px'
                        }}
                        data-testid="link-core-compressions-video"
                      >
                        <Play className="w-2.5 h-2.5" />
                        Foundational Core Compressions
                      </a>
                    </div>

                    <p className="text-sm text-primary">These are the 3 essential tools you'll use throughout your journey to connect to your deep core, support your spine, and move with intention.</p>
                    
                    <p className="font-semibold text-base text-black text-left">Learn & Practice these 3 techniques explained below:</p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Left Column - Belly Pump */}
                      <div className="space-y-4">
                        <div className="bg-muted/50 p-4 rounded">
                          <h4 className="font-semibold text-primary mb-3">1. Belly Pump</h4>
                          <p className="text-sm mb-3"><strong>What it is:</strong> A coordinated breath and core activation technique used to gently engage your deep core muscles on the exhale. It helps retrain the body to stabilize before movement, without excessive pressure or strain.</p>
                          
                          <p className="font-semibold text-sm mb-2">How to do it:</p>
                          <ul className="ml-4 space-y-1 text-sm mb-3">
                            <li>❖ Start in a neutral posture (seated, standing, or lying on your back with knees bent).</li>
                            <li>❖ Inhale through your nose, letting your ribs expand 360° — belly, back, and sides.</li>
                            <li>❖ Exhale through pursed lips or a gentle "shhh" or "sss" sound.</li>
                            <li>❖ As you exhale, gently draw your pelvic floor upward and your deep lower belly (below the navel) inward — as if lifting a tissue and tightening a low corset.</li>
                            <li>❖ Pause. Inhale and let go completely. Repeat.</li>
                          </ul>
                          
                          <p className="text-sm"><strong>Used during:</strong> Most core-focused exercises, strength movements, transitions (getting up/down), and posture resets.</p>
                        </div>
                      </div>

                      {/* Right Column - Deep Core Hold & Ab Wraps */}
                      <div className="space-y-4">
                        <div className="bg-muted/50 p-4 rounded">
                          <h4 className="font-semibold text-primary mb-3">2. Deep Core Hold</h4>
                          <p className="text-sm mb-3"><strong>What it is:</strong> A gentle, sustained engagement of the deep core system (pelvic floor + transverse abdominis) held during movement or specific exercises for stability and control.</p>
                          
                          <p className="font-semibold text-sm mb-2">How to do it:</p>
                          <ul className="ml-4 space-y-1 text-sm mb-3">
                            <li>❖ Begin with a belly pump.</li>
                            <li>❖ Once you've exhaled and activated your core, maintain that gentle engagement for the duration of the movement.</li>
                            <li>❖ Keep breathing! You're not holding your breath — just keeping the core switched on while moving mindfully.</li>
                          </ul>
                          
                          <p className="text-sm mb-4"><strong>Used during:</strong> Functional movements like squats, pushing a stroller, lifting a baby, lunges, or resistance training.</p>
                        </div>

                        <div className="bg-muted/50 p-4 rounded">
                          <h4 className="font-semibold text-primary mb-3">3. Ab Wraps</h4>
                          <p className="text-sm mb-3"><strong>What it is:</strong> A visual and tactile cue that helps pregnant or postpartum women re-engage and re-align their abdominal wall. It's a technique used in breathing or movement patterns.</p>
                          
                          <p className="font-semibold text-sm mb-2">How to do it:</p>
                          <ul className="ml-4 space-y-1 text-sm mb-3">
                            <li>❖ Place your hands on your sides, just above the hip bones.</li>
                            <li>❖ As you exhale and perform a belly pump, draw the sides of your waist inward and wrapping them toward your midline — like zipping up a jacket from both sides toward the center.</li>
                            <li>❖ You may feel a gentle tightening and lift in your deep core as this happens.</li>
                          </ul>
                          
                          <p className="text-sm"><strong>Used during:</strong> Core exercises, posture work, and any movement requiring better core coordination and control (especially when there's doming or coning present).</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Topic 6: Understanding Kegels & Pelvic Floor Release */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">6</span>
                  <h3 className="text-[15px] font-semibold text-left">Understanding Kegels & Pelvic Floor Release</h3>
                </div>
                <div
                  onClick={() => toggleTopic('kegels-pelvic')}
                  className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center hover:from-pink-500 hover:to-pink-700 cursor-pointer transition-all duration-200"
                  style={{ 
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                    minHeight: '32px',
                    border: 'none !important', 
                    outline: 'none !important', 
                    boxShadow: '0 4px 8px rgba(236, 72, 153, 0.3) !important',
                    background: 'linear-gradient(to bottom right, rgb(244 114 182), rgb(219 39 119)) !important'
                  }}
                  data-testid="button-toggle-kegels-pelvic"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['kegels-pelvic'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expandedTopics['kegels-pelvic'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-5">
                    <p className="text-sm"><strong>Why this matters?</strong> Your pelvic floor is a key part of your core canister. It's not just about squeezing; it's about balance: knowing how to lift and how to let go.</p>
                    
                    {/* Pelvic Floor Image */}
                    <div className="flex justify-center my-6">
                      <div className="bg-white p-4 rounded-lg shadow-sm border max-w-2xl">
                        <img 
                          src={pelvicFloorImage} 
                          alt="Pelvic floor release position - woman sitting with proper posture"
                          className="w-full h-auto rounded"
                          data-testid="img-pelvic-floor"
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-muted/50 p-4 rounded">
                        <p className="font-semibold mb-2">What is a KEGEL?</p>
                        <p className="text-xs mb-2">A Kegel is the gentle activation of the pelvic floor muscles—think of stopping the flow of urine or lifting something small with your vagina.</p>
                        
                        <p className="font-semibold mb-1 text-xs">How to do a kegel with breath:</p>
                        <ul className="ml-4 list-disc text-xs space-y-1 mb-2">
                          <li><strong>Inhale</strong> – Let the ribs expand sideways. As you breathe in, let your pelvic floor soften and drop gently.</li>
                          <li><strong>Exhale</strong> – As you breathe out, gently lift the pelvic floor upward (imagine sipping a smoothie through a straw).</li>
                          <li><strong>Pause.</strong> Then repeat for 5–8 gentle reps.</li>
                          <li>🧘 Only do this once a day. Quality matters more than quantity.</li>
                        </ul>
                        
                        <p className="font-semibold mb-1 text-xs">🚫 Common mistakes to avoid:</p>
                        <ul className="ml-4 list-disc text-xs space-y-1">
                          <li>Holding your breath while squeezing</li>
                          <li>Clenching your glutes or inner thighs instead of the pelvic floor</li>
                          <li>Overdoing reps/creating tightness or fatigue</li>
                          <li>Never relaxing after a contraction</li>
                        </ul>
                      </div>
                      
                      <div className="bg-muted/50 p-4 rounded">
                        <p className="font-semibold mb-2">How to release the pelvic floor:</p>
                        <p className="text-xs mb-2">Sometimes what your pelvic floor really needs is to let go. Especially if you've:</p>
                        <ul className="ml-4 list-disc text-xs space-y-1 mb-2">
                          <li>Been holding tension (emotionally or physically)</li>
                          <li>Experienced painful intercourse, tightness, or heaviness</li>
                          <li>Tried Kegels and felt worse</li>
                        </ul>
                        
                        <p className="font-semibold mb-1 text-xs">Try This Daily Release Drill:</p>
                        <ul className="ml-4 list-disc text-xs space-y-1">
                          <li>Sit on a yoga block with your back supported against the wall. Bring your knees wide and let your arms rest gently on your thighs.</li>
                          <li>Take a slow inhale, feeling your ribs expand and your pelvic floor drop downward—as if traveling down 2 elevator levels.</li>
                          <li>On the exhale, lift the pelvic floor just back to its resting level (not above).</li>
                          <li>👉 Avoid gripping, clenching, or "doing" too much. You're training release, not strength here.</li>
                          <li>Repeat this for 5 full breaths, relaxing your jaw, face, and belly as much as possible.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Topic 7: When To Use Breathing + Core Activation */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">7</span>
                  <h3 className="text-[15px] font-semibold text-left">When To Use Breathing + Core Activation</h3>
                </div>
                <div
                  onClick={() => toggleTopic('when-to-use')}
                  className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center hover:from-pink-500 hover:to-pink-700 cursor-pointer transition-all duration-200"
                  style={{ 
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                    minHeight: '32px',
                    border: 'none !important', 
                    outline: 'none !important', 
                    boxShadow: '0 4px 8px rgba(236, 72, 153, 0.3) !important',
                    background: 'linear-gradient(to bottom right, rgb(244 114 182), rgb(219 39 119)) !important'
                  }}
                  data-testid="button-toggle-when-to-use"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['when-to-use'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expandedTopics['when-to-use'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-5">
                    {/* YouTube Link Button */}
                    <div className="flex justify-start mb-4">
                      <a 
                        href="https://www.youtube.com/watch?v=IxnoXYCtnUw" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md"
                        style={{
                          background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)',
                          boxShadow: '0 2px 6px rgba(236, 72, 153, 0.25)',
                          fontSize: '11px'
                        }}
                        data-testid="link-breathing-activation-video"
                      >
                        <Play className="w-2.5 h-2.5" />
                        When To Use Breathing + Core Activation
                      </a>
                    </div>

                    {/* Key Principle */}
                    <div className="bg-gradient-to-r from-green-50 to-yellow-50 p-4 rounded border-l-4 border-yellow-400">
                      <p className="font-semibold text-primary mb-2">Key Principle: 👉 "Exhale on effort."</p>
                      <p className="text-sm">When performing a hard part of any movement (like lifting, standing, pushing), breathe out while activating your core.</p>
                    </div>
                    
                    {/* When to Use List */}
                    <div className="space-y-3">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">❖</span>
                          <span>Before lifting (groceries, kids, weights).</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">❖</span>
                          <span>Before every exercise repetition (squats, lunges, rows, etc.).</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">❖</span>
                          <span>When changing positions (lying to sitting, sitting to standing).</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">❖</span>
                          <span>During pushing in labor (proper breath and core work helps massively).</span>
                        </li>
                      </ul>
                    </div>

                    {/* Common Mistakes */}
                    <div className="bg-red-50 p-4 rounded border-l-4 border-red-400">
                      <p className="font-semibold text-red-700 mb-3">Common Mistakes to Avoid:</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 font-bold">❖</span>
                          <span>Breath-holding (Valsalva maneuver) - can increase abdominal pressure dangerously.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 font-bold">❖</span>
                          <span>Belly-only breathing (causes poor rib and back engagement).</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 font-bold">❖</span>
                          <span>Over-bracing the core (hard sucking in can actually create more pressure & instability).</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 font-bold">❖</span>
                          <span>Neglecting pelvic floor coordination - pelvic floor must gently lift with the deep core, not bear down.</span>
                        </li>
                      </ul>
                    </div>

                    {/* What is doming or coning? */}
                    <div className="bg-pink-50 p-4 rounded border-l-4 border-pink-400">
                      <p className="font-semibold text-pink-700 mb-3">What is doming or coning?</p>
                      <p className="text-sm mb-3"><strong>Doming (also called coning)</strong> happens when your abdominal wall bulges outward along the midline during movement. It often shows up like a ridge or peak down the center of your belly—especially when lying down, lifting, or doing a crunch-like move.</p>
                      
                      {/* Doming Image */}
                      <div className="flex justify-center my-4">
                        <div className="bg-white p-2 rounded-lg shadow-sm border max-w-md">
                          <img 
                            src={domingImage} 
                            alt="Visual example of abdominal doming - showing the bulge along the midline"
                            className="w-full h-auto rounded"
                            data-testid="img-doming-example"
                          />
                        </div>
                      </div>
                      
                      <p className="font-semibold text-pink-700 mb-2">This means:</p>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-pink-600 font-bold">❖</span>
                          <span>Your deep core isn't managing pressure</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-600 font-bold">❖</span>
                          <span>The movement may be too advanced for your current strength</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-600 font-bold">❖</span>
                          <span>You need to regress the movement, breathe better, or reduce load</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Next Section Button */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="text-center">
          <div className="flex gap-4 justify-center">
            {canGoPrevious() && (
              <Button
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-2 text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2"
                data-testid="button-previous-section-core"
                onClick={navigateToPreviousTab}
              >
                <ChevronLeft className="w-4 h-4" />
                {getNavigationText('prev')}
              </Button>
            )}
            {canGoNext() && (
              <Button
                className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-2 text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2"
                data-testid="button-next-section-core"
                onClick={navigateToNextTab}
              >
                {getNavigationText('next')}
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Ready to start your healing journey? Let's begin with your daily core routine.
          </p>
        </div>
      </div>
    </div>
  );
}

        
        {/* Foundational Core Compressions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Foundational Core Compressions</CardTitle>
            <Badge variant="outline" className="mb-2 rounded-none px-4 py-2">Essential Tools</Badge>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
            <p>These are the 3 essential tools you'll use throughout your journey to connect to your deep core, support your spine, and move with intention.</p>
            <p className="font-semibold">Learn & Practice these!</p>
            
            
            <div className="space-y-4">
              {/* Belly Pump */}
              <div className="bg-muted/50 p-4 rounded">
                <p className="font-semibold mb-2">1. Belly Pump</p>
                <p className="text-xs mb-2"><strong>What it is:</strong> A coordinated breath and core activation technique used to gently engage your deep core muscles on the exhale. It helps retrain the body to stabilize before movement, without excessive pressure or strain.</p>
                <p className="text-xs mb-1"><strong>How to do it:</strong></p>
                <ul className="ml-4 list-disc text-xs space-y-1">
                  <li>Start in a neutral posture (seated, standing, or lying on your back with knees bent).</li>
                  <li>Inhale through your nose, letting your ribs expand 360° — belly, back, and sides.</li>
                  <li>Exhale through pursed lips or a gentle "shhh" or "sss" sound.</li>
                  <li>As you exhale, gently draw your pelvic floor upward and your deep lower belly (below the navel) inward — as if lifting a tissue and tightening a low corset.</li>
                  <li>Pause. Inhale and let go completely. Repeat.</li>
                </ul>
                <p className="text-xs mt-2"><strong>Used during:</strong> Most core-focused exercises, strength movements, transitions (getting up/down), and posture resets.</p>
              </div>
              
              {/* Deep Core Hold */}
              <div className="bg-muted/50 p-4 rounded">
                <p className="font-semibold mb-2">2. Deep Core Hold</p>
                <p className="text-xs mb-2"><strong>What it is:</strong> A gentle, sustained engagement of the deep core system (pelvic floor + transverse abdominis) held during movement or specific exercises for stability and control.</p>
                <p className="text-xs mb-1"><strong>How to do it:</strong></p>
                <ul className="ml-4 list-disc text-xs space-y-1">
                  <li>Begin with a belly pump.</li>
                  <li>Once you've exhaled and activated your core, maintain that gentle engagement for the duration of the movement.</li>
                  <li>Keep breathing! You're not holding your breath — just keeping the core switched on while moving mindfully.</li>
                </ul>
                <p className="text-xs mt-2"><strong>Used during:</strong> Functional movements like squats, pushing a stroller, lifting a baby, lunges, or resistance training.</p>
              </div>
              
              {/* Ab Wraps */}
              <div className="bg-muted/50 p-4 rounded">
                <p className="font-semibold mb-2">3. Ab Wraps</p>
                <p className="text-xs mb-2"><strong>What it is:</strong> A visual and tactile cue that helps pregnant or postpartum women re-engage and re-align their abdominal wall. It's a technique that mimics the wrapping in of the abdominals from the sides to the center, often used in breathing or movement patterns.</p>
                <p className="text-xs mb-1"><strong>How to do it:</strong></p>
                <ul className="ml-4 list-disc text-xs space-y-1">
                  <li>Place your hands on your sides, just above the hip bones.</li>
                  <li>As you exhale and perform a belly pump, imagine drawing the sides of your waist inward and wrapping them toward your midline — like zipping up a jacket from both sides toward the center.</li>
                  <li>You may feel a gentle tightening and lift in your deep core as this happens.</li>
                </ul>
                <p className="text-xs mt-2"><strong>Used during:</strong> Core exercises, posture work, and any movement requiring better core coordination and control (especially when there's doming or coning present).</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Understanding Kegels & Pelvic Floor Release */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Understanding Kegels & Pelvic Floor Release</CardTitle>
            <Badge variant="outline" className="mb-2 rounded-none px-4 py-2">Balance</Badge>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
            <p><strong>Why this matters?</strong> Your pelvic floor is a key part of your core canister. It's not just about squeezing; it's about balance: knowing how to lift and how to let go. A healthy pelvic floor can contract and release. Overusing Kegels or doing them without breath awareness can create more tension, not more strength.</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted/50 p-4 rounded">
                <p className="font-semibold mb-2">What is a KEGEL?</p>
                <p className="text-xs mb-2">A Kegel is the gentle activation of the pelvic floor muscles—think of stopping the flow of urine or lifting something small (like a blueberry) with your vagina. But Kegels are not just squeezing. True function comes from the ability to contract and release with control.</p>
                
                <p className="font-semibold mb-1 text-xs">How to do a kegel with breath:</p>
                <ul className="ml-4 list-disc text-xs space-y-1 mb-2">
                  <li><strong>Inhale</strong> – Let the ribs expand sideways. As you breathe in, let your pelvic floor soften and drop gently.</li>
                  <li><strong>Exhale</strong> – As you breathe out, gently lift the pelvic floor upward (imagine sipping a smoothie through a straw). Feel a rising sensation from the base of your core.</li>
                  <li><strong>Pause.</strong> Then repeat for 5–8 gentle reps.</li>
                  <li>🧘 Only do this once a day. Quality matters more than quantity.</li>
                </ul>
                
                <p className="font-semibold mb-1 text-xs">🚫 Common mistakes to avoid:</p>
                <ul className="ml-4 list-disc text-xs space-y-1">
                  <li>Holding your breath while squeezing</li>
                  <li>Clenching your glutes or inner thighs instead of the pelvic floor</li>
                  <li>Overdoing reps/creating tightness or fatigue</li>
                  <li>Never relaxing after a contraction</li>
                </ul>
              </div>
              
              <div className="bg-muted/50 p-4 rounded">
                <p className="font-semibold mb-2">How to release the pelvic floor:</p>
                <p className="text-xs mb-2">Sometimes what your pelvic floor really needs is to let go. Especially if you've:</p>
                <ul className="ml-4 list-disc text-xs space-y-1 mb-2">
                  <li>Been holding tension (emotionally or physically)</li>
                  <li>Experienced painful intercourse, tightness, or heaviness</li>
                  <li>Tried Kegels and felt worse</li>
                </ul>
                
                <p className="font-semibold mb-1 text-xs">Try This Daily Release Drill:</p>
                <p className="text-xs mb-1">This release can be done at the end of your workout or any time during the day.</p>
                <ul className="ml-4 list-disc text-xs space-y-1">
                  <li>Sit on a yoga block (or a firm book stack) with your back supported against the wall. Bring your knees wide—about chest height—and let your arms rest gently on your thighs. Allow your belly to soften.</li>
                  <li>Take a slow inhale, feeling your ribs expand and your pelvic floor drop downward—as if traveling down 2 elevator levels. Think of it as a gentle opening or blossoming sensation at the base of your core.</li>
                  <li>On the exhale, lift the pelvic floor just back to its resting level (not above).</li>
                  <li>👉 Avoid gripping, clenching, or "doing" too much. You're training release, not strength here.</li>
                  <li>Repeat this for 5 full breaths, relaxing your jaw, face, and belly as much as possible.</li>
                  <li>This daily practice will help reduce unnecessary pelvic tension, improve breath-led movement, and support your healing from the inside out.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* When to Use Breathing + Core Activation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">When to Use Breathing + Core Activation</CardTitle>
            <Badge variant="outline" className="mb-2 rounded-none px-4 py-2">Application</Badge>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
            <div className="bg-primary/10 p-4 rounded text-center">
              <p className="font-semibold">👉 Key Principle: "Exhale on effort."</p>
              <p className="text-xs mt-1">When performing a hard part of any movement (like lifting, standing, pushing), breathe out while activating your core.</p>
            </div>
            
            <div>
              <p className="font-semibold mb-2">Use this technique:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Before lifting (groceries, kids, weights).</li>
                <li>Before every exercise repetition (squats, lunges, rows, etc.).</li>
                <li>When changing positions (lying to sitting, sitting to standing).</li>
              </ul>
              
              
              <p className="text-xs mt-2">During pushing in labor (proper breath and core work helps massively).</p>
            </div>
            
            <div className="bg-red-50 p-4 rounded">
              <p className="font-semibold mb-2 text-red-700">Common Mistakes to Avoid:</p>
              <ul className="ml-4 list-disc text-xs space-y-1">
                <li>Breath-holding (Valsalva maneuver) - can increase abdominal pressure dangerously.</li>
                <li>Belly-only breathing (causes poor rib and back engagement).</li>
                <li>Over-bracing the core (hard sucking in can actually create more pressure & instability).</li>
                <li>Neglecting pelvic floor coordination - pelvic floor must gently lift with the deep core, not bear down.</li>
              </ul>
            </div>
            
            <div className="bg-muted/50 p-4 rounded">
              <p className="font-semibold mb-1">What is doming or coning?</p>
              <p className="text-xs">Doming (also called coning) happens when your abdominal wall bulges outward along the midline during movement. It often shows up like a ridge or peak down the center of your belly—especially when lying down and lifting your head or doing traditional "ab" exercises. This is a sign that your deep core isn't activating properly to manage pressure, and the movement needs to be modified or paused.</p>
            </div>
          </CardContent>
        </Card>

        {/* Diastasis Recti Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Do I Have Diastasis Recti?</CardTitle>
            <Badge variant="outline" className="mb-2 rounded-none px-4 py-2">Assessment</Badge>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
            <div className="bg-primary/10 p-4 rounded text-center">
              <p className="font-semibold text-sm">DON'T WORRY IF YOUR ABDOMINAL WALLS DON'T FULLY TOUCH — THAT'S NORMAL. FOCUS ON IMPROVING FUNCTION, NOT PERFECTION.</p>
            </div>
            
            
            <div className="bg-muted/50 p-4 rounded">
              <p className="font-semibold mb-2">How to Check:</p>
              <p className="mb-2">Lie on your back, knees bent, feet flat on the floor. Get comfortable & breathe naturally. Place one hand behind your head, and the other hand across your belly, with your fingers pointing down toward your navel. Make sure your fingers are together (not spread wide).</p>
              
              <ol className="ml-4 list-decimal space-y-2 text-xs">
                <li>Press your fingertips gently into your belly, just above your belly button. This is where we'll check the depth and width of any separation.</li>
                <li>Exhale & slowly lift your head & shoulders off the floor (just a small lift - around 2–3 inches). You should feel the two sides of your abdominal wall moving toward each other.</li>
                <li>Count how many fingers fit into the gap between your abdominal walls at the navel.</li>
                <li>Move your fingers above and below the belly button (around 2 inches in each direction) and repeat the lift to feel if the gap is larger or smaller there.</li>
                <li>Now test the depth: How far do your fingers sink into your abdomen?
                  <ul className="ml-4 list-disc mt-1 space-y-1">
                    <li>Does the tissue feel firm and springy (good tension)?</li>
                    <li>Or soft, deep, and hard to engage (poor tension)?</li>
                  </ul>
                </li>
              </ol>
              
              <p className="text-xs mt-3"><strong>Sample result:</strong> "2 fingers at the navel, 2 above, 1 below with moderate depth" This is helpful to note so you can track changes as the program progresses.</p>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded">
              <p className="font-semibold text-xs text-yellow-800 mb-1">Disclaimer:</p>
              <p className="text-xs text-yellow-700">If you notice a very large gap (more than 4 fingers), significant abdominal bulging, persistent pain, or feelings of instability in your core, back, or pelvis, this program alone may not be enough. Please consult a women's health physiotherapist or qualified healthcare provider before continuing. Your safety and long-term recovery come first.</p>
            </div>
          </CardContent>
        </Card>

        {/* Why Core Rehab Matters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Why Core Rehab Matters</CardTitle>
            <Badge variant="outline" className="mb-2 rounded-none px-4 py-2">Recovery</Badge>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
            <p>Even without visible DR, your core may feel disconnected, weak, or uncoordinated. That's where core rehab comes in. This isn't just about workouts—it's about making your core functional again for everything from lifting your baby to carrying groceries. The best part? You're retraining your whole body, not just your abs.</p>
            
            <div className="bg-primary/10 p-4 rounded text-center">
              <p className="font-semibold text-lg">IT'S NEVER TOO LATE TO HEAL ✨</p>
              <p className="text-xs mt-1">The core is trainable at any stage, and you are worthy of that healing. There's no expiration date on recovery. Let's start where you are.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold mb-2">Whether you're:</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>6 weeks postpartum</li>
                  <li>6 months into motherhood</li>
                  <li>Or even 6 years down the line</li>
                </ul>
                
                <p className="font-semibold mt-3 mb-2">As you continue through the program, we'll work to:</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Reduce the gap width (if present)</li>
                  <li>Improve tension & strength in the connective tissue</li>
                  <li>Enhance coordination between breath, core, and pelvic floor</li>
                </ul>
              </div>
              
              <div>
                <p className="font-semibold mb-2">Rebuilding your core helps you:</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Restore strength and stability</li>
                  <li>Prevent pain or injury</li>
                  <li>Improve posture and breathing</li>
                  <li>Reduce pelvic floor symptoms</li>
                  <li>Feel more confident and connected</li>
                </ul>
                
                <p className="font-semibold mt-3 mb-2">Many women see noticeable improvement in:</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Core connection</li>
                  <li>Diastasis recti</li>
                  <li>Pelvic floor symptoms</li>
                  <li>Strength and balance</li>
                  <li>Confidence and energy</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>


// Core Program Components

function ProgramsSection({ 
  canGoNext, 
  canGoPrevious, 
  navigateToNextTab, 
  navigateToPreviousTab,
  getNavigationText 
}: NavigationProps) {
  const [expandedPrograms, setExpandedPrograms] = useState<Record<string, boolean>>({});

  const toggleProgram = (programId: string) => {
    setExpandedPrograms(prev => ({
      ...prev,
      [programId]: !prev[programId]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Programs Section Title */}
      <div className="mb-8 text-left">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">
          Programs
        </h2>
        <p className="text-sm font-medium text-gray-600 border-l-4 border-purple-400 pl-4 bg-gradient-to-r from-purple-50 to-transparent py-2">
          Your comprehensive six week postnatal fitness journey programs
        </p>
      </div>

      {/* Community Support Section - Separate from Programs */}
      <div className="mb-12">
        {/* White Container with Shadow */}
        <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-100">
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full mb-3">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
            </svg>
            <span className="text-green-600 font-semibold text-sm">COMMUNITY SUPPORT ADD-ON</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Want Extra Support on Your Journey?</h2>
          <p className="text-gray-600 text-sm">Join our exclusive WhatsApp community for guidance, motivation, and celebration with fellow moms</p>
        </div>

        {/* WhatsApp Community Card - Collapsible */}
        <Card className="overflow-hidden border-2 border-green-300 shadow-xl bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl">
          <CardHeader 
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 cursor-pointer transition-all duration-300 relative overflow-hidden"
            onClick={() => toggleProgram('whatsapp-community')}
          >
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
              <div className="absolute top-1/2 left-1/4 w-6 h-6 bg-white rounded-full"></div>
            </div>
            
            <div className="relative z-10">
              {/* Mobile Layout */}
              <div className="block lg:hidden">
                {/* WhatsApp Badge on top */}
                <div className="mb-4">
                  <div className="bg-gradient-to-r from-white to-blue-50 text-green-600 px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap shadow-lg border-2 border-green-200 inline-block">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                      </svg>
                      <span>WHATSAPP COMMUNITY</span>
                    </div>
                  </div>
                </div>
                
                {/* Title and Description */}
                <div className="mb-4">
                  <div className="text-white font-bold text-lg tracking-tight drop-shadow-md mb-2 leading-tight">
                    Community Support
                  </div>
                  <div className="text-green-100 font-medium text-sm drop-shadow-sm leading-relaxed">
                    Get guidance, motivation & celebrate wins with Zoe + coaches
                  </div>
                </div>
                
                {/* Price and dropdown */}
                <div className="flex items-center justify-between">
                  <div className="bg-white bg-opacity-20 px-4 py-3 rounded-xl backdrop-blur-sm border border-white border-opacity-30">
                    <div className="text-green-100 font-bold text-xs uppercase tracking-wide mb-1">3 Months Access</div>
                    <div className="text-white font-bold text-xl">₹1000</div>
                  </div>
                  <div className="w-10 h-10 bg-white text-green-600 rounded-full flex items-center justify-center shadow-xl flex-shrink-0 border-2 border-white">
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedPrograms['whatsapp-community'] ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden lg:flex lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0 pr-2">
                  <div className="bg-gradient-to-r from-white to-blue-50 text-green-600 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap shadow-lg border-2 border-green-200 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                      </svg>
                      <span>WHATSAPP COMMUNITY</span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 py-2">
                    <CardTitle className="text-2xl text-white font-bold tracking-tight drop-shadow-md leading-tight">
                      Community Support Add-On
                    </CardTitle>
                    <CardDescription className="text-green-100 font-semibold text-base mt-2 drop-shadow-sm leading-tight">
                      Get guidance, motivation & celebrate wins with Zoe + coaches
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right bg-white bg-opacity-20 px-4 py-3 rounded-lg backdrop-blur-sm border border-white border-opacity-30">
                    <div className="text-sm text-green-100 font-bold uppercase tracking-wide">3 Months Access</div>
                    <div className="text-lg text-white font-bold">₹1000</div>
                  </div>
                  <div className="w-10 h-10 bg-white text-green-600 rounded-full flex items-center justify-center shadow-xl flex-shrink-0 border-2 border-white">
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedPrograms['whatsapp-community'] ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          {expandedPrograms['whatsapp-community'] && (
            <CardContent className="p-6 border-t border-blue-100">
              <div className="space-y-6">
                {/* Hero Description */}
                <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-xl font-bold text-green-600 mb-3">
                    💙 Your Safe Space for Support & Celebration
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Healing your core is powerful — but doing it with a community of moms (and with Zoe + her team cheering you on) makes it so much more fun! This isn't just another WhatsApp group... it's your safe space to share progress, ask questions, and stay motivated.
                  </p>
                  <div className="inline-flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full">
                    <span className="text-green-600 font-semibold">EXCLUSIVE ACCESS</span>
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.293 10.793a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Benefits Grid - Responsive */}
                <div className="grid md:grid-cols-2 gap-6">
                  
                  {/* What You'll Get Inside */}
                  <div className="bg-white border border-green-200 rounded-lg p-5">
                    <h4 className="text-lg font-bold text-green-600 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      What You'll Get Inside
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                        <div>
                          <strong>Zoe + Coaches in the Group</strong> - Direct access to guidance, motivation, and occasional "pep talks."
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                        <div>
                          <strong>Community Energy</strong> - You'll be surrounded by moms just like you — starting, restarting, and celebrating wins.
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                        <div>
                          <strong>Accountability Made Easy</strong> - Stay consistent with reminders, challenges, and check-ins.
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                        <div>
                          <strong>The Real Talk Space</strong> - Where you can share struggles (yes, even the messy ones) and get support without judgment.
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                        <div>
                          <strong>Tips & Surprises</strong> - Expect quick hacks, fun challenges, and mini-celebrations along the way.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Who Is It For */}
                  <div className="bg-white border border-green-200 rounded-lg p-5">
                    <h4 className="text-lg font-bold text-green-600 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                      </svg>
                      Who Is It For
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                        <div>You've started Heal Your Core and want ongoing support</div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                        <div>You're unsure if you're 'doing it right' and want guidance</div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                        <div>You love being part of a tribe that celebrates wins together</div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                        <div>You want to stay consistent and actually finish the program</div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                        <div>You value having expert answers at your fingertips</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How It Works */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-green-200 rounded-lg p-5">
                  <h4 className="text-lg font-bold text-green-600 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                    </svg>
                    How It Works
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                        <div>Pay ₹1000 for 3 months access</div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                        <div>Select and purchase your 3-month WhatsApp Community Support add-on</div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                        <div>Receive your exclusive invite link to the private group (This may take a few days)</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                        <div>Join anytime — whether you're on Day 1 or Week 6 of your Heal My Core journey</div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">5</div>
                        <div>A Community Coach helps manage the group to keep it useful, supportive, and positive</div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">6</div>
                        <div>Renew if you'd like to continue beyond your first 3 months</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="text-center bg-white border-2 border-green-300 rounded-lg p-6">
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-green-600 mb-2">₹1000</div>
                    <div className="text-gray-600 text-sm mb-1">3 months of community support</div>
                    <p className="text-gray-500 text-xs">Join your supportive community of moms today!</p>
                  </div>
                  <Button 
                    onClick={() => window.open('https://www.strongerwithzoe.in/products/pwz-postnatal-heal-your-core', '_blank')}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2 w-full sm:w-auto"
                    data-testid="button-join-whatsapp-community"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                    </svg>
                    <span className="hidden sm:inline">Join WhatsApp Community</span>
                    <span className="sm:hidden">Join Community</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
        </div> {/* End White Container */}
      </div>
      
      {/* 6-Week Program - Collapsible */}
      <Card className="overflow-hidden border-l-4 border-program-1 shadow-xl">
        <CardHeader 
          className="program-1-gradient hover:program-1-gradient-hover cursor-pointer transition-all duration-300 relative overflow-hidden"
          onClick={() => toggleProgram('6-week-program')}
        >
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
          </div>
          
          <div className="relative z-10">
            {/* Mobile Layout */}
            <div className="block lg:hidden">
              {/* Program Badge on top */}
              <div className="mb-3">
                <div className="bg-gradient-to-r from-white to-gray-50 text-pink-600 px-3 py-2 rounded-xl font-bold text-xs whitespace-nowrap shadow-lg border-2 border-pink-200 inline-block">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse"></div>
                    PROGRAM 1
                  </div>
                </div>
              </div>
              
              {/* Title and Description */}
              <div className="mb-3">
                <div className="text-white font-bold text-sm tracking-tight drop-shadow-md mb-1">
                  Postpartum Strength Recovery Program
                </div>
                <div className="text-pink-100 font-normal text-xs drop-shadow-sm">
                  ✨ 6-week comprehensive postnatal fitness journey
                </div>
              </div>
              
              {/* Info box and dropdown */}
              <div className="flex items-center justify-between">
                <div className="bg-white bg-opacity-10 px-3 py-2 rounded-lg backdrop-blur-sm flex-1 mr-3">
                  <div className="text-xs text-pink-100 font-bold uppercase tracking-wide">Comprehensive Program</div>
                  <div className="text-xs text-white font-medium">Core rehabilitation & strength building</div>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-white to-pink-100 text-pink-600 rounded-full flex items-center justify-center shadow-xl flex-shrink-0 border-2 border-white">
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedPrograms['6-week-program'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0 pr-2">
                <div className="bg-gradient-to-r from-white to-gray-50 text-pink-600 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap shadow-lg border-2 border-pink-200 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                    <span>PROGRAM 1</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1 py-2">
                  <CardTitle className="text-2xl text-white font-bold tracking-tight drop-shadow-md leading-tight">
                    Postpartum Strength Recovery Program
                  </CardTitle>
                  <CardDescription className="text-pink-100 font-semibold text-base mt-2 drop-shadow-sm leading-tight">
                    ✨ 6-week comprehensive postnatal fitness journey
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right bg-white bg-opacity-10 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <div className="text-sm text-pink-100 font-bold uppercase tracking-wide">Comprehensive Program</div>
                  <div className="text-sm text-white font-medium">Core rehabilitation & strength building</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-white to-pink-100 text-pink-600 rounded-full flex items-center justify-center shadow-xl flex-shrink-0 border-2 border-white">
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedPrograms['6-week-program'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        {expandedPrograms['6-week-program'] && (
          <CardContent className="p-6 border-t border-pink-100">
            <div className="space-y-8">
              {/* Program 1 - Week 1 */}
              <Card className="overflow-hidden border-l-4 border-l-pink-400">
                <CardHeader className="bg-gradient-to-r from-pink-25 to-rose-25">
                  {/* Mobile Layout */}
                  <div className="block lg:hidden">
                    {/* Week Badge */}
                    <div className="mb-4">
                      <div className="program-1-section text-white px-3 py-2 rounded-lg font-bold text-xs whitespace-nowrap inline-block shadow-lg">
                        WEEK 1
                      </div>
                    </div>
                    
                    {/* Program Title */}
                    <div className="mb-3">
                      <CardTitle className="text-base text-gray-900 font-bold mb-2">PROGRAM 1 - RECONNECT & RESET</CardTitle>
                      <CardDescription className="text-pink-600 font-semibold text-sm">Workout Schedule: 4x per week</CardDescription>
                      <p className="text-xs text-gray-600 mt-1">Complete on Days 1, 3, 5, and 7 of each week</p>
                    </div>
                    
                    {/* Equipment Section */}
                    <div>
                      <div className="text-xs text-gray-700 font-bold uppercase tracking-wide mb-2">Equipment Needed</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-green-100 text-blue-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Mini band</span>
                        <span className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Small Pilates ball</span>
                        <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Mat</span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:flex lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="program-1-section text-white px-3 py-1 rounded font-semibold text-sm whitespace-nowrap">
                        WEEK 1
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg text-gray-900">PROGRAM 1 - RECONNECT & RESET</CardTitle>
                        <CardDescription className="text-pink-600 font-semibold text-sm">Workout Schedule: 4x per week</CardDescription>
                        <p className="text-xs text-gray-600 mt-1">Complete on Days 1, 3, 5, and 7 of each week</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Equipment Needed</div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <span className="bg-green-100 text-blue-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Mini band</span>
                        <span className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Small Pilates ball</span>
                        <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Mat</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="mb-4">
                    <div className="bg-pink-50 p-4 rounded-xl border-l-4 border-pink-400 shadow-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                          <span className="text-pink-700 font-bold text-sm uppercase tracking-wide">Coach's Note</span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed pl-4">
                          This is your foundation. Focus on breath, posture, and gentle reconnection with your core and pelvic floor.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Part 1: Breathing */}
                  <div className="mb-6">
                    <div className="program-1-section p-3 rounded-t-lg">
                      <div className="flex items-center gap-2">

                        <h4 className="font-bold text-white text-sm uppercase tracking-wide">Part 1: 360° Breathing</h4>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-b-lg border border-green-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-blue-800 font-semibold underline cursor-pointer text-sm">Morning + Evening Sessions</span>
                        <span className="text-blue-700 font-bold text-sm bg-green-100 px-3 py-1 rounded-full">25 breaths</span>
                      </div>
                    </div>
                  </div>

                  {/* Part 2: Main Workout */}
                  <div className="mb-6">
                    <div className="program-1-section p-3 rounded-t-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2">
  
                          <h4 className="font-bold text-white text-sm uppercase tracking-wide">Part 2: Main Workout (3 Rounds)</h4>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg self-start sm:self-center">
                          <Play className="w-4 h-4" />
                          <a href="https://www.youtube.com/playlist?list=PLlZC5Vz4VnBRRdU7wvzJJZVxw4E6sN-fb" target="_blank" rel="noopener noreferrer">
                            PLAY ALL
                          </a>
                        </Button>
                      </div>
                    </div>

                    <div className="bg-white rounded-b-lg border border-gray-200 p-4">

                      <div className="space-y-3">
                        {[
                          { num: 1, name: "KNEELING MINI BAND PULL APARTS", reps: "12 reps", url: "https://www.youtube.com/watch?v=jiz7-6nJvjY" },
                          { num: 2, name: "QUADRUPED BALL COMPRESSIONS", reps: "10 reps", url: "https://www.youtube.com/watch?v=1QukYQSq0oQ" },
                          { num: 3, name: "SUPINE HEEL SLIDES", reps: "10 reps", url: "https://www.youtube.com/watch?v=AIEdkm2q-4k" },
                          { num: 4, name: "GLUTE BRIDGES WITH MINI BALL", reps: "15 reps", url: "https://www.youtube.com/watch?v=1vqv8CqCjY0" },
                          { num: 5, name: "BUTTERFLY STRETCH — DYNAMIC FLUTTER", reps: "1 min", url: "https://www.youtube.com/watch?v=j5ZGvn1EUTo" }
                        ].map((exercise) => (
                          <div key={exercise.num} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-400 hover:bg-blue-50 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                                  {exercise.num}
                                </div>
                                <a 
                                  href={exercise.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:text-blue-800 underline font-semibold leading-tight text-sm"
                                >
                                  {exercise.name}
                                </a>
                              </div>
                              <div className="text-gray-700 font-bold text-sm bg-white px-3 py-1.5 rounded-full border flex-shrink-0">
                                {exercise.reps} ×3
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>


                  {/* How to Section */}
                  <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <h4 className="font-bold text-blue-800 text-sm uppercase tracking-wide">How To Use</h4>
                      </div>
                      <div className="pl-4 space-y-3">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          All <span className="text-green-600 underline font-medium">blue underlined text</span> is clickable and will open a video link. 
                          <span className="font-semibold"> PLAY ALL</span> indicates that the following workout can be played as a single 
                          playlist containing all the exercises to make it easier to flow through. However, please have listened to each exercise instruction beforehand.
                        </p>
                        <div className="bg-green-100 p-3 rounded-lg">
                          <p className="text-blue-800 text-sm font-medium">
                            <span className="font-bold">Rest:</span> Rest a minimum of 30 secs - ONE minute between movements. Rest more if needed.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tips before you begin */}
                  <div className="bg-green-50 p-4 rounded-xl border-l-4 border-green-500 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <h4 className="font-bold text-green-800 text-sm uppercase tracking-wide">Essential Tips</h4>
                      </div>
                      <div className="pl-4 space-y-3 text-sm text-gray-700">
                        <div className="flex items-start gap-3">
                          <span className="text-green-600 font-bold text-base flex-shrink-0">✓</span>
                          <span><span className="font-semibold text-green-800">Breathe First, Move Second:</span> Every movement begin with deep exhale and gentle core engagement.</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-green-600 font-bold text-base flex-shrink-0">✓</span>
                          <span><span className="font-semibold text-green-800">Feel, Don't Force:</span> The goal is to feel supported - not strained. If something feels off, pause, or regress.</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-green-600 font-bold text-base flex-shrink-0">✓</span>
                          <span><span className="font-semibold text-green-800">One Round Still Progress:</span> Don't skip a session just because you don't have time for all rounds.</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-green-600 font-bold text-base flex-shrink-0">✓</span>
                          <span><span className="font-semibold text-green-800">Doming, Heaviness, or Leaking?</span> Stop & regress to earlier exercises. That's your body's way of asking.</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-green-600 font-bold text-base flex-shrink-0">✓</span>
                          <span><span className="font-semibold text-green-800">Stay Consistent, Not Perfect:</span> Progress comes from showing up—even imperfectly.</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-green-600 font-bold text-base flex-shrink-0">✓</span>
                          <span><span className="font-semibold text-green-800">Hydrate, Rest, Nourish:</span> Give your body the care parts of your recovery too.</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-green-600 font-bold text-base flex-shrink-0">✓</span>
                          <span><span className="font-semibold text-green-800">Avoid Overexertion:</span> Stop immediately if you feel dizzy, nauseous, or overly fatigued.</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-green-600 font-bold text-base flex-shrink-0">✓</span>
                          <span><span className="font-semibold text-green-800">Consult Your Doctor:</span> Always consult with your healthcare provider before continuing with exercises.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Precautions */}
                  <div className="bg-red-50 p-4 rounded-xl border-l-4 border-red-500 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <h4 className="font-bold text-red-800 text-sm uppercase tracking-wide">Important Safety</h4>
                      </div>
                      <div className="pl-4 bg-red-100 p-3 rounded-lg">
                        <p className="text-red-800 text-sm leading-relaxed">
                          <span className="font-semibold">Listen to Your Body:</span> Always pay attention to how you feel and adjust accordingly. | 
                          <span className="font-semibold">Take Options Given:</span> Utilize the modifications provided to suit your comfort level. | 
                          <span className="font-semibold">Reduce Reps/Rounds:</span> Don't hesitate to reduce the number of repetitions or rounds if needed. | 
                          <span className="font-semibold">Adjust Weights:</span> Opt for lighter weights or no weights at all if you feel any discomfort. | 
                          <span className="font-semibold">Stay Hydrated:</span> Keep water close by and drink frequently to stay hydrated. | 
                          <span className="font-semibold">Avoid Overexertion:</span> Stop immediately if you feel dizzy, nauseous, or overly fatigued. | 
                          <span className="font-semibold">Consult Your Doctor:</span> Always consult with your healthcare provider before continuing with the exercises.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </CardContent>
        )}
      </Card>

      {/* Program 2 - Advanced Strength & Conditioning */}
      <Card className="overflow-hidden border-l-4 border-program-2 shadow-xl">
        <CardHeader 
          className="program-2-gradient hover:program-2-gradient-hover cursor-pointer transition-all duration-300 relative overflow-hidden"
          onClick={() => toggleProgram('advanced-program')}
        >
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
          </div>
          
          <div className="relative z-10">
            {/* Mobile Layout */}
            <div className="block lg:hidden">
              {/* Program Badge on top */}
              <div className="mb-3">
                <div className="bg-gradient-to-r from-white to-gray-50 text-green-600 px-3 py-2 rounded-xl font-bold text-xs whitespace-nowrap shadow-lg border-2 border-green-200 inline-block">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                    PROGRAM 2
                  </div>
                </div>
              </div>
              
              {/* Title and Description */}
              <div className="mb-3">
                <div className="text-white font-bold text-sm tracking-tight drop-shadow-md mb-1">
                  Advanced Strength & Conditioning Program
                </div>
                <div className="text-base font-medium text-green-100 drop-shadow-sm">
                  Six Week Advanced Postnatal Fitness Journey
                </div>
              </div>
              
              {/* Info box and dropdown */}
              <div className="flex items-center justify-between">
                <div className="bg-white bg-opacity-10 px-3 py-2 rounded-lg backdrop-blur-sm flex-1 mr-3">
                  <div className="text-xs text-green-100 font-bold uppercase tracking-wide">Advanced Program</div>
                  <div className="text-xs text-white font-medium">Strength building & conditioning</div>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-white to-blue-100 text-green-600 rounded-full flex items-center justify-center shadow-xl flex-shrink-0 border-2 border-white">
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedPrograms['advanced-program'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0 pr-2">
                <div className="bg-gradient-to-r from-white to-gray-50 text-green-600 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap shadow-lg border-2 border-green-200 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>PROGRAM 2</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1 py-2">
                  <CardTitle className="text-2xl text-white font-bold tracking-tight drop-shadow-md leading-tight">
                    Advanced Strength & Conditioning Program
                  </CardTitle>
                  <CardDescription className="text-base font-medium text-green-100 mt-2 drop-shadow-sm leading-tight">
                    Six Week Advanced Postnatal Fitness Journey
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right bg-white bg-opacity-10 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <div className="text-sm text-green-100 font-bold uppercase tracking-wide">Advanced Program</div>
                  <div className="text-sm text-white font-medium">Strength building & conditioning</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-white to-blue-100 text-green-600 rounded-full flex items-center justify-center shadow-xl flex-shrink-0 border-2 border-white">
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedPrograms['advanced-program'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        {expandedPrograms['advanced-program'] && (
          <CardContent className="p-6 border-t border-blue-100">
            <div className="space-y-8">
              {/* Program 2 - Week 2 */}
              <Card className="overflow-hidden border-l-4 border-l-cyan-400">
                <CardHeader className="bg-gradient-to-r from-cyan-25 to-blue-25">
                  {/* Mobile Layout */}
                  <div className="block lg:hidden">
                    {/* Week Badge */}
                    <div className="mb-4">
                      <div className="program-2-section text-white px-3 py-2 rounded-lg font-bold text-xs whitespace-nowrap inline-block shadow-lg">
                        WEEK 2
                      </div>
                    </div>
                    
                    {/* Program Title */}
                    <div className="mb-3">
                      <CardTitle className="text-base text-gray-900 font-bold mb-2">PROGRAM 2 - STABILITY & BREATHWORK</CardTitle>
                      <CardDescription className="text-cyan-600 font-semibold text-sm">Workout Schedule: 3x per week</CardDescription>
                      <p className="text-xs text-gray-600 mt-1">Complete on Days 1, 3, and 5 of each week</p>
                    </div>
                    
                    {/* Equipment Section */}
                    <div>
                      <div className="text-xs text-gray-700 font-bold uppercase tracking-wide mb-2">Equipment Needed</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Mat</span>
                        <span className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Your breath</span>
                        <span className="bg-pink-100 text-pink-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Patience</span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:flex lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="program-2-section text-white px-3 py-1 rounded font-semibold text-sm whitespace-nowrap">
                        WEEK 2
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg text-gray-900">PROGRAM 2 - STABILITY & BREATHWORK</CardTitle>
                        <CardDescription className="text-cyan-600 font-semibold text-sm">Workout Schedule: 3x per week</CardDescription>
                        <p className="text-xs text-gray-600 mt-1">Complete on Days 1, 3, and 5 of each week</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Equipment Needed</div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Mat</span>
                        <span className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Your breath</span>
                        <span className="bg-pink-100 text-pink-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Patience</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="mb-4">
                    <div className="bg-cyan-50 p-4 rounded-xl border-l-4 border-cyan-400 shadow-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                          <span className="text-cyan-700 font-bold text-sm uppercase tracking-wide">Coach's Note</span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed pl-4">
                          Now that you've laid the foundation, we begin layering in simple movements with control. Move slowly, focus on quality, and stay aware of your body's signals.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Part 1: Core & Breath Reset */}
                  <div className="mb-6">
                    <div className="program-2-section p-3 rounded-t-lg">
                      <div className="flex items-center gap-2">

                        <h4 className="font-bold text-white text-sm uppercase tracking-wide">Part 1: Core & Breath Reset Flow</h4>
                      </div>
                    </div>
                    <div className="bg-cyan-50 p-4 rounded-b-lg border border-cyan-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-cyan-800 font-semibold underline cursor-pointer text-sm">
                          <a href="https://www.youtube.com/watch?v=SrEKb2TMLzA" target="_blank" rel="noopener noreferrer">
                            3 Part Core & Breath Reset Flow
                          </a>
                        </span>
                        <span className="text-cyan-700 font-bold text-sm bg-cyan-100 px-3 py-1 rounded-full">10 breaths each</span>
                      </div>
                    </div>
                  </div>

                  {/* Part 2: Main Workout */}
                  <div className="mb-6">
                    <div className="program-2-section p-3 rounded-t-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2">
  
                          <h4 className="font-bold text-white text-sm uppercase tracking-wide">Part 2: Main Workout (3 Rounds)</h4>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg self-start sm:self-center">
                          <Play className="w-4 h-4" />
                          <a href="https://www.youtube.com/playlist?list=PLlZC5Vz4VnBQt0XPv_nXdA-vFisde58u1" target="_blank" rel="noopener noreferrer">
                            PLAY ALL
                          </a>
                        </Button>
                      </div>
                    </div>

                    <div className="bg-white rounded-b-lg border border-gray-200 p-4">
                      <div className="space-y-3">
                        {[
                          { num: 1, name: "SUPINE ALT LEG MARCHES", reps: "10 reps", url: "https://www.youtube.com/watch?v=T8HHp4KXpJI" },
                          { num: 2, name: "SUPINE CROSS LATERAL KNEE PRESSES", reps: "10 reps", url: "https://www.youtube.com/watch?v=AyVuVB0oneo" },
                          { num: 3, name: "DEADBUG LEG MARCH ARM EXTENSIONS", reps: "10 reps", url: "https://www.youtube.com/watch?v=iKrou6hSgmg" },
                          { num: 4, name: "ELBOW KNEE SIDE PLANK LIFTS", reps: "10 reps", url: "https://www.youtube.com/watch?v=zaOToxvSk6g" },
                          { num: 5, name: "WISHBONE STRETCH", reps: "30 secs each side", url: "https://www.youtube.com/watch?v=Pd2le_I4bFE" }
                        ].map((exercise) => (
                          <div key={exercise.num} className="bg-gray-50 rounded-lg p-4 border-l-4 border-cyan-400 hover:bg-cyan-50 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                                  {exercise.num}
                                </div>
                                <a 
                                  href={exercise.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-cyan-600 hover:text-cyan-800 underline font-semibold leading-tight text-sm"
                                >
                                  {exercise.name}
                                </a>
                              </div>
                              <div className="text-gray-700 font-bold text-sm bg-white px-3 py-1.5 rounded-full border flex-shrink-0">
                                {exercise.reps} ×3
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* How to Section */}
                  <div className="bg-cyan-50 p-4 rounded-xl border-l-4 border-cyan-500 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                        <h4 className="font-bold text-cyan-800 text-sm uppercase tracking-wide">How To Use</h4>
                      </div>
                      <div className="pl-4 space-y-3">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          All <span className="text-cyan-600 underline font-medium">blue underlined text</span> is clickable and will open a video link. 
                          <span className="font-semibold"> PLAY ALL</span> indicates that the following workout can be played as a single 
                          playlist containing all the exercises to make it easier to flow through. However, please have listened to each exercise instruction beforehand.
                        </p>
                        <div className="bg-cyan-100 p-3 rounded-lg">
                          <p className="text-cyan-800 text-sm font-medium">
                            <span className="font-bold">Rest:</span> Rest a minimum of 30 secs - ONE minute between movements. Rest more if needed.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Precautions */}
                  <div className="bg-yellow-50 p-4 rounded-xl border-l-4 border-yellow-500 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <h4 className="font-bold text-yellow-800 text-sm uppercase tracking-wide">Important Safety</h4>
                      </div>
                      <div className="pl-4 bg-yellow-100 p-3 rounded-lg">
                        <p className="text-yellow-800 text-sm leading-relaxed">
                          <span className="font-semibold">Listen to Your Body:</span> Always pay attention to how you feel and adjust accordingly. | 
                          <span className="font-semibold">Take Options Given:</span> Utilize the modifications provided to suit your comfort level. | 
                          <span className="font-semibold">Reduce Reps/Rounds:</span> Don't hesitate to reduce the number of repetitions or rounds if needed. | 
                          <span className="font-semibold">Stay Hydrated:</span> Keep water close by and drink frequently to stay hydrated. | 
                          <span className="font-semibold">Avoid Overexertion:</span> Stop immediately if you feel dizzy, nauseous, or overly fatigued. | 
                          <span className="font-semibold">Consult Your Doctor:</span> Always consult with your healthcare provider before continuing with the exercises.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Program 3 - Control & Awareness */}
      <Card className="overflow-hidden border-l-4 border-program-3 shadow-xl">
        <CardHeader 
          className="program-3-gradient hover:program-3-gradient-hover cursor-pointer transition-all duration-300 relative overflow-hidden"
          onClick={() => toggleProgram('control-awareness-program')}
        >
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
          </div>
          
          <div className="relative z-10">
            {/* Mobile Layout */}
            <div className="block lg:hidden">
              {/* Program Badge on top */}
              <div className="mb-3">
                <div className="bg-gradient-to-r from-white to-gray-50 text-green-600 px-3 py-2 rounded-xl font-bold text-xs whitespace-nowrap shadow-lg border-2 border-green-200 inline-block">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    PROGRAM 3
                  </div>
                </div>
              </div>
              
              {/* Title and Description */}
              <div className="mb-3">
                <div className="text-white font-bold text-sm tracking-tight drop-shadow-md mb-1">
                  Control & Awareness Program
                </div>
                <div className="text-base font-medium text-green-100 drop-shadow-sm">
                  Six Week Control And Awareness Fitness Journey
                </div>
              </div>
              
              {/* Info box and dropdown */}
              <div className="flex items-center justify-between">
                <div className="bg-white bg-opacity-10 px-3 py-2 rounded-lg backdrop-blur-sm flex-1 mr-3">
                  <div className="text-xs text-green-100 font-bold uppercase tracking-wide">Control Program</div>
                  <div className="text-xs text-white font-medium">Balance & core awareness</div>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-white to-green-100 text-green-600 rounded-full flex items-center justify-center shadow-xl flex-shrink-0 border-2 border-white">
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedPrograms['control-awareness-program'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0 pr-2">
                <div className="bg-gradient-to-r from-white to-gray-50 text-green-600 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap shadow-lg border-2 border-green-200 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>PROGRAM 3</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1 py-2">
                  <CardTitle className="text-2xl text-white font-bold tracking-tight drop-shadow-md leading-tight">
                    Control & Awareness Program
                  </CardTitle>
                  <CardDescription className="text-base font-medium text-green-100 mt-2 drop-shadow-sm leading-tight">
                    Six Week Control And Awareness Fitness Journey
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right bg-white bg-opacity-10 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <div className="text-sm text-green-100 font-bold uppercase tracking-wide">Control Program</div>
                  <div className="text-sm text-white font-medium">Balance & core awareness</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-white to-green-100 text-green-600 rounded-full flex items-center justify-center shadow-xl flex-shrink-0 border-2 border-white">
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedPrograms['control-awareness-program'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        {expandedPrograms['control-awareness-program'] && (
          <CardContent className="p-6 border-t border-green-100">
            <div className="space-y-8">
              {/* Program 3 - Week 3 */}
              <Card className="overflow-hidden border-l-4 border-l-emerald-400">
                <CardHeader className="bg-gradient-to-r from-emerald-25 to-green-25">
                  {/* Mobile Layout */}
                  <div className="block lg:hidden">
                    {/* Week Badge */}
                    <div className="mb-4">
                      <div className="program-3-section text-white px-3 py-2 rounded-lg font-bold text-xs whitespace-nowrap inline-block shadow-lg">
                        WEEK 3
                      </div>
                    </div>
                    
                    {/* Program Title */}
                    <div className="mb-3">
                      <CardTitle className="text-base text-gray-900 font-bold mb-2">PROGRAM 3 - CONTROL & AWARENESS</CardTitle>
                      <CardDescription className="text-emerald-600 font-semibold text-sm">Workout Schedule: 3x per week</CardDescription>
                      <p className="text-xs text-gray-600 mt-1">Complete on Days 2, 4, and 6 of each week</p>
                    </div>
                    
                    {/* Equipment Section */}
                    <div>
                      <div className="text-xs text-gray-700 font-bold uppercase tracking-wide mb-2">Equipment Needed</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Resistance band (light)</span>
                        <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Mat</span>
                        <span className="bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Optional yoga block</span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:flex lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="program-3-section text-white px-3 py-1 rounded font-semibold text-sm whitespace-nowrap">
                        WEEK 3
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg text-gray-900">PROGRAM 3 - CONTROL & AWARENESS</CardTitle>
                        <CardDescription className="text-emerald-600 font-semibold text-sm">Workout Schedule: 3x per week</CardDescription>
                        <p className="text-xs text-gray-600 mt-1">Complete on Days 2, 4, and 6 of each week</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Equipment Needed</div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <span className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Resistance band (light)</span>
                        <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Mat</span>
                        <span className="bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Optional yoga block</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="mb-4">
                    <div className="bg-emerald-50 p-4 rounded-xl border-l-4 border-emerald-400 shadow-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-emerald-700 font-bold text-sm uppercase tracking-wide">Coach's Note</span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed pl-4">
                          Let's strengthen your base. You'll challenge your balance, posture, and deep core awareness. This is where your connection meets gentle strength.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Part 1: Breathing Exercises */}
                  <div className="mb-6">
                    <div className="program-3-section p-3 rounded-t-lg">
                      <div className="flex items-center gap-2">

                        <h4 className="font-bold text-white text-sm uppercase tracking-wide">Part 1: Morning + Evening - Can Be Performed In Multiple Positions</h4>
                      </div>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-b-lg border border-emerald-200 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-emerald-800 font-semibold underline cursor-pointer text-sm">
                          <a href="https://youtu.be/lBhO64vd8aE" target="_blank" rel="noopener noreferrer">
                            SUPINE DIAPHRAGMATIC BREATHING
                          </a>
                        </span>
                        <span className="text-emerald-700 font-bold text-sm bg-emerald-100 px-3 py-1 rounded-full">25 breaths</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-emerald-800 font-semibold underline cursor-pointer text-sm">
                          <a href="https://www.youtube.com/watch?v=tCzxxPxxtjw" target="_blank" rel="noopener noreferrer">
                            SIDE LYING DIAPHRAGMATIC BREATHING
                          </a>
                        </span>
                        <span className="text-emerald-700 font-bold text-sm bg-emerald-100 px-3 py-1 rounded-full">10 breaths each side</span>
                      </div>
                    </div>
                  </div>

                  {/* Part 2: Main Workout */}
                  <div className="mb-6">
                    <div className="program-3-section p-3 rounded-t-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2">
  
                          <h4 className="font-bold text-white text-sm uppercase tracking-wide">Part 2: Main Workout (3 Rounds)</h4>
                        </div>
                        <Button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg self-start sm:self-center">
                          <Play className="w-4 h-4" />
                          <a href="https://www.youtube.com/playlist?list=PLlZC5Vz4VnBR0n-zoVGxvFT0K4-uzV9Dd" target="_blank" rel="noopener noreferrer">
                            PLAY ALL
                          </a>
                        </Button>
                      </div>
                    </div>

                    <div className="bg-white rounded-b-lg border border-gray-200 p-4">
                      <div className="space-y-3">
                        {[
                          { num: 1, name: "BAND LAT-PULL W/ 5 KNEE LIFT", reps: "10 reps", url: "https://www.youtube.com/watch?v=-NBcN5pZcH8" },
                          { num: 2, name: "BAND LAT-PULL W/ KNEE ADDUCTION/ABDUCTION", reps: "10 reps", url: "https://www.youtube.com/watch?v=Jij6Wc9CQns" },
                          { num: 3, name: "BRIDGE W/ BAND LAT-PULL", reps: "10 reps", url: "https://www.youtube.com/watch?v=dv1TVJySjBs" },
                          { num: 4, name: "BAND LAT-PULL PILATES PULSES", reps: "20 reps", url: "https://www.youtube.com/watch?v=Tz0Iy90Hx9M" },
                          { num: 5, name: "WISHBONE STRETCH", reps: "30 secs each side", url: "https://www.youtube.com/watch?v=Pd2le_I4bFE" },
                          { num: 6, name: "HAPPY BABY POSE", reps: "1 min", url: "https://www.youtube.com/watch?v=r6NsBwtPSrw" }
                        ].map((exercise) => (
                          <div key={exercise.num} className="bg-gray-50 rounded-lg p-4 border-l-4 border-emerald-400 hover:bg-emerald-50 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                                  {exercise.num}
                                </div>
                                <a 
                                  href={exercise.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 hover:text-emerald-800 underline font-semibold leading-tight text-sm"
                                >
                                  {exercise.name}
                                </a>
                              </div>
                              <div className="text-gray-700 font-bold text-sm bg-white px-3 py-1.5 rounded-full border flex-shrink-0">
                                {exercise.reps} ×3
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* How to Section */}
                  <div className="bg-emerald-50 p-4 rounded-xl border-l-4 border-emerald-500 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <h4 className="font-bold text-emerald-800 text-sm uppercase tracking-wide">How To Use</h4>
                      </div>
                      <div className="pl-4 space-y-3">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          All <span className="text-emerald-600 underline font-medium">blue underlined text</span> is clickable and will open a video link. 
                          <span className="font-semibold"> PLAY ALL</span> indicates that the following workout can be played as a single 
                          playlist containing all the exercises to make it easier to flow through. However, please have listened to each exercise instruction beforehand.
                        </p>
                        <div className="bg-emerald-100 p-3 rounded-lg">
                          <p className="text-emerald-800 text-sm font-medium">
                            <span className="font-bold">Rest:</span> Rest a minimum of 30 secs - ONE minute between movements. Rest more if needed.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Precautions */}
                  <div className="bg-orange-50 p-4 rounded-xl border-l-4 border-orange-500 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <h4 className="font-bold text-orange-800 text-sm uppercase tracking-wide">Important Safety</h4>
                      </div>
                      <div className="pl-4 bg-orange-100 p-3 rounded-lg">
                        <p className="text-orange-800 text-sm leading-relaxed">
                          <span className="font-semibold">Listen to Your Body:</span> Always pay attention to how you feel and adjust accordingly. | 
                          <span className="font-semibold">Take Options Given:</span> Utilize the modifications provided to suit your comfort level. | 
                          <span className="font-semibold">Reduce Reps/Rounds:</span> Don't hesitate to reduce the number of repetitions or rounds if needed. | 
                          <span className="font-semibold">Stay Hydrated:</span> Keep water close by and drink frequently to stay hydrated. | 
                          <span className="font-semibold">Avoid Overexertion:</span> Stop immediately if you feel dizzy, nauseous, or overly fatigued. | 
                          <span className="font-semibold">Consult Your Doctor:</span> Always consult with your healthcare provider before continuing with the exercises.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Program 4 - Align & Activate */}
      <Card className="overflow-hidden border-l-4 border-program-4 shadow-xl">
        <CardHeader 
          className="program-4-gradient hover:program-4-gradient-hover cursor-pointer transition-all duration-300 relative overflow-hidden"
          onClick={() => toggleProgram('align-activate-program')}
        >
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
          </div>
          
          <div className="relative z-10">
            {/* Mobile Layout */}
            <div className="block lg:hidden">
              {/* Program Badge on top */}
              <div className="mb-3">
                <div className="bg-gradient-to-r from-white to-gray-50 text-amber-700 px-3 py-2 rounded-xl font-bold text-xs whitespace-nowrap shadow-lg border-2 border-amber-200 inline-block">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse"></div>
                    PROGRAM 4
                  </div>
                </div>
              </div>
              
              {/* Title and Description */}
              <div className="mb-3">
                <div className="text-white font-bold text-sm tracking-tight drop-shadow-md mb-1">
                  Align & Activate Program
                </div>
                <div className="text-base font-medium text-purple-100 drop-shadow-sm">
                  Six Week Alignment And Activation Fitness Journey
                </div>
              </div>
              
              {/* Info box and dropdown */}
              <div className="flex items-center justify-between">
                <div className="bg-white bg-opacity-10 px-3 py-2 rounded-lg backdrop-blur-sm flex-1 mr-3">
                  <div className="text-xs text-purple-100 font-bold uppercase tracking-wide">Align Program</div>
                  <div className="text-xs text-white font-medium">Coordination & activation</div>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-white to-amber-100 text-amber-700 rounded-full flex items-center justify-center shadow-xl flex-shrink-0 border-2 border-white">
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedPrograms['align-activate-program'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0 pr-2">
                <div className="bg-gradient-to-r from-white to-gray-50 text-amber-700 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap shadow-lg border-2 border-amber-200 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></div>
                    <span>PROGRAM 4</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1 py-2">
                  <CardTitle className="text-2xl text-white font-bold tracking-tight drop-shadow-md leading-tight">
                    Align & Activate Program
                  </CardTitle>
                  <CardDescription className="text-base font-medium text-purple-100 mt-2 drop-shadow-sm leading-tight">
                    Six Week Alignment And Activation Fitness Journey
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right bg-white bg-opacity-10 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <div className="text-sm text-purple-100 font-bold uppercase tracking-wide">Align Program</div>
                  <div className="text-sm text-white font-medium">Coordination & activation</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-white to-amber-100 text-amber-700 rounded-full flex items-center justify-center shadow-xl flex-shrink-0 border-2 border-white">
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedPrograms['align-activate-program'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        {expandedPrograms['align-activate-program'] && (
          <CardContent className="p-6 border-t border-purple-100">
            <div className="space-y-8">
              {/* Program 4 - Week 4 */}
              <Card className="overflow-hidden border-l-4 border-l-violet-400">
                <CardHeader className="bg-gradient-to-r from-violet-25 to-purple-25">
                  {/* Mobile Layout */}
                  <div className="block lg:hidden">
                    {/* Week Badge */}
                    <div className="mb-4">
                      <div className="program-4-section text-white px-3 py-2 rounded-lg font-bold text-xs whitespace-nowrap inline-block shadow-lg">
                        WEEK 4
                      </div>
                    </div>
                    
                    {/* Program Title */}
                    <div className="mb-3">
                      <CardTitle className="text-base text-gray-900 font-bold mb-2">PROGRAM 4 - ALIGN & ACTIVATE</CardTitle>
                      <CardDescription className="text-amber-700 font-semibold text-sm">Workout Schedule: 3x per week</CardDescription>
                      <p className="text-xs text-gray-600 mt-1">Complete on Days 1, 3, and 5 of each week</p>
                    </div>
                    
                    {/* Equipment Section */}
                    <div>
                      <div className="text-xs text-gray-700 font-bold uppercase tracking-wide mb-2">Equipment Needed</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Small Pilates ball</span>
                        <span className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Chair or stool</span>
                        <span className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Resistance band</span>
                        <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Mat</span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:flex lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="program-4-section text-white px-3 py-1 rounded font-semibold text-sm whitespace-nowrap">
                        WEEK 4
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg text-gray-900">PROGRAM 4 - ALIGN & ACTIVATE</CardTitle>
                        <CardDescription className="text-amber-700 font-semibold text-sm">Workout Schedule: 3x per week</CardDescription>
                        <p className="text-xs text-gray-600 mt-1">Complete on Days 1, 3, and 5 of each week</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Equipment Needed</div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <span className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Small Pilates ball</span>
                        <span className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Chair or stool</span>
                        <span className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Resistance band</span>
                        <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Mat</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="mb-4">
                    <div className="bg-violet-50 p-4 rounded-xl border-l-4 border-violet-400 shadow-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                          <span className="text-violet-700 font-bold text-sm uppercase tracking-wide">Coach's Note</span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed pl-4">
                          Expect slightly more intensity and coordination here—but still led by your breath. Think form first, always. You're learning to support movement from the inside out.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Part 1: Breathing Exercise */}
                  <div className="mb-6">
                    <div className="program-4-section p-3 rounded-t-lg">
                      <div className="flex items-center gap-2">

                        <h4 className="font-bold text-white text-sm uppercase tracking-wide">Part 1: Morning + Evening - Can Be Performed In Multiple Positions</h4>
                      </div>
                    </div>
                    <div className="bg-violet-50 p-4 rounded-b-lg border border-violet-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-violet-800 font-semibold underline cursor-pointer text-sm">
                          <a href="https://www.youtube.com/watch?v=ehaUhSSY1xY" target="_blank" rel="noopener noreferrer">
                            90 90 BOX BREATHING
                          </a>
                        </span>
                        <span className="text-violet-700 font-bold text-sm bg-violet-100 px-3 py-1 rounded-full">25 breaths</span>
                      </div>
                    </div>
                  </div>

                  {/* Part 2: Main Workout */}
                  <div className="mb-6">
                    <div className="program-4-section p-3 rounded-t-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2">
  
                          <h4 className="font-bold text-white text-sm uppercase tracking-wide">Part 2: Main Workout (3 Rounds)</h4>
                        </div>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg self-start sm:self-center">
                          <Play className="w-4 h-4" />
                          <a href="https://www.youtube.com/playlist?list=PLlZC5Vz4VnBTsiZUsJ7baFzlDbw22IiAw" target="_blank" rel="noopener noreferrer">
                            PLAY ALL
                          </a>
                        </Button>
                      </div>
                    </div>

                    <div className="bg-white rounded-b-lg border border-gray-200 p-4">
                      <div className="space-y-3">
                        {[
                          { num: 1, name: "LEGS ELEVATED GLUTE BRIDGE WITH BALL SQUEEZE", reps: "10 reps", url: "https://www.youtube.com/watch?v=MMH2DLbL0ug" },
                          { num: 2, name: "SUPINE KNEE DROPS WITH PILATES BAND", reps: "10 reps each side", url: "https://www.youtube.com/watch?v=EE8iKKo9LEk" },
                          { num: 3, name: "ALL FOURS PILATES BALL KNEE PRESS AND LEG LIFT", reps: "10 reps each side", url: "https://www.youtube.com/watch?v=rRWeQqIYzUM" },
                          { num: 4, name: "BEAR CRAWL LIFTS WITH BALL SQUEEZE", reps: "20 reps", url: "https://www.youtube.com/watch?v=Y0xmJ3IuOCU" },
                          { num: 5, name: "WISHBONE STRETCH", reps: "30 secs each side", url: "https://www.youtube.com/watch?v=Pd2le_I4bFE" },
                          { num: 6, name: "BUTTERFLY STRETCH — DYNAMIC FLUTTER", reps: "1 min", url: "https://www.youtube.com/watch?v=j5ZGvn1EUTo" }
                        ].map((exercise) => (
                          <div key={exercise.num} className="bg-gray-50 rounded-lg p-4 border-l-4 border-violet-400 hover:bg-violet-50 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                                  {exercise.num}
                                </div>
                                <a 
                                  href={exercise.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-violet-600 hover:text-violet-800 underline font-semibold leading-tight text-sm"
                                >
                                  {exercise.name}
                                </a>
                              </div>
                              <div className="text-gray-700 font-bold text-sm bg-white px-3 py-1.5 rounded-full border flex-shrink-0">
                                {exercise.reps} ×3
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* How to Section */}
                  <div className="bg-violet-50 p-4 rounded-xl border-l-4 border-violet-500 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                        <h4 className="font-bold text-violet-800 text-sm uppercase tracking-wide">How To Use</h4>
                      </div>
                      <div className="pl-4 space-y-3">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          All <span className="text-violet-600 underline font-medium">blue underlined text</span> is clickable and will open a video link. 
                          <span className="font-semibold"> PLAY ALL</span> indicates that the following workout can be played as a single 
                          playlist containing all the exercises to make it easier to flow through. However, please have listened to each exercise instruction beforehand.
                        </p>
                        <div className="bg-violet-100 p-3 rounded-lg">
                          <p className="text-violet-800 text-sm font-medium">
                            <span className="font-bold">Rest:</span> Rest a minimum of 30 secs - ONE minute between movements. Rest more if needed.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Precautions */}
                  <div className="bg-red-50 p-4 rounded-xl border-l-4 border-red-500 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <h4 className="font-bold text-red-800 text-sm uppercase tracking-wide">Important Safety</h4>
                      </div>
                      <div className="pl-4 bg-red-100 p-3 rounded-lg">
                        <p className="text-red-800 text-sm leading-relaxed">
                          <span className="font-semibold">Listen to Your Body:</span> Always pay attention to how you feel and adjust accordingly. | 
                          <span className="font-semibold">Take Options Given:</span> Utilize the modifications provided to suit your comfort level. | 
                          <span className="font-semibold">Reduce Reps/Rounds:</span> Don't hesitate to reduce the number of repetitions or rounds if needed. | 
                          <span className="font-semibold">Stay Hydrated:</span> Keep water close by and drink frequently to stay hydrated. | 
                          <span className="font-semibold">Avoid Overexertion:</span> Stop immediately if you feel dizzy, nauseous, or overly fatigued. | 
                          <span className="font-semibold">Consult Your Doctor:</span> Always consult with your healthcare provider before continuing with the exercises.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Program 5 - Functional Core Flow */}
      <Card className="overflow-hidden border-l-4 border-program-5 shadow-xl">
        <CardHeader 
          className="program-5-gradient hover:program-5-gradient-hover cursor-pointer transition-all duration-300 relative overflow-hidden"
          onClick={() => toggleProgram('functional-core-program')}
        >
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
          </div>
          
          <div className="relative z-10">
            {/* Mobile Layout */}
            <div className="block lg:hidden">
              {/* Program Badge on top */}
              <div className="mb-3">
                <div className="bg-gradient-to-r from-white to-gray-50 text-teal-600 px-3 py-2 rounded-xl font-bold text-xs whitespace-nowrap shadow-lg border-2 border-teal-200 inline-block">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></div>
                    PROGRAM 5
                  </div>
                </div>
              </div>
              
              {/* Title and Description */}
              <div className="mb-3">
                <div className="text-white font-bold text-sm tracking-tight drop-shadow-md mb-1">
                  Functional Core Flow Program
                </div>
                <div className="text-base font-medium text-teal-100 drop-shadow-sm">
                  Six Week Functional Core Movement Fitness Journey
                </div>
              </div>
              
              {/* Info box and dropdown */}
              <div className="flex items-center justify-between">
                <div className="bg-white bg-opacity-10 px-3 py-2 rounded-lg backdrop-blur-sm flex-1 mr-3">
                  <div className="text-xs text-teal-100 font-bold uppercase tracking-wide">Functional Program</div>
                  <div className="text-xs text-white font-medium">Real-life movement & empowerment</div>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-white to-teal-100 text-teal-600 rounded-full flex items-center justify-center shadow-xl flex-shrink-0 border-2 border-white">
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedPrograms['functional-core-program'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0 pr-2">
                <div className="bg-gradient-to-r from-white to-gray-50 text-teal-600 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap shadow-lg border-2 border-teal-200 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                    <span>PROGRAM 5</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1 py-2">
                  <CardTitle className="text-2xl text-white font-bold tracking-tight drop-shadow-md leading-tight">
                    Functional Core Flow Program
                  </CardTitle>
                  <CardDescription className="text-base font-medium text-teal-100 mt-2 drop-shadow-sm leading-tight">
                    Six Week Functional Core Movement Fitness Journey
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right bg-white bg-opacity-10 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <div className="text-sm text-teal-100 font-bold uppercase tracking-wide">Functional Program</div>
                  <div className="text-sm text-white font-medium">Real-life movement & empowerment</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-white to-teal-100 text-teal-600 rounded-full flex items-center justify-center shadow-xl flex-shrink-0 border-2 border-white">
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedPrograms['functional-core-program'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        {expandedPrograms['functional-core-program'] && (
          <CardContent className="p-6 border-t border-teal-100">
            <div className="space-y-8">
              {/* Program 5 - Week 5 */}
              <Card className="overflow-hidden border-l-4 border-l-indigo-400">
                <CardHeader className="bg-gradient-to-r from-indigo-25 to-teal-25">
                  {/* Mobile Layout */}
                  <div className="block lg:hidden">
                    {/* Week Badge */}
                    <div className="mb-4">
                      <div className="program-5-section text-white px-3 py-2 rounded-lg font-bold text-xs whitespace-nowrap inline-block shadow-lg">
                        WEEK 5
                      </div>
                    </div>
                    
                    {/* Program Title */}
                    <div className="mb-3">
                      <CardTitle className="text-base text-gray-900 font-bold mb-2">PROGRAM 5 - FUNCTIONAL CORE FLOW</CardTitle>
                      <CardDescription className="text-indigo-600 font-semibold text-sm">Workout Schedule: 3x per week</CardDescription>
                      <p className="text-xs text-gray-600 mt-1">Complete on Days 2, 4, and 6 of each week</p>
                    </div>
                    
                    {/* Equipment Section */}
                    <div>
                      <div className="text-xs text-gray-700 font-bold uppercase tracking-wide mb-2">Equipment Needed</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-green-100 text-blue-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Mini bands</span>
                        <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Mat</span>
                        <span className="bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Yoga block or Pilates ball</span>
                        <span className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Long resistance band</span>
                        <span className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Stool or chair</span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:flex lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="program-5-section text-white px-3 py-1 rounded font-semibold text-sm whitespace-nowrap">
                        WEEK 5
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg text-gray-900">PROGRAM 5 - FUNCTIONAL CORE FLOW</CardTitle>
                        <CardDescription className="text-indigo-600 font-semibold text-sm">Workout Schedule: 3x per week</CardDescription>
                        <p className="text-xs text-gray-600 mt-1">Complete on Days 2, 4, and 6 of each week</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Equipment Needed</div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <span className="bg-green-100 text-blue-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Mini bands</span>
                        <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Mat</span>
                        <span className="bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Yoga block or Pilates ball</span>
                        <span className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Long resistance band</span>
                        <span className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Stool or chair</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="mb-4">
                    <div className="bg-indigo-50 p-4 rounded-xl border-l-4 border-indigo-400 shadow-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                          <span className="text-indigo-700 font-bold text-sm uppercase tracking-wide">Coach's Note</span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed pl-4">
                          This phase bridges your core work with real-life movement (like lifting your baby, carrying groceries, or moving quickly). It's functional, safe, and empowering.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Part 1: Breathing Exercises */}
                  <div className="mb-6">
                    <div className="program-5-section p-3 rounded-t-lg">
                      <div className="flex items-center gap-2">

                        <h4 className="font-bold text-white text-sm uppercase tracking-wide">Part 1: Morning + Evening - Can Be Performed In Multiple Positions</h4>
                      </div>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-b-lg border border-indigo-200 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-indigo-800 font-semibold underline cursor-pointer text-sm">
                          <a href="https://www.youtube.com/watch?v=lBhO64vd8aE" target="_blank" rel="noopener noreferrer">
                            SUPINE DIAPHRAGMATIC BREATHING
                          </a>
                        </span>
                        <span className="text-indigo-700 font-bold text-sm bg-indigo-100 px-3 py-1 rounded-full">25 breaths</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-indigo-800 font-semibold underline cursor-pointer text-sm">
                          <a href="https://www.youtube.com/watch?v=squAfERF7xQ" target="_blank" rel="noopener noreferrer">
                            SIDE LYING THORACIC ROTATIONS
                          </a>
                        </span>
                        <span className="text-indigo-700 font-bold text-sm bg-indigo-100 px-3 py-1 rounded-full">5 each side</span>
                      </div>
                    </div>
                  </div>

                  {/* Part 2: Main Workout */}
                  <div className="mb-6">
                    <div className="program-5-section p-3 rounded-t-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2">
  
                          <h4 className="font-bold text-white text-sm uppercase tracking-wide">Part 2: Main Workout (3 Rounds)</h4>
                        </div>
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg self-start sm:self-center">
                          <Play className="w-4 h-4" />
                          <a href="https://www.youtube.com/playlist?list=PLlZC5Vz4VnBRSZiDlmtmV7AStplWQiGok" target="_blank" rel="noopener noreferrer">
                            PLAY ALL
                          </a>
                        </Button>
                      </div>
                    </div>

                    <div className="bg-white rounded-b-lg border border-gray-200 p-4">
                      <div className="space-y-3">
                        {[
                          { num: 1, name: "KNEELING PALLOF RAISES", reps: "10 reps", url: "https://www.youtube.com/watch?v=dBZyeMwNdxQ" },
                          { num: 2, name: "SIDE LYING BAND CLAMSHELLS", reps: "10 reps", url: "https://www.youtube.com/watch?v=8Cu-kVG4TZQ" },
                          { num: 3, name: "SEATED LEAN BACKS WITH PILATES BALL SQUEEZE", reps: "10 reps", url: "https://www.youtube.com/watch?v=OrH6nMjA0Ho" },
                          { num: 4, name: "SINGLE LEG GLUTE BRIDGES", reps: "20 reps", url: "https://www.youtube.com/watch?v=ly2GQ8Hlv6E" },
                          { num: 5, name: "COPENHAGEN PLANK HOLD", reps: "20 secs each side", url: "https://www.youtube.com/watch?v=n1YIgAvnNaA" },
                          { num: 6, name: "BUTTERFLY STRETCH — DYNAMIC FLUTTER", reps: "1 min", url: "https://www.youtube.com/watch?v=j5ZGvn1EUTo" }
                        ].map((exercise) => (
                          <div key={exercise.num} className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-400 hover:bg-indigo-50 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                                  {exercise.num}
                                </div>
                                <a 
                                  href={exercise.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-800 underline font-semibold leading-tight text-sm"
                                >
                                  {exercise.name}
                                </a>
                              </div>
                              <div className="text-gray-700 font-bold text-sm bg-white px-3 py-1.5 rounded-full border flex-shrink-0">
                                {exercise.reps} ×3
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* How to Section */}
                  <div className="bg-indigo-50 p-4 rounded-xl border-l-4 border-indigo-500 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <h4 className="font-bold text-indigo-800 text-sm uppercase tracking-wide">How To Use</h4>
                      </div>
                      <div className="pl-4 space-y-3">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          All <span className="text-indigo-600 underline font-medium">blue underlined text</span> is clickable and will open a video link. 
                          <span className="font-semibold"> PLAY ALL</span> indicates that the following workout can be played as a single 
                          playlist containing all the exercises to make it easier to flow through. However, please have listened to each exercise instruction beforehand.
                        </p>
                        <div className="bg-indigo-100 p-3 rounded-lg">
                          <p className="text-indigo-800 text-sm font-medium">
                            <span className="font-bold">Rest:</span> Rest a minimum of ONE minute between sections. Rest more if needed.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Precautions */}
                  <div className="bg-amber-50 p-4 rounded-xl border-l-4 border-amber-500 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <h4 className="font-bold text-amber-800 text-sm uppercase tracking-wide">Important Safety</h4>
                      </div>
                      <div className="pl-4 bg-amber-100 p-3 rounded-lg">
                        <p className="text-amber-800 text-sm leading-relaxed">
                          <span className="font-semibold">Listen to Your Body:</span> Always pay attention to how you feel and adjust accordingly. | 
                          <span className="font-semibold">Take Options Given:</span> Utilize the modifications provided to suit your comfort level. | 
                          <span className="font-semibold">Reduce Reps/Rounds:</span> Don't hesitate to reduce the number of repetitions or rounds if needed. | 
                          <span className="font-semibold">Adjust Weights:</span> Opt for lighter weights or no weights at all if you feel any discomfort. | 
                          <span className="font-semibold">Stay Hydrated:</span> Keep water close by and drink frequently to stay hydrated. | 
                          <span className="font-semibold">Avoid Overexertion:</span> Stop immediately if you feel dizzy, nauseous, or overly fatigued. | 
                          <span className="font-semibold">Consult Your Doctor:</span> Always consult with your healthcare provider before continuing with the exercises.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Program 6 - Foundational Strength */}
      <Card className="overflow-hidden border-l-4 border-program-6 shadow-xl">
        <CardHeader 
          className="program-6-gradient hover:program-6-gradient-hover cursor-pointer transition-all duration-300 relative overflow-hidden"
          onClick={() => toggleProgram('foundational-strength-program')}
        >
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
          </div>
          
          <div className="relative z-10">
            {/* Mobile Layout */}
            <div className="block lg:hidden">
              {/* Program Badge on top */}
              <div className="mb-3">
                <div className="bg-gradient-to-r from-white to-gray-50 text-orange-600 px-3 py-2 rounded-xl font-bold text-xs whitespace-nowrap shadow-lg border-2 border-orange-200 inline-block">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                    PROGRAM 6
                  </div>
                </div>
              </div>
              
              {/* Title and Description */}
              <div className="mb-3">
                <div className="text-white font-bold text-sm tracking-tight drop-shadow-md mb-1">
                  Foundational Strength Program
                </div>
                <div className="text-base font-medium text-orange-100 drop-shadow-sm">
                  Six Week Foundational Strength Fitness Journey
                </div>
              </div>
              
              {/* Info box and dropdown */}
              <div className="flex items-center justify-between">
                <div className="bg-white bg-opacity-10 px-3 py-2 rounded-lg backdrop-blur-sm flex-1 mr-3">
                  <div className="text-xs text-orange-100 font-bold uppercase tracking-wide">Foundational Program</div>
                  <div className="text-xs text-white font-medium">Capacity, endurance & resilience</div>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-white to-orange-100 text-orange-600 rounded-full flex items-center justify-center shadow-xl flex-shrink-0 border-2 border-white">
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedPrograms['foundational-strength-program'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0 pr-2">
                <div className="bg-gradient-to-r from-white to-gray-50 text-orange-600 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap shadow-lg border-2 border-orange-200 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span>PROGRAM 6</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1 py-2">
                  <CardTitle className="text-2xl text-white font-bold tracking-tight drop-shadow-md leading-tight">
                    Foundational Strength Program
                  </CardTitle>
                  <CardDescription className="text-base font-medium text-orange-100 mt-2 drop-shadow-sm leading-tight">
                    Six Week Foundational Strength Fitness Journey
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right bg-white bg-opacity-10 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <div className="text-sm text-orange-100 font-bold uppercase tracking-wide">Foundational Program</div>
                  <div className="text-sm text-white font-medium">Capacity, endurance & resilience</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-white to-orange-100 text-orange-600 rounded-full flex items-center justify-center shadow-xl flex-shrink-0 border-2 border-white">
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedPrograms['foundational-strength-program'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        {expandedPrograms['foundational-strength-program'] && (
          <CardContent className="p-6 border-t border-orange-100">
            <div className="space-y-8">
              {/* Program 6 - Week 6 */}
              <Card className="overflow-hidden border-l-4 border-l-amber-400">
                <CardHeader className="bg-gradient-to-r from-amber-25 to-orange-25">
                  {/* Mobile Layout */}
                  <div className="block lg:hidden">
                    {/* Week Badge */}
                    <div className="mb-4">
                      <div className="program-6-section text-white px-3 py-2 rounded-lg font-bold text-xs whitespace-nowrap inline-block shadow-lg">
                        WEEK 6
                      </div>
                    </div>
                    
                    {/* Program Title */}
                    <div className="mb-3">
                      <CardTitle className="text-base text-gray-900 font-bold mb-2">PROGRAM 6 - FOUNDATIONAL STRENGTH</CardTitle>
                      <CardDescription className="text-amber-600 font-semibold text-sm">Workout Schedule: 4x per week</CardDescription>
                      <p className="text-xs text-gray-600 mt-1">Complete on Days 1, 3, 5, and 7 of each week</p>
                    </div>
                    
                    {/* Equipment Section */}
                    <div>
                      <div className="text-xs text-gray-700 font-bold uppercase tracking-wide mb-2">Equipment Needed</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-red-100 text-red-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Swiss ball</span>
                        <span className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Small Pilates ball</span>
                        <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Mat</span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:flex lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="program-6-section text-white px-3 py-1 rounded font-semibold text-sm whitespace-nowrap">
                        WEEK 6
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg text-gray-900">PROGRAM 6 - FOUNDATIONAL STRENGTH</CardTitle>
                        <CardDescription className="text-amber-600 font-semibold text-sm">Workout Schedule: 4x per week</CardDescription>
                        <p className="text-xs text-gray-600 mt-1">Complete on Days 1, 3, 5, and 7 of each week</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Equipment Needed</div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <span className="bg-red-100 text-red-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Swiss ball</span>
                        <span className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Small Pilates ball</span>
                        <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">Mat</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="mb-4">
                    <div className="bg-amber-50 p-4 rounded-xl border-l-4 border-amber-400 shadow-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span className="text-amber-700 font-bold text-sm uppercase tracking-wide">Coach's Note</span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed pl-4">
                          Your final week builds capacity, endurance, and resilience. You'll feel stronger, more balanced, and more stable. Take your time and listen to your body.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Part 1: Breathing Exercise */}
                  <div className="mb-6">
                    <div className="program-6-section p-3 rounded-t-lg">
                      <div className="flex items-center gap-2">

                        <h4 className="font-bold text-white text-sm uppercase tracking-wide">Part 1: Morning + Evening - Can Be Performed In Multiple Positions</h4>
                      </div>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-b-lg border border-amber-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-amber-800 font-semibold underline cursor-pointer text-sm">
                          <a href="https://www.youtube.com/watch?v=ehaUhSSY1xY" target="_blank" rel="noopener noreferrer">
                            90 90 BOX BREATHING
                          </a>
                        </span>
                        <span className="text-amber-700 font-bold text-sm bg-amber-100 px-3 py-1 rounded-full">25 breaths</span>
                      </div>
                    </div>
                  </div>

                  {/* Part 2: Main Workout */}
                  <div className="mb-6">
                    <div className="program-6-section p-3 rounded-t-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2">
  
                          <h4 className="font-bold text-white text-sm uppercase tracking-wide">Part 2: Main Workout (3 Rounds)</h4>
                        </div>
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg self-start sm:self-center">
                          <Play className="w-4 h-4" />
                          <a href="https://www.youtube.com/playlist?list=PLlZC5Vz4VnBQokIfzvMlRrabultV17Vki" target="_blank" rel="noopener noreferrer">
                            PLAY ALL
                          </a>
                        </Button>
                      </div>
                    </div>

                    <div className="bg-white rounded-b-lg border border-gray-200 p-4">
                      <div className="space-y-3">
                        {[
                          { num: 1, name: "SWISS BALL HAMSTRING CURLS", reps: "20 reps", url: "https://www.youtube.com/watch?v=dxpSn0HLB6M" },
                          { num: 2, name: "SWISS BALL HIP LIFTS TO PIKE", reps: "10 reps", url: "https://www.youtube.com/watch?v=GP5tON5kEDc" },
                          { num: 3, name: "SWISS BALL DEADBUGS", reps: "20 reps", url: "https://www.youtube.com/watch?v=PietQSYU2as" },
                          { num: 4, name: "SUPINE SWISS BALL HOLD WITH LEG TWISTS", reps: "20 reps", url: "https://www.youtube.com/watch?v=GcVoMJGAV3o" },
                          { num: 5, name: "WISHBONE STRETCH", reps: "30 secs each side", url: "https://www.youtube.com/watch?v=Pd2le_I4bFE" },
                          { num: 6, name: "KNEELING HIP FLEXOR STRETCH", reps: "1 min each side", url: "https://www.youtube.com/watch?v=GG3rtAKd6hY" }
                        ].map((exercise) => (
                          <div key={exercise.num} className="bg-gray-50 rounded-lg p-4 border-l-4 border-amber-400 hover:bg-amber-50 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                                  {exercise.num}
                                </div>
                                <a 
                                  href={exercise.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-amber-600 hover:text-amber-800 underline font-semibold leading-tight text-sm"
                                >
                                  {exercise.name}
                                </a>
                              </div>
                              <div className="text-gray-700 font-bold text-sm bg-white px-3 py-1.5 rounded-full border flex-shrink-0">
                                {exercise.reps} ×3
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* How to Section */}
                  <div className="bg-amber-50 p-4 rounded-xl border-l-4 border-amber-500 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <h4 className="font-bold text-amber-800 text-sm uppercase tracking-wide">How To Use</h4>
                      </div>
                      <div className="pl-4 space-y-3">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          All <span className="text-amber-600 underline font-medium">blue underlined text</span> is clickable and will open a video link. 
                          <span className="font-semibold"> PLAY ALL</span> indicates that the following workout can be played as a single 
                          playlist containing all the exercises to make it easier to flow through. However, please have listened to each exercise instruction beforehand.
                        </p>
                        <div className="bg-amber-100 p-3 rounded-lg">
                          <p className="text-amber-800 text-sm font-medium">
                            <span className="font-bold">Rest:</span> Rest a minimum of 30 secs - ONE minute between movements. Rest more if needed.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Precautions */}
                  <div className="bg-rose-50 p-4 rounded-xl border-l-4 border-rose-500 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                        <h4 className="font-bold text-rose-800 text-sm uppercase tracking-wide">Important Safety</h4>
                      </div>
                      <div className="pl-4 bg-rose-100 p-3 rounded-lg">
                        <p className="text-rose-800 text-sm leading-relaxed">
                          <span className="font-semibold">Listen to Your Body:</span> Always pay attention to how you feel and adjust accordingly. | 
                          <span className="font-semibold">Take Options Given:</span> Utilize the modifications provided to suit your comfort level. | 
                          <span className="font-semibold">Reduce Reps/Rounds:</span> Don't hesitate to reduce the number of repetitions or rounds if needed. | 
                          <span className="font-semibold">Adjust Weights:</span> Opt for lighter weights or no weights at all if you feel any discomfort. | 
                          <span className="font-semibold">Stay Hydrated:</span> Keep water close by and drink frequently to stay hydrated. | 
                          <span className="font-semibold">Avoid Overexertion:</span> Stop immediately if you feel dizzy, nauseous, or overly fatigued. | 
                          <span className="font-semibold">Consult Your Doctor:</span> Always consult with your healthcare provider before continuing with the exercises.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Navigation Buttons */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Continue Your Journey</h3>
          <p className="text-sm text-gray-600">Navigate through your recovery program</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center">
          {canGoPrevious() && (
            <Button
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 sm:px-8 py-4 sm:py-3 text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
              data-testid="button-previous-section-programs"
              onClick={navigateToPreviousTab}
            >
              <ChevronLeft className="w-4 h-4" />
              {getNavigationText('prev')}
            </Button>
          )}
          {canGoNext() && (
            <Button
              className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 sm:px-8 py-4 sm:py-3 text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
              data-testid="button-next-section-programs"
              onClick={navigateToNextTab}
            >
              {getNavigationText('next')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">Complete your holistic recovery journey</p>
        </div>
      </div>
    </div>
  );
}

function TheRoleOfNutritionSection({ 
  canGoNext, 
  canGoPrevious, 
  navigateToNextTab, 
  navigateToPreviousTab,
  getNavigationText 
}: NavigationProps) {
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  const toggleTopic = (topic: string) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topic]: !prev[topic]
    }));
  };

  const topics = [
    { id: 'a-note-on-nutrition', n: 1, title: 'A Note on Nutrition' },
    { id: 'supporting-diastasis-core-repair', n: 2, title: 'Supporting Diastasis & Core Repair with Nutrition' },
    { id: 'portion-quantity-guidance', n: 3, title: 'Portion & Quantity Guidance' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-left">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-600 bg-clip-text text-transparent drop-shadow-sm">
            The Role of Nutrition
          </CardTitle>
          <CardDescription className="text-sm font-medium text-gray-600 border-l-4 border-orange-400 pl-4 bg-gradient-to-r from-orange-50 to-transparent py-2">
            Nutritional guidance giving the importance it deserves for your core recovery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {topics.map((topic, index) => (
              <div key={topic.id}>
                {index > 0 && (
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30 my-2"></div>
                )}
                <div className="flex items-center justify-between py-5">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">{topic.n}</span>
                    <h3 className="text-[15px] font-semibold text-left">{topic.title}</h3>
                  </div>
                  <div
                    onClick={() => toggleTopic(topic.id)}
                    className="w-8 h-8 min-w-[32px] min-h-[32px] bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-pink-500 hover:to-pink-700 cursor-pointer transition-all duration-200 flex-shrink-0"
                    style={{ border: 'none', outline: 'none', boxShadow: '0 4px 8px rgba(236, 72, 153, 0.3)' }}
                    data-testid={`toggle-${topic.id}`}
                  >
                    <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics[topic.id] ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                {expandedTopics[topic.id] && (
                  <div className="pb-5 space-y-4" data-testid={`content-${topic.id}`}>
                    {topic.id === 'a-note-on-nutrition' ? (
                      <div className="space-y-6 text-sm">
                        <div className="text-center mb-6">
                          <div className="relative mb-4">
                            <img 
                              src={nutritionBowlImage} 
                              alt="The Role of Nutrition - Healthy salad with grilled chicken and vegetables"
                              className="w-full h-64 object-cover rounded-lg shadow-lg"
                            />
                          </div>
                          <h3 className="text-xl font-bold mb-4">A NOTE ON <span className="text-pink-500">NUTRITION</span></h3>
                        </div>
                        
                        <p className="text-gray-700 leading-relaxed">
                          Movement alone isn't enough to rebuild and restore. You're showing up for your recovery with 
                          commitment — but your body also needs nourishment to rebuild muscle, support healing, and 
                          bring your strength back from the inside out.
                        </p>
                        
                        <p className="text-gray-700 leading-relaxed">
                          This isn't about diets or calorie-counting. It's about fueling your recovery with food that supports 
                          your energy, hormones, and deep-core healing, especially during the postpartum phase.
                        </p>
                        
                        <div className="bg-pink-50 border-l-4 border-pink-400 p-5 rounded-r-lg">
                          <h4 className="font-bold mb-3 text-pink-600 text-base">Why nutrition matters for core healing:</h4>
                          <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start">
                              <span className="text-pink-500 mr-2">❖</span>
                              <span>Helps rebuild stretched fascia (like your Linea alba)</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-pink-500 mr-2">❖</span>
                              <span>Supports muscle repair + connective tissue strength</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-pink-500 mr-2">❖</span>
                              <span>Reduces inflammation and bloating</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-pink-500 mr-2">❖</span>
                              <span>Keeps your energy and mood stable through the day</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-pink-500 mr-2">❖</span>
                              <span>Improves digestion — key for core and pelvic pressure</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-pink-500 mr-2">❖</span>
                              <span>Supports pelvic floor healing + postpartum recovery</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 p-5 rounded-lg">
                          <h4 className="font-bold mb-3 text-pink-600 text-base">Daily checklist</h4>
                          <p className="text-gray-600 mb-3 text-sm">
                            Use this as a gentle reminder — not for perfection, but for consistent nourishment.
                          </p>
                          <div className="space-y-2">
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input type="checkbox" className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500" />
                              <span className="text-gray-700">Bone broth or warm protein-rich soup</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input type="checkbox" className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500" />
                              <span className="text-gray-700">3 protein-rich servings (dal/lentils, curd/yogurt, chicken, etc.)</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input type="checkbox" className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500" />
                              <span className="text-gray-700">2+ complex carb servings (bajra, quinoa/pearl millet flatbread, oats, sweet potato)</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input type="checkbox" className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500" />
                              <span className="text-gray-700">1–2 healthy fat sources (ghee/clarified butter, nuts, coconut)</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input type="checkbox" className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500" />
                              <span className="text-gray-700">2+ anti-inflammatory ingredients (Haldi/turmeric, ginger, soaked nuts)</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input type="checkbox" className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500" />
                              <span className="text-gray-700">8–10 cups fluid (water, chaas/buttermilk, ORS, nimbu-paani/lime water)</span>
                            </label>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-400 p-5 rounded-r-lg">
                          <p className="text-gray-700 leading-relaxed flex items-start">
                            <span className="text-orange-500 mr-2 mt-1">🧡</span>
                            <span>Let your plate reflect warmth, recovery, and self-care. Home-cooked meals are powerful postpartum medicine.</span>
                          </p>
                        </div>
                      </div>
                    ) : topic.id === 'supporting-diastasis-core-repair' ? (
                      <div className="space-y-6 text-sm">
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-bold mb-4">SUPPORTING <span className="text-pink-500">DIASTASIS & CORE REPAIR</span> WITH NUTRITION</h3>
                        </div>
                        
                        <p className="text-gray-700 leading-relaxed mb-6">
                          The right foods can speed up healing and help you reconnect with your core. After pregnancy, your 
                          body needs more than movement — it needs repair nutrients to support your fascia, connective 
                          tissue, muscles, and energy levels.
                        </p>
                        
                        {/* Nutrition Strategy Cards */}
                        <div className="grid gap-6">
                          {/* Collagen Support */}
                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#f3a8cb'}}>
                            <div className="p-4" style={{backgroundColor: '#f2038b'}}>
                              <h4 className="font-bold text-white text-lg">COLLAGEN SUPPORT</h4>
                              <p className="text-white text-sm mt-1">Provides amino acids for rebuilding fascia and soft tissue</p>
                            </div>
                            <div className="p-5">
                              <h5 className="font-semibold text-gray-800 mb-3">Foods & Actions:</h5>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Bone Broth (Mutton/Chicken)</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Homemade Soups</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Haldi-doodh (Turmeric Milk)</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Collagen Powders</span>
                              </div>
                            </div>
                          </div>

                          {/* Anti-inflammatory Foods */}
                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#b3c0e4'}}>
                            <div className="p-4" style={{backgroundColor: '#b3c0e4'}}>
                              <h4 className="font-bold text-lg" style={{color: '#5e73c4'}}>ANTI-INFLAMMATORY FOODS</h4>
                              <p className="text-sm mt-1" style={{color: '#5e73c4'}}>Reduces swelling and pain, supports tissue healing</p>
                            </div>
                            <div className="p-5">
                              <h5 className="font-semibold text-gray-800 mb-3">Foods & Actions:</h5>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Turmeric</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Ginger</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Tulsi Tea (Holy Basil)</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Ajwain Water</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Soaked Almonds</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Walnuts</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Fatty Fish</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Sardines</span>
                              </div>
                            </div>
                          </div>

                          {/* Adequate Protein */}
                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#cbde9a'}}>
                            <div className="p-4" style={{backgroundColor: '#cbde9a'}}>
                              <h4 className="font-bold text-lg" style={{color: '#7fb030'}}>ADEQUATE PROTEIN</h4>
                              <p className="text-sm mt-1" style={{color: '#7fb030'}}>Helps repair muscles, ligaments & improves strength</p>
                            </div>
                            <div className="p-5">
                              <h5 className="font-semibold text-gray-800 mb-3">Foods & Actions:</h5>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>2 Eggs</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Cottage Cheese (Paneer)</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Yoghurt</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Lentils</span>
                                <span className="px-3 py-1 rounded-full text-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Fish</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Grilled Chicken</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Chana (Chickpeas)</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Tofu</span>
                              </div>
                            </div>
                          </div>

                          {/* Low-GI Carbs */}
                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#b3a892'}}>
                            <div className="p-4" style={{backgroundColor: '#b3a892'}}>
                              <h4 className="font-bold text-lg" style={{color: '#8b7355'}}>LOW-GI CARBS</h4>
                              <p className="text-sm mt-1" style={{color: '#8b7355'}}>Prevents blood sugar spikes, improves hormone balance</p>
                            </div>
                            <div className="p-5">
                              <h5 className="font-semibold text-gray-800 mb-3">Foods & Actions:</h5>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9a8b72', color: '#8b7355'}}>Sweet Potato</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9a8b72', color: '#8b7355'}}>Bajra (Pearl Millet)</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9a8b72', color: '#8b7355'}}>Jowar (Sorghum)</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9a8b72', color: '#8b7355'}}>Rolled Oats</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9a8b72', color: '#8b7355'}}>Whole Wheat Roti</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9a8b72', color: '#8b7355'}}>Red Rice</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9a8b72', color: '#8b7355'}}>Poha With Veggies</span>
                              </div>
                            </div>
                          </div>

                          {/* Hydration & Electrolytes */}
                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#f3a8cb'}}>
                            <div className="p-4" style={{backgroundColor: '#f3a8cb'}}>
                              <h4 className="font-bold text-lg" style={{color: '#d1507a'}}>HYDRATION & ELECTROLYTES</h4>
                              <p className="text-sm mt-1" style={{color: '#d1507a'}}>Keeps fascia elastic and supports nutrient delivery</p>
                            </div>
                            <div className="p-5">
                              <h5 className="font-semibold text-gray-800 mb-3">Foods & Actions:</h5>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#e8819b', color: '#d1507a'}}>Jeera Water (Cumin)</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#e8819b', color: '#d1507a'}}>Coconut Water</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#e8819b', color: '#d1507a'}}>Nimbu-paani (Lime Water)</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#e8819b', color: '#d1507a'}}>ORS</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#e8819b', color: '#d1507a'}}>Salted Chaas (Buttermilk)</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#e8819b', color: '#d1507a'}}>8–10 Glasses Of Water</span>
                              </div>
                            </div>
                          </div>

                          {/* Healthy Fats */}
                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#f2038b'}}>
                            <div className="p-4" style={{backgroundColor: '#f2038b'}}>
                              <h4 className="font-bold text-white text-lg">HEALTHY FATS</h4>
                              <p className="text-white text-sm mt-1">Supports hormones and tissue elasticity</p>
                            </div>
                            <div className="p-5">
                              <h5 className="font-semibold text-gray-800 mb-3">Foods & Actions:</h5>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Ghee (Small Amounts)</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Sesame Seeds (Til)</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Coconut</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Soaked Almonds</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Flaxseeds</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Groundnut Chutney</span>
                              </div>
                            </div>
                          </div>

                          {/* Complex Carbs */}
                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#b3c0e4'}}>
                            <div className="p-4" style={{backgroundColor: '#b3c0e4'}}>
                              <h4 className="font-bold text-lg" style={{color: '#5e73c4'}}>COMPLEX CARBS</h4>
                              <p className="text-sm mt-1" style={{color: '#5e73c4'}}>Balances blood sugar, supports energy + digestion</p>
                            </div>
                            <div className="p-5">
                              <h5 className="font-semibold text-gray-800 mb-3">Foods & Actions:</h5>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Bajra (Pearl Millet)</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Jowar (Sorghum)</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Red Rice</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Oats</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Poha With Veggies</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Sabudana (Sago)</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Sweet Potato</span>
                              </div>
                            </div>
                          </div>

                          {/* Micronutrients */}
                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#cbde9a'}}>
                            <div className="p-4" style={{backgroundColor: '#cbde9a'}}>
                              <h4 className="font-bold text-lg" style={{color: '#7fb030'}}>MICRONUTRIENTS</h4>
                              <p className="text-sm mt-1" style={{color: '#7fb030'}}>Supports wound healing and replenishes lost iron/zinc</p>
                            </div>
                            <div className="p-5">
                              <h5 className="font-semibold text-gray-800 mb-3">Foods & Actions:</h5>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Beetroot</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Leafy Greens</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Citrus Fruits</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Jaggery</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Sesame Seeds</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Methi (Fenugreek)</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Sabzis With Haldi + Jeera</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Bonus Recovery Tips */}
                        <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 p-5 rounded-lg mt-6">
                          <h4 className="font-bold mb-3 text-pink-600 text-base">BONUS RECOVERY TIPS</h4>
                          <div className="space-y-2 text-gray-700">
                            <div className="flex items-start">
                              <span className="text-pink-500 mr-2">❖</span>
                              <span><strong>Iron-Rich Add-ons:</strong> supports postpartum blood levels</span>
                            </div>
                            <div className="flex items-start">
                              <span className="text-pink-500 mr-2">❖</span>
                              <span><strong>Healthy Fats:</strong> for hormone tissue repair and hormonal support</span>
                            </div>
                            <div className="flex items-start">
                              <span className="text-pink-500 mr-2">❖</span>
                              <span><strong>Timing Matters:</strong> Eat within an hour of waking and don't skip meals — it keeps your body in healing mode</span>
                            </div>
                            <div className="flex items-start">
                              <span className="text-pink-500 mr-2">❖</span>
                              <span><strong>Homemade First:</strong> Home-cooked (with minimal refined oil or sugar) are ideal — they're familiar, balanced, and warm.</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : topic.id === 'portion-quantity-guidance' ? (
                      <div className="space-y-6 text-sm">
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-bold mb-4">PORTION & <span className="text-pink-500">QUANTITY GUIDANCE</span></h3>
                          <p className="text-gray-700 leading-relaxed">
                            A flexible way to fuel healing without counting or obsessing. You don't need to track macros or 
                            calories to support your recovery. But it is helpful to have a general guide for how much your body 
                            may need — especially as you rebuild strength, support your core, and possibly breastfeed.
                          </p>
                        </div>

                        {/* Hand Portion Guide */}
                        <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#b3c0e4'}}>
                          <div className="p-4" style={{backgroundColor: '#b3c0e4'}}>
                            <h4 className="font-bold text-lg" style={{color: '#5e73c4'}}>YOUR HANDS = YOUR BUILT-IN PORTION GUIDE</h4>
                            <p className="text-sm mt-1" style={{color: '#5e73c4'}}>Using your hands makes portioning simple and personal to your body</p>
                          </div>
                          <div className="p-6">
                            <div className="text-center mb-4">
                              <img 
                                src={handPortionsImage} 
                                alt="Hand portion guide showing protein (palm), vegetables (fist), carbs (cupped hand), and fats (thumb)"
                                className="w-full max-w-2xl mx-auto rounded-lg"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Main Meals Guide */}
                        <div className="space-y-4">
                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#f3a8cb'}}>
                            <div className="p-4" style={{backgroundColor: '#f3a8cb'}}>
                              <h4 className="font-bold text-lg" style={{color: '#d1507a'}}>FOR EACH MAIN MEAL (3x/day), AIM FOR:</h4>
                            </div>
                          </div>

                          {/* Palm-sized Protein */}
                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#f2038b'}}>
                            <div className="p-4" style={{backgroundColor: '#f2038b'}}>
                              <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                <span>🤚</span> PALM-SIZED PROTEIN
                              </h4>
                              <p className="text-white text-sm mt-1">1 palm = about 20–30g protein</p>
                            </div>
                            <div className="p-5">
                              <h5 className="font-semibold text-gray-800 mb-3">Foods:</h5>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Chicken</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Fish</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Tofu</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Eggs</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Beans</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#f2038b', color: '#f2038b'}}>Lentils</span>
                              </div>
                            </div>
                          </div>

                          {/* Fist-sized Veggies */}
                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#b3c0e4'}}>
                            <div className="p-4" style={{backgroundColor: '#b3c0e4'}}>
                              <h4 className="font-bold text-lg flex items-center gap-2" style={{color: '#5e73c4'}}>
                                <span>✊</span> FIST-SIZED VEGGIES
                              </h4>
                              <p className="text-sm mt-1" style={{color: '#5e73c4'}}>Go for variety & fiber to support digestion</p>
                            </div>
                            <div className="p-5">
                              <h5 className="font-semibold text-gray-800 mb-3">Foods:</h5>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Cooked Vegetables</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Raw Vegetables</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>All Colors</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#8a9dd9', color: '#5e73c4'}}>Leafy Greens</span>
                              </div>
                            </div>
                          </div>

                          {/* Cupped-hand Complex Carbs */}
                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#cbde9a'}}>
                            <div className="p-4" style={{backgroundColor: '#cbde9a'}}>
                              <h4 className="font-bold text-lg flex items-center gap-2" style={{color: '#7fb030'}}>
                                <span>🤲</span> CUPPED-HAND COMPLEX CARBS
                              </h4>
                              <p className="text-sm mt-1" style={{color: '#7fb030'}}>Adjust depending on activity and energy</p>
                            </div>
                            <div className="p-5">
                              <h5 className="font-semibold text-gray-800 mb-3">Foods:</h5>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Oats</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Quinoa</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Sweet Potato</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Rice</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9fbd60', color: '#7fb030'}}>Fruit</span>
                              </div>
                            </div>
                          </div>

                          {/* Thumb of Healthy Fat */}
                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#b3a892'}}>
                            <div className="p-4" style={{backgroundColor: '#b3a892'}}>
                              <h4 className="font-bold text-lg flex items-center gap-2" style={{color: '#8b7355'}}>
                                <span>👍</span> THUMB OF HEALTHY FAT
                              </h4>
                              <p className="text-sm mt-1" style={{color: '#8b7355'}}>Adjust depending on activity and energy</p>
                            </div>
                            <div className="p-5">
                              <h5 className="font-semibold text-gray-800 mb-3">Foods:</h5>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9a8b72', color: '#8b7355'}}>Nut Butters</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9a8b72', color: '#8b7355'}}>Oils</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9a8b72', color: '#8b7355'}}>Avocado</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#9a8b72', color: '#8b7355'}}>Seeds</span>
                              </div>
                            </div>
                          </div>

                          {/* Plus Extra If Breastfeeding */}
                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#f3a8cb'}}>
                            <div className="p-4" style={{backgroundColor: '#f3a8cb'}}>
                              <h4 className="font-bold text-lg flex items-center gap-2" style={{color: '#d1507a'}}>
                                <span>🤱</span> PLUS EXTRA IF BREASTFEEDING
                              </h4>
                              <p className="text-sm mt-1" style={{color: '#d1507a'}}>Add another ½—1 palm of carbs or fat</p>
                            </div>
                            <div className="p-5">
                              <h5 className="font-semibold text-gray-800 mb-3">Add Between Meals:</h5>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#e8819b', color: '#d1507a'}}>Eggs</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#e8819b', color: '#d1507a'}}>Greek Yogurt</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{borderColor: '#e8819b', color: '#d1507a'}}>Trail Mix</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Info Cards */}
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* How Often To Eat */}
                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#b3a892'}}>
                            <div className="p-4" style={{backgroundColor: '#b3a892'}}>
                              <h4 className="font-bold text-white text-lg flex items-center gap-2" style={{textShadow: '0 1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.1)'}}>
                                <span>🕐</span> HOW OFTEN TO EAT
                              </h4>
                            </div>
                            <div className="p-5">
                              <div className="space-y-3 text-sm">
                                <p className="font-semibold text-gray-800">Try to eat every 3–4 hours to:</p>
                                <ul className="space-y-2 text-gray-700">
                                  <li className="flex items-start">
                                    <span className="text-pink-500 mr-2">✓</span>
                                    <span>Keep blood sugar stable</span>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-pink-500 mr-2">✓</span>
                                    <span>Support steady milk supply</span>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-pink-500 mr-2">✓</span>
                                    <span>Avoid energy crashes or overeating later</span>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-pink-500 mr-2">✓</span>
                                    <span>If you're hungrier more often — eat. Your healing body knows what it needs.</span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Remember */}
                          <div className="bg-white border rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" style={{borderColor: '#f3a8cb'}}>
                            <div className="p-4" style={{backgroundColor: '#f3a8cb'}}>
                              <h4 className="font-bold text-white text-lg flex items-center gap-2" style={{textShadow: '0 1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.1)'}}>
                                <span>💝</span> REMEMBER
                              </h4>
                            </div>
                            <div className="p-5">
                              <div className="space-y-3 text-sm">
                                <ul className="space-y-2 text-gray-700">
                                  <li className="flex items-start">
                                    <span className="text-pink-500 mr-2">✓</span>
                                    <span>You're not "eating too much" — you're eating enough to heal & function</span>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-pink-500 mr-2">✓</span>
                                    <span>Don't under fuel and then expect energy or results — your body is your teammate</span>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-pink-500 mr-2">✓</span>
                                    <span>Stay hydrated! Often, fatigue is just low fluid intake</span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Navigation Buttons */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Continue Your Journey</h3>
          <p className="text-sm text-gray-600">Navigate through your recovery program</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center">
          {canGoPrevious() && (
            <Button
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 sm:px-8 py-4 sm:py-3 text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
              data-testid="button-previous-section-nutrition"
              onClick={navigateToPreviousTab}
            >
              <ChevronLeft className="w-4 h-4" />
              {getNavigationText('prev')}
            </Button>
          )}
          {canGoNext() && (
            <Button
              className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 sm:px-8 py-4 sm:py-3 text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
              data-testid="button-next-section-nutrition"
              onClick={navigateToNextTab}
            >
              {getNavigationText('next')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">Fuel your body for optimal recovery</p>
        </div>
      </div>
    </div>
  );
}

function WhatComesNextSection({ 
  userId, 
  programId, 
  progressEntries,
  canGoNext, 
  canGoPrevious, 
  navigateToNextTab, 
  navigateToPreviousTab,
  getNavigationText 
}: {
  userId: string;
  programId: string;
  progressEntries: Array<any>;
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  navigateToNextTab: () => void;
  navigateToPreviousTab: () => void;
  getNavigationText: (direction: 'prev' | 'next') => string;
}) {
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  const toggleTopic = (topic: string) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topic]: !prev[topic]
    }));
  };

  const topics = [
    { id: 'how-to-know-ready', n: 1, title: 'Next Steps: How To Know You\'re Ready' },
    { id: 'red-flag-movements', n: 2, title: 'Red Flag Movements to Avoid' },
    { id: 'impact-readiness-test', n: 3, title: 'Return to Impact Readiness Test' },
    { id: 'progress-tracker', n: 4, title: 'Progress Tracker' },
    { id: 'yay-mama-you-did-it', n: 5, title: 'YAY MAMA...YOU DID IT!' },
  ];

  return (
    <div className="space-y-6">
      {/* What's Next Section Title */}
      <div className="mb-8 text-left">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-600 bg-clip-text text-transparent drop-shadow-sm">
          What's Next
        </h2>
        <p className="text-sm font-medium text-gray-600 border-l-4 border-indigo-400 pl-4 bg-gradient-to-r from-indigo-50 to-transparent py-2">
          Your roadmap for continued progress and empowerment
        </p>
      </div>

      {/* Topics Container */}
      <Card>
        <div className="p-6 space-y-1">
          {topics.map((topic, index) => (
            <div key={topic.id}>
              {index > 0 && (
                <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30 my-2"></div>
              )}
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">{topic.n}</span>
                  <h3 className="text-[15px] font-semibold text-left">{topic.title}</h3>
                </div>
                <div
                  onClick={() => toggleTopic(topic.id)}
                  className="w-8 h-8 min-w-[32px] min-h-[32px] bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-pink-500 hover:to-pink-700 cursor-pointer transition-all duration-200 flex-shrink-0"
                  style={{ border: 'none', outline: 'none', boxShadow: '0 4px 8px rgba(236, 72, 153, 0.3)' }}
                  data-testid={`toggle-${topic.id}`}
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics[topic.id] ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expandedTopics[topic.id] && (
                <div className="pb-5 space-y-4" data-testid={`content-${topic.id}`}>
                  {topic.id === 'how-to-know-ready' ? (
                    <div className="space-y-6 text-sm">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold mb-4">NEXT STEPS: HOW TO KNOW YOU'RE <span className="text-pink-500">READY TO PROGRESS?</span></h3>
                        <p className="text-gray-700 leading-relaxed">
                          Once you've practiced your core connection work consistently and are no longer experiencing pressure, pain, or doming, you may be ready to move forward. Progression is not about how many reps you can do—but about how well your body responds and maintains function and control under load.
                        </p>
                      </div>
                      
                      <div className="space-y-6">
                        {/* Progress Indicators Table */}
                        <div className="bg-white border-2 rounded-lg overflow-hidden" style={{borderColor: '#cbde9a'}}>
                          <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4">
                            <h4 className="font-bold text-gray-800 text-base">📊 Progress Indicators</h4>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Progress Indicator</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">What It Means</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Less or no abdominal doming during movement</td>
                                  <td className="px-6 py-4 text-sm text-gray-700">Your deep core is activating properly and controlling intra-abdominal pressure</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Ability to exhale and engage the core without holding your breath</td>
                                  <td className="px-6 py-4 text-sm text-gray-700">You're breathing and bracing reflexively and safely</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">The gap between abs is narrower with improved midline tension</td>
                                  <td className="px-6 py-4 text-sm text-gray-700">Your connective tissue is getting stronger and more supportive</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Noticeably better posture and reduced back or pelvic pain</td>
                                  <td className="px-6 py-4 text-sm text-gray-700">Your core and pelvic floor are starting to stabilize your body again</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Daily movements like lifting your baby or standing up feel easier</td>
                                  <td className="px-6 py-4 text-sm text-gray-700">You're regaining functional strength</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* What To Add Next Section */}
                        <div className="bg-white border-2 rounded-lg overflow-hidden" style={{borderColor: '#f3a8cb'}}>
                          <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4">
                            <h4 className="font-bold text-pink-600 text-base">🔄 What to add next (progression ideas):</h4>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">New Elements to Introduce</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">How to Do It Safely</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Resistance bands</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>Start with light bands and include moves like glute bridges, squats, clamshells</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Functional core integration</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>Engage core during squats, hip hinges, rows—exhale on effort</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Slightly higher reps</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>Your connective tissue is getting stronger and more supportive</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Noticeably better posture and reduced back or pelvic pain</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>Increase to 8–12 reps if no symptoms appear (doming, heaviness, leakage)</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Gentle dynamic movement</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>Include controlled movements like wall push-ups, modified lunges, or step-ups</em></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-400 p-5 rounded-r-lg">
                          <p className="text-gray-700 leading-relaxed flex items-start">
                            <span className="text-orange-500 mr-2 mt-1">⚡</span>
                            <span><strong>Remember:</strong> There's no rush. Listen to your body and progress at your own pace. Some women are ready in 6 weeks, others need 6 months. Both are perfectly normal.</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : topic.id === 'red-flag-movements' ? (
                    <div className="space-y-6 text-sm">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold mb-4">RED FLAG <span className="text-pink-500">MOVEMENTS TO AVOID</span></h3>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                          <p>
                            Even if you feel eager to get back into workouts, certain movements can delay healing and 
                            worsen core and pelvic floor dysfunction. These exercises increase intra-abdominal pressure, 
                            strain weak tissue, and risk injury if introduced too soon.
                          </p>
                          <p>
                            Avoid these until you've built a strong foundation of breath control, core engagement, and 
                            pelvic floor support—and have no signs of coning, bulging, or discomfort during movement.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* Red Flag Movements Table */}
                        <div className="bg-white border-2 rounded-lg overflow-hidden" style={{borderColor: '#f2038b'}}>
                          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4">
                            <h4 className="font-bold text-red-600 text-base">🚫 Red Flag Movements</h4>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Avoid These Movements</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Why They're Risky Postpartum</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Crunches or sit-ups</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>Load the rectus abdominis too early, increasing pressure on the linea alba and worsening diastasis recti</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Front-loaded planks (high/low)</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>Put intense strain on the abdominal wall, often causing doming or bulging</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Twisting under load (e.g., Russian twists)</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>Involves forceful rotation on weakened tissue; can deepen separation</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Deep backbends or unsupported extensions</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>Hyperextend the spine and stretch the healing core and pelvic floor</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Jumping, running, or impact exercises</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>Increase pelvic floor pressure and can cause leaks, heaviness, or prolapse risk</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Any movement that causes doming, bulging, pain, or leakage</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>These are your body's signals to pause & regress the movement for now</em></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-400 p-5 rounded-r-lg">
                          <p className="text-gray-700 leading-relaxed flex items-start">
                            <span className="text-orange-500 mr-2 mt-1">⚠️</span>
                            <span><strong>Remember:</strong> Your body will tell you when it's ready. Pay attention to these signals and prioritize healing over intensity. There's no rush—building a strong foundation now prevents setbacks later.</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : topic.id === 'impact-readiness-test' ? (
                    <div className="space-y-6 text-sm">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold mb-4">🏃‍♀️ RETURN TO <span className="text-pink-500">IMPACT</span> READINESS TEST</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Not sure if you're ready for running, jumping, or HIIT? Use this self-check protocol to assess your 
                          core + pelvic floor readiness for high-impact movement.
                        </p>
                      </div>

                      <div className="space-y-6">
                        {/* Impact Readiness Test Table */}
                        <div className="bg-white border-2 rounded-lg overflow-hidden" style={{borderColor: '#f3a8cb'}}>
                          <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4">
                            <h4 className="font-bold text-pink-600 text-base">🏃‍♀️ Impact Readiness Assessment</h4>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gradient-to-r from-green-100 to-emerald-100">
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200 font-bold">TEST</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200 font-bold">PASS CRITERIA</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">CORE BREATH ACTIVATION TEST</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>Can exhale + engage without bearing down</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">SINGLE LEG STAND (30S PER LEG)</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>Stable, no wobbles, no pelvic symptoms</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">SINGLE LEG GLUTE BRIDGE (10 PER SIDE)</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>No doming or pressure</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">FAST SIT-TO-STAND (10 REPS)</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>No leaking or heaviness</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">FORWARD HOP (LANDING SOFT)</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>Core feels engaged, no pressure</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">JOG ON SPOT (30 SECONDS)</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>No heaviness, pain, or leakage</em></td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">JUMPING JACKS (10 REPS)</td>
                                  <td className="px-6 py-4 text-sm text-gray-700"><em>No leaks, no bulging</em></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 p-5 rounded-r-lg">
                          <p className="text-gray-700 leading-relaxed flex items-start">
                            <span className="text-amber-500 mr-2 mt-1">💡</span>
                            <span><strong>If you feel unsure, unstable, or symptomatic</strong> — revisit core drills, glute strength, and breathwork. You'll get there.</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : topic.id === 'progress-tracker' ? (
                    <div className="space-y-6 text-sm">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold mb-4">✨ <span className="text-indigo-500">PROGRESS TRACKER</span> ✨</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Track your healing journey, week by week. Use this table to note your progress, symptoms, and small 
                          wins—because every step matters.
                        </p>
                      </div>

                      <div className="space-y-6">
                        {/* Download PDF Button */}
                        <div className="text-center">
                          <button
                            onClick={async () => {
                              try {
                                const jsPDF = await import('jspdf');
                                const doc = new jsPDF.jsPDF({
                                  orientation: 'landscape',
                                  unit: 'mm',
                                  format: 'a4'
                                });

                                // Add title
                                doc.setFontSize(16);
                                doc.setFont('helvetica', 'bold');
                                doc.text('PROGRESS TRACKER', 148.5, 20, { align: 'center' });
                                
                                doc.setFontSize(10);
                                doc.setFont('helvetica', 'normal');
                                doc.text('Track your healing journey, week by week. Use this table to note your progress, symptoms, and small wins.', 148.5, 28, { align: 'center' });

                                // Table data
                                const tableData = [
                                  ['WEEK', 'WEEK 1', 'WEEK 2', 'WEEK 3', 'WEEK 4', 'WEEK 5', 'WEEK 6'],
                                  ['DR GAP MEASUREMENT\n(Width/Depth at Navel, 2" Above, 2" Below)', '', '', '', '', '', ''],
                                  ['CORE CONNECTION\n(Scale 1-5)', '', '', '', '', '', ''],
                                  ['PELVIC FLOOR SYMPTOMS\n(Leaking, heaviness, bulging)', '', '', '', '', '', ''],
                                  ['POSTURE/BACK DISCOMFORT\n(Scale 1-5)', '', '', '', '', '', ''],
                                  ['ENERGY LEVEL\n(Scale 1-5)', '', '', '', '', '', ''],
                                  ['NUMBER OF WORKOUTS\nCompleted', '', '', '', '', '', ''],
                                  ['NOTES OR WINS\nFor the week', '', '', '', '', '', '']
                                ];

                                // Draw table manually
                                const startX = 10;
                                const startY = 40;
                                const rowHeight = 15;
                                const colWidths = [60, 36, 36, 36, 36, 36, 36];

                                // Draw rows
                                for (let i = 0; i < tableData.length; i++) {
                                  const y = startY + (i * rowHeight);
                                  let currentX = startX;

                                  for (let j = 0; j < tableData[i].length; j++) {
                                    const width = colWidths[j];
                                    
                                    // Fill header row with colors
                                    if (i === 0) {
                                      if (j === 0) {
                                        doc.setFillColor(200, 200, 200); // Gray for "WEEK"
                                      } else {
                                        doc.setFillColor(242, 3, 139); // Pink for week columns
                                      }
                                      doc.rect(currentX, y, width, rowHeight, 'F');
                                    } else if (j === 0) {
                                      doc.setFillColor(230, 230, 230); // Light gray for labels
                                      doc.rect(currentX, y, width, rowHeight, 'F');
                                    }

                                    // Draw border
                                    doc.setDrawColor(0);
                                    doc.rect(currentX, y, width, rowHeight);

                                    // Add text
                                    if (tableData[i][j]) {
                                      doc.setTextColor(i === 0 && j > 0 ? 255 : 0); // White text for pink headers
                                      doc.setFontSize(i === 0 ? 9 : 8);
                                      doc.setFont('helvetica', i === 0 ? 'bold' : 'normal');
                                      
                                      const lines = tableData[i][j].split('\n');
                                      const lineHeight = 4;
                                      const textStartY = y + (rowHeight / 2) - ((lines.length - 1) * lineHeight / 2) + 2;
                                      
                                      lines.forEach((line, lineIndex) => {
                                        doc.text(line, currentX + 2, textStartY + (lineIndex * lineHeight), { maxWidth: width - 4 });
                                      });
                                    }

                                    currentX += width;
                                  }
                                }

                                // Footer
                                doc.setTextColor(0);
                                doc.setFontSize(9);
                                doc.setFont('helvetica', 'italic');
                                doc.text('Printing Tip: Print in landscape mode for best results. Fill out by hand weekly.', startX, startY + (tableData.length * rowHeight) + 10);

                                doc.save('Progress-Tracker-Postpartum-Recovery.pdf');
                              } catch (error) {
                                console.error('PDF Error:', error);
                                alert('Error creating PDF. Please try again or contact support.');
                              }
                            }}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            data-testid="button-download-tracker"
                          >
                            📥 Download Printable Tracker
                          </button>
                        </div>

                        {/* Progress Tracker Table */}
                        <div id="progress-tracker-table" className="bg-white p-6 rounded-lg border-2" style={{borderColor: '#9aafdc'}}>
                          <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-3">
                              ✨ PROGRESS TRACKER ✨
                            </h2>
                            <p className="text-gray-700 text-sm">
                              Track your healing journey, week by week. Use this table to note your progress, symptoms, and small wins—because every step matters.
                            </p>
                          </div>
                          
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-400">
                              <thead>
                                <tr>
                                  <th className="border border-gray-400 bg-gray-200 p-3 text-center font-bold text-gray-700" style={{width: '20%'}}>
                                    WEEK
                                  </th>
                                  <th className="border border-gray-400 bg-pink-100 p-3 text-center font-bold text-pink-600 transform -rotate-90" style={{width: '13.33%', height: '80px'}}>
                                    <div className="whitespace-nowrap">WEEK 1</div>
                                  </th>
                                  <th className="border border-gray-400 bg-pink-100 p-3 text-center font-bold text-pink-600 transform -rotate-90" style={{width: '13.33%', height: '80px'}}>
                                    <div className="whitespace-nowrap">WEEK 2</div>
                                  </th>
                                  <th className="border border-gray-400 bg-pink-100 p-3 text-center font-bold text-pink-600 transform -rotate-90" style={{width: '13.33%', height: '80px'}}>
                                    <div className="whitespace-nowrap">WEEK 3</div>
                                  </th>
                                  <th className="border border-gray-400 bg-pink-100 p-3 text-center font-bold text-pink-600 transform -rotate-90" style={{width: '13.33%', height: '80px'}}>
                                    <div className="whitespace-nowrap">WEEK 4</div>
                                  </th>
                                  <th className="border border-gray-400 bg-pink-100 p-3 text-center font-bold text-pink-600 transform -rotate-90" style={{width: '13.33%', height: '80px'}}>
                                    <div className="whitespace-nowrap">WEEK 5</div>
                                  </th>
                                  <th className="border border-gray-400 bg-pink-100 p-3 text-center font-bold text-pink-600 transform -rotate-90" style={{width: '13.33%', height: '80px'}}>
                                    <div className="whitespace-nowrap">WEEK 6</div>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="border border-gray-400 bg-gray-200 p-3 font-bold text-center text-xs">
                                    <div>DR GAP</div>
                                    <div>MEASUREMENT</div>
                                    <div className="font-normal italic mt-1">(Width/Depth at Navel,</div>
                                    <div className="font-normal italic">2" Above, 2" Below):</div>
                                  </td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-400 bg-gray-200 p-3 font-bold text-center text-xs">
                                    <div>CORE</div>
                                    <div>CONNECTION</div>
                                    <div className="font-normal italic mt-1">(Scale 1-5)</div>
                                  </td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-400 bg-gray-200 p-3 font-bold text-center text-xs">
                                    <div>PELVIC FLOOR</div>
                                    <div>SYMPTOMS</div>
                                    <div className="font-normal italic mt-1">(Leaking, heaviness,</div>
                                    <div className="font-normal italic">bulging)</div>
                                  </td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-400 bg-gray-200 p-3 font-bold text-center text-xs">
                                    <div>POSTURE/BACK</div>
                                    <div>DISCOMFORT</div>
                                    <div className="font-normal italic mt-1">(Scale 1-5)</div>
                                  </td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-400 bg-gray-200 p-3 font-bold text-center text-xs">
                                    <div>ENERGY LEVEL</div>
                                    <div className="font-normal italic mt-1">(Scale 1-5)</div>
                                  </td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-400 bg-gray-200 p-3 font-bold text-center text-xs">
                                    <div>NUMBER OF</div>
                                    <div>WORKOUTS</div>
                                    <div className="font-normal italic mt-1">Completed</div>
                                  </td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-400 bg-gray-200 p-3 font-bold text-center text-xs">
                                    <div>NOTES OR WINS</div>
                                    <div className="font-normal italic mt-1">For the week</div>
                                  </td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                  <td className="border border-gray-400 p-8 bg-gray-50"></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 p-5 rounded-r-lg">
                          <p className="text-gray-700 leading-relaxed flex items-start">
                            <span className="text-amber-500 mr-2 mt-1">💡</span>
                            <span><strong>Printing Tip:</strong> After downloading, print in landscape mode for the best fit. This tracker is designed to be filled out by hand for convenient weekly tracking.</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : topic.id === 'yay-mama-you-did-it' ? (
                    <div className="space-y-6 text-sm">
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold mb-4">YAY MAMA...YOU DID IT!</h3>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                          <p>
                            A moment to pause, reflect, and honour the strength you've rebuilt—inside and out. 
                            This isn't just the end of a program. It's the beginning of a stronger, more connected you.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* Take A Moment To Reflect Section */}
                        <div className="bg-white border-2 rounded-lg p-6" style={{borderColor: '#f3a8cb'}}>
                          <div className="mb-4">
                            <h4 className="font-bold text-pink-500 text-lg mb-4">⭐ TAKE A MOMENT TO REFLECT</h4>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-start space-x-2">
                              <span className="text-pink-500 font-bold">✧</span>
                              <div>
                                <strong className="font-semibold">What's changed in your body?</strong>
                                <div className="text-gray-600 italic mt-1">
                                  Maybe you stand taller, breathe deeper, or feel more supported in your core.
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start space-x-2">
                              <span className="text-pink-500 font-bold">✧</span>
                              <div>
                                <strong className="font-semibold">What's changed in your mindset?</strong>
                                <div className="text-gray-600 italic mt-1">
                                  Maybe you've let go of pressure to "bounce back" and instead learned how to tune in.
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start space-x-2">
                              <span className="text-pink-500 font-bold">✧</span>
                              <div>
                                <strong className="font-semibold">What's something you're proud of?</strong>
                                <div className="text-gray-600 italic mt-1">
                                  Even showing up once a week is worth celebrating. Progress looks different for everyone.
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Write Yourself A Note Section */}
                        <div className="bg-white border-2 rounded-lg p-6" style={{borderColor: '#f3a8cb'}}>
                          <h4 className="font-bold text-pink-500 text-lg mb-4">WRITE YOURSELF A NOTE</h4>
                          <p className="text-gray-700 mb-4">Use this space to write down a message to your body or future self.</p>
                          
                          <textarea
                            className="w-full h-32 p-4 border-2 border-gray-200 rounded-lg resize-none focus:border-pink-400 focus:outline-none"
                            placeholder="Dear body, thank you for..."
                            style={{
                              fontSize: '14px',
                              lineHeight: '1.5',
                              fontFamily: 'inherit'
                            }}
                          />
                        </div>

                        {/* What Comes Next Section */}
                        <div className="bg-white border-2 rounded-lg p-6" style={{borderColor: '#f3a8cb'}}>
                          <h4 className="font-bold text-pink-500 text-lg mb-4">WHAT COMES NEXT?</h4>
                          <p className="text-gray-700 mb-4">If you feel:</p>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-start space-x-2">
                              <span className="text-pink-500 font-bold">✧</span>
                              <span>Stronger and more stable</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <span className="text-pink-500 font-bold">✧</span>
                              <span>Free from symptoms like doming or leaking</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <span className="text-pink-500 font-bold">✧</span>
                              <span>Ready for more challenge and variety</span>
                            </div>
                          </div>

                          <p className="text-gray-700 mb-4">
                            Then you should be ready to move into a strength training phase, or a return-to-impact program. 
                            But, if still healing? You can repeat this program again—or stay in your favourite phase a little 
                            longer. <strong>CELEBRATE YOUR WINS</strong> - Whether you finished every session or simply showed up 
                            when you could—That. Is. Enough.
                          </p>
                          
                          <div className="text-center mt-6">
                            <p className="text-lg text-pink-600 font-medium">Love Zoe 💕</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
              </div>
          ))}
        </div>
      </Card>
      
      {/* Navigation Buttons */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Continue Your Journey</h3>
          <p className="text-sm text-gray-600">Navigate through your recovery program</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center">
          {canGoPrevious() && (
            <Button
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 sm:px-8 py-4 sm:py-3 text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
              data-testid="button-previous-section-next-steps"
              onClick={navigateToPreviousTab}
            >
              <ChevronLeft className="w-4 h-4" />
              {getNavigationText('prev')}
            </Button>
          )}
          {canGoNext() && (
            <Button
              className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 sm:px-8 py-4 sm:py-3 text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
              data-testid="button-next-section-next-steps"
              onClick={navigateToNextTab}
            >
              {getNavigationText('next')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">Get answers to common questions</p>
        </div>
      </div>
    </div>
  );
}

function YouTubeModal({
  isOpen,
  onClose,
  videoUrl,
  title
}: {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
}) {
  return (
    <div>
      {/* YouTube Modal implementation */}
    </div>
  );
}
