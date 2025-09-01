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
  Video,
  Apple,
  Brain
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="guidelines" data-testid="tab-guidelines">
              <BookOpen className="w-4 h-4 mr-2" />
              📖 Guidelines
            </TabsTrigger>
            <TabsTrigger value="knowledge" data-testid="tab-knowledge">
              <Brain className="w-4 h-4 mr-2" />
              🧠 Knowledge
            </TabsTrigger>
            <TabsTrigger value="workouts" data-testid="tab-workouts">
              <Dumbbell className="w-4 h-4 mr-2" />
              💪 Workouts
            </TabsTrigger>
            <TabsTrigger value="nutrition" data-testid="tab-nutrition">
              <Apple className="w-4 h-4 mr-2" />
              🍎 Nutrition
            </TabsTrigger>
            <TabsTrigger value="progress" data-testid="tab-progress">
              <ChartBar className="w-4 h-4 mr-2" />
              📈 Progress
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

          <TabsContent value="nutrition">
            <NutritionSection />
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📖 Guidelines - Start Here</CardTitle>
          <CardDescription>
            Essential preparatory information for your core recovery journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Welcome from Zoe</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  A permanent link to the welcome message
                </p>
                <Button variant="outline" className="w-full">
                  View Welcome Message
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">When to Start</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><strong>Vaginal Birth:</strong> 6+ weeks postpartum with healthcare provider clearance</p>
                <p><strong>C-Section:</strong> 8+ weeks postpartum with healthcare provider clearance</p>
                <p className="text-muted-foreground">Always get clearance before beginning any exercise program</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Safety First</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Key Safety Warnings</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Stop if you experience pain or doming</li>
                  <li>• Always consult healthcare provider first</li>
                  <li>• Listen to your body and modify as needed</li>
                  <li>• Focus on proper form over intensity</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Mindset Shifts</h4>
                <ul className="space-y-1 text-sm">
                  <li>• This is healing, not "snapping back"</li>
                  <li>• Recovery is a journey, not a destination</li>
                  <li>• Celebrate small progress</li>
                  <li>• Be patient and kind to yourself</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How to Use This Program</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><strong>Week 1 & 6:</strong> 4 workout sessions per week</p>
                <p><strong>Weeks 2-5:</strong> 3 workout sessions per week</p>
                <p><strong>Duration:</strong> 15-25 minutes per session</p>
                <p className="text-muted-foreground">Rest days are crucial for recovery</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Equipment Needed</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p>• Yoga mat</p>
                <p>• Light resistance band</p>
                <p>• Small stability ball (optional)</p>
                <p>• Light dumbbells (optional)</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
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
          <CardTitle>🧠 Knowledge Center</CardTitle>
          <CardDescription>
            Educational library to empower you with understanding the "why" behind your recovery
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Understanding Your Core</CardTitle>
            <Badge variant="outline">Core Anatomy</Badge>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="text-muted-foreground mb-3">
              Learn about the "Core Canister" - your diaphragm, pelvic floor, and deep stabilizing muscles
            </p>
            <div className="flex items-center gap-2 text-primary">
              <Video className="w-4 h-4" />
              <span>Includes video content</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Proper Breathing</CardTitle>
            <Badge variant="outline">Fundamentals</Badge>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="text-muted-foreground mb-3">
              Master 360° breathing technique - the foundation of all core recovery
            </p>
            <div className="flex items-center gap-2 text-primary">
              <Video className="w-4 h-4" />
              <span>Includes video content</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">TVA Engagement</CardTitle>
            <Badge variant="outline">Deep Core</Badge>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="text-muted-foreground mb-3">
              How to find and activate your transverse abdominis - your deepest core muscle
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Diastasis Recti (DR)</CardTitle>
            <Badge variant="outline">Assessment</Badge>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="text-muted-foreground mb-3">
              What is DR and how to check for diastasis recti separation
            </p>
            <div className="flex items-center gap-2 text-primary">
              <Video className="w-4 h-4" />
              <span>Includes video content</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Core Concepts</CardTitle>
            <Badge variant="outline">Techniques</Badge>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="text-muted-foreground mb-3">
              Foundational movements: Belly Pump, Deep Core Hold, Ab Wraps
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Pelvic Floor Health</CardTitle>
            <Badge variant="outline">Education</Badge>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="text-muted-foreground mb-3">
              Understanding Kegels vs. Pelvic Floor Release and why crunches won't work
            </p>
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
      )}
    </div>
  );
}

function WorkoutsSection({ programId }: { programId: string }) {
  const weeks = [
    { number: 1, title: "Reconnect & Reset", sessions: 4, description: "Foundation building and body awareness" },
    { number: 2, title: "Stability & Breathwork", sessions: 3, description: "Strengthening breath connection" },
    { number: 3, title: "Control & Awareness", sessions: 3, description: "Developing control and precision" },
    { number: 4, title: "Align & Activate", sessions: 3, description: "Proper alignment and activation patterns" },
    { number: 5, title: "Functional Core Flow", sessions: 3, description: "Functional movement integration" },
    { number: 6, title: "Foundational Strength", sessions: 4, description: "Building lasting core strength" }
  ];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>💪 Workouts - The 6-Week Core Program</CardTitle>
          <CardDescription>
            Clean and focused area for your physical exercises and recovery
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {weeks.map((week) => (
          <Card key={week.number} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Week {week.number}: {week.title}</CardTitle>
              <Badge variant="outline">{week.sessions} sessions/week</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{week.description}</p>
              <Button variant="outline" className="w-full">
                View Week {week.number}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Reconnection Routine</CardTitle>
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
            <Button variant="outline" className="w-full">
              Start Daily Routine
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Optional Cardio Plan</CardTitle>
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
            <Button variant="outline" className="w-full">
              View Cardio Guide
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function NutritionSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🍎 Nutrition</CardTitle>
          <CardDescription>
            Nutritional guidance giving the importance it deserves for your core recovery
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nutrition for Core Repair</CardTitle>
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
            <CardTitle className="text-lg">Your Portion Guide</CardTitle>
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
            <Button variant="outline" className="w-full mt-3">
              View Detailed Guide
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Healing Foods Checklist</CardTitle>
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

function ProgressSection({ userId, programId, progressEntries }: { 
  userId: string; 
  programId: string; 
  progressEntries: any[];
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📈 Progress</CardTitle>
          <CardDescription>
            Track your journey and find information on what to do after the program
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Progress Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Interactive tracking table for gap measurements, symptoms, and energy levels
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span>Week 1 Assessment</span>
                <Button variant="outline" size="sm">Record</Button>
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
            <CardTitle className="text-lg">Ready for More?</CardTitle>
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
            <Button variant="outline" className="w-full">
              Return to Impact Readiness Test
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Red Flag Movements</CardTitle>
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