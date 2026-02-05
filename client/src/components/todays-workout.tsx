import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Play, 
  CheckCircle, 
  Sparkles,
  MessageCircle,
  Send,
  Loader2,
  Calendar,
  Youtube,
  Star,
  Clock,
  Dumbbell,
  Info,
  Heart,
  Eye,
  ChevronDown,
  ChevronUp,
  Camera,
  Trophy,
  ArrowRight,
  Flame,
  ThumbsUp,
  ThumbsDown,
  Wind
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { workoutPrograms, ProgramData, Exercise } from "@/data/workoutPrograms";
import { useWorkoutSessionProgress, useLogWorkoutSession, getDayType, getDayTypeLabel, getWeekSchedule } from "@/hooks/useWorkoutSessions";
import { SpotifyWidget } from "@/components/spotify-widget";
import { PlayAllButton } from "@/components/video-modal";
import examplePhotoImage from "@assets/WhatsApp Image 2025-10-06 at 21.30.02_1759768347069.jpeg";

interface TodaysWorkoutProps {
  userId: string;
  onStartWorkout?: (weekNumber: number) => void;
  isFirstLogin?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  hasSeenFirstWorkoutWelcome?: boolean;
}

interface WorkoutProgress {
  currentWeek: number;
  currentDay: number;
  totalWorkoutsCompleted: number;
  weeklyWorkoutsCompleted: number;
  weeklyWorkoutsTotal: number;
  overallProgress: number;
  lastCompletedAt: string | null;
  completedWorkoutIds: string[];
  workoutCompletedToday: boolean;
}

interface SuggestedAction {
  type: string;
  label: string;
  description: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  action?: { type: "swap_workout"; week: number };
  suggestedActions?: SuggestedAction[];
  feedback?: "helpful" | "not-helpful" | null;
}

const SWAPS_PER_WEEK = 2;

const programOverviews: Record<number, { focus: string; duration: string; howItWorks: string }> = {
  1: {
    focus: "Reconnecting with your breath and core",
    duration: "15-20 minutes",
    howItWorks: "Gentle movements to wake up your deep core muscles. Focus on breathing and form - not speed."
  },
  2: {
    focus: "Building core stability",
    duration: "20-25 minutes",
    howItWorks: "We add light resistance. Move slowly, feel each muscle engage. Rest when needed."
  },
  3: {
    focus: "Core strength foundations",
    duration: "25-30 minutes",
    howItWorks: "Longer holds, more reps. Your core is getting stronger! Listen to your body."
  },
  4: {
    focus: "Full body integration",
    duration: "25-30 minutes",
    howItWorks: "Core meets full body. These exercises build real functional strength for daily life."
  },
  5: {
    focus: "Building power",
    duration: "30-35 minutes",
    howItWorks: "More challenging movements. You've built the foundation - now we push a little harder."
  },
  6: {
    focus: "Putting it all together",
    duration: "30-35 minutes",
    howItWorks: "The grand finale! Full routines combining everything you've learned. You've got this!"
  }
};

function getYouTubeThumbnail(url: string): string {
  const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
  return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : "";
}

function getYouTubeEmbedUrl(url: string): string {
  const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : "";
}

