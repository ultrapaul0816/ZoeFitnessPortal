import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Play, 
  CheckCircle, 
  Clock, 
  Dumbbell, 
  ChevronRight,
  Sparkles,
  RefreshCw,
  Zap,
  Heart
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import WorkoutCompletionModal from "@/components/workout-completion-modal";
import { workoutPrograms, ProgramData } from "@/data/workoutPrograms";

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

const coachingTips: Record<number, string> = {
  1: "This is your foundation week. Focus on breath, posture, and gentle reconnection with your core. You've got this, mama!",
  2: "Building on your foundation - we're layering in simple movements with control. Quality over quantity!",
  3: "You're halfway there! Time to introduce controlled movement and build core strength progressively.",
  4: "Your core awareness is growing. This week focuses on dynamic stability and functional strength.",
  5: "Almost at the finish line! We're integrating everything you've learned into more challenging movements.",
  6: "The final push! Full integration of all skills - you've transformed your core strength. Be proud!"
};

const feelingOptions = [
  { value: "energized", label: "Energized", emoji: "⚡", color: "bg-yellow-100 border-yellow-300 text-yellow-800" },
  { value: "tired", label: "Low Energy", emoji: "😴", color: "bg-blue-100 border-blue-300 text-blue-800" },
  { value: "stressed", label: "Stressed", emoji: "😰", color: "bg-purple-100 border-purple-300 text-purple-800" },
  { value: "motivated", label: "Motivated", emoji: "💪", color: "bg-green-100 border-green-300 text-green-800" },
];

