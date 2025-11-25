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
  Heart
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { workoutPrograms, ProgramData, Exercise } from "@/data/workoutPrograms";

interface TodaysWorkoutProps {
  userId: string;
  onStartWorkout?: (weekNumber: number) => void;
  isFirstLogin?: boolean;
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
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  action?: { type: "swap_workout"; week: number };
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

export default function TodaysWorkout({ userId, onStartWorkout, isFirstLogin = false }: TodaysWorkoutProps) {
  const [showZoeChat, setShowZoeChat] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState<string | null>(null);
  const [showTomorrowPreview, setShowTomorrowPreview] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isZoeTyping, setIsZoeTyping] = useState(false);
  const [challengeRating, setChallengeRating] = useState(0);
  const [showWelcome, setShowWelcome] = useState(isFirstLogin);
  const [swapsUsedThisWeek, setSwapsUsedThisWeek] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: progress, isLoading } = useQuery<WorkoutProgress>({
    queryKey: ["/api/workout-progress", userId],
    enabled: !!userId,
  });

  const zoeChatMutation = useMutation({
    mutationFn: async (message: string) => {
      const currentProgram = workoutPrograms.find(p => p.week === (progress?.currentWeek || 1)) || workoutPrograms[0];
      const response = await apiRequest("POST", "/api/ask-zoe", {
        message,
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
      const newMessage: ChatMessage = { role: "assistant", content: reply };
      
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

  const currentProgram = workoutPrograms.find(p => p.week === progress.currentWeek) || workoutPrograms[0];
  const exercises = currentProgram.part2.exercises;
  const allExercisesComplete = completedExercises.size === exercises.length;
  const isWorkoutCompletedToday = progress.completedWorkoutIds?.includes(
    `week${progress.currentWeek}-day${progress.currentDay}`
  );
  const programInfo = programOverviews[progress.currentWeek] || programOverviews[1];

  const tomorrowProgram = progress.currentDay < (progress.currentWeek === 1 ? 4 : 3)
    ? currentProgram
    : workoutPrograms.find(p => p.week === progress.currentWeek + 1) || currentProgram;

  if (showWelcome && isFirstLogin) {
    return (
      <Card className="border-pink-200 bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 shadow-xl overflow-hidden">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Welcome to Your Recovery Journey!</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            I'm so glad you're here, mama! This 6-week program is designed to help you 
            reconnect with your core and build strength safely postpartum.
          </p>
          
          <div className="bg-white/80 rounded-xl p-4 mb-6 text-left max-w-md mx-auto">
            <h3 className="font-semibold text-pink-700 mb-2">Week 1: Reconnect & Reset</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Focus on breath and posture</li>
              <li>• Gentle core reconnection</li>
              <li>• 4 workouts this week</li>
              <li>• Each workout is about 20-30 minutes</li>
            </ul>
          </div>

          <Button
            onClick={() => setShowWelcome(false)}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-3 text-lg"
            data-testid="button-start-first-workout"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Your First Workout
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-pink-200 bg-gradient-to-br from-white to-pink-50 shadow-lg overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Today's Workout</CardTitle>
              <p className="text-pink-100 text-sm mt-1">
                Week {progress.currentWeek} • Day {progress.currentDay}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{progress.weeklyWorkoutsCompleted}/{progress.weeklyWorkoutsTotal}</div>
              <div className="text-xs text-pink-100">this week</div>
            </div>
          </div>
          <Progress 
            value={(progress.weeklyWorkoutsCompleted / progress.weeklyWorkoutsTotal) * 100} 
            className="h-2 mt-3 bg-pink-300"
          />
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {isWorkoutCompletedToday ? (
            <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-green-700">Today's Workout Complete!</h3>
              <p className="text-green-600 text-sm mt-1">Amazing work, mama! Rest up and come back tomorrow. 💪</p>
              
              <Button
                onClick={() => setShowTomorrowPreview(true)}
                variant="outline"
                className="mt-4 border-green-300 text-green-600 hover:bg-green-50"
                data-testid="button-preview-tomorrow"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Preview Tomorrow's Workout
              </Button>
            </div>
          ) : (
            <>
              {/* Program Overview Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Info className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-purple-800">{currentProgram.title}</h4>
                    <p className="text-sm text-purple-600">{programInfo.focus}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-2">
                    <Clock className="w-4 h-4 text-pink-500" />
                    <span className="text-sm font-medium text-gray-700">{programInfo.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-2">
                    <Dumbbell className="w-4 h-4 text-pink-500" />
                    <span className="text-sm font-medium text-gray-700">{exercises.length} exercises</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 bg-white/60 rounded-lg p-3">
                  <strong>How it works:</strong> {programInfo.howItWorks}
                </p>
              </div>

              {/* Coach Note */}
              <div className={`p-3 rounded-lg ${currentProgram.colorScheme.bgColor} border ${currentProgram.colorScheme.borderColor}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <span className="text-xs font-semibold text-pink-600 uppercase tracking-wide">Coach Note</span>
                </div>
                <p className="text-sm text-gray-700">{currentProgram.coachNote}</p>
              </div>

              {/* Exercises Section */}
              <div className="space-y-3">
                <h5 className="font-semibold text-gray-700 flex items-center gap-2">
                  <Play className="w-4 h-4 text-pink-500" />
                  Your Exercises ({completedExercises.size}/{exercises.length} done)
                </h5>

                <div className="space-y-3">
                  {exercises.map((exercise, idx) => (
                    <div 
                      key={idx}
                      className={`rounded-xl border overflow-hidden transition-all ${
                        completedExercises.has(exercise.num) 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-white border-gray-100 hover:border-pink-200'
                      }`}
                    >
                      <div className="flex items-start gap-3 p-3">
                        <Checkbox
                          checked={completedExercises.has(exercise.num)}
                          onCheckedChange={() => toggleExerciseComplete(exercise.num)}
                          className="w-6 h-6 mt-1 border-2 border-pink-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                          data-testid={`checkbox-exercise-${exercise.num}`}
                        />
                        
                        <button
                          onClick={() => setShowVideoPlayer(exercise.url)}
                          className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 group"
                          data-testid={`video-thumbnail-${exercise.num}`}
                        >
                          <img 
                            src={getYouTubeThumbnail(exercise.url)} 
                            alt={exercise.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                            <Youtube className="w-6 h-6 text-white" />
                          </div>
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold ${completedExercises.has(exercise.num) ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                            {exercise.name}
                          </p>
                          <p className={`text-base font-bold mt-1 ${completedExercises.has(exercise.num) ? 'text-green-600' : 'text-pink-600'}`}>
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

              {/* Zoe Check-in Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 mb-3">
                      <strong className="text-purple-700">Ready to crush it?</strong> 💪 I've got your workout ready! 
                      If you're having a rough day, I can suggest something gentler - but I don't usually let my mamas skip their scheduled workout!
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => setShowZoeChat(true)}
                        variant="outline"
                        size="sm"
                        className="border-purple-200 text-purple-600 hover:bg-purple-50"
                        data-testid="button-ask-zoe"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Chat with Zoe
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

              <button
                onClick={() => setShowTomorrowPreview(true)}
                className="w-full text-sm text-gray-500 hover:text-pink-600 flex items-center justify-center gap-1 py-2"
                data-testid="button-peek-tomorrow"
              >
                <Calendar className="w-4 h-4" />
                Peek at Tomorrow's Workout
              </button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Video Player Dialog */}
      <Dialog open={!!showVideoPlayer} onOpenChange={() => setShowVideoPlayer(null)}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
          <div className="aspect-video w-full">
            {showVideoPlayer && (
              <iframe
                src={getYouTubeEmbedUrl(showVideoPlayer)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tomorrow Preview Dialog */}
      <Dialog open={showTomorrowPreview} onOpenChange={setShowTomorrowPreview}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-500" />
              Tomorrow's Workout
            </DialogTitle>
            <DialogDescription>
              Here's what's coming up next
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className={`p-3 rounded-lg ${tomorrowProgram.colorScheme.bgColor} border ${tomorrowProgram.colorScheme.borderColor}`}>
              <h4 className={`font-bold ${tomorrowProgram.colorScheme.textColor}`}>
                {tomorrowProgram.title}
              </h4>
              <p className="text-sm text-gray-600">{tomorrowProgram.schedule}</p>
            </div>

            <div className="space-y-2">
              {tomorrowProgram.part2.exercises.slice(0, 3).map((exercise, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 text-xs font-bold flex items-center justify-center">
                    {exercise.num}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{exercise.name}</p>
                    <p className="text-sm font-bold text-pink-600">{exercise.reps}</p>
                  </div>
                </div>
              ))}
              {tomorrowProgram.part2.exercises.length > 3 && (
                <p className="text-sm text-gray-500 text-center">
                  +{tomorrowProgram.part2.exercises.length - 3} more exercises
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ask Zoe Chat Dialog */}
      <Dialog open={showZoeChat} onOpenChange={setShowZoeChat}>
        <DialogContent className="sm:max-w-md h-[80vh] flex flex-col p-0">
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