export default function TodaysWorkout({ userId, onStartWorkout, isFirstLogin = false, isExpanded = true, onToggleExpand, hasSeenFirstWorkoutWelcome = false }: TodaysWorkoutProps) {
  const [showZoeChat, setShowZoeChat] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState<string | null>(null);
  const [showProgramInfo, setShowProgramInfo] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isZoeTyping, setIsZoeTyping] = useState(false);
  const [challengeRating, setChallengeRating] = useState(0);
  const [showWelcome, setShowWelcome] = useState(isFirstLogin);
  const [showConfetti, setShowConfetti] = useState(false);
  const prevCompletedCount = useRef(0);
  const [swapsUsedThisWeek, setSwapsUsedThisWeek] = useState(0);
  const [showZoeIntroExpanded, setShowZoeIntroExpanded] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showFirstWorkoutWelcome, setShowFirstWorkoutWelcome] = useState(!hasSeenFirstWorkoutWelcome);
  const [welcomeStep, setWelcomeStep] = useState<'video' | 'photo' | 'ready'>('video');
  const [showWelcomeVideo, setShowWelcomeVideo] = useState(false);
  const [showWeekComplete, setShowWeekComplete] = useState(false);
  const prevWorkoutsCompletedRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedWeekOverride, setSelectedWeekOverride] = useState<number | null>(null);
  const [showWorkoutOnRestDay, setShowWorkoutOnRestDay] = useState(false);
  const [isLoadingRestDayWorkout, setIsLoadingRestDayWorkout] = useState(false);
  const [isCardioMode, setIsCardioMode] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  const { data: progress, isLoading } = useQuery<WorkoutProgress>({
    queryKey: ["/api/workout-progress", userId],
    enabled: !!userId,
  });

  const { data: sessionProgress } = useWorkoutSessionProgress();
  const logWorkoutSession = useLogWorkoutSession();

  const today = new Date();
  const dayOfWeek = today.getDay();
  const todayDayType = getDayType(dayOfWeek);
  const todayDayTypeLabel = getDayTypeLabel(todayDayType);
  const weekSchedule = getWeekSchedule();
  const todayDayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek];

  const currentWeekProgress = sessionProgress?.weeklyProgress?.find(
    w => w.week === (sessionProgress?.currentWeek || 1)
  );
  const workoutsCompletedThisWeek = currentWeekProgress?.workoutsCompleted || 0;
  const nextWorkoutNumber = workoutsCompletedThisWeek + 1;

  const markWelcomeSeenMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/first-workout-welcome/complete", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/session"] });
    },
  });

  const zoeChatMutation = useMutation({
    mutationFn: async (message: string) => {
      const currentProgram = workoutPrograms.find(p => p.week === (progress?.currentWeek || 1)) || workoutPrograms[0];
      const response = await apiRequest("POST", "/api/ask-zoe", {
        message,
        userId,
        context: {
          currentWeek: progress?.currentWeek || 1,
          currentDay: progress?.currentDay || 1,
          workoutsCompleted: progress?.totalWorkoutsCompleted || 0,
          currentProgram: currentProgram.title,
          exercises: currentProgram.part2.exercises.map(e => `${e.name} (${e.reps})`).join(", "),
          swapsRemaining: SWAPS_PER_WEEK - swapsUsedThisWeek,
          canSwapWorkout: swapsUsedThisWeek < SWAPS_PER_WEEK,
        }
      });
      return response.json();
    },
    onSuccess: (data) => {
      const reply = data.reply;
      const newMessage: ChatMessage = { 
        role: "assistant", 
        content: reply,
        suggestedActions: data.suggestedActions || []
      };
      
      if (reply.toLowerCase().includes("week 1") && reply.toLowerCase().includes("switch")) {
        newMessage.action = { type: "swap_workout", week: 1 };
      }
      
      setChatMessages(prev => [...prev, newMessage]);
      setIsZoeTyping(false);
    },
    onError: () => {
      setChatMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm having trouble connecting right now. Try asking again in a moment!" 
      }]);
      setIsZoeTyping(false);
    },
  });

  const completionMutation = useMutation({
    mutationFn: async (completionData: any) => {
      const response = await apiRequest("POST", "/api/workouts/complete", {
        ...completionData,
        userId,
        workoutId: `week${progress?.currentWeek || 1}-day${progress?.currentDay || 1}`,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-progress", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/member-programs", userId] });
      setCompletedExercises(new Set());
      setChallengeRating(0);
      toast({
        title: "Workout Complete! 🎉",
        description: "Amazing work! Your progress has been saved.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save workout. Please try again.",
      });
    },
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Trigger confetti when all exercises are completed
  useEffect(() => {
    if (!progress) return;
    
    const currentProg = workoutPrograms.find(p => p.week === progress.currentWeek) || workoutPrograms[0];
    const exerciseCount = currentProg.part2.exercises.length;
    const allComplete = exerciseCount > 0 && completedExercises.size === exerciseCount;
    const wasNotComplete = prevCompletedCount.current < exerciseCount;
    
    if (allComplete && wasNotComplete) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    
    prevCompletedCount.current = completedExercises.size;
  }, [completedExercises.size, progress]);

  // Detect week completion (4 workouts done)
  useEffect(() => {
    if (workoutsCompletedThisWeek === 4 && prevWorkoutsCompletedRef.current === 3) {
      setShowWeekComplete(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
    prevWorkoutsCompletedRef.current = workoutsCompletedThisWeek;
  }, [workoutsCompletedThisWeek]);

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;
    setChatMessages(prev => [...prev, { role: "user", content: message }]);
    setChatInput("");
    setIsZoeTyping(true);
    zoeChatMutation.mutate(message);
  };

  const handleSwapWorkout = (targetWeek: number) => {
    if (swapsUsedThisWeek >= SWAPS_PER_WEEK) {
      toast({
        variant: "destructive",
        title: "No swaps remaining",
        description: "You've used all your workout swaps this week. Stay consistent!",
      });
      return;
    }
    
    setSwapsUsedThisWeek(prev => prev + 1);
    setShowZoeChat(false);
    if (onStartWorkout) {
      onStartWorkout(targetWeek);
    }
    toast({
      title: "Workout Changed",
      description: `Switched to Week ${targetWeek}. You have ${SWAPS_PER_WEEK - swapsUsedThisWeek - 1} swap${SWAPS_PER_WEEK - swapsUsedThisWeek - 1 === 1 ? '' : 's'} left this week.`,
    });
  };

  const toggleExerciseComplete = (exerciseNum: number) => {
    setCompletedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseNum)) {
        newSet.delete(exerciseNum);
      } else {
        newSet.add(exerciseNum);
      }
      return newSet;
    });
  };

  const handleCompleteWorkout = () => {
    completionMutation.mutate({
      challengeRating,
      notes: `Completed ${completedExercises.size} exercises`,
    });
  };

  const openZoeWithSwapRequest = () => {
    setShowZoeChat(true);
    setTimeout(() => {
      handleSendMessage("I'm not feeling up to today's workout. Can I do something different?");
    }, 300);
  };

  if (isLoading) {
    return (
      <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 shadow-lg">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-pink-200 rounded w-1/3"></div>
            <div className="h-4 bg-pink-100 rounded w-2/3"></div>
            <div className="h-32 bg-pink-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!progress) {
    return null;
  }

  const displayWeek = selectedWeekOverride || progress.currentWeek;
  const currentProgram = workoutPrograms.find(p => p.week === displayWeek) || workoutPrograms[0];
  const exercises = currentProgram.part2.exercises;
  const allExercisesComplete = completedExercises.size === exercises.length;
  const isWorkoutCompletedToday = progress.workoutCompletedToday;
  const programInfo = programOverviews[displayWeek] || programOverviews[1];

  const isFirstWorkout = progress.totalWorkoutsCompleted === 0 && !isWorkoutCompletedToday;

  const handleBeforePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("photoType", "start");
    
    try {
      const response = await fetch(`/api/progress-photos/${userId}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (response.ok) {
        toast({
          title: "Before Photo Saved! 📸",
          description: "You can view your progress anytime in the Progress tab.",
        });
        setWelcomeStep('ready');
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Don't worry, you can add your photo later in the Progress tab.",
      });
      setWelcomeStep('ready');
    }
  };

  // First workout welcome flow - shows for users who haven't completed any workouts yet
  if (showFirstWorkoutWelcome && isFirstWorkout) {
    return (
      <Card className="border-pink-200 bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 shadow-xl overflow-hidden">
        <CardContent className="p-6 space-y-6">
          {welcomeStep === 'video' && (
            <>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome, Mama! 💕</h2>
                <p className="text-gray-600 text-sm">
                  I'm so proud of you for taking this step for yourself.
                </p>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-md space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg">Z</span>
                  </div>
                  <div className="bg-pink-50 rounded-2xl rounded-tl-sm p-4 flex-1">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Hey mama! I'm Zoe, your coach through this journey. This program is designed 
                      specifically for postpartum bodies - we'll rebuild your core strength gently 
                      and safely, at YOUR pace.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg">Z</span>
                  </div>
                  <div className="bg-pink-50 rounded-2xl rounded-tl-sm p-4 flex-1">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Remember: healing over hustle. Listen to your body, take breaks when you need them, 
                      and celebrate every small win. You've got this, and I've got you! 💪
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 rounded-xl p-4">
                <h3 className="font-bold text-pink-700 mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  What to Expect
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-pink-500 flex-shrink-0" />
                    <span>6 weeks, gentle progression</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-pink-500 flex-shrink-0" />
                    <span>20-30 min per workout</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Dumbbell className="w-4 h-4 text-pink-500 flex-shrink-0" />
                    <span>Core rehabilitation focus</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Heart className="w-4 h-4 text-pink-500 flex-shrink-0" />
                    <span>Healing over hustle</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setWelcomeStep('photo')}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                  data-testid="button-continue-to-photo"
                >
                  Continue
                  <ChevronDown className="w-4 h-4 ml-2 -rotate-90" />
                </Button>
              </div>
            </>
          )}

          {welcomeStep === 'photo' && (
            <>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Capture Your Starting Point</h2>
                <p className="text-gray-600 text-sm max-w-sm mx-auto">
                  Many mamas find it powerful to see their progress later. Want to snap a quick "before" photo?
                </p>
              </div>

              {/* Example Photo & Tips Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Example Image */}
                <div className="bg-white rounded-xl p-4 border-2 border-pink-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-pink-600" />
                    <h3 className="text-sm font-bold text-gray-900">Example Photo Angle</h3>
                  </div>
                  <div className="relative rounded-lg overflow-hidden mb-2 bg-gray-100">
                    <img 
                      src={examplePhotoImage} 
                      alt="Example progress photo showing proper angle" 
                      className="w-full h-auto object-contain max-h-48"
                      data-testid="img-example-photo-welcome"
                    />
                  </div>
                  <p className="text-xs text-gray-600 text-center italic">
                    Side-angle view showing body posture and core area clearly
                  </p>
                </div>

                {/* Photography Tips */}
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 border-2 border-pink-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4 text-pink-600" />
                    <h3 className="text-sm font-bold text-gray-900">Photography Tips</h3>
                  </div>
                  <ul className="space-y-2 text-xs text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-pink-600 font-bold">1.</span>
                      <span><strong>Same Location & Lighting:</strong> Use consistent lighting each time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-600 font-bold">2.</span>
                      <span><strong>Fitted Clothing:</strong> Wear form-fitting clothes or sports bra</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-600 font-bold">3.</span>
                      <span><strong>Side-Angle Mirror Selfie:</strong> Side-profile shows core changes best</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-600 font-bold">4.</span>
                      <span><strong>Consistent Distance:</strong> Capture from chest to upper thighs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-600 font-bold">5.</span>
                      <span><strong>Privacy Assured:</strong> Your photos are completely private—only you can see them</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <p className="text-purple-700 text-sm text-center mb-4">
                  This is completely optional. You can always add it later in the Progress tab.
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleBeforePhotoSelect}
                  className="hidden"
                  data-testid="input-before-photo"
                />
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full sm:flex-1 border-purple-300 text-purple-700 hover:bg-purple-100"
                    data-testid="button-upload-before-photo"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Take/Upload Photo
                  </Button>
                  <Button
                    onClick={() => setWelcomeStep('ready')}
                    variant="ghost"
                    className="w-full sm:w-auto text-gray-500 hover:text-gray-700"
                    data-testid="button-skip-photo"
                  >
                    Skip for now
                  </Button>
                </div>
              </div>
            </>
          )}

          {welcomeStep === 'ready' && (
            <>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">You're All Set!</h2>
                <p className="text-gray-600 max-w-sm mx-auto">
                  Let's begin Week 1, Day 1. Remember: this is about healing, not hustling. 
                  Go at your own pace and listen to your body.
                </p>
              </div>

              <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-4">
                <h3 className="font-bold text-pink-700 mb-2">Today's Focus</h3>
                <p className="text-gray-600 text-sm mb-2">
                  <strong>Part 1:</strong> 360° Breathing (25 breaths)
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Part 2:</strong> 5 gentle exercises × 3 rounds
                </p>
              </div>

              <Button
                onClick={() => {
                  setShowFirstWorkoutWelcome(false);
                  markWelcomeSeenMutation.mutate();
                }}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-6 text-lg"
                data-testid="button-begin-first-workout"
              >
                <Play className="w-6 h-6 mr-2" />
                Let's Begin! 💪
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  if (showWelcome && isFirstLogin && !isFirstWorkout) {
    return (
      <Card className="border-pink-200 bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 shadow-xl overflow-hidden">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Welcome Back!</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Great to see you again, mama! Let's continue your recovery journey.
          </p>

          <Button
            onClick={() => setShowWelcome(false)}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-3 text-lg"
            data-testid="button-continue-workout"
          >
            <Play className="w-5 h-5 mr-2" />
            Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Collapsed view - shows minimal card when minimized
  if (!isExpanded) {
    return (
      <Card 
        className="border-pink-200 bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
        onClick={onToggleExpand}
        data-testid="card-todays-workout-collapsed"
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Today's Workout</h3>
                <p className="text-pink-100 text-sm">
                  Week {sessionProgress?.currentWeek || progress.currentWeek} • {isCardioMode ? 'Cardio' : 'Core Workout'}
                  {isWorkoutCompletedToday && " ✓ Complete"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Confetti Celebration Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti-piece absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                backgroundColor: ['#ec4899', '#f472b6', '#fbbf24', '#a855f7', '#22c55e', '#06b6d4'][Math.floor(Math.random() * 6)],
                width: `${Math.random() * 10 + 6}px`,
                height: `${Math.random() * 10 + 6}px`,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${Math.random() * 2 + 2}s`,
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="celebration-text text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-green-500 animate-bounce">
              Amazing! 
            </div>
          </div>
        </div>
      )}

      {/* Week Completion Celebration Dialog */}
      <Dialog open={showWeekComplete} onOpenChange={setShowWeekComplete}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg animate-bounce">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Week {sessionProgress?.currentWeek || 1} Complete!
            </DialogTitle>
            <DialogDescription className="text-gray-600 space-y-4 mt-4">
              <p className="text-lg">
                You did it, mama! You've completed all 4 workouts this week. 
              </p>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <p className="text-green-700 font-medium">
                  Your core is getting stronger every day. Your body is healing beautifully.
                </p>
              </div>
              {(sessionProgress?.currentWeek || 1) < 6 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                  <p className="text-purple-700 font-medium flex items-center justify-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Week {(sessionProgress?.currentWeek || 1) + 1} is now unlocked!
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => setShowWeekComplete(false)}
            className="w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-6 text-lg"
            data-testid="button-week-complete-continue"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Continue My Journey
          </Button>
        </DialogContent>
      </Dialog>

      <Card className="border-pink-200 bg-gradient-to-br from-white to-pink-50 shadow-lg overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Today's Workout</CardTitle>
              <p className="text-pink-100 text-sm mt-0.5">
                Week {sessionProgress?.currentWeek || progress.currentWeek} • {isCardioMode ? 'Cardio Day' : `Core Workout`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSchedule(!showSchedule)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-lg"
                aria-label="View weekly schedule"
              >
                📅
              </button>
              {onToggleExpand && (
                <button
                  onClick={onToggleExpand}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  data-testid="button-minimize-workout"
                  aria-label="Minimize workout"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          
          {/* Weekly Schedule Popover */}
          {showSchedule && (
            <div className="mt-3 bg-white/95 rounded-lg p-3 text-gray-800">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">Weekly Schedule</h4>
                <button 
                  onClick={() => setShowSchedule(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="flex justify-between gap-1">
                {weekSchedule.map((day, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                    <span className={`text-[10px] font-medium ${day.day === todayDayName ? 'text-pink-600' : 'text-gray-500'}`}>
                      {day.day}
                    </span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      day.day === todayDayName
                        ? 'bg-pink-500 text-white ring-2 ring-pink-300'
                        : day.type === 'workout'
                          ? 'bg-pink-100 text-pink-600'
                          : day.type === 'cardio'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-purple-100 text-purple-600'
                    }`}>
                      {day.type === 'workout' ? 'C' : day.type === 'cardio' ? '🏃' : '💤'}
                    </div>
                    <span className="text-[9px] text-gray-400">
                      {day.type === 'workout' ? 'Core' : day.type === 'cardio' ? 'Cardio' : 'Rest'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Show alternative option based on day type */}
          {todayDayType !== 'cardio' && !isCardioMode && (
            <button
              onClick={() => setIsCardioMode(true)}
              className="mt-3 w-full py-2 px-3 rounded-lg text-sm font-medium bg-white/20 text-white hover:bg-white/30 transition-all flex items-center justify-center gap-2"
            >
              <Wind className="w-4 h-4" />
              Do Cardio Instead
            </button>
          )}
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Rest Day View - Show by default on rest days */}
          {todayDayType === 'rest' && !showWorkoutOnRestDay ? (
            <div className="space-y-4">
              <div className="p-8 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border border-purple-200 rounded-xl text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400"></div>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
                  <span className="text-4xl">💤</span>
                </div>
                <h3 className="text-2xl font-bold text-purple-700 mb-2">It's Your Rest Day!</h3>
                <p className="text-purple-600 text-base mb-4">
                  Take some well-deserved rest today, mama. Your body is healing and rebuilding stronger!
                </p>
                <div className="bg-white/60 rounded-lg p-4 mb-4 border border-purple-100">
                  <p className="text-sm text-gray-600 italic">
                    "Rest days are growth days. Your muscles repair and strengthen while you relax. Honor your body's need for recovery." 
                  </p>
                  <p className="text-xs text-pink-500 mt-2 font-medium">— Coach Zoe 💕</p>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-center gap-4 text-sm text-purple-600">
                    <span>🧘 Gentle stretching</span>
                    <span>💧 Stay hydrated</span>
                    <span>😴 Get good sleep</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsLoadingRestDayWorkout(true);
                      setTimeout(() => {
                        setIsLoadingRestDayWorkout(false);
                        setShowWorkoutOnRestDay(true);
                      }, 2000);
                    }}
                    disabled={isLoadingRestDayWorkout}
                    className="mx-auto mt-2 border-purple-300 text-purple-700 hover:bg-purple-100 min-w-[220px]"
                    data-testid="button-workout-anyway"
                  >
                    {isLoadingRestDayWorkout ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Love your dedication! 💪
                      </>
                    ) : (
                      <>
                        <Dumbbell className="w-4 h-4 mr-2" />
                        I want to workout anyway
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : isCardioMode ? (
            <div className="space-y-4">
              {/* Cardio Day Content */}
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400"></div>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                  <Wind className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-green-700 mb-2">Cardio Day</h3>
                <p className="text-green-600 text-base mb-4">
                  Get your heart pumping with 20-30 minutes of movement you enjoy!
                </p>
                
                <div className="bg-white/60 rounded-lg p-4 mb-4 border border-green-100 text-left">
                  <h4 className="font-semibold text-green-700 mb-3">Choose what feels good:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🚶</span>
                      <span>Brisk walk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🏊</span>
                      <span>Swimming</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🚴</span>
                      <span>Cycling</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💃</span>
                      <span>Dance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🧘</span>
                      <span>Yoga flow</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🏃</span>
                      <span>Light jog</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-pink-50/60 rounded-lg p-3 border border-pink-100">
                  <p className="text-sm text-gray-600 italic">
                    "Cardio helps your recovery and boosts your mood. Listen to your body and move at your own pace." 
                  </p>
                  <p className="text-xs text-pink-500 mt-2 font-medium">— Coach Zoe 💕</p>
                </div>
              </div>
              
              <div className="text-center">
                <Button
                  onClick={() => setIsCardioMode(false)}
                  variant="outline"
                  className="border-pink-200 text-pink-600 hover:bg-pink-50"
                >
                  <Dumbbell className="w-4 h-4 mr-2" />
                  Switch to Core Workout
                </Button>
              </div>
            </div>
          ) : isWorkoutCompletedToday ? (
            <div className="space-y-4">
              {/* Celebration Banner */}
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400"></div>
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-green-700">You Did Amazing Today! 🌟</h3>
                <p className="text-green-600 text-sm mt-1">Day {progress.currentDay} of Week {progress.currentWeek} complete</p>
                <p className="text-gray-600 text-xs mt-2 italic">
                  Your body is healing and getting stronger. Rest well, mama!
                </p>
                
                {/* Stats Row */}
                <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-green-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{exercises.length}</div>
                    <div className="text-xs text-gray-500">Exercises</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{sessionProgress?.totalWorkoutsCompleted || 0}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                </div>
                
                {/* Motivational Streak Message */}
                {(sessionProgress?.currentStreak || 0) >= 2 && (
                  <div className="mt-3 text-center">
                    <p className="text-sm bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent font-medium">
                      {sessionProgress?.currentStreak === 2 && "Two days in a row! You're building momentum! 💪"}
                      {sessionProgress?.currentStreak === 3 && "Three day streak! Your consistency is inspiring! 💪"}
                      {sessionProgress?.currentStreak === 4 && "Four days strong! You're unstoppable! 🌟"}
                      {(sessionProgress?.currentStreak || 0) >= 5 && (sessionProgress?.currentStreak || 0) < 7 && `${sessionProgress?.currentStreak} day streak! You're amazing, mama! ✨`}
                      {(sessionProgress?.currentStreak || 0) >= 7 && `WOW! ${sessionProgress?.currentStreak} days in a row! You're absolutely crushing it! 🏆`}
                    </p>
                  </div>
                )}
              </div>

              {/* Rest Day Message */}
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">
                  Take time to rest and recover. Your body is rebuilding stronger! 
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Compact Program Info Bar */}
              <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg px-4 py-3 border border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-pink-500" />
                    <span className="text-sm font-medium text-gray-700">{programInfo.duration}</span>
                  </div>
                  <div className="w-px h-4 bg-purple-200"></div>
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-pink-500" />
                    <span className="text-sm font-medium text-gray-700">{exercises.length} exercises</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProgramInfo(!showProgramInfo)}
                  className="text-purple-600 hover:bg-purple-100 text-xs px-2"
                  data-testid="button-toggle-program-info"
                >
                  {showProgramInfo ? "Less" : "More"}
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showProgramInfo ? 'rotate-180' : ''}`} />
                </Button>
              </div>
              
              {/* Expandable Program Details */}
              {showProgramInfo && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                  <div className="bg-white/80 rounded-lg p-3 border border-gray-100">
                    <h4 className="font-bold text-purple-800 text-sm">{currentProgram.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{programInfo.howItWorks}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${currentProgram.colorScheme.bgColor} border ${currentProgram.colorScheme.borderColor}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Heart className="w-4 h-4 text-pink-500" />
                      <span className="text-xs font-semibold text-pink-600 uppercase tracking-wide">Coach Note</span>
                    </div>
                    <p className="text-xs text-gray-700">{currentProgram.coachNote}</p>
                  </div>
                </div>
              )}

              {/* PART 1: Breathing/Healing Section - START HERE */}
              <div className="relative">
                <Badge className="absolute -top-2 left-3 bg-green-500 text-white text-xs px-2 py-0.5 z-10">
                  START HERE
                </Badge>
                <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-xl p-4 border-2 border-pink-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs font-bold">1</div>
                    <h5 className="font-bold text-pink-700 uppercase tracking-wide text-sm">
                      {currentProgram.part1.title}
                    </h5>
                  </div>
                  <p className="text-xs text-pink-600 mb-3 italic">
                    Always begin with your healing breath work before exercises
                  </p>
                  {currentProgram.part1.exercises.map((breathExercise, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/70 rounded-lg px-3 py-2">
                      <span className="text-sm font-medium text-gray-700">{breathExercise.name}</span>
                      <span className="text-sm font-bold text-pink-600">{breathExercise.reps}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PART 2: Main Workout Section */}
              <div className="space-y-3">
                {/* Part 2 Header - Subtle section divider */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold">2</div>
                      <h5 className="font-semibold text-gray-700 uppercase tracking-wide text-sm">
                        Main Workout (3 Rounds)
                      </h5>
                    </div>
                    {currentProgram.part2.playlistUrl && (
                      <PlayAllButton 
                        url={currentProgram.part2.playlistUrl}
                        colorClass="bg-pink-100 hover:bg-pink-200 text-pink-600"
                      />
                    )}
                  </div>
                </div>
                
                {/* 3 Rounds Instruction - Clear and simple */}
                <div className="bg-gradient-to-r from-pink-100 to-amber-50 border-2 border-pink-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                      3×
                    </div>
                    <div>
                      <p className="font-semibold text-pink-700">Do all {exercises.length} exercises × 3 rounds</p>
                      <p className="text-sm text-gray-600">Complete all exercises, rest 30-60 seconds, then repeat 2 more times</p>
                    </div>
                  </div>
                </div>

                {/* Spotify Workout Music Widget */}
                <SpotifyWidget currentWeek={progress.currentWeek} />

                {/* Exercise Progress */}
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold text-gray-700 flex items-center gap-2">
                    <Play className="w-4 h-4 text-pink-500" />
                    Your Exercises ({completedExercises.size}/{exercises.length} done)
                  </h5>
                  {!allExercisesComplete && (
                    <Button
                      onClick={() => {
                        const allNums = new Set(exercises.map(e => e.num));
                        setCompletedExercises(allNums);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 text-xs"
                      data-testid="button-mark-all-complete"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Complete All
                    </Button>
                  )}
                </div>

                <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                  {exercises.map((exercise, idx) => (
                    <div 
                      key={idx}
                      className={`rounded-xl border overflow-hidden transition-all ${
                        completedExercises.has(exercise.num) 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-white border-gray-100 hover:border-pink-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-3 p-3 lg:p-4">
                        <Checkbox
                          checked={completedExercises.has(exercise.num)}
                          onCheckedChange={() => toggleExerciseComplete(exercise.num)}
                          className="w-6 h-6 lg:w-7 lg:h-7 mt-1 border-2 border-pink-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 transition-all duration-200 data-[state=checked]:scale-110 data-[state=checked]:animate-[checkPop_0.3s_ease-out] hover:scale-105 active:scale-95"
                          data-testid={`checkbox-exercise-${exercise.num}`}
                        />
                        
                        <button
                          onClick={() => setShowVideoPlayer(exercise.url)}
                          className="relative w-24 h-16 lg:w-32 lg:h-20 rounded-lg overflow-hidden flex-shrink-0 group"
                          data-testid={`video-thumbnail-${exercise.num}`}
                        >
                          <img 
                            src={getYouTubeThumbnail(exercise.url)} 
                            alt={exercise.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                            <Youtube className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                          </div>
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold lg:text-lg ${completedExercises.has(exercise.num) ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                            {exercise.name}
                          </p>
                          <p className={`text-base lg:text-lg font-bold mt-1 ${completedExercises.has(exercise.num) ? 'text-green-600' : 'text-pink-600'}`}>
                            {exercise.reps}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {allExercisesComplete && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h5 className="font-semibold text-green-700 mb-3">All exercises done! How was it?</h5>
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setChallengeRating(star)}
                        className="p-1"
                        data-testid={`rating-star-${star}`}
                      >
                        <Star 
                          className={`w-8 h-8 transition-colors ${
                            star <= challengeRating 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <Button
                    onClick={handleCompleteWorkout}
                    disabled={challengeRating === 0 || completionMutation.isPending}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    data-testid="button-complete-workout"
                  >
                    {completionMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Complete Today's Workout
                  </Button>
                </div>
              )}

              {/* Zoe Check-in Section - Collapsible */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    {/* Short default text */}
                    <p className="text-sm text-gray-700 mb-2">
                      <strong className="text-purple-700">Need help?</strong> I'm here for you, mama! 💪
                    </p>
                    
                    {/* Expandable full message */}
                    {showZoeIntroExpanded && (
                      <p className="text-sm text-gray-600 mb-3 bg-white/50 rounded-lg p-2">
                        If you're having a rough day, I can suggest something gentler - but I don't usually let my mamas skip their scheduled workout! 
                        Consistency is how we heal. I allow {SWAPS_PER_WEEK} workout swaps per week for those really tough days.
                      </p>
                    )}
                    
                    <button
                      onClick={() => setShowZoeIntroExpanded(!showZoeIntroExpanded)}
                      className="text-xs text-purple-500 hover:text-purple-700 mb-3 underline"
                    >
                      {showZoeIntroExpanded ? "Show less" : "Read more about swaps..."}
                    </button>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => setShowZoeChat(true)}
                        variant="outline"
                        size="sm"
                        className="border-purple-200 text-purple-600 hover:bg-purple-50"
                        data-testid="button-ask-zoe"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        AI Zoe
                      </Button>
                      <Button
                        onClick={openZoeWithSwapRequest}
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-purple-600"
                        data-testid="button-need-different"
                      >
                        I need something different today
                      </Button>
                    </div>
                    {swapsUsedThisWeek > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        {SWAPS_PER_WEEK - swapsUsedThisWeek} workout swap{SWAPS_PER_WEEK - swapsUsedThisWeek === 1 ? '' : 's'} remaining this week
                      </p>
                    )}
                  </div>
                </div>
              </div>

            </>
          )}
        </CardContent>
      </Card>

      {/* Video Player Dialog */}
      <Dialog open={!!showVideoPlayer} onOpenChange={() => setShowVideoPlayer(null)}>
        <DialogContent className="sm:max-w-2xl lg:max-w-4xl p-0 overflow-hidden">
          <div className="aspect-video w-full">
            {showVideoPlayer && (
              <iframe
                src={getYouTubeEmbedUrl(showVideoPlayer)}
                className="w-full h-full"
                title="Exercise Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                loading="lazy"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Ask Zoe Chat Dialog */}
      <Dialog open={showZoeChat} onOpenChange={setShowZoeChat}>
        <DialogContent className="sm:max-w-md lg:max-w-lg h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-white">Coach Zoe</DialogTitle>
                <DialogDescription className="text-purple-100">
                  Your postpartum fitness coach
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-6">
                  <Sparkles className="w-10 h-10 text-purple-300 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-700 mb-2">Hi mama! I'm Zoe.</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    I'm here to support you - but I also believe in you! Consistency is key to your recovery. 
                    That said, I get it - some days are harder than others.
                  </p>
                  <div className="bg-purple-50 rounded-lg p-3 text-left mb-4">
                    <p className="text-xs text-purple-600 font-medium mb-1">💡 Good to know:</p>
                    <p className="text-xs text-gray-600">
                      I allow {SWAPS_PER_WEEK} workout swaps per week for those really tough days. 
                      You have {SWAPS_PER_WEEK - swapsUsedThisWeek} remaining this week.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleSendMessage("What's the goal of this week's workout?")}
                      className="block w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm text-purple-700 transition-colors"
                      data-testid="quick-prompt-goal"
                    >
                      "What's the goal of this week?"
                    </button>
                    <button
                      onClick={() => handleSendMessage("How do I know if I'm doing the exercises correctly?")}
                      className="block w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm text-purple-700 transition-colors"
                      data-testid="quick-prompt-form"
                    >
                      "How do I know if I'm doing it right?"
                    </button>
                    <button
                      onClick={() => handleSendMessage("I'm feeling tired and low energy today")}
                      className="block w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm text-purple-700 transition-colors"
                      data-testid="quick-prompt-tired"
                    >
                      "I'm feeling tired today"
                    </button>
                  </div>
                </div>
              )}

              {chatMessages.map((msg, idx) => (
                <div key={idx}>
                  <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.role === "user"
                          ? "bg-pink-500 text-white rounded-br-md"
                          : "bg-gray-100 text-gray-800 rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                  
                  {/* Legacy swap action */}
                  {msg.action?.type === "swap_workout" && swapsUsedThisWeek < SWAPS_PER_WEEK && (
                    <div className="mt-2 ml-2">
                      <Button
                        onClick={() => handleSwapWorkout(msg.action!.week)}
                        size="sm"
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                        data-testid="zoe-swap-suggestion"
                      >
                        Switch to Week {msg.action.week}
                      </Button>
                    </div>
                  )}
                  
                  {/* Suggested Actions */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-2 ml-2 flex flex-wrap gap-2">
                      {msg.suggestedActions.map((action, actionIdx) => (
                        <button
                          key={actionIdx}
                          onClick={() => {
                            if (action.type === 'swap_workout') {
                              handleSwapWorkout(1);
                            } else if (action.type === 'meal_suggestion') {
                              handleSendMessage("Can you suggest some healthy meals for postpartum recovery?");
                            } else if (action.type === 'view_program') {
                              setShowZoeChat(false);
                              if (onStartWorkout) onStartWorkout(progress?.currentWeek || 1);
                            } else if (action.type === 'watch_video') {
                              handleSendMessage("Can you share the video link for that exercise?");
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-medium rounded-full transition-colors"
                          data-testid={`zoe-action-${action.type}`}
                        >
                          {action.type === 'swap_workout' && <Heart className="w-3 h-3" />}
                          {action.type === 'meal_suggestion' && <Sparkles className="w-3 h-3" />}
                          {action.type === 'view_program' && <Calendar className="w-3 h-3" />}
                          {action.type === 'watch_video' && <Youtube className="w-3 h-3" />}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* AI Response Feedback Buttons */}
                  {msg.role === "assistant" && (
                    <div className="mt-2 ml-2 flex items-center gap-2">
                      <span className="text-xs text-gray-400">Was this helpful?</span>
                      <button
                        onClick={() => {
                          setChatMessages(prev => prev.map((m, i) => 
                            i === idx ? { ...m, feedback: "helpful" } : m
                          ));
                          toast({ 
                            title: "Thanks for your feedback!", 
                            description: "This helps us improve Zoe's responses." 
                          });
                        }}
                        className={`p-1.5 rounded-full transition-colors ${
                          msg.feedback === "helpful" 
                            ? "bg-green-100 text-green-600" 
                            : "hover:bg-gray-100 text-gray-400 hover:text-green-600"
                        }`}
                        data-testid={`feedback-helpful-${idx}`}
                        disabled={msg.feedback !== undefined && msg.feedback !== null}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setChatMessages(prev => prev.map((m, i) => 
                            i === idx ? { ...m, feedback: "not-helpful" } : m
                          ));
                          toast({ 
                            title: "Thanks for your feedback!", 
                            description: "We'll work on improving Zoe's responses." 
                          });
                        }}
                        className={`p-1.5 rounded-full transition-colors ${
                          msg.feedback === "not-helpful" 
                            ? "bg-red-100 text-red-600" 
                            : "hover:bg-gray-100 text-gray-400 hover:text-red-600"
                        }`}
                        data-testid={`feedback-not-helpful-${idx}`}
                        disabled={msg.feedback !== undefined && msg.feedback !== null}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {isZoeTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-md">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-gray-50">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(chatInput);
              }}
              className="flex gap-2"
            >
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask Zoe anything..."
                className="flex-1"
                disabled={isZoeTyping}
                data-testid="zoe-chat-input"
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={!chatInput.trim() || isZoeTyping}
                className="bg-purple-500 hover:bg-purple-600"
                data-testid="zoe-send-button"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