export default function TodaysWorkout({ userId, onStartWorkout }: TodaysWorkoutProps) {
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showSwapDialog, setShowSwapDialog] = useState(false);
  const [showFeelingCheck, setShowFeelingCheck] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: progress, isLoading } = useQuery<WorkoutProgress>({
    queryKey: ["/api/workout-progress", userId],
    enabled: !!userId,
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
    return (
      <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 shadow-lg">
        <CardContent className="p-6 text-center">
          <Dumbbell className="w-12 h-12 text-pink-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Start Your Journey</h3>
          <p className="text-gray-600 mb-4">Enroll in a program to begin your postpartum recovery.</p>
        </CardContent>
      </Card>
    );
  }

  const currentProgram = workoutPrograms.find(p => p.week === progress.currentWeek) || workoutPrograms[0];
  const weekWorkouts = getWeekWorkouts(progress.currentWeek);
  const isWorkoutCompletedToday = progress.completedWorkoutIds?.includes(
    `week${progress.currentWeek}-day${progress.currentDay}`
  );

  function getWeekWorkouts(week: number): number {
    const schedules: Record<number, number> = {
      1: 4, // 4x per week
      2: 3, // 3x per week
      3: 3,
      4: 3,
      5: 3,
      6: 3,
    };
    return schedules[week] || 3;
  }

  function getSuggestedAlternative(feeling: string): ProgramData | null {
    if (feeling === "tired" || feeling === "stressed") {
      return workoutPrograms[0]; // Week 1 is gentler
    }
    return null;
  }

  const handleStartWorkout = () => {
    if (onStartWorkout) {
      onStartWorkout(progress.currentWeek);
    }
  };

  const handleFeelingSelect = (feeling: string) => {
    setSelectedFeeling(feeling);
    if (feeling === "tired" || feeling === "stressed") {
      setShowFeelingCheck(false);
      setShowSwapDialog(true);
    } else {
      setShowFeelingCheck(false);
      handleStartWorkout();
    }
  };

  return (
    <>
      <Card className="border-pink-200 bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 shadow-lg overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 shadow-md">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-800">Today's Workout</CardTitle>
                <p className="text-sm text-pink-600 font-medium">Week {progress.currentWeek} • Day {progress.currentDay}</p>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className={`${isWorkoutCompletedToday ? 'bg-green-100 text-green-700' : 'bg-pink-100 text-pink-700'}`}
            >
              {isWorkoutCompletedToday ? (
                <><CheckCircle className="w-3 h-3 mr-1" /> Done</>
              ) : (
                <><Clock className="w-3 h-3 mr-1" /> Ready</>
              )}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current Program Info */}
          <div className={`p-4 rounded-xl ${currentProgram.colorScheme.bgColor} border ${currentProgram.colorScheme.borderColor}`}>
            <h4 className={`font-bold text-sm ${currentProgram.colorScheme.textColor} mb-1`}>
              {currentProgram.title}
            </h4>
            <p className="text-xs text-gray-600">{currentProgram.schedule} • {currentProgram.scheduleDetail}</p>
          </div>

          {/* Weekly Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">This Week's Progress</span>
              <span className="font-semibold text-pink-600">
                {progress.weeklyWorkoutsCompleted}/{progress.weeklyWorkoutsTotal} workouts
              </span>
            </div>
            <Progress 
              value={(progress.weeklyWorkoutsCompleted / progress.weeklyWorkoutsTotal) * 100} 
              className="h-2 bg-pink-100"
            />
          </div>

          {/* Overall Progress */}
          <div className="flex items-center gap-4 p-3 bg-white/60 rounded-lg">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Overall Program</p>
              <div className="flex items-center gap-2">
                <Progress value={progress.overallProgress} className="h-2 flex-1 bg-gray-200" />
                <span className="text-sm font-bold text-pink-600">{Math.round(progress.overallProgress)}%</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-pink-600">{progress.totalWorkoutsCompleted}</p>
              <p className="text-xs text-gray-500">Total Done</p>
            </div>
          </div>

          {/* Coach's Tip */}
          <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-purple-700 mb-1">Zoe's Tip</p>
                <p className="text-xs text-gray-600">{coachingTips[progress.currentWeek] || coachingTips[1]}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {!isWorkoutCompletedToday ? (
              <>
                <Button
                  onClick={() => setShowFeelingCheck(true)}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg"
                  data-testid="button-start-workout"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Workout
                </Button>
                <Button
                  onClick={() => setShowCompletionModal(true)}
                  variant="outline"
                  className="border-green-300 text-green-600 hover:bg-green-50"
                  data-testid="button-mark-complete"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Done
                </Button>
              </>
            ) : (
              <Button
                onClick={handleStartWorkout}
                variant="outline"
                className="flex-1 border-pink-300 text-pink-600 hover:bg-pink-50"
                data-testid="button-view-workout"
              >
                <Dumbbell className="w-4 h-4 mr-2" />
                View Today's Workout
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feeling Check Dialog */}
      <Dialog open={showFeelingCheck} onOpenChange={setShowFeelingCheck}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              How are you feeling today?
            </DialogTitle>
            <DialogDescription>
              This helps us suggest the right workout for you
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 pt-4">
            {feelingOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFeelingSelect(option.value)}
                className={`p-4 rounded-xl border-2 text-center transition-all hover:scale-105 ${option.color}`}
                data-testid={`feeling-${option.value}`}
              >
                <span className="text-2xl block mb-1">{option.emoji}</span>
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Swap Workout Dialog */}
      <Dialog open={showSwapDialog} onOpenChange={setShowSwapDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-purple-500" />
              Take it easy today?
            </DialogTitle>
            <DialogDescription>
              It's okay to adjust based on how you feel. Recovery is part of the journey!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-700 mb-2">
                <strong>Zoe suggests:</strong> Try the Week 1 "Reconnect & Reset" workout - it's gentler and focuses on breathing and recovery.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowSwapDialog(false);
                  if (onStartWorkout) onStartWorkout(1); // Go to Week 1
                }}
                className="flex-1 bg-purple-500 hover:bg-purple-600"
                data-testid="button-gentle-workout"
              >
                <Zap className="w-4 h-4 mr-2" />
                Gentle Workout
              </Button>
              <Button
                onClick={() => {
                  setShowSwapDialog(false);
                  handleStartWorkout();
                }}
                variant="outline"
                className="flex-1"
                data-testid="button-continue-planned"
              >
                Continue as Planned
              </Button>
            </div>
            <button
              onClick={() => setShowSwapDialog(false)}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Skip today and rest
            </button>
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
