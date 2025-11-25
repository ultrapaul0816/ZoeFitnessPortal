import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Play, 
  CheckCircle, 
  ExternalLink,
  Sparkles,
  MessageCircle,
  Send,
  X,
  Loader2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import WorkoutCompletionModal from "@/components/workout-completion-modal";
import { workoutPrograms, ProgramData, Exercise } from "@/data/workoutPrograms";

interface TodaysWorkoutProps {
  userId: string;
  onStartWorkout?: (weekNumber: number) => void;
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
}

const quickPrompts = [
  "I'm feeling tired today",
  "Suggest a lighter workout",
  "How do I do this exercise correctly?",
  "What's the goal of this week?",
];

export default function TodaysWorkout({ userId, onStartWorkout }: TodaysWorkoutProps) {
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showZoeChat, setShowZoeChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isZoeTyping, setIsZoeTyping] = useState(false);
  const [showAllExercises, setShowAllExercises] = useState(false);
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
          exercises: currentProgram.part2.exercises.map(e => e.name).join(", "),
        }
      });
      return response.json();
    },
    onSuccess: (data) => {
      setChatMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
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
      setShowCompletionModal(false);
      toast({
        title: "Workout Complete! 🎉",
        description: "Great job! Your progress has been saved.",
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

  if (isLoading) {
    return (
      <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 shadow-lg">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-pink-200 rounded w-1/3"></div>
            <div className="h-4 bg-pink-100 rounded w-2/3"></div>
            <div className="h-10 bg-pink-200 rounded"></div>
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
  const displayExercises = showAllExercises ? exercises : exercises.slice(0, 3);
  const isWorkoutCompletedToday = progress.completedWorkoutIds?.includes(
    `week${progress.currentWeek}-day${progress.currentDay}`
  );

  return (
    <>
      <Card className="border-pink-200 bg-gradient-to-br from-white to-pink-50 shadow-lg overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">This Week's Workout</CardTitle>
              <p className="text-pink-100 text-sm mt-1">
                Week {progress.currentWeek} • {currentProgram.schedule}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{progress.weeklyWorkoutsCompleted}/{progress.weeklyWorkoutsTotal}</div>
              <div className="text-xs text-pink-100">workouts done</div>
            </div>
          </div>
          <Progress 
            value={(progress.weeklyWorkoutsCompleted / progress.weeklyWorkoutsTotal) * 100} 
            className="h-2 mt-3 bg-pink-300"
          />
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Program Title & Coach Note */}
          <div className={`p-3 rounded-lg ${currentProgram.colorScheme.bgColor} border ${currentProgram.colorScheme.borderColor}`}>
            <h4 className={`font-bold ${currentProgram.colorScheme.textColor}`}>
              {currentProgram.title}
            </h4>
            <p className="text-sm text-gray-600 mt-1">{currentProgram.coachNote}</p>
          </div>

          {/* Exercises List - Immediately Visible */}
          <div className="space-y-2">
            <h5 className="font-semibold text-gray-700 flex items-center gap-2">
              <Play className="w-4 h-4 text-pink-500" />
              Today's Exercises
            </h5>
            <div className="space-y-2">
              {displayExercises.map((exercise, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-pink-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 text-xs font-bold flex items-center justify-center">
                      {exercise.num}
                    </span>
                    <div>
                      <p className="font-medium text-sm text-gray-800">{exercise.name}</p>
                      <p className="text-xs text-gray-500">{exercise.reps}</p>
                    </div>
                  </div>
                  <a 
                    href={exercise.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    data-testid={`exercise-video-${exercise.num}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
            
            {exercises.length > 3 && (
              <button
                onClick={() => setShowAllExercises(!showAllExercises)}
                className="w-full py-2 text-sm text-pink-600 hover:text-pink-700 flex items-center justify-center gap-1"
                data-testid="toggle-exercises"
              >
                {showAllExercises ? (
                  <>Show Less <ChevronUp className="w-4 h-4" /></>
                ) : (
                  <>Show All {exercises.length} Exercises <ChevronDown className="w-4 h-4" /></>
                )}
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {!isWorkoutCompletedToday ? (
              <>
                <Button
                  onClick={() => onStartWorkout?.(progress.currentWeek)}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg"
                  data-testid="button-start-workout"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Full Workout
                </Button>
                <Button
                  onClick={() => setShowCompletionModal(true)}
                  variant="outline"
                  className="border-green-300 text-green-600 hover:bg-green-50"
                  data-testid="button-mark-complete"
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <div className="flex-1 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-sm font-medium text-green-700">Today's workout complete!</p>
                <p className="text-xs text-green-600">Great job, mama! 💪</p>
              </div>
            )}
          </div>

          {/* Ask Zoe Button */}
          <Button
            onClick={() => setShowZoeChat(true)}
            variant="outline"
            className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
            data-testid="button-ask-zoe"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Ask Zoe for Help
            <Sparkles className="w-4 h-4 ml-2 text-purple-400" />
          </Button>
        </CardContent>
      </Card>

      {/* Ask Zoe Chat Dialog */}
      <Dialog open={showZoeChat} onOpenChange={setShowZoeChat}>
        <DialogContent className="sm:max-w-md h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-white">Ask Zoe</DialogTitle>
                <DialogDescription className="text-purple-100">
                  Your personal postpartum fitness coach
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-700 mb-2">Hi, I'm Zoe!</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    I'm here to help with your workout. Ask me anything!
                  </p>
                  <div className="space-y-2">
                    {quickPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className="block w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm text-purple-700 transition-colors"
                        data-testid={`quick-prompt-${idx}`}
                      >
                        "{prompt}"
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
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

      {/* Completion Modal */}
      {showCompletionModal && (
        <WorkoutCompletionModal
          workout={{ 
            id: `week${progress.currentWeek}-day${progress.currentDay}`,
            name: currentProgram.title,
            programId: 'heal-your-core',
            description: currentProgram.subtitle,
            duration: "30 mins",
            day: progress.currentDay
          }}
          onSubmit={(data) => completionMutation.mutate(data)}
          onClose={() => setShowCompletionModal(false)}
          isSubmitting={completionMutation.isPending}
        />
      )}
    </>
  );
}
