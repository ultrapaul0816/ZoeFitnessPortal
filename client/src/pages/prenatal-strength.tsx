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
  Calendar,
  Baby,
  Apple,
  Brain,
  Menu,
  Sparkles,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Video,
  FileText,
  ExternalLink
} from "lucide-react";
import type { User } from "@shared/schema";

export default function PrenatalStrengthPage() {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("start-here");
  const [animatingNumber, setAnimatingNumber] = useState<number | null>(null);
  const prevActiveTabRef = useRef(activeTab);
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  const tabOrder = ["start-here", "understanding", "trimester1", "trimester2", "trimester3", "nutrition", "postpartum", "faqs"];

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
      'trimester2': 'Trimester 2',
      'trimester3': 'Trimester 3',
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

  const course = (courseData as any)?.course;
  const modules = (courseData as any)?.modules || [];

  const getModuleContent = (moduleId: string) => {
    return modules.find((m: any) => m.id === moduleId);
  };

  const renderModuleContent = (moduleData: any) => {
    if (!moduleData) return <p className="text-gray-500">Content coming soon...</p>;
    
    const sections = moduleData.sections || [];
    
    return (
      <div className="space-y-4">
        {sections.map((section: any, idx: number) => (
          <Accordion key={section.id || idx} type="single" collapsible>
            <AccordionItem value={section.id || `section-${idx}`} className="border rounded-lg bg-white shadow-sm">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-gray-800">{section.name}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {section.description && (
                  <p className="text-gray-600 mb-4">{section.description}</p>
                )}
                {section.contentItems && section.contentItems.length > 0 && (
                  <div className="space-y-3">
                    {section.contentItems.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {item.content_type === 'video' && <Video className="w-5 h-5 text-blue-500" />}
                        {item.content_type === 'text' && <FileText className="w-5 h-5 text-gray-500" />}
                        {item.content_type === 'pdf' && <FileText className="w-5 h-5 text-red-500" />}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.title}</p>
                          {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                        </div>
                        {item.video_url && (
                          <a href={item.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
    );
  };

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
                    <p className="text-xs sm:text-sm text-gray-600 font-medium mt-0.5">Stay strong and healthy during your pregnancy</p>
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
                    <span className="text-gray-700 font-medium">Your prenatal fitness journey</span>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span className="text-purple-600 font-semibold text-xs">12-Week Program</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto scrollbar-hide px-0">
              <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
                <TabsList className="tab-flow-container flex gap-2 sm:gap-3 md:gap-4 h-auto bg-transparent border-0 shadow-none w-max md:w-full md:grid md:grid-cols-8 mx-0">
                  <TabsTrigger value="start-here" data-testid="tab-start-here" className="text-xs sm:text-sm min-h-[60px] sm:min-h-[65px] md:min-h-[60px] min-w-[70px] sm:min-w-[75px] md:min-w-[80px] flex-col p-2 sm:p-3 md:p-4 bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-purple-300 relative z-10 flex-shrink-0">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mb-1 sm:mb-2" />
                    <span className="font-medium text-center leading-tight">Start Here</span>
                  </TabsTrigger>
                  <TabsTrigger value="understanding" data-testid="tab-understanding" className="text-xs sm:text-sm min-h-[60px] sm:min-h-[65px] md:min-h-[60px] min-w-[70px] sm:min-w-[75px] md:min-w-[80px] flex-col p-2 sm:p-3 md:p-4 bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-purple-300 relative z-10 flex-shrink-0">
                    <Brain className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mb-1 sm:mb-2" />
                    <span className="font-medium text-center leading-tight">Your Body</span>
                  </TabsTrigger>
                  <TabsTrigger value="trimester1" data-testid="tab-trimester1" className="text-xs sm:text-sm min-h-[60px] sm:min-h-[65px] md:min-h-[60px] min-w-[70px] sm:min-w-[75px] md:min-w-[80px] flex-col p-2 sm:p-3 md:p-4 bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-purple-300 relative z-10 flex-shrink-0">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mb-1 sm:mb-2" />
                    <span className="font-medium text-center leading-tight">Trim 1</span>
                  </TabsTrigger>
                  <TabsTrigger value="trimester2" data-testid="tab-trimester2" className="text-xs sm:text-sm min-h-[60px] sm:min-h-[65px] md:min-h-[60px] min-w-[70px] sm:min-w-[75px] md:min-w-[80px] flex-col p-2 sm:p-3 md:p-4 bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-purple-300 relative z-10 flex-shrink-0">
                    <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mb-1 sm:mb-2" />
                    <span className="font-medium text-center leading-tight">Trim 2</span>
                  </TabsTrigger>
                  <TabsTrigger value="trimester3" data-testid="tab-trimester3" className="text-xs sm:text-sm min-h-[60px] sm:min-h-[65px] md:min-h-[60px] min-w-[70px] sm:min-w-[75px] md:min-w-[80px] flex-col p-2 sm:p-3 md:p-4 bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-purple-300 relative z-10 flex-shrink-0">
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mb-1 sm:mb-2" />
                    <span className="font-medium text-center leading-tight">Trim 3</span>
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
                  
                  const colors = ['#c084fc', '#a78bfa', '#818cf8', '#6366f1', '#8b5cf6', '#14b8a6', '#f472b6', '#ec4899'];
                  
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
                      <strong>IMPORTANT:</strong> Always consult your healthcare provider before starting any exercise program during pregnancy. Listen to your body and stop if you feel any discomfort.
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <TabsContent value="start-here" className="mt-6">
            <Card className="bg-gradient-to-br from-white to-purple-50 border-purple-200 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-purple-800 mb-2">Welcome - Start Here</h2>
                <p className="text-gray-600 mb-6">Essential preparatory information for your prenatal fitness journey</p>
                {renderModuleContent(getModuleContent('prenatal-start-here'))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="understanding" className="mt-6">
            <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-blue-800 mb-2">Understanding Your Changing Body</h2>
                <p className="text-gray-600 mb-6">Learn how your body changes during pregnancy and how to exercise safely</p>
                {renderModuleContent(getModuleContent('prenatal-understanding-body'))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trimester1" className="mt-6">
            <Card className="bg-gradient-to-br from-white to-indigo-50 border-indigo-200 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-indigo-800 mb-2">Trimester 1: Foundation</h2>
                <p className="text-gray-600 mb-6">Build a strong foundation during your first trimester</p>
                {renderModuleContent(getModuleContent('prenatal-trimester-1'))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trimester2" className="mt-6">
            <Card className="bg-gradient-to-br from-white to-violet-50 border-violet-200 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-violet-800 mb-2">Trimester 2: Strength</h2>
                <p className="text-gray-600 mb-6">Maintain and build strength during your second trimester</p>
                {renderModuleContent(getModuleContent('prenatal-trimester-2'))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trimester3" className="mt-6">
            <Card className="bg-gradient-to-br from-white to-pink-50 border-pink-200 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-pink-800 mb-2">Trimester 3: Preparation</h2>
                <p className="text-gray-600 mb-6">Prepare your body for birth in your third trimester</p>
                {renderModuleContent(getModuleContent('prenatal-trimester-3'))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nutrition" className="mt-6">
            <Card className="bg-gradient-to-br from-white to-teal-50 border-teal-200 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-teal-800 mb-2">Nutrition & Hydration</h2>
                <p className="text-gray-600 mb-6">Fuel your body and baby with proper nutrition</p>
                {renderModuleContent(getModuleContent('prenatal-nutrition'))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="postpartum" className="mt-6">
            <Card className="bg-gradient-to-br from-white to-rose-50 border-rose-200 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-rose-800 mb-2">Preparing for Postpartum</h2>
                <p className="text-gray-600 mb-6">Get ready for your recovery after birth</p>
                {renderModuleContent(getModuleContent('prenatal-whats-next'))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faqs" className="mt-6">
            <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Frequently Asked Questions</h2>
                <p className="text-gray-600 mb-6">Common questions about prenatal fitness</p>
                {renderModuleContent(getModuleContent('prenatal-faq'))}
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
