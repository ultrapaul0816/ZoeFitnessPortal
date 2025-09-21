import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import anatomyImage from "@assets/Screenshot 2025-09-21 at 14.30.34_1758445266265.png";
import breathingDiagram from "@assets/Screenshot 2025-09-21 at 14.32.23_1758445423086.png";
import tvaContentImage from "@assets/Screenshot 2025-09-21 at 14.38.24_1758445791011.png";
import tvaSkeletonImage from "@assets/Screenshot 2025-09-21 at 14.39.32_1758445791002.png";
import coreActivationImage from "@assets/Screenshot 2025-09-21 at 14.47.02_1758446239897.png";
import breathCoreImage from "@assets/Screenshot 2025-09-21 at 14.44.45_1758446182185.png";
import coreCompressionsImage from "@assets/Screenshot 2025-09-21 at 14.49.22_1758446389051.png";
import pelvicFloorImage from "@assets/Screenshot 2025-09-21 at 14.54.10_1758446664540.png";
import breathingActivationImage from "@assets/Screenshot 2025-09-21 at 14.55.17_1758446754817.png";
import domingImage from "@assets/Screenshot 2025-09-21 at 14.56.03_1758446776736.png";
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
  TrendingUp,
  Activity
} from "lucide-react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

export default function HealYourCorePage() {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [programId, setProgramId] = useState<string>("");
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isProgressExpanded, setIsProgressExpanded] = useState(false);

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

  // Check if user has seen welcome modal
  useEffect(() => {
    if (user && (accessData as any)?.hasAccess) {
      const hasSeenWelcome = localStorage.getItem(`heal-your-core-welcome-${user.id}`);
      if (!hasSeenWelcome) {
        setShowWelcomeModal(true);
      }
    }
  }, [user, accessData]);

  const handleWelcomeClose = (dontShowAgain: boolean) => {
    if (user && dontShowAgain) {
      localStorage.setItem(`heal-your-core-welcome-${user.id}`, 'true');
    }
    setShowWelcomeModal(false);
  };

  if (!user || !healYourCoreProgram) {
    return <div>Loading...</div>;
  }

  if (!(accessData as any)?.hasAccess) {
    return (
      <div className="min-h-screen bg-background p-6">
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline"
            onClick={() => navigate("/dashboard")}
            data-testid="button-back"
            className="bg-white hover:bg-gray-50 border-gray-300 shadow-sm px-4 py-2 rounded-lg font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Badge className="bg-gradient-to-r from-pink-400 to-pink-600 text-white px-4 py-2 text-sm font-semibold shadow-lg border-0">
            {healYourCoreProgram.level}
          </Badge>
        </div>

        {/* Progress Section */}
        <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-pink-100 shadow-lg">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-pink-500 to-pink-700 bg-clip-text text-transparent">Hello {user.firstName}!</h3>
                  <p className="text-xs md:text-sm text-gray-600 font-medium">{completedWeeks}/6 weeks completed</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="text-right space-y-1 md:space-y-2">
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-500 to-pink-700 bg-clip-text text-transparent">{Math.round(progressPercentage)}%</div>
                  <div className="w-20 md:w-28">
                    <Progress value={progressPercentage} className="h-2 md:h-3 bg-gray-200">
                      <div className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full transition-all duration-300 ease-out" style={{width: `${progressPercentage}%`}} />
                    </Progress>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsProgressExpanded(!isProgressExpanded)}
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-pink-200 hover:bg-pink-50 p-0 ml-2 md:ml-4"
                  data-testid="button-toggle-progress"
                >
                  <ChevronDown className={`w-4 h-4 text-pink-600 transition-transform duration-200 ${isProgressExpanded ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Expandable Progress Details */}
        {isProgressExpanded && (
          <Card className="animate-in slide-in-from-top-2 duration-300">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Your Healing Journey</h3>
                  <p className="text-muted-foreground">
                    Welcome to your personalized postnatal core recovery program. This journey has been 
                    carefully designed to help you safely rebuild your core strength, address diastasis recti, 
                    and support your overall postpartum recovery.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">Current Week</span>
                      <span className="text-primary font-bold">Week {Math.min(completedWeeks + 1, 6)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">Total Progress</span>
                      <span className="text-primary font-bold">{completedWeeks}/6 weeks</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Video className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Welcome Video from Zoe</p>
                      <p className="text-xs text-muted-foreground mt-1">Click to play</p>
                    </div>
                  </div>
                  <Button 
                    className="absolute inset-0 w-full h-full bg-black/20 hover:bg-black/30 text-white"
                    variant="ghost"
                    data-testid="button-play-welcome-video"
                  >
                    <Play className="w-8 h-8" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Tabs */}
        <Tabs defaultValue="welcome" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="flex w-full md:grid md:grid-cols-7 gap-1 md:gap-3 h-auto p-2 md:p-3 bg-gray-50 rounded-xl min-w-max md:min-w-0">
            <TabsTrigger value="welcome" data-testid="tab-welcome" className="text-xs sm:text-sm min-h-[70px] md:min-h-[60px] min-w-[80px] flex-col p-2 md:p-4 bg-white shadow-sm hover:shadow-md border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-pink-300">
              <BookOpen className="w-6 h-6 md:w-5 md:h-5 mb-2" />
              <span className="font-medium">Welcome</span>
            </TabsTrigger>
            <TabsTrigger value="cardio" data-testid="tab-cardio" className="text-xs sm:text-sm min-h-[70px] md:min-h-[60px] min-w-[80px] flex-col p-2 md:p-4 bg-white shadow-sm hover:shadow-md border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-pink-300">
              <Activity className="w-6 h-6 md:w-5 md:h-5 mb-2" />
              <span className="font-medium text-center leading-tight">Cardio Plan</span>
            </TabsTrigger>
            <TabsTrigger value="understanding" data-testid="tab-understanding" className="text-xs sm:text-sm min-h-[70px] md:min-h-[60px] min-w-[80px] flex-col p-2 md:p-4 bg-white shadow-sm hover:shadow-md border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-pink-300">
              <Brain className="w-6 h-6 md:w-5 md:h-5 mb-2" />
              <span className="font-medium text-center leading-tight">Core</span>
            </TabsTrigger>
            <TabsTrigger value="healing" data-testid="tab-healing" className="text-xs sm:text-sm min-h-[70px] md:min-h-[60px] min-w-[80px] flex-col p-2 md:p-4 bg-white shadow-sm hover:shadow-md border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-pink-300">
              <Heart className="w-6 h-6 md:w-5 md:h-5 mb-2" />
              <span className="font-medium">Healing</span>
            </TabsTrigger>
            <TabsTrigger value="programs" data-testid="tab-programs" className="text-xs sm:text-sm min-h-[70px] md:min-h-[60px] min-w-[80px] flex-col p-2 md:p-4 bg-white shadow-sm hover:shadow-md border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-pink-300">
              <Dumbbell className="w-6 h-6 md:w-5 md:h-5 mb-2" />
              <span className="font-medium">Programs</span>
            </TabsTrigger>
            <TabsTrigger value="next-steps" data-testid="tab-next-steps" className="text-xs sm:text-sm min-h-[70px] md:min-h-[60px] min-w-[80px] flex-col p-2 md:p-4 bg-white shadow-sm hover:shadow-md border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-pink-300">
              <ChartBar className="w-6 h-6 md:w-5 md:h-5 mb-2" />
              <span className="font-medium">Next</span>
            </TabsTrigger>
            <TabsTrigger value="nutrition" data-testid="tab-nutrition" className="text-xs sm:text-sm min-h-[70px] md:min-h-[60px] min-w-[80px] flex-col p-2 md:p-4 bg-white shadow-sm hover:shadow-md border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-pink-300">
              <Apple className="w-6 h-6 md:w-5 md:h-5 mb-2" />
              <span className="font-medium">Nutrition</span>
            </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="welcome">
            <WelcomeSection />
          </TabsContent>

          <TabsContent value="cardio">
            <CardioSection />
          </TabsContent>

          <TabsContent value="understanding">
            <UnderstandingYourCoreSection 
              articles={Array.isArray(knowledgeArticles) ? knowledgeArticles : []} 
              onArticleClick={setSelectedArticle}
            />
          </TabsContent>

          <TabsContent value="healing">
            <LetHealingBeginSection />
          </TabsContent>

          <TabsContent value="programs">
            <YourSixCoreProgramsSection programId={programId} />
          </TabsContent>

          <TabsContent value="next-steps">
            <WhatComesNextSection 
              userId={user.id} 
              programId={programId} 
              progressEntries={Array.isArray(progressEntries) ? progressEntries : []} 
            />
          </TabsContent>

          <TabsContent value="nutrition">
            <TheRoleOfNutritionSection />
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
        <ZoeWelcomeModal 
          isOpen={showWelcomeModal}
          onClose={handleWelcomeClose}
        />
      </div>
    </div>
  );
}

function WelcomeSection() {
  const [expandedTopics, setExpandedTopics] = useState<{[key: string]: boolean}>({});

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
        <CardContent className="p-6">
          {/* Welcome Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">✨ Welcome - Start Here</h2>
            <p className="text-muted-foreground text-sm">
              Essential preparatory information for your core recovery journey
            </p>
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
                  <div className="w-full border-t border-gray-200 shadow-sm"></div>
                </div>
              </div>
            </div>

            {/* Topic 2: When to Start This Program */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">2</span>
                  <h3 className="text-[15px] font-semibold text-left">When to Start This Program</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTopic('when-start')}
                  className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-pink-500 hover:to-pink-700 p-0"
                  data-testid="button-toggle-when-start"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['when-start'] ? 'rotate-180' : ''}`} />
                </Button>
              </div>
              {expandedTopics['when-start'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-4">
                    <p className="text-sm">
                      You can begin this program anytime from 6 weeks postpartum with a vaginal delivery and 8-10 weeks post a C-section (or once cleared by your healthcare provider). However, it is highly recommended to start breath work and gentle reconnection much earlier. This is safe for both vaginal and C-section recoveries, take notes and modifications where needed.
                    </p>
                    
                    <div>
                      <p className="font-semibold text-primary text-sm mb-3">This program is suitable whether you're:</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span>6 weeks, 6 months, or even 6 years postpartum</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span>Managing diastasis recti or just looking to feel strong again</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span>Starting fresh after a break or following your initial rehab phase</span>
                        </li>
                      </ul>
                    </div>
                    
                    <p className="text-sm">
                      If you've had complications or are unsure where to begin, please consult your doctor or pelvic health physiotherapist first.
                    </p>
                    
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-yellow-600 text-lg">⚠️</span>
                        <p className="font-semibold text-primary text-sm">Important notes before you begin</p>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span>This is not a "no pain, no gain" plan. Your healing journey is valid no matter the pace.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span>Listen to your body: if something feels off, pause and consult your provider.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span>You do not need a flat stomach or a perfect gap to be strong or functional.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span>Give yourself permission to begin again—this is about building trust with your body.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 shadow-sm"></div>
                </div>
              </div>
            </div>

            {/* Topic 3: Safety & Mindset Shifts */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">3</span>
                  <h3 className="text-[15px] font-semibold text-left">Safety & Mindset Shifts</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTopic('safety-mindset')}
                  className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-pink-500 hover:to-pink-700 p-0"
                  data-testid="button-toggle-safety-mindset"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['safety-mindset'] ? 'rotate-180' : ''}`} />
                </Button>
              </div>
              {expandedTopics['safety-mindset'] && (
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
                  <div className="w-full border-t border-gray-200 shadow-sm"></div>
                </div>
              </div>
            </div>

            {/* Topic 4: Special Considerations for Each Delivery Type */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3 flex-1">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">4</span>
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
                  <div className="w-full border-t border-gray-200 shadow-sm"></div>
                </div>
              </div>
            </div>

            {/* Topic 5: How to Use This Guide */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">5</span>
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
                  <div className="w-full border-t border-gray-200 shadow-sm"></div>
                </div>
              </div>
            </div>

            {/* Topic 6: Disclaimer */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">6</span>
                  <h3 className="text-[15px] font-semibold text-left">Disclaimer</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTopic('disclaimer')}
                  className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-pink-500 hover:to-pink-700 p-0"
                  data-testid="button-toggle-disclaimer"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['disclaimer'] ? 'rotate-180' : ''}`} />
                </Button>
              </div>
              {expandedTopics['disclaimer'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-6 text-sm">
                    
                    <div>
                      <p className="font-semibold text-primary mb-3">General Disclaimer:</p>
                      <p className="leading-relaxed">
                        "Stronger with Zoe – Postnatal Health & Fitness Bible" is designed to provide general information and support for postpartum women on their recovery, health, and fitness journey. The information and exercises provided are for educational purposes only and are not intended to replace professional medical advice, diagnosis, or treatment from a qualified healthcare provider. Always consult with your physician, physiotherapist, or other qualified health provider regarding any medical condition, postpartum recovery concerns, or exercise regimen.
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-primary mb-3">Participant Responsibility:</p>
                      <p className="leading-relaxed">
                        Participation in any postnatal exercise program carries inherent risks, particularly following childbirth. It is the responsibility of each participant to consult with a healthcare provider before beginning this or any other exercise program. By using "Stronger with Zoe – Postnatal Health & Fitness Bible," you acknowledge that you have been cleared by your healthcare provider to engage in postpartum physical activities. You voluntarily assume all risks associated with participation and accept full responsibility for any potential injury, discomfort, or health complications that may arise.
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-primary mb-3">Limitation of Liability:</p>
                      <p className="leading-relaxed">
                        Zoe Modgill and "Stronger with Zoe" shall not be liable for any claims, demands, injuries, damages, actions, or causes of action that arise in connection with, or as a result of, the postnatal program, workouts, or any recommendations provided therein. Participants agree to release and hold harmless Zoe Modgill and any affiliated entities from and against any claims arising from their participation in the program.
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-primary mb-3">Accuracy of Information:</p>
                      <p className="leading-relaxed">
                        While every effort is made to ensure the accuracy of the information presented in this guide, "Stronger with Zoe" cannot guarantee that all information is up-to-date, accurate, or complete at all times. Health and fitness recommendations evolve, and individual needs may vary. Any reliance you place on the information in this guide is strictly at your own risk.
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-primary mb-3">Privacy:</p>
                      <p className="leading-relaxed">
                        Your privacy is of utmost importance. Any personal information you choose to share within "Stronger with Zoe" communities, coaching sessions, or discussions will be treated with confidentiality and will not be disclosed to any third party without your explicit consent, except as required by law.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Line Divider with Shadow */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 shadow-sm"></div>
              </div>
            </div>

            {/* Topic 7: What Equipment Do You Need */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">7</span>
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Row 1 */}
                      <div className="text-center">
                        <div className="bg-gray-100 rounded-lg p-4 mb-3 h-32 flex items-center justify-center">
                          <span className="text-3xl">🧘‍♀️</span>
                        </div>
                        <p className="font-medium">Yoga Mat</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="bg-gray-100 rounded-lg p-4 mb-3 h-32 flex items-center justify-center">
                          <span className="text-3xl">🟣</span>
                        </div>
                        <p className="font-medium">Yoga Blocks</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="bg-gray-100 rounded-lg p-4 mb-3 h-32 flex items-center justify-center">
                          <span className="text-3xl">🎀</span>
                        </div>
                        <p className="font-medium">Mini Resistance Bands</p>
                      </div>
                      
                      {/* Row 2 */}
                      <div className="text-center">
                        <div className="bg-gray-100 rounded-lg p-4 mb-3 h-32 flex items-center justify-center">
                          <span className="text-3xl">⚪</span>
                        </div>
                        <p className="font-medium">Mini Pilates Ball</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="bg-gray-100 rounded-lg p-4 mb-3 h-32 flex items-center justify-center">
                          <span className="text-3xl">🏃‍♀️</span>
                        </div>
                        <p className="font-medium">Pilates Theraband Or<br />Long Resistance Band</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="bg-gray-100 rounded-lg p-4 mb-3 h-32 flex items-center justify-center">
                          <span className="text-3xl">⚫</span>
                        </div>
                        <p className="font-medium">Medium Swiss Ball</p>
                      </div>
                      
                      {/* Row 3 - Foam Roller centered */}
                      <div className="text-center md:col-start-2">
                        <div className="bg-gray-100 rounded-lg p-4 mb-3 h-32 flex items-center justify-center">
                          <span className="text-3xl">🏋️</span>
                        </div>
                        <p className="font-medium">Foam Roller</p>
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
            </div>
          </div>

          {/* Next Section Button */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center">
              <Button
                className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-2 text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center"
                data-testid="button-next-section"
                onClick={() => {
                  // Navigate to the Cardio Plan tab
                  const cardioTab = document.querySelector('[data-testid="tab-cardio"]');
                  if (cardioTab) {
                    (cardioTab as HTMLElement).click();
                  }
                }}
              >
                Next Section
              </Button>
              <p className="text-sm text-muted-foreground mt-3">
                Ready to learn about cardio? Let's explore how to safely include cardio in your recovery.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CardioSection() {
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  const toggleTopic = (topic: string) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topic]: !prev[topic]
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center">🏃‍♀️ Cardio Plan</CardTitle>
          <CardDescription className="text-center">
            Safe and strategic cardiovascular training for your postpartum journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            
            {/* Topic 1: How to Include Cardio – Safely & Strategically */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">1</span>
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
                  <div className="w-full border-t border-gray-200 shadow-sm"></div>
                </div>
              </div>
            </div>

            {/* Topic 2: Cardio Plan Overview */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">2</span>
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
                  <div className="space-y-5">
                    <div className="text-center mb-6">
                      <h4 className="text-lg font-semibold text-pink-600 mb-2">CARDIO PLAN OVERVIEW ❤️</h4>
                      <p className="text-sm">The cardio is optional, but oh boy, will it increase your fitness, your results and overall confidence!</p>
                    </div>
                    
                    {/* Responsive Cardio Plan Table */}
                    <div className="overflow-x-auto -mx-6 px-6">
                      <table className="w-full text-xs sm:text-sm border-collapse border border-gray-300 min-w-[1000px]">
                        <thead>
                          <tr className="bg-pink-100">
                            <th className="border border-gray-300 p-2 text-pink-600 font-semibold hidden md:table-cell">WEEK</th>
                            <th className="border border-gray-300 p-2 text-pink-600 font-semibold hidden md:table-cell">PROGRAM</th>
                            <th className="border border-gray-300 p-2 text-pink-600 font-semibold">CARDIO FOCUS</th>
                            <th className="border border-gray-300 p-2 text-pink-600 font-semibold">INTENSITY</th>
                            <th className="border border-gray-300 p-2 text-pink-600 font-semibold">DURATION</th>
                            <th className="border border-gray-300 p-2 text-pink-600 font-semibold">DAYS</th>
                            <th className="border border-gray-300 p-2 text-pink-600 font-semibold">REST</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 p-2 bg-pink-50 font-semibold text-pink-600 hidden md:table-cell">1</td>
                            <td className="border border-gray-300 p-2 hidden md:table-cell">PROGRAM 1</td>
                            <td className="border border-gray-300 p-2">
                              <strong>LISS:</strong> <span className="text-xs">Gentle walks, breathing flows, stroller movement. Focus on blood flow, not effort.</span>
                            </td>
                            <td className="border border-gray-300 p-2">40–50% MHR</td>
                            <td className="border border-gray-300 p-2">10–15 mins</td>
                            <td className="border border-gray-300 p-2">Day 2, 4</td>
                            <td className="border border-gray-300 p-2">Day 6</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 p-2 bg-pink-50 font-semibold text-pink-600 hidden md:table-cell">2</td>
                            <td className="border border-gray-300 p-2 hidden md:table-cell">PROGRAM 2</td>
                            <td className="border border-gray-300 p-2">
                              <strong>LISS:</strong> <span className="text-xs">Brisk walks, swimming, light cycle. Maintain a steady rhythm. Use the Talk Test.</span>
                            </td>
                            <td className="border border-gray-300 p-2">50–60% MHR</td>
                            <td className="border border-gray-300 p-2">20 mins</td>
                            <td className="border border-gray-300 p-2">Day 2, 6</td>
                            <td className="border border-gray-300 p-2">Day 7</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 p-2 bg-pink-50 font-semibold text-pink-600 hidden md:table-cell">3</td>
                            <td className="border border-gray-300 p-2 hidden md:table-cell">PROGRAM 3</td>
                            <td className="border border-gray-300 p-2">
                              <strong>MISS:</strong> <span className="text-xs">Incline walk, spin bike, elliptical, or light jog. Slightly breathy but sustainable.</span>
                            </td>
                            <td className="border border-gray-300 p-2">60–70% MHR</td>
                            <td className="border border-gray-300 p-2">25–30 mins</td>
                            <td className="border border-gray-300 p-2">Day 1, 5</td>
                            <td className="border border-gray-300 p-2">Day 7</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 p-2 bg-pink-50 font-semibold text-pink-600 hidden md:table-cell">4</td>
                            <td className="border border-gray-300 p-2 hidden md:table-cell">PROGRAM 4</td>
                            <td className="border border-gray-300 p-2">
                              <strong>HIIT:</strong> <span className="text-xs">20secs work : 1–2 mins recovery. Use cycling, stair tops, or fast marching.</span>
                            </td>
                            <td className="border border-gray-300 p-2">Up to 75% MHR</td>
                            <td className="border border-gray-300 p-2">10 mins total</td>
                            <td className="border border-gray-300 p-2">Day 2, 6</td>
                            <td className="border border-gray-300 p-2">Day 7</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 p-2 bg-pink-50 font-semibold text-pink-600 hidden md:table-cell">5</td>
                            <td className="border border-gray-300 p-2 hidden md:table-cell">PROGRAM 5</td>
                            <td className="border border-gray-300 p-2">
                              <strong>HIIT:</strong> <span className="text-xs">30secs intense effort (cycle) : 1–2 min recovery. Build up to 6–8 rounds max.</span>
                            </td>
                            <td className="border border-gray-300 p-2">75–80% MHR</td>
                            <td className="border border-gray-300 p-2">15–20 mins</td>
                            <td className="border border-gray-300 p-2">Day 1, 5</td>
                            <td className="border border-gray-300 p-2">Day 7</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 p-2 bg-pink-50 font-semibold text-pink-600 hidden md:table-cell">6</td>
                            <td className="border border-gray-300 p-2 hidden md:table-cell">PROGRAM 6</td>
                            <td className="border border-gray-300 p-2">
                              <strong>HYBRID MISS + HIIT:</strong> <span className="text-xs">Start with steady cardio + finish with 2–3 short intervals. Push only if energy feels good.</span>
                            </td>
                            <td className="border border-gray-300 p-2">60–80% MHR</td>
                            <td className="border border-gray-300 p-2">20–30 mins</td>
                            <td className="border border-gray-300 p-2">Day 2, 4</td>
                            <td className="border border-gray-300 p-2">Day 6</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-6 space-y-4 text-xs sm:text-sm">
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-2">A FEW THINGS TO REMEMBER:</h5>
                        <ul className="space-y-1">
                          <li className="flex items-start gap-2">
                            <span className="text-pink-500 font-bold">❖</span>
                            <span><strong>MHR</strong> = Max Heart Rate (220 – your age × target % range)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-pink-500 font-bold">❖</span>
                            <span>Example for 30 yrs: 220–30 = 190 → 50% MHR = 95 BPM</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-pink-500 font-bold">❖</span>
                            <span>Rest or recovery walks can happen on any other day</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-pink-500 font-bold">❖</span>
                            <span>Feel free to shuffle days based on your energy and schedule, but try not to go more than 2 days without movement</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-pink-500 font-bold">❖</span>
                            <span>Always warm up (3–5 mins) and cool down</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-pink-500 font-bold">❖</span>
                            <span>Talk Test: You should be able to talk, not sing (LISS), or speak short phrases (MISS/HIIT)</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-2">QUICK DEFINITIONS:</h5>
                        <ul className="space-y-1">
                          <li className="flex items-start gap-2">
                            <span className="text-pink-500 font-bold">❖</span>
                            <span><strong className="text-pink-600">LISS:</strong> Slow & steady movement (walk, swim, light bike)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-pink-500 font-bold">❖</span>
                            <span><strong className="text-pink-600">MISS:</strong> Slightly faster, steady pace (jog, incline walk, elliptical)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-pink-500 font-bold">❖</span>
                            <span><strong className="text-pink-600">HIIT:</strong> Short bursts of effort followed by rest (30s : work / 90s : rest)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-pink-500 font-bold">❖</span>
                            <span><strong className="text-pink-600">MHR:</strong> Max Heart Rate = 220 – your age × % intensity</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 shadow-sm"></div>
                </div>
              </div>
            </div>

            {/* Topic 3: Your Training Schedule With Cardio */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">3</span>
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
                  <div className="space-y-5">
                    <div className="text-center mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">YOUR TRAINING SCHEDULE WITH CARDIO</h4>
                      <p className="text-sm">A gentle weekly rhythm to rebuild strength, core connection, and confidence. You ultimately will decide on the exact schedule (days) that work best for you. If you have to stop in the middle of a program because of interruptions (work, motherhood etc.), just make sure to go back where you left off and finish the rest of the exercises before the day is over.</p>
                    </div>
                    
                    {/* Responsive Weekly Schedule Table */}
                    <div className="overflow-x-auto -mx-6 px-6">
                      <table className="w-full text-xs sm:text-sm border-collapse border border-gray-300 min-w-[900px]">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-2 font-semibold">WEEK</th>
                            <th className="border border-gray-300 p-2 font-semibold">DAY 1</th>
                            <th className="border border-gray-300 p-2 font-semibold">DAY 2</th>
                            <th className="border border-gray-300 p-2 font-semibold">DAY 3</th>
                            <th className="border border-gray-300 p-2 font-semibold">DAY 4</th>
                            <th className="border border-gray-300 p-2 font-semibold">DAY 5</th>
                            <th className="border border-gray-300 p-2 font-semibold">DAY 6</th>
                            <th className="border border-gray-300 p-2 font-semibold">DAY 7</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 p-2 bg-pink-100 font-semibold text-pink-600">WEEK 1</td>
                            <td className="border border-gray-300 p-2">PROGRAM 1</td>
                            <td className="border border-gray-300 p-2">CARDIO</td>
                            <td className="border border-gray-300 p-2">PROGRAM 1</td>
                            <td className="border border-gray-300 p-2">CARDIO</td>
                            <td className="border border-gray-300 p-2">PROGRAM 1</td>
                            <td className="border border-gray-300 p-2">REST</td>
                            <td className="border border-gray-300 p-2">PROGRAM 1</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 p-2 bg-pink-100 font-semibold text-pink-600">WEEK 2</td>
                            <td className="border border-gray-300 p-2">PROGRAM 2</td>
                            <td className="border border-gray-300 p-2">CARDIO</td>
                            <td className="border border-gray-300 p-2">PROGRAM 2</td>
                            <td className="border border-gray-300 p-2">REST</td>
                            <td className="border border-gray-300 p-2">PROGRAM 2</td>
                            <td className="border border-gray-300 p-2">CARDIO</td>
                            <td className="border border-gray-300 p-2">REST</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 p-2 bg-pink-100 font-semibold text-pink-600">WEEK 3</td>
                            <td className="border border-gray-300 p-2">CARDIO</td>
                            <td className="border border-gray-300 p-2">PROGRAM 3</td>
                            <td className="border border-gray-300 p-2">REST</td>
                            <td className="border border-gray-300 p-2">PROGRAM 3</td>
                            <td className="border border-gray-300 p-2">CARDIO</td>
                            <td className="border border-gray-300 p-2">PROGRAM 3</td>
                            <td className="border border-gray-300 p-2">REST</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 p-2 bg-pink-100 font-semibold text-pink-600">WEEK 4</td>
                            <td className="border border-gray-300 p-2">PROGRAM 4</td>
                            <td className="border border-gray-300 p-2">CARDIO</td>
                            <td className="border border-gray-300 p-2">PROGRAM 4</td>
                            <td className="border border-gray-300 p-2">REST</td>
                            <td className="border border-gray-300 p-2">PROGRAM 4</td>
                            <td className="border border-gray-300 p-2">CARDIO</td>
                            <td className="border border-gray-300 p-2">REST</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 p-2 bg-pink-100 font-semibold text-pink-600">WEEK 5</td>
                            <td className="border border-gray-300 p-2">CARDIO</td>
                            <td className="border border-gray-300 p-2">PROGRAM 5</td>
                            <td className="border border-gray-300 p-2">REST</td>
                            <td className="border border-gray-300 p-2">PROGRAM 5</td>
                            <td className="border border-gray-300 p-2">CARDIO</td>
                            <td className="border border-gray-300 p-2">PROGRAM 5</td>
                            <td className="border border-gray-300 p-2">REST</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 p-2 bg-pink-100 font-semibold text-pink-600">WEEK 6</td>
                            <td className="border border-gray-300 p-2">PROGRAM 6</td>
                            <td className="border border-gray-300 p-2">CARDIO</td>
                            <td className="border border-gray-300 p-2">PROGRAM 6</td>
                            <td className="border border-gray-300 p-2">CARDIO</td>
                            <td className="border border-gray-300 p-2">PROGRAM 6</td>
                            <td className="border border-gray-300 p-2">REST</td>
                            <td className="border border-gray-300 p-2">PROGRAM 6</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Mobile-friendly summary for small screens */}
                    <div className="block sm:hidden mt-4 space-y-3 text-xs">
                      <div className="bg-pink-50 p-3 rounded-lg">
                        <p className="font-semibold text-pink-600 mb-2">💡 Mobile Tip:</p>
                        <p>Scroll the table horizontally to see all 7 days, or view the pattern:</p>
                        <ul className="mt-2 space-y-1">
                          <li>• <strong>Program days:</strong> Core strengthening workouts</li>
                          <li>• <strong>Cardio days:</strong> Follow the cardio plan above</li>
                          <li>• <strong>Rest days:</strong> Recovery or gentle walks</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Next Section Button */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center">
              <Button
                className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-2 text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center"
                data-testid="button-next-section-cardio"
                onClick={() => {
                  // Navigate to the Core tab (Understanding Your Core)
                  const coreTab = document.querySelector('[data-testid="tab-understanding"]');
                  if (coreTab) {
                    (coreTab as HTMLElement).click();
                  }
                }}
              >
                Next Section
              </Button>
              <p className="text-sm text-muted-foreground mt-3">
                Ready to dive deeper? Let's explore the foundation of your core recovery.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UnderstandingYourCoreSection({ 
  articles, 
  onArticleClick 
}: { 
  articles: any[]; 
  onArticleClick: (article: any) => void;
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
          <CardTitle className="text-xl font-semibold text-center">🧠 Understanding Your Core</CardTitle>
          <CardDescription className="text-center">
            Educational foundation to empower you with understanding the "why" behind your recovery
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
                  <div className="w-full border-t border-gray-200 shadow-sm"></div>
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
                  <div className="w-full border-t border-gray-200 shadow-sm"></div>
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
                      <p className="text-sm mb-3 text-primary font-semibold">CLICK HERE: <a href="https://www.youtube.com/watch?v=h7MxrsIGCxo" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">HOW TO CONNECT TO YOUR TVA</a> (get a yoga block)</p>
                      
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
                  <div className="w-full border-t border-gray-200 shadow-sm"></div>
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
                  <div className="w-full border-t border-gray-200 shadow-sm"></div>
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
                    
                    <div className="bg-primary/10 p-4 rounded">
                      <p className="font-semibold text-primary mb-2">Learn & Practice these!</p>
                      <p className="text-sm">CLICK HERE: <a href="https://youtube.com/watch?v=h_S_tq0-Pv0&feature=youtu.be" className="text-blue-600 underline font-semibold" target="_blank" rel="noopener noreferrer">CORE COMPRESSIONS - BELLY PUMP / DEEP CORE HOLD / AB WRAPS</a></p>
                    </div>

                    <p className="font-semibold text-sm">The 3 techniques explained below:</p>
                    
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
                  <div className="w-full border-t border-gray-200 shadow-sm"></div>
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
                  <div className="w-full border-t border-gray-200 shadow-sm"></div>
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
                    {/* Breathing + Core Activation Image */}
                    <div className="flex justify-center my-6">
                      <div className="bg-white p-4 rounded-lg shadow-sm border max-w-4xl">
                        <img 
                          src={breathingActivationImage} 
                          alt="When to use breathing and core activation - comprehensive guide with key principles and doming awareness"
                          className="w-full h-auto rounded"
                          data-testid="img-breathing-activation"
                        />
                      </div>
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
                          <span className="text-primary font-bold">▶</span>
                          <span className="font-semibold">CLICK HERE&gt; <a href="#" className="text-blue-600 underline">HOW TO GET UP CORRECTLY</a></span>
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
          <Button
            className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-2 text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center"
            data-testid="button-next-section-core"
            onClick={() => {
              // Navigate to the Healing tab
              const healingTab = document.querySelector('[data-testid="tab-healing"]');
              if (healingTab) {
                (healingTab as HTMLElement).click();
              }
            }}
          >
            Next Section
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            Ready to start your healing journey? Let's begin with your daily core routine.
          </p>
        </div>
      </div>
    </div>
  );
}

function LetHealingBeginSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>💙 Let Healing Begin</CardTitle>
          <CardDescription>
            Core rehabilitation and daily practice to kickstart your recovery journey
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Daily Reconnection Routine</CardTitle>
            <Badge variant="outline" className="mb-2 rounded-none px-4 py-2">Core Foundation</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your daily foundation for core reconnection. These gentle exercises can be done every day to rebuild your connection with your deep core muscles.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Morning Routine (5-10 mins)</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                    <span>360° Breathing - 10 breaths</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                    <span>Belly Pump - 5 reps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                    <span>Pelvic Floor Release - 5 breaths</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Evening Routine (5-10 mins)</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                    <span>Pelvic Floor Release - 5 breaths</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                    <span>360° Breathing - 10 breaths</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                    <span>Gentle body scan</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
        
        {/* Understanding Your Core & TVA Engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Understanding Your Core & TVA Engagement</CardTitle>
            <Badge variant="outline" className="mb-2 rounded-none px-4 py-2">Deep Core</Badge>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <p>Why "pull your belly in" isn't enough — and what to do instead. Before you can rebuild strength, you need to find your deep stabilizing muscles and learn how to activate them with proper breathing.</p>
            
            <div className="bg-muted/50 p-4 rounded">
              <p className="font-semibold mb-2">Steps to Activate Core:</p>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">1. INHALE (Prepare):</p>
                  <p>Expand ribs, belly, and back — no engagement yet.</p>
                </div>
                <div>
                  <p className="font-semibold">2. EXHALE (Activate): As you exhale:</p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>Gently lift the pelvic floor (imagine picking up a blueberry with your vagina or stopping gas).</li>
                    <li>At the same time, lightly draw your lower belly (below your belly button) toward your spine.</li>
                    <li>Keep ribs down (not flaring) and spine neutral.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">3. HOLD GENTLE ENGAGEMENT (During the movement):</p>
                  <p>You should still be able to breathe and talk — this is a light, supportive activation, not a hard brace.</p>
                </div>
                <div>
                  <p className="font-semibold">4. RELAX Completely after the movement.</p>
                  <p>Full relaxation is just as important to prevent over-tightening.</p>
                </div>
              </div>
            </div>
            
            <div className="text-center p-3 bg-primary/10 rounded">
              <p className="italic text-xs">The Purposeful Exhale. As you exhale you should feel an automatic tensioning of your abdominals, the muscles of your back and pelvic floor both tightening and lifting.</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Foundational Core Compressions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Foundational Core Compressions</CardTitle>
            <Badge variant="outline" className="mb-2 rounded-none px-4 py-2">Essential Tools</Badge>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
            <p>These are the 3 essential tools you'll use throughout your journey to connect to your deep core, support your spine, and move with intention.</p>
            <p className="font-semibold">Learn & Practice these!</p>
            
            <Button variant="outline" className="w-full text-primary mb-4 h-auto py-3">
              <Video className="w-4 h-4 mr-2" />
              CLICK HERE: CORE COMPRESSIONS - BELLY PUMP / DEEP CORE HOLD / AB WRAPS
            </Button>
            
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
              
              <Button variant="outline" className="w-full mt-2 text-primary h-auto py-3">
                <Video className="w-4 h-4 mr-2" />
                CLICK HERE: HOW TO GET UP CORRECTLY
              </Button>
              
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
            
            <Button variant="outline" className="w-full text-primary mb-3 h-auto py-3">
              <Video className="w-4 h-4 mr-2" />
              CLICK HERE: HOW TO CHECK FOR DIASTASIS RECTI
            </Button>
            
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
              <p className="font-semibold text-xs text-yellow-800 mb-1">⚠️ Disclaimer:</p>
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

        {/* Why Crunches Won't Work */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Why Crunches Won't Work</CardTitle>
            <Badge variant="outline" className="mb-2 rounded-none px-4 py-2">Important</Badge>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
            <p className="font-semibold text-red-600">Crunches and sit-ups increase intra-abdominal pressure, which pushes outward against the separation—further stretching the Linea alba instead of healing it. These exercises load the abdominal wall before it's ready, worsening doming, coning, and core dysfunction.</p>
            
            <div className="bg-primary/10 p-4 rounded text-center">
              <p className="font-semibold text-lg">THE FOCUS NEEDS TO BE ON:</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted/50 p-4 rounded">
                <p className="font-semibold mb-2">1. Pressure Management</p>
                <p className="text-xs">Understanding how pressure moves through the core during breath, lifting, or movement. The goal is to avoid excess intra-abdominal pressure by coordinating breath and posture.</p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded">
                <p className="font-semibold mb-2">2. Breath Coordination</p>
                <p className="text-xs">Practice 360° breathing where your ribs, belly, and back all expand on the inhale, and gently draw in and up on the exhale. This restores natural core function and reconnects the pelvic floor and TVA.</p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded">
                <p className="font-semibold mb-2">3. TVA Activation</p>
                <p className="text-xs">The transverse abdominis is like a natural corset wrapping around your spine and organs. Training it through controlled movement and breath helps flatten and support the abdominal wall from the inside out.</p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded">
                <p className="font-semibold mb-2">4. Alignment & Core-Pelvic Synergy</p>
                <p className="text-xs">Learn how your posture and rib cage position influence pressure. When your ribs are flared or your pelvis is tilted, your core system is out of sync. Restoring alignment helps all core muscles work together safely.</p>
              </div>
            </div>
          </CardContent>
        </Card>

function YourSixCoreProgramsSection({ programId }: { programId: string }) {
  const programs = [
    { number: 1, title: "Reconnect & Reset", sessions: 4, description: "Foundation building and body awareness" },
    { number: 2, title: "Stability & Breathwork", sessions: 3, description: "Strengthening breath connection" },
    { number: 3, title: "Activate & Strengthen", sessions: 4, description: "Building functional strength" },
    { number: 4, title: "Integrate & Flow", sessions: 3, description: "Movement coordination" },
    { number: 5, title: "Expand & Progress", sessions: 4, description: "Advanced strengthening" },
    { number: 6, title: "Transform & Thrive", sessions: 4, description: "Full integration and confidence" }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🎯 Your Six Core Programs</CardTitle>
          <CardDescription>
            Progressive training designed to rebuild your core strength safely
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {programs.map((program) => (
              <Card 
                key={program.number} 
                className="border-l-4 border-l-primary hover:shadow-md transition-shadow"
                data-testid={`card-program-${program.number}`}
              >
                <CardHeader>
                  <CardTitle className="text-lg font-medium">
                    Program {program.number}: {program.title}
                  </CardTitle>
                  <Badge variant="outline" className="w-fit rounded-none px-4 py-2">
                    {program.sessions} Sessions
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {program.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Core Program Components

function TheRoleOfNutritionSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🍎 The Role of Nutrition</CardTitle>
          <CardDescription>
            Nutritional guidance giving the importance it deserves for your core recovery
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Nutrition for Core Repair</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <p className="text-muted-foreground">
              Why nutrition is vital for core recovery and tissue repair
            </p>
            <div>
              <h4 className="font-semibold mb-2">Key Foods & Nutrients:</h4>
              <ul className="space-y-1">
                <li>• High-quality protein for tissue repair</li>
                <li>• Collagen-supporting nutrients</li>
                <li>• Anti-inflammatory foods</li>
                <li>• Hydration for tissue health</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Meal Planning</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <p className="text-muted-foreground">
              Simple meal planning strategies for busy mothers
            </p>
            <div>
              <h4 className="font-semibold mb-2">Quick Prep Ideas:</h4>
              <ul className="space-y-1">
                <li>• Batch cooking on weekends</li>
                <li>• Protein-rich snacks ready</li>
                <li>• Easy one-pot meals</li>
                <li>• Nutrient-dense smoothies</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function WhatComesNextSection({ userId, programId, progressEntries }: {
  userId: string;
  programId: string;
  progressEntries: Array<any>;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🚀 What Comes Next</CardTitle>
          <CardDescription>
            Your journey continues - track progress and plan your next steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Continue building on your core foundation with progressive challenges and ongoing support.
          </p>
        </CardContent>
      </Card>
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
