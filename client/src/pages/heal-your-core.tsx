import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
                  <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-semibold text-sm shrink-0">1</div>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTopic('cardio-safety')}
                  className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-pink-500 hover:to-pink-700 p-0"
                  data-testid="button-toggle-cardio-safety"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['cardio-safety'] ? 'rotate-180' : ''}`} />
                </Button>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTopic('cardio-overview')}
                  className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-pink-500 hover:to-pink-700 p-0"
                  data-testid="button-toggle-cardio-overview"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['cardio-overview'] ? 'rotate-180' : ''}`} />
                </Button>
              </div>
              {expandedTopics['cardio-overview'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-5">
                    <div className="text-center mb-6">
                      <h4 className="text-lg font-semibold text-pink-600 mb-2">CARDIO PLAN OVERVIEW ❤️</h4>
                      <p className="text-sm">The cardio is optional, but oh boy, will it increase your fitness, your results and overall confidence!</p>
                    </div>
                    
                    {/* Responsive Cardio Plan Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs sm:text-sm border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-pink-100">
                            <th className="border border-gray-300 p-2 text-pink-600 font-semibold">WEEK</th>
                            <th className="border border-gray-300 p-2 text-pink-600 font-semibold">PROGRAM</th>
                            <th className="border border-gray-300 p-2 text-pink-600 font-semibold">CARDIO FOCUS</th>
                            <th className="border border-gray-300 p-2 text-pink-600 font-semibold">INTENSITY</th>
                            <th className="border border-gray-300 p-2 text-pink-600 font-semibold">DURATION</th>
                            <th className="border border-gray-300 p-2 text-pink-600 font-semibold hidden sm:table-cell">DAYS</th>
                            <th className="border border-gray-300 p-2 text-pink-600 font-semibold hidden sm:table-cell">REST</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 p-2 bg-pink-50 font-semibold text-pink-600">1</td>
                            <td className="border border-gray-300 p-2">PROGRAM 1</td>
                            <td className="border border-gray-300 p-2">
                              <strong>LISS:</strong> <span className="text-xs">Gentle walks, breathing flows, stroller movement. Focus on blood flow, not effort.</span>
                            </td>
                            <td className="border border-gray-300 p-2">40–50% MHR</td>
                            <td className="border border-gray-300 p-2">10–15 mins</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">Day 2, 4</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">Day 6</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 p-2 bg-pink-50 font-semibold text-pink-600">2</td>
                            <td className="border border-gray-300 p-2">PROGRAM 2</td>
                            <td className="border border-gray-300 p-2">
                              <strong>LISS:</strong> <span className="text-xs">Brisk walks, swimming, light cycle. Maintain a steady rhythm. Use the Talk Test.</span>
                            </td>
                            <td className="border border-gray-300 p-2">50–60% MHR</td>
                            <td className="border border-gray-300 p-2">20 mins</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">Day 2, 6</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">Day 7</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 p-2 bg-pink-50 font-semibold text-pink-600">3</td>
                            <td className="border border-gray-300 p-2">PROGRAM 3</td>
                            <td className="border border-gray-300 p-2">
                              <strong>MISS:</strong> <span className="text-xs">Incline walk, spin bike, elliptical, or light jog. Slightly breathy but sustainable.</span>
                            </td>
                            <td className="border border-gray-300 p-2">60–70% MHR</td>
                            <td className="border border-gray-300 p-2">25–30 mins</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">Day 1, 5</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">Day 7</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 p-2 bg-pink-50 font-semibold text-pink-600">4</td>
                            <td className="border border-gray-300 p-2">PROGRAM 4</td>
                            <td className="border border-gray-300 p-2">
                              <strong>HIIT:</strong> <span className="text-xs">20secs work : 1–2 mins recovery. Use cycling, stair tops, or fast marching.</span>
                            </td>
                            <td className="border border-gray-300 p-2">Up to 75% MHR</td>
                            <td className="border border-gray-300 p-2">10 mins total</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">Day 2, 6</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">Day 7</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 p-2 bg-pink-50 font-semibold text-pink-600">5</td>
                            <td className="border border-gray-300 p-2">PROGRAM 5</td>
                            <td className="border border-gray-300 p-2">
                              <strong>HIIT:</strong> <span className="text-xs">30secs intense effort (cycle) : 1–2 min recovery. Build up to 6–8 rounds max.</span>
                            </td>
                            <td className="border border-gray-300 p-2">75–80% MHR</td>
                            <td className="border border-gray-300 p-2">15–20 mins</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">Day 1, 5</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">Day 7</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 p-2 bg-pink-50 font-semibold text-pink-600">6</td>
                            <td className="border border-gray-300 p-2">PROGRAM 6</td>
                            <td className="border border-gray-300 p-2">
                              <strong>HYBRID MISS + HIIT:</strong> <span className="text-xs">Start with steady cardio + finish with 2–3 short intervals. Push only if energy feels good.</span>
                            </td>
                            <td className="border border-gray-300 p-2">60–80% MHR</td>
                            <td className="border border-gray-300 p-2">20–30 mins</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">Day 2, 4</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">Day 6</td>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTopic('cardio-schedule')}
                  className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-pink-500 hover:to-pink-700 p-0"
                  data-testid="button-toggle-cardio-schedule"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['cardio-schedule'] ? 'rotate-180' : ''}`} />
                </Button>
              </div>
              {expandedTopics['cardio-schedule'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-5">
                    <div className="text-center mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">YOUR TRAINING SCHEDULE WITH CARDIO</h4>
                      <p className="text-sm">A gentle weekly rhythm to rebuild strength, core connection, and confidence. You ultimately will decide on the exact schedule (days) that work best for you. If you have to stop in the middle of a program because of interruptions (work, motherhood etc.), just make sure to go back where you left off and finish the rest of the exercises before the day is over.</p>
                    </div>
                    
                    {/* Responsive Weekly Schedule Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs sm:text-sm border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-2 font-semibold">WEEK</th>
                            <th className="border border-gray-300 p-2 font-semibold">DAY 1</th>
                            <th className="border border-gray-300 p-2 font-semibold">DAY 2</th>
                            <th className="border border-gray-300 p-2 font-semibold">DAY 3</th>
                            <th className="border border-gray-300 p-2 font-semibold hidden sm:table-cell">DAY 4</th>
                            <th className="border border-gray-300 p-2 font-semibold hidden sm:table-cell">DAY 5</th>
                            <th className="border border-gray-300 p-2 font-semibold hidden sm:table-cell">DAY 6</th>
                            <th className="border border-gray-300 p-2 font-semibold hidden md:table-cell">DAY 7</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 p-2 bg-pink-100 font-semibold text-pink-600">WEEK 1</td>
                            <td className="border border-gray-300 p-2">PROGRAM 1</td>
                            <td className="border border-gray-300 p-2">CARDIO</td>
                            <td className="border border-gray-300 p-2">PROGRAM 1</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">CARDIO</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">PROGRAM 1</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">REST</td>
                            <td className="border border-gray-300 p-2 hidden md:table-cell">PROGRAM 1</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 p-2 bg-pink-100 font-semibold text-pink-600">WEEK 2</td>
                            <td className="border border-gray-300 p-2">PROGRAM 2</td>
                            <td className="border border-gray-300 p-2">CARDIO</td>
                            <td className="border border-gray-300 p-2">PROGRAM 2</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">REST</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">PROGRAM 2</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">CARDIO</td>
                            <td className="border border-gray-300 p-2 hidden md:table-cell">REST</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 p-2 bg-pink-100 font-semibold text-pink-600">WEEK 3</td>
                            <td className="border border-gray-300 p-2">CARDIO</td>
                            <td className="border border-gray-300 p-2">PROGRAM 3</td>
                            <td className="border border-gray-300 p-2">REST</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">PROGRAM 3</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">CARDIO</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">PROGRAM 3</td>
                            <td className="border border-gray-300 p-2 hidden md:table-cell">REST</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 p-2 bg-pink-100 font-semibold text-pink-600">WEEK 4</td>
                            <td className="border border-gray-300 p-2">PROGRAM 4</td>
                            <td className="border border-gray-300 p-2">CARDIO</td>
                            <td className="border border-gray-300 p-2">PROGRAM 4</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">REST</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">PROGRAM 4</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">CARDIO</td>
                            <td className="border border-gray-300 p-2 hidden md:table-cell">REST</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 p-2 bg-pink-100 font-semibold text-pink-600">WEEK 5</td>
                            <td className="border border-gray-300 p-2">CARDIO</td>
                            <td className="border border-gray-300 p-2">PROGRAM 5</td>
                            <td className="border border-gray-300 p-2">REST</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">PROGRAM 5</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">CARDIO</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">PROGRAM 5</td>
                            <td className="border border-gray-300 p-2 hidden md:table-cell">REST</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 p-2 bg-pink-100 font-semibold text-pink-600">WEEK 6</td>
                            <td className="border border-gray-300 p-2">PROGRAM 6</td>
                            <td className="border border-gray-300 p-2">CARDIO</td>
                            <td className="border border-gray-300 p-2">PROGRAM 6</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">CARDIO</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">PROGRAM 6</td>
                            <td className="border border-gray-300 p-2 hidden sm:table-cell">REST</td>
                            <td className="border border-gray-300 p-2 hidden md:table-cell">PROGRAM 6</td>
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
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">🧠 Understanding Your Core</CardTitle>
          <CardDescription>
            Educational foundation to empower you with understanding the "why" behind your recovery
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="space-y-6" data-section="understanding-core" id="understanding-core-section">
        {/* Breathing & Core Activation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Breathing & Core Activation</CardTitle>
            <Badge variant="outline" className="mb-2 rounded-none px-4 py-2">Fundamentals</Badge>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <p className="font-semibold text-primary">Learning how to breathe properly is essential to activating your deep core muscles safely.</p>
            <p>Breathwork becomes the foundation for every movement, helping reduce pressure on the abdominal wall and pelvic floor, preventing diastasis recti and pelvic floor dysfunction.</p>
            
            <div className="bg-muted/50 p-4 rounded">
              <p className="font-semibold mb-2">Understanding the "Core Canister"</p>
              <p className="mb-2">Think of your core as a canister:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>The top is your diaphragm (breathing muscle).</li>
                <li>The bottom is your pelvic floor.</li>
                <li>The sides and front are your deep abdominal muscles (transverse abdominis).</li>
                <li>The back is your spine and deep back muscles.</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">When you inhale and exhale properly, these parts work together to create pressure and stability. Mismanaged breathing (like shallow chest breathing or breath holding) can weaken this system.</p>
            </div>
          </CardContent>
        </Card>
        
        {/* 360° Breathing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">How to Breathe Properly: 360° Breathing</CardTitle>
            <Badge variant="outline" className="mb-2 rounded-none px-4 py-2">Essential Skill</Badge>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <p>360° breathing is a deep, diaphragmatic breathing technique that encourages expansion in all directions — front, sides, and back — rather than just the chest or belly.</p>
            
            <div className="bg-muted/50 p-4 rounded">
              <p className="font-semibold mb-2">Steps to Practice 360° Breathing:</p>
              <Button variant="outline" className="mb-3 w-full text-primary h-auto py-3">
                <Video className="w-4 h-4 mr-2" />
                <div className="text-center">
                  <div>CLICK HERE: 360° BREATHING</div>
                  <div className="text-xs">(any comfortable position)</div>
                </div>
              </Button>
              <ol className="ml-4 list-decimal space-y-2">
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
                    <li>Gently engage your deep core</li>
                    <li>(your lower belly will naturally "hug in" slightly without forcefully sucking in).</li>
                  </ul>
                </li>
              </ol>
            </div>
            
            <div className="text-center p-3 bg-primary/10 rounded">
              <p className="italic font-medium">Think "expand in all directions on inhale, gently recoil on exhale."</p>
            </div>
          </CardContent>
        </Card>
        
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
      </div>
      
      {articles.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Additional Resources</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <Card 
                key={article.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onArticleClick(article)}
                data-testid={`card-article-${article.id}`}
              >
                <CardHeader>
                  <CardTitle className="text-lg font-medium">{article.title}</CardTitle>
                  <Badge variant="outline" className="w-fit rounded-none px-4 py-2">
                    {article.category.replace('-', ' ')}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {article.content}
                  </p>
                  {article.videoUrl && (
                    <div className="flex items-center gap-2 text-primary text-sm">
                      <Video className="w-4 h-4" />
                      <span>Includes video content</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
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
                    <span>Gentle Core Activation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                    <span>Pelvic Tilts - 8 reps</span>
                  </div>
                  <Button variant="outline" className="w-full mt-3 border-primary text-primary hover:bg-primary/10 h-auto py-3" size="sm">
                    <Play className="w-4 h-4 mr-2" />
                    Start Morning Routine
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Evening Routine (5-10 mins)</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>Heel Slides - 6 per leg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>Gentle Pelvic Floor Release</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>Relaxation Breathing</span>
                  </div>
                  <Button variant="outline" className="w-full mt-3 border-primary text-primary hover:bg-primary/10 h-auto py-3" size="sm">
                    <Play className="w-4 h-4 mr-2" />
                    Start Evening Routine
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">REHAB ROUTINE - Week-by-Week Core Reconnection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Core healing doesn't happen in a week. A routine builds over time, prioritizing breath, posture, and function. Use this checklist below to add to your warmup each week before your main workouts.
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 text-left font-semibold">WEEK</th>
                    <th className="border border-gray-300 p-3 text-left font-semibold">EXERCISES</th>
                    <th className="border border-gray-300 p-3 text-left font-semibold">FOCUS & PURPOSE</th>
                    <th className="border border-gray-300 p-3 text-left font-semibold">NOTES</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3 font-semibold">Week 1-2</td>
                    <td className="border border-gray-300 p-3">
                      <div className="space-y-2">
                        <div className="text-primary underline cursor-pointer">360° BREATHING</div>
                        <div className="text-xs text-muted-foreground">(any comfortable position)</div>
                        <div className="text-primary underline cursor-pointer">SUPINE DIAPHRAGMATIC BREATHING</div>
                        <div className="text-primary underline cursor-pointer">SIDE LYING DIAPHRAGMATIC BREATHING</div>
                      </div>
                    </td>
                    <td className="border border-gray-300 p-3 text-xs">
                      Reconnect to breath, rebuild mind-muscle connection with deep core and pelvic floor, reduce internal pressure.
                    </td>
                    <td className="border border-gray-300 p-3 text-xs">
                      Best done lying or seated. Practice 2-3 times/day. Prioritize breath + awareness.
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3 font-semibold">Week 3-4</td>
                    <td className="border border-gray-300 p-3">
                      <div className="space-y-2">
                        <div className="text-primary underline cursor-pointer">SUPINE HEEL SLIDES</div>
                        <div className="text-primary underline cursor-pointer">SUPINE PELVIC TILTS</div>
                        <div className="text-primary underline cursor-pointer">SUPPORTED GLUTE BRIDGES PILLOW UNDER HIPS</div>
                        <div className="text-primary underline cursor-pointer">STANDING POSTURE RESET</div>
                      </div>
                    </td>
                    <td className="border border-gray-300 p-3 text-xs">
                      Begin adding gentle movement to deepen core engagement. Build awareness of core activation in daily life (lifting baby, standing).
                    </td>
                    <td className="border border-gray-300 p-3 text-xs">
                      Maintain slow tempo. Avoid doming/coning. Continue breath-coordinated movement.
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3 font-semibold">Week 5-6</td>
                    <td className="border border-gray-300 p-3">
                      <div className="space-y-2">
                        <div className="text-primary underline cursor-pointer">ELEVATED CHAIR BIRD DOGS</div>
                        <div className="text-primary underline cursor-pointer">SUPINE ALT LEG MARCHES</div>
                        <div className="text-xs text-muted-foreground">(only if no doming)</div>
                        <div className="text-primary underline cursor-pointer">MINI SQUATS ON CHAIR</div>
                        <div className="text-xs text-muted-foreground">Core-integrated Movement (exhale-to-stand, baby lifts)</div>
                      </div>
                    </td>
                    <td className="border border-gray-300 p-3 text-xs">
                      Train core stability in more dynamic tasks. Start integrating breath + core into real-life movements.
                    </td>
                    <td className="border border-gray-300 p-3 text-xs">
                      Keep reps low (5-8), focus on form. Stop if there's pain, coning, or pelvic pressure.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-pink-50 rounded-lg border-l-4 border-primary">
                <h4 className="font-semibold text-sm mb-3 text-primary">Do Daily / Improve On:</h4>
                <ul className="text-xs space-y-2">
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
              
              <div className="p-4 bg-pink-50 rounded-lg border-l-4 border-primary">
                <h4 className="font-semibold text-sm mb-3 text-primary">Tips:</h4>
                <ul className="text-xs space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">❖</span>
                    <span>5-8 reps | 1-2 rounds | 3-5x/week</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">❖</span>
                    <span>Avoid pain, doming, leaking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">❖</span>
                    <span>Rest is progress</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-center">CORE REHAB & DAILY PRACTICE</CardTitle>
            <CardDescription className="text-center">
              <span className="text-primary font-semibold text-base">SHORT REPEATABLE RITUALS</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                These foundational core reconnection exercises are designed to be gentle, effective, and easy to fit into a busy postpartum day. They require no equipment, take only 5–10 minutes, and can be repeated daily or every other day to build a strong foundation for future movement. Each movement focuses on breath awareness, alignment, and deep core engagement. <strong>LEARN TO DO THESE VERY WELL!</strong>
              </p>
              
              <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-primary">
                <h4 className="font-semibold text-sm mb-2 text-primary">How to view the videos of the exercises:</h4>
                <p className="text-xs">
                  All blue underlined text is clickable and will open a video link. <strong>PLAY ALL</strong> indicates that the following workout can be played as a single playlist containing all the exercises to make it easier to flow through. However, do listen to each exercise instruction beforehand.
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-4 text-left font-semibold text-sm">EXERCISE</th>
                      <th className="border border-gray-300 p-4 text-left font-semibold text-sm">WHAT IT DOES</th>
                      <th className="border border-gray-300 p-4 text-left font-semibold text-sm">HOW TO PERFORM</th>
                      <th className="border border-gray-300 p-4 text-left font-semibold text-sm">KEY TIPS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-4">
                        <div className="text-primary underline cursor-pointer font-semibold text-sm">SUPINE PELVIC TILTS</div>
                      </td>
                      <td className="border border-gray-300 p-4 text-sm">
                        Gently mobilizes the lower back and pelvis; builds awareness of core engagement
                      </td>
                      <td className="border border-gray-300 p-4 text-sm">
                        Lie on your back with knees bent, feet flat. Gently tilt pelvis to flatten lower back into the floor on exhale; return to neutral on inhale
                      </td>
                      <td className="border border-gray-300 p-4 text-sm">
                        Keep glutes and upper body relaxed; move slowly with breath, not momentum
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-4">
                        <div className="text-primary underline cursor-pointer font-semibold text-sm">90 90 BOX BREATHING</div>
                      </td>
                      <td className="border border-gray-300 p-4 text-sm">
                        Reconnects breath to deep core and pelvic floor
                      </td>
                      <td className="border border-gray-300 p-4 text-sm">
                        Inhale to expand ribs; exhale slowly while gently engaging TVA and lifting pelvic floor
                      </td>
                      <td className="border border-gray-300 p-4 text-sm">
                        Keep shoulders relaxed; feel ribcage expand in all directions
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-4">
                        <div className="text-primary underline cursor-pointer font-semibold text-sm">SUPINE HEEL SLIDES</div>
                      </td>
                      <td className="border border-gray-300 p-4 text-sm">
                        Activates TVA while keeping pelvis stable
                      </td>
                      <td className="border border-gray-300 p-4 text-sm">
                        Slide one heel out along the floor on exhale, bring back in on inhale
                      </td>
                      <td className="border border-gray-300 p-4 text-sm">
                        Maintain a neutral spine; avoid doming or pelvis tilting
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-4">
                        <div className="text-primary underline cursor-pointer font-semibold text-sm">SIDE LYING DIAPHRAGMATIC BREATHING</div>
                      </td>
                      <td className="border border-gray-300 p-4 text-sm">
                        Improves rib mobility and lateral expansion
                      </td>
                      <td className="border border-gray-300 p-4 text-sm">
                        Lie on side with pillow support, inhale into top ribs and side body
                      </td>
                      <td className="border border-gray-300 p-4 text-sm">
                        Focus on breath movement in the ribs and back, not belly
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-4">
                        <div className="text-primary underline cursor-pointer font-semibold text-sm">SUPINE DIAPHRAGMATIC BREATHING</div>
                      </td>
                      <td className="border border-gray-300 p-4 text-sm">
                        Strengthens deep core through subtle activation
                      </td>
                      <td className="border border-gray-300 p-4 text-sm">
                        On each exhale, gently hug belly inward like zipping up jeans
                      </td>
                      <td className="border border-gray-300 p-4 text-sm">
                        Keep it light—no gripping or bracing, coordinate with breath
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-4">
                        <div className="text-primary underline cursor-pointer font-semibold text-sm">BIRD DOGS GROUND LEVEL</div>
                      </td>
                      <td className="border border-gray-300 p-4 text-sm">
                        Builds core stability and cross-body coordination
                      </td>
                      <td className="border border-gray-300 p-4 text-sm">
                        From hands and knees, extend opposite arm and leg while exhaling
                      </td>
                      <td className="border border-gray-300 p-4 text-sm">
                        Keep hips level, core engaged; move slowly and stay balanced
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="bg-pink-50 p-6 rounded-lg border-l-4 border-primary">
                <h4 className="font-semibold text-base mb-4 text-primary">Quick Guidelines:</h4>
                <ul className="text-sm space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">•</span>
                    <span><strong>Duration / Reps:</strong> 5–10 minutes per session / 5-8 Breaths per movement per side.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">•</span>
                    <span><strong>Frequency:</strong> Daily or every other day – or use as your warmup</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">•</span>
                    <span><strong>Focus:</strong> Controlled, mindful movement with breath coordination</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">•</span>
                    <span><strong>Avoid:</strong> Any pain, pelvic heaviness, doming, or bulging during exercises</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">•</span>
                    <span>Holding your breath increases intra-abdominal pressure—use breath-led movement and never perform Valsalva maneuvers during these drills.</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function YourSixCoreProgramsSection({ programId }: { programId: string }) {
  const programs = [
    { number: 1, title: "Reconnect & Reset", sessions: 4, description: "Foundation building and body awareness" },
    { number: 2, title: "Stability & Breathwork", sessions: 3, description: "Strengthening breath connection" },
    { number: 3, title: "Control & Awareness", sessions: 3, description: "Developing control and precision" },
    { number: 4, title: "Align & Activate", sessions: 3, description: "Proper alignment and activation patterns" },
    { number: 5, title: "Functional Core Flow", sessions: 3, description: "Functional movement integration" },
    { number: 6, title: "Foundational Strength", sessions: 4, description: "Building lasting core strength" }
  ];
  
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">💪 Your 6 Core Programs</CardTitle>
          <CardDescription>
            Clean and focused area for your physical exercises and recovery
          </CardDescription>
        </CardHeader>
      </Card>
      
      {selectedProgram ? (
        <ProgramDetailView 
          program={programs.find(p => p.number === selectedProgram)!} 
          onBack={() => setSelectedProgram(null)}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((program) => (
            <Card key={program.number} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Program {program.number}: {program.title}</CardTitle>
                <Badge variant="outline" className="rounded-none px-4 py-2">{program.sessions} sessions/week</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{program.description}</p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setSelectedProgram(program.number)}
                >
                  View Program {program.number}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
)}
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Daily Reconnection Routine</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Quick-access foundational rehab exercises for daily practice or warm-ups
            </p>
            <div className="text-sm space-y-1 mb-3">
              <p>• Pelvic Tilts</p>
              <p>• Heel Slides</p>
              <p>• Gentle Core Activation</p>
            </div>
            <Button variant="outline" className="w-full h-auto py-3">
              Start Daily Routine
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Optional Cardio Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Gentle cardiovascular options to support your recovery
            </p>
            <div className="text-sm space-y-1 mb-3">
              <p><strong>LISS:</strong> Low Intensity Steady State</p>
              <p><strong>MISS:</strong> Moderate Intensity</p>
              <p><strong>HIIT:</strong> High Intensity (when ready)</p>
            </div>
            <Button variant="outline" className="w-full h-auto py-3">
              View Cardio Guide
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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
                <li>• Adequate hydration</li>
                <li>• Essential vitamins and minerals</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Your Portion Guide</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <p className="text-muted-foreground mb-3">
              Simple hand-portion system for balanced nutrition
            </p>
            <div className="space-y-2">
              <p><strong>Palm:</strong> Protein serving</p>
              <p><strong>Cupped Hand:</strong> Carbohydrates</p>
              <p><strong>Thumb:</strong> Healthy fats</p>
              <p><strong>Fist:</strong> Vegetables</p>
            </div>
            <Button variant="outline" className="w-full mt-3 h-auto py-3">
              View Detailed Guide
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Healing Foods Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Simple checklist of daily nutritional goals to support your recovery
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Daily Protein Goals:</h4>
              <ul className="space-y-1">
                <li>☐ Protein at every meal</li>
                <li>☐ Include collagen sources</li>
                <li>☐ Vary protein sources</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Hydration & Recovery:</h4>
              <ul className="space-y-1">
                <li>☐ 8-10 glasses of water daily</li>
                <li>☐ Include electrolytes</li>
                <li>☐ Limit inflammatory foods</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function WhatComesNextSection({ userId, programId, progressEntries }: { 
  userId: string; 
  programId: string; 
  progressEntries: any[];
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📈 What Comes Next</CardTitle>
          <CardDescription>
            Track your journey and find information on what to do after the program
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">My Progress Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Interactive tracking table for gap measurements, symptoms, and energy levels
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span>Week 1 Assessment</span>
                <Button variant="outline" size="sm" className="h-auto py-3">Record</Button>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Gap Measurement</span>
                <span className="text-muted-foreground">Not recorded</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Symptoms Check</span>
                <span className="text-muted-foreground">Not recorded</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Energy Level</span>
                <span className="text-muted-foreground">Not recorded</span>
              </div>
            </div>
            <Button className="w-full mt-4">
              Start Progress Tracking
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Ready for More?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div>
              <h4 className="font-semibold mb-2">How to Know You're Ready to Progress:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• No pain or doming during exercises</li>
                <li>• Consistent core control</li>
                <li>• Improved gap closure (if applicable)</li>
                <li>• Increased energy and strength</li>
              </ul>
            </div>
            <Button variant="outline" className="w-full h-auto py-3">
              Return to Impact Readiness Test
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Red Flag Movements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Clear list of exercises to avoid until your core is fully rehabilitated
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Avoid Until Ready:</h4>
              <ul className="space-y-1">
                <li>• Traditional crunches</li>
                <li>• Sit-ups</li>
                <li>• High-impact activities</li>
                <li>• Heavy lifting</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Warning Signs:</h4>
              <ul className="space-y-1">
                <li>• Doming or coning</li>
                <li>• Pelvic pressure</li>
                <li>• Lower back pain</li>
                <li>• Leaking or heaviness</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// YouTube Video Modal Component
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
  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="aspect-video">
          <iframe
            src={getYouTubeEmbedUrl(videoUrl)}
            title={title}
            className="w-full h-full rounded-lg"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Program Detail View Component
function ProgramDetailView({ 
  program, 
  onBack 
}: { 
  program: { number: number; title: string; sessions: number; description: string }; 
  onBack: () => void;
}) {
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);

  const handleVideoClick = (url: string, title: string) => {
    setSelectedVideo({ url, title });
  };

  // Program 1 exact content from PDF page 29
  const getProgramContent = () => {
    if (program.number === 1) {
      return {
        title: "Program 1: Reconnect & Reset",
        description: "Day 1,3,5,7 - Foundation building and body awareness",
        sessions: 4,
        content: {
          overview: "This is your foundation. Focus on breath, posture, and gentle reconnection with your core and pelvic floor. You're not here to sweat—you're here to feel again.",
          frequency: "4 sessions per week (Day 1,3,5,7)",
          duration: "Main workout + breathing exercises",
          equipmentNeeded: "Mini bands, small Pilates ball, mat",
          howTo: "All blue underlined text is clickable and will open a video link. PLAY ALL indicates that the following workout can be played as a single playlist containing all the exercises to make it easier to flow through. However, please have listened to each exercise instruction beforehand.",
          rest: "Rest a minimum of 30 secs - ONE minute between movements. Rest more if needed.",
          parts: [
            {
              title: "PART 1: MORNING + EVENING – CAN BE PERFORMED IN MULTIPLE POSITIONS",
              exercises: [
                {
                  name: "360° BREATHING",
                  reps: "25 breaths",
                  videoUrl: "https://youtu.be/dQw4w9WgXcQ"
                }
              ]
            },
            {
              title: "PART 2: MAIN WORKOUT: PERFORM 3 ROUNDS OF THE FOLLOWING",
              hasPlayAll: true,
              playAllUrl: "https://youtu.be/dQw4w9WgXcQ",
              rounds: 3,
              exercises: [
                {
                  number: 1,
                  name: "KNEELING MINI BAND PULL APARTS",
                  reps: "12 reps",
                  videoUrl: "https://youtu.be/dQw4w9WgXcQ"
                },
                {
                  number: 2,
                  name: "QUADRUPED BALL COMPRESSIONS",
                  reps: "10 reps",
                  videoUrl: "https://youtu.be/dQw4w9WgXcQ"
                },
                {
                  number: 3,
                  name: "SUPINE HEEL SLIDES",
                  reps: "10 reps",
                  videoUrl: "https://youtu.be/dQw4w9WgXcQ"
                },
                {
                  number: 4,
                  name: "GLUTE BRIDGES WITH MINI BALL",
                  reps: "15 reps",
                  videoUrl: "https://youtu.be/dQw4w9WgXcQ"
                },
                {
                  number: 5,
                  name: "BUTTERFLY STRETCH — DYNAMIC FLUTTER",
                  reps: "1 min",
                  videoUrl: "https://youtu.be/dQw4w9WgXcQ"
                }
              ]
            }
          ],
          tips: [
            {
              title: "Breathe First, Move Second:",
              description: "Every movement begins with deep exhale and gentle core engagement."
            },
            {
              title: "Feel, Don't Force:",
              description: "The goal is to feel supported - not strained. If something feels off, pause, or regress."
            },
            {
              title: "One Round is Still Progress:",
              description: "Don't skip a session just because you don't have time for all rounds."
            },
            {
              title: "No Doming, Heaviness, or Leaking:",
              description: "Stop & regress to earlier exercises. That's your body's way of asking."
            },
            {
              title: "Stay Consistent, Not Perfect:",
              description: "Progress comes from showing up—even imperfectly."
            },
            {
              title: "Hydrate, Rest, Reflect:",
              description: "These are core parts of your recovery too."
            },
            {
              title: "Avoid Overexertion:",
              description: "Stop immediately if you feel dizzy, nauseous, or overly fatigued."
            },
            {
              title: "Consult Your Doctor:",
              description: "Always consult your healthcare provider before continuing with exercises."
            }
          ]
        }
      };
    }
    
    // Placeholder for other programs
    return {
      title: `Program ${program.number}: ${program.title}`,
      description: program.description,
      sessions: program.sessions,
      content: {
        overview: `Program ${program.number} content will be available soon.`,
        frequency: `${program.sessions} sessions per week`,
        duration: "15-25 minutes per session",
        sessions: [],
        coachNotes: ["Content coming soon!"]
      }
    };
  };

  const programContent = getProgramContent();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Programs
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{programContent.title}</h2>
          <p className="text-muted-foreground">{programContent.description}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold">{programContent.content.frequency}</p>
                <p className="text-xs text-muted-foreground">Frequency</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold">{programContent.content.duration}</p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold">{programContent.content.parts ? programContent.content.parts.length : 2} Parts</p>
                <p className="text-xs text-muted-foreground">This Program</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {programContent.content.equipmentNeeded && (
        <Card>
          <CardHeader>
            <CardTitle>Equipment Needed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold">{programContent.content.equipmentNeeded}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>🌟 Coach's Note</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm italic">{programContent.content.overview}</p>
        </CardContent>
      </Card>

      {programContent.content.howTo && (
        <Card>
          <CardHeader>
            <CardTitle>How to</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-2">{programContent.content.howTo}</p>
            <p className="text-sm"><strong>Rest:</strong> {programContent.content.rest}</p>
          </CardContent>
        </Card>
      )}

      {programContent.content.parts && programContent.content.parts.map((part, partIndex) => (
        <Card key={partIndex}>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-primary">▶ {part.title}</span>
              {part.hasPlayAll && (
                <Button
                  variant="outline"
                  onClick={() => handleVideoClick(part.playAllUrl, "Play All - Main Workout")}
                  className="text-primary border-pink-600 w-fit"
                >
                  <Video className="w-4 h-4 mr-2" />
                  ▶ PLAY ALL
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {part.exercises.map((exercise, exerciseIndex) => (
                <div key={exerciseIndex} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {'number' in exercise && exercise.number && (
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">
                            {exercise.number}
                          </span>
                        )}
                        <h4 className="font-semibold text-primary underline cursor-pointer" 
                            onClick={() => handleVideoClick(exercise.videoUrl, exercise.name)}>
                          {exercise.name}
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{exercise.reps}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVideoClick(exercise.videoUrl, exercise.name)}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Watch
                    </Button>
                  </div>
                </div>
              ))}
              {part.rounds && (
                <div className="text-center">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    × {part.rounds}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {programContent.content.tips && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-primary">Tips before you begin:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {programContent.content.tips.map((tip, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-pink-500 font-bold">❖</span>
                  <div>
                    <span className="text-pink-500 font-semibold">{tip.title}</span>{" "}
                    <span className="text-sm">{tip.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedVideo && (
        <YouTubeModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          videoUrl={selectedVideo.url}
          title={selectedVideo.title}
        />
      )}
    </div>
  );
}