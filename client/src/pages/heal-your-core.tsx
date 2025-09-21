import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import ZoeWelcomeModal from '@/components/zoe-welcome-modal';
import { 
  BookOpen, 
  Activity, 
  Brain, 
  Heart, 
  Dumbbell, 
  Apple, 
  ChartBar,
  Play,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Target,
  TrendingUp
} from 'lucide-react';

export default function HealYourCorePage() {
  const [user] = useState({ id: '1', role: 'user' });
  const [activeTab, setActiveTab] = useState('welcome');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [expandedPrograms, setExpandedPrograms] = useState<Record<string, boolean>>({
    'program1': false,
    'program2': false,
    'program3': false,
    'program4': false,
    'program5': false,
    'program6': false
  });

  // Tab navigation functions
  const tabs = ['welcome', 'cardio', 'understanding', 'healing', 'programs', 'nutrition', 'next-steps'];
  
  const getCurrentTabIndex = () => tabs.indexOf(activeTab);
  
  const canGoNext = () => getCurrentTabIndex() < tabs.length - 1;
  const canGoPrevious = () => getCurrentTabIndex() > 0;
  
  const navigateToNextTab = () => {
    const currentIndex = getCurrentTabIndex();
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };
  
  const navigateToPreviousTab = () => {
    const currentIndex = getCurrentTabIndex();
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const handleWelcomeClose = () => {
    setShowWelcomeModal(false);
  };

  const toggleProgramExpansion = (programId: string) => {
    setExpandedPrograms(prev => ({
      ...prev,
      [programId]: !prev[programId]
    }));
  };

  // Simplified navigation props interface
  interface NavigationProps {
    canGoNext: () => boolean;
    canGoPrevious: () => boolean;
    navigateToNextTab: () => void;
    navigateToPreviousTab: () => void;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Heal Your Core
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your comprehensive guide to postpartum core recovery and strength building
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto px-0 shadow-xl rounded-lg">
            <TabsList className="flex w-full md:grid md:grid-cols-7 gap-2 md:gap-4 h-auto p-3 md:p-4 bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200 shadow-lg min-w-max md:min-w-0 mx-0">
            <TabsTrigger value="welcome" data-testid="tab-welcome" className="text-xs sm:text-sm min-h-[70px] md:min-h-[60px] min-w-[80px] flex-col p-2 md:p-4 bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-pink-300">
              <BookOpen className="w-6 h-6 md:w-5 md:h-5 mb-2" />
              <span className="font-medium">Welcome</span>
            </TabsTrigger>
            <TabsTrigger value="cardio" data-testid="tab-cardio" className="text-xs sm:text-sm min-h-[70px] md:min-h-[60px] min-w-[80px] flex-col p-2 md:p-4 bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-pink-300">
              <Activity className="w-6 h-6 md:w-5 md:h-5 mb-2" />
              <span className="font-medium text-center leading-tight">Cardio Plan</span>
            </TabsTrigger>
            <TabsTrigger value="understanding" data-testid="tab-understanding" className="text-xs sm:text-sm min-h-[70px] md:min-h-[60px] min-w-[80px] flex-col p-2 md:p-4 bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-pink-300">
              <Brain className="w-6 h-6 md:w-5 md:h-5 mb-2" />
              <span className="font-medium text-center leading-tight">Core</span>
            </TabsTrigger>
            <TabsTrigger value="healing" data-testid="tab-healing" className="text-xs sm:text-sm min-h-[70px] md:min-h-[60px] min-w-[80px] flex-col p-2 md:p-4 bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-pink-300">
              <Heart className="w-6 h-6 md:w-5 md:h-5 mb-2" />
              <span className="font-medium">Heal</span>
            </TabsTrigger>
            <TabsTrigger value="programs" data-testid="tab-programs" className="text-xs sm:text-sm min-h-[70px] md:min-h-[60px] min-w-[80px] flex-col p-2 md:p-4 bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-pink-300">
              <Dumbbell className="w-6 h-6 md:w-5 md:h-5 mb-2" />
              <span className="font-medium">Programs</span>
            </TabsTrigger>
            <TabsTrigger value="nutrition" data-testid="tab-nutrition" className="text-xs sm:text-sm min-h-[70px] md:min-h-[60px] min-w-[80px] flex-col p-2 md:p-4 bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-pink-300">
              <Apple className="w-6 h-6 md:w-5 md:h-5 mb-2" />
              <span className="font-medium">Nutrition</span>
            </TabsTrigger>
            <TabsTrigger value="next-steps" data-testid="tab-next-steps" className="text-xs sm:text-sm min-h-[70px] md:min-h-[60px] min-w-[80px] flex-col p-2 md:p-4 bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-400 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-pink-300">
              <ChartBar className="w-6 h-6 md:w-5 md:h-5 mb-2" />
              <span className="font-medium">What's Next</span>
            </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Tab Content */}
          <TabsContent value="welcome">
            <WelcomeSection 
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              navigateToNextTab={navigateToNextTab}
              navigateToPreviousTab={navigateToPreviousTab}
            />
          </TabsContent>

          <TabsContent value="cardio">
            <SimpleSection 
              title="🏃‍♀️ Cardio Plan"
              description="Safe cardio guidelines for postpartum recovery"
              content="Your cardio plan content coming soon..."
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              navigateToNextTab={navigateToNextTab}
              navigateToPreviousTab={navigateToPreviousTab}
            />
          </TabsContent>

          <TabsContent value="understanding">
            <SimpleSection 
              title="🧠 Understanding Your Core"
              description="Learn about your core system and how it works"
              content="Core understanding content coming soon..."
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              navigateToNextTab={navigateToNextTab}
              navigateToPreviousTab={navigateToPreviousTab}
            />
          </TabsContent>

          <TabsContent value="healing">
            <SimpleSection 
              title="💙 Heal"
              description="Understanding diastasis recti and beginning your core rehabilitation journey"
              content="Healing content coming soon..."
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              navigateToNextTab={navigateToNextTab}
              navigateToPreviousTab={navigateToPreviousTab}
            />
          </TabsContent>

          <TabsContent value="programs">
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  Your 6-Week Program
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Complete your personalized postnatal fitness journey with our expertly designed program structure
                </p>
              </div>

              {/* Program 1 */}
              <Card className="overflow-hidden border-l-4 border-l-pink-500">
                <CardHeader 
                  className="bg-gradient-to-r from-pink-50 to-rose-50 cursor-pointer hover:from-pink-100 hover:to-rose-100 transition-colors"
                  onClick={() => toggleProgramExpansion('program1')}
                  data-testid="header-program1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-lg font-bold">
                        WEEK 1
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900">PROGRAM 1</CardTitle>
                        <CardDescription className="text-pink-600 font-semibold">DAY 1, 3, 5, 7</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600 font-medium">EQUIPMENT NEEDED</div>
                        <div className="text-sm text-gray-800">Mini band, small Pilates ball, mat</div>
                      </div>
                      <div className="text-gray-500 ml-2">
                        {expandedPrograms['program1'] ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <h3 className="text-xl font-bold text-gray-900">RECONNECT & RESET</h3>
                  </div>
                </CardHeader>
                
                {expandedPrograms['program1'] && (
                  <CardContent className="p-6">
                    <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-400 mb-6">
                      <div className="flex items-start gap-2">
                        <span className="text-pink-600 font-semibold">COACH'S NOTE:</span>
                        <p className="text-gray-700 text-sm">
                          This is your foundation. Focus on breath, posture, and gentle reconnection with your core and pelvic floor. 
                          You're not here to sweat—you're here to feel again.
                        </p>
                      </div>
                    </div>

                    {/* How to and Rest Instructions */}
                    <div className="space-y-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                      <p className="text-sm text-blue-800">
                        <strong>How to:</strong> All blue underlined text is clickable and will open a video link. 
                        <strong className="text-pink-600"> PLAY ALL</strong> indicates that the following workout can be played as a single 
                        playlist containing all the exercises to make it easier to flow through. However, please have listened to each exercise instruction beforehand.
                      </p>
                    </div>
                    
                    <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                      <p className="text-sm text-yellow-800">
                        <strong>Rest:</strong> Rest a minimum of 30 secs - ONE minute between movements. Rest more if needed.
                      </p>
                    </div>
                  </div>

                  {/* Part 1: Morning + Evening */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-pink-500 text-white text-sm font-bold px-2 py-1 rounded">▶</div>
                      <h4 className="text-lg font-bold text-pink-600">PART 1: MORNING + EVENING - CAN BE PERFORMED IN MULTIPLE POSITIONS</h4>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg overflow-hidden border">
                      <div className="flex">
                        <div className="flex-1 p-4 border-r border-gray-200">
                          <Button 
                            variant="link" 
                            className="text-blue-600 underline p-0 h-auto font-normal text-left"
                            data-testid="button-360-breathing"
                          >
                            <a href="https://www.youtube.com/watch?v=breathing_video" target="_blank" rel="noopener noreferrer">
                              360° BREATHING
                            </a>
                          </Button>
                        </div>
                        <div className="w-32 p-4 text-center bg-gray-100 font-medium">
                          25 breaths
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Part 2: Main Workout */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-pink-500 text-white text-sm font-bold px-2 py-1 rounded">▶</div>
                        <h4 className="text-lg font-bold text-pink-600">PART 2: MAIN WORKOUT:</h4>
                        <span className="text-gray-600 italic">PERFORM 3 ROUNDS OF THE FOLLOWING</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-pink-500 text-white text-sm font-bold px-2 py-1 rounded">▶</div>
                        <Button 
                          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 text-sm font-bold"
                          data-testid="button-play-all-workout"
                        >
                          <a href="https://www.youtube.com/playlist?list=workout_playlist" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                            <Play className="w-4 h-4" />
                            PLAY ALL
                          </a>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg overflow-hidden border">
                      <div className="grid grid-cols-12 bg-gray-100 border-b border-gray-200 font-medium text-sm">
                        <div className="col-span-1 p-3 text-center">#</div>
                        <div className="col-span-7 p-3">EXERCISE</div>
                        <div className="col-span-3 p-3 text-center">REPS</div>
                        <div className="col-span-1 p-3 text-center">ROUNDS</div>
                      </div>
                      
                      {/* Exercise 1 */}
                      <div className="grid grid-cols-12 border-b border-gray-200">
                        <div className="col-span-1 p-3 text-center font-medium">1</div>
                        <div className="col-span-7 p-3">
                          <Button 
                            variant="link" 
                            className="text-blue-600 underline p-0 h-auto font-normal text-left"
                            data-testid="button-kneeling-mini-band"
                          >
                            <a href="https://www.youtube.com/watch?v=kneeling_mini_band" target="_blank" rel="noopener noreferrer">
                              KNEELING MINI BAND PULL APARTS
                            </a>
                          </Button>
                        </div>
                        <div className="col-span-3 p-3 text-center">12 reps</div>
                        <div className="col-span-1 p-3 text-center text-lg font-bold">X 3</div>
                      </div>
                      
                      {/* Exercise 2 */}
                      <div className="grid grid-cols-12 border-b border-gray-200">
                        <div className="col-span-1 p-3 text-center font-medium">2</div>
                        <div className="col-span-7 p-3">
                          <Button 
                            variant="link" 
                            className="text-blue-600 underline p-0 h-auto font-normal text-left"
                            data-testid="button-quadruped-ball"
                          >
                            <a href="https://www.youtube.com/watch?v=quadruped_ball" target="_blank" rel="noopener noreferrer">
                              QUADRUPED BALL COMPRESSIONS
                            </a>
                          </Button>
                        </div>
                        <div className="col-span-3 p-3 text-center">10 reps</div>
                        <div className="col-span-1 p-3"></div>
                      </div>
                      
                      {/* Exercise 3 */}
                      <div className="grid grid-cols-12 border-b border-gray-200">
                        <div className="col-span-1 p-3 text-center font-medium">3</div>
                        <div className="col-span-7 p-3">
                          <Button 
                            variant="link" 
                            className="text-blue-600 underline p-0 h-auto font-normal text-left"
                            data-testid="button-supine-heel-slides"
                          >
                            <a href="https://www.youtube.com/watch?v=supine_heel_slides" target="_blank" rel="noopener noreferrer">
                              SUPINE HEEL SLIDES
                            </a>
                          </Button>
                        </div>
                        <div className="col-span-3 p-3 text-center">10 reps</div>
                        <div className="col-span-1 p-3"></div>
                      </div>
                      
                      {/* Exercise 4 */}
                      <div className="grid grid-cols-12 border-b border-gray-200">
                        <div className="col-span-1 p-3 text-center font-medium">4</div>
                        <div className="col-span-7 p-3">
                          <Button 
                            variant="link" 
                            className="text-blue-600 underline p-0 h-auto font-normal text-left"
                            data-testid="button-glute-bridges"
                          >
                            <a href="https://www.youtube.com/watch?v=glute_bridges" target="_blank" rel="noopener noreferrer">
                              GLUTE BRIDGES WITH MINI BALL
                            </a>
                          </Button>
                        </div>
                        <div className="col-span-3 p-3 text-center">15 reps</div>
                        <div className="col-span-1 p-3"></div>
                      </div>
                      
                      {/* Exercise 5 */}
                      <div className="grid grid-cols-12">
                        <div className="col-span-1 p-3 text-center font-medium">5</div>
                        <div className="col-span-7 p-3">
                          <Button 
                            variant="link" 
                            className="text-blue-600 underline p-0 h-auto font-normal text-left"
                            data-testid="button-butterfly-stretch"
                          >
                            <a href="https://www.youtube.com/watch?v=butterfly_stretch" target="_blank" rel="noopener noreferrer">
                              BUTTERFLY STRETCH — DYNAMIC FLUTTER
                            </a>
                          </Button>
                        </div>
                        <div className="col-span-3 p-3 text-center">1 min</div>
                        <div className="col-span-1 p-3"></div>
                      </div>
                    </div>
                  </div>

                  {/* Tips before you begin */}
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-pink-600 mb-4">Tips before you begin:</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-pink-500 text-lg">✧</span>
                        <p><strong className="text-blue-600">Breathe First, Move Second:</strong> Every movement begin with deep exhale and gentle core engagement.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-pink-500 text-lg">✧</span>
                        <p><strong className="text-blue-600">Feel, Don't Force:</strong> The goal is to feel supported - not strained. If something feels off, pause, or regress.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-pink-500 text-lg">✧</span>
                        <p><strong className="text-blue-600">One Round is Still Progress:</strong> Don't skip a session just because you don't have time for all rounds.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-pink-500 text-lg">✧</span>
                        <p><strong className="text-red-600">Doming, Heaviness, or Leaking?:</strong> Stop & regress to earlier exercises. That's your body's way of asking.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-pink-500 text-lg">✧</span>
                        <p><strong className="text-blue-600">Stay Consistent, Not Perfect:</strong> Progress comes from showing up—even imperfectly.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-pink-500 text-lg">✧</span>
                        <p><strong className="text-blue-600">Hydrate, Rest, Reflect:</strong> These are core parts of your recovery too.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-pink-500 text-lg">✧</span>
                        <p><strong className="text-red-600">Avoid Overexertion:</strong> Stop immediately if you feel dizzy, nauseous, or overly fatigued.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-pink-500 text-lg">✧</span>
                        <p><strong className="text-red-600">Consult Your Doctor:</strong> Always consult your healthcare provider before continuing with exercises.</p>
                      </div>
                    </div>
                  </div>

                  {/* Precautions */}
                  <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                    <h4 className="text-lg font-bold text-red-800 mb-3">Precautions</h4>
                    <div className="text-sm text-red-700 space-y-2">
                      <p><strong>Listen to Your Body:</strong> Always pay attention to how you feel and adjust accordingly.</p>
                      <p><strong>Take Options Given:</strong> Utilize the modifications provided to suit your comfort level.</p>
                      <p><strong>Reduce Reps or Rounds:</strong> Don't hesitate to reduce the number of repetitions or rounds if needed.</p>
                      <p><strong>Monitor Weight:</strong> Don't lift heavier weights or try lighter weights to aid in your full recovery by keeping close by and drink frequently to stay hydrated.</p>
                      <p><strong>Avoid Overexertion:</strong> Stop immediately if you feel dizzy, nauseous, or overly fatigued.</p>
                      <p><strong>Consult Your Doctor:</strong> Always consult with your healthcare provider before continuing with the exercises.</p>
                    </div>
                  </div>
                  </CardContent>
                )}
              </Card>

              {/* Program 2 */}
              <Card className="overflow-hidden border-l-4 border-l-blue-500">
                <CardHeader 
                  className="bg-gradient-to-r from-blue-50 to-sky-50 cursor-pointer hover:from-blue-100 hover:to-sky-100 transition-colors"
                  onClick={() => toggleProgramExpansion('program2')}
                  data-testid="header-program2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-r from-blue-500 to-sky-500 text-white px-4 py-2 rounded-lg font-bold">
                        WEEK 2
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900">PROGRAM 2</CardTitle>
                        <CardDescription className="text-blue-600 font-semibold">DAY 1, 3, 5, 7</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600 font-medium">EQUIPMENT NEEDED</div>
                        <div className="text-sm text-gray-800">Mini band, small Pilates ball, mat</div>
                      </div>
                      <div className="text-gray-500 ml-2">
                        {expandedPrograms['program2'] ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <h3 className="text-xl font-bold text-gray-900">BUILD & STRENGTHEN</h3>
                  </div>
                </CardHeader>
                
                {expandedPrograms['program2'] && (
                  <CardContent className="p-6">
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 mb-6">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 font-semibold">COACH'S NOTE:</span>
                        <p className="text-gray-700 text-sm">
                          Building on your foundation with added stability challenges. Focus on maintaining core connection while increasing movement complexity.
                        </p>
                      </div>
                    </div>
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">Program 2 content coming soon...</p>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Program 3 */}
              <Card className="overflow-hidden border-l-4 border-l-green-500">
                <CardHeader 
                  className="bg-gradient-to-r from-green-50 to-emerald-50 cursor-pointer hover:from-green-100 hover:to-emerald-100 transition-colors"
                  onClick={() => toggleProgramExpansion('program3')}
                  data-testid="header-program3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-bold">
                        WEEK 3
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900">PROGRAM 3</CardTitle>
                        <CardDescription className="text-green-600 font-semibold">DAY 1, 3, 5, 7</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600 font-medium">EQUIPMENT NEEDED</div>
                        <div className="text-sm text-gray-800">Mini band, small Pilates ball, mat, light weights</div>
                      </div>
                      <div className="text-gray-500 ml-2">
                        {expandedPrograms['program3'] ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <h3 className="text-xl font-bold text-gray-900">PROGRESS & POWER</h3>
                  </div>
                </CardHeader>
                
                {expandedPrograms['program3'] && (
                  <CardContent className="p-6">
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400 mb-6">
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 font-semibold">COACH'S NOTE:</span>
                        <p className="text-gray-700 text-sm">
                          Introducing progressive loading and dynamic movements. Your core is gaining strength and coordination.
                        </p>
                      </div>
                    </div>
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">Program 3 content coming soon...</p>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Programs 4-6 Coming Soon */}
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { week: 4, title: "PROGRAM 4", subtitle: "DYNAMIC INTEGRATION", color: "purple" },
                  { week: 5, title: "PROGRAM 5", subtitle: "FUNCTIONAL STRENGTH", color: "orange" },
                  { week: 6, title: "PROGRAM 6", subtitle: "PEAK PERFORMANCE", color: "red" }
                ].map((program, index) => (
                  <Card key={index} className={`border-l-4 border-l-${program.color}-500 opacity-75`}>
                    <CardHeader className={`bg-gradient-to-r from-${program.color}-50 to-${program.color}-100`}>
                      <div className="text-center">
                        <div className={`bg-gradient-to-r from-${program.color}-500 to-${program.color}-600 text-white px-3 py-1 rounded font-bold text-sm inline-block mb-2`}>
                          WEEK {program.week}
                        </div>
                        <CardTitle className="text-lg text-gray-900">{program.title}</CardTitle>
                        <CardDescription className={`text-${program.color}-600 font-semibold text-sm`}>{program.subtitle}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 text-center">
                      <p className="text-gray-500 text-sm">Coming Soon</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-center pt-8">
                <div className="flex gap-4 justify-center">
                  {canGoPrevious() && (
                    <Button
                      className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-2 text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2"
                      data-testid="button-previous-section-programs"
                      onClick={navigateToPreviousTab}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Prev
                    </Button>
                  )}
                  {canGoNext() && (
                    <Button
                      className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-2 text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2"
                      data-testid="button-next-section-programs"
                      onClick={navigateToNextTab}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="nutrition">
            <SimpleSection 
              title="🍎 The Role of Nutrition"
              description="Nutritional guidance giving the importance it deserves for your core recovery"
              content="Nutrition content coming soon..."
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              navigateToNextTab={navigateToNextTab}
              navigateToPreviousTab={navigateToPreviousTab}
            />
          </TabsContent>

          <TabsContent value="next-steps">
            <SimpleSection 
              title="🚀 What Comes Next"
              description="Your journey continues - track progress and plan your next steps"
              content="Next steps content coming soon..."
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              navigateToNextTab={navigateToNextTab}
              navigateToPreviousTab={navigateToPreviousTab}
            />
          </TabsContent>
        </Tabs>

        {/* Zoe Welcome Modal */}
        <ZoeWelcomeModal 
          isOpen={showWelcomeModal}
          onClose={handleWelcomeClose}
        />
      </div>
    </div>
  );
}

// Simple section component for tabs that aren't fully implemented yet
function SimpleSection({ 
  title,
  description,
  content,
  canGoNext, 
  canGoPrevious, 
  navigateToNextTab, 
  navigateToPreviousTab 
}: {
  title: string;
  description: string;
  content: string;
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  navigateToNextTab: () => void;
  navigateToPreviousTab: () => void;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">{content}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Navigation Buttons */}
      <div className="flex justify-center pt-8">
        <div className="flex gap-4 justify-center">
          {canGoPrevious() && (
            <Button
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-2 text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2"
              onClick={navigateToPreviousTab}
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </Button>
          )}
          {canGoNext() && (
            <Button
              className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-2 text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2"
              onClick={navigateToNextTab}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Welcome section component
function WelcomeSection({
  canGoNext,
  canGoPrevious,
  navigateToNextTab,
  navigateToPreviousTab
}: {
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  navigateToNextTab: () => void;
  navigateToPreviousTab: () => void;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">✨ Welcome - Start Here</h2>
            <p className="text-muted-foreground text-sm">
              Essential preparatory information for your core recovery journey
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-pink-50 p-6 rounded-lg border-l-4 border-pink-400">
              <h3 className="font-semibold text-pink-800 mb-2">Welcome to Your Core Recovery Journey</h3>
              <p className="text-pink-700 text-sm">
                This comprehensive program has been designed to help you safely rebuild your core strength and confidence. 
                Each section builds upon the previous one, so take your time and trust the process.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">What You'll Learn</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Understanding your core system</li>
                  <li>• Safe rehabilitation techniques</li>
                  <li>• Progressive strengthening exercises</li>
                  <li>• Nutritional support for recovery</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">How to Use This Program</h4>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• Start with the Welcome section</li>
                  <li>• Progress through each tab in order</li>
                  <li>• Take your time with each section</li>
                  <li>• Listen to your body throughout</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Navigation Buttons */}
      <div className="flex justify-center pt-8">
        <div className="flex gap-4 justify-center">
          {canGoPrevious() && (
            <Button
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-2 text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2"
              onClick={navigateToPreviousTab}
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </Button>
          )}
          {canGoNext() && (
            <Button
              className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-2 text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2"
              onClick={navigateToNextTab}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}