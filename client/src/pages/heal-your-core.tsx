import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Video
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

  const healYourCoreProgram = Array.isArray(programs) ? programs.find((p: any) => p.name === "Heal Your Core") : null;

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

  const handleWelcomeClose = () => {
    if (user) {
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
            className="mb-6"
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
                    ${(healYourCoreProgram.price / 100).toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Button 
                  size="lg" 
                  className="w-full max-w-md"
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")}
            data-testid="button-back-to-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Badge variant="secondary" className="px-3 py-1">
            {healYourCoreProgram.level}
          </Badge>
        </div>

        {/* Welcome Section */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2">Welcome to Heal Your Core</CardTitle>
            <CardDescription className="text-lg">
              Your 6-week journey to core recovery and strength
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Hello {user.firstName}!</h3>
                <p className="text-muted-foreground">
                  Welcome to your personalized postnatal core recovery program. This journey has been 
                  carefully designed to help you safely rebuild your core strength, address diastasis recti, 
                  and support your overall postpartum recovery.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Your Progress</span>
                    <span>{completedWeeks}/6 weeks</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
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

        {/* Navigation Tabs */}
        <Tabs defaultValue="guidelines" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="guidelines" data-testid="tab-guidelines">
              <BookOpen className="w-4 h-4 mr-2" />
              Guidelines
            </TabsTrigger>
            <TabsTrigger value="knowledge" data-testid="tab-knowledge">
              <Heart className="w-4 h-4 mr-2" />
              Knowledge Center
            </TabsTrigger>
            <TabsTrigger value="workouts" data-testid="tab-workouts">
              <Dumbbell className="w-4 h-4 mr-2" />
              Workouts
            </TabsTrigger>
            <TabsTrigger value="progress" data-testid="tab-progress">
              <ChartBar className="w-4 h-4 mr-2" />
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="guidelines">
            <GuidelinesSection />
          </TabsContent>

          <TabsContent value="knowledge">
            <KnowledgeCenterSection 
              articles={Array.isArray(knowledgeArticles) ? knowledgeArticles : []} 
              onArticleClick={setSelectedArticle}
            />
          </TabsContent>

          <TabsContent value="workouts">
            <WorkoutsSection programId={programId} />
          </TabsContent>

          <TabsContent value="progress">
            <ProgressSection 
              userId={user.id} 
              programId={programId} 
              progressEntries={Array.isArray(progressEntries) ? progressEntries : []} 
            />
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

function GuidelinesSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Program Guidelines</CardTitle>
        <CardDescription>
          Essential safety information and tips for your core recovery journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Safety First</h3>
            <ul className="space-y-2 text-sm">
              <li>• Always consult with your healthcare provider before starting</li>
              <li>• Stop immediately if you experience pain or discomfort</li>
              <li>• Listen to your body and modify exercises as needed</li>
              <li>• Ensure you're cleared for exercise (typically 6+ weeks postpartum)</li>
              <li>• Stay hydrated and well-nourished throughout the program</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Program Structure</h3>
            <ul className="space-y-2 text-sm">
              <li>• Weeks 1 & 6: 4 workout sessions per week</li>
              <li>• Weeks 2-5: 3 workout sessions per week</li>
              <li>• Each session is 15-25 minutes</li>
              <li>• Focus on proper breathing and form over intensity</li>
              <li>• Optional gentle cardio on rest days</li>
            </ul>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">Mindset & Expectations</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Recovery is a journey, not a destination. Be patient and kind to yourself as your body heals 
            and strengthens. Every small step forward is progress worth celebrating. Focus on how you feel 
            rather than how you look, and remember that healing takes time.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function KnowledgeCenterSection({ 
  articles, 
  onArticleClick 
}: { 
  articles: any[]; 
  onArticleClick: (article: any) => void;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Center</CardTitle>
          <CardDescription>
            Educational resources to support your understanding and recovery
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        {articles.map((article) => (
          <Card 
            key={article.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onArticleClick(article)}
            data-testid={`card-article-${article.id}`}
          >
            <CardHeader>
              <CardTitle className="text-lg">{article.title}</CardTitle>
              <Badge variant="outline" className="w-fit">
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
  );
}

function WorkoutsSection({ programId }: { programId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>6-Week Workout Plan</CardTitle>
        <CardDescription>
          Your structured weekly workouts for core recovery and strengthening
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Dumbbell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Workout component will be implemented next</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ProgressSection({ userId, programId, progressEntries }: { 
  userId: string; 
  programId: string; 
  progressEntries: any[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Tracking</CardTitle>
        <CardDescription>
          Track your weekly measurements and recovery progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <ChartBar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Progress tracking component will be implemented next</p>
        </div>
      </CardContent>
    </Card>
  );
}