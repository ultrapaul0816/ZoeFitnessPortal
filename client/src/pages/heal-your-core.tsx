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
                <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50">
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
                    <div className="text-right">
                      <div className="text-sm text-gray-600 font-medium">EQUIPMENT NEEDED</div>
                      <div className="text-sm text-gray-800">Mini band, small Pilates ball, mat</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">RECONNECT & RESET</h3>
                    <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-400">
                      <div className="flex items-start gap-2">
                        <span className="text-pink-600 font-semibold">COACH'S NOTE:</span>
                        <p className="text-gray-700 text-sm">
                          This is your foundation. Focus on breath, posture, and gentle reconnection with your core and pelvic floor. 
                          You're not here to sweat—you're here to feel again.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">Full program content will be restored shortly</p>
                    <Button className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white">
                      View Program Details
                    </Button>
                  </div>
                </CardContent>
              </Card>

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